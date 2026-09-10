"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { useTenant } from "@/lib/context/TenantContext";
import { DataStore } from "@/lib/store/dataStore";
import { FormTemplate } from "@/lib/types";
import { useToast } from "@/components/shared/ToastProvider";
import { useConfirm } from "@/components/shared/ConfirmProvider";
import {
  FileSpreadsheet,
  PlusCircle,
  Edit2,
  Trash2,
  Copy,
  FileText,
  Split,
  Layers,
  Sparkles
} from "lucide-react";

export default function FormTemplatesPage() {
  const router = useRouter();
  const { role, currentUser } = useAuth();
  const { currentFirm } = useTenant();
  const toast = useToast();
  const confirm = useConfirm();

  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refreshTemplates = () => {
    if (!currentFirm) return;
    DataStore.initSeedData();
    const list = DataStore.getFormTemplates(currentFirm.id);
    setTemplates(list);
    setLoaded(true);
  };

  useEffect(() => {
    refreshTemplates();
  }, [currentFirm?.id]);

  const handleDuplicate = (tmpl: FormTemplate) => {
    const copy = DataStore.saveFormTemplate({
      firmId: tmpl.firmId,
      title: `${tmpl.title} (Copy)`,
      description: tmpl.description,
      category: tmpl.category,
      fields: tmpl.fields,
    });
    if (currentUser && currentFirm) {
      DataStore.addAuditLog({
        firmId: currentFirm.id,
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: "Form Template Duplicated",
        targetEntity: copy.title,
        details: `Duplicated from "${tmpl.title}" (${tmpl.fields.length} fields).`,
      });
    }
    refreshTemplates();
    toast.success("Form template duplicated.");
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete this form template?",
      message: "This permanently deletes the form template. Cases that already reference it will keep their existing responses, but it will no longer be assignable to new cases.",
      confirmLabel: "Delete Template",
      tone: "danger",
    });
    if (!ok) return;
    const target = templates.find((t) => t.id === id);
    DataStore.deleteFormTemplate(id);
    if (currentUser && currentFirm) {
      DataStore.addAuditLog({
        firmId: currentFirm.id,
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: "Form Template Deleted",
        targetEntity: target?.title || id,
        details: target ? `Removed template with ${target.fields.length} fields.` : "Template removed.",
      });
    }
    refreshTemplates();
    toast.success("Form template deleted.");
  };

  const isReadOnly = role === "Staff" || role === "Client";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Reusable Form Templates
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Design dynamic onboarding questionnaires with conditional branching rules for your firm.
          </p>
        </div>

        {!isReadOnly && (
          <Link
            href="/dashboard/forms/builder"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all duration-150 ease-out active:scale-[0.98] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 self-start sm:self-auto"
            style={{ backgroundColor: currentFirm?.primaryColor || "#0066FF" }}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Form Template</span>
          </Link>
        )}
      </div>

      {!loaded ? (
        /* Loading Skeleton — mirrors template card geometry */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-brand-100 animate-pulse rounded-full" />
                  <div className="h-3 w-14 bg-brand-100 animate-pulse rounded" />
                </div>
                <div className="h-4 w-3/4 bg-brand-100 animate-pulse rounded" />
                <div className="h-3 w-full bg-brand-100 animate-pulse rounded" />
                <div className="h-3 w-2/3 bg-brand-100 animate-pulse rounded" />
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="h-6 w-16 bg-brand-100 animate-pulse rounded-lg" />
                <div className="h-7 w-24 bg-brand-100 animate-pulse rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        /* Empty State */
        <div className="p-10 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-white">
          <FileSpreadsheet className="w-14 h-14 text-brand-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">
            {isReadOnly ? "No form templates yet" : "No form templates yet — create your first one to get started"}
          </p>
          <p className="text-xs text-slate-500 mt-1 mb-4 max-w-sm mx-auto">
            {isReadOnly
              ? "Your firm hasn't published any onboarding questionnaires yet. Check back soon."
              : "Build a reusable questionnaire with conditional branching for your client onboarding workflow."}
          </p>
          {!isReadOnly && (
            <Link
              href="/dashboard/forms/builder"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-all duration-150 ease-out active:scale-[0.98] border border-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Form Template</span>
            </Link>
          )}
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((tmpl) => {
          const conditionalFieldsCount = tmpl.fields.filter(f => Boolean(f.condition)).length;

          return (
            <div
              key={tmpl.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-dropdown hover:-translate-y-0.5 transition-all duration-150 ease-out flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                    {tmpl.category || "General Intake"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(tmpl.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition line-clamp-1">
                  {tmpl.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {tmpl.description || "No description provided."}
                </p>

                {/* Field Tags */}
                <div className="pt-2 flex flex-wrap gap-1.5 text-[10px]">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                    {tmpl.fields.length} Questions
                  </span>
                  {conditionalFieldsCount > 0 && (
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                      <Split className="w-3 h-3" />
                      {conditionalFieldsCount} Conditional Rules
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  {!isReadOnly && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(tmpl)}
                        title="Duplicate Template"
                        aria-label={`Duplicate ${tmpl.title}`}
                        className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(tmpl.id)}
                        title="Delete Template"
                        aria-label={`Delete ${tmpl.title}`}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>

                <Link
                  href={`/dashboard/forms/builder?id=${tmpl.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isReadOnly ? "View Template" : "Edit Builder"}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
