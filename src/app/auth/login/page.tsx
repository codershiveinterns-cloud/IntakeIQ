"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, LoginFailure } from "@/lib/context/AuthContext";
import { useToast } from "@/components/shared/ToastProvider";
import { DEMO_PASSWORD } from "@/lib/auth/password";
import LogoMark from "@/components/shared/LogoMark";
import { DemoLinkNotice } from "@/components/auth/AuthCard";
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Eye,
  EyeOff,
  User,
  Sparkles,
  Key,
  ArrowLeft,
  CheckCircle2,
  Star,
  Quote,
  MailCheck,
  RefreshCw
} from "lucide-react";

const TRUST_POINTS = [
  "Real-time case tracking across your entire firm",
  "Per-tenant data isolation with 256-bit encryption",
  "Immutable approval & audit trail on every action",
  "Role-based access for admins, staff & clients",
];

const FAILURE_MESSAGES: Record<LoginFailure, string> = {
  not_found: "We couldn't find a firm account with that email. Check the address, or use a 1-Click Demo Profile below.",
  bad_password: "Incorrect password. Try again, or use “Forgot password?” to reset it.",
  unverified: "This email address hasn't been verified yet. Open the verification link we emailed you, then sign in.",
  wrong_workspace: "That account doesn't belong to this firm workspace. Check the workspace subdomain and try again.",
};

function LoginPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, quickLogin, clientLogin, resendVerification } = useAuth();
  const toast = useToast();

  const initialTab = params.get("tab") === "client" ? "client" : "firm";
  const prefillEmail = params.get("email") || "";
  const prefillSlug = params.get("slug") || "";
  const prefillToken = params.get("token") || "";

  const [activeTab, setActiveTab] = useState<"firm" | "client">(initialTab);
  const [email, setEmail] = useState(prefillEmail || "admin@apexadvisory.com");
  const [password, setPassword] = useState(prefillEmail ? "" : DEMO_PASSWORD);
  const [tenantSlug, setTenantSlug] = useState(prefillSlug || "apex-advisory");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [clientToken, setClientToken] = useState(prefillToken || "case-101");
  const [clientEmail, setClientEmail] = useState(prefillToken ? "" : "david@luminahealth.io");
  const [error, setError] = useState("");
  const [failure, setFailure] = useState<LoginFailure | null>(null);
  const [demoVerifyUrl, setDemoVerifyUrl] = useState<string | null>(null);
  const [clientError, setClientError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQuickLoggingIn, setIsQuickLoggingIn] = useState(false);

  const notice = params.get("verified") === "1"
    ? "Email verified — you can now sign in."
    : params.get("reset") === "1"
      ? "Password updated — sign in with your new password."
      : params.get("activated") === "1"
        ? "Account activated — sign in with the password you just created."
        : prefillToken
        ? "Sign in with the email address your invitation was sent to."
        : "";

  const handleFirmLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFailure(null);
    setDemoVerifyUrl(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const result = login(email, password, tenantSlug, rememberMe);
      if (result.ok) {
        router.push("/dashboard");
      } else {
        setFailure(result.reason);
        setError(FAILURE_MESSAGES[result.reason]);
        setIsSubmitting(false);
      }
    }, 400);
  };

  const handleResendVerification = () => {
    const url = resendVerification(email);
    if (url) {
      setDemoVerifyUrl(url);
      toast.success(`Verification email re-sent to ${email.trim()}.`);
    } else {
      toast.info("This account is already verified — try signing in again.");
    }
  };

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError("");
    setIsSubmitting(true);

    setTimeout(() => {
      const result = clientLogin({ firmSlug: prefillSlug, token: clientToken, email: clientEmail });
      if (result.ok) {
        router.push(`/portal/${result.firmSlug}/${result.caseId}`);
      } else {
        setClientError("We couldn't match that case reference and email. Check the token and email from your firm advisor's invitation.");
        setIsSubmitting(false);
      }
    }, 400);
  };

  const handleQuickLogin = (quickEmail: string) => {
    if (isQuickLoggingIn) return;
    setIsQuickLoggingIn(true);
    const result = quickLogin(quickEmail);
    if (result.ok) {
      router.push("/dashboard");
    } else {
      setActiveTab("firm");
      setError(FAILURE_MESSAGES[result.reason]);
      setIsQuickLoggingIn(false);
    }
  };

  const handleClientQuickLogin = () => {
    if (isQuickLoggingIn) return;
    setIsQuickLoggingIn(true);
    const result = clientLogin({ firmSlug: "apex-advisory", token: "case-101", email: "david@luminahealth.io" });
    if (result.ok) {
      router.push(`/portal/${result.firmSlug}/${result.caseId}`);
    } else {
      setActiveTab("client");
      setClientError("The demo client case is unavailable. Use “Reset demo data” from the dashboard and try again.");
      setIsQuickLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Left: Brand Storytelling Panel (desktop only) */}
      <div className="hidden lg:flex flex-col justify-between relative bg-brand-950 text-white p-12 xl:p-16 overflow-hidden subtle-grid-dark">
        {/* Decorative glow */}
        <div className="absolute top-1/3 -left-24 w-[420px] h-[420px] bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[320px] h-[320px] bg-tealAccent-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-12 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoMark className="w-10 h-10 shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tight">IntakeIQ</span>
                <span className="text-[11px] text-slate-400 font-medium tracking-wide mt-0.5">
                  Client Onboarding & Docs
                </span>
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition group rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="space-y-5 max-w-md">
            <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight">
              Welcome back to your firm&apos;s command center
            </h1>
            <p className="text-slate-400 leading-relaxed">
              Sign in to track every client case, review submitted documents, and keep your team aligned — all from one branded workspace.
            </p>
          </div>

          <div className="space-y-3.5">
            {TRUST_POINTS.map((point) => (
              <div key={point} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm text-slate-300">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3 animate-fade-in">
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
            ))}
          </div>
          <div className="flex gap-2.5">
            <Quote className="w-5 h-5 text-brand-400 shrink-0 -scale-x-100" />
            <p className="text-sm text-slate-200 leading-relaxed">
              Our document collection cycle dropped from{" "}
              <span className="text-brand-300 font-semibold">three weeks to under 48 hours</span>.
            </p>
          </div>
          <div className="pl-7 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Michael Krammer, CPA</span> — Managing Partner, Summit Advisory Group LLP
          </div>
        </div>
      </div>

      {/* Right: Form Panel */}
      <div className="flex flex-col min-h-screen">
        {/* Mobile-only header */}
        <div className="lg:hidden p-4 sm:p-6 flex items-center justify-between border-b border-slate-100">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition group rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <LogoMark className="w-7 h-7 shrink-0" />
            <span className="text-sm font-bold tracking-tight text-brand-900">IntakeIQ</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-5 sm:p-10">
          <div className="w-full max-w-md space-y-7 animate-fade-in">
            {/* Heading */}
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Sign in to IntakeIQ
              </h2>
              <p className="text-sm text-slate-500">
                Secure, multi-tenant onboarding gateway for professional firms & clients.
              </p>
            </div>

            {/* Audience Segmented Control */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("firm")}
                className={`flex-1 py-2.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                  activeTab === "firm"
                    ? "bg-white text-brand-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Firm Staff & Admins</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("client")}
                className={`flex-1 py-2.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                  activeTab === "client"
                    ? "bg-white text-amber-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Client Portal User</span>
              </button>
            </div>

            {notice && (
              <div role="status" className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <MailCheck className="w-4 h-4 shrink-0" />
                <span>{notice}</span>
              </div>
            )}

            {activeTab === "firm" && error && (
              <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-2.5">
                <span className="block">{error}</span>
                {failure === "unverified" && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="inline-flex items-center gap-1.5 font-bold text-rose-800 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Resend verification email
                  </button>
                )}
              </div>
            )}
            {activeTab === "firm" && demoVerifyUrl && (
              <DemoLinkNotice url={demoVerifyUrl} label="Open verification link" />
            )}
            {activeTab === "client" && clientError && (
              <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <span>{clientError}</span>
              </div>
            )}

            {activeTab === "firm" ? (
              /* Firm Member Login Form */
              <form onSubmit={handleFirmLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Firm Workspace Subdomain
                  </label>
                  <div className="flex rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500">
                    <input
                      type="text"
                      required
                      value={tenantSlug}
                      onChange={(e) => setTenantSlug(e.target.value)}
                      placeholder="apex-advisory"
                      className="flex-1 px-3.5 py-2.5 bg-transparent text-slate-900 text-sm font-mono outline-none"
                    />
                    <span className="bg-slate-50 text-slate-400 px-3 py-2.5 text-xs font-mono border-l border-slate-200 flex items-center">
                      .intakeiq.app
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Work Email Address <span className="text-brand-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@apexadvisory.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Password <span className="text-brand-600">*</span>
                    </label>
                    <Link
                      href={email.trim() ? `/auth/forgot-password?email=${encodeURIComponent(email.trim())}` : "/auth/forgot-password"}
                      className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline py-1 px-1 -m-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 transition rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Demo profiles use the shared password <code className="font-mono text-slate-500">{DEMO_PASSWORD}</code>.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 bg-white border-slate-300 cursor-pointer"
                    />
                    <span className="text-slate-600 text-xs font-medium">Remember this browser</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  title={isSubmitting ? "Signing you in…" : undefined}
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 hover:shadow-lg transition-all duration-150 ease-out flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <span>{isSubmitting ? "Authenticating..." : "Sign In to Firm Workspace"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* Client Portal Access Form */
              <form onSubmit={handleClientLogin} className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Clients access their customized onboarding portal using the secure link or case reference code emailed by their firm advisor.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Case Reference ID or Secure Token <span className="text-amber-600">*</span>
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={clientToken}
                      onChange={(e) => setClientToken(e.target.value)}
                      placeholder="e.g. case-101"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Authorized Client Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="david@luminahealth.io"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  title={isSubmitting ? "Verifying your case access…" : undefined}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-md shadow-amber-500/20 hover:shadow-lg transition-all duration-150 ease-out flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                >
                  <span>{isSubmitting ? "Verifying Access..." : "Enter Secure Client Portal"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* 1-Click Instant Demo Profiles */}
            <div className="pt-5 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Instant 1-Click Demo Profiles</span>
                </div>
                <span className="text-[10px] text-slate-400">Zero Password Required</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Admin Profile */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin("admin@apexadvisory.com")}
                  disabled={isQuickLoggingIn || isSubmitting}
                  className="p-3 bg-slate-50 hover:bg-purple-50/70 hover:border-purple-300 rounded-xl border border-slate-200 text-left transition-all duration-150 ease-out group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow"
                >
                  <div className="flex items-center gap-1.5 text-purple-600 font-bold text-xs group-hover:text-purple-700">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Eleanor Vance</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 group-hover:text-slate-700">Admin (Apex Advisory)</div>
                </button>

                {/* Case Manager Profile */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin("casemanager@apexadvisory.com")}
                  disabled={isQuickLoggingIn || isSubmitting}
                  className="p-3 bg-slate-50 hover:bg-blue-50/70 hover:border-blue-300 rounded-xl border border-slate-200 text-left transition-all duration-150 ease-out group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow"
                >
                  <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs group-hover:text-blue-700">
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Marcus Sterling</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 group-hover:text-slate-700">Case Manager (Reviewer)</div>
                </button>

                {/* Staff Profile */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin("staff@apexadvisory.com")}
                  disabled={isQuickLoggingIn || isSubmitting}
                  className="p-3 bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-300 rounded-xl border border-slate-200 text-left transition-all duration-150 ease-out group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow"
                >
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs group-hover:text-emerald-700">
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                    <span>Chloe Zhao</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 group-hover:text-slate-700">Staff (View-Only)</div>
                </button>

                {/* Client Portal Profile */}
                <button
                  type="button"
                  onClick={handleClientQuickLogin}
                  disabled={isQuickLoggingIn || isSubmitting}
                  className="p-3 bg-slate-50 hover:bg-amber-50/70 hover:border-amber-300 rounded-xl border border-slate-200 text-left transition-all duration-150 ease-out group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow"
                >
                  <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs group-hover:text-amber-700">
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span>David Chen</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 group-hover:text-slate-700">Client Portal (Lumina Health)</div>
                </button>
              </div>
            </div>

            {/* Sign Up CTA */}
            <div className="pt-1 text-center text-xs text-slate-500">
              Don&apos;t have a firm tenant yet?{" "}
              <Link
                href="/auth/signup"
                className="font-bold text-brand-600 hover:text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded"
              >
                Create New Firm Tenant →
              </Link>
            </div>
          </div>
        </div>

        {/* Security & Compliance Footer */}
        <footer className="p-4 sm:p-6 text-center text-[11px] text-slate-400 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2">
          <span>Multi-Tenant Partitioned Isolation • Bank-Grade 256-bit TLS Encryption</span>
          <span>© {new Date().getFullYear()} IntakeIQ. All rights reserved.</span>
        </footer>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
