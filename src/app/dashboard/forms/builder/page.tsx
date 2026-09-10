"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { useTenant } from "@/lib/context/TenantContext";
import { DataStore } from "@/lib/store/dataStore";
import { FormTemplate, FormField } from "@/lib/types";
import DynamicFormBuilder from "@/components/forms/DynamicFormBuilder";
import { useToast } from "@/components/shared/ToastProvider";
import { hasPermission } from "@/lib/auth/permissions";

function FormBuilderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = searchParams.get("id");

  const { currentUser, role } = useAuth();
  const { currentFirm } = useTenant();
  const toast = useToast();

  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!currentFirm) return;
    DataStore.initSeedData();
    if (templateId) {
      const found = DataStore.getFormTemplateById(templateId);
      // Templates are tenant-scoped: another firm's template must not be openable (or re-homed on save).
      setTemplate(found && found.firmId === currentFirm.id ? found : null);
    }
    setLoaded(true);
  }, [templateId, currentFirm?.id]);

  if (!loaded) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading Form Builder...</div>;
  }

  const readOnly = !hasPermission(role, "forms:edit");

  const handleSave = (data: {
    title: string;
    description: string;
    category: string;
    fields: FormField[];
  }) => {
    if (readOnly) return false;
    if (!currentFirm) {
      toast.error("No active firm selected. Please refresh and try again.");
      return false;
    }

    try {
      const saved = DataStore.saveFormTemplate({
        id: template?.id,
        firmId: currentFirm.id,
        title: data.title,
        description: data.description,
        category: data.category,
        fields: data.fields,
      });

      if (currentUser) {
        DataStore.addAuditLog({
          firmId: currentFirm.id,
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          action: template ? "Form Template Updated" : "Form Template Created",
          targetEntity: saved.title,
          details: `Saved with ${saved.fields.length} dynamic fields and conditional rules.`
        });
      }

      toast.success(template ? "Form template updated." : "Form template created.");
      router.push("/dashboard/forms");
      return true;
    } catch (err) {
      toast.error("Something went wrong saving this template. Please try again.");
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <DynamicFormBuilder
        initialTemplate={template}
        onSave={handleSave}
        onCancel={() => router.push("/dashboard/forms")}
        readOnly={readOnly}
      />
    </div>
  );
}

export default function FormBuilderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Form Builder...</div>}>
      <FormBuilderContent />
    </Suspense>
  );
}
