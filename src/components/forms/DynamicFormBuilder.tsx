"use client";

import React, { useState } from "react";
import { FormField, FormTemplate } from "@/lib/types";
import FieldEditorModal from "./FieldEditorModal";
import DynamicFormRenderer from "./DynamicFormRenderer";
import { useToast } from "@/components/shared/ToastProvider";
import { useConfirm } from "@/components/shared/ConfirmProvider";
import {
  Lock,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Copy,
  Eye,
  Settings2,
  Sparkles,
  Save,
  CheckCircle2,
  Split,
  FileCode,
  FileQuestion,
  Loader2
} from "lucide-react";

interface DynamicFormBuilderProps {
  initialTemplate?: FormTemplate | null;
  /** Return false to signal the save failed so the builder can re-enable its controls. */
  onSave: (templateData: { title: string; description: string; category: string; fields: FormField[] }) => boolean | void;
  onCancel?: () => void;
  readOnly?: boolean;
}

export default function DynamicFormBuilder({
  initialTemplate,
  onSave,
  onCancel,
  readOnly = false,
}: DynamicFormBuilderProps) {
  const [title, setTitle] = useState(initialTemplate?.title || "New Client Intake Form");
  const [description, setDescription] = useState(
    initialTemplate?.description || "Please fill in all requested fields for your onboarding process."
  );
  const [category, setCategory] = useState(initialTemplate?.category || "General Intake");
  const [fields, setFields] = useState<FormField[]>(initialTemplate?.fields || []);

  const [activeTab, setActiveTab] = useState<"builder" | "preview">("builder");
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);

  const [titleError, setTitleError] = useState(false);
  const [fieldsError, setFieldsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingPreview, setIsSubmittingPreview] = useState(false);

  const toast = useToast();
  const confirm = useConfirm();

  // Preview state
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});

  const handleAddField = () => {
    if (readOnly) return;
    setEditingField(null);
    setIsEditorModalOpen(true);
  };

  const handleEditField = (field: FormField) => {
    if (readOnly) return;
    setEditingField(field);
    setIsEditorModalOpen(true);
  };

  const handleSaveField = (savedField: FormField) => {
    if (readOnly) return;
    if (editingField) {
      setFields(fields.map(f => (f.id === savedField.id ? savedField : f)));
    } else {
      setFields([...fields, savedField]);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (readOnly) return;
    const ok = await confirm({
      title: "Remove this field?",
      message: "This permanently removes the field from your form template. Any conditional rules referencing it may stop working.",
      confirmLabel: "Remove Field",
      tone: "danger",
    });
    if (!ok) return;
    // Rules that pointed at the removed field would otherwise hide their
    // dependents forever, so they are cleared along with it.
    setFields(
      fields
        .filter(f => f.id !== fieldId)
        .map(f => (f.condition?.triggerFieldId === fieldId ? { ...f, condition: undefined } : f))
    );
  };

  const handleDuplicateField = (field: FormField) => {
    if (readOnly) return;
    const duplicated: FormField = {
      ...field,
      id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: `${field.label} (Copy)`,
    };
    setFields([...fields, duplicated]);
  };

  const handleMoveField = (index: number, direction: "up" | "down") => {
    if (readOnly) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const newFields = [...fields];
    const temp = newFields[index];
    newFields[index] = newFields[targetIndex];
    newFields[targetIndex] = temp;
    setFields(newFields);
  };

  const handlePreviewChange = (fieldId: string, val: any) => {
    setPreviewValues(prev => ({ ...prev, [fieldId]: val }));
  };

  const handleSaveTemplate = () => {
    if (readOnly) return;
    if (!title.trim()) {
      setTitleError(true);
      toast.error("Please provide a Template Title.");
      return;
    }
    setTitleError(false);
    if (fields.length === 0) {
      setFieldsError(true);
      toast.error("Please add at least one field to this form template.");
      return;
    }
    setFieldsError(false);
    setIsSaving(true);
    const result = onSave({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      fields,
    });
    if (result === false) setIsSaving(false);
  };

  const handlePreviewSubmit = () => {
    setIsSubmittingPreview(true);
    window.setTimeout(() => {
      setIsSubmittingPreview(false);
      toast.success("Preview submission simulation successful!");
    }, 500);
  };

  return (
    <div className="space-y-6">
      {readOnly && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            You are viewing this template in read-only mode. Only Firm Admins and Case Managers can edit form templates.
          </span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              Form Template Designer
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">{fields.length} Fields Configured</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            {title || "Untitled Form Template"}
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Tab Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("builder")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 ${
                activeTab === "builder"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Builder</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 ${
                activeTab === "preview"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Interactive Preview</span>
            </button>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
            >
              Cancel
            </button>
          )}

          {!readOnly && (
            <button
              type="button"
              onClick={handleSaveTemplate}
              disabled={isSaving}
              title={isSaving ? "Saving template…" : "Save Template"}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:brightness-110 rounded-xl shadow-sm transition-all duration-150 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{isSaving ? "Saving…" : "Save Template"}</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === "builder" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Template Metadata */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Template Details
              </h3>

              <div>
                <label htmlFor="template_title_input" className="block text-xs font-semibold text-slate-700 mb-1">
                  Template Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="template_title_input"
                  type="text"
                  value={title}
                  disabled={readOnly}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (titleError) setTitleError(false);
                  }}
                  onBlur={() => setTitleError(!title.trim())}
                  placeholder="e.g. Corporate Legal Intake & KYC Form"
                  aria-invalid={titleError}
                  className={`w-full px-3 py-2 border rounded-lg text-xs transition-all duration-150 ease-out focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
                    titleError ? "border-rose-400" : "border-slate-300"
                  }`}
                />
                {titleError && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">Template title is required.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category / Practice Area
                </label>
                <input
                  type="text"
                  value={category}
                  disabled={readOnly}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Tax & Accounting, Corporate Counsel"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instructions / Description for Client
                </label>
                <textarea
                  rows={4}
                  value={description}
                  disabled={readOnly}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Instructions displayed at the top of the client form..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Quick Tips Card */}
            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 text-xs space-y-2 text-blue-900">
              <div className="flex items-center gap-2 font-bold">
                <Split className="w-4 h-4 text-blue-600" />
                <span>Conditional Display Logic</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-800">
                You can create dynamic branching! For example, if <em>Entity Formation Type</em> is <strong>Corporation</strong>, you can show the <strong>EIN Number</strong> input.
              </p>
            </div>
          </div>

          {/* Right Column: Form Fields List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Form Questions & Fields</h3>
                  <p className="text-xs text-slate-500">
                    Add, edit, reorder, and configure conditional rules for your questionnaire.
                  </p>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:brightness-110 rounded-lg shadow-sm transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Field</span>
                  </button>
                )}
              </div>

              {fields.length === 0 ? (
                <div
                  className={`p-8 border-2 border-dashed rounded-xl text-center transition-colors ${
                    fieldsError ? "border-rose-300 bg-rose-50/40" : "border-slate-200"
                  }`}
                >
                  <FileCode className={`w-10 h-10 mx-auto mb-2 ${fieldsError ? "text-rose-300" : "text-slate-300"}`} />
                  <p className="text-xs font-semibold text-slate-700">No fields added yet</p>
                  <p className={`text-[11px] mt-0.5 mb-3 ${fieldsError ? "text-rose-600 font-medium" : "text-slate-500"}`}>
                    {fieldsError
                      ? "Add at least one field before saving this template."
                      : 'Click "Add Field" to start building your client questionnaire.'}
                  </p>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={handleAddField}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-all duration-150 ease-out active:scale-[0.98] border border-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Question</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((f, index) => {
                    const triggerField = f.condition
                      ? fields.find(item => item.id === f.condition?.triggerFieldId)
                      : null;

                    return (
                      <div
                        key={f.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition group shadow-sm flex items-start justify-between gap-4 text-xs"
                      >
                        {/* Order Number & Drag indicator */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                            {index + 1}
                          </span>
                        </div>

                        {/* Field Details */}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">
                              {f.label}
                            </span>
                            {f.required && (
                              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded">
                                Required
                              </span>
                            )}
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-200 text-slate-700 rounded-md uppercase">
                              {f.type}
                            </span>
                          </div>

                          {f.helpText && (
                            <p className="text-[11px] text-slate-500">{f.helpText}</p>
                          )}

                          {/* Conditional rule preview */}
                          {f.condition && (
                            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-800">
                              <Split className="w-3 h-3 text-blue-600" />
                              <span>
                                Shown if <strong>{triggerField?.label || f.condition.triggerFieldId}</strong> {f.condition.operator} <strong>"{String(f.condition.value || "")}"</strong>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {!readOnly && (
                          <div className="flex items-center gap-1">
                            {/* Reorder Buttons */}
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveField(index, "up")}
                              title="Move Up"
                              aria-label="Move field up"
                              className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-all duration-150 ease-out active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === fields.length - 1}
                              onClick={() => handleMoveField(index, "down")}
                              title="Move Down"
                              aria-label="Move field down"
                              className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-all duration-150 ease-out active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Duplicate */}
                            <button
                              type="button"
                              onClick={() => handleDuplicateField(f)}
                              title="Duplicate Field"
                              aria-label="Duplicate field"
                              className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleEditField(f)}
                              title="Edit Field"
                              aria-label="Edit field"
                              className="p-2.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteField(f.id)}
                              title="Delete Field"
                              aria-label="Delete field"
                              className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Live Interactive Preview Tab */
        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 uppercase">
              <Sparkles className="w-3 h-3" />
              <span>Live Form Preview Sandbox</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {description && (
              <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
            )}
          </div>

          {fields.length === 0 ? (
            <div className="py-10 text-center">
              <FileQuestion className="w-12 h-12 text-brand-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Nothing to preview yet</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Add fields in the Builder tab to see them here.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("builder")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-all duration-150 ease-out active:scale-[0.98] border border-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Go to Builder</span>
              </button>
            </div>
          ) : (
            <>
              <DynamicFormRenderer
                fields={fields}
                values={previewValues}
                onChange={handlePreviewChange}
              />

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Sandbox Preview Mode • Progress Auto-saved</span>
                <button
                  type="button"
                  onClick={handlePreviewSubmit}
                  disabled={isSubmittingPreview}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:brightness-110 shadow-sm transition-all duration-150 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                >
                  {isSubmittingPreview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingPreview ? "Submitting…" : "Submit Preview Response"}</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Field Editor Modal */}
      <FieldEditorModal
        isOpen={isEditorModalOpen}
        field={editingField}
        existingFields={fields}
        onSave={handleSaveField}
        onClose={() => setIsEditorModalOpen(false)}
      />
    </div>
  );
}
