"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "../types";
import { DataStore } from "../store/dataStore";
import { hashPassword } from "../auth/password";
import { useTenant } from "./TenantContext";

export type LoginFailure = "not_found" | "bad_password" | "unverified" | "wrong_workspace";
export type LoginResult = { ok: true; user: UserProfile } | { ok: false; reason: LoginFailure };
export type ClientLoginResult =
  | { ok: true; firmSlug: string; caseId: string }
  | { ok: false; reason: "no_match" };

interface SignupInput {
  firmName: string;
  slug: string;
  adminName: string;
  email: string;
  password: string;
  primaryColor: string;
  industry: any;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isInitialized: boolean;
  /** Email + password sign-in. Unverified accounts and wrong passwords are rejected. */
  login: (email: string, password: string, workspaceSlug?: string) => LoginResult;
  /** 1-click demo profile sign-in — no password, but still requires a verified account. */
  quickLogin: (email: string) => LoginResult;
  /** Client portal sign-in: case reference + the email the case was issued to. */
  clientLogin: (input: { firmSlug: string; token: string; email: string }) => ClientLoginResult;
  /** Registers a firm + admin. Does NOT sign in — the admin must verify their email first. */
  signupAdmin: (data: SignupInput) => { user: UserProfile; verificationUrl: string };
  /** Re-issues the verification email for an unverified account. Returns the demo link, if any. */
  resendVerification: (email: string) => string | null;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  logout: () => void;
  firmUsers: UserProfile[];
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function persistSession(userId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("intakeiq_current_user_id", userId);
  localStorage.setItem("intakeiq_current_user_id", userId);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { currentFirm, refreshFirms, switchFirm } = useTenant();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firmUsers, setFirmUsers] = useState<UserProfile[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const refreshUsers = () => {
    DataStore.initSeedData();
    const users = DataStore.getUsers(currentFirm?.id);
    setFirmUsers(users);

    const savedUserId = typeof window !== "undefined"
      ? (sessionStorage.getItem("intakeiq_current_user_id") || localStorage.getItem("intakeiq_current_user_id"))
      : null;

    if (savedUserId) {
      const found = DataStore.getUserById(savedUserId);
      // A restored session is only honoured for verified accounts.
      if (found && DataStore.isEmailVerified(found)) {
        setCurrentUser(found);
        setIsInitialized(true);
        return;
      }
    }

    setCurrentUser(null);
    setIsInitialized(true);
  };

  useEffect(() => {
    refreshUsers();
  }, [currentFirm?.id]);

  const establishSession = (user: UserProfile, method: "password" | "demo_profile" | "client_portal") => {
    DataStore.recordSignIn(user, method);
    const fresh = DataStore.getUserById(user.id) || user;
    setCurrentUser(fresh);
    switchFirm(fresh.firmId);
    persistSession(fresh.id);
    return fresh;
  };

  const login = (email: string, password: string, workspaceSlug?: string): LoginResult => {
    DataStore.initSeedData();
    const user = DataStore.getUserByEmail(email);
    if (!user || user.role === "Client") return { ok: false, reason: "not_found" };

    if (workspaceSlug && workspaceSlug.trim()) {
      const firm = DataStore.getFirmById(user.firmId);
      if (firm && firm.slug !== workspaceSlug.trim().toLowerCase()) {
        return { ok: false, reason: "wrong_workspace" };
      }
    }

    if (!DataStore.isEmailVerified(user)) return { ok: false, reason: "unverified" };
    if (!DataStore.verifyPassword(user, password)) return { ok: false, reason: "bad_password" };

    return { ok: true, user: establishSession(user, "password") };
  };

  const quickLogin = (email: string): LoginResult => {
    DataStore.initSeedData();
    const user = DataStore.getUserByEmail(email);
    if (!user) return { ok: false, reason: "not_found" };
    if (!DataStore.isEmailVerified(user)) return { ok: false, reason: "unverified" };
    return { ok: true, user: establishSession(user, "demo_profile") };
  };

  const clientLogin = ({ firmSlug, token, email }: { firmSlug: string; token: string; email: string }): ClientLoginResult => {
    DataStore.initSeedData();
    const firm = DataStore.getFirmBySlug(firmSlug.trim().toLowerCase());
    const matchedCase = DataStore.getCaseByToken(token.trim());
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !firm ||
      !matchedCase ||
      matchedCase.firmId !== firm.id ||
      !normalizedEmail ||
      matchedCase.clientEmail.toLowerCase() !== normalizedEmail
    ) {
      return { ok: false, reason: "no_match" };
    }

    // Clients authenticate with the case reference + invited email, so the
    // matching account is created on first sign-in (already proven via invite).
    let user = DataStore.getUserByEmail(matchedCase.clientEmail);
    if (!user) {
      user = DataStore.createUser({
        email: matchedCase.clientEmail,
        name: matchedCase.clientName,
        role: "Client",
        firmId: firm.id,
        title: matchedCase.clientCompany ? `Client — ${matchedCase.clientCompany}` : "Client Portal User",
        emailVerified: true,
      });
    }

    establishSession(user, "client_portal");
    return { ok: true, firmSlug: firm.slug, caseId: matchedCase.id };
  };

