"use client";

import React from "react";
import Link from "next/link";
import { Lock, ArrowRight, Sparkles } from "lucide-react";
import { useTenant } from "@/lib/context/TenantContext";
import {
  PlanFeature,
  PLANS,
  FEATURE_LABELS,
  FEATURE_DESCRIPTIONS,
  hasFeature,
  requiredPlanFor,
  resolvePlanTier,
  formatUsd,
} from "@/lib/billing/plans";

/**
 * Plan-aware counterpart to RoleGuard: RoleGuard answers "may this role do
 * this?", FeatureGate answers "has this firm paid for this?".
 */
export function useFirmPlan() {
  const { currentFirm } = useTenant();
  const tier = resolvePlanTier(currentFirm?.plan);
  return {
    tier,
    definition: PLANS[tier],
    can: (feature: PlanFeature) => hasFeature(tier, feature),
  };
}

interface LockedFeatureCardProps {
  feature: PlanFeature;
  /** Slim inline banner instead of the full card. */
  compact?: boolean;
  className?: string;
}

export function LockedFeatureCard({ feature, compact = false, className = "" }: LockedFeatureCardProps) {
  const required = PLANS[requiredPlanFor(feature)];
  const href = `/dashboard/billing?feature=${feature}`;

  if (compact) {
    return (
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 ${className}`}
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">
              {FEATURE_LABELS[feature]} is a {required.name} feature
            </p>
            <p className="text-[11px] text-amber-800/90 mt-0.5">{FEATURE_DESCRIPTIONS[feature]}</p>
          </div>
        </div>
        <Link
          href={href}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-sm transition-all duration-150 active:scale-[0.98] shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <span>Upgrade to {required.name}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}
    >
      <div className="bg-gradient-to-br from-amber-50 via-white to-brand-50/40 p-8 sm:p-12 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-lg mx-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
            <Sparkles className="w-3 h-3" />
            {required.name} plan
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Unlock {FEATURE_LABELS[feature]}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">{FEATURE_DESCRIPTIONS[feature]}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <Link
            href={href}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <span>
              Upgrade to {required.name} — {formatUsd(required.priceMonthly)}/mo
            </span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-1.5 px-5 py-3 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-xs transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Compare all plans
          </Link>
        </div>
      </div>
    </div>
  );
}

interface FeatureGateProps {
  feature: PlanFeature;
  children: React.ReactNode;
  /** Custom locked-state UI; defaults to the full LockedFeatureCard. */
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { can } = useFirmPlan();
  if (can(feature)) return <>{children}</>;
  return <>{fallback ?? <LockedFeatureCard feature={feature} />}</>;
}
