"use client";

import React, { useEffect, useState } from "react";
import { ChecklistItem, UserProfile, DocStatus } from "@/lib/types";
import StatusBadge from "../shared/StatusBadge";
import VersionHistoryModal from "./VersionHistoryModal";
import { useToast } from "@/components/shared/ToastProvider";
import { LockedFeatureCard } from "@/components/shared/FeatureGate";
import {
  FileCheck,
  CheckCircle,
  XCircle,
  History,
  Download,
  AlertCircle,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  Minus
} from "lucide-react";

interface DocumentChecklistReviewProps {
  checklist: ChecklistItem[];
  reviewer: UserProfile | null;
  onReview: (checklistItemId: string, status: "Approved" | "Rejected", reason?: string) => void;
  readOnly?: boolean;
  /** Whether the firm's plan includes AI extraction; locked firms see an upgrade prompt instead of the panel. */
  aiExtractionUnlocked?: boolean;
}

export default function DocumentChecklistReview({
  checklist,
  reviewer,
  onReview,
  readOnly = false,
  aiExtractionUnlocked = true,
}: DocumentChecklistReviewProps) {
  const toast = useToast();
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ChecklistItem | null>(null);
  const [rejectingItemId, setRejectingItemId] = useState<string | null>(null);

  // Escape closes the rejection dialog from anywhere, not only when the backdrop has focus.
  useEffect(() => {
    if (!rejectingItemId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRejectingItemId(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [rejectingItemId]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reasonError, setReasonError] = useState(false);

  const handleOpenRejectModal = (itemId: string) => {
    const existing = checklist.find((i) => i.id === itemId);
    setRejectingItemId(itemId);
    setRejectionReason(existing?.rejectionReason || "");
    setReasonError(false);
  };

  const handleConfirmReject = () => {
    if (!rejectingItemId) return;
    if (!rejectionReason.trim()) {
      setReasonError(true);
      toast.error("Please provide a reason for rejecting this document.");
      return;
    }
    onReview(rejectingItemId, "Rejected", rejectionReason.trim());
    setRejectingItemId(null);
    setRejectionReason("");
    setReasonError(false);
    toast.success("Document rejected. The client has been notified to re-upload.");
  };

  const handleApprove = (itemId: string) => {
    onReview(itemId, "Approved");
    toast.success("Document approved.");
  };

  if (checklist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-white border border-dashed border-slate-200 rounded-xl">
        <FileCheck className="w-12 h-12 text-brand-200 mb-3" />
        <p className="text-sm font-semibold text-slate-700">No documents requested for this case</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Once checklist requirements are added to this case, uploaded files will appear here for your review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {checklist.map((item) => {
        const latestVersion = item.versions && item.versions.length > 0
          ? item.versions[item.versions.length - 1]
          : null;

        return (
          <div
            key={item.id}
            className={`p-4 rounded-xl border transition shadow-sm ${
              item.status === "Approved"
                ? "bg-emerald-50/30 border-emerald-200"
                : item.status === "Rejected"
                ? "bg-rose-50/30 border-rose-200"
                : item.status === "Uploaded"
                ? "bg-sky-50/30 border-sky-200"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {item.name}
                  </h4>
                  {item.required ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded">
                      Required
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded">
                      Optional
                    </span>
                  )}
                  <StatusBadge status={item.status} size="sm" />
                </div>
                {item.description && (
                  <p className="text-xs text-slate-500">{item.description}</p>
                )}
              </div>

              {/* Version History Button */}
              {item.versions && item.versions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedHistoryItem(item)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 active:scale-[0.98] rounded-lg border border-slate-200 shadow-sm transition-all duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Version History ({item.versions.length})</span>
                </button>
              )}
            </div>

            {/* Current File Information */}
            {latestVersion ? (
              <div className="p-3 bg-white rounded-lg border border-slate-200/80 my-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-brand-50 text-brand-600 rounded-lg flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      {latestVersion.fileName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {(latestVersion.fileSize / (1024 * 1024)).toFixed(2)} MB • Uploaded by{" "}
                      {latestVersion.uploadedBy} on{" "}
                      {new Date(latestVersion.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <a
                  href={latestVersion.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 active:scale-[0.98] rounded-lg transition-all duration-150 border border-brand-200 whitespace-nowrap self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>View File</span>
                </a>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 flex items-center gap-2 my-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Client has not uploaded a document yet.</span>
              </div>
            )}

            {/* AI Extraction — locked on plans without the feature */}
            {!aiExtractionUnlocked && latestVersion && (
              <LockedFeatureCard feature="ai_extraction" compact className="my-2" />
            )}

            {/* AI Extraction & Cross-Check Panel */}
            {item.extraction && aiExtractionUnlocked && (
              <div
                className={`p-3 rounded-lg border my-2 space-y-2 ${
                  item.extraction.confidence >= 85
                    ? "bg-emerald-50/50 border-emerald-200"
                    : item.extraction.confidence >= 70
                    ? "bg-amber-50/50 border-amber-200"
                    : "bg-rose-50/50 border-rose-200"
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                    <span>AI Extraction — {item.extraction.documentType}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.extraction.confidence >= 85
                        ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                        : item.extraction.confidence >= 70
                        ? "bg-amber-100 text-amber-700 border-amber-300"
                        : "bg-rose-100 text-rose-700 border-rose-300"
                    }`}
                  >
                    {item.extraction.confidence}% confidence
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {item.extraction.fields.map((f) => (
                    <div
                      key={f.label}
                      className="flex items-center justify-between gap-2 text-[11px] bg-white/70 rounded px-2 py-1.5 border border-slate-200/60"
                    >
                      <span className="text-slate-500 truncate">{f.label}</span>
                      <span className="flex items-center gap-1 font-medium text-slate-800 shrink-0">
                        <span className="truncate max-w-[100px]">{f.value}</span>
                        {f.status === "match" && <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />}
                        {f.status === "mismatch" && <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />}
                        {f.status === "unverified" && <Minus className="w-3 h-3 text-slate-300 shrink-0" />}
                      </span>
                    </div>
                  ))}
                </div>

                <p
                  className={`text-[11px] font-medium ${
                    item.extraction.fields.some((f) => f.status === "mismatch") ? "text-rose-700" : "text-slate-600"
                  }`}
                >
                  {item.extraction.crossCheckSummary}
                </p>
              </div>
            )}

            {/* Rejection Note Display */}
            {item.status === "Rejected" && item.rejectionReason && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1 my-2">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Rejection Feedback Sent to Client:</span>
                </div>
                <p className="pl-5 text-[11px] italic">"{item.rejectionReason}"</p>
              </div>
            )}

            {/* Approval Info Display */}
            {item.status === "Approved" && item.approvedBy && (
              <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 pt-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Approved by {item.approvedBy} on{" "}
                  {item.approvedAt ? new Date(item.approvedAt).toLocaleDateString() : "recent"}
                </span>
              </div>
            )}

            {/* Reviewer Action Buttons (Approved / Rejected) */}
            {!readOnly && latestVersion && (
              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleOpenRejectModal(item.id)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 font-semibold rounded-lg transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                    item.status === "Rejected"
                      ? "bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200"
                      : "bg-white hover:bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{item.status === "Rejected" ? "Update Rejection" : "Reject Document"}</span>
                </button>

                <button
                  type="button"
                  disabled={item.status === "Approved"}
                  onClick={() => handleApprove(item.id)}
                  title={item.status === "Approved" ? "This document has already been approved" : undefined}
                  className={`inline-flex items-center gap-1 px-3.5 py-1.5 font-semibold rounded-lg shadow-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                    item.status === "Approved"
                      ? "bg-emerald-600 text-white opacity-50 cursor-not-allowed"
                      : "bg-emerald-600 hover:brightness-110 active:scale-[0.98] text-white"
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{item.status === "Approved" ? "Approved ✓" : "Approve Document"}</span>
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={Boolean(selectedHistoryItem)}
        item={selectedHistoryItem}
        onClose={() => setSelectedHistoryItem(null)}
      />

      {/* Rejection Feedback Modal */}
      {rejectingItemId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setRejectingItemId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-doc-modal-title"
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h3 id="reject-doc-modal-title" className="text-sm font-bold text-slate-900">
                Reject Document & Request Re-upload
              </h3>
            </div>

            <p className="text-xs font-semibold text-slate-800 -mt-2">
              {checklist.find((i) => i.id === rejectingItemId)?.name}
            </p>

            <p className="text-xs text-slate-600">
              Provide specific feedback explaining why this document cannot be accepted (e.g. illegible scan, missing pages, expired ID). This will be emailed to the client and displayed on their portal.
            </p>

            <div>
              <label htmlFor="rejection-reason-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Rejection Reason / Guidance <span className="text-rose-500">*</span>
              </label>
              <textarea
                  autoFocus
                id="rejection-reason-input"
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (reasonError && e.target.value.trim()) setReasonError(false);
                }}
                placeholder="e.g. The uploaded scan is cut off on the bottom right and the signature is not legible. Please upload a full page scan..."
                aria-invalid={reasonError}
                className={`w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:outline-none transition-all duration-150 ${
                  reasonError
                    ? "border-rose-500 focus:ring-rose-500"
                    : "border-slate-300 focus:ring-rose-500"
                }`}
              />
              {reasonError && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">
                  A reason is required so the client knows what to correct.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingItemId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-lg shadow-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
              >
                Confirm Rejection & Notify Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
