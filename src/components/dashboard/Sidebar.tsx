"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { useTenant } from "@/lib/context/TenantContext";
import { DataStore } from "@/lib/store/dataStore";
import { useToast } from "@/components/shared/ToastProvider";
import {
  FolderKanban,
  FileSpreadsheet,
  Users,
  Settings,
  ShieldAlert,
  Mail,
  Building2,
  Lock,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  LogOut,
  X,
  BarChart3,
  CreditCard,
} from "lucide-react";
import { PermissionAction, hasPermission, getRoleBadgeStyle } from "@/lib/auth/permissions";
import { useFirmPlan } from "@/components/shared/FeatureGate";
import { PlanFeature, PLANS, requiredPlanFor } from "@/lib/billing/plans";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, role, logout } = useAuth();
  const { currentFirm } = useTenant();
  const toast = useToast();
  const { can } = useFirmPlan();

  // Prefer a case that actually belongs to the active firm so the portal
  // quick-links never point at a case owned by a different tenant.
  const firmCases = currentFirm ? DataStore.getCases(currentFirm.id) : [];
  const portalCaseId = firmCases[0]?.id || "case-101";

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully.");
    router.push("/auth/login");
  };

  const navigation: {
    name: string;
    href: string;
    icon: any;
    match: (p: string) => boolean;
    permission?: PermissionAction;
    /** Subscription feature this page requires; locked items still link through to an upgrade prompt. */
    planFeature?: PlanFeature;
  }[] = [
    {
      name: "Clients & Cases",
      href: "/dashboard",
      icon: FolderKanban,
      match: (p: string) => p === "/dashboard" || p.startsWith("/dashboard/cases"),
      permission: "cases:view",
    },
    {
      name: "Form Templates",
      href: "/dashboard/forms",
      icon: FileSpreadsheet,
      match: (p: string) => p.startsWith("/dashboard/forms"),
      permission: "forms:view",
    },
    {
      name: "Team & Roles",
      href: "/dashboard/team",
      icon: Users,
      match: (p: string) => p.startsWith("/dashboard/team"),
      permission: "team:view",
    },
    {
      name: "Firm Settings & Branding",
      href: "/dashboard/settings",
      icon: Settings,
      match: (p: string) => p.startsWith("/dashboard/settings"),
      permission: "settings:view",
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      match: (p: string) => p.startsWith("/dashboard/analytics"),
      permission: "audit:view",
      planFeature: "analytics",
    },
    {
      name: "Audit Trail",
      href: "/dashboard/audit",
      icon: ShieldAlert,
      match: (p: string) => p.startsWith("/dashboard/audit"),
      permission: "audit:view",
      planFeature: "audit_trail",
    },
    {
      name: "Email Outbox",
      href: "/dashboard/outbox",
      icon: Mail,
      match: (p: string) => p.startsWith("/dashboard/outbox"),
      permission: "outbox:view",
    },
    {
      name: "Billing & Plans",
      href: "/dashboard/billing",
      icon: CreditCard,
      match: (p: string) => p.startsWith("/dashboard/billing"),
      permission: "settings:view",
    },
  ];

  const roleStyle = getRoleBadgeStyle(role);

  return (
    <aside
      className={`fixed left-0 top-[41px] bottom-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800 transform transition-transform duration-200 ease-out select-none ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:static lg:sticky lg:top-[41px] lg:h-[calc(100vh-41px)]`}
    >
      {/* Firm Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-md text-sm flex-shrink-0"
          style={{ backgroundColor: currentFirm?.primaryColor || "#0066FF" }}
        >
          {currentFirm?.name ? currentFirm.name.substring(0, 2).toUpperCase() : "IQ"}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-white truncate leading-tight">
            {currentFirm?.name || "IntakeIQ Firm"}
          </h2>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
            <span className="truncate">{currentFirm?.industry || "Professional Firm"}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="lg:hidden p-2.5 -m-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Action Button */}
      {(role === "Admin" || role === "CaseManager") && (
        <div className="p-3">
          <Link
            href="/dashboard/cases/new"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-white shadow-sm transition-all duration-150 ease-out hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            style={{ backgroundColor: currentFirm?.primaryColor || "#0066FF" }}
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Client Case</span>
          </Link>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
          Management
        </div>
        {navigation.map((item) => {
          const isActive = item.match(pathname);
          const isRestricted = item.permission ? !hasPermission(role, item.permission) : false;
          const Icon = item.icon;

          if (isRestricted) {
            return (
              <div
                key={item.name}
                title="Role permission required"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 cursor-not-allowed opacity-60"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.name}</span>
                </div>
                <Lock className="w-3 h-3 text-slate-400" />
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                isActive
                  ? "bg-slate-800 text-white shadow-sm font-semibold border-l-2 border-brand-500"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                <span className="truncate">{item.name}</span>
                {item.planFeature && !can(item.planFeature) && (
                  <span
                    title={`Included in the ${PLANS[requiredPlanFor(item.planFeature)].name} plan`}
                    className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded shrink-0"
                  >
                    <Lock className="w-2.5 h-2.5" />
                    {requiredPlanFor(item.planFeature) === "professional" ? "Pro" : "Ent"}
                  </span>
                )}
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
            </Link>
          );
        })}

        {/* Client Portal Section */}
        <div className="pt-4 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
          Client Portal
        </div>
        <Link
          href={`/portal/${currentFirm?.slug || "apex-advisory"}/${portalCaseId}`}
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-cyan-300 hover:bg-cyan-950/40 border border-cyan-900/50 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            <span>Open Client Portal</span>
          </div>
          <span className="text-[10px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800">
            Live
          </span>
        </Link>
      </nav>

      {/* User Profile & Role Info Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0) : "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate leading-tight">
                {currentUser?.name || "Eleanor Vance"}
              </p>
              <span
                className={`inline-block mt-0.5 px-1.5 py-0.2 text-[10px] font-medium rounded border ${roleStyle.badgeClass}`}
              >
                {role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out / Switch"
            aria-label="Sign out and switch to default user"
            className="p-2.5 -m-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
