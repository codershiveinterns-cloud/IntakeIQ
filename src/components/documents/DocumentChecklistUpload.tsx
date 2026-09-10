"use client";

import React, { useState, useRef } from "react";
import { ChecklistItem } from "@/lib/types";
import StatusBadge from "../shared/StatusBadge";
import VersionHistoryModal from "./VersionHistoryModal";
import { useToast } from "@/components/shared/ToastProvider";
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  Clock,
  History,
  FileText,
  Download,
  RefreshCw,
  Sparkles
} from "lucide-react";

interface DocumentChecklistUploadProps {
  checklist: ChecklistItem[];
  clientName: string;
  onUpload: (checklistItemId: string, fileInfo: { fileName: string; fileUrl: string; fileSize: number; fileType: string }) => void;
  brandColor?: string;
  readOnly?: boolean;
  /** Whether the firm's plan includes AI extraction (controls the "automatically scanned" note). */
  aiExtractionUnlocked?: boolean;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

export default function DocumentChecklistUpload({
  checklist,
  clientName,
  onUpload,
  brandColor = "#0066FF",
  readOnly = false,
  aiExtractionUnlocked = true,
}: DocumentChecklistUploadProps) {
  const toast = useToast();
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ChecklistItem | null>(null);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileSelected = (itemId: string, file: File) => {
    if (uploadingItemId === itemId) return; // prevent double-submit while an upload is in flight

    // Validation
    if (file.size > MAX_FILE_SIZE) {
      const msg = `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB — the limit is 25MB.`;
      setUploadErrors((prev) => ({ ...prev, [itemId]: msg }));
      toast.error(`File "${file.name}" exceeds the maximum allowed size of 25MB.`);
      return;
    }

    const lowerName = file.name.toLowerCase();
    const isValidType =
      ALLOWED_MIME_TYPES.includes(file.type) ||
      [".pdf", ".png", ".jpg", ".jpeg", ".docx", ".doc"].some((ext) => lowerName.endsWith(ext));

    if (!isValidType) {
      const msg = "Invalid file format. Please upload a PDF, JPG, PNG, DOC, or DOCX.";
      setUploadErrors((prev) => ({ ...prev, [itemId]: msg }));
      toast.error("Invalid file format. Please upload PDF, JPG, PNG, DOC, or DOCX documents.");
      return;
    }

    setUploadErrors((prev) => {
      if (!prev[itemId]) return prev;
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    setUploadingItemId(itemId);

    // Simulate a realistic upload. Small files are kept as data URLs so their
    // preview links survive a reload; larger ones use a session-only object
    // URL to stay well inside the browser's localStorage quota.
    const DURABLE_PREVIEW_LIMIT = 400 * 1024;
    const finish = (fileUrl: string) => {
      onUpload(itemId, {
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        fileType: file.type || "application/octet-stream",
      });
    };
    const resolveUrl = (): Promise<string> =>
      new Promise((resolve) => {
        if (file.size > DURABLE_PREVIEW_LIMIT) return resolve(URL.createObjectURL(file));
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : URL.createObjectURL(file));
        reader.onerror = () => resolve(URL.createObjectURL(file));
        reader.readAsDataURL(file);
      });
    setTimeout(async () => {
      const simulatedUrl = await resolveUrl();
      finish(simulatedUrl);
      setUploadingItemId(null);
    }, 800);
  };

  if (checklist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-white border border-dashed border-slate-200 rounded-xl">
        <FileCheck className="w-12 h-12 text-brand-200 mb-3" />
        <p className="text-sm font-semibold text-slate-700">No documents required for this case</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Your firm hasn't requested any documents yet. Check back later or contact your case manager if you expect an upload step here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {checklist.map((item) => {
        const isUploading = uploadingItemId === item.id;
        const isDragOver = dragOverItemId === item.id;
        const latestVersion = item.versions && item.versions.length > 0 
          ? item.versions[item.versions.length - 1] 
          : null;

        return (
          <div
            key={item.id}
            className={`p-4 sm:p-5 rounded-2xl border transition shadow-sm ${
              item.status === "Approved"
                ? "bg-emerald-50/40 border-emerald-200"
                : item.status === "Rejected"
                ? "bg-rose-50/40 border-rose-300 ring-1 ring-rose-200"
                : item.status === "Uploaded"
                ? "bg-sky-50/40 border-sky-200"
                : "bg-white border-slate-200"
            }`}
          >
            {/* Header / Requirement Details */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                  {item.required ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded">
                      Required
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded">
                      Optional
                    </span>
                  )}
                  <StatusBadge status={item.status} size="sm" />
                </div>
                {item.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                )}
              </div>

              {/* Version History Button */}
              {item.versions && item.versions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedHistoryItem(item)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 active:scale-[0.98] rounded-lg border border-slate-200 shadow-sm transition-all duration-150 whitespace-nowrap self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Version History ({item.versions.length})</span>
                </button>
              )}
            </div>

            {/* Rejection Alert Callout */}
            {item.status === "Rejected" && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-100/70 border border-rose-300 text-xs text-rose-900 space-y-1.5 animate-fade-in">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Reviewer Feedback — Correction Required:</span>
                </div>
                <p className="pl-5 text-xs text-rose-800 font-medium leading-relaxed">
                  "{item.rejectionReason || "Please re-upload a clear copy according to instructions."}"
                </p>
                <div className="pl-5 pt-1 text-[11px] text-rose-700">
                  Please upload a new version below to address this comment.
                </div>
              </div>
            )}

            {/* Current Upload Summary */}
            {latestVersion && (
              <div className="mb-3 p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-brand-50 text-brand-600 rounded-lg flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {latestVersion.fileName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Version {latestVersion.version} • {(latestVersion.fileSize / (1024 * 1024)).toFixed(2)} MB • Uploaded on{" "}
                      {new Date(latestVersion.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <a
                  href={latestVersion.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 active:scale-[0.98] rounded-lg border border-slate-200 transition-all duration-150 whitespace-nowrap self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download / Preview</span>
                </a>
              </div>
            )}

            {/* AI Extraction Confirmation (client-facing, no internal cross-check detail) */}
            {item.extraction && aiExtractionUnlocked && (
              <div className="mb-3 flex items-center gap-1.5 text-[11px] text-brand-700 bg-brand-50 border border-brand-200/70 rounded-lg px-2.5 py-1.5">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>
                  Automatically scanned — {item.extraction.fields.length} data field{item.extraction.fields.length === 1 ? "" : "s"} detected from your{" "}
                  {item.extraction.documentType.toLowerCase()}.
                </span>
              </div>
            )}

            {/* Upload Area / Dropzone */}
            {!readOnly && (
              <div>
                <input
                  type="file"
                  ref={(el) => {
                    fileInputRefs.current[item.id] = el;
                  }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelected(item.id, e.target.files[0]);
                      e.target.value = "";
                    }
                  }}
                  accept=".pdf,.png,.jpg,.jpeg,.docx,.doc,application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                />

                <div
                  role="button"
                  tabIndex={isUploading ? -1 : 0}
                  aria-disabled={isUploading}
                  aria-label={latestVersion ? `Upload updated version for ${item.name}` : `Choose or drag & drop a file for ${item.name}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!isUploading) setDragOverItemId(item.id);
                  }}
                  onDragLeave={() => setDragOverItemId(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverItemId(null);
                    if (isUploading) return;
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileSelected(item.id, e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => {
                    if (isUploading) return;
                    fileInputRefs.current[item.id]?.click();
                  }}
                  onKeyDown={(e) => {
                    if (isUploading) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRefs.current[item.id]?.click();
                    }
                  }}
                  className={`group border-2 border-dashed rounded-xl p-4 text-center transition-all duration-150 flex flex-col items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                    isUploading
                      ? "cursor-not-allowed opacity-75 border-slate-300 bg-slate-50/50"
                      : "cursor-pointer " +
                        (isDragOver
                          ? "border-brand-500 bg-brand-50/50"
                          : uploadErrors[item.id]
                          ? "border-rose-400 bg-rose-50/40 hover:border-rose-500"
                          : item.status === "Rejected"
                          ? "border-rose-300 bg-white hover:border-rose-400 hover:bg-rose-50/30"
                          : "border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:bg-white")
                  }`}
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 py-1 animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Encrypting & uploading document...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-brand-600" />
                        <span className="text-xs font-bold text-slate-800">
                          {latestVersion ? "Upload Updated Version" : "Choose File or Drag & Drop"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        PDF, JPG, PNG, DOC, DOCX up to 25MB • Scoped encrypted storage
                      </p>
                    </>
                  )}
                </div>
                {uploadErrors[item.id] && !isUploading && (
                  <p className="flex items-center gap-1 text-[11px] text-rose-600 font-medium mt-1.5">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{uploadErrors[item.id]}</span>
                  </p>
                )}
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
    </div>
  );
}
