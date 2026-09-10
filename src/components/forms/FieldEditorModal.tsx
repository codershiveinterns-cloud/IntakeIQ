"use client";

import React, { useState, useEffect } from "react";
import { FormField, FormFieldType, FieldCondition, ConditionOperator } from "@/lib/types";
import { X, Plus, Trash2, HelpCircle, Split } from "lucide-react";
import { useToast } from "@/components/shared/ToastProvider";

interface FieldEditorModalProps {
  isOpen: boolean;
  field?: FormField | null;
  existingFields: FormField[];
  onSave: (field: FormField) => void;
  onClose: () => void;
}

export default function FieldEditorModal({
  isOpen,
  field,
  existingFields,
  onSave,
  onClose,
}: FieldEditorModalProps) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<FormFieldType>("text");
  const [placeholder, setPlaceholder] = useState("");
  const [helpText, setHelpText] = useState("");
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState<string[]>(["Option 1", "Option 2"]);
  const [newOptionInput, setNewOptionInput] = useState("");
  const [labelError, setLabelError] = useState(false);

  const toast = useToast();

  // Conditional logic state
  const [hasCondition, setHasCondition] = useState(false);
  const [triggerFieldId, setTriggerFieldId] = useState("");
  const [operator, setOperator] = useState<ConditionOperator>("equals");
  const [conditionValue, setConditionValue] = useState("");

  useEffect(() => {
    setLabelError(false);
    if (field) {
      setLabel(field.label || "");
      setType(field.type || "text");
      setPlaceholder(field.placeholder || "");
      setHelpText(field.helpText || "");
      setRequired(Boolean(field.required));
      setOptions(field.options && field.options.length > 0 ? [...field.options] : ["Option 1", "Option 2"]);
      
      if (field.condition) {
        setHasCondition(true);
        setTriggerFieldId(field.condition.triggerFieldId);
        setOperator(field.condition.operator);
        setConditionValue(String(field.condition.value || ""));
      } else {
        setHasCondition(false);
        setTriggerFieldId("");
        setOperator("equals");
        setConditionValue("");
      }
    } else {
      // Default new field
      setLabel("");
      setType("text");
      setPlaceholder("");
      setHelpText("");
      setRequired(false);
      setOptions(["Option 1", "Option 2"]);
      setHasCondition(false);
      setTriggerFieldId("");
      setOperator("equals");
      setConditionValue("");
    }
  }, [field, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (newOptionInput.trim()) {
      setOptions([...options, newOptionInput.trim()]);
      setNewOptionInput("");
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setLabelError(true);
      toast.error("Field Label is required.");
      return;
    }
    setLabelError(false);

    let condition: FieldCondition | undefined = undefined;
    if (hasCondition && triggerFieldId) {
      const valueless = operator === "is_checked" || operator === "is_not_checked" || operator === "is_empty" || operator === "is_not_empty";
      condition = {
        triggerFieldId,
        operator,
        value: valueless ? "" : conditionValue,
      };
    }

    const newField: FormField = {
      id: field?.id || `field_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: label.trim(),
      type,
      placeholder: placeholder.trim() || undefined,
      helpText: helpText.trim() || undefined,
      required,
      options: ["dropdown", "multiselect"].includes(type) ? options : undefined,
      condition,
    };

    onSave(newField);
    onClose();
  };

  // Filter existing fields that can act as conditional triggers (exclude self)
  const candidateTriggers = existingFields.filter(f => f.id !== field?.id);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="field_editor_title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 id="field_editor_title" className="text-base font-bold text-slate-900">
              {field ? "Edit Form Field" : "Add Form Field"}
            </h3>
            <p className="text-xs text-slate-500">Configure field properties and conditional display logic</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-3 -m-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Field Label */}
          <div>
            <label htmlFor="field_label_input" className="block text-xs font-semibold text-slate-700 mb-1">
              Field Label <span className="text-rose-500">*</span>
            </label>
            <input
              id="field_label_input"
              type="text"
              required
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (labelError) setLabelError(false);
              }}
              onBlur={() => setLabelError(!label.trim())}
              placeholder="e.g. Entity Legal Name, Tax Identification Number..."
              aria-invalid={labelError}
              className={`w-full px-3 py-2 border rounded-lg text-xs transition-all duration-150 ease-out focus:ring-2 focus:ring-brand-500 focus:outline-none ${
                labelError ? "border-rose-400" : "border-slate-300"
              }`}
            />
            {labelError && (
              <p className="text-[11px] text-rose-600 font-medium mt-1">Field Label is required.</p>
            )}
          </div>

          {/* Field Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Field Input Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as FormFieldType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="text">Single-line Text</option>
                <option value="textarea">Multi-line Textarea</option>
                <option value="number">Numeric (Amount / Count)</option>
                <option value="date">Date Picker</option>
                <option value="dropdown">Dropdown Select</option>
                <option value="yesno">Yes / No Radio</option>
                <option value="checkbox">Checkbox (Agree / Confirm)</option>
                <option value="file">File Upload Placeholder</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Requirement Setting
              </label>
              <div className="flex items-center gap-2 h-9 px-3 border border-slate-300 rounded-lg bg-slate-50">
                <input
                  type="checkbox"
                  id="req_toggle"
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="req_toggle" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Required field
                </label>
              </div>
            </div>
          </div>

          {/* Placeholder & Help Text */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Placeholder Text (Optional)
              </label>
              <input
                type="text"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                placeholder="e.g. Enter registered EIN..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Help / Guidance Text (Optional)
              </label>
              <input
                type="text"
                value={helpText}
                onChange={(e) => setHelpText(e.target.value)}
                placeholder="e.g. As shown on Form SS-4..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Dropdown Options Manager (if dropdown) */}
          {["dropdown", "multiselect"].includes(type) && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Dropdown Choices / Options
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOptionInput}
                  onChange={(e) => setNewOptionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  placeholder="Add option and press Enter..."
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {options.map((opt, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 shadow-sm"
                  >
                    <span>{opt}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(i)}
                      aria-label={`Remove option ${opt}`}
                      className="text-slate-400 hover:text-rose-600 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Conditional Logic Section */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Split className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-900">
                  Conditional Display Rule (Show / Hide)
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCondition}
                  onChange={(e) => setHasCondition(e.target.checked)}
                  aria-label="Enable conditional display rule"
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-1 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {hasCondition && (
              <div className="space-y-3 pt-2 text-xs border-t border-blue-200 animate-fade-in">
                {candidateTriggers.length === 0 ? (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                    Add at least one other field before setting conditional rules.
                  </p>
                ) : (
                  <>
                    <p className="text-[11px] text-blue-800">
                      Show this field <strong>only when</strong> the following condition is met:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* Trigger Field */}
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-slate-600 mb-1">
                          If Field
                        </label>
                        <select
                          value={triggerFieldId}
                          onChange={(e) => setTriggerFieldId(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">-- Select Field --</option>
                          {candidateTriggers.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.label} ({f.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Operator */}
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-slate-600 mb-1">
                          Condition
                        </label>
                        <select
                          value={operator}
                          onChange={(e) => setOperator(e.target.value as ConditionOperator)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="equals">Equals (=)</option>
                          <option value="not_equals">Does not equal (≠)</option>
                          <option value="contains">Contains text</option>
                          <option value="is_checked">Is Checked / Yes</option>
                          <option value="is_not_checked">Is Unchecked / No</option>
                        </select>
                      </div>

                      {/* Value */}
                      {["equals", "not_equals", "contains"].includes(operator) && (
                        <div>
                          <label className="block text-[10px] font-semibold uppercase text-slate-600 mb-1">
                            Expected Value
                          </label>
                          <input
                            type="text"
                            value={conditionValue}
                            onChange={(e) => setConditionValue(e.target.value)}
                            placeholder="e.g. Corporation or Yes"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:brightness-110 rounded-lg shadow-sm transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
            >
              {field ? "Update Field" : "Add to Form"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
