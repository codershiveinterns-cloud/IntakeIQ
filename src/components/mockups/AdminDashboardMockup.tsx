"use client";

import { useState } from "react";
import { Search, Mail, SearchX } from "lucide-react";

interface CaseItem {
  id: string;
  clientName: string;
  firmName: string;
  template: string;
  stage: "Drafting" | "Awaiting Client" | "Under Review" | "Approved";
  progress: number;
  docsRemaining: number;
  lastUpdated: string;
}

export default function AdminDashboardMockup() {
  const [selectedStage, setSelectedStage] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const cases: CaseItem[] = [
    {
      id: "CAS-1041",
      clientName: "Apex Global Holdings LLC",
      firmName: "Summit Advisory",
      template: "Corporate Tax Intake",
      stage: "Under Review",
      progress: 85,
      docsRemaining: 1,
      lastUpdated: "12 mins ago",
    },
    {
      id: "CAS-1042",
      clientName: "Vanguard Maritime Partners",
      firmName: "Sterling Legal",
      template: "M&A Diligence Checklist",
      stage: "Awaiting Client",
      progress: 40,
      docsRemaining: 4,
      lastUpdated: "1 hour ago",
    },
    {
      id: "CAS-1043",
      clientName: "Beacon Wealth Family Trust",
      firmName: "Summit Advisory",
      template: "Estate Planning Packet",
      stage: "Approved",
      progress: 100,
      docsRemaining: 0,
      lastUpdated: "Yesterday",
    },
    {
      id: "CAS-1044",
      clientName: "Kinetics Digital Media",
      firmName: "Sterling Legal",
      template: "Commercial Retainer",
      stage: "Drafting",
      progress: 10,
      docsRemaining: 6,
      lastUpdated: "2 days ago",
    },
  ];

  const filteredCases = cases.filter((c) => {
    const matchesStage = selectedStage === "All" || c.stage === selectedStage;
    const matchesQuery =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.firmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.template.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesQuery;
  });

  const getStageBadge = (stage: CaseItem["stage"]) => {
    switch (stage) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Under Review":
        return "bg-brand-50 text-brand-700 border-brand-200";
      case "Awaiting Client":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Drafting":
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-mockup border border-slate-200/80 overflow-hidden font-sans text-left">
      {/* Mockup Header */}
      <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-slate-500 text-xs hidden sm:inline ml-2">|</span>
          <span className="font-semibold text-slate-200 text-xs">
            Admin Central: <span className="text-slate-400 font-normal">Cross-Firm Case Tracking Pipeline</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
          <Mail className="w-3.5 h-3.5 text-brand-400" />
          <span className="hidden sm:inline">Status Email Alerts: </span>
          <span className="text-emerald-400 font-medium">Active</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search client, case ID, firm..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-800 placeholder:text-slate-400 transition-colors duration-150 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Stage Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["All", "Drafting", "Awaiting Client", "Under Review", "Approved"].map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 ${
                selectedStage === stage
                  ? "bg-brand-500 text-white font-semibold shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Case Rows */}
      <div className="divide-y divide-slate-200 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-2.5 px-4 font-semibold">Case & Client</th>
              <th className="py-2.5 px-4 font-semibold hidden md:table-cell">Intake Template</th>
              <th className="py-2.5 px-4 font-semibold">Stage</th>
              <th className="py-2.5 px-4 font-semibold">Progress</th>
              <th className="py-2.5 px-4 font-semibold text-right">Last Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredCases.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 px-4">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <SearchX className="w-10 h-10 text-brand-200" />
                    <p className="text-xs font-semibold text-slate-600">
                      No cases match your search or filter.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedStage("All");
                      }}
                      className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 active:bg-brand-200 rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                    >
                      Clear filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {filteredCases.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/60 transition-colors duration-150">
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-800">{c.clientName}</div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                    <span>{c.id}</span>
                    <span>•</span>
                    <span className="text-slate-600">{c.firmName}</span>
                  </div>
                </td>
                <td className="py-3 px-4 hidden md:table-cell text-slate-600">
                  {c.template}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getStageBadge(c.stage)}`}>
                    {c.stage}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="w-28">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>{c.progress}%</span>
                      {c.docsRemaining > 0 ? (
                        <span>{c.docsRemaining} left</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">All In</span>
                      )}
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          c.progress === 100 ? "bg-emerald-500" : "bg-brand-500"
                        }`}
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-slate-500 text-[11px] whitespace-nowrap">
                  {c.lastUpdated}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-50 p-2.5 border-t border-slate-200 text-center text-xs text-slate-500">
        Showing {filteredCases.length} active client cases • Real-time status sync enabled
      </div>
    </div>
  );
}
