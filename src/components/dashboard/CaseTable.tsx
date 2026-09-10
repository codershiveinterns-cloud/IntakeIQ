"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClientCase } from "@/lib/types";
import StatusBadge from "../shared/StatusBadge";
import { useTenant } from "@/lib/context/TenantContext";
import { useAuth } from "@/lib/context/AuthContext";
import { hasPermission } from "@/lib/auth/permissions";
import { useToast } from "@/components/shared/ToastProvider";
import {
  FileText,
  ExternalLink,
  ChevronRight,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Plus
} from "lucide-react";

interface CaseTableProps {
  cases: ClientCase[];
  onRefresh?: () => void;
}

export default function CaseTable({ cases }: CaseTableProps) {
  const { currentFirm } = useTenant();
  const { role } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyPortalLink = (c: ClientCase, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const portalUrl = `${window.location.origin}/portal/${currentFirm?.slug || "apex-advisory"}/${c.id}`;
    navigator.clipboard
      .writeText(portalUrl)
      .then(() => {
        setCopiedId(c.id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => {
        toast.error("Couldn't copy the portal link. Please copy it manually.");
      });
  };

  if (cases.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-800">No cases match criteria</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Try adjusting your search query or status filter, or create a new case to get started.
        </p>
        {hasPermission(role, "cases:create") && (
          <Link
            href="/dashboard/cases/new"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:brightness-110 rounded-lg shadow-sm transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Case</span>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Client & Case</th>
              <th className="py-3 px-4">Stage / Status</th>
              <th className="py-3 px-4">Document Checklist</th>
              <th className="py-3 px-4">Form Intake</th>
              <th className="py-3 px-4">Assigned Reviewer</th>
              <th className="py-3 px-4 text-right">Last Updated</th>
              <th className="py-3 px-4 text-right">Portal & Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {cases.map((c) => {
              const totalDocs = c.checklist.length;
              const approvedDocs = c.checklist.filter((i) => i.status === "Approved").length;
              const uploadedDocs = c.checklist.filter((i) => i.status === "Uploaded").length;
              const rejectedDocs = c.checklist.filter((i) => i.status === "Rejected").length;
              const isFormDone = Boolean(c.formSubmittedAt);

              const docProgressPercent =
                totalDocs > 0 ? Math.round((approvedDocs / totalDocs) * 100) : 0;

              return (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/dashboard/cases/${c.id}`)}
                  className="h-12 hover:bg-brand-50/50 transition-colors duration-150 group cursor-pointer"
                >
                  {/* Client & Case Details */}
                  <td className="py-3.5 px-4">
                    <Link href={`/dashboard/cases/${c.id}`} className="block">
                      <div className="font-semibold text-slate-900 group-hover:text-brand-600 transition text-sm">
                        {c.clientName}
                      </div>
                      <div className="text-xs text-slate-500 font-medium truncate max-w-xs">
                        {c.clientCompany ? `${c.clientCompany} • ` : ""}
                        <span className="text-slate-600">{c.title}</span>
                      </div>
                    </Link>
                  </td>

                  {/* Stage / Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={c.status} size="sm" />
                  </td>

                  {/* Document Checklist Progress */}
                  <td className="py-3.5 px-4">
                    <div className="min-w-[140px]">
                      <div className="flex items-center justify-between text-[11px] mb-1 font-medium">
                        <span className="text-slate-600">
                          {approvedDocs}/{totalDocs} Approved
                        </span>
                        {rejectedDocs > 0 ? (
                          <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                            <AlertCircle className="w-3 h-3" /> {rejectedDocs} Rejected
                          </span>
                        ) : uploadedDocs > 0 ? (
                          <span className="text-sky-600 font-semibold">
                            {uploadedDocs} Pending Review
                          </span>
                        ) : (
                          <span className="text-slate-400">{docProgressPercent}%</span>
                        )}
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-emerald-500"
                          style={{ width: `${docProgressPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Form Intake */}
                  <td className="py-3.5 px-4">
                    {isFormDone ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Submitted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200">
                        <Clock className="w-3 h-3" /> Incomplete
                      </span>
                    )}
                  </td>

                  {/* Assigned Reviewer */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.assignedToName || "Unassigned"}</span>
                    </div>
                  </td>

                  {/* Last Updated */}
                  <td className="py-3.5 px-4 text-right text-slate-500 whitespace-nowrap">
                    {new Date(c.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => copyPortalLink(c, e)}
                        title="Copy Client Portal URL"
                        aria-label="Copy client portal URL"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        {copiedId === c.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <Link
                        href={`/portal/${currentFirm?.slug || "apex-advisory"}/${c.id}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        title="Open Portal as Client"
                        aria-label="Open portal as client in new tab"
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        href={`/dashboard/cases/${c.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        <span>Review</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
