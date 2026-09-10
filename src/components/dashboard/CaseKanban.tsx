"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ClientCase, CaseStatus } from "@/lib/types";
import { useTenant } from "@/lib/context/TenantContext";
import { useAuth } from "@/lib/context/AuthContext";
import { DataStore } from "@/lib/store/dataStore";
import { useToast } from "@/components/shared/ToastProvider";
import { hasPermission } from "@/lib/auth/permissions";
import {
  Building2,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  FileCheck,
  GripVertical,
} from "lucide-react";

interface CaseKanbanProps {
  cases: ClientCase[];
  onStatusChange?: (caseId: string, newStatus: CaseStatus) => void;
}

const STAGES: { status: CaseStatus; label: string; headerColor: string }[] = [
  { status: "Invited", label: "Invited", headerColor: "border-purple-500 text-purple-700 bg-purple-50/50" },
  { status: "Form Submitted", label: "Form Submitted", headerColor: "border-blue-500 text-blue-700 bg-blue-50/50" },
  { status: "Documents Pending", label: "Docs Pending", headerColor: "border-indigo-500 text-indigo-700 bg-indigo-50/50" },
  { status: "Under Review", label: "Under Review", headerColor: "border-amber-500 text-amber-700 bg-amber-50/50" },
  { status: "Approved", label: "Approved / Closed", headerColor: "border-emerald-500 text-emerald-700 bg-emerald-50/50" },
  { status: "Rejected", label: "Rejected / Fixes Needed", headerColor: "border-rose-500 text-rose-700 bg-rose-50/50" },
];

export default function CaseKanban({ cases, onStatusChange }: CaseKanbanProps) {
  const { currentFirm } = useTenant();
  const { currentUser, role } = useAuth();
  const canEdit = hasPermission(role, "cases:edit");
  const toast = useToast();

  // Optimistic per-card status overrides so dragging a card between columns
  // is reflected immediately, even though `cases` is owned by the parent.
  const [statusOverrides, setStatusOverrides] = useState<Record<string, CaseStatus>>({});
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<CaseStatus | null>(null);

  // Once the underlying case data catches up to an override, drop it.
  useEffect(() => {
    setStatusOverrides((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      let changed = false;
      const next = { ...prev };
      for (const c of cases) {
        if (next[c.id] && next[c.id] === c.status) {
          delete next[c.id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [cases]);

  const displayCases = cases.map((c) =>
    statusOverrides[c.id] ? { ...c, status: statusOverrides[c.id] } : c
  );

  const handleDrop = (status: CaseStatus) => {
    if (!canEdit) return;
    setDragOverStatus(null);
    const id = draggedId;
    setDraggedId(null);
    if (!id) return;

    const draggedCase = displayCases.find((c) => c.id === id);
    if (!draggedCase || draggedCase.status === status) return;

    DataStore.updateCase(id, { status }, currentUser || undefined);
    setStatusOverrides((prev) => ({ ...prev, [id]: status }));
    onStatusChange?.(id, status);
    toast.success(`Moved ${draggedCase.clientName} to "${status}"`);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map(({ status, label, headerColor }) => {
        const stageCases = displayCases.filter((c) => c.status === status);
        const isDropTarget = dragOverStatus === status;

        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              if (draggedId) setDragOverStatus(status);
            }}
            onDragLeave={() => setDragOverStatus((prev) => (prev === status ? null : prev))}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(status);
            }}
            className={`bg-slate-100/70 rounded-xl p-3 flex flex-col w-72 flex-shrink-0 border transition-colors duration-150 ${
              isDropTarget
                ? "border-dashed border-2 border-brand-200 bg-brand-50/40"
                : "border-slate-200"
            }`}
          >
            {/* Stage Header */}
            <div className={`p-2.5 rounded-lg border mb-3 flex items-center justify-between font-semibold text-xs ${headerColor}`}>
              <span>{label}</span>
              <span className="bg-white/80 px-2 py-0.5 rounded-full text-[11px] shadow-sm font-bold">
                {stageCases.length}
              </span>
            </div>

            {/* Cases in Column */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
              {stageCases.length === 0 ? (
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                  No cases
                </div>
              ) : (
                stageCases.map((c) => {
                  const totalDocs = c.checklist.length;
                  const approvedDocs = c.checklist.filter((i) => i.status === "Approved").length;
                  const uploadedDocs = c.checklist.filter((i) => i.status === "Uploaded").length;
                  const rejectedDocs = c.checklist.filter((i) => i.status === "Rejected").length;
                  const docProgressPercent = totalDocs > 0 ? Math.round((approvedDocs / totalDocs) * 100) : 0;
                  const isDragging = draggedId === c.id;

                  return (
                    <div
                      key={c.id}
                      draggable={canEdit}
                      onDragStart={() => setDraggedId(c.id)}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setDragOverStatus(null);
                      }}
                      className={`bg-white rounded-lg p-3.5 border shadow-card hover:shadow-dropdown hover:-translate-y-0.5 transition-all duration-150 group cursor-grab active:cursor-grabbing ${
                        isDragging ? "ring-2 ring-brand-500 scale-[1.02] opacity-90" : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1 min-w-0">
                          <GripVertical
                            className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            aria-hidden="true"
                          />
                          <Link
                            href={`/dashboard/cases/${c.id}`}
                            className="font-semibold text-xs text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                          >
                            {c.clientName}
                          </Link>
                        </div>
                        <Link
                          href={`/portal/${currentFirm?.slug || "apex-advisory"}/${c.id}`}
                          target="_blank"
                          title="Open Client Portal"
                          aria-label="Open client portal in new tab"
                          className="text-slate-400 hover:text-brand-600 hover:bg-brand-50 p-1.5 rounded transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {c.clientCompany && (
                        <p className="text-[11px] text-slate-500 font-medium mb-2 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate">{c.clientCompany}</span>
                        </p>
                      )}

                      <p className="text-[11px] text-slate-600 line-clamp-2 mb-3 bg-slate-50 p-1.5 rounded">
                        {c.title}
                      </p>

                      {/* Checklist Summary */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5">
                          <div className="flex items-center gap-1 font-medium">
                            <FileCheck className="w-3 h-3 text-slate-400" />
                            <span>Docs: {approvedDocs}/{totalDocs}</span>
                          </div>

                          {rejectedDocs > 0 ? (
                            <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                              <AlertCircle className="w-3 h-3" /> {rejectedDocs} Rejected
                            </span>
                          ) : uploadedDocs > 0 ? (
                            <span className="text-sky-600 font-semibold">
                              {uploadedDocs} Pending
                            </span>
                          ) : totalDocs === 0 ? (
                            <span className="text-slate-400 font-medium">No Docs Required</span>
                          ) : approvedDocs === totalDocs ? (
                            <span className="text-emerald-600 font-semibold">All Clear</span>
                          ) : (
                            <span className="text-slate-400 font-medium">Not Started</span>
                          )}
                        </div>
                        {totalDocs > 0 && (
                          <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 bg-emerald-500"
                              style={{ width: `${docProgressPercent}%` }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {c.assignedToName || "Unassigned"}
                        </span>
                        <Link
                          href={`/dashboard/cases/${c.id}`}
                          className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        >
                          <span>Review</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
