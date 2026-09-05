"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Mail,
  Copy,
  Check,
  Award,
  Users,
  Building2,
  CheckCircle2,
  MessageSquare,
  Sparkles
} from "lucide-react";
import Reveal from "../shared/Reveal";
import { useToast } from "../shared/ToastProvider";

export default function FounderSection() {
  const toast = useToast();
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
    <section id="founder" className="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5 text-brand-600" />
            <span>Leadership & Vision</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-900 tracking-tight">
            Meet the Founder
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            The driving vision, engineering philosophy, and commitment behind IntakeIQ.
          </p>
        </Reveal>

        {/* Founder Card Container */}
        <Reveal delay={100}>
          <div className="bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl border border-slate-800 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full filter blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-tealAccent-500/10 rounded-full filter blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
              
              {/* Left: Founder Portrait & Badges */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-brand-500 to-tealAccent-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-500" />
                  <div className="relative w-64 sm:w-72 lg:w-80 h-80 sm:h-96 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-900">
                    <Image
                      src="/images/karan-mittal.jpg"
                      alt="Karan Mittal - Founder of IntakeIQ"
                      fill
                      className="object-cover object-top transition duration-500 group-hover:scale-105"
                      priority
                    />
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Karan Mittal
                  </h3>
                  <p className="text-brand-400 font-semibold text-sm mt-1">
                    Founder & Chief Executive Officer
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-300 text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-tealAccent-400" />
                      Founder & Lead Architect
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: AI-crafted Story, Mission & Direct Communication */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-medium text-slate-300 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                    <span>Founder&apos;s Mission</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                    &ldquo;Onboarding shouldn&apos;t feel like a chore. It should be your firm&apos;s strongest competitive advantage.&rdquo;
                  </h3>
                </div>

                <div className="space-y-3.5 text-slate-300 text-sm sm:text-base leading-relaxed">
                  <p>
                    <strong>Karan Mittal</strong> founded IntakeIQ with a resolute mission: to permanently eradicate the chaos, security risks, and administrative fatigue of client data collection for professional service firms.
                  </p>
                  <p>
                    Recognizing that CPAs, legal partners, and wealth managers spend hundreds of unbilled hours chasing missing PBC documents and unencrypted email threads, Karan engineered a unified platform combining{" "}
                    <strong className="font-semibold text-white">instant magic-link client portals</strong>,{" "}
                    <strong className="font-semibold text-white">immutable audit trails</strong>, and{" "}
                    <strong className="font-semibold text-white">per-tenant database isolation</strong>.
                  </p>
                  <p>
                    Today, IntakeIQ empowers high-trust firms to onboard clients 70% faster while maintaining compliance and unmatched client satisfaction.
                  </p>
                </div>

                {/* Core Architecture Pillars */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center sm:text-left">
                    <div className="text-[11px] text-brand-400 font-semibold uppercase">Pillar 01</div>
                    <div className="text-xs sm:text-sm font-semibold text-white mt-0.5">Zero Login Friction</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center sm:text-left">
                    <div className="text-[11px] text-brand-400 font-semibold uppercase">Pillar 02</div>
                    <div className="text-xs sm:text-sm font-semibold text-white mt-0.5">Schema Isolation</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center sm:text-left">
                    <div className="text-[11px] text-brand-400 font-semibold uppercase">Pillar 03</div>
                    <div className="text-xs sm:text-sm font-semibold text-white mt-0.5">Automated Audits</div>
                  </div>
                </div>

                {/* Direct Communications Card */}
                <div className="pt-3 border-t border-slate-800">
                  <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-700 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Direct Communications
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Direct response guaranteed
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {/* 1. Support Email */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-medium">Customer Support</p>
                            <p className="text-xs sm:text-sm font-semibold text-white">support@intakeiq.com</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleCopy("support@intakeiq.com", "Support email")}
                            className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-md transition flex items-center gap-1"
                            title="Copy Support Email"
                          >
                            {copiedEmail === "support@intakeiq.com" ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedEmail === "support@intakeiq.com" ? "Copied" : "Copy"}</span>
                          </button>
                          <a
                            href="mailto:support@intakeiq.com"
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded-md transition flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Mail</span>
                          </a>
                        </div>
                      </div>

                      {/* 2. Founder Personal Email (Below Support Email) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-brand-950/80 rounded-xl border border-brand-500/50">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 shrink-0">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] text-brand-300 font-medium">Founder Personal Email</p>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-500 text-white font-bold tracking-wide">Direct</span>
                            </div>
                            <p className="text-xs sm:text-sm font-semibold text-white tracking-wide break-all">
                              karanmittal95337@gmail.com
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleCopy("karanmittal95337@gmail.com", "Founder's personal email")}
                            className="px-2.5 py-1 text-xs text-brand-200 hover:text-white bg-brand-900 hover:bg-brand-800 border border-brand-700 rounded-md transition flex items-center gap-1"
                            title="Copy Founder Email"
                          >
                            {copiedEmail === "karanmittal95337@gmail.com" ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedEmail === "karanmittal95337@gmail.com" ? "Copied" : "Copy"}</span>
                          </button>
                          <a
                            href="mailto:karanmittal95337@gmail.com"
                            className="px-3 py-1 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm transition flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Email Karan</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
