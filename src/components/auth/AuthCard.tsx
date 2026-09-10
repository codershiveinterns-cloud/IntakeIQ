"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LogoMark from "@/components/shared/LogoMark";

interface AuthCardProps {
  title: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  iconTone?: "brand" | "success" | "danger" | "warning";
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}

const TONES: Record<NonNullable<AuthCardProps["iconTone"]>, string> = {
  brand: "bg-brand-50 text-brand-600",
  success: "bg-emerald-50 text-emerald-600",
  danger: "bg-rose-50 text-rose-600",
  warning: "bg-amber-50 text-amber-600",
};

/** Shared centred layout for the secondary auth screens (verify / reset / forgot). */
export default function AuthCard({
  title,
  subtitle,
  icon,
  iconTone = "brand",
  backHref = "/auth/login",
  backLabel = "Back to sign in",
  children,
}: AuthCardProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <div className="p-4 sm:p-6 flex items-center justify-between">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition group rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition" />
          <span>{backLabel}</span>
        </Link>
        <Link href="/" className="flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
          <LogoMark className="w-7 h-7 shrink-0" />
          <span className="text-sm font-bold tracking-tight text-brand-900">IntakeIQ</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-card p-7 sm:p-8 space-y-6 animate-fade-in">
          {icon && (
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${TONES[iconTone]}`}>
              {icon}
            </div>
          )}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 leading-relaxed">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>

      <footer className="p-4 sm:p-6 text-center text-[11px] text-slate-400">
        Multi-Tenant Partitioned Isolation • Bank-Grade 256-bit TLS Encryption
      </footer>
    </div>
  );
}

/** Amber notice used wherever a link would normally be emailed. */
export function DemoLinkNotice({ url, label }: { url: string; label: string }) {
  return (
    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2.5">
      <p className="leading-relaxed">
        <strong>Demo environment:</strong> no mail server is connected, so the link that would have been emailed is shown here instead. It is also recorded in the firm&apos;s Email Outbox.
      </p>
      <a
        href={url}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.98] shadow-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
      >
        {label} →
      </a>
    </div>
  );
}
