"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  ShieldCheck,
  FileCheck2,
  CreditCard,
  Building2,
  Lock,
  Clock,
  AlertCircle,
  FileText,
  Mail,
  Copy,
  Check,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DemoModal from "@/components/ui/DemoModal";
import LoginModal from "@/components/ui/LoginModal";
import ScrollProgressBar from "@/components/shared/ScrollProgressBar";
import BackToTop from "@/components/shared/BackToTop";
import { useToast } from "@/components/shared/ToastProvider";

export default function TermsOfServicePage() {
  const toast = useToast();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => {
      setCopiedEmail(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      <ScrollProgressBar />

      <Navbar
        onRequestDemo={() => setIsDemoOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      <main className="flex-1 pt-24 pb-20">
        {/* Breadcrumb Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Link href="/" className="hover:text-brand-600 transition">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-800 font-semibold">Terms of Service</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200/70 text-slate-700 text-[11px] font-medium">
                <Clock className="w-3 h-3 text-slate-500" />
                Updated Sep 2026
              </span>
            </div>
          </div>
        </div>

        {/* Hero Banner */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold">
                <Scale className="w-4 h-4 text-brand-600" />
                <span>Master SaaS Service Agreement</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-900 tracking-tight leading-tight">
                Terms of Service
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Clear, straightforward guidelines governing workspace access, data ownership, billing, and platform availability.
              </p>

              {/* Page Switcher Tabs */}
              <div className="pt-4 flex items-center gap-3">
                <Link
                  href="/privacy"
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  ← Privacy Policy
                </Link>
                <span className="px-4 py-2 rounded-xl bg-brand-500 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Terms of Service
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Executive Highlights Grid */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Your Data Ownership</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">You retain 100% ownership of all uploaded client files and intake responses.</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">99.9% Uptime Target</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">High-availability architecture designed for time-sensitive onboarding workflows.</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Transparent Billing</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Clear subscription tiers with simple cancellation and a 30-day data export grace window.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Clean Terms Document Container */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 sm:p-12 space-y-10">
            
            {/* Section 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Agreement Overview</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed pl-9">
                These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the IntakeIQ platform operated by IntakeIQ Technologies Inc. By creating a firm workspace or using an intake portal, you agree to these terms on behalf of your firm or organization.
              </p>
            </div>

            <hr className="border-slate-100" />

            {/* Section 2 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Services & Account Security</h2>
              </div>
              <div className="pl-9 space-y-3 text-sm text-slate-600 leading-relaxed">
                <p>
                  IntakeIQ provides cloud-based client onboarding portals, document checklists, and intake form tools:
                </p>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                    <span><strong>Account Responsibilities:</strong> You are responsible for safeguarding your login credentials and managing staff user permissions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                    <span><strong>Authorized Access:</strong> Workspace administrators must promptly revoke credentials when staff members depart.</span>
                  </li>
                </ul>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 3 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Subscriptions & Billing</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed pl-9">
                Subscriptions are billed in advance on a recurring monthly or annual basis. You may cancel your subscription at any time prior to your next billing cycle through the admin billing dashboard.
              </p>
            </div>

            <hr className="border-slate-100" />

            {/* Section 4 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                  04
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Acceptable Use Policy</h2>
              </div>
              <div className="pl-9 space-y-3 text-sm text-slate-600 leading-relaxed">
                <p>
                  You agree to use IntakeIQ only for legitimate professional onboarding workflows. You agree NOT to:
                </p>
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-1.5 text-xs">
                  <div className="font-semibold text-brand-400">Prohibited Conduct</div>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    <li>Upload viruses, malware, or illegal content.</li>
                    <li>Attempt to bypass multi-tenant security filters or access other firms&apos; schemas.</li>
                    <li>Reverse engineer or scrape the IntakeIQ application software.</li>
                  </ul>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 5 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                  05
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Data Ownership & Portability</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed pl-9">
                Your firm retains <strong>100% ownership</strong> of all submitted client information and uploaded documents. Upon subscription termination, you have a <strong>30-day grace period</strong> to export all data before records are permanently removed from storage.
              </p>
            </div>

            <hr className="border-slate-100" />

            {/* Section 6 - Direct Contact */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                  06
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Contact & Support</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed pl-9">
                If you have questions regarding these Terms or need assistance with your subscription, reach out directly:
              </p>

              <div className="pl-9 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer Support</span>
                    <Building2 className="w-4 h-4 text-brand-400" />
                  </div>
                  <p className="text-sm font-semibold text-white">support@intakeiq.com</p>
                  <button
                    type="button"
                    onClick={() => handleCopy("support@intakeiq.com", "Support email")}
                    className="mt-1 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition flex items-center gap-1.5"
                  >
                    {copiedEmail === "support@intakeiq.com" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail === "support@intakeiq.com" ? "Copied" : "Copy Email"}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-brand-950/90 text-white border border-brand-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-brand-300 uppercase tracking-wider">Founder Direct</span>
                    <Mail className="w-4 h-4 text-brand-400" />
                  </div>
                  <p className="text-sm font-semibold text-white">karanmittal95337@gmail.com</p>
                  <button
                    type="button"
                    onClick={() => handleCopy("karanmittal95337@gmail.com", "Founder's email")}
                    className="mt-1 px-3 py-1.5 text-xs text-brand-200 hover:text-white bg-brand-900/60 hover:bg-brand-900 border border-brand-700/70 rounded-lg transition flex items-center gap-1.5"
                  >
                    {copiedEmail === "karanmittal95337@gmail.com" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail === "karanmittal95337@gmail.com" ? "Copied" : "Copy Email"}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer onRequestDemo={() => setIsDemoOpen(true)} />
      <BackToTop />

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
