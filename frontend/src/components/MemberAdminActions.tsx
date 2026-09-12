'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Ban, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Clock, 
  X, 
  Loader2,
  Lock,
  Unlock,
  Award
} from 'lucide-react';
import { 
  grantFreeVerifiedAction, 
  revokeVerifiedAction, 
  banUserAccountAction, 
  unbanUserAccountAction, 
  assignAdminRoleAction, 
  revokeAdminRoleAction 
} from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

interface MemberAdminActionsProps {
  targetUserId: string;
  targetUsername: string;
  isCurrentlyVerified: boolean;
  isCurrentlyAdmin: boolean;
  banStatus: {
    isBanned: boolean;
    bannedUntil?: string;
    reason?: string;
  };
}

export default function MemberAdminActions({
  targetUserId,
  targetUsername,
  isCurrentlyVerified,
  isCurrentlyAdmin,
  banStatus,
}: MemberAdminActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banDuration, setBanDuration] = useState<number>(168); // Default 7 days (168h)
  const [banReason, setBanReason] = useState('Violation of ListMe Marketplace Community Standards');

  const handleGrantVerified = async () => {
    setLoading(true);
    const res = await grantFreeVerifiedAction(targetUserId, 'Personally Verified by Admin');
    setLoading(false);
    if (res.success) {
      setToastMessage(res.message || 'Verified badge granted.');
      router.refresh();
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      alert(res.error || 'Failed to grant verified badge.');
    }
  };

  const handleRevokeVerified = async () => {
    if (!window.confirm(`Revoke verified badge from @${targetUsername}?`)) return;
    setLoading(true);
    const res = await revokeVerifiedAction(targetUserId);
    setLoading(false);
    if (res.success) {
      setToastMessage(res.message || 'Verified badge revoked.');
      router.refresh();
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      alert(res.error || 'Failed to revoke verified badge.');
    }
  };

  const handleToggleAdminRole = async () => {
    if (isCurrentlyAdmin) {
      if (!window.confirm(`Revoke Administrator privileges from @${targetUsername}?`)) return;
      setLoading(true);
      const res = await revokeAdminRoleAction(targetUserId);
      setLoading(false);
      if (res.success) {
        setToastMessage(res.message || 'Admin role revoked.');
        router.refresh();
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        alert(res.error || 'Failed to revoke admin role.');
      }
    } else {
      if (!window.confirm(`Grant Administrator privileges to @${targetUsername}? They will be able to manage support channels, verify users, and ban accounts.`)) return;
      setLoading(true);
      const res = await assignAdminRoleAction(targetUserId);
      setLoading(false);
      if (res.success) {
        setToastMessage(res.message || 'Admin privileges assigned.');
        router.refresh();
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        alert(res.error || 'Failed to assign admin role.');
      }
    }
  };

  const handleExecuteBan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await banUserAccountAction(targetUserId, banDuration, banReason);
    setLoading(false);
    if (res.success) {
      setShowBanModal(false);
      setToastMessage(res.message || 'Account suspended.');
      router.refresh();
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      alert(res.error || 'Failed to suspend account.');
    }
  };

  const handleUnban = async () => {
    if (!window.confirm(`Restore account access for @${targetUsername}?`)) return;
    setLoading(true);
    const res = await unbanUserAccountAction(targetUserId);
    setLoading(false);
    if (res.success) {
      setToastMessage(res.message || 'Account restored.');
      router.refresh();
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      alert(res.error || 'Failed to unban account.');
    }
  };

  return (
    <div className="mb-6 p-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-white shadow-md">
      {toastMessage && (
        <div className="mb-3 p-3 rounded-xl bg-zinc-800 border border-emerald-500/50 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Administrator Moderation Panel
            </span>
          </div>
          <p className="text-xs text-zinc-300 mt-1">
            Managing account <strong className="text-white">@{targetUsername}</strong> (UUID: {targetUserId.slice(0, 8)}...)
          </p>
          {banStatus.isBanned && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-950/60 px-2.5 py-1 rounded-md border border-red-800/80 w-fit">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>
                Account Suspended: {banStatus.reason}
                {banStatus.bannedUntil ? ` (Until ${new Date(banStatus.bannedUntil).toLocaleDateString()})` : ' (Permanent)'}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Verified Badge Grant / Revoke */}
          {isCurrentlyVerified ? (
            <button
              type="button"
              onClick={handleRevokeVerified}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Revoke Verified</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGrantVerified}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Give Free Verified</span>
            </button>
          )}

          {/* Ban / Suspension Trigger */}
          {banStatus.isBanned ? (
            <button
              type="button"
              onClick={handleUnban}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unban Account</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowBanModal(true)}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Ban / Suspend User</span>
            </button>
          )}

          {/* Admin Role Toggle */}
          <button
            type="button"
            onClick={handleToggleAdminRole}
            disabled={loading}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 ${
              isCurrentlyAdmin
                ? 'border-amber-700 bg-amber-950/60 text-amber-300 hover:bg-amber-900'
                : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-primary" />
            <span>{isCurrentlyAdmin ? 'Revoke Admin' : 'Assign Admin'}</span>
          </button>
        </div>
      </div>

      {/* Ban / Suspension Duration Modal */}
      {showBanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-base">Suspend Account @{targetUsername}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBanModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteBan} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Suspension Duration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '24 Hours', hours: 24 },
                    { label: '7 Days', hours: 168 },
                    { label: '30 Days', hours: 720 },
                    { label: 'Permanent Shut Down', hours: -1 },
                  ].map((opt) => (
                    <button
                      key={opt.hours}
                      type="button"
                      onClick={() => setBanDuration(opt.hours)}
                      className={`p-2.5 rounded-xl border font-bold text-left transition-colors cursor-pointer ${
                        banDuration === opt.hours
                          ? 'border-red-500 bg-red-950/60 text-white'
                          : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Reason for Suspension
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-1 focus:ring-red-500 font-sans"
                  placeholder="e.g. Fraud prevention, non-responsive after listing closed, policy violation..."
                />
              </div>

              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-400 space-y-1">
                <p>• Suspended users cannot list items, send messages, or bid.</p>
                <p>• All active listings by this user will be immediately closed.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowBanModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Suspension</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
