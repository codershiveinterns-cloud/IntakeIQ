"use client";

import PermissionGate from "@/components/shared/PermissionGate";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useTenant } from "@/lib/context/TenantContext";
import { DataStore } from "@/lib/store/dataStore";
import { AuditLogEntry } from "@/lib/types";
import Link from "next/link";
import { FeatureGate, useFirmPlan } from "@/components/shared/FeatureGate";
import {
  ShieldAlert,
  Search,
  Filter,
  Calendar,
  User,
  ShieldCheck,
  FileCheck2,
  Lock,
  ClipboardList,
  X,
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

function AuditTrailPageInner() {
  const { currentFirm } = useTenant();
  const { can } = useFirmPlan();
  const exportUnlocked = can("audit_export");
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState("ALL");

  const refreshLogs = () => {
    if (!currentFirm) return;
    DataStore.initSeedData();
    const list = DataStore.getAuditLogs(currentFirm.id);
    setLogs(list);
  };

  useEffect(() => {
    refreshLogs();
  }, [currentFirm?.id]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.targetEntity.toLowerCase().includes(search.toLowerCase()) ||
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(search.toLowerCase()));

    const matchesAction = selectedAction === "ALL" || log.action.includes(selectedAction);

    return matchesSearch && matchesAction;
  });

  const hasActiveFilters = search.trim().length > 0 || selectedAction !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setSelectedAction("ALL");
  };

  const handleExportCSV = () => {
    const csv = DataStore.auditLogsToCSV(filteredLogs);
    downloadTextFile(`intakeiq-audit-log-${currentFirm?.slug || "firm"}.csv`, csv, "text/csv;charset=utf-8;");
  };

  const handleExportJSON = () => {
    downloadTextFile(
      `intakeiq-audit-log-${currentFirm?.slug || "firm"}.json`,
      JSON.stringify(filteredLogs, null, 2),
      "application/json"
    );
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes("Approved")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (action.includes("Rejected")) return "bg-rose-50 text-rose-700 border-rose-200";
    if (action.includes("Submitted")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (action.includes("Uploaded")) return "bg-sky-50 text-sky-700 border-sky-200";
    if (action.includes("Created") || action.includes("Invited")) return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <FeatureGate feature="audit_trail">
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Firm Audit Trail
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <Lock className="w-3 h-3" /> Immutable Log
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Every submission, upload, review decision, status update, and team invitation is cryptographically logged.
          </p>
        </div>

        {exportUnlocked ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredLogs.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-xs transition-all duration-150 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              disabled={filteredLogs.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-xs transition-all duration-150 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export JSON</span>
            </button>
          </div>
        ) : (
          <Link
            href="/dashboard/billing?feature=audit_export"
            title="Audit & compliance export is included in the Enterprise plan"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Export · Enterprise</span>
          </Link>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, target entity, actor..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none transition"
          >
            <option value="ALL">All Actions</option>
            <option value="Created">Case / Firm Created</option>
            <option value="Submitted">Form Submitted</option>
            <option value="Uploaded">Document Uploaded</option>
            <option value="Approved">Document Approved</option>
            <option value="Rejected">Document Rejected</option>
            <option value="Status">Status Changed</option>
            <option value="Invited">Team / Client Invited</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <X className="w-3 h-3" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Timestamp (UTC)</th>
              <th className="py-3 px-4">Action Type</th>
              <th className="py-3 px-4">Target Entity / Context</th>
              <th className="py-3 px-4">Actor & Role</th>
              <th className="py-3 px-4">Audit Details & Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <ClipboardList className="w-12 h-12 text-slate-200" />
                    {logs.length === 0 ? (
                      <p className="text-slate-500">No audit log entries yet — activity across your firm will appear here as it happens.</p>
                    ) : (
                      <>
                        <p className="text-slate-500">No audit log entries matching your search.</p>
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Clear filters</span>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                    {log.targetEntity}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800">{log.actorName}</div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{log.actorRole}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-md">
                    {log.details || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}

export default function AuditTrailPage() {
  return (
    <PermissionGate permission="audit:view">
      <AuditTrailPageInner />
    </PermissionGate>
  );
}
