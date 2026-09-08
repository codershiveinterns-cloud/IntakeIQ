"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { useTenant } from "@/lib/context/TenantContext";
import { DataStore } from "@/lib/store/dataStore";
import { ClientCase, CaseStatus } from "@/lib/types";
import CaseTable from "@/components/dashboard/CaseTable";
import CaseKanban from "@/components/dashboard/CaseKanban";
import { useToast } from "@/components/shared/ToastProvider";
import { useFirmPlan, LockedFeatureCard } from "@/components/shared/FeatureGate";
import {
  FolderKanban,
  PlusCircle,
  Search,
  Filter,
  LayoutGrid,
  List,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  Lock,
  Users
} from "lucide-react";

export default function DashboardPage() {
  const { currentUser, role } = useAuth();
  const { currentFirm } = useTenant();
  const toast = useToast();
  const { can } = useFirmPlan();
  const kanbanUnlocked = can("kanban_board");
  const [showKanbanUpsell, setShowKanbanUpsell] = useState(false);

  const [cases, setCases] = useState<ClientCase[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  const refreshCases = () => {
    if (!currentFirm) return;
    DataStore.initSeedData();
    const firmCases = DataStore.getCases(currentFirm.id);
    setCases(firmCases);
  };

  useEffect(() => {
    refreshCases();
  }, [currentFirm?.id]);

  // Filtered cases
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.clientCompany && c.clientCompany.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === "ALL" || c.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Metrics
  const totalCount = cases.length;
  const underReviewCount = cases.filter((c) => c.status === "Under Review").length;
  const pendingDocsCount = cases.filter((c) => c.status === "Documents Pending").length;
  const approvedCount = cases.filter((c) => c.status === "Approved").length;

  return (
    <div className="space-y-6">
      {/* Top Header & New Case Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Client Cases & Onboarding
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage client onboarding workflows, dynamic questionnaires, and document verification.
          </p>
        </div>

        {(role === "Admin" || role === "CaseManager") && (
          <Link
            href="/dashboard/cases/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all duration-150 ease-out hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 self-start sm:self-auto"
            style={{ backgroundColor: currentFirm?.primaryColor || "#0066FF" }}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Case</span>
          </Link>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1 transition-all duration-150 ease-out hover:shadow-dropdown hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Active Cases</span>
            <FolderKanban className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalCount}</p>
          <p className="text-[10px] text-slate-400">Across all onboarding stages</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1 transition-all duration-150 ease-out hover:shadow-dropdown hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Under Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600">{underReviewCount}</p>
          <p className="text-[10px] text-slate-400">Awaiting staff verification</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1 transition-all duration-150 ease-out hover:shadow-dropdown hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Docs Pending</span>
            <AlertCircle className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-600">{pendingDocsCount}</p>
          <p className="text-[10px] text-slate-400">Awaiting client uploads</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1 transition-all duration-150 ease-out hover:shadow-dropdown hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Approved / Closed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{approvedCount}</p>
          <p className="text-[10px] text-slate-400">Fully onboarded clients</p>
        </div>
      </div>

      {/* Search, Filter Bar & View Toggle */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, company, title..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs transition-all duration-150 ease-out focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {/* Filters & View Switcher */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter cases by status"
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Stages</option>
              <option value="Invited">Invited</option>
              <option value="Form Submitted">Form Submitted</option>
              <option value="Documents Pending">Documents Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Table / Kanban View Toggle */}
          <div role="group" aria-label="Switch case view" className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode("table")}
              title="Table View"
              aria-label="Table View"
              aria-pressed={viewMode === "table"}
              className={`p-2.5 rounded transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (!kanbanUnlocked) {
                  setShowKanbanUpsell(true);
                  toast.info("The Kanban pipeline board is included in the Professional plan.");
                  return;
                }
                setViewMode("kanban");
              }}
              title={kanbanUnlocked ? "Kanban Board View" : "Kanban Board View — Professional plan"}
              aria-label="Kanban Board View"
              aria-pressed={viewMode === "kanban" && kanbanUnlocked}
              className={`relative p-2.5 rounded transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                viewMode === "kanban" && kanbanUnlocked ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              {!kanbanUnlocked && (
                <Lock className="w-2.5 h-2.5 text-amber-500 absolute top-1 right-1" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Kanban upsell (shown after a locked toggle click) */}
      {showKanbanUpsell && !kanbanUnlocked && (
        <LockedFeatureCard feature="kanban_board" compact />
      )}

      {/* Case Content View (Table vs Kanban) */}
      {viewMode === "table" || !kanbanUnlocked ? (
        <CaseTable cases={filteredCases} onRefresh={refreshCases} />
      ) : (
        <CaseKanban cases={filteredCases} />
      )}
    </div>
  );
}
