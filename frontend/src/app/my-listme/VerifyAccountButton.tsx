'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Settings, ExternalLink, X, Check, Lock } from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';

interface VerifyAccountButtonProps {
  isSubscribed?: boolean;
  userId?: string;
  userEmail?: string;
}

export default function VerifyAccountButton({ 
  isSubscribed = false,
  userId,
  userEmail,
}: VerifyAccountButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManage = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/verified/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to open billing portal.');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No billing portal URL returned.');
      }
    } catch (err: any) {
      console.error('Customer portal error:', err);
      setError(err?.message || 'Failed to open billing portal.');
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setCheckoutLoading(true);
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
      setCheckoutLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <button
          type="button"
          onClick={handleManage}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
          ) : (
            <Settings className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          )}
          <span>Manage Subscription</span>
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </button>

        {error && (
          <p className="text-[11px] text-red-500 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-start sm:items-end gap-1.5">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <VerifiedBadge size="xs" />
          <span>Get Verified for €4.99/mo</span>
        </button>

        {error && (
          <p className="text-[11px] text-red-500 font-medium max-w-xs text-left sm:text-right">
            {error}
          </p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-lg bg-white dark:bg-[#151515] border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative px-6 pt-6 pb-5 border-b border-gray-100 dark:border-zinc-800 flex items-start justify-between bg-white dark:bg-[#151515]">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                  <VerifiedBadge size="xl" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    ListMe Verified
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Official seller credibility, priority search, and scam protection.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-medium">
                  {error}
                </div>
              )}

              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Monthly Membership
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">€4.99</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">/ month</span>
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                    Billed monthly via Stripe. Cancel anytime in 1 click.
                  </p>
                </div>

                <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-xs font-semibold border border-gray-200 dark:border-zinc-700 shrink-0">
                  Instant Activation
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Membership Benefits:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">Official Verified Badge</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                        Displayed prominently on your profile, member page, and all active listings.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">Priority Ranking in Searches</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                        Verified items rank higher in marketplace searches and generate higher buyer confidence.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">Priority Support &amp; Buyer Protection</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                        Expedited human support ticket handling and full platform dispute protection up to €5,000.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubscribe}
                disabled={checkoutLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-green-700 text-white font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Stripe...</span>
                  </>
                ) : (
                  <>
                    <VerifiedBadge size="xs" />
                    <span>Subscribe for €4.99/mo</span>
                  </>
                )}
              </button>
            </div>

            <div className="px-6 py-3.5 bg-gray-50 dark:bg-zinc-900/60 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-zinc-400" />
                Processed securely by Stripe • 256-bit encryption
              </span>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
