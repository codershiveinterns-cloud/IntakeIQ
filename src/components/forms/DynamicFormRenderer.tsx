"use client";

import React from "react";
import { FormField, FieldCondition } from "@/lib/types";
import { HelpCircle, Check, AlertCircle, ClipboardList, Paperclip } from "lucide-react";

interface DynamicFormRendererProps {
  fields: FormField[];
  values: Record<string, any>;
  onChange?: (fieldId: string, value: any) => void;
  readOnly?: boolean;
  errors?: Record<string, string>;
  brandColor?: string;
}

export function evaluateFieldCondition(
  condition: FieldCondition | undefined,
  values: Record<string, any>
): boolean {
  if (!condition || !condition.triggerFieldId) return true;

  const triggerVal = values[condition.triggerFieldId];
  const expectedVal = String(condition.value ?? "").trim().toLowerCase();
  const actualStr = String(triggerVal ?? "").trim().toLowerCase();

  switch (condition.operator) {
    case "equals":
      return actualStr === expectedVal;
    case "not_equals":
      return actualStr !== expectedVal;
    case "contains":
      return actualStr.includes(expectedVal);
    case "is_checked":
      // Only a ticked checkbox or an explicit "Yes" counts — "No" is a truthy string but not a yes.
      return triggerVal === true || actualStr === "yes";
    case "is_not_checked":
      return !(triggerVal === true || actualStr === "yes");
    case "is_empty":
      return triggerVal === undefined || triggerVal === null || triggerVal === "";
    case "is_not_empty":
      return triggerVal !== undefined && triggerVal !== null && triggerVal !== "";
    default:
      return true;
  }
}

export default function DynamicFormRenderer({
  fields,
  values,
  onChange,
  readOnly = false,
  errors = {},
  brandColor = "#0066FF",
}: DynamicFormRendererProps) {
  if (fields.length === 0) {
    return (
      <div className="py-10 text-center">
        <ClipboardList className="w-12 h-12 text-brand-200 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700">No fields to display</p>
        <p className="text-xs text-slate-500 mt-1">This form template doesn't have any questions yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {fields.map((field) => {
        // Evaluate conditional visibility
        const isVisible = evaluateFieldCondition(field.condition, values);
        if (!isVisible) return null;

        const val = values[field.id];
        const error = errors[field.id];

        return (
          <div
            key={field.id}
            className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition shadow-sm space-y-1.5 animate-fade-in"
          >
            <div className="flex items-start justify-between gap-2">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                <span>{field.label}</span>
                {field.required && (
                  <span className="text-rose-500 font-bold" title="Required field">
                    *
                  </span>
                )}
              </label>

              {field.condition && (
                <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-medium">
                  Conditional
                </span>
              )}
            </div>

            {field.helpText && (
              <p className="text-[11px] text-slate-500">{field.helpText}</p>
            )}

            {/* Input by Type */}
            <div className="pt-1">
              {field.type === "text" && (
                <input
                  type="text"
                  disabled={readOnly}
                  value={val ?? ""}
                  placeholder={field.placeholder || "Enter text..."}
                  onChange={(e) => onChange && onChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-600"
                />
              )}

              {field.type === "textarea" && (
                <textarea
                  rows={3}
                  disabled={readOnly}
                  value={val ?? ""}
                  placeholder={field.placeholder || "Enter details..."}
                  onChange={(e) => onChange && onChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-600"
                />
              )}

              {field.type === "number" && (
                <input
                  type="number"
                  disabled={readOnly}
                  value={val ?? ""}
                  placeholder={field.placeholder || "0"}
                  onChange={(e) => onChange && onChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-600"
                />
              )}

              {field.type === "date" && (
                <input
                  type="date"
                  disabled={readOnly}
                  value={val ?? ""}
                  onChange={(e) => onChange && onChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-600"
                />
              )}

              {field.type === "dropdown" && (
                <select
                  disabled={readOnly}
                  value={val ?? ""}
                  onChange={(e) => onChange && onChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-600"
                >
                  <option value="">-- Please select an option --</option>
                  {(field.options || []).map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {field.type === "yesno" && (
                <div className="flex items-center gap-4 pt-1">
                  {["Yes", "No"].map((option) => (
                    <label
                      key={option}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all duration-150 ease-out focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-1 ${
                        val === option
                          ? "bg-brand-50 border-brand-300 text-brand-700 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      } ${readOnly ? "cursor-default opacity-80" : ""}`}
                    >
                      <input
                        type="radio"
                        name={field.id}
                        disabled={readOnly}
                        checked={val === option}
                        onChange={() => onChange && onChange(field.id, option)}
                        className="text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === "checkbox" && (
                <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={Boolean(val)}
                    onChange={(e) => onChange && onChange(field.id, e.target.checked)}
                    className="mt-0.5 rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer disabled:cursor-default"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed font-medium">
                    {field.placeholder || "I confirm and agree to the above statement."}
                  </span>
                </label>
              )}

              {field.type === "file" && (
                <div className="flex items-center justify-center gap-2 p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50 text-center text-xs text-slate-500">
                  <Paperclip className="w-3.5 h-3.5 shrink-0" />
                  <span>Uploaded via the Document Checklist, not this questionnaire</span>
                </div>
              )}
            </div>

            {error && (
              <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
