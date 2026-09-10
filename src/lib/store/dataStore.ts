import {
  Firm,
  UserProfile,
  FormTemplate,
  ClientCase,
  AuditLogEntry,
  EmailNotification,
  AppNotification,
  NotificationType,
  DocumentExtraction,
  ExtractedField,
  ExtractedFieldStatus,
  UserRole,
  DocStatus,
  DocVersion,
  ChecklistItem,
  CaseStatus,
  PlanTier,
  BillingCycle
} from "../types";
import { PLANS, FEATURE_LABELS, hasFeature, resolvePlanTier, planRank } from "../billing/plans";
import { hashPassword, DEMO_PASSWORD, generateToken, appOrigin } from "../auth/password";
import {
  INITIAL_FIRMS,
  INITIAL_USERS,
  INITIAL_FORM_TEMPLATES,
  INITIAL_CASES,
  INITIAL_AUDIT_LOGS,
  INITIAL_EMAILS,
  INITIAL_NOTIFICATIONS
} from "../seed/demoData";

const STORAGE_KEYS = {
  FIRMS: "intakeiq_firms_v1",
  USERS: "intakeiq_users_v1",
  TEMPLATES: "intakeiq_templates_v1",
  CASES: "intakeiq_cases_v1",
  AUDIT_LOGS: "intakeiq_audit_v1",
  EMAILS: "intakeiq_emails_v1",
  NOTIFICATIONS: "intakeiq_notifications_v1",
  CURRENT_FIRM_ID: "intakeiq_current_firm_id",
  CURRENT_USER_ID: "intakeiq_current_user_id"
};

// ================= AI DOCUMENT EXTRACTION SIMULATION =================
// No real OCR/AI backend is connected — this deterministically synthesizes
// plausible extracted fields (deriving names from the case itself, with a
// controlled chance of a deliberate mismatch) so the confidence-scoring and
// cross-check UI has real, varied data to react to.
const DOCUMENT_TYPE_TEMPLATES: { match: RegExp; type: string; fields: string[] }[] = [
  {
    match: /passport|driver|government id|identity|proof of identity/i,
    type: "Government ID",
    fields: ["Full Legal Name", "Date of Birth", "ID / Document Number", "Issuing Authority"],
  },
  {
    match: /bank|wire authorization|good standing/i,
    type: "Bank Statement / Letter",
    fields: ["Account Holder Name", "Institution Name", "Account Number", "Statement Date"],
  },
  {
    match: /tax|financial statement|1040|1120|1065|w-9|w-2/i,
    type: "Tax / Financial Form",
    fields: ["Entity / Filer Name", "Tax ID (EIN/SSN)", "Tax Year", "Reported Revenue"],
  },
  {
    match: /certificate of incorporation|operating agreement|partnership agreement|cap table|assignment/i,
    type: "Corporate Formation Document",
    fields: ["Entity Legal Name", "Filing Jurisdiction", "Filing Date", "Registered Agent"],
  },
];

function detectDocumentType(docName: string): { type: string; fields: string[] } {
  const found = DOCUMENT_TYPE_TEMPLATES.find((t) => t.match.test(docName));
  return found ? { type: found.type, fields: found.fields } : { type: "General Document", fields: ["Document Title", "Page Count", "Detected Language"] };
}

