"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { X, Building2, User, ArrowRight, Shield } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [tab, setTab] = useState<"firm" | "client">("firm");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white text-base">
              IQ
            </div>
            <div>
              <h3 id="login-modal-title" className="text-lg font-bold text-white">IntakeIQ Portal Login</h3>
              <p className="text-[11px] text-slate-400">Secure role-enforced workspace gateway</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab("firm")}
            className={`flex-1 py-3 text-center transition-colors duration-150 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset ${
              tab === "firm"
                ? "bg-white text-brand-600 border-b-2 border-brand-500 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Firm Staff & Admins
          </button>
          <button
            type="button"
            onClick={() => setTab("client")}
            className={`flex-1 py-3 text-center transition-colors duration-150 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset ${
              tab === "client"
                ? "bg-white text-brand-600 border-b-2 border-brand-500 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="w-4 h-4" />
            Client Portal Participant
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-4">
          {tab === "firm" ? (
            <div className="space-y-3.5">
              <Link
                href="/auth/login"
                onClick={onClose}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold rounded-xl shadow-sm transition-colors duration-150 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <span>Launch Firm Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="pt-3 border-t border-slate-100 text-center">
                <Link
                  href="/auth/signup"
                  onClick={onClose}
                  className="text-xs font-semibold text-brand-600 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  Register a New Firm Tenant →
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <p className="text-xs text-slate-500 leading-relaxed">
                Experience the client-facing branded onboarding view with dynamic form questions and document checklist.
              </p>

              <Link
                href="/auth/login?tab=client&slug=apex-advisory&token=case-101"
                onClick={onClose}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white font-bold rounded-xl shadow-sm transition-colors duration-150 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <span>Open Sample Client Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Multi-tenant encrypted environment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
