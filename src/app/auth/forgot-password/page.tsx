"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DataStore } from "@/lib/store/dataStore";
import AuthCard, { DemoLinkNotice } from "@/components/auth/AuthCard";
import { KeyRound, Mail, ArrowRight, MailCheck } from "lucide-react";

function ForgotPasswordContent() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") || "");
  const [submitted, setSubmitted] = useState(false);
  const [demoUrl, setDemoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      DataStore.initSeedData();
      const result = DataStore.requestPasswordReset(email);
      // The response is identical whether or not the address exists, so the
      // form cannot be used to discover which emails have accounts.
      setDemoUrl(result ? result.url : null);
      setSubmitted(true);
      setIsSubmitting(false);
    }, 400);
  };

  if (submitted) {
    return (
      <AuthCard
        title="Check your inbox"
        subtitle={
          <>
            If an account exists for <strong>{email.trim()}</strong>, we&apos;ve sent a password reset link. It expires in 60 minutes and can be used once.
          </>
        }
        icon={<MailCheck className="w-6 h-6" />}
        iconTone="success"
      >
        <div className="space-y-4">
          {demoUrl && <DemoLinkNotice url={demoUrl} label="Open password reset link" />}
          <div className="text-xs text-slate-500 space-y-1.5">
            <p>Didn&apos;t get it? Check the address you entered, or try again in a moment.</p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setDemoUrl(null);
              }}
              className="font-semibold text-brand-600 hover:text-brand-700 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Use a different email
            </button>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter the work email on your firm account and we'll send you a secure link to choose a new password."
      icon={<KeyRound className="w-6 h-6" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Work Email Address <span className="text-brand-600">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="forgot-email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yourfirm.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <span>{isSubmitting ? "Sending link…" : "Send reset link"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-xs text-slate-500 text-center">
          Remembered it?{" "}
          <Link href="/auth/login" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
