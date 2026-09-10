"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { useTenant } from "@/lib/context/TenantContext";
import { DataStore } from "@/lib/store/dataStore";
import { UserProfile, UserRole } from "@/lib/types";
import { useToast } from "@/components/shared/ToastProvider";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { hasPermission, getRoleBadgeStyle } from "@/lib/auth/permissions";
import { useFirmPlan } from "@/components/shared/FeatureGate";
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  Eye,
  Mail,
  Lock,
  X,
  Sparkles,
  CheckCircle2
} from "lucide-react";

export default function TeamPage() {
  const { currentUser, role } = useAuth();
  const { currentFirm } = useTenant();
  const toast = useToast();
  const { definition: plan } = useFirmPlan();

  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const seatsUsed = teamMembers.filter((u) => u.role !== "Client").length;
  const seatLimit = plan.seatLimit;
  const seatLimitReached = seatLimit !== null && seatsUsed >= seatLimit;
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("CaseManager");
  const [inviteTitle, setInviteTitle] = useState("");

  const refreshTeam = () => {
    if (!currentFirm) return;
    DataStore.initSeedData();
    const users = DataStore.getUsers(currentFirm.id);
    setTeamMembers(users);
  };

  useEffect(() => {
    refreshTeam();
  }, [currentFirm?.id]);

  useEffect(() => {
    if (!isInviteModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeInviteModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isInviteModalOpen]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFirm || !currentUser) return;
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error("Please provide member name and email.");
      return;
    }
    if (DataStore.getUserByEmail(inviteEmail)) {
      toast.error("An account with that email already exists. Use a different address or re-send their activation link.");
      return;
    }
    if (seatLimitReached) {
      toast.error(
        `Your ${plan.name} plan includes up to ${seatLimit} team members. Upgrade in Billing & Plans to add more.`
      );
      return;
    }

    const newUser = DataStore.createUser({
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      firmId: currentFirm.id,
      title: inviteTitle.trim() || `${inviteRole} Associate`,
      emailVerified: false, // activated via the emailed link
    });

    DataStore.addAuditLog({
      firmId: currentFirm.id,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: "Team Member Invited",
      targetEntity: `${newUser.name} (${newUser.role})`,
      details: `Invited with role ${newUser.role} to ${currentFirm.name}.`
    });

    // Activation email (verify address + create password) — visible in the Outbox.
    DataStore.issueEmailVerification(newUser, { mode: "invite", invitedBy: currentUser.name });

    resetInviteForm();
    setIsInviteModalOpen(false);
    refreshTeam();
    toast.success(`Invite sent to ${newUser.name}. They can sign in once they activate via the emailed link.`);
  };

  const resetInviteForm = () => {
    setInviteName("");
    setInviteEmail("");
    setInviteTitle("");
    setInviteRole("CaseManager");
  };

  const closeInviteModal = () => {
    setIsInviteModalOpen(false);
    resetInviteForm();
  };

  const isAdmin = role === "Admin";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Team Members & Role Access
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your firm's case managers, reviewers, and staff access permissions.
          </p>
          <p className="text-[11px] mt-1.5 inline-flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-full font-bold border ${
                seatLimitReached
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {seatsUsed} / {seatLimit ?? "∞"} seats used
            </span>
            <span className="text-slate-400">· {plan.name} plan</span>
            {seatLimitReached && (
              <Link href="/dashboard/billing" className="font-semibold text-brand-600 hover:underline">
                Upgrade for more seats →
              </Link>
            )}
          </p>
        </div>

        <RoleGuard
          requiredPermission="team:invite"
          fallback={
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                You are currently in <strong>{role}</strong> mode. Only users with the <code>team:invite</code> permission (Firm Admins) can invite teammates.
              </span>
            </div>
          }
        >
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all duration-150 ease-out hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 self-start sm:self-auto"
            style={{ backgroundColor: currentFirm?.primaryColor || "#0066FF" }}
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </button>
        </RoleGuard>
      </div>

      {/* Team Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Member Name</th>
              <th className="py-3 px-4">Role & Access Level</th>
              <th className="py-3 px-4">Title / Practice Area</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {teamMembers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Users className="w-12 h-12 text-slate-200" />
                    <p className="text-slate-500">No team members yet — invite your first teammate to get started.</p>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setIsInviteModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all duration-150 ease-out hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                        style={{ backgroundColor: currentFirm?.primaryColor || "#0066FF" }}
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Invite Team Member</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
            teamMembers.map((member) => {
              const roleStyle = getRoleBadgeStyle(member.role);

              return (
                <tr key={member.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{member.name}</div>
                        <div className="text-[10px] text-slate-400">ID: {member.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleStyle.badgeClass}`}>
                      {member.role === "Admin" && <ShieldCheck className="w-3 h-3 text-purple-600" />}
                      {member.role === "CaseManager" && <UserCheck className="w-3 h-3 text-blue-600" />}
                      {member.role === "Staff" && <Eye className="w-3 h-3 text-emerald-600" />}
                      <span>{member.role}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {member.title || "Firm Associate"}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{member.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsInviteModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-brand-600" />
                <h3 id="invite-modal-title" className="text-sm font-bold text-slate-900">
                  Invite Team Member to {currentFirm?.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeInviteModal}
                aria-label="Close invite modal"
                className="p-3.5 -m-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Jessica Adams"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. jadams@firm.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role Assignment
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="CaseManager">Case Manager (Review, approve/reject submissions)</option>
                  <option value="Staff">Staff (View-only case access)</option>
                  <option value="Admin">Admin (Full settings & user management)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Title / Department
                </label>
                <input
                  type="text"
                  value={inviteTitle}
                  onChange={(e) => setInviteTitle(e.target.value)}
                  placeholder="e.g. Senior Tax Consultant, Corporate Paralegal"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeInviteModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:brightness-110 rounded-lg shadow-sm transition-all duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
