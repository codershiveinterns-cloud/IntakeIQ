"use client";

import PermissionGate from "@/components/shared/PermissionGate";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { useTenant } from "@/lib/context/TenantContext";
import { DataStore } from "@/lib/store/dataStore";
import { useToast } from "@/components/shared/ToastProvider";
import { useConfirm } from "@/components/shared/ConfirmProvider";
import { hasPermission } from "@/lib/auth/permissions";
import CheckoutModal from "@/components/billing/CheckoutModal";
import { BillingCycle, PlanTier } from "@/lib/types";
import {
  PLANS,
  PLAN_ORDER,
  PlanDefinition,
  PlanFeature,
  FEATURE_LABELS,
  resolvePlanTier,
  planRank,
  priceFor,
  formatUsd,
  requiredPlanFor,
} from "@/lib/billing/plans";
import {
  CreditCard,
  Check,
  Minus,
  Crown,
  Lock,
  Sparkles,
  Users,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const FEATURE_ROUTES: Record<PlanFeature, { href: string; label: string }> = {
  kanban_board: { href: "/dashboard", label: "Open the Kanban board" },
  analytics: { href: "/dashboard/analytics", label: "Open Analytics" },
  audit_trail: { href: "/dashboard/audit", label: "Open the Audit Trail" },
  audit_export: { href: "/dashboard/audit", label: "Export the Audit Trail" },
  ai_extraction: { href: "/dashboard", label: "Review AI extractions" },
  custom_branding: { href: "/dashboard/settings", label: "Customize branding" },
};

const ALL_FEATURES: PlanFeature[] = [
  "kanban_board",
  "analytics",
  "audit_trail",
  "ai_extraction",
  "custom_branding",
  "audit_export",
];

function isPlanFeature(value: string | null): value is PlanFeature {
  return !!value && (ALL_FEATURES as string[]).includes(value);
}

function BillingPageContent() {
  const searchParams = useSearchParams();
  const { currentUser, role } = useAuth();
  const { currentFirm, refreshFirms } = useTenant();
  const toast = useToast();
  const confirm = useConfirm();

  const requestedFeatureParam = searchParams.get("feature");
  const requestedFeature = isPlanFeature(requestedFeatureParam) ? requestedFeatureParam : null;

  const currentTier = resolvePlanTier(currentFirm?.plan);
  const currentPlan = PLANS[currentTier];
  const canManage = hasPermission(role, "settings:edit_firm");

  const [billingCycle, setBillingCycle] = useState<BillingCycle>(currentFirm?.billingCycle ?? "annual");
  const [checkoutPlan, setCheckoutPlan] = useState<PlanDefinition | null>(null);
  const [seatsUsed, setSeatsUsed] = useState(0);

  useEffect(() => {
    if (!currentFirm) return;
    DataStore.initSeedData();
    setSeatsUsed(DataStore.getUsers(currentFirm.id).filter((u) => u.role !== "Client").length);
  }, [currentFirm?.id, currentFirm?.plan]);

  useEffect(() => {
    if (currentFirm?.billingCycle) setBillingCycle(currentFirm.billingCycle);
  }, [currentFirm?.billingCycle]);

  const applyPlan = (tier: PlanTier) => {
    if (!currentFirm) return;
    DataStore.upgradeFirmPlan(currentFirm.id, tier, billingCycle, currentUser ?? undefined);
    refreshFirms();
  };

  const handleSelectPlan = async (plan: PlanDefinition) => {
    if (!currentFirm) return;
    if (!canManage) {
      toast.error("Only Firm Admins can change the subscription plan.");
      return;
    }
    if (plan.tier === currentTier) return;

    if (planRank(plan.tier) > planRank(currentTier)) {
      setCheckoutPlan(plan);
      return;
    }

    const ok = await confirm({
      title: `Switch to ${plan.name}?`,
      message: `Moving from ${currentPlan.name} to ${plan.name} will remove access to features not included in ${plan.name} at the end of this billing period. Your data is never deleted.`,
      confirmLabel: `Switch to ${plan.name}`,
      tone: "danger",
    });
    if (!ok) return;
    applyPlan(plan.tier);
    toast.success(`Your plan has been changed to ${plan.name}.`);
  };

  const seatLimit = currentPlan.seatLimit;
  const seatPct = seatLimit ? Math.min(100, Math.round((seatsUsed / seatLimit) * 100)) : 0;
  const requestedPlan = requestedFeature ? PLANS[requiredPlanFor(requestedFeature)] : null;
  const requestedUnlocked = requestedFeature ? currentPlan.features.includes(requestedFeature) : false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Billing & Plans</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              <ShieldCheck className="w-3 h-3" /> Demo billing
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your firm&apos;s subscription. Upgrades unlock features instantly across your workspace.
          </p>
        </div>
      </div>

      {/* Contextual unlock banner (arrived from a locked feature) */}
      {requestedFeature && requestedPlan && !requestedUnlocked && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-white border border-brand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Unlock {FEATURE_LABELS[requestedFeature]}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Included in the <strong>{requestedPlan.name}</strong> plan and above — from {formatUsd(requestedPlan.priceAnnual)}/mo billed annually.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSelectPlan(requestedPlan)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-sm transition-all duration-150 active:scale-[0.98] shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <span>Upgrade to {requestedPlan.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {requestedFeature && requestedUnlocked && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>{FEATURE_LABELS[requestedFeature]}</strong> is already included in your {currentPlan.name} plan.{" "}
            <Link href={FEATURE_ROUTES[requestedFeature].href} className="font-bold underline hover:text-emerald-900">
              {FEATURE_ROUTES[requestedFeature].label} →
            </Link>
          </span>
        </div>
      )}

      {!canManage && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            You are in <strong>{role}</strong> mode. Only Firm Admins can change the subscription plan.
          </span>
        </div>
      )}

      {/* Current plan summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-1 flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ backgroundColor: currentFirm?.primaryColor || "#0066FF" }}
          >
            <Crown className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Current plan</p>
            <p className="text-xl font-extrabold text-slate-900 leading-tight">{currentPlan.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatUsd(priceFor(currentTier, currentFirm?.billingCycle ?? "monthly"))}/mo ·{" "}
              {currentFirm?.billingCycle === "annual" ? "billed annually" : "billed monthly"}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Users className="w-3.5 h-3.5 text-slate-400" /> Team seats
            </span>
            <span className="font-bold text-slate-900">
              {seatsUsed} / {seatLimit ?? "∞"}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${seatPct >= 100 ? "bg-rose-500" : "bg-brand-500"}`}
              style={{ width: `${seatLimit ? seatPct : 15}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            {seatLimit === null
              ? "Unlimited seats on Enterprise."
              : seatsUsed >= seatLimit
              ? "Seat limit reached — upgrade to invite more teammates."
              : `${seatLimit - seatsUsed} seat${seatLimit - seatsUsed === 1 ? "" : "s"} remaining.`}
          </p>
        </div>

        <div className="space-y-1.5 text-xs">
          <p className="flex items-center gap-1.5 font-semibold text-slate-700">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" /> Plan details
          </p>
          <p className="text-slate-600">
            Active since{" "}
            <span className="font-medium text-slate-900">
              {currentFirm?.planActivatedAt ? new Date(currentFirm.planActivatedAt).toLocaleDateString() : "—"}
            </span>
          </p>
          <p className="text-slate-600">
            {currentPlan.features.length === 0
              ? "Core onboarding features included."
              : `${currentPlan.features.length} premium feature${currentPlan.features.length === 1 ? "" : "s"} unlocked.`}
          </p>
        </div>
      </div>

      {/* Billing cycle toggle */}
      <div className="flex items-center justify-center">
        <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-1.5 rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
              billingCycle === "annual" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Annual <span className="text-[10px] text-emerald-600 font-bold ml-1">Save 20%</span>
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
              billingCycle === "monthly" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {PLAN_ORDER.map((tier) => {
          const plan = PLANS[tier];
          const isCurrent = tier === currentTier;
          const isUpgrade = planRank(tier) > planRank(currentTier);
          const isRequested = requestedPlan?.tier === tier && !requestedUnlocked;
          return (
            <div
              key={tier}
              className={`relative bg-white rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 ${
                isCurrent
                  ? "border-2 border-emerald-500 shadow-md"
                  : plan.highlighted || isRequested
                  ? "border-2 border-brand-500 shadow-xl shadow-brand-500/10"
                  : "border border-slate-200 shadow-sm hover:shadow-card-hover"
              }`}
            >
              {isCurrent ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Current plan
                </div>
              ) : plan.highlighted ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  {plan.badge}
                </div>
              ) : null}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  {!plan.highlighted && !isCurrent && (
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{plan.badge}</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 min-h-[32px] mb-3">{plan.description}</p>

                <div className="py-3 border-y border-slate-100 mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                      {formatUsd(priceFor(tier, billingCycle))}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/ month</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {billingCycle === "annual"
                      ? `${formatUsd(plan.priceAnnual * 12)} billed annually`
                      : "billed monthly · cancel anytime"}
                  </p>
                </div>

                <div className="space-y-2 mb-6">
                  {plan.bullets.map((b) => (
                    <div key={b} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectPlan(plan)}
                disabled={isCurrent}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                  isCurrent
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                    : isUpgrade
                    ? "bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-[0.98]"
                }`}
              >
                {isCurrent ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Current plan</span>
                  </>
                ) : isUpgrade ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Upgrade to {plan.name}</span>
                  </>
                ) : (
                  <span>Switch to {plan.name}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature comparison */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Compare features</h3>
          <p className="text-xs text-slate-500">Which capabilities each plan unlocks inside IntakeIQ.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-5">Feature</th>
                {PLAN_ORDER.map((tier) => (
                  <th key={tier} className={`py-3 px-4 text-center ${tier === currentTier ? "text-emerald-700" : ""}`}>
                    {PLANS[tier].name}
                    {tier === currentTier && <span className="block text-[9px] font-medium normal-case tracking-normal">you are here</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 px-5 font-medium">Team seats</td>
                {PLAN_ORDER.map((tier) => (
                  <td key={tier} className="py-3 px-4 text-center font-semibold text-slate-900">
                    {PLANS[tier].seatLimit ?? "Unlimited"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-5 font-medium">Cases, forms, documents & approvals</td>
                {PLAN_ORDER.map((tier) => (
                  <td key={tier} className="py-3 px-4 text-center">
                    <Check className="w-4 h-4 text-emerald-600 inline" />
                  </td>
                ))}
              </tr>
              {ALL_FEATURES.map((feature) => (
                <tr key={feature} className={requestedFeature === feature ? "bg-brand-50/60" : ""}>
                  <td className="py-3 px-5 font-medium">{FEATURE_LABELS[feature]}</td>
                  {PLAN_ORDER.map((tier) => (
                    <td key={tier} className="py-3 px-4 text-center">
                      {PLANS[tier].features.includes(feature) ? (
                        <Check className="w-4 h-4 text-emerald-600 inline" />
                      ) : (
                        <Minus className="w-4 h-4 text-slate-300 inline" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <CreditCard className="w-3.5 h-3.5" />
        Demo environment — no payment processor is connected and no real charges are made.
      </p>

      {checkoutPlan && (
        <CheckoutModal
          isOpen={!!checkoutPlan}
          plan={checkoutPlan}
          cycle={billingCycle}
          cardholderDefault={currentUser?.name.replace(/\s*\(.*\)\s*$/, "") ?? ""}
          onClose={() => setCheckoutPlan(null)}
          onSuccess={() => applyPlan(checkoutPlan.tier)}
          successAction={
            requestedFeature ? (
              <Link
                href={FEATURE_ROUTES[requestedFeature].href}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <span>{FEATURE_ROUTES[requestedFeature].label}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : null
          }
        />
      )}
    </div>
  );
}

function BillingPageInner() {
  return (
    <Suspense fallback={<div className="text-xs text-slate-500">Loading billing…</div>}>
      <BillingPageContent />
    </Suspense>
  );
}

export default function BillingPage() {
  return (
    <PermissionGate permission="settings:view">
      <BillingPageInner />
    </PermissionGate>
  );
}
