'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Settings, ExternalLink, X, Check, Lock } from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';
import SelectBusinessPageModal from '@/components/SelectBusinessPageModal';
import { StripeLogo } from '@/components/StripeLogo';

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
  const [selectedPlan, setSelectedPlan] = useState<'personal' | 'business_combined'>('personal');
  const [showModal, setShowModal] = useState(false);
  const [showSelectPageModal, setShowSelectPageModal] = useState(false);
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

  const handleStartCheckout = async (plan: 'account' | 'bundle', businessPageSlug?: string) => {
    setCheckoutLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/verified/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan,
          ...(businessPageSlug ? { businessPageSlug } : {}),
        }),
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

  const handleSubscribe = async () => {
    if (selectedPlan === 'business_combined') {
      setShowModal(false);
      setShowSelectPageModal(true);
      return;
    }

    await handleStartCheckout('account');
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
          <span>Get Verified</span>
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

            <div className="p-6 overflow-y-auto space-y-5">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Select Subscription Plan:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedPlan('personal')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedPlan === 'personal'
                        ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-xs'
                        : 'border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60 hover:border-gray-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Personal / Member</span>
                      <span className="text-sm font-black text-primary">€9.99<span className="text-[10px] font-normal text-gray-500">/mo</span></span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                      Verified badge on your personal profile, 50% fee discount &amp; marketplace listings.
                    </p>
                  </div>

                  <div
                    onClick={() => setSelectedPlan('business_combined')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedPlan === 'business_combined'
                        ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-xs'
                        : 'border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60 hover:border-gray-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Account + Page Bundle</span>
                      <span className="text-sm font-black text-primary">€19.99<span className="text-[10px] font-normal text-gray-500">/mo</span></span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                      Verify yourself &amp; your business storefront with verified commercial badges across both.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Included Benefits:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">Official Verified Trust Badge</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                        Displayed prominently on your profile, listings, and storefronts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">Priority Ranking &amp; 50% Off Fees</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                        Verified items rank higher in marketplace searches and buyers save 50% on all service fees.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">Priority Support &amp; Buyer Protection</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                        Expedited human support ticket handling and enhanced Buyer Protection up to €10,000.
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
                    <span>Subscribe for {selectedPlan === 'business_combined' ? '€19.99' : '€9.99'}/mo</span>
                  </>
                )}
              </button>
            </div>

            <div className="px-6 py-3.5 bg-gray-50 dark:bg-zinc-900/60 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-1.5 flex-wrap">
                <Lock className="w-3 h-3 text-zinc-400 shrink-0" />
                <span>Processed securely by</span>
                <StripeLogo height={11} variant="blurple" />
                <span>• 256-bit encryption</span>
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

      {showSelectPageModal && (
        <SelectBusinessPageModal
          isOpen={true}
          plan="bundle"
          onClose={() => setShowSelectPageModal(false)}
          onConfirm={async (slug) => {
            await handleStartCheckout('bundle', slug);
          }}
          onSelectPersonal={() => {
            setShowSelectPageModal(false);
            setSelectedPlan('personal');
            handleStartCheckout('account');
          }}
          isProcessing={checkoutLoading}
        />
      )}
    </>
  );
}
