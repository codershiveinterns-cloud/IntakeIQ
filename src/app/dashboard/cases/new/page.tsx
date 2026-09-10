"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { useTenant } from "@/lib/context/TenantContext";
import { DataStore } from "@/lib/store/dataStore";
import { FormTemplate, ChecklistItem, UserProfile } from "@/lib/types";
import { useToast } from "@/components/shared/ToastProvider";
import { useConfirm } from "@/components/shared/ConfirmProvider";
import { hasPermission } from "@/lib/auth/permissions";
import PermissionGate from "@/components/shared/PermissionGate";
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileSpreadsheet,
  FileCheck2,
  Mail,
  UserCheck,
  Send,
  Building2,
  Sparkles,
  Loader2
} from "lucide-react";

function NewCasePageInner() {
  const router = useRouter();
  const { currentUser, role } = useAuth();
  const { currentFirm } = useTenant();
  const toast = useToast();
  const confirm = useConfirm();

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [title, setTitle] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [assignedToUserId, setAssignedToUserId] = useState("");
  
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);

  // Checklist items configuration
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: "chk-new-1",
      name: "Government Issued Photo ID / Passport",
      description: "Color scan of valid passport or state driver's license.",
      required: true,
      status: "Not Started",
      versions: [],
    },
    {
      id: "chk-new-2",
      name: "Certificate of Incorporation / Articles of Organization",
      description: "State stamped entity filing document.",
      required: true,
      status: "Not Started",
      versions: [],
    },
    {
      id: "chk-new-3",
      name: "Prior Year Tax Return or Financial Statements",
      description: "Most recent filed return or balance sheet.",
      required: false,
      status: "Not Started",
      versions: [],
    },
  ]);

  const [newChecklistName, setNewChecklistName] = useState("");
  const [newChecklistDesc, setNewChecklistDesc] = useState("");
  const [newChecklistRequired, setNewChecklistRequired] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentFirm) {
      DataStore.initSeedData();
      const tmpls = DataStore.getFormTemplates(currentFirm.id);
      setTemplates(tmpls);
      if (tmpls.length > 0) {
        setSelectedTemplateId(tmpls[0].id);
      }

      const users = DataStore.getUsers(currentFirm.id).filter((u) => u.role !== "Client");
      setTeamMembers(users);
      if (users.length > 0) {
        setAssignedToUserId(users[0].id);
      }
    }
  }, [currentFirm?.id]);

  const handleAddChecklistItem = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (!newChecklistName.trim()) return;

    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      name: newChecklistName.trim(),
      description: newChecklistDesc.trim() || undefined,
      required: newChecklistRequired,
      status: "Not Started",
      versions: [],
    };

    setChecklist([...checklist, newItem]);
    setNewChecklistName("");
    setNewChecklistDesc("");
    setNewChecklistRequired(true);
  };

  const handleRemoveChecklistItem = async (item: ChecklistItem) => {
    const ok = await confirm({
      title: "Remove document requirement?",
      message: `This removes "${item.name}" from the checklist. The client will no longer be asked to upload it.`,
      confirmLabel: "Remove",
      tone: "danger",
    });
    if (!ok) return;
    setChecklist((prev) => prev.filter(i => i.id !== item.id));
  };

  const handleToggleRequired = (index: number) => {
    setChecklist((prev) =>
      prev.map((item, i) => (i === index ? { ...item, required: !item.required } : item))
    );
  };

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentFirm) return;
    if (!clientName.trim() || !clientEmail.trim() || !title.trim()) {
      toast.error("Please fill in all required case details (Client Name, Email, Case Title).");
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);

    const assignedUser = teamMembers.find(u => u.id === assignedToUserId);

    const newCase = DataStore.createCase(
      {
        firmId: currentFirm.id,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientCompany: clientCompany.trim() || undefined,
        title: title.trim(),
        status: "Invited",
        formTemplateId: selectedTemplateId || templates[0]?.id || "",
        formResponses: {},
        checklist,
        assignedTo: assignedToUserId,
        assignedToName: assignedUser?.name || currentUser.name,
      },
      currentUser
    );

    toast.success("Case created and client invitation sent.");
    router.push(`/dashboard/cases/${newCase.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          aria-label="Back to cases"
          className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Create New Client Case
          </h1>
          <p className="text-xs text-slate-500">
            Assign questionnaire template, customize document checklist, and dispatch secure portal invite.
          </p>
        </div>
      </div>

      <form onSubmit={handleCreateCase} className="space-y-6 text-xs">
        {/* 1. Client & Case Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Client & Engagement Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Primary Contact Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Email (Invite Recipient) <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="e.g. sarah@acmecorp.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company / Organization Name (Optional)
              </label>
              <input
                type="text"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                placeholder="e.g. Acme Ventures Inc."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Case / Engagement Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Series Seed Corporate Governance & KYC"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Intake Form Template
              </label>
              {templates.length === 0 && (
                <p className="mb-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  No form templates yet — <Link href="/dashboard/forms/builder" className="font-semibold underline">create one</Link> before inviting a client.
                </p>
              )}
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.fields.length} questions)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Case Manager / Staff Reviewer
              </label>
              <select
                value={assignedToUserId}
                onChange={(e) => setAssignedToUserId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {teamMembers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Document Checklist Definition */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                2. Required Document Checklist
              </h3>
              <p className="text-xs text-slate-500">
                Specify files the client must upload to their onboarding portal.
              </p>
            </div>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
              {checklist.length} Documents Configured
            </span>
          </div>

          {/* Current Checklist Items */}
          <div className="space-y-2">
            {checklist.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleRequired(idx)}
                      aria-label={`Mark "${item.name}" as ${item.required ? "optional" : "required"}`}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                        item.required
                          ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      }`}
                    >
                      {item.required ? "Required" : "Optional"}
                    </button>
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-slate-500">{item.description}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveChecklistItem(item)}
                  aria-label={`Remove "${item.name}" from checklist`}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add custom item form */}
          <div className="pt-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-brand-600" />
              <span>Add Custom Document Requirement</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newChecklistName}
                onChange={(e) => setNewChecklistName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                placeholder="Document Title (e.g. IRS Form W-9)..."
                aria-label="New document title"
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white transition focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="text"
                value={newChecklistDesc}
                onChange={(e) => setNewChecklistDesc(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                placeholder="Instructions (e.g. Signed within last 60 days)..."
                aria-label="New document instructions"
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white transition focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newChecklistRequired}
                  onChange={(e) => setNewChecklistRequired(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
                />
                <span className="text-xs text-slate-700 font-medium">Mark as Required</span>
              </label>

              <button
                type="button"
                onClick={() => handleAddChecklistItem()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit & Send Invitation */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-center transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting || templates.length === 0}
            title={isSubmitting ? "Creating the case and sending the invitation..." : undefined}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-sm transition-all duration-150 ease-out hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            style={{ backgroundColor: currentFirm?.primaryColor || "#0066FF" }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Case...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Create Case & Send Client Invitation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewCasePage() {
  return (
    <PermissionGate permission="cases:create">
      <NewCasePageInner />
    </PermissionGate>
  );
}