  const signupAdmin = (data: SignupInput) => {
    // 1. Create Firm
    const newFirm = DataStore.createFirm({
      name: data.firmName,
      slug: data.slug,
      primaryColor: data.primaryColor || "#0066FF",
      contactEmail: data.email,
      industry: data.industry || "Accounting & CA",
    });

    // 2. Create Admin User — unverified until the emailed link is opened
    const newAdmin = DataStore.createUser({
      email: data.email,
      name: data.adminName,
      role: "Admin",
      firmId: newFirm.id,
      title: "Firm Principal / Managing Partner",
      emailVerified: false,
      passwordHash: hashPassword(data.password),
    });

    // 3. Create Sample Starter Template
    DataStore.saveFormTemplate({
      firmId: newFirm.id,
      title: "General Client Intake & Verification Form",
      description: "Default questionnaire for new client onboarding.",
      category: "Onboarding",
      fields: [
        {
          id: "f_client_name",
          label: "Full Legal Name / Entity Name",
          type: "text",
          placeholder: "e.g. Acme Holdings LLC",
          required: true,
        },
        {
          id: "f_contact_email",
          label: "Primary Contact Email",
          type: "text",
          placeholder: "e.g. contact@acme.com",
          required: true,
        },
        {
          id: "f_service_type",
          label: "Requested Service Area",
          type: "dropdown",
          required: true,
          options: ["Corporate & Compliance", "Tax Filing & Advisory", "Audit & Attestation", "Strategic Consulting"],
        }
      ]
    });

    DataStore.addAuditLog({
      firmId: newFirm.id,
      actorId: newAdmin.id,
      actorName: newAdmin.name,
      actorRole: "Admin",
      action: "Firm Registered",
      targetEntity: newFirm.name,
      details: `New firm created with slug ${newFirm.slug}. Awaiting email verification.`
    });

    const { url } = DataStore.issueEmailVerification(newAdmin, { mode: "signup" });
    refreshFirms();
    return { user: newAdmin, verificationUrl: url };
  };

  const resendVerification = (email: string): string | null => {
    const user = DataStore.getUserByEmail(email);
    if (!user || DataStore.isEmailVerified(user)) return null;
    const { url } = DataStore.issueEmailVerification(user, { mode: user.passwordHash ? "signup" : "invite" });
    return url;
  };

  const switchRole = (role: UserRole) => {
    if (!currentFirm) return;
    const users = DataStore.getUsers(currentFirm.id);
    const matchedUser = users.find(u => u.role === role && DataStore.isEmailVerified(u));
    if (matchedUser) {
      setCurrentUser(matchedUser);
      persistSession(matchedUser.id);
    } else {
      // Create a temporary demo user with that role
      const tempUser = DataStore.createUser({
        email: `${role.toLowerCase()}@${currentFirm.slug}.com`,
        name: `${role} (${currentFirm.name})`,
        role,
        firmId: currentFirm.id,
        title: `${role} Role User`,
        emailVerified: true,
      });
      setCurrentUser(tempUser);
      refreshUsers();
      persistSession(tempUser.id);
    }
  };

  const switchUser = (userId: string) => {
    const user = DataStore.getUserById(userId);
    if (user && DataStore.isEmailVerified(user)) {
      setCurrentUser(user);
      switchFirm(user.firmId);
      persistSession(user.id);
    }
  };

  const logout = () => {
    if (currentUser) DataStore.recordSignOut(currentUser);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("intakeiq_current_user_id");
      localStorage.removeItem("intakeiq_current_user_id");
    }
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || "Admin",
        isAuthenticated: Boolean(currentUser),
        isInitialized,
        login,
        quickLogin,
        clientLogin,
        signupAdmin,
        resendVerification,
        switchRole,
        switchUser,
        logout,
        firmUsers,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
