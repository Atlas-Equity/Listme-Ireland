'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flag, X, Loader2, AlertTriangle, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { sendDiscordTicketNotificationAction } from '@/app/actions/supportTickets';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'user' | 'business';
  targetIdentifier: string;
  targetUrl: string;
  targetName?: string;
}

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetIdentifier,
  targetUrl,
  targetName,
}: ReportModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide details explaining why you are reporting this account.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
        return;
      }

      const newId = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowStr = new Date().toLocaleDateString('en-IE', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const userDisplayName = user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Member';
      const userAvatarUrl = user.user_metadata?.avatar_url || '';

      const fullMessage = `REPORT FILED AGAINST ${targetType.toUpperCase()}:\n` +
        `• Target: ${targetIdentifier}${targetName ? ` (${targetName})` : ''}\n` +
        `• Profile / Page URL: ${targetUrl}\n\n` +
        `Reason & Evidence Details:\n${reason.trim()}`;

      const newTicket: any = {
        id: newId,
        subject: `[REPORT] ${targetType === 'business' ? 'Business Storefront' : 'Member'}: ${targetIdentifier}`,
        category: 'Trust & Safety',
        status: 'Open',
        createdAt: nowStr,
        referenceId: targetUrl,
        userId: user.id,
        userEmail: user.email,
        userDisplayName,
        messages: [
          {
            id: 'msg-open',
            sender: 'user',
            senderName: userDisplayName,
            senderAvatar: userAvatarUrl,
            content: fullMessage,
            timestamp: 'Just now',
          },
          {
            id: 'msg-ack',
            sender: 'support',
            senderName: 'ListMe Disputes & Safety Team',
            content: 'Your report has been logged with highest priority. A trust officer will review the account, chat records, and evidence under our Buyer Protection & Scam Prevention policies.',
            timestamp: 'Just now',
          },
        ],
      };

      let existingTickets: any[] = [];
      try {
        const stored = localStorage.getItem('listme_support_tickets');
        if (stored) {
          existingTickets = JSON.parse(stored);
        }
      } catch {}

      if (Array.isArray(user.user_metadata?.support_tickets)) {
        for (const t of user.user_metadata.support_tickets) {
          if (!existingTickets.some((et) => et.id === t.id)) {
            existingTickets.push(t);
          }
        }
      }

      const updated = [newTicket, ...existingTickets];
      try {
        localStorage.setItem('listme_support_tickets', JSON.stringify(updated));
      } catch {}

      try {
        await supabase.auth.updateUser({
          data: { support_tickets: updated },
        });
      } catch {}

      try {
        await sendDiscordTicketNotificationAction({
          id: newId,
          subject: newTicket.subject,
          category: 'Trust & Safety',
          userDisplayName,
          userEmail: user.email,
          referenceId: targetUrl,
          initialMessage: fullMessage,
          createdAt: nowStr,
        });
      } catch {}

      onClose();
      router.push(`/help?tab=tickets&ticketId=${newId}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit report. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#151515] border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-6 pt-6 pb-5 border-b border-gray-100 dark:border-zinc-800 flex items-start justify-between bg-white dark:bg-[#151515]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Report {targetType === 'business' ? 'Storefront' : 'Member'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Trust &amp; Safety Incident Escalation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-medium">
              {error}
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-200/90 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700 dark:text-gray-300">
                Reporting:
              </span>
              <span className="font-mono font-extrabold text-gray-900 dark:text-white">
                {targetIdentifier}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 truncate">
              <span className="truncate">{targetUrl}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Reason / Prompt:
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the issue in detail (e.g. scam attempt, suspicious behaviour, counterfeit goods, non-delivery, policy violation)..."
              rows={4}
              maxLength={1000}
              className="w-full p-3.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
              <span>{reason.length} / 1000 characters</span>
              <span>Minimum 10 characters</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              Submitting this report will open a verified support ticket linked to this account, and take you directly to your ticket screen.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || reason.trim().length < 10}
            className="w-full py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Opening Support Ticket...</span>
              </>
            ) : (
              <>
                <Flag className="w-4 h-4" />
                <span>Submit Report &amp; Open Ticket</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="px-6 py-3.5 bg-gray-50 dark:bg-zinc-900/60 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
          <span>Protected under ListMe Trust &amp; Safety Policy</span>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:underline cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
