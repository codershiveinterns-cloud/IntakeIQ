"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { useTenant } from "@/lib/context/TenantContext";
import { DataStore } from "@/lib/store/dataStore";
import { ClientCase, FormTemplate, CaseStatus, AuditLogEntry } from "@/lib/types";
import StatusBadge from "@/components/shared/StatusBadge";
import DynamicFormRenderer from "@/components/forms/DynamicFormRenderer";
import DocumentChecklistReview from "@/components/documents/DocumentChecklistReview";
import { useToast } from "@/components/shared/ToastProvider";
import { useFirmPlan } from "@/components/shared/FeatureGate";
import { hasPermission } from "@/lib/auth/permissions";
import {
  ArrowLeft,
  Building2,
  Lock,
  Mail,
  User,
  ExternalLink,
  Calendar,
  FileSpreadsheet,
  FileCheck2,
  History,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Edit,
  Save,
  MessageSquare,
  ShieldCheck,
  Download
} from "lucide-react";

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params?.caseId as string;

  const { currentUser, role } = useAuth();
  const { currentFirm } = useTenant();
  const toast = useToast();
  const { can } = useFirmPlan();

  const [clientCase, setClientCase] = useState<ClientCase | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"checklist" | "form" | "audit" | "notes">("checklist");
  const [copiedLink, setCopiedLink] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const refreshCase = () => {
    if (!caseId || !currentFirm) return;
    DataStore.initSeedData();
    const c = DataStore.getCaseById(caseId);
    // Tenant isolation: a case that exists but belongs to another firm must be
    // indistinguishable from a case that does not exist at all.
    if (c && c.firmId === currentFirm.id) {
      setClientCase(c);
      setInternalNotes(c.notes || "");
      if (c.formTemplateId) {
        const tmpl = DataStore.getFormTemplateById(c.formTemplateId);
        setTemplate(tmpl || null);
      }
      const logs = DataStore.getAuditLogs(currentFirm.id, c.id);
      setAuditLogs(logs);
    } else {
      setClientCase(null);
      setTemplate(null);
      setAuditLogs([]);
    }
    setLoaded(true);
  };

  useEffect(() => {
    refreshCase();
  }, [caseId, currentFirm?.id]);

  if (!loaded) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading case…</div>;
  }

  if (!clientCase) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800">Case Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          No case with this reference exists in your firm&apos;s workspace.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-brand-600 hover:brightness-110 px-4 py-2 rounded-lg transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Return to Cases
        </Link>
      </div>
    );
  }

  const handleStatusChange = (newStatus: CaseStatus) => {
    if (!currentUser) return;
    const updated = DataStore.updateCase(clientCase.id, { status: newStatus }, currentUser);
    setClientCase(updated);
    refreshCase();
    toast.success(`Case status updated to "${newStatus}".`);
  };

  const handleDocumentReview = (
    checklistItemId: string,
    status: "Approved" | "Rejected",
    reason?: string
  ) => {
    if (!currentUser) return;
    const updated = DataStore.reviewDocument(
      clientCase.id,
      checklistItemId,
      status,
      reason,
      currentUser
    );
    setClientCase(updated);
    refreshCase();
    toast.success(status === "Approved" ? "Document approved." : "Document rejected.");
  };

  const handleSaveNotes = () => {
    setIsSavingNotes(true);
    DataStore.updateCase(clientCase.id, { notes: internalNotes });
    setTimeout(() => {
      setIsSavingNotes(false);
      refreshCase();
      toast.success("Notes saved.");
    }, 400);
  };

  const portalUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/portal/${
    currentFirm?.slug || "apex-advisory"
  }/${clientCase.id}`;

  const copyPortal = () => {
    navigator.clipboard
      .writeText(portalUrl)
      .then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      })
      .catch(() => {
        toast.error("Couldn't copy automatically — the link is shown below to copy manually.");
        try {
          window.prompt("Copy the portal link:", portalUrl);
        } catch {
          // window.prompt isn't available in every environment (e.g. some
          // embedded/automated browser contexts) — the toast above already
          // told the user copying failed, so there's nothing further to do.
        }
      });
  };

  // Review actions (approve / reject / stage change) follow the RBAC matrix, not a role name.
  const isStaffReadOnly = !hasPermission(role, "cases:approve_docs");

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            aria-label="Back to cases"
            className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-xs transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Ref {clientCase.id.toUpperCase()}
              </span>
              <StatusBadge status={clientCase.status} size="sm" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
              {clientCase.title}
            </h1>
          </div>
        </div>

        {/* Portal URL & Case Stage Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Copy Portal Link */}
          <button
            type="button"
            onClick={copyPortal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-xs transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Portal Link</span>
              </>
            )}
          </button>

          {/* Open Portal as Client */}
          <Link
            href={`/portal/${currentFirm?.slug || "apex-advisory"}/${clientCase.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl border border-brand-200 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Client Portal</span>
          </Link>

          {/* Status Change Dropdown */}
          {!isStaffReadOnly && (
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-1">Stage:</span>
              <select
                value={clientCase.status}
                onChange={(e) => handleStatusChange(e.target.value as CaseStatus)}
                className="text-xs font-bold text-slate-800 bg-slate-50 rounded-lg px-2 py-1 border border-slate-200 transition focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Invited">Invited</option>
                <option value="Form Submitted">Form Submitted</option>
                <option value="Documents Pending">Documents Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Client Overview Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Client Contact</span>
          <p className="font-bold text-slate-900 text-sm">{clientCase.clientName}</p>
          <div className="flex items-center gap-1 text-slate-500">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>{clientCase.clientEmail}</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Organization / Company</span>
          <p className="font-bold text-slate-800 text-sm">
            {clientCase.clientCompany || "Individual Client"}
          </p>
          <p className="text-slate-500">Practice Area: {template?.category || "Corporate"}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Assigned Reviewer</span>
          <p className="font-bold text-slate-800 text-sm">
            {clientCase.assignedToName || "Unassigned"}
          </p>
          <p className="text-slate-500">
            {clientCase.assignedTo
              ? `Role: ${DataStore.getUserById(clientCase.assignedTo)?.role || "Unknown"}`
              : "No reviewer assigned yet"}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Created & Activity</span>
          <p className="font-bold text-slate-800 text-sm">
            {new Date(clientCase.createdAt).toLocaleDateString()}
          </p>
          <p className="text-slate-500">
            Updated: {new Date(clientCase.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold overflow-x-auto">
        {[
          {
            id: "checklist",
            label: `Document Checklist (${clientCase.checklist.filter(i => i.status === "Approved").length}/${clientCase.checklist.length} Approved)`,
            icon: FileCheck2,
          },
          {
            id: "form",
            label: `Form Responses (${clientCase.formSubmittedAt ? "Submitted" : "Pending"})`,
            icon: FileSpreadsheet,
          },
          {
            id: "audit",
            label: `Case Audit Trail (${auditLogs.length})`,
            icon: History,
          },
          {
            id: "notes",
            label: "Internal Notes",
            icon: MessageSquare,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-semibold whitespace-nowrap flex-shrink-0 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                isActive
                  ? "border-brand-600 text-brand-600 bg-white rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {/* 1. Document Checklist Review */}
      {activeTab === "checklist" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Document Verification & Review
              </h3>
              <p className="text-xs text-slate-500">
                Review submitted client files, inspect version history, and approve or reject with comments.
              </p>
            </div>
            {isStaffReadOnly && (
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                View-Only Mode
              </span>
            )}
          </div>

          <DocumentChecklistReview
            checklist={clientCase.checklist}
            reviewer={currentUser}
            onReview={handleDocumentReview}
            readOnly={isStaffReadOnly}
            aiExtractionUnlocked={can("ai_extraction")}
          />
        </div>
      )}

      {/* 2. Submitted Form Responses */}
      {activeTab === "form" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Submitted Questionnaire Answers
              </h3>
              <p className="text-xs text-slate-500">
                {template?.title || "Client Intake Form"}
              </p>
            </div>

            {clientCase.formSubmittedAt ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Submitted on {new Date(clientCase.formSubmittedAt).toLocaleString()}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                Awaiting Client Submission
              </span>
            )}
          </div>

          {template ? (
            <DynamicFormRenderer
              fields={template.fields}
              values={clientCase.formResponses || {}}
              readOnly={true}
            />
          ) : (
            <div className="py-8 text-center">
              <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No form template associated with this case.</p>
            </div>
          )}
        </div>
      )}

      {/* 3. Audit Trail for this Case */}
      {activeTab === "audit" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Immutable Case Audit Log
              </h3>
              <p className="text-xs text-slate-500">
                Complete chronological audit trail of all form submissions, uploads, reviews, and status changes.
              </p>
            </div>
            {can("audit_export") ? (
              <button
                type="button"
                onClick={() =>
                  downloadTextFile(
                    `intakeiq-audit-${clientCase.id}.csv`,
                    DataStore.auditLogsToCSV(auditLogs),
                    "text/csv;charset=utf-8;"
                  )
                }
                disabled={auditLogs.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 shadow-xs transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            ) : (
              <Link
                href="/dashboard/billing?feature=audit_export"
                title="Audit & compliance export is included in the Enterprise plan"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-all duration-150 active:scale-[0.98] shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Export · Enterprise</span>
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <div className="py-8 text-center">
                <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">
                  No audit records logged yet — activity like form submissions, uploads, and status changes will appear here.
                </p>
              </div>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold text-brand-700">{log.targetEntity}</span>
                    </div>
                    {log.details && (
                      <p className="text-[11px] text-slate-600">{log.details}</p>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-slate-500 flex-shrink-0">
                    <p className="font-medium text-slate-700">{log.actorName} ({log.actorRole})</p>
                    <p>{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. Internal Case Notes */}
      {activeTab === "notes" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Internal Case Notes
            </h3>
            <p className="text-xs text-slate-500">
              Private notes visible only to firm staff and case managers (not visible to client).
            </p>
          </div>

          <textarea
            rows={6}
            disabled={isStaffReadOnly}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="Add internal notes about background checks, entity verification notes, or partner comments..."
            className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-50"
          />

          {!isStaffReadOnly && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                title={isSavingNotes ? "Saving your notes..." : undefined}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:brightness-110 rounded-xl shadow-sm transition-all duration-150 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingNotes ? "Saving..." : "Save Notes"}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
