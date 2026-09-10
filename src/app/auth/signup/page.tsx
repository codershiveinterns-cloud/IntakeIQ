"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/components/shared/ToastProvider";
import { DataStore } from "@/lib/store/dataStore";
import { validatePassword, PASSWORD_MIN_LENGTH } from "@/lib/auth/password";
import { DemoLinkNotice } from "@/components/auth/AuthCard";
import {
  Building2,
  Lock,
  Mail,
  User,
  Palette,
  Globe,
  ArrowRight,
  ShieldCheck,
  MailCheck
} from "lucide-react";

const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function SignupPage() {
  const router = useRouter();
  const { signupAdmin } = useAuth();
  const toast = useToast();

  const [firmName, setFirmName] = useState("");
  const [slug, setSlug] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0066FF");
  const [industry, setIndustry] = useState("Law & Legal");
  const [slugError, setSlugError] = useState("");
  const [colorError, setColorError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState<{ email: string; firmName: string; slug: string; verificationUrl: string } | null>(null);

  const handleFirmNameChange = (val: string) => {
    setFirmName(val);
    if (!slug || slug === slugify(firmName)) {
      setSlug(slugify(val));
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setSlugError("");

    if (!firmName.trim() || !adminName.trim() || !email.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const passwordProblem = validatePassword(password);
    if (passwordProblem) {
      toast.error(passwordProblem);
      return;
    }

    if (DataStore.getUserByEmail(email)) {
      toast.error("An account with that email already exists. Sign in instead, or use a different address.");
      return;
    }

    if (!HEX_COLOR_PATTERN.test(primaryColor.trim())) {
      setColorError("Enter a valid hex color (e.g. #0066FF).");
      toast.error("Primary brand color must be a valid hex code.");
      return;
    }

    const normalizedSlug = slugify(slug);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(normalizedSlug)) {
      setSlugError("Slug must be lowercase letters, numbers, and hyphens only (e.g. apex-advisory).");
      toast.error("Please enter a valid portal slug before continuing.");
      return;
    }

    if (DataStore.getFirmBySlug(normalizedSlug)) {
      setSlugError("That portal slug is already taken. Please choose another.");
      toast.error("That portal slug is already in use by another firm.");
      return;
    }

    setIsSubmitting(true);
    const { verificationUrl } = signupAdmin({
      firmName: firmName.trim(),
      slug: normalizedSlug,
      adminName: adminName.trim(),
      email: email.trim(),
      password,
      primaryColor,
      industry,
    });

    toast.success(`Workspace "${firmName.trim()}" created. Verify your email to activate it.`);
    setCreated({ email: email.trim(), firmName: firmName.trim(), slug: normalizedSlug, verificationUrl });
    setIsSubmitting(false);
  };

  if (created) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-8 space-y-6 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <MailCheck className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Verify your email to activate {created.firmName}</h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              We&apos;ve sent a verification link to <strong className="text-white">{created.email}</strong>. Your workspace is created, but you won&apos;t be able to sign in until the address is confirmed.
            </p>
          </div>

          <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
            <li>Open the verification link from your inbox.</li>
            <li>Sign in with your email and the password you just chose.</li>
            <li>Invite your team and create your first client case.</li>
          </ol>

          <DemoLinkNotice url={created.verificationUrl} label="Open verification link" />

          <div className="text-center text-xs text-slate-400">
            Already verified?{" "}
            <Link
              href={`/auth/login?email=${encodeURIComponent(created.email)}&slug=${encodeURIComponent(created.slug)}`}
              className="text-brand-400 hover:text-brand-300 font-semibold rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
            >
              Sign in →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 text-white font-extrabold text-xl shadow-lg">
          IQ
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          Register Your Professional Firm
        </h2>
        <p className="text-xs text-slate-400">
          Create an isolated multi-tenant workspace for your team & clients
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-slate-800/90 py-8 px-6 shadow-2xl rounded-2xl border border-slate-700 space-y-5 text-xs">
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Firm Details */}
            <div className="space-y-3 border-b border-slate-700/80 pb-4">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                1. Firm Information & Tenant Branding
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Firm Legal Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={firmName}
                    onChange={(e) => handleFirmNameChange(e.target.value)}
                    placeholder="e.g. Apex Advisory & Legal LLP"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Portal Slug (/portal/[slug]) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      // Restrict to URL-safe characters and collapse repeated
                      // hyphens as the user types, so a stray "/" or a run of
                      // symbols can never end up in a portal route segment.
                      // Leading/trailing hyphens are trimmed on blur/submit
                      // instead of here, so a hyphen the user just typed isn't
                      // stripped before they type the next character.
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-")
                          .replace(/-+/g, "-")
                      );
                      if (slugError) setSlugError("");
                    }}
                    onBlur={() => setSlug((prev) => slugify(prev))}
                    maxLength={64}
                    placeholder="apex-advisory"
                    aria-invalid={!!slugError}
                    className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white text-xs font-mono transition focus:ring-2 focus:outline-none ${
                      slugError
                        ? "border-rose-500 focus:ring-rose-500"
                        : "border-slate-700 focus:ring-brand-500"
                    }`}
                  />
                  {slugError && (
                    <p className="mt-1 text-[11px] text-rose-400">{slugError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={HEX_COLOR_PATTERN.test(primaryColor.trim()) ? primaryColor : "#0066FF"}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value);
                        setColorError("");
                      }}
                      aria-label="Primary brand color picker"
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded border border-slate-700 bg-slate-900 cursor-pointer p-0.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        onBlur={() => {
                          if (!HEX_COLOR_PATTERN.test(primaryColor.trim())) {
                            setColorError("Enter a valid hex color (e.g. #0066FF).");
                          } else {
                            setColorError("");
                          }
                        }}
                        placeholder="#0066FF"
                        aria-invalid={!!colorError}
                        aria-label="Primary brand color hex code"
                        className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white text-xs font-mono transition focus:ring-2 focus:outline-none ${
                          colorError
                            ? "border-rose-500 focus:ring-rose-500"
                            : "border-slate-700 focus:ring-brand-500"
                        }`}
                      />
                    </div>
                  </div>
                  {colorError && (
                    <p className="mt-1 text-[11px] text-rose-400">{colorError}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Practice Area / Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs transition hover:border-slate-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="Accounting & CA">Accounting, CPA & CA Firm</option>
                  <option value="Law & Legal">Law Firm & Legal Practice</option>
                  <option value="Financial Advisory">Wealth & Financial Advisory</option>
                  <option value="Consulting & Agency">Strategic Consulting & Agency</option>
                  <option value="Other">Other Professional Services</option>
                </select>
              </div>
            </div>

            {/* Admin User Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                2. Managing Partner / Admin Account
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Work Email (Admin Login) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@yourfirm.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={PASSWORD_MIN_LENGTH}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  At least {PASSWORD_MIN_LENGTH} characters, including a letter and a number.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              title={isSubmitting ? "Setting up your workspace…" : undefined}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition-all duration-150 ease-out flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
            >
              <span>{isSubmitting ? "Creating Workspace..." : "Create Tenant Workspace"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/auth/login"
              className="text-xs text-brand-400 hover:text-brand-300 font-medium transition rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
            >
              Already registered? Sign In →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
