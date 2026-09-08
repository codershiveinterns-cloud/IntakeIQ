"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTenant } from "@/lib/context/TenantContext";
import { DataStore } from "@/lib/store/dataStore";
import { ClientCase, CaseStatus } from "@/lib/types";
import { FeatureGate } from "@/components/shared/FeatureGate";
import {
  BarChart3,
  FolderKanban,
  CheckCircle2,
  Clock,
  FileCheck2,
  Sparkles,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

const STATUS_ORDER: CaseStatus[] = [
  "Invited",
  "Form Submitted",
  "Documents Pending",
  "Under Review",
  "Approved",
  "Rejected",
];

const STATUS_COLORS: Record<CaseStatus, string> = {
  Invited: "bg-slate-400",
  "Form Submitted": "bg-blue-400",
  "Documents Pending": "bg-indigo-400",
  "Under Review": "bg-amber-400",
  Approved: "bg-emerald-500",
  Rejected: "bg-rose-500",
};

interface FlaggedDoc {
  caseId: string;
  caseTitle: string;
  clientName: string;
  docName: string;
  confidence: number;
  summary: string;
}

export default function AnalyticsPage() {
  const { currentFirm } = useTenant();
  const [cases, setCases] = useState<ClientCase[]>([]);

  useEffect(() => {
    if (!currentFirm) return;
    DataStore.initSeedData();
    setCases(DataStore.getCases(currentFirm.id));
  }, [currentFirm?.id]);

  const totalCases = cases.length;
  const approvedCases = cases.filter((c) => c.status === "Approved").length;
  const approvalRate = totalCases > 0 ? Math.round((approvedCases / totalCases) * 100) : 0;

  const turnaroundDays = cases
    .filter((c) => c.status === "Approved")
    .map((c) => Math.max(0, Math.round((new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / 86400000)));
  const avgTurnaround = turnaroundDays.length > 0 ? Math.round(turnaroundDays.reduce((a, b) => a + b, 0) / turnaroundDays.length) : 0;

  let docsApproved = 0;
  let docsTotal = 0;
  const confidences: number[] = [];
  const flaggedDocs: FlaggedDoc[] = [];

  cases.forEach((c) => {
    c.checklist.forEach((item) => {
      docsTotal++;
      if (item.status === "Approved") docsApproved++;
      if (item.extraction) {
        confidences.push(item.extraction.confidence);
        if (item.extraction.fields.some((f) => f.status === "mismatch")) {
          flaggedDocs.push({
            caseId: c.id,
            caseTitle: c.title,
            clientName: c.clientName,
            docName: item.name,
            confidence: item.extraction.confidence,
            summary: item.extraction.crossCheckSummary,
          });
        }
      }
    });
  });

  const avgConfidence = confidences.length > 0 ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length) : 0;

  const statusCounts = STATUS_ORDER.map((status) => ({
    status,
    count: cases.filter((c) => c.status === status).length,
  }));
  const maxStatusCount = Math.max(1, ...statusCounts.map((s) => s.count));

  // Group by the stable assignedTo user id rather than the freeform display
  // name string — case records aren't guaranteed to store the same name
  // formatting (e.g. seed data has both "Eleanor Vance" and "Eleanor Vance
  // (Partner / Admin)" for the same person), which would otherwise split one
  // reviewer's workload across two bars.
  const workloadMap: Record<string, { name: string; count: number }> = {};
  cases.forEach((c) => {
    const key = c.assignedTo || c.assignedToName || "unassigned";
    const displayName = (c.assignedTo && DataStore.getUserById(c.assignedTo)?.name) || c.assignedToName || "Unassigned";
    if (!workloadMap[key]) workloadMap[key] = { name: displayName, count: 0 };
    workloadMap[key].count += 1;
  });
  const workload = Object.values(workloadMap)
    .map(({ name, count }): [string, number] => [name, count])
    .sort((a, b) => b[1] - a[1]);
  const maxWorkload = Math.max(1, ...workload.map(([, n]) => n));

  const monthBuckets: { key: string; label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    monthBuckets.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("default", { month: "short" }),
      count: 0,
    });
  }
  cases.forEach((c) => {
    const d = new Date(c.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = monthBuckets.find((b) => b.key === key);
    if (bucket) bucket.count++;
  });
  const maxMonthCount = Math.max(1, ...monthBuckets.map((b) => b.count));

  const kpis = [
    { label: "Total Active Cases", value: totalCases, icon: FolderKanban, color: "text-brand-600" },
    { label: "Approval Rate", value: `${approvalRate}%`, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "Avg. Turnaround", value: `${avgTurnaround}d`, icon: Clock, color: "text-amber-600" },
    { label: "Documents Processed", value: `${docsApproved}/${docsTotal}`, icon: FileCheck2, color: "text-indigo-600" },
    { label: "AI Extraction Confidence", value: confidences.length > 0 ? `${avgConfidence}%` : "—", icon: Sparkles, color: "text-brand-600" },
    { label: "Cross-Check Flags", value: flaggedDocs.length, icon: AlertTriangle, color: flaggedDocs.length > 0 ? "text-rose-600" : "text-slate-400" },
  ];

  return (
    <FeatureGate feature="analytics">
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Firm Analytics</h1>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
            <BarChart3 className="w-3 h-3" /> Live
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time pipeline health, review velocity, and AI extraction quality across every client case.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1 transition-all duration-150 ease-out hover:shadow-dropdown hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-semibold uppercase tracking-wider">{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <p className={`text-2xl font-extrabold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Status Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Case Status Breakdown</h3>
          <div className="space-y-3">
            {statusCounts.map(({ status, count }) => (
              <div key={status} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{status}</span>
                  <span className="font-bold text-slate-900">{count}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${STATUS_COLORS[status]}`}
                    style={{ width: `${(count / maxStatusCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cases Created Over Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">New Cases (Last 6 Months)</h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {monthBuckets.map((b) => (
              <div key={b.key} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[11px] font-bold text-slate-700">{b.count}</span>
                <div
                  className="w-full max-w-[32px] bg-brand-400 hover:bg-brand-500 rounded-t-md transition-all duration-300"
                  style={{ height: `${Math.max(4, (b.count / maxMonthCount) * 100)}%` }}
                />
                <span className="text-[10px] text-slate-500 font-medium">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Workload */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Team Workload</h3>
          {workload.length === 0 ? (
            <p className="text-xs text-slate-500">No cases assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {workload.map(([name, count]) => (
                <div key={name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate">{name}</span>
                    <span className="font-bold text-slate-900">{count}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${(count / maxWorkload) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Cross-Check Flags */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-600" />
            AI Extraction — Flagged for Review
          </h3>
          {flaggedDocs.length === 0 ? (
            <p className="text-xs text-slate-500">No cross-check mismatches detected — everything extracted cleanly.</p>
          ) : (
            <div className="space-y-2">
              {flaggedDocs.slice(0, 6).map((f, idx) => (
                <Link
                  key={`${f.caseId}-${idx}`}
                  href={`/dashboard/cases/${f.caseId}`}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-colors duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{f.docName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{f.clientName} • {f.caseTitle}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                      {f.confidence}%
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}
