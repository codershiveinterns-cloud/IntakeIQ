"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import LogoMark from "@/components/shared/LogoMark";
import {
  ChevronDown,
  Menu,
  X,
  Layers,
  FileCheck2,
  UserCheck,
  Building2,
  Scale,
  Landmark,
  Briefcase,
  FileSpreadsheet,
  ArrowRight,
  LayoutDashboard
} from "lucide-react";

interface NavbarProps {
  onRequestDemo: () => void;
  onOpenLogin: () => void;
}

export default function Navbar({ onRequestDemo, onOpenLogin }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const productMenuRef = useRef<HTMLDivElement>(null);
  const industriesMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click/touch-only open + outside-click close. A click always toggles the
  // menu state directly — no hover handlers — so a mouse click can't fight
  // with a mouseenter that just opened the same menu (which previously made
  // a click appear to do nothing, and left the menu unreachable for
  // keyboard/touch users who never fire hover events at all).
  useEffect(() => {
    if (!productOpen && !industriesOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (productOpen && productMenuRef.current && !productMenuRef.current.contains(e.target as Node)) {
        setProductOpen(false);
      }
      if (industriesOpen && industriesMenuRef.current && !industriesMenuRef.current.contains(e.target as Node)) {
        setIndustriesOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProductOpen(false);
        setIndustriesOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [productOpen, industriesOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3"
          : "bg-white border-b border-slate-100 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <LogoMark className="w-9 h-9 shrink-0 drop-shadow-sm transition-transform duration-200 group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-brand-900 leading-none">
                Intake<span className="text-brand-500">IQ</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Client Onboarding & Docs
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 font-medium text-sm text-slate-700">
            {/* Product Dropdown */}
            <div className="relative" ref={productMenuRef}>
              <button
                type="button"
                onClick={() => setProductOpen((prev) => !prev)}
                aria-expanded={productOpen}
                aria-haspopup="true"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg hover:text-brand-600 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <span>Product</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${productOpen ? "rotate-180 text-brand-600" : "text-slate-400"}`} />
              </button>

              {productOpen && (
                <div className="absolute top-full left-0 w-80 bg-white rounded-xl shadow-dropdown border border-slate-200/80 p-2.5 mt-1 animate-fade-in">
                  <a
                    href="#feature-portal"
                    onClick={() => setProductOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mt-0.5 group-hover:bg-brand-500 group-hover:text-white transition">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-brand-600">
                        Branded Client Portal
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Multi-tenant isolated portals with custom firm domain & branding
                      </p>
                    </div>
                  </a>

                  <a
                    href="#feature-forms"
                    onClick={() => setProductOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mt-0.5 group-hover:bg-brand-500 group-hover:text-white transition">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-brand-600">
                        Dynamic Form Builder
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Drag-and-drop questionnaires with conditional logic branching
                      </p>
                    </div>
                  </a>

                  <a
                    href="#feature-documents"
                    onClick={() => setProductOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mt-0.5 group-hover:bg-brand-500 group-hover:text-white transition">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-brand-600">
                        Document Collection & Versioning
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Required/optional checklists with immutable version histories
                      </p>
                    </div>
                  </a>

                  <a
                    href="#feature-workflow"
                    onClick={() => setProductOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mt-0.5 group-hover:bg-brand-500 group-hover:text-white transition">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-brand-600">
                        Approval Workflow & Audit Trail
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Manual reviewer verification, rejection notes, & audit logs
                      </p>
                    </div>
                  </a>

                  <a
                    href="#feature-admin"
                    onClick={() => setProductOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mt-0.5 group-hover:bg-brand-500 group-hover:text-white transition">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-brand-600">
                        Admin Dashboard & Case Tracking
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Real-time pipeline visibility across every client case
                      </p>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* Industries Dropdown */}
            <div className="relative" ref={industriesMenuRef}>
              <button
                type="button"
                onClick={() => setIndustriesOpen((prev) => !prev)}
                aria-expanded={industriesOpen}
                aria-haspopup="true"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg hover:text-brand-600 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <span>Industries</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${industriesOpen ? "rotate-180 text-brand-600" : "text-slate-400"}`} />
              </button>

              {industriesOpen && (
                <div className="absolute top-full left-0 w-80 bg-white rounded-xl shadow-dropdown border border-slate-200/80 p-2.5 mt-1 animate-fade-in">
                  <a
                    href="#industries"
                    onClick={() => setIndustriesOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mt-0.5 group-hover:bg-brand-500 group-hover:text-white transition">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-brand-600">
                        Accounting & CA Firms
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        PBC lists, tax engagement packages, and corporate schedules
                      </p>
                    </div>
                  </a>

                  <a
                    href="#industries"
                    onClick={() => setIndustriesOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mt-0.5 group-hover:bg-brand-500 group-hover:text-white transition">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-brand-600">
                        Law Firms & Legal Practices
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Retainers, conflict checks, KYC questionnaires, and exhibits
                      </p>
                    </div>
                  </a>

                  <a
                    href="#industries"
                    onClick={() => setIndustriesOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mt-0.5 group-hover:bg-brand-500 group-hover:text-white transition">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-brand-600">
                        Financial & Wealth Advisories
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Investor profiles, custodian transfers, and compliance forms
                      </p>
                    </div>
                  </a>

                  <a
                    href="#industries"
                    onClick={() => setIndustriesOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mt-0.5 group-hover:bg-brand-500 group-hover:text-white transition">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-brand-600">
                        Client Services Agencies
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Project kickoffs, asset collection, and scope confirmations
                      </p>
                    </div>
                  </a>
                </div>
              )}
            </div>

            <a
              href="/#pricing"
              className="px-3.5 py-2 rounded-lg hover:text-brand-600 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Pricing
            </a>

            <a
              href="/#security"
              className="px-3.5 py-2 rounded-lg hover:text-brand-600 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Security
            </a>

            <Link
              href="/about"
              className="px-3.5 py-2 rounded-lg hover:text-brand-600 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              About Us
            </Link>

          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Sign In
            </Link>

            <Link
              href="/auth/login"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 rounded-lg shadow-sm hover:shadow transition-all duration-150 transform hover:-translate-y-0.5 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => onRequestDemo()}
              className="px-3.5 py-2.5 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Demo
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden pt-4 pb-6 border-t border-slate-200 mt-3 space-y-4 animate-fade-in">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">Product</p>
              <a
                href="#feature-portal"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors duration-150 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Branded Client Portal
              </a>
              <a
                href="#feature-forms"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors duration-150 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Dynamic Form Builder
              </a>
              <a
                href="#feature-documents"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors duration-150 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Document Checklist & Versioning
              </a>
              <a
                href="#feature-workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors duration-150 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Approval Workflow & Audit Trail
              </a>
              <a
                href="#feature-admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors duration-150 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Admin Dashboard & Case Tracking
              </a>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">Industries</p>
              <a
                href="#industries"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors duration-150 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Accounting & CA Firms
              </a>
              <a
                href="#industries"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors duration-150 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Law Firms & Legal Practices
              </a>
              <a
                href="#industries"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors duration-150 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Wealth & Financial Advisories
              </a>
              <a
                href="#industries"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors duration-150 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Client Services Agencies
              </a>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-100">
              <a
                href="/#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors duration-150 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Pricing
              </a>
              <a
                href="/#security"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors duration-150 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Security & Isolation
              </a>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2 px-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full py-2.5 text-center text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors duration-150 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onRequestDemo();
                }}
                className="w-full py-2.5 text-center text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition-colors duration-150 rounded-lg shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Request a Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
