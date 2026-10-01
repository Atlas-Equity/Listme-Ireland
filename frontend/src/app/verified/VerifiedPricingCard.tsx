'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { StripeLogo } from '@/components/StripeLogo';

interface VerifiedPricingCardProps {
  userId?: string;
  userEmail?: string;
}

export default function VerifiedPricingCard({ userId, userEmail }: VerifiedPricingCardProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/verified/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'account',
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
      setError(err?.message || 'Failed to start verified checkout.');
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {error && (
        <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-medium text-center shadow-xs">
          {error}
        </div>
      )}

      <div className="max-w-xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 border-2 border-primary/40 dark:border-primary/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl ring-4 ring-primary/5 relative">
          <div className="space-y-4">
            <div className="w-full rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800/80 bg-zinc-900 shadow-xs">
              <Image
                src="/ListMeVerifiedPersonalAccount.png"
                alt="ListMe Verified Personal Account Banner"
                width={1020}
                height={126}
                className="w-full h-auto object-cover"
                priority
              />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Official Verification</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                Verified Account
              </h3>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">€9.99</span>
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">/month</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-1">
                Perfect for buyers and sellers who want to build immediate trust, get priority search ranking, and save on fees.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">
                What&apos;s Included:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Official Verified Badge on your profile and all listings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Priority search ranking and up to 3x higher buyer trust</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Priority support ticket escalation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Enhanced Buyer Protection coverage up to €10,000</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="font-semibold text-gray-900 dark:text-white">50% off all buyer Service Fees on every purchase</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Extra layer of safety. Verified members are checked and trusted</span>
                </li>
                <li className="flex items-start gap-2 sm:col-span-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Cancel anytime in one click from your account settings</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100 dark:border-zinc-800 space-y-2">
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-green-700 text-white font-extrabold text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Get Verified Account for €9.99/mo</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-gray-400 text-center">Instant badge activation once payment is confirmed • Cancel anytime with 1 click</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
        <span className="inline-flex items-center gap-1.5 flex-wrap justify-center">
          <span>Secured by</span>
          <StripeLogo height={13} variant="blurple" />
          <span>• 256-bit encryption • Cancel anytime in 1 click • Instant badge activation</span>
        </span>
      </div>
    </div>
  );
}
