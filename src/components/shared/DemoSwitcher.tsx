"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useTenant } from "@/lib/context/TenantContext";
import { UserRole } from "@/lib/types";
import { DataStore } from "@/lib/store/dataStore";
import { useConfirm } from "@/components/shared/ConfirmProvider";
import NotificationBell from "@/components/shared/NotificationBell";
import {
  Building2,
  ShieldCheck,
  UserCheck,
  Eye,
  User,
  RotateCcw,
  ExternalLink,
  Mail,
  Sparkles,
  ChevronDown,
  Layers,
  Crown
} from "lucide-react";
import Link from "next/link";
import { PLANS, resolvePlanTier } from "@/lib/billing/plans";

export default function DemoSwitcher() {
  const { currentUser, role, switchRole } = useAuth();
  const { currentFirm, allFirms, switchFirm } = useTenant();
  const confirm = useConfirm();
  const [isOpen, setIsOpen] = useState(false);
  const [isFirmMenuOpen, setIsFirmMenuOpen] = useState(false);
  const firmMenuRef = useRef<HTMLDivElement>(null);

  // Prefer a case that actually belongs to the active firm so the portal
  // quick-link never points at a case owned by a different tenant.
  const firmCases = currentFirm ? DataStore.getCases(currentFirm.id) : [];
  const portalCaseId = firmCases[0]?.id || "case-101";

  // Close the firm dropdown on outside click/tap and on Escape, so it isn't
  // stuck open on touch devices (which never fire mouseleave).
  useEffect(() => {
    if (!isFirmMenuOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (firmMenuRef.current && !firmMenuRef.current.contains(e.target as Node)) {
        setIsFirmMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFirmMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isFirmMenuOpen]);

  const roles: { role: UserRole; label: string; icon: any; desc: string; badgeColor: string }[] = [
    { 
      role: "Admin", 
      label: "Admin", 
      icon: ShieldCheck, 
      desc: "Full firm & user management",
      badgeColor: "bg-purple-600 text-white" 
    },
    { 
      role: "CaseManager", 
      label: "Case Manager", 
      icon: UserCheck, 
      desc: "Review & approve submissions",
      badgeColor: "bg-blue-600 text-white" 
    },
    { 
      role: "Staff", 
      label: "Staff (View-Only)", 
      icon: Eye, 
      desc: "Read-only access to cases",
      badgeColor: "bg-emerald-600 text-white" 
    },
    { 
      role: "Client", 
      label: "Client Portal", 
      icon: User, 
      desc: "Client-facing intake view",
      badgeColor: "bg-amber-600 text-white" 
    },
  ];

  const handleReset = async () => {
    const ok = await confirm({
      title: "Reset demo data?",
      message: "This permanently resets all cases, forms, logs, and emails back to the default seed data. Any changes made during this demo session will be lost.",
      confirmLabel: "Reset Data",
      tone: "danger",
    });
    if (!ok) return;
    DataStore.resetDemoData();
  };

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-xs px-4 py-2 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Firm Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold tracking-wide uppercase text-[10px] text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Milestone 1 Demo</span>
          </div>

          {/* Firm Dropdown */}
          <div className="relative" ref={firmMenuRef}>
            <button
              onClick={() => setIsFirmMenuOpen(!isFirmMenuOpen)}
              aria-haspopup="true"
              aria-expanded={isFirmMenuOpen}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 px-2.5 py-1.5 rounded border border-slate-700 font-medium transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <Building2 className="w-3.5 h-3.5 text-brand-400" />
              <span className="truncate max-w-[160px] sm:max-w-[200px]">{currentFirm?.name || "Select Firm"}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isFirmMenuOpen && (
              <div
                className="absolute left-0 mt-1.5 w-64 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1 z-50 animate-fade-in"
              >
                <div className="px-3 py-1.5 text-[11px] text-slate-400 font-medium uppercase border-b border-slate-700">
                  Switch Active Tenant
                </div>
                {allFirms.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      switchFirm(f.id);
                      setIsFirmMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700 transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset ${
                      f.id === currentFirm?.id ? "bg-slate-700/60 font-semibold text-cyan-300" : "text-slate-200"
                    }`}
                  >
                    <div className="truncate">
                      <div>{f.name}</div>
                      <div className="text-[10px] text-slate-400">slug: /{f.slug}</div>
                    </div>
                    {f.id === currentFirm?.id && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subscription plan pill */}
          {currentFirm && (
            <Link
              href="/dashboard/billing"
              title="Manage subscription in Billing & Plans"
              className={`hidden md:inline-flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                resolvePlanTier(currentFirm.plan) === "enterprise"
                  ? "bg-purple-950/70 text-purple-300 border-purple-800 hover:bg-purple-900/70"
                  : resolvePlanTier(currentFirm.plan) === "professional"
                  ? "bg-brand-950/70 text-brand-300 border-brand-800 hover:bg-brand-900/70"
                  : "bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900/60"
              }`}
            >
              <Crown className="w-3 h-3" />
              {PLANS[resolvePlanTier(currentFirm.plan)].name}
            </Link>
          )}
        </div>

        {/* Center: 1-Click Role Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 overflow-x-auto">
          <span className="text-[10px] text-slate-400 font-medium px-2 hidden md:inline">ROLE:</span>
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = role === r.role;
            return (
              <button
                key={r.role}
                onClick={() => switchRole(r.role)}
                title={r.desc}
                aria-pressed={isActive}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded text-xs transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 font-medium whitespace-nowrap ${
                  isActive
                    ? `${r.badgeColor} shadow-sm ring-1 ring-white/20`
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Quick Portal Link & Reset */}
        <div className="flex items-center gap-2">
          {/* Quick link to client portal */}
          <Link
            href={`/portal/${currentFirm?.slug || "apex-advisory"}/${portalCaseId}`}
            target="_blank"
            className="flex items-center gap-1 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 px-2 py-2 rounded transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            title="Open Branded Client Portal in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Client Portal</span>
          </Link>

          {/* In-App Notifications */}
          <NotificationBell firmId={currentFirm?.id} />

          {/* Email Outbox */}
          <Link
            href="/dashboard/outbox"
            className="flex items-center gap-1 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 px-2 py-2 rounded transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            title="View Simulated Email Notifications Outbox"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Outbox</span>
          </Link>

          {/* Reset Demo Data */}
          <button
            onClick={handleReset}
            aria-label="Reset to default seed data"
            className="flex items-center gap-1 text-slate-400 hover:text-rose-300 hover:bg-slate-800 px-2 py-2 rounded transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            title="Reset to default seed data"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
