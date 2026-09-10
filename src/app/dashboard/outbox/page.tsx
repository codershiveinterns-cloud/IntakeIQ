"use client";

import PermissionGate from "@/components/shared/PermissionGate";

import React, { useState, useEffect } from "react";
import { useTenant } from "@/lib/context/TenantContext";
import { DataStore } from "@/lib/store/dataStore";
import { EmailNotification } from "@/lib/types";
import {
  Mail,
  Search,
  CheckCircle2,
  Clock,
  Send,
  User,
  ArrowRight,
  Sparkles,
  ExternalLink,
  X,
  Inbox
} from "lucide-react";

function EmailOutboxPageInner() {
  const { currentFirm } = useTenant();
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null);

  const refreshEmails = () => {
    if (!currentFirm) return;
    DataStore.initSeedData();
    const list = DataStore.getEmails(currentFirm.id);
    setEmails(list);
  };

  useEffect(() => {
    refreshEmails();
  }, [currentFirm?.id]);

  useEffect(() => {
    if (!selectedEmail) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedEmail(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedEmail]);

  const filteredEmails = emails.filter((e) => {
    return (
      e.to.toLowerCase().includes(search.toLowerCase()) ||
      e.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.bodyText.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "invitation":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "doc_rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "status_change":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "form_submitted":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "doc_uploaded":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "verification":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "password_reset":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "portal_access":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Every URL we "email" must be a real, clickable link in the simulator.
  const renderBody = (text: string) => {
    const parts = text.split(/(https?:\/\/[^\s]+)/g);
    return parts.map((part, i) =>
      /^https?:\/\//.test(part) ? (
        <a
          key={i}
          href={part}
          className="text-brand-600 hover:text-brand-700 underline break-all"
        >
          {part}
        </a>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Transactional Email Simulator & Outbox
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
              <Sparkles className="w-3 h-3 text-brand-600" /> Live Trigger Dispatcher
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time inspection of outgoing transactional emails (invites, verification &amp; password links, document rejections, and status changes). No mail server is connected — every link below is live.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipient, subject, content..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {filteredEmails.length} Dispatched Notifications
        </span>
      </div>

      {/* Outbox List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="divide-y divide-slate-100">
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 px-8 text-center">
              <Inbox className="w-12 h-12 text-slate-200" />
              {emails.length === 0 ? (
                <p className="text-slate-500">No outgoing notifications recorded yet — emails sent from this firm will appear here.</p>
              ) : (
                <>
                  <p className="text-slate-500">No notifications matching your search.</p>
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear search</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div
                key={email.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedEmail(email)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedEmail(email);
                  }
                }}
                className="p-4 hover:bg-slate-50/80 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 bg-slate-100 group-hover:bg-brand-50 text-slate-600 group-hover:text-brand-600 rounded-xl transition flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition">
                        {email.subject}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getTypeBadge(email.type)}`}>
                        {email.type.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    <div className="text-slate-600 line-clamp-1 text-xs">
                      <strong className="text-slate-800">To:</strong> {email.recipientName} ({email.to})
                      <span className="text-slate-400 mx-1.5">•</span>
                      <span>{email.bodyText}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 flex-shrink-0 self-end sm:self-center">
                  <div className="font-medium text-slate-600">
                    {new Date(email.sentAt).toLocaleDateString()}
                  </div>
                  <div>
                    {new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Email Details Modal */}
      {selectedEmail && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="email-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedEmail(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-brand-600" />
                <h3 id="email-modal-title" className="text-sm font-bold text-slate-900">Transactional Email Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmail(null)}
                aria-label="Close email details"
                className="p-3 -m-2 text-slate-400 hover:text-slate-700 rounded-lg transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Metadata */}
            <div className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-200">
                <div className="grid grid-cols-[auto_1fr] sm:grid-cols-4 gap-x-2 gap-y-1.5">
                  <span className="font-semibold text-slate-500">From:</span>
                  <span className="sm:col-span-3 text-slate-800 font-medium break-words">
                    {currentFirm?.name} &lt;{currentFirm?.contactEmail || "notifications@intakeiq.com"}&gt;
                  </span>

                  <span className="font-semibold text-slate-500">To:</span>
                  <span className="sm:col-span-3 text-slate-800 font-bold break-words">
                    {selectedEmail.recipientName} &lt;{selectedEmail.to}&gt;
                  </span>

                  <span className="font-semibold text-slate-500">Subject:</span>
                  <span className="sm:col-span-3 text-slate-900 font-bold break-words">
                    {selectedEmail.subject}
                  </span>

                  <span className="font-semibold text-slate-500">Timestamp:</span>
                  <span className="sm:col-span-3 text-slate-600 break-words">
                    {new Date(selectedEmail.sentAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Body Box */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Rendered Email Message
                </label>
                <div className="p-4 rounded-xl border border-slate-200 bg-white font-sans text-slate-800 leading-relaxed space-y-3 shadow-xs">
                  <p>{renderBody(selectedEmail.bodyText)}</p>

                  {selectedEmail.actionUrl && (
                    <a
                      href={selectedEmail.actionUrl}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 active:scale-[0.98] shadow-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                    >
                      <span>{selectedEmail.actionLabel || "Open link"}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  
                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    Sent securely by <strong>{currentFirm?.name}</strong> via IntakeIQ Transactional Mail.
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEmail(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmailOutboxPage() {
  return (
    <PermissionGate permission="outbox:view">
      <EmailOutboxPageInner />
    </PermissionGate>
  );
}
