"use client";

import React from "react";
import { FileSpreadsheet, Scale, Landmark, Briefcase, ArrowRight, Check } from "lucide-react";
import Reveal from "../shared/Reveal";

interface IndustrySolutionsProps {
  onRequestDemo: (context?: string) => void;
}

export default function IndustrySolutions({ onRequestDemo }: IndustrySolutionsProps) {
  const industries = [
    {
      id: "accounting",
      shortLabel: "Accounting Firms",
      title: "Accounting & CA Firms",
      icon: FileSpreadsheet,
      badge: "Tax & Audit Practices",
      description: "Standardize PBC document lists, 1040/1120 tax organizers, and client entity questionnaires.",
      details: [
        "Pre-built PBC (Provided by Client) checklists with required flags",
        "Multi-partner firm management with isolated client vaults",
        "Zero missing schedules or tax disclosure attachments",
      ],
    },
    {
      id: "legal",
      shortLabel: "Legal Practices",
      title: "Law Firms & Legal Practices",
      icon: Scale,
      badge: "Corporate & Litigation",
      description: "Collect signed retainer agreements, conflict check disclosures, and corporate formation exhibits.",
      details: [
        "Secure versioned intake for sensitive legal documents & affidavits",
        "Role-enforced staff review before case file formal creation",
        "Standardized client onboarding questionnaires with conditional logic",
      ],
    },
    {
      id: "advisory",
      shortLabel: "Advisories",
      title: "Financial Advisories & Wealth",
      icon: Landmark,
      badge: "RIA & Family Offices",
      description: "Streamline investor suitability questionnaires, custodian transfer docs, and KYC verifications.",
      details: [
        "Eliminate back-and-forth email attachments for compliance records",
        "Clear client checklists with mandatory ID & asset verification",
        "Immutable audit timeline for every client submission",
      ],
    },
    {
      id: "agencies",
      shortLabel: "Agencies",
      title: "Client Services Agencies",
      icon: Briefcase,
      badge: "Consulting & Creative",
      description: "Gather client briefs, brand assets, scope authorizations, and billing details in one branded portal.",
      details: [
        "Modern white-labeled portal experience with agency branding",
        "Structured kick-off form templates with dynamic branch logic",
        "Clear progress indicators that keep new client projects on schedule",
      ],
    },
  ];

  return (
    <section id="industries" className="py-20 bg-slate-50 border-t border-slate-200/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <Reveal className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold">
            <span>Tailored Workflows</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-900 tracking-tight">
            Solutions Built for Your Professional Practice
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Whether you run a fast-paced CPA firm, a boutique law practice, or a multi-advisor wealth firm, IntakeIQ provides a structured, branded onboarding experience.
          </p>
        </Reveal>

        {/* Industry Cards Grid */}
        <Reveal delay={100} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-200 shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 rounded mb-2">
                    {item.badge}
                  </span>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-100 mb-6">
                    {item.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-600">
                        <Check className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => onRequestDemo(item.id)}
                    className="w-full py-2 px-3 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-500 hover:text-white active:bg-brand-700 rounded-lg transition-colors duration-150 flex items-center justify-center gap-1.5 group-hover:bg-brand-500 group-hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                  >
                    <span>Request Demo for {item.shortLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </Reveal>

      </div>
    </section>
  );
}
