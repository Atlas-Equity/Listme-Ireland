'use client';

import React, { useState } from 'react';
import { purchaseVerificationAction } from './actions';
import { Loader2, CheckCircle2 } from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';

export default function VerifyAccountButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleVerify = async () => {
    if (!window.confirm('Confirm upgrade to Verified Account for €19.99 one-time fee? You will receive an exclusive verified badge on your profile and listings.')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await purchaseVerificationAction();
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        window.location.reload();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to process verification.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        <span>Account Verified!</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={handleVerify}
        disabled={loading}
        className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-green-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        <span>Get Verified for €19.99 (One-Time)</span>
      </button>

      {error && (
        <p className="text-xs text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
