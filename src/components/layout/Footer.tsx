"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Mail, ArrowRight, CheckCircle2, Linkedin, Twitter, Github, Loader2 } from "lucide-react";
import { useToast } from "@/components/shared/ToastProvider";
import LogoMark from "@/components/shared/LogoMark";

export default function Footer({ onRequestDemo }: { onRequestDemo: () => void }) {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;
    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      setSubscribed(true);
    }, 600);
  };

  const notifyComingSoon = (label: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info(`${label} is coming soon.`);
  };

  return (
    <footer className="bg-slate-950 text-slate-400 font-sans border-t border-slate-800/80">
      {/* Top Newsletter & Assurance Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-xl">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Stay ahead in professional client onboarding
            </h3>
            <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
              Get our quarterly best practices guide on structuring PBC document requests, accelerating client response times, and reducing onboarding bottlenecks.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-400 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you for subscribing! Check your inbox soon.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 max-w-md">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    disabled={isSubmitting}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your work email"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-slate-700 text-white rounded-lg placeholder:text-slate-500 focus:outline-none focus:border-brand-500 disabled:opacity-60"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all duration-150 flex items-center justify-center gap-1.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Subscribing…</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Links Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <LogoMark className="w-8 h-8 shrink-0" />
              <span className="text-xl font-bold tracking-tight text-white">
                Intake<span className="text-brand-500">IQ</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The modern, multi-tenant client onboarding & document management platform built specifically for professional service firms.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>TLS 1.3 Encryption • Per-Tenant Schema Isolation</span>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={notifyComingSoon("Our LinkedIn page")}
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors duration-150 border border-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={notifyComingSoon("Our Twitter page")}
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors duration-150 border border-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={notifyComingSoon("Our GitHub page")}
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors duration-150 border border-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Column 1: Product */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="/#feature-portal" className="hover:text-white transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  Client Portal
                </a>
              </li>
              <li>
                <a href="/#feature-forms" className="hover:text-white transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  Dynamic Form Builder
                </a>
              </li>
              <li>
                <a href="/#feature-documents" className="hover:text-white transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  Document Checklists
                </a>
              </li>
              <li>
                <a href="/#feature-documents" className="hover:text-white transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  Version History
                </a>
              </li>
              <li>
                <a href="/#feature-workflow" className="hover:text-white transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  Approval Workflow
                </a>
              </li>
              <li>
                <a href="/#feature-admin" className="hover:text-white transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  Case Tracking Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Industries */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Industries
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="/#industries" className="hover:text-white transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  Accounting & CA Firms
                </a>
              </li>
              <li>
                <a href="/#industries" className="hover:text-white transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  Law Firms & Legal Practices
                </a>
              </li>
              <li>
                <a href="/#industries" className="hover:text-white transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  Financial Advisories
                </a>
              </li>
              <li>
                <a href="/#industries" className="hover:text-white transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  Client Services Agencies
                </a>
              </li>
              <li>
                <a href="/#industries" className="hover:text-white transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  Multi-Partner Practices
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Trust */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Company & Trust
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="/about" className="hover:text-white transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 font-semibold text-brand-400">
                  About Us & Founder
                </a>
              </li>
              <li>
                <a href="/#security" className="hover:text-white transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  Security Overview
                </a>
              </li>
              <li>
                <a href="/#security" className="hover:text-white transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  Data Isolation Matrix
                </a>
              </li>
              <li>
                <a href="/#pricing" className="hover:text-white transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  Pricing Plans
                </a>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>

            {/* Direct Contact Info */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
              <div className="text-[11px] font-semibold text-slate-300">Direct Inquiries:</div>
              <div>
                <span className="text-[10px] text-slate-500 block">Support:</span>
                <a href="mailto:support@intakeiq.com" className="text-slate-400 hover:text-white transition">
                  support@intakeiq.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} IntakeIQ Technologies Inc. All rights reserved.</p>
        <p className="flex items-center gap-4">
          <a href="/#security" className="hover:text-slate-400 transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">Security Policy</a>
          <span>•</span>
          <a href="/#security" className="hover:text-slate-400 transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">Confidentiality</a>
          <span>•</span>
          <button
            type="button"
            onClick={notifyComingSoon("Our System Status page")}
            className="hover:text-slate-400 transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            System Status
          </button>
        </p>
      </div>
    </footer>
  );
}
