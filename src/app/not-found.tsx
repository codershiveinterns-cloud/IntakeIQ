import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import LogoMark from "@/components/shared/LogoMark";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <div className="p-4 sm:p-6">
        <Link href="/" className="inline-flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
          <LogoMark className="w-7 h-7 shrink-0" />
          <span className="text-sm font-bold tracking-tight text-brand-900">IntakeIQ</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-card p-8 text-center space-y-5 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Error 404</p>
            <h1 className="text-2xl font-extrabold tracking-tight">We couldn&apos;t find that page</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              The link may be outdated, or the page may have moved. Check the address, or head back to somewhere familiar.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 active:scale-[0.98] shadow-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to home
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
