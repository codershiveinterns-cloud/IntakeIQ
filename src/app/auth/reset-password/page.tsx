"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DataStore } from "@/lib/store/dataStore";
import { validatePassword, PASSWORD_MIN_LENGTH } from "@/lib/auth/password";
import AuthCard from "@/components/auth/AuthCard";
import { useToast } from "@/components/shared/ToastProvider";
import { Lock, Eye, EyeOff, ShieldAlert, KeyRound, ArrowRight, CheckCircle2 } from "lucide-react";

function ResetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const token = params.get("token") || "";
  const isSetup = params.get("setup") === "1";

  const [checked, setChecked] = useState(false);
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    DataStore.initSeedData();
    const user = DataStore.getUserByResetToken(token);
    setAccountEmail(user ? user.email : null);
    setChecked(true);
  }, [token]);

  const strengthProblem = password ? validatePassword(password) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const problem = validatePassword(password);
    if (problem) {
      setError(problem);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const user = DataStore.resetPassword(token, password);
      if (!user) {
        setError("This link has expired or was already used. Please request a new one.");
        setIsSubmitting(false);
        return;
      }
      toast.success(isSetup ? "Your account is active. Sign in to continue." : "Password updated. Sign in with your new password.");
      const slug = DataStore.getFirmById(user.firmId)?.slug || "";
      router.push(`/auth/login?${isSetup ? "activated=1" : "reset=1"}&email=${encodeURIComponent(user.email)}&slug=${encodeURIComponent(slug)}`);
    }, 400);
  };

  if (!checked) return null;

  if (!accountEmail) {
    return (
      <AuthCard
        title="This link has expired"
        subtitle="Password links are valid for a limited time and can only be used once. Request a fresh link to continue."
        icon={<ShieldAlert className="w-6 h-6" />}
        iconTone="danger"
      >
        <Link
          href="/auth/forgot-password"
          className="w-full py-3 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-md transition-all duration-150 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <span>Request a new link</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={isSetup ? "Create your password" : "Choose a new password"}
      subtitle={
        <>
          For <strong>{accountEmail}</strong>. Use at least {PASSWORD_MIN_LENGTH} characters with a mix of letters and numbers.
        </>
      }
      icon={<KeyRound className="w-6 h-6" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="new-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
            New password <span className="text-brand-600">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              required
              autoFocus
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <p className={`mt-1.5 text-[11px] flex items-center gap-1 ${strengthProblem ? "text-amber-600" : "text-emerald-600"}`}>
              <CheckCircle2 className="w-3 h-3" />
              {strengthProblem || "Looks good."}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Confirm password <span className="text-brand-600">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <span>{isSubmitting ? "Saving…" : isSetup ? "Activate account" : "Update password"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
