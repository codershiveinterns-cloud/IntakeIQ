"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  X,
  Lock,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Sparkles,
  Check,
} from "lucide-react";
import { BillingCycle } from "@/lib/types";
import { PlanDefinition, FEATURE_LABELS, chargeAmountFor, formatUsd, priceFor } from "@/lib/billing/plans";

interface CheckoutModalProps {
  isOpen: boolean;
  plan: PlanDefinition;
  cycle: BillingCycle;
  cardholderDefault?: string;
  onClose: () => void;
  onSuccess: () => void;
  /** Rendered on the success screen, e.g. a "Go to Analytics" link. */
  successAction?: React.ReactNode;
}

const TEST_CARD = "4242 4242 4242 4242";

function formatCardNumber(raw: string): string {
  return raw
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

/**
 * Simulated Stripe-style checkout. No payment processor is connected — the
 * form is pre-filled with the industry-standard 4242 test card, nothing typed
 * here is stored or transmitted, and "paying" simply activates the plan on
 * the firm record so the gated features unlock.
 */
export default function CheckoutModal({
  isOpen,
  plan,
  cycle,
  cardholderDefault = "",
  onClose,
  onSuccess,
  successAction,
}: CheckoutModalProps) {
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [cardholder, setCardholder] = useState(cardholderDefault);
  const [cardNumber, setCardNumber] = useState(TEST_CARD);
  const [expiry, setExpiry] = useState("12 / 29");
  const [cvc, setCvc] = useState("123");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    setStep("form");
    setCardholder(cardholderDefault);
    setCardNumber(TEST_CARD);
    setExpiry("12 / 29");
    setCvc("123");
    setErrors({});
  }, [isOpen, cardholderDefault]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step !== "processing") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, step, onClose]);

  if (!isOpen) return null;

  const total = chargeAmountFor(plan.tier, cycle);
  const perMonth = priceFor(plan.tier, cycle);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!cardholder.trim()) next.cardholder = "Cardholder name is required.";
    if (cardNumber.replace(/\D/g, "").length !== 16) next.cardNumber = "Enter a 16-digit card number.";
    const exp = expiry.replace(/\D/g, "");
    const month = parseInt(exp.slice(0, 2), 10);
    if (exp.length !== 4 || month < 1 || month > 12) next.expiry = "Use MM / YY.";
    if (!/^\d{3,4}$/.test(cvc)) next.cvc = "3 or 4 digits.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== "form" || !validate()) return;
    setStep("processing");
    window.setTimeout(() => {
      onSuccess();
      setStep("success");
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    }, 1400);
  };

  const handleBackdrop = () => {
    if (step !== "processing") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {step === "success" ? (
          <div className="p-8 sm:p-12 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                You&apos;re now on {plan.name}
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Payment of <span className="font-bold text-slate-900">{formatUsd(total)}</span> confirmed. Everything below is unlocked for your firm immediately.
              </p>
            </div>
            {plan.features.length > 0 && (
              <div className="max-w-sm mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-slate-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{FEATURE_LABELS[f]}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {successAction}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5">
            {/* Order summary */}
            <div className="md:col-span-2 bg-brand-950 text-white p-6 sm:p-7 space-y-5 subtle-grid-dark">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-brand-300">
                <Sparkles className="w-3.5 h-3.5" />
                Order summary
              </div>
              <div>
                <p className="text-sm text-slate-300">IntakeIQ {plan.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-extrabold tracking-tight font-mono">{formatUsd(perMonth)}</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {cycle === "annual" ? "Billed annually — 20% saving applied" : "Billed monthly, cancel anytime"}
                </p>
              </div>

              <div className="space-y-2 text-xs border-t border-white/10 pt-4">
                <div className="flex items-center justify-between text-slate-300">
                  <span>{plan.name} × {cycle === "annual" ? "12 months" : "1 month"}</span>
                  <span>{formatUsd(total)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Tax</span>
                  <span>$0</span>
                </div>
                <div className="flex items-center justify-between font-bold text-white text-sm border-t border-white/10 pt-2">
                  <span>Due today</span>
                  <span>{formatUsd(total)}</span>
                </div>
              </div>

              <ul className="space-y-1.5 text-[11px] text-slate-300 border-t border-white/10 pt-4">
                {plan.bullets.slice(0, 5).map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment form */}
            <form onSubmit={handlePay} className="md:col-span-3 p-6 sm:p-7 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 id="checkout-title" className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Payment details
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Secure checkout for {plan.name}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={step === "processing"}
                  aria-label="Close checkout"
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors duration-150 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Demo checkout.</strong> No payment processor is connected — this form is pre-filled with a test card, nothing you enter is stored or sent anywhere, and no real charge is made.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cardholder name</label>
                <input
                  type="text"
                  value={cardholder}
                  onChange={(e) => setCardholder(e.target.value)}
                  disabled={step === "processing"}
                  placeholder="Jane Doe"
                  autoComplete="off"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none disabled:bg-slate-50 ${
                    errors.cardholder ? "border-rose-400" : "border-slate-300"
                  }`}
                />
                {errors.cardholder && <p className="text-[11px] text-rose-600 mt-1">{errors.cardholder}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Card number</label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Test card
                  </span>
                </div>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    disabled={step === "processing"}
                    autoComplete="off"
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none disabled:bg-slate-50 ${
                      errors.cardNumber ? "border-rose-400" : "border-slate-300"
                    }`}
                  />
                </div>
                {errors.cardNumber && <p className="text-[11px] text-rose-600 mt-1">{errors.cardNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    disabled={step === "processing"}
                    placeholder="MM / YY"
                    autoComplete="off"
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none disabled:bg-slate-50 ${
                      errors.expiry ? "border-rose-400" : "border-slate-300"
                    }`}
                  />
                  {errors.expiry && <p className="text-[11px] text-rose-600 mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CVC</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    disabled={step === "processing"}
                    placeholder="123"
                    autoComplete="off"
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none disabled:bg-slate-50 ${
                      errors.cvc ? "border-rose-400" : "border-slate-300"
                    }`}
                  />
                  {errors.cvc && <p className="text-[11px] text-rose-600 mt-1">{errors.cvc}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={step === "processing"}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all duration-150 flex items-center justify-center gap-2 mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                {step === "processing" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authorizing payment…</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay {formatUsd(total)}</span>
                  </>
                )}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Lock className="w-3 h-3" />
                256-bit TLS encrypted • Cancel or change plans anytime
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
