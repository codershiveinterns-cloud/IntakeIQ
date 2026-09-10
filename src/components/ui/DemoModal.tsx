"use client";

import React, { useEffect, useState } from "react";
import { X, CheckCircle2, Building2, User, Mail, Briefcase, Users2, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: string | null;
}

// Maps the stable industry-card id (IndustrySolutions.tsx) to this modal's
// Industry <select> option text, so clicking a specific card pre-selects the
// matching industry instead of always defaulting to the first option.
const INDUSTRY_ID_TO_LABEL: Record<string, string> = {
  accounting: "Accounting & CA Firm",
  legal: "Law Firm / Legal Practice",
  advisory: "Financial & Wealth Advisory",
  agencies: "Client Services Agency",
};

export default function DemoModal({ isOpen, onClose, initialPlan = null }: DemoModalProps) {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    workEmail: "",
    firmName: "",
    firmType: "Accounting & CA Firm",
    firmSize: "11 - 50 team members",
  });

  const industryLabel = typeof initialPlan === "string" ? INDUSTRY_ID_TO_LABEL[initialPlan] : undefined;
  const planLabel = typeof initialPlan === "string" && !industryLabel ? initialPlan : undefined;

  useEffect(() => {
    if (!isOpen || !industryLabel) return;
    setFormData((prev) => ({ ...prev, firmType: industryLabel }));
  }, [isOpen, industryLabel]);

  // Every open starts on the form (never on a stale success screen), locks
  // background scroll, and moves focus into the dialog for keyboard users.
  useEffect(() => {
    if (!isOpen) return;
    setSubmitted(false);
    setIsSubmitting(false);
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      const first = document.querySelector<HTMLElement>("#demo-modal-first-field");
      first?.focus();
    }, 50);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-brand-900 text-white px-6 py-5 flex items-center justify-between border-b border-brand-800">
          <div>
            <span className="text-xs uppercase font-semibold text-brand-300 tracking-wider">
              Experience IntakeIQ
            </span>
            <h3 id="demo-modal-title" className="text-xl font-bold text-white mt-0.5">
              Request a Guided Demo
            </h3>
            {planLabel && (
              <span className="inline-block mt-1.5 text-[11px] font-semibold text-brand-200 bg-white/10 px-2 py-0.5 rounded-full">
                Regarding: {planLabel} plan
              </span>
            )}
            {industryLabel && (
              <span className="inline-block mt-1.5 text-[11px] font-semibold text-brand-200 bg-white/10 px-2 py-0.5 rounded-full">
                Regarding: {industryLabel}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900">Demo Request Received!</h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you, <span className="font-semibold text-slate-900">{formData.firstName || "there"}</span>. One of our onboarding specialists will reach out to schedule a custom walkthrough for <span className="font-semibold text-slate-900">{formData.firmName || "your firm"}</span>.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Close & Return to Site
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              See how IntakeIQ replaces scattered client email threads with a clean, branded portal and structured document collection.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="demo-modal-first-field"
                  type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Jane"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.workEmail}
                  onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                  placeholder="jane@advisoryfirm.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Firm Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.firmName}
                    onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                    placeholder="Apex Advisory Partners"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry
                </label>
                <select
                  value={formData.firmType}
                  onChange={(e) => setFormData({ ...formData, firmType: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                >
                  <option>Accounting & CA Firm</option>
                  <option>Law Firm / Legal Practice</option>
                  <option>Financial & Wealth Advisory</option>
                  <option>Client Services Agency</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Firm Size
              </label>
              <select
                value={formData.firmSize}
                onChange={(e) => setFormData({ ...formData, firmSize: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              >
                <option>1 - 10 team members</option>
                <option>11 - 50 team members</option>
                <option>51 - 200 team members</option>
                <option>201+ team members (Enterprise)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scheduling…</span>
                </>
              ) : (
                <>
                  <span>Schedule My Demo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Strict privacy guaranteed. Per-tenant data isolation.</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
