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

  const handleRemoveMember = async (memberUserId: string) => {
    if (!confirm('Are you sure you want to remove this member from the business team?')) return;
    setRemovingId(memberUserId);
    setFeedback(null);
    try {
      const res = await removeBusinessTeamMemberAction(pageSlug, memberUserId);
      if (res.error) {
        setFeedback({ type: 'error', message: res.error });
      } else {
        setFeedback({ type: 'success', message: 'Team member removed.' });
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
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
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

        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
          {1 + teamMembers.length} {1 + teamMembers.length === 1 ? 'Member' : 'Members'}
        </span>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
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
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">
                  Page Owner
                </span>
                <span className="text-[10px] text-gray-400">Primary Administrator</span>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
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
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
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
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    Staff
                  </span>

                  {(isOwner || isAdmin) && memberId && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(memberId)}
                      disabled={removingId === memberId}
                      className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors"
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
                className="p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                    @{invite.username}
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400">
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
