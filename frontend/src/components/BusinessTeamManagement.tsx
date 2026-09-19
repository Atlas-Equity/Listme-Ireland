'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  UserPlus, 
  Clock, 
  Check, 
  X, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  Crown,
  ArrowRightLeft,
  Shield,
  UserCheck
} from 'lucide-react';
import { 
  inviteBusinessTeamMemberAction, 
  removeBusinessTeamMemberAction,
  updateBusinessTeamMemberRoleAction,
  transferBusinessPageOwnershipAction
} from '@/app/actions/businessPages';

interface BusinessTeamManagementProps {
  pageSlug: string;
  isOwner: boolean;
  isTrueOwner?: boolean;
  isAdmin?: boolean;
  teamMembers?: any[];
  pendingInvites?: { username: string; user_id?: string; invited_at: string }[];
}

export default function BusinessTeamManagement({
  pageSlug,
  isOwner,
  isTrueOwner = false,
  isAdmin = false,
  teamMembers = [],
  pendingInvites = [],
}: BusinessTeamManagementProps) {
  const router = useRouter();
  const [localTeamMembers, setLocalTeamMembers] = useState(teamMembers);

  useEffect(() => {
    setLocalTeamMembers(teamMembers);
  }, [teamMembers]);

  const [inviteInput, setInviteInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [transferringId, setTransferringId] = useState<string | null>(null);

  const [pendingRemovalMember, setPendingRemovalMember] = useState<{ id: string; name: string } | null>(null);
  const [pendingTransferMember, setPendingTransferMember] = useState<{ id: string; name: string } | null>(null);

  const canManageTeam = isOwner || isTrueOwner || isAdmin;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await inviteBusinessTeamMemberAction(pageSlug, inviteInput.trim());
      if (res.error) {
        setFeedback({ type: 'error', message: res.error });
      } else {
        setFeedback({ 
          type: 'success', 
          message: res.message || `Invitation sent to @${inviteInput.replace(/^@/, '')}! They will see it in their Notifications.` 
        });
        setInviteInput('');
        router.refresh();
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to send team invitation. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromptRemoval = (memberUserId: string, memberName: string) => {
    setPendingRemovalMember({ id: memberUserId, name: memberName });
  };

  const executeRemoveMember = async () => {
    if (!pendingRemovalMember) return;
    const { id: memberUserId, name: memberName } = pendingRemovalMember;
    setRemovingId(memberUserId);
    setFeedback(null);
    try {
      const res = await removeBusinessTeamMemberAction(pageSlug, memberUserId);
      if (res.error) {
        setFeedback({ type: 'error', message: res.error });
      } else {
        setFeedback({ type: 'success', message: `@${memberName} was removed from the business team.` });
        setPendingRemovalMember(null);
        router.refresh();
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to remove team member.' });
    } finally {
      setRemovingId(null);
    }
  };

  const handleToggleRole = async (memberUserId: string, currentRole: string, memberName: string) => {
    const newRole: 'owner' | 'staff' = currentRole === 'owner' ? 'staff' : 'owner';
    setUpdatingRoleId(memberUserId);
    setFeedback(null);
    try {
      const res = await updateBusinessTeamMemberRoleAction(pageSlug, memberUserId, newRole);
      if (res.error) {
        setFeedback({ type: 'error', message: res.error });
      } else {
        setLocalTeamMembers(prev => prev.map((m: any) => {
          const uid = typeof m === 'string' ? m : m?.user_id;
          if (uid === memberUserId) {
            return typeof m === 'string' ? { user_id: m, role: newRole, username: memberName } : { ...m, role: newRole };
          }
          return m;
        }));
        setFeedback({
          type: 'success',
          message: `@${memberName} is now ${newRole === 'owner' ? 'a Co-Owner' : 'Staff'}.`,
        });
        router.refresh();
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to update member role.' });
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const executeTransferOwnership = async () => {
    if (!pendingTransferMember) return;
    const { id: memberUserId, name: memberName } = pendingTransferMember;
    setTransferringId(memberUserId);
    setFeedback(null);
    try {
      const res = await transferBusinessPageOwnershipAction(pageSlug, memberUserId);
      if (res.error) {
        setFeedback({ type: 'error', message: res.error });
      } else {
        setFeedback({
          type: 'success',
          message: res.message || `Ownership transferred to @${memberName}.`,
        });
        setPendingTransferMember(null);
        router.refresh();
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to transfer ownership.' });
    } finally {
      setTransferringId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white">
              Business Team &amp; Staff
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Invite team members by @username. Owners have full editing access.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
          {1 + teamMembers.length} {1 + teamMembers.length === 1 ? 'Member' : 'Members'}
        </span>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {canManageTeam && (
        <form onSubmit={handleInvite} className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
            Add Team Member by @Username
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">
                @
              </span>
              <input
                type="text"
                value={inviteInput.replace(/^@/, '')}
                onChange={(e) => setInviteInput(e.target.value)}
                placeholder="username"
                className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !inviteInput.trim()}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserPlus className="w-3.5 h-3.5" />
              )}
              <span>Invite</span>
            </button>
          </div>
          <p className="text-[10px] text-gray-400 leading-snug">
            Enter any registered user&apos;s username. The invite will appear in their notifications.
          </p>
        </form>
      )}

      <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
          Team Roster
        </span>

        <div className="space-y-2">
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center font-bold text-xs text-gray-700 dark:text-gray-300">
                <Crown className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span>Page Owner</span>
                  <span className="text-[11px] text-gray-400 font-normal">• Creator</span>
                </span>
                <span className="text-[10px] text-gray-400">Primary Administrator &amp; Sole Authority to Delete</span>
              </div>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Primary Owner
            </span>
          </div>

          {localTeamMembers.map((member: any, idx: number) => {
            const memberId = typeof member === 'string' ? member : member?.user_id;
            const memberName = typeof member === 'object' && member?.username ? member.username : `Member ${idx + 1}`;
            const role = (typeof member === 'object' && member?.role ? member.role : 'staff').toLowerCase();
            const isMemberOwner = role === 'owner';

            return (
              <div
                key={memberId || idx}
                className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {memberName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-gray-900 dark:text-white truncate">
                          @{memberName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          • {isMemberOwner ? 'Co-Owner' : 'Staff'}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 block truncate">
                        {isMemberOwner ? 'Full Edit Permissions' : 'Staff Member'}
                      </span>
                    </div>
                  </div>

                  {canManageTeam && memberId && (
                    <button
                      type="button"
                      onClick={() => handlePromptRemoval(memberId, memberName)}
                      disabled={removingId === memberId}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                      title="Remove member"
                    >
                      {removingId === memberId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {(isTrueOwner || isAdmin) && memberId && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800 flex-wrap">
                    {!isMemberOwner && (
                      <button
                        type="button"
                        onClick={() => handleToggleRole(memberId, role, memberName)}
                        disabled={updatingRoleId === memberId}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {updatingRoleId === memberId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3 h-3 text-zinc-400" />
                        )}
                        <span>Make Co-Owner</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setPendingTransferMember({ id: memberId, name: memberName })}
                      disabled={transferringId === memberId}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>Transfer Ownership</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {pendingRemovalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                  Remove Team Member
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Are you sure you want to remove <span className="font-bold text-gray-900 dark:text-white">@{pendingRemovalMember.name}</span> from the business team?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setPendingRemovalMember(null)}
                disabled={removingId !== null}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs font-semibold text-gray-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeRemoveMember}
                disabled={removingId !== null}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {removingId ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <span>Remove Member</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingTransferMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                  Transfer Primary Ownership
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Transfer full ownership of this page to <span className="font-bold text-gray-900 dark:text-white">@{pendingTransferMember.name}</span>?
                </p>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900 p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 leading-relaxed">
              You will become a <strong>Co-Owner</strong> with full editing privileges, but only <strong>@{pendingTransferMember.name}</strong> will hold the sole right to delete the page or transfer ownership in the future.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setPendingTransferMember(null)}
                disabled={transferringId !== null}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs font-semibold text-gray-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeTransferOwnership}
                disabled={transferringId !== null}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {transferringId ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Transferring...</span>
                  </>
                ) : (
                  <span>Confirm Transfer</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingInvites.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>Pending Invitations ({pendingInvites.length})</span>
          </span>

          <div className="space-y-1.5">
            {pendingInvites.map((invite, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                    @{invite.username}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    • Awaiting acceptance
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">
                  Invited
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
