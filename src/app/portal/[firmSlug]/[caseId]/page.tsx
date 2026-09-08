"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DataStore } from "@/lib/store/dataStore";
import { hasFeature } from "@/lib/billing/plans";
import { Firm, ClientCase, FormTemplate } from "@/lib/types";
import DynamicFormRenderer from "@/components/forms/DynamicFormRenderer";
import DocumentChecklistUpload from "@/components/documents/DocumentChecklistUpload";
import StatusBadge from "@/components/shared/StatusBadge";
import { useToast } from "@/components/shared/ToastProvider";
import confetti from "canvas-confetti";
import {
  Building2,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Clock,
  Loader2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function ClientPortalPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const firmSlug = params?.firmSlug as string;
  const caseId = params?.caseId as string;

  const [firm, setFirm] = useState<Firm | null>(null);
  const [clientCase, setClientCase] = useState<ClientCase | null>(null);
  const [formTemplate, setFormTemplate] = useState<FormTemplate | null>(null);
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<"overview" | "form" | "documents" | "status">("overview");
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const loadPortalData = () => {
    DataStore.initSeedData();
    const foundFirm = DataStore.getFirmBySlug(firmSlug);
    setFirm(foundFirm || null);

    // A case only belongs to this portal if it exists AND is owned by the
    // firm resolved from the URL — otherwise this is either a bad case id
    // or a cross-tenant lookup, and both must render as "not found".
    const foundCase = DataStore.getCaseById(caseId);
    const ownedCase = foundFirm && foundCase && foundCase.firmId === foundFirm.id ? foundCase : undefined;

    if (ownedCase) {
      setClientCase(ownedCase);
      setFormResponses(ownedCase.formResponses || {});

      if (ownedCase.formTemplateId) {
        const tmpl = DataStore.getFormTemplateById(ownedCase.formTemplateId);
        setFormTemplate(tmpl || null);
      }
    } else {
      setClientCase(null);
      setFormTemplate(null);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, [firmSlug, caseId]);

  if (!firm || !clientCase) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center max-w-md">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Onboarding Portal Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Could not find an active case for portal link <code>/portal/{firmSlug}/{caseId}</code>.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:brightness-110 active:scale-[0.98] rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Go to Firm Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Calculate Progress
  const totalDocs = clientCase.checklist.length;
  const approvedDocs = clientCase.checklist.filter(i => i.status === "Approved").length;
  const uploadedDocs = clientCase.checklist.filter(i => i.status === "Uploaded").length;
  const isFormDone = Boolean(clientCase.formSubmittedAt);

  const totalSteps = 1 + (totalDocs > 0 ? totalDocs : 0);
  const completedSteps = (isFormDone ? 1 : 0) + approvedDocs + (uploadedDocs > 0 ? uploadedDocs * 0.5 : 0);
  const overallPercentage = Math.min(100, Math.round((completedSteps / totalSteps) * 100));

  const handleFormChange = (fieldId: string, val: any) => {
    setFormResponses(prev => ({ ...prev, [fieldId]: val }));
    // Clear error
    if (formErrors[fieldId]) {
      setFormErrors(prev => {
        const n = { ...prev };
        delete n[fieldId];
        return n;
      });
    }
  };

  const handleSaveDraft = () => {
    DataStore.updateCase(clientCase.id, {
      formResponses,
    });
    toast.success("Progress saved! You can resume anytime.");
  };

  const handleSubmitForm = () => {
    // Validate required fields
    if (formTemplate) {
      const errors: Record<string, string> = {};
      for (const field of formTemplate.fields) {
        if (field.required) {
          const val = formResponses[field.id];
          if (val === undefined || val === null || val === "" || val === false) {
            errors[field.id] = `${field.label} is required.`;
          }
        }
      }
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        toast.error("Please complete all required fields highlighted in red.");
        return;
      }
    }

    setIsSubmittingForm(true);
    setTimeout(() => {
      const updated = DataStore.submitFormAnswers(
        clientCase.id,
        formResponses,
        clientCase.clientName,
        `client-${clientCase.id}`
      );
      setClientCase(updated);
      setIsSubmittingForm(false);
      
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setActiveTab("documents");
    }, 600);
  };

  const handleDocumentUpload = (
    checklistItemId: string,
    fileInfo: { fileName: string; fileUrl: string; fileSize: number; fileType: string }
  ) => {
    const updated = DataStore.uploadDocument(clientCase.id, checklistItemId, {
      ...fileInfo,
      uploadedBy: clientCase.clientName,
      actorId: `client-${clientCase.id}`,
    });
    setClientCase(updated);

    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 }
    });
  };

  const brandPrimary = firm.primaryColor || "#0066FF";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Branded Portal Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Firm Identity & Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white text-base shadow-sm"
              style={{ backgroundColor: brandPrimary }}
            >
              {firm.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  {firm.name}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" /> Secure Client Portal
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Onboarding Case: <span className="font-medium text-slate-700">{clientCase.title}</span>
              </p>
            </div>
          </div>

          {/* Client Identity & Dashboard link for demo */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-900">{clientCase.clientName}</p>
              <p className="text-[11px] text-slate-500">{clientCase.clientCompany || clientCase.clientEmail}</p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] px-3 py-1.5 rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              title="Return to Internal Firm Dashboard"
            >
              <span className="hidden md:inline">Firm Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Progress & Navigation Bar */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Progress Indicator */}
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Overall Completion:</span>
              <span className="text-xs font-extrabold" style={{ color: brandPrimary }}>
                {overallPercentage}%
              </span>
              <span className="text-xs text-slate-400">•</span>
              <StatusBadge status={clientCase.status} size="sm" />
            </div>

            <div className="w-full sm:w-64 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${overallPercentage}%`, backgroundColor: brandPrimary }}
              />
            </div>
          </div>

          {/* Navigation Tabs */}
          {/* Wraps into a 2x2 grid below lg: so all 4 tabs are always visible
              at once — a single scrollable row previously showed only ~2 of
              the 4 (long) labels at mobile/tablet widths with no indication
              that the rest were reachable by an undiscoverable horizontal swipe. */}
          <div className="grid grid-cols-2 lg:flex lg:items-center gap-1 lg:gap-4 text-xs font-semibold">
            {[
              { id: "overview", label: "1. Overview & Instructions" },
              {
                id: "form",
                label: `2. Questionnaire (${isFormDone ? "Completed ✓" : "Required"})`,
              },
              {
                id: "documents",
                label: `3. Document Checklist (${approvedDocs + uploadedDocs}/${totalDocs})`,
              },
              { id: "status", label: "4. Status & Review Team" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  aria-current={isActive ? "page" : undefined}
                  className={`py-3 px-3 sm:px-4 border-b-2 font-semibold transition-all duration-150 text-center lg:text-left lg:whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-t ${
                    isActive
                      ? "border-current text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                  }`}
                  style={{ borderColor: isActive ? brandPrimary : "transparent", color: isActive ? brandPrimary : undefined }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            {/* Welcome Banner */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white uppercase tracking-wider"
                  style={{ backgroundColor: brandPrimary }}
                >
                  Welcome
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">IntakeIQ Secure Portal</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Welcome to your client onboarding portal with {firm.name}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Hello <strong>{clientCase.clientName}</strong>, thank you for partnering with{" "}
                <strong>{firm.name}</strong>. To prepare and finalize your engagement for{" "}
                <strong>"{clientCase.title}"</strong>, please complete your intake questionnaire and upload the requested documents below.
              </p>

              {/* Steps overview cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("form")}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-dropdown hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer transition-all duration-150 shadow-xs space-y-2 group w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                      <FileSpreadsheet className="w-4 h-4 text-brand-600" />
                      <span>Step 1: Intake Questionnaire</span>
                    </div>
                    {isFormDone ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Completed ✓
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Incomplete
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {formTemplate?.title || "General Legal & Financial Questionnaire"}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("documents")}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-dropdown hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer transition-all duration-150 shadow-xs space-y-2 group w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                      <UploadCloud className="w-4 h-4 text-brand-600" />
                      <span>Step 2: Document Checklist</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {approvedDocs + uploadedDocs} / {totalDocs} Uploaded
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Upload required ID and entity formation records (up to 25MB).
                  </p>
                </button>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-bit TLS encrypted & isolated tenant storage</span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab(isFormDone ? "documents" : "form")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all duration-150 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                  style={{ backgroundColor: brandPrimary }}
                >
                  <span>{isFormDone ? "Go to Document Checklist" : "Start Questionnaire"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. FORM TAB */}
        {activeTab === "form" && (
          <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Intake Questionnaire
                  </span>
                  {isFormDone && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Submitted on {new Date(clientCase.formSubmittedAt!).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {formTemplate?.title || "Client Intake Questionnaire"}
                </h2>
                {formTemplate?.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {formTemplate.description}
                  </p>
                )}
              </div>

              {/* Dynamic Form Inputs */}
              {formTemplate && (
                <DynamicFormRenderer
                  fields={formTemplate.fields}
                  values={formResponses}
                  onChange={handleFormChange}
                  errors={formErrors}
                  brandColor={brandPrimary}
                />
              )}

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  Save Draft Progress
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    disabled={isSubmittingForm}
                    onClick={handleSubmitForm}
                    title={isSubmittingForm ? "Submitting your responses…" : undefined}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                    style={{ backgroundColor: brandPrimary }}
                  >
                    <span>
                      {isSubmittingForm
                        ? "Submitting..."
                        : isFormDone
                        ? "Update & Save Responses"
                        : "Submit Questionnaire"}
                    </span>
                    {isSubmittingForm ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Required Files
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {approvedDocs}/{totalDocs} Approved
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Document Checklist & Verification
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Please upload the required documentation. If a document needs corrections, the reviewer will provide feedback below. You can re-upload anytime.
                </p>
              </div>

              {/* Upload checklist list */}
              <DocumentChecklistUpload
                checklist={clientCase.checklist}
                clientName={clientCase.clientName}
                onUpload={handleDocumentUpload}
                brandColor={brandPrimary}
                aiExtractionUnlocked={hasFeature(firm.plan, "ai_extraction")}
              />

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("form")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous: Questionnaire</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("status")}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all duration-150 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                  style={{ backgroundColor: brandPrimary }}
                >
                  <span>Review Case Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. STATUS & REVIEW TEAM TAB */}
        {activeTab === "status" && (
          <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Engagement Status
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Current Case Review Status
                </h2>
              </div>

              {/* Current Status Box */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Stage:</span>
                  <StatusBadge status={clientCase.status} size="lg" />
                </div>

                <div className="text-xs text-slate-600 leading-relaxed">
                  {clientCase.status === "Approved" ? (
                    <p className="text-emerald-700 font-medium">
                      ✓ All documents and questionnaire responses have been fully approved by {firm.name}. Your case onboarding is complete!
                    </p>
                  ) : clientCase.status === "Under Review" ? (
                    <p className="text-amber-700 font-medium">
                      Your intake submission is currently under review by your assigned case manager. You will be notified of any updates.
                    </p>
                  ) : (
                    <p>
                      Please ensure both the questionnaire and all required document checklist items are submitted to advance your case.
                    </p>
                  )}
                </div>
              </div>

              {/* Firm Contact Information */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">Assigned Firm Support</h4>
                <div className="space-y-2 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{firm.name}</span>
                  </div>
                  {firm.contactEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <a href={`mailto:${firm.contactEmail}`} className="text-brand-600 hover:underline">
                        {firm.contactEmail}
                      </a>
                    </div>
                  )}
                  {firm.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{firm.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Powered by <strong>IntakeIQ</strong> Multi-Tenant Client Onboarding</span>
          <span>© {new Date().getFullYear()} {firm.name}. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
