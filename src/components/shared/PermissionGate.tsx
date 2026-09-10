"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { PermissionAction, hasPermission } from "@/lib/auth/permissions";

/**
 * Page-level guard: hiding a nav item is not enough, the route itself must
 * refuse to render for roles that lack the permission.
 */
export default function PermissionGate({
  permission,
  children,
}: {
  permission: PermissionAction;
  children: React.ReactNode;
}) {
  const { role, isInitialized } = useAuth();
  if (!isInitialized) return null;
  if (hasPermission(role, permission)) return <>{children}</>;

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md mx-auto my-12 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-slate-800">This area is restricted</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your role ({role}) doesn&apos;t include access to this page. Ask a firm administrator if you need it.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-brand-600 hover:brightness-110 px-4 py-2 rounded-lg transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        Back to cases
      </Link>
    </div>
  );
}
