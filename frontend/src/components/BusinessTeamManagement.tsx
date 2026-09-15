'use client';

import React, { useState } from 'react';
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
  Crown
} from 'lucide-react';
import { 
  inviteBusinessTeamMemberAction, 
  removeBusinessTeamMemberAction 
} from '@/app/actions/businessPages';

interface BusinessTeamManagementProps {
  pageSlug: string;
  isOwner: boolean;
  isAdmin?: boolean;
  teamMembers?: any[];
  pendingInvites?: { username: string; user_id?: string; invited_at: string }[];
}

export default function BusinessTeamManagement({
  pageSlug,
  isOwner,
  isAdmin = false,
  teamMembers = [],
  pendingInvites = [],
}: BusinessTeamManagementProps) {
  const router = useRouter();
  const [inviteInput, setInviteInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [pendingRemovalMember, setPendingRemovalMember] = useState<{ id: string; name: string } | null>(null);

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
              Invite team members by their @username to manage this page together.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700">
          {1 + teamMembers.length} {1 + teamMembers.length === 1 ? 'Member' : 'Members'}
        </span>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200'
              : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0 text-zinc-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Invite Member Input (Only owner / admin) */}
      {(isOwner || isAdmin) && (
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
            Enter any registered user&apos;s username. The invite will be delivered to their Notifications tab where they can accept it.
          </p>
        </form>
      )}

      {/* Current Team Members List */}
      <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
          Current Roster
        </span>

        <div className="space-y-2">
          {/* Owner Entry */}
          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center font-bold text-xs">
                <Crown className="w-3.5 h-3.5 text-zinc-300" />
              </div>
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">
                  Page Owner
                </span>
                <span className="text-[10px] text-gray-400">Primary Administrator</span>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
              Owner
            </span>
          </div>

          {/* Additional Team Members */}
          {teamMembers.map((member: any, idx: number) => {
            const memberId = typeof member === 'string' ? member : member?.user_id;
            const memberName = typeof member === 'object' && member?.username ? member.username : `Member ${idx + 1}`;
            return (
              <div
                key={memberId || idx}
                className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 flex items-center justify-center font-bold text-xs">
                    {memberName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white block">
                      @{memberName}
                    </span>
                    <span className="text-[10px] text-gray-400">Team Staff Member</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                    Staff
                  </span>

                  {(isOwner || isAdmin) && memberId && (
                    <button
                      type="button"
                      onClick={() => handlePromptRemoval(memberId, memberName)}
                      disabled={removingId === memberId}
                      className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
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
              </div>
            );
          })}
        </div>
      </div>

      {/* In-App Confirmation Modal (Replaces browser "www.listme.ie says" confirm) */}
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

      {/* Pending Invites List */}
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
                className="p-2 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-between text-xs"
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
