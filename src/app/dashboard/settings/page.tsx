"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useTenant } from "@/lib/context/TenantContext";
import { DataStore } from "@/lib/store/dataStore";
import {
  Settings,
  Building2,
  Palette,
  Globe,
  Mail,
  Phone,
  MapPin,
  Save,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Lock
} from "lucide-react";
import Link from "next/link";
import { useFirmPlan, LockedFeatureCard } from "@/components/shared/FeatureGate";

const PRESET_COLORS = [
  { name: "Electric Royal Blue", hex: "#0066FF" },
  { name: "Emerald Growth", hex: "#059669" },
  { name: "Deep Indigo", hex: "#4F46E5" },
  { name: "Executive Navy", hex: "#0F172A" },
  { name: "Crimson Red", hex: "#DC2626" },
  { name: "Slate Teal", hex: "#0D9488" },
  { name: "Burgundy Wine", hex: "#9F1239" },
];

export default function FirmSettingsPage() {
  const { currentUser, role } = useAuth();
  const { currentFirm, updateCurrentFirm, refreshFirms } = useTenant();
  const { can } = useFirmPlan();
  const brandingUnlocked = can("custom_branding");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0066FF");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [industry, setIndustry] = useState<any>("Law & Legal");
  const [isSaved, setIsSaved] = useState(false);
  const [previewCaseId, setPreviewCaseId] = useState("case-101");

  useEffect(() => {
    if (currentFirm) {
      setName(currentFirm.name || "");
      setSlug(currentFirm.slug || "");
      setPrimaryColor(currentFirm.primaryColor || "#0066FF");
      setContactEmail(currentFirm.contactEmail || "");
      setPhone(currentFirm.phone || "");
      setAddress(currentFirm.address || "");
      setIndustry(currentFirm.industry || "Law & Legal");

      const cases = DataStore.getCases(currentFirm.id);
      if (cases.length > 0) {
        setPreviewCaseId(cases[0].id);
      }
    }
  }, [currentFirm?.id]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFirm || !currentUser) return;

    updateCurrentFirm({
      name: name.trim(),
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      // Custom brand color is a Professional feature — Starter keeps the default.
      primaryColor: brandingUnlocked ? primaryColor : currentFirm.primaryColor,
      contactEmail: contactEmail.trim(),
      phone: phone.trim(),
      address: address.trim(),
      industry,
    });

    DataStore.addAuditLog({
      firmId: currentFirm.id,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: "Firm Settings Updated",
      targetEntity: name.trim(),
      details: `Updated branding color to ${primaryColor} and slug to /${slug}.`
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const isAdmin = role === "Admin";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Firm Branding & Tenant Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure your firm's identity, portal subdomain slug, and customized client color theme.
          </p>
        </div>

        <Link
          href={`/portal/${slug || currentFirm?.slug || "apex-advisory"}/${previewCaseId}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl border border-brand-200 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 self-start sm:self-auto"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Preview Branded Portal</span>
        </Link>
      </div>

      {!isAdmin && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            You are in <strong>{role}</strong> mode. Only Firm Admins can edit branding and tenant settings. Use the demo switcher to switch to Admin.
          </span>
        </div>
      )}

      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Firm branding settings saved successfully! Your client portals have been updated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* 1. Firm Identity & Branding */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Palette className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Visual Branding & Theme
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Firm Legal Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={!isAdmin}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Advisory & Legal LLP"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Portal Subdomain / URL Slug <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="bg-slate-100 border border-r-0 border-slate-300 text-slate-500 px-2.5 py-2 rounded-l-lg text-xs font-mono">
                  /portal/
                </span>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="apex-advisory"
                  className="w-full px-3 py-2 border border-slate-300 rounded-r-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono disabled:bg-slate-50"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Unique tenant slug used for routing clients to your branded onboarding space.
              </p>
            </div>
          </div>

          {/* Color Palette Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Primary Brand Accent Color
            </label>
            {!brandingUnlocked && (
              <LockedFeatureCard feature="custom_branding" compact className="mb-3" />
            )}
            <div className="flex flex-wrap items-center gap-3">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  disabled={!isAdmin || !brandingUnlocked}
                  onClick={() => setPrimaryColor(c.hex)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
                    primaryColor.toLowerCase() === c.hex.toLowerCase()
                      ? "ring-2 ring-slate-900 border-transparent shadow-sm bg-slate-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              ))}

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-slate-500">Custom HEX:</span>
                <input
                  type="color"
                  disabled={!isAdmin || !brandingUnlocked}
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <input
                  type="text"
                  disabled={!isAdmin || !brandingUnlocked}
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-20 px-2 py-1 border border-slate-300 rounded text-xs font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                {name ? name.substring(0, 2).toUpperCase() : "IQ"}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">{name || "Your Firm Name"}</p>
                <p className="text-[11px] text-slate-500">Client Portal Branding Preview</p>
              </div>
            </div>

            <button
              type="button"
              disabled
              title="Preview only — this button is a static example of your branded style, not an interactive control."
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm opacity-60 cursor-not-allowed flex-shrink-0 self-start sm:self-auto"
              style={{ backgroundColor: primaryColor }}
            >
              Branded Button (Preview)
            </button>
          </div>
        </div>

        {/* 2. Firm Contact & Practice Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Practice Details & Client Inquiries
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Industry / Practice Specialization
              </label>
              <select
                disabled={!isAdmin}
                value={industry}
                onChange={(e) => setIndustry(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-50"
              >
                <option value="Law & Legal">Law & Legal Practice</option>
                <option value="Accounting & CA">Accounting, CPA & CA Practice</option>
                <option value="Financial Advisory">Wealth & Financial Advisory</option>
                <option value="Consulting & Agency">Strategic Consulting & Agency</option>
                <option value="Other">Other Professional Services</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Contact / Support Email
              </label>
              <input
                type="email"
                disabled={!isAdmin}
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. intake@yourfirm.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Support Phone Number
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 (555) 349-2900"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Office Headquarters Address
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 450 Lexington Ave, Suite 2400, New York, NY"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isAdmin && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-sm transition-all duration-150 ease-out hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Save className="w-4 h-4" />
              <span>Save Firm Settings & Branding</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
