"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DataStore } from "@/lib/store/dataStore";
import { AppNotification, NotificationType } from "@/lib/types";
import {
  Bell,
  FileUp,
  CheckCircle2,
  XCircle,
  FileText,
  UserPlus,
  AlertTriangle,
  PartyPopper,
  CheckCheck,
  Crown,
} from "lucide-react";

const NOTIFICATION_ICONS: Record<NotificationType, typeof Bell> = {
  case_assigned: UserPlus,
  form_submitted: FileText,
  doc_uploaded: FileUp,
  doc_approved: CheckCircle2,
  doc_rejected: XCircle,
  extraction_flagged: AlertTriangle,
  case_approved: PartyPopper,
  plan_upgraded: Crown,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  case_assigned: "bg-blue-100 text-blue-600",
  form_submitted: "bg-brand-100 text-brand-600",
  doc_uploaded: "bg-sky-100 text-sky-600",
  doc_approved: "bg-emerald-100 text-emerald-600",
  doc_rejected: "bg-rose-100 text-rose-600",
  extraction_flagged: "bg-amber-100 text-amber-600",
  case_approved: "bg-purple-100 text-purple-600",
  plan_upgraded: "bg-indigo-100 text-indigo-600",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

interface NotificationBellProps {
  firmId?: string;
}

export default function NotificationBell({ firmId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  const refresh = () => {
    if (!firmId) {
      setNotifications([]);
      return;
    }
    setNotifications(DataStore.getNotifications(firmId));
  };

  useEffect(() => {
    refresh();
    // Cheap polling keeps the bell in sync with actions taken elsewhere in
    // the app (no real-time backend to push events from).
    const interval = setInterval(refresh, 4000);
    return () => clearInterval(interval);
  }, [firmId]);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    if (!firmId) return;
    DataStore.markAllNotificationsRead(firmId);
    refresh();
  };

  const handleNotificationClick = (n: AppNotification) => {
    if (!n.read) {
      DataStore.markNotificationRead(n.id);
      refresh();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
        className="relative flex items-center gap-1 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 px-2 py-2 rounded transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      >
        <Bell className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 sm:static sm:ml-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-80 max-w-[calc(100vw-2rem)] max-h-[70vh] overflow-y-auto bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50 animate-fade-in">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-700 sticky top-0 bg-slate-800">
            <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-slate-400">
              You&apos;re all caught up — no notifications yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-700/80">
              {notifications.slice(0, 20).map((n) => {
                const Icon = NOTIFICATION_ICONS[n.type] || Bell;
                const content = (
                  <div
                    className={`flex items-start gap-2.5 px-3 py-2.5 hover:bg-slate-700/60 transition-colors duration-150 ${
                      !n.read ? "bg-slate-700/30" : ""
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${NOTIFICATION_COLORS[n.type] || "bg-slate-700 text-slate-300"}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-slate-100 truncate">{n.title}</p>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                );

                return n.caseId ? (
                  <Link
                    key={n.id}
                    href={`/dashboard/cases/${n.caseId}`}
                    onClick={() => handleNotificationClick(n)}
                    className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleNotificationClick(n)}
                    className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset"
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
