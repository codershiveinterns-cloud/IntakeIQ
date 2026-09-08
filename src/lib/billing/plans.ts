import { PlanTier, BillingCycle } from "../types";

/**
 * Subscription plans — the single source of truth for pricing, seat limits,
 * and which features each tier unlocks. Both the marketing pricing section
 * and the in-app feature gates read from here so they can never drift apart.
 *
 * No real payment processor is connected: upgrades go through a simulated
 * checkout (see components/billing/CheckoutModal.tsx) and persist the chosen
 * tier on the Firm record.
 */

export type PlanFeature =
  | "kanban_board"
  | "analytics"
  | "audit_trail"
  | "audit_export"
  | "ai_extraction"
  | "custom_branding";

export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  badge: string;
  description: string;
  priceMonthly: number;
  /** Per-month price when billed annually (20% off). */
  priceAnnual: number;
  /** null = unlimited */
  seatLimit: number | null;
  features: PlanFeature[];
  /** Human-readable bullets shown on pricing cards. */
  bullets: string[];
  highlighted?: boolean;
}

export const PLAN_ORDER: PlanTier[] = ["starter", "professional", "enterprise"];

export const PLANS: Record<PlanTier, PlanDefinition> = {
  starter: {
    tier: "starter",
    name: "Starter",
    badge: "For Boutique Practices",
    description: "Everything you need to replace email onboarding for a small team.",
    priceMonthly: 199,
    priceAnnual: 159,
    seatLimit: 5,
    features: [],
    bullets: [
      "Up to 5 firm staff & case managers",
      "Unlimited client onboarding portals",
      "Dynamic form builder with reusable templates",
      "Document checklists with version history",
      "Manual approve / reject review workflow",
      "Email status notifications",
      "Table-based case tracking",
    ],
  },
  professional: {
    tier: "professional",
    name: "Professional",
    badge: "Most Popular",
    description: "For growing accounting, legal, and advisory firms managing high client volume.",
    priceMonthly: 499,
    priceAnnual: 399,
    seatLimit: 20,
    features: ["kanban_board", "analytics", "audit_trail", "ai_extraction", "custom_branding"],
    bullets: [
      "Everything in Starter",
      "Up to 20 firm staff & case managers",
      "Kanban pipeline board",
      "Firm analytics dashboard",
      "Full immutable audit trail",
      "AI document extraction & cross-check",
      "Custom branding & color theme",
      "Priority onboarding support",
    ],
    highlighted: true,
  },
  enterprise: {
    tier: "enterprise",
    name: "Enterprise",
    badge: "Multi-Partner & Large Firms",
    description: "Dedicated isolation, compliance exports, and unlimited seats for large practices.",
    priceMonthly: 999,
    priceAnnual: 799,
    seatLimit: null,
    features: ["kanban_board", "analytics", "audit_trail", "ai_extraction", "custom_branding", "audit_export"],
    bullets: [
      "Everything in Professional",
      "Unlimited firm staff & branch locations",
      "Audit & compliance exports (CSV / JSON)",
      "Multiple firm workspaces under one parent",
      "Dedicated per-tenant data isolation",
      "Dedicated account manager & staff training",
      "99.9% uptime SLA guarantee",
    ],
  },
};

export const FEATURE_LABELS: Record<PlanFeature, string> = {
  kanban_board: "Kanban Pipeline Board",
  analytics: "Firm Analytics Dashboard",
  audit_trail: "Immutable Audit Trail",
  audit_export: "Audit & Compliance Export",
  ai_extraction: "AI Document Extraction",
  custom_branding: "Custom Branding & Theme",
};

export const FEATURE_DESCRIPTIONS: Record<PlanFeature, string> = {
  kanban_board: "Drag cases across onboarding stages on a visual pipeline board.",
  analytics: "Real-time approval rates, turnaround times, team workload, and AI extraction quality across every case.",
  audit_trail: "A cryptographically logged, append-only record of every submission, upload, review decision, and status change.",
  audit_export: "Download the full audit trail as CSV or JSON for regulators, auditors, and compliance reviews.",
  ai_extraction: "Automatically read uploaded documents, extract key fields with confidence scores, and cross-check them against form answers.",
  custom_branding: "Apply your firm's own color theme to the client-facing onboarding portal.",
};

/** Firms created before subscriptions existed have no `plan` — treat as Starter. */
export function resolvePlanTier(plan: string | undefined | null): PlanTier {
  return plan === "professional" || plan === "enterprise" ? plan : "starter";
}

export function planRank(tier: PlanTier): number {
  return PLAN_ORDER.indexOf(tier);
}

export function hasFeature(plan: string | undefined | null, feature: PlanFeature): boolean {
  return PLANS[resolvePlanTier(plan)].features.includes(feature);
}

/** The lowest tier that includes a feature. */
export function requiredPlanFor(feature: PlanFeature): PlanTier {
  const tier = PLAN_ORDER.find((t) => PLANS[t].features.includes(feature));
  return tier ?? "enterprise";
}

export function seatLimitFor(plan: string | undefined | null): number | null {
  return PLANS[resolvePlanTier(plan)].seatLimit;
}

export function priceFor(tier: PlanTier, cycle: BillingCycle): number {
  return cycle === "annual" ? PLANS[tier].priceAnnual : PLANS[tier].priceMonthly;
}

/** Amount charged at checkout: annual plans are billed up-front for 12 months. */
export function chargeAmountFor(tier: PlanTier, cycle: BillingCycle): number {
  return cycle === "annual" ? PLANS[tier].priceAnnual * 12 : PLANS[tier].priceMonthly;
}

export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}
