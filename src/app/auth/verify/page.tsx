"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DataStore } from "@/lib/store/dataStore";
import AuthCard from "@/components/auth/AuthCard";
import { MailCheck, ShieldAlert, Loader2, ArrowRight, KeyRound } from "lucide-react";

type VerifyState =
  | { status: "pending" }
  | { status: "invalid" }
  | { status: "verified"; email: string; name: string; slug: string; setupToken?: string };

function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [state, setState] = useState<VerifyState>({ status: "pending" });
  // Tokens are single-use, so guard against React StrictMode's double effect run.
  const consumed = useRef(false);

  useEffect(() => {
    if (consumed.current) return;
    consumed.current = true;
    DataStore.initSeedData();
    const result = DataStore.verifyEmail(token);
    if (!result) {
      setState({ status: "invalid" });
      return;
    }
    setState({
      status: "verified",
      email: result.user.email,
      name: result.user.name,
      slug: DataStore.getFirmById(result.user.firmId)?.slug || "",
      setupToken: result.setupToken,
    });
  }, [token]);

  if (state.status === "pending") {
    return (
      <AuthCard title="Verifying your email…" icon={<Loader2 className="w-6 h-6 animate-spin" />}>
        <p className="text-sm text-slate-500">Checking your verification link.</p>
      </AuthCard>
    );
  }

  if (state.status === "invalid") {
    return (
      <AuthCard
        title="This verification link is invalid"
        subtitle="The link may have already been used, or it does not match any pending account. Verification links can only be used once."
        icon={<ShieldAlert className="w-6 h-6" />}
        iconTone="danger"
      >
        <div className="flex flex-col gap-2.5">
          <Link
            href="/auth/login"
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-md transition-all duration-150 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <span>Go to sign in</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-slate-500 text-center">
            If your account is still unverified, sign in and choose <strong>Resend verification email</strong>.
          </p>
        </div>
      </AuthCard>
    );
  }

  const loginHref = `/auth/login?verified=1&email=${encodeURIComponent(state.email)}&slug=${encodeURIComponent(state.slug)}`;

  return (
    <AuthCard
      title="Email verified"
      subtitle={
        <>
          Thanks, {state.name.split(" ")[0]} — <strong>{state.email}</strong> is now confirmed.
        </>
      }
      icon={<MailCheck className="w-6 h-6" />}
      iconTone="success"
    >
      {state.setupToken ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            One last step: create a password for your account so you can sign in.
          </p>
          <Link
            href={`/auth/reset-password?token=${encodeURIComponent(state.setupToken)}&setup=1`}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-md transition-all duration-150 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Create your password</span>
          </Link>
        </div>
      ) : (
        <Link
          href={loginHref}
          className="w-full py-3 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-md transition-all duration-150 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <span>Continue to sign in</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
