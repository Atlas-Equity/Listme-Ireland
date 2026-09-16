'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, Lock } from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';

export default function VerifiedPricingCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/verified/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        if (res.status === 401) {
          router.push('/login?redirect=/verified');
          return;
        }
        throw new Error(data.error || 'Failed to initialize subscription checkout.');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned from payment server.');
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err?.message || 'Failed to start verified checkout.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-gray-50 dark:bg-zinc-900/90 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-md">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-medium text-center">
          {error}
        </div>
      )}

      <div className="text-center pb-6 border-b border-gray-200 dark:border-zinc-800">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary dark:text-green-400 text-xs font-bold uppercase tracking-wider mb-2">
          Monthly Membership
        </span>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">€4.99</span>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">/ month</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Zero commitments. Cancel anytime in one click in your account settings.
        </p>
      </div>

      <div className="py-6 space-y-3.5">
        <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span>Official Verified Badge on profile and all listings</span>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span>Priority search ranking &amp; 3x higher buyer trust</span>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span>Priority support ticket escalation</span>
        </div>
        <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span>Enhanced Buyer Protection coverage up to €5,000</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-green-700 text-white font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Connecting to Stripe...</span>
          </>
        ) : (
          <>
            <VerifiedBadge size="xs" />
            <span>Get Verified for €4.99/mo</span>
          </>
        )}
      </button>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
        <Lock className="w-3 h-3 text-zinc-400" />
        <span>Processed securely by Stripe • 256-bit encryption</span>
      </div>
    </div>
  );
}
