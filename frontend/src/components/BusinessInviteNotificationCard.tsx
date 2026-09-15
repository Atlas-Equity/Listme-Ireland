'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Check, X, Loader2, Users } from 'lucide-react';
import { respondToBusinessInvitationAction } from '@/app/actions/businessPages';

interface BusinessInviteNotificationCardProps {
  invite: {
    id: string;
    page_slug: string;
    page_name: string;
    inviter_username: string;
    inviter_id: string;
    invited_at: string;
    status: string;
  };
}

export default function BusinessInviteNotificationCard({ invite }: BusinessInviteNotificationCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isResolved, setIsResolved] = useState(false);

  const handleRespond = async (accept: boolean) => {
    setLoading(accept ? 'accept' : 'decline');
    setStatusMessage(null);
    try {
      const res = await respondToBusinessInvitationAction(invite.id, accept);
      if (res.error) {
        setStatusMessage(res.error);
        setLoading(null);
      } else {
        setIsResolved(true);
        setStatusMessage(accept ? 'Invitation accepted! Page added to your Business Pages.' : 'Invitation declined.');
        setTimeout(() => {
          router.refresh();
        }, 800);
      }
    } catch {
      setStatusMessage('Failed to process invitation.');
      setLoading(null);
    }
  };

  if (isResolved) {
    return (
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-xs text-gray-800 dark:text-zinc-200 flex items-center justify-between animate-in fade-in">
        <div className="flex items-center gap-2 font-semibold">
          <Check className="w-4 h-4 text-zinc-300" />
          <span>{statusMessage}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 shadow-xs hover:shadow-sm transition-all space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                Business Team Invitation
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                /page/{invite.page_slug}
              </span>
            </div>
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">
              @{invite.inviter_username} invited you to join &quot;{invite.page_name}&quot;
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed max-w-xl">
              Accepting will grant you staff access to this business page. It will appear under your <strong>Business Pages</strong> dashboard where you can assist with managing products, services, and inquiries.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => handleRespond(false)}
            disabled={loading !== null}
            className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {loading === 'decline' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5 text-gray-500" />}
            <span>Decline</span>
          </button>

          <button
            type="button"
            onClick={() => handleRespond(true)}
            disabled={loading !== null}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {loading === 'accept' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-white" />}
            <span>Accept Invitation</span>
          </button>
        </div>

      </div>

      {statusMessage && (
        <p className="text-xs text-red-500 font-semibold pt-1">
          {statusMessage}
        </p>
      )}
    </div>
  );
}
