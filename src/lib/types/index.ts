export type UserRole = 'Admin' | 'CaseManager' | 'Staff' | 'Client';

export type PlanTier = 'starter' | 'professional' | 'enterprise';
export type BillingCycle = 'monthly' | 'annual';

export interface Firm {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor: string; // e.g. "#0066FF"
  secondaryColor?: string;
  contactEmail: string;
  phone?: string;
  address?: string;
  industry?: 'Accounting & CA' | 'Law & Legal' | 'Financial Advisory' | 'Consulting & Agency' | 'Other';
  // Subscription — undefined is treated as 'starter' (see lib/billing/plans.ts)
  plan?: PlanTier;
  billingCycle?: BillingCycle;
  planActivatedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  firmId: string;
  avatarUrl?: string;
  title?: string;
  createdAt: string;
  // --- Account security (simulated; see lib/auth/password.ts) ---
  // undefined is treated as verified so pre-existing demo data keeps working;
  // freshly registered or invited accounts are created with `false`.
  emailVerified?: boolean;
  passwordHash?: string;          // undefined => the shared demo password applies
  verificationToken?: string;     // single-use email verification / activation link
  passwordResetToken?: string;    // single-use, time-limited reset link
  passwordResetExpiresAt?: string;
  lastLoginAt?: string;
}

export type CaseStatus = 
  | 'Invited'
  | 'Form Submitted'
  | 'Documents Pending'
  | 'Under Review'
  | 'Approved'
  | 'Rejected';

export type FormFieldType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'dropdown' 
  | 'checkbox' 
  | 'file' 
  | 'yesno' 
  | 'textarea' 
  | 'multiselect';

export type ConditionOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'is_checked' 
  | 'is_not_checked' 
  | 'is_empty' 
  | 'is_not_empty';

export interface FieldCondition {
  triggerFieldId: string;
  operator: ConditionOperator;
  value: any;
}

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: string[]; // for dropdown, multiselect
  condition?: FieldCondition;
  defaultValue?: any;
}

export interface FormTemplate {
  id: string;
  firmId: string;
  title: string;
  description: string;
  category: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export interface DocVersion {
  version: number;
  fileName: string;
  fileUrl: string;
  fileSize: number; // in bytes
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
}

export type DocStatus = 'Not Started' | 'Uploaded' | 'Approved' | 'Rejected';

export type ExtractedFieldStatus = 'match' | 'mismatch' | 'unverified';

export interface ExtractedField {
  label: string;
  value: string;
  status: ExtractedFieldStatus;
}

export interface DocumentExtraction {
  documentType: string; // e.g. "Government ID", "Bank Statement", "Tax / Financial Form"
  confidence: number; // 0-100
  extractedAt: string;
  fields: ExtractedField[];
  crossCheckSummary: string; // e.g. "2 of 3 fields matched form responses"
}

export interface ChecklistItem {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  status: DocStatus;
  rejectionReason?: string;
  approvedAt?: string;
  approvedBy?: string;
  versions: DocVersion[];
  extraction?: DocumentExtraction;
}

export interface ClientCase {
  id: string;
  firmId: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  title: string;
  status: CaseStatus;
  formTemplateId: string;
  formResponses: Record<string, any>;
  formSubmittedAt?: string;
  checklist: ChecklistItem[];
  assignedTo?: string; // staff/case manager userId
  assignedToName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  portalToken?: string;
}

export interface AuditLogEntry {
  id: string;
  firmId: string;
  caseId?: string;
  caseTitle?: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string; // e.g. "Case Created", "Form Submitted", "Document Uploaded", "Document Approved", "Document Rejected", "Status Changed", "User Invited"
  targetEntity: string; // e.g. "Case #102", "Tax Return 2023.pdf", "Sarah Jenkins"
  details?: string;
}

export interface EmailNotification {
  id: string;
  firmId: string;
  to: string;
  recipientName: string;
  subject: string;
  bodyText: string;
  type:
    | 'invitation'
    | 'doc_rejected'
    | 'status_change'
    | 'form_submitted'
    | 'doc_uploaded'
    | 'verification'
    | 'password_reset'
    | 'portal_access';
  sentAt: string;
  status: 'delivered' | 'simulated' | 'failed';
  // Optional call-to-action rendered as a button in the Outbox (verification,
  // password reset and portal links) so every emailed link is actually clickable.
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export type NotificationType =
  | 'case_assigned'
  | 'form_submitted'
  | 'doc_uploaded'
  | 'doc_approved'
  | 'doc_rejected'
  | 'extraction_flagged'
  | 'case_approved'
  | 'plan_upgraded';

export interface AppNotification {
  id: string;
  firmId: string;
  type: NotificationType;
  title: string;
  message: string;
  caseId?: string;
  read: boolean;
  createdAt: string;
}
