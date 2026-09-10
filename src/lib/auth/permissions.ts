import { UserRole } from "../types";

export type PermissionAction =
  // Case & Intake Permissions
  | "cases:view"
  | "cases:create"
  | "cases:edit"
  | "cases:delete"
  | "cases:assign"
  | "cases:approve_docs"
  | "cases:reject_docs"
  | "cases:export"
  
  // Form Template Permissions
  | "forms:view"
  | "forms:create"
  | "forms:edit"
  | "forms:delete"
  
  // Team & User Management Permissions
  | "team:view"
  | "team:invite"
  | "team:change_role"
  | "team:remove"
  
  // Settings & Tenant Config Permissions
  | "settings:view"
  | "settings:edit_firm"
  | "settings:branding"
  | "settings:integrations"
  
  // Audit Logs & Outbox
  | "audit:view"
  | "outbox:view"
  | "outbox:resend"
  
  // Client Portal
  | "portal:access";

/**
 * Role-to-Permissions Matrix defining capability bounds across tenant users
 */
export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  Admin: [
    "cases:view",
    "cases:create",
    "cases:edit",
    "cases:delete",
    "cases:assign",
    "cases:approve_docs",
    "cases:reject_docs",
    "cases:export",
    "forms:view",
    "forms:create",
    "forms:edit",
    "forms:delete",
    "team:view",
    "team:invite",
    "team:change_role",
    "team:remove",
    "settings:view",
    "settings:edit_firm",
    "settings:branding",
    "settings:integrations",
    "audit:view",
    "outbox:view",
    "outbox:resend",
    "portal:access",
  ],
  CaseManager: [
    "cases:view",
    "cases:create",
    "cases:edit",
    "cases:assign",
    "cases:approve_docs",
    "cases:reject_docs",
    "cases:export",
    "forms:view",
    "forms:create",
    "forms:edit",
    "team:view",
    "settings:view",
    "audit:view",
    "outbox:view",
    "portal:access",
  ],
  // Staff is a view-only role across the product ("Staff (View-Only)" in the
  // demo switcher and login) — they can open cases, forms and the team roster
  // but cannot create, edit, approve or reject anything.
  Staff: [
    "cases:view",
    "forms:view",
    "team:view",
    "portal:access",
  ],
  Client: [
    "portal:access",
  ],
};

/**
 * Check if a given role has a specific permission
 */
export function hasPermission(role: UserRole | undefined | null, permission: PermissionAction): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Check if a role possesses ALL required permissions
 */
export function hasAllPermissions(role: UserRole | undefined | null, permissions: PermissionAction[]): boolean {
  if (!role) return false;
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check if a role possesses ANY of the given permissions
 */
export function hasAnyPermission(role: UserRole | undefined | null, permissions: PermissionAction[]): boolean {
  if (!role) return false;
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Get user-friendly role description
 */
export function getRoleDescription(role: UserRole): string {
  switch (role) {
    case "Admin":
      return "Full organizational access including firm settings, billing, team management, and templates.";
    case "CaseManager":
      return "Can manage cases, assign teammates, review documents, and customize intake templates.";
    case "Staff":
      return "Can process intake cases, communicate with clients, and review submitted verification documents.";
    case "Client":
      return "Restricted client portal access to submit forms and upload requested documentation.";
    default:
      return "Standard tenant user";
  }
}

/**
 * Get UI badge styling for role
 */
export function getRoleBadgeStyle(role: UserRole): { label: string; badgeClass: string } {
  switch (role) {
    case "Admin":
      return {
        label: "Admin",
        badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      };
    case "CaseManager":
      return {
        label: "Case Manager",
        badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      };
    case "Staff":
      return {
        label: "Staff",
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      };
    case "Client":
      return {
        label: "Client",
        badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      };
    default:
      return {
        label: role,
        badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
      };
  }
}