function corruptName(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length > 1) {
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}. ${parts[parts.length - 1]}`;
  }
  return `${name} Jr.`;
}

function generateExtractedField(label: string, c: ClientCase): ExtractedField {
  let value = "";
  let status: ExtractedFieldStatus = "unverified";

  const isEntityNameField = /entity|legal name|filer|holder/i.test(label) && /name/i.test(label);
  const isPersonNameField = /full legal name/i.test(label) || (/name/i.test(label) && !isEntityNameField && !/institution|agent/i.test(label));

  if (isEntityNameField) {
    const target = (c.formResponses?.field_company_legal_name as string) || c.clientCompany || c.clientName;
    const shouldMismatch = Math.random() < 0.2;
    value = shouldMismatch ? corruptName(target) : target;
    status = shouldMismatch ? "mismatch" : "match";
  } else if (isPersonNameField) {
    const shouldMismatch = Math.random() < 0.2;
    value = shouldMismatch ? corruptName(c.clientName) : c.clientName;
    status = shouldMismatch ? "mismatch" : "match";
  } else if (/date of birth/i.test(label)) {
    value = "04/12/1985";
  } else if (/tax id|ein|ssn|id \/ document number/i.test(label)) {
    value = `${10 + Math.floor(Math.random() * 89)}-${1000000 + Math.floor(Math.random() * 8999999)}`;
  } else if (/tax year/i.test(label)) {
    value = "2025";
  } else if (/jurisdiction/i.test(label)) {
    value = (c.formResponses?.field_jurisdiction_state as string) || "Delaware";
  } else if (/filing date|expiration date|statement date/i.test(label)) {
    value = new Date(Date.parse(c.updatedAt) - Math.floor(Math.random() * 5) * 86400000).toISOString().slice(0, 10);
  } else if (/account number/i.test(label)) {
    value = `****${1000 + Math.floor(Math.random() * 8999)}`;
  } else if (/institution/i.test(label)) {
    value = "First National Trust Bank";
  } else if (/revenue/i.test(label)) {
    value = `$${(1_000_000 + Math.random() * 5_000_000).toFixed(0)}`;
  } else if (/registered agent/i.test(label)) {
    value = "Corporate Services Inc.";
  } else if (/issuing authority/i.test(label)) {
    value = "U.S. Department of State";
  } else if (/page count/i.test(label)) {
    value = String(1 + Math.floor(Math.random() * 8));
  } else if (/language/i.test(label)) {
    value = "English";
  } else {
    value = "—";
  }

  return { label, value, status };
}

function simulateDocumentExtraction(docName: string, c: ClientCase): DocumentExtraction {
  const { type, fields: fieldLabels } = detectDocumentType(docName);
  const fields = fieldLabels.map((label) => generateExtractedField(label, c));
  const matchCount = fields.filter((f) => f.status === "match").length;
  const mismatchCount = fields.filter((f) => f.status === "mismatch").length;
  const verifiableCount = matchCount + mismatchCount;

  const crossCheckSummary =
    verifiableCount > 0
      ? `${matchCount} of ${verifiableCount} verifiable field${verifiableCount === 1 ? "" : "s"} matched form responses${
          mismatchCount > 0 ? ` — ${mismatchCount} flagged for review` : ""
        }`
      : "No cross-checkable fields for this document type";

  const baseConfidence = mismatchCount > 0 ? 62 : 88;
  const confidence = Math.min(99, Math.max(55, Math.round(baseConfidence + (Math.random() * 10 - 5))));

  return {
    documentType: type,
    confidence,
    extractedAt: new Date().toISOString(),
    fields,
    crossCheckSummary,
  };
}

// Helper to safely get local storage items
function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

export class DataStore {
  // Ensure store is seeded
  public static initSeedData(): void {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEYS.FIRMS)) {
      setLocalItem(STORAGE_KEYS.FIRMS, INITIAL_FIRMS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      setLocalItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
      setLocalItem(STORAGE_KEYS.TEMPLATES, INITIAL_FORM_TEMPLATES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CASES)) {
      setLocalItem(STORAGE_KEYS.CASES, INITIAL_CASES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      setLocalItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EMAILS)) {
      setLocalItem(STORAGE_KEYS.EMAILS, INITIAL_EMAILS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      setLocalItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
  }

  // Reset demo store
  public static resetDemoData(): void {
    if (typeof window === "undefined") return;
    setLocalItem(STORAGE_KEYS.FIRMS, INITIAL_FIRMS);
    setLocalItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    setLocalItem(STORAGE_KEYS.TEMPLATES, INITIAL_FORM_TEMPLATES);
    setLocalItem(STORAGE_KEYS.CASES, INITIAL_CASES);
    setLocalItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    setLocalItem(STORAGE_KEYS.EMAILS, INITIAL_EMAILS);
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    window.location.reload();
  }

  // ================= FIRM METHODS =================
  public static getFirms(): Firm[] {
    return getLocalItem<Firm[]>(STORAGE_KEYS.FIRMS, INITIAL_FIRMS);
  }

  public static getFirmById(firmId: string): Firm | undefined {
    const firms = this.getFirms();
    return firms.find(f => f.id === firmId);
  }

  public static getFirmBySlug(slug: string): Firm | undefined {
    const firms = this.getFirms();
    return firms.find(f => f.slug.toLowerCase() === slug.toLowerCase());
  }

  public static createFirm(firmData: Omit<Firm, "id" | "createdAt">): Firm {
    const firms = this.getFirms();
    const now = new Date().toISOString();
    const newFirm: Firm = {
      ...firmData,
      // New workspaces start on Starter; upgrades go through upgradeFirmPlan().
      plan: firmData.plan ?? "starter",
      billingCycle: firmData.billingCycle ?? "monthly",
      planActivatedAt: firmData.planActivatedAt ?? now,
      id: `firm-${Date.now()}`,
      createdAt: now,
    };
    firms.push(newFirm);
    setLocalItem(STORAGE_KEYS.FIRMS, firms);
    return newFirm;
  }

  public static updateFirm(firmId: string, updates: Partial<Firm>): Firm {
    const firms = this.getFirms();
    const index = firms.findIndex(f => f.id === firmId);
    if (index === -1) throw new Error("Firm not found");
    
    firms[index] = {
      ...firms[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setLocalItem(STORAGE_KEYS.FIRMS, firms);
    return firms[index];
  }

  // ================= SUBSCRIPTION / BILLING =================
  // No payment processor is connected — the simulated checkout calls this
  // once "payment" succeeds, and it's the single place a firm's tier changes.
  public static upgradeFirmPlan(
    firmId: string,
    tier: PlanTier,
    cycle: BillingCycle,
    actor?: UserProfile
  ): Firm {
    const firm = this.getFirmById(firmId);
    if (!firm) throw new Error("Firm not found");

    const previous = resolvePlanTier(firm.plan);
    const updated = this.updateFirm(firmId, {
      plan: tier,
      billingCycle: cycle,
      planActivatedAt: new Date().toISOString(),
    });

    const isUpgrade = planRank(tier) > planRank(previous);
    const unlocked = PLANS[tier].features.map((f) => FEATURE_LABELS[f]);

    this.addAuditLog({
      firmId,
      actorId: actor?.id ?? "system-billing",
      actorName: actor?.name ?? "IntakeIQ Billing",
      actorRole: actor?.role ?? "Admin",
      action: isUpgrade ? "Subscription Upgraded" : "Subscription Changed",
      targetEntity: `${PLANS[previous].name} → ${PLANS[tier].name}`,
      details: `${PLANS[tier].name} plan activated on ${cycle} billing. ${
        unlocked.length > 0 ? `Unlocked: ${unlocked.join(", ")}.` : "Core features only."
      }`,
    });

    this.addNotification({
      firmId,
      type: "plan_upgraded",
      title: isUpgrade ? `Upgraded to ${PLANS[tier].name}` : `Plan changed to ${PLANS[tier].name}`,
      message:
        isUpgrade && unlocked.length > 0
          ? `Your firm now has access to ${unlocked.slice(0, 3).join(", ")}${
              unlocked.length > 3 ? ` and ${unlocked.length - 3} more` : ""
            }.`
          : `Your subscription is now on the ${PLANS[tier].name} plan.`,
    });

    return updated;
  }

  // ================= USERS METHODS =================
  public static getUsers(firmId?: string): UserProfile[] {
    const users = getLocalItem<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    if (firmId) {
      return users.filter(u => u.firmId === firmId);
    }
    return users;
  }

  public static getUserById(userId: string): UserProfile | undefined {
    const users = this.getUsers();
    return users.find(u => u.id === userId);
  }

  public static createUser(userData: Omit<UserProfile, "id" | "createdAt">): UserProfile {
    const users = this.getUsers();
    const newUser: UserProfile = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    setLocalItem(STORAGE_KEYS.USERS, users);
    return newUser;
  }

  // ================= ACCOUNT SECURITY (simulated) =================
  // Email verification, password checks and reset links are all simulated in
  // localStorage. Every "email" lands in the firm Outbox with a clickable link.

  public static getUserByEmail(email: string): UserProfile | undefined {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return undefined;
    return this.getUsers().find(u => u.email.toLowerCase() === normalized);
  }

  public static updateUser(userId: string, updates: Partial<UserProfile>): UserProfile {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error("User not found");
    users[idx] = { ...users[idx], ...updates };
    setLocalItem(STORAGE_KEYS.USERS, users);
    return users[idx];
  }

  /** Accounts created before verification existed have no flag — treat them as verified. */
  public static isEmailVerified(user: UserProfile): boolean {
    return user.emailVerified !== false;
  }

  /** Seeded demo profiles (no stored hash) accept the shared demo password. */
  public static verifyPassword(user: UserProfile, password: string): boolean {
    if (user.passwordHash) return user.passwordHash === hashPassword(password);
    return password === DEMO_PASSWORD;
  }

  /** Issues a single-use verification/activation link and "sends" it to the user. */
  public static issueEmailVerification(
    user: UserProfile,
    options: { mode: "signup" | "invite"; invitedBy?: string }
  ): { token: string; url: string } {
    const token = generateToken("verify");
    this.updateUser(user.id, { verificationToken: token, emailVerified: false });

    const firm = this.getFirmById(user.firmId);
    const firmName = firm?.name || "IntakeIQ";
    const url = `${appOrigin()}/auth/verify?token=${token}`;
    const isInvite = options.mode === "invite";

    this.sendEmail({
      firmId: user.firmId,
      to: user.email,
      recipientName: user.name,
      subject: isInvite
        ? `Activate your ${firmName} account on IntakeIQ`
        : `Verify your email to activate ${firmName} on IntakeIQ`,
      bodyText: isInvite
        ? `Hello ${user.name}, ${options.invitedBy || "your administrator"} added you to ${firmName} as ${user.role}. Confirm your email address and create a password to activate your account: ${url}`
        : `Hello ${user.name}, thanks for registering ${firmName}. Please confirm your email address to activate your workspace — you will not be able to sign in until this is done: ${url}`,
      type: isInvite ? "invitation" : "verification",
      actionUrl: url,
      actionLabel: isInvite ? "Activate account" : "Verify email address",
      metadata: { userId: user.id, mode: options.mode },
    });

    return { token, url };
  }

  /** Consumes a verification token. Invited members (no password yet) also get a set-password token. */
  public static verifyEmail(token: string): { user: UserProfile; setupToken?: string } | null {
    if (!token) return null;
    const user = this.getUsers().find(u => u.verificationToken && u.verificationToken === token);
    if (!user) return null;

    const updates: Partial<UserProfile> = { emailVerified: true, verificationToken: undefined };
    let setupToken: string | undefined;
    if (!user.passwordHash) {
      setupToken = generateToken("setup");
      updates.passwordResetToken = setupToken;
      updates.passwordResetExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }
    const updated = this.updateUser(user.id, updates);

    this.addAuditLog({
      firmId: user.firmId,
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "Email Verified",
      targetEntity: user.email,
      details: "Email address confirmed via verification link.",
    });

    return { user: updated, setupToken };
  }

  /** Returns null for unknown emails so the UI can stay non-enumerating. */
  public static requestPasswordReset(email: string): { user: UserProfile; url: string } | null {
    const user = this.getUserByEmail(email);
    if (!user) return null;

    const token = generateToken("reset");
    this.updateUser(user.id, {
      passwordResetToken: token,
      passwordResetExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });

    const firm = this.getFirmById(user.firmId);
    const url = `${appOrigin()}/auth/reset-password?token=${token}`;
    this.sendEmail({
      firmId: user.firmId,
      to: user.email,
      recipientName: user.name,
      subject: "Reset your IntakeIQ password",
      bodyText: `Hello ${user.name}, we received a request to reset the password for your ${firm?.name || "IntakeIQ"} account. This link is valid for 60 minutes and can be used once: ${url} — if you did not request this, you can safely ignore this email.`,
      type: "password_reset",
      actionUrl: url,
      actionLabel: "Reset password",
      metadata: { userId: user.id },
    });

    this.addAuditLog({
      firmId: user.firmId,
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "Password Reset Requested",
      targetEntity: user.email,
      details: "Reset link issued (valid for 60 minutes, single use).",
    });

    return { user, url };
  }

  public static getUserByResetToken(token: string): UserProfile | null {
    if (!token) return null;
    const user = this.getUsers().find(u => u.passwordResetToken && u.passwordResetToken === token);
    if (!user) return null;
    if (user.passwordResetExpiresAt && new Date(user.passwordResetExpiresAt).getTime() < Date.now()) {
      return null;
    }
    return user;
  }

  public static resetPassword(token: string, newPassword: string): UserProfile | null {
    const user = this.getUserByResetToken(token);
    if (!user) return null;

    const isActivation = !user.passwordHash;
    const updated = this.updateUser(user.id, {
      passwordHash: hashPassword(newPassword),
      passwordResetToken: undefined,
      passwordResetExpiresAt: undefined,
      emailVerified: true, // a valid emailed link proves ownership of the address
    });

    this.addAuditLog({
      firmId: user.firmId,
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: isActivation ? "Account Activated" : "Password Reset",
      targetEntity: user.email,
      details: isActivation ? "Password created and account activated." : "Password changed via reset link.",
    });

    return updated;
  }

  public static recordSignIn(user: UserProfile, method: "password" | "demo_profile" | "client_portal"): void {
    this.updateUser(user.id, { lastLoginAt: new Date().toISOString() });
    const details: Record<typeof method, string> = {
      password: "Signed in with email and password.",
      demo_profile: "Signed in via 1-click demo profile.",
      client_portal: "Client signed in to the secure onboarding portal.",
    };
    this.addAuditLog({
      firmId: user.firmId,
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "User Signed In",
      targetEntity: user.email,
      details: details[method],
    });
  }

  public static recordSignOut(user: UserProfile): void {
    this.addAuditLog({
      firmId: user.firmId,
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "User Signed Out",
      targetEntity: user.email,
      details: "Session ended by the user.",
    });
  }

  // ================= FORM TEMPLATES =================
  public static getFormTemplates(firmId: string): FormTemplate[] {
    const templates = getLocalItem<FormTemplate[]>(STORAGE_KEYS.TEMPLATES, INITIAL_FORM_TEMPLATES);
    return templates.filter(t => t.firmId === firmId);
  }

  public static getFormTemplateById(templateId: string): FormTemplate | undefined {
    const templates = getLocalItem<FormTemplate[]>(STORAGE_KEYS.TEMPLATES, INITIAL_FORM_TEMPLATES);
    return templates.find(t => t.id === templateId);
  }

  public static saveFormTemplate(template: Omit<FormTemplate, "id" | "createdAt" | "updatedAt"> & { id?: string }): FormTemplate {
    const templates = getLocalItem<FormTemplate[]>(STORAGE_KEYS.TEMPLATES, INITIAL_FORM_TEMPLATES);
    const now = new Date().toISOString();
    
    if (template.id) {
      const idx = templates.findIndex(t => t.id === template.id);
      if (idx !== -1) {
        templates[idx] = {
          ...templates[idx],
          ...template,
          updatedAt: now,
        };
        setLocalItem(STORAGE_KEYS.TEMPLATES, templates);
        return templates[idx];
      }
    }

    const newTemplate: FormTemplate = {
      ...template,
      id: `tmpl-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    templates.push(newTemplate);
    setLocalItem(STORAGE_KEYS.TEMPLATES, templates);
    return newTemplate;
  }

  public static deleteFormTemplate(templateId: string): void {
    const templates = getLocalItem<FormTemplate[]>(STORAGE_KEYS.TEMPLATES, INITIAL_FORM_TEMPLATES);
    const filtered = templates.filter(t => t.id !== templateId);
    setLocalItem(STORAGE_KEYS.TEMPLATES, filtered);
  }

  // ================= CASES =================
  public static getCases(firmId: string): ClientCase[] {
    const cases = getLocalItem<ClientCase[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
    return cases.filter(c => c.firmId === firmId);
  }

  public static getCaseById(caseId: string): ClientCase | undefined {
    const cases = getLocalItem<ClientCase[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
    return cases.find(c => c.id === caseId);
  }

  public static getCaseByToken(token: string): ClientCase | undefined {
    const cases = getLocalItem<ClientCase[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
    return cases.find(c => c.portalToken === token || c.id === token);
  }

  public static createCase(
    caseData: Omit<ClientCase, "id" | "createdAt" | "updatedAt" | "portalToken">,
    actorUser: UserProfile
  ): ClientCase {
    const cases = getLocalItem<ClientCase[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
    const now = new Date().toISOString();
    const caseId = `case-${Date.now().toString().slice(-4)}`;
    const portalToken = `pt-${Math.random().toString(36).substring(2, 10)}`;

    const newCase: ClientCase = {
      ...caseData,
      id: caseId,
      portalToken,
      createdAt: now,
      updatedAt: now,
    };

    cases.unshift(newCase);
    setLocalItem(STORAGE_KEYS.CASES, cases);

    // Audit Log
    this.addAuditLog({
      firmId: newCase.firmId,
      caseId: newCase.id,
      caseTitle: newCase.title,
      actorId: actorUser.id,
      actorName: actorUser.name,
      actorRole: actorUser.role,
      action: "Case Created & Invited",
      targetEntity: `${newCase.clientName} (${newCase.clientCompany || "Individual"})`,
      details: `Created onboarding case with ${newCase.checklist.length} document requirements.`
    });

    // Transactional Email to Client
    const firm = this.getFirmById(newCase.firmId);
    const portalUrl = `${appOrigin()}/portal/${firm?.slug || "apex-advisory"}/${newCase.id}`;
    this.sendEmail({
      firmId: newCase.firmId,
      to: newCase.clientEmail,
      recipientName: newCase.clientName,
      subject: `Action Required: Complete your onboarding with ${firm?.name || "IntakeIQ"}`,
      bodyText: `Hello ${newCase.clientName}, you have been invited to complete your intake for "${newCase.title}". Open your secure portal (sign in with this email address and case reference ${newCase.id}): ${portalUrl}`,
      type: "invitation",
      actionUrl: portalUrl,
      actionLabel: "Open secure portal",
      metadata: { caseId: newCase.id, portalUrl }
    });

    if (newCase.assignedToName) {
      this.addNotification({
        firmId: newCase.firmId,
        type: "case_assigned",
        title: "New case assigned to you",
        message: `You've been assigned "${newCase.title}" for ${newCase.clientName}.`,
        caseId: newCase.id,
      });
    }

    return newCase;
  }

  public static updateCase(caseId: string, updates: Partial<ClientCase>, actorUser?: UserProfile): ClientCase {
    const cases = getLocalItem<ClientCase[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
    const idx = cases.findIndex(c => c.id === caseId);
    if (idx === -1) throw new Error("Case not found");

    const previousStatus = cases[idx].status;
    cases[idx] = {
      ...cases[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setLocalItem(STORAGE_KEYS.CASES, cases);

    // Status change audit log & email
    if (updates.status && updates.status !== previousStatus && actorUser) {
      this.addAuditLog({
        firmId: cases[idx].firmId,
        caseId: cases[idx].id,
        caseTitle: cases[idx].title,
        actorId: actorUser.id,
        actorName: actorUser.name,
        actorRole: actorUser.role,
        action: "Case Status Changed",
        targetEntity: `Status: ${previousStatus} → ${updates.status}`,
        details: `Updated case status to ${updates.status}.`
      });

      this.sendEmail({
        firmId: cases[idx].firmId,
        to: cases[idx].clientEmail,
        recipientName: cases[idx].clientName,
        subject: `Your onboarding status has been updated: ${updates.status}`,
        bodyText: `Hello ${cases[idx].clientName}, the status of your case "${cases[idx].title}" is now ${updates.status}.`,
        type: "status_change",
        metadata: { caseId: cases[idx].id, status: updates.status }
      });
    }

    return cases[idx];
  }

  public static submitFormAnswers(
    caseId: string,
    responses: Record<string, any>,
    actorName: string,
    actorId: string
  ): ClientCase {
    const c = this.getCaseById(caseId);
    if (!c) throw new Error("Case not found");

    const isAllDocsUploaded = c.checklist.every(item => !item.required || item.status === "Approved" || item.status === "Uploaded");
    const nextStatus: CaseStatus = isAllDocsUploaded ? "Under Review" : "Documents Pending";

    const updated = this.updateCase(caseId, {
      formResponses: responses,
      formSubmittedAt: new Date().toISOString(),
      status: nextStatus
    });

    this.addAuditLog({
      firmId: c.firmId,
      caseId: c.id,
      caseTitle: c.title,
      actorId,
      actorName,
      actorRole: "Client",
      action: "Form Submitted",
      targetEntity: "Client Intake Form",
      details: `Completed and submitted form responses.`
    });

    // Notify assigned staff
    const firm = this.getFirmById(c.firmId);
    this.sendEmail({
      firmId: c.firmId,
      to: firm?.contactEmail || "staff@firm.com",
      recipientName: c.assignedToName || "Case Manager",
      subject: `Form Submitted: ${c.clientName} completed intake form`,
      bodyText: `${c.clientName} has submitted form responses for case "${c.title}". Review in dashboard.`,
      type: "form_submitted",
      metadata: { caseId: c.id }
    });

    this.addNotification({
      firmId: c.firmId,
      type: "form_submitted",
      title: "Intake form submitted",
      message: `${actorName} submitted their intake questionnaire for "${c.title}".`,
      caseId: c.id,
    });

    return updated;
  }

  public static uploadDocument(
    caseId: string,
    checklistItemId: string,
    fileInfo: { fileName: string; fileUrl: string; fileSize: number; fileType: string; uploadedBy: string; actorId: string }
  ): ClientCase {
    const c = this.getCaseById(caseId);
    if (!c) throw new Error("Case not found");

    const checklist = [...c.checklist];
    const itemIndex = checklist.findIndex(item => item.id === checklistItemId);
    if (itemIndex === -1) throw new Error("Checklist item not found");

    const item = checklist[itemIndex];
    const newVersionNumber = (item.versions?.length || 0) + 1;
    const newVersion: DocVersion = {
      version: newVersionNumber,
      fileName: fileInfo.fileName,
      fileUrl: fileInfo.fileUrl,
      fileSize: fileInfo.fileSize,
      fileType: fileInfo.fileType,
      uploadedAt: new Date().toISOString(),
      uploadedBy: fileInfo.uploadedBy,
    };

    // AI extraction is a Professional-plan feature — Starter firms still get
    // the upload itself, just without the extracted-field analysis.
    const firm = this.getFirmById(c.firmId);
    const extraction = hasFeature(firm?.plan, "ai_extraction")
      ? simulateDocumentExtraction(item.name, c)
      : undefined;

    const updatedItem: ChecklistItem = {
      ...item,
      status: "Uploaded",
      rejectionReason: undefined,
      versions: [...(item.versions || []), newVersion],
      extraction,
    };

    checklist[itemIndex] = updatedItem;

    const updated = this.updateCase(caseId, {
      checklist,
      status: c.formSubmittedAt ? "Under Review" : c.status
    });

    this.addAuditLog({
      firmId: c.firmId,
      caseId: c.id,
      caseTitle: c.title,
      actorId: fileInfo.actorId,
      actorName: fileInfo.uploadedBy,
      actorRole: "Client",
      action: "Document Uploaded",
      targetEntity: `${item.name} (v${newVersionNumber}: ${fileInfo.fileName})`,
      details: `File size: ${(fileInfo.fileSize / (1024 * 1024)).toFixed(2)} MB.`
    });

    if (extraction) {
      this.addAuditLog({
        firmId: c.firmId,
        caseId: c.id,
        caseTitle: c.title,
        actorId: "system-ai",
        actorName: "IntakeIQ AI Extraction",
        actorRole: "Staff",
        action: "AI Extraction Completed",
        targetEntity: `${item.name} — ${extraction.documentType}`,
        details: `Confidence ${extraction.confidence}%. ${extraction.crossCheckSummary}.`
      });
    }

    // Notify staff
    this.sendEmail({
      firmId: c.firmId,
      to: firm?.contactEmail || "staff@firm.com",
      recipientName: c.assignedToName || "Case Manager",
      subject: `Document Uploaded: ${fileInfo.fileName} by ${fileInfo.uploadedBy}`,
      bodyText: `${fileInfo.uploadedBy} uploaded ${item.name} (v${newVersionNumber}) for case "${c.title}".`,
      type: "doc_uploaded",
      metadata: { caseId: c.id, checklistItemId }
    });

    this.addNotification({
      firmId: c.firmId,
      type: "doc_uploaded",
      title: "Document uploaded",
      message: `${fileInfo.uploadedBy} uploaded "${item.name}" for ${c.clientName}'s case.`,
      caseId: c.id,
    });

    const hasMismatch = extraction ? extraction.fields.some((f) => f.status === "mismatch") : false;
    if (extraction && (hasMismatch || extraction.confidence < 75)) {
      this.addNotification({
        firmId: c.firmId,
        type: "extraction_flagged",
        title: "AI extraction flagged an issue",
        message: `"${item.name}" on ${c.clientName}'s case needs manual review — ${extraction.crossCheckSummary}.`,
        caseId: c.id,
      });
    }

    return updated;
  }

  public static reviewDocument(
    caseId: string,
    checklistItemId: string,
    status: "Approved" | "Rejected",
    rejectionReason: string | undefined,
    reviewer: UserProfile
  ): ClientCase {
    const c = this.getCaseById(caseId);
    if (!c) throw new Error("Case not found");

    const checklist = [...c.checklist];
    const itemIndex = checklist.findIndex(item => item.id === checklistItemId);
    if (itemIndex === -1) throw new Error("Checklist item not found");

    const item = checklist[itemIndex];
    checklist[itemIndex] = {
      ...item,
      status,
      rejectionReason: status === "Rejected" ? rejectionReason : undefined,
      approvedAt: status === "Approved" ? new Date().toISOString() : undefined,
      approvedBy: status === "Approved" ? reviewer.name : undefined,
    };

    // Evaluate overall case status
    const allApproved = checklist.every(i => !i.required || i.status === "Approved");
    const anyRejected = checklist.some(i => i.status === "Rejected");
    
    let newCaseStatus: CaseStatus = c.status;
    if (allApproved && c.formSubmittedAt) {
      newCaseStatus = "Approved";
    } else if (anyRejected) {
      newCaseStatus = "Under Review";
    }

    const updated = this.updateCase(caseId, {
      checklist,
      status: newCaseStatus
    });

    this.addAuditLog({
      firmId: c.firmId,
      caseId: c.id,
      caseTitle: c.title,
      actorId: reviewer.id,
      actorName: reviewer.name,
      actorRole: reviewer.role,
      action: status === "Approved" ? "Document Approved" : "Document Rejected",
      targetEntity: item.name,
      details: status === "Approved" 
        ? `Approved by ${reviewer.name}.` 
        : `Rejection Feedback: "${rejectionReason || "Please re-upload according to specifications."}"`
    });

    if (status === "Rejected") {
      this.sendEmail({
        firmId: c.firmId,
        to: c.clientEmail,
        recipientName: c.clientName,
        subject: `Action Required: Document "${item.name}" needs correction`,
        bodyText: `Hello ${c.clientName}, your document "${item.name}" requires attention. Reviewer comment: "${rejectionReason || "Please re-upload clean copy."}". Please visit your portal to re-upload.`,
        type: "doc_rejected",
        metadata: { caseId: c.id, checklistItemId }
      });
    }

    this.addNotification({
      firmId: c.firmId,
      type: status === "Approved" ? "doc_approved" : "doc_rejected",
      title: status === "Approved" ? "Document approved" : "Document rejected",
      message: `${reviewer.name} ${status === "Approved" ? "approved" : "rejected"} "${item.name}" for ${c.clientName}.`,
      caseId: c.id,
    });

    if (newCaseStatus === "Approved" && c.status !== "Approved") {
      this.addNotification({
        firmId: c.firmId,
        type: "case_approved",
        title: "Case fully approved",
        message: `"${c.title}" for ${c.clientName} has completed onboarding and is now fully approved.`,
        caseId: c.id,
      });
    }

    return updated;
  }

  // ================= AUDIT LOGS =================
  public static getAuditLogs(firmId: string, caseId?: string): AuditLogEntry[] {
    const logs = getLocalItem<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    return logs
      .filter(l => l.firmId === firmId && (!caseId || l.caseId === caseId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public static addAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">): AuditLogEntry {
    const logs = getLocalItem<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    const newLog: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    setLocalItem(STORAGE_KEYS.AUDIT_LOGS, logs);
    return newLog;
  }

  // ================= EMAIL NOTIFICATIONS =================
  public static getEmails(firmId: string): EmailNotification[] {
    const emails = getLocalItem<EmailNotification[]>(STORAGE_KEYS.EMAILS, INITIAL_EMAILS);
    return emails
      .filter(e => e.firmId === firmId)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  public static sendEmail(emailData: Omit<EmailNotification, "id" | "sentAt" | "status">): EmailNotification {
    const emails = getLocalItem<EmailNotification[]>(STORAGE_KEYS.EMAILS, INITIAL_EMAILS);
    const newEmail: EmailNotification = {
      ...emailData,
      id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sentAt: new Date().toISOString(),
      status: "delivered",
    };
    emails.unshift(newEmail);
    setLocalItem(STORAGE_KEYS.EMAILS, emails);
    return newEmail;
  }

  // ================= IN-APP NOTIFICATIONS =================
  public static getNotifications(firmId: string): AppNotification[] {
    const items = getLocalItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return items
      .filter((n) => n.firmId === firmId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static addNotification(entry: Omit<AppNotification, "id" | "createdAt" | "read">): AppNotification {
    const items = getLocalItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newItem: AppNotification = {
      ...entry,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    items.unshift(newItem);
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, items);
    return newItem;
  }

  public static markNotificationRead(notificationId: string): void {
    const items = getLocalItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const idx = items.findIndex((n) => n.id === notificationId);
    if (idx === -1) return;
    items[idx] = { ...items[idx], read: true };
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, items);
  }

  public static markAllNotificationsRead(firmId: string): void {
    const items = getLocalItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const next = items.map((n) => (n.firmId === firmId ? { ...n, read: true } : n));
    setLocalItem(STORAGE_KEYS.NOTIFICATIONS, next);
  }

  // ================= AUDIT / COMPLIANCE EXPORT =================
  public static auditLogsToCSV(logs: AuditLogEntry[]): string {
    const header = ["Timestamp", "Case", "Actor", "Role", "Action", "Target", "Details"];
    const rows = logs.map((l) => [
      l.timestamp,
      l.caseTitle || l.caseId || "",
      l.actorName,
      l.actorRole,
      l.action,
      l.targetEntity,
      l.details || "",
    ]);
    const escape = (val: string) => `"${String(val).replace(/"/g, '""')}"`;
    return [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
  }
}
