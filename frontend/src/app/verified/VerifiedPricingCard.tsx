'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, Lock, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';

type PlanType = 'account' | 'page' | 'bundle';

interface VerifiedPricingCardProps {
  userId?: string;
  userEmail?: string;
}

export default function VerifiedPricingCard({ userId, userEmail }: VerifiedPricingCardProps) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (plan: PlanType) => {
    setLoadingPlan(plan);
    setError(null);

    try {
      const res = await fetch('/api/verified/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
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
      setLoadingPlan(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {error && (
        <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-medium text-center shadow-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:border-gray-300 dark:hover:border-zinc-700 transition-all duration-200 relative">
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
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-primary dark:text-blue-400 text-[11px] font-bold">
                Personal
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                Verified Account
              </h3>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl font-black text-gray-900 dark:text-white">€9.99</span>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">/month</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed pt-1">
                Perfect for individual buyers and sellers who want to build trust and save on fees.
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">
                What&apos;s Included:
              </span>
              <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
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
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Cancel anytime in one click</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100 dark:border-zinc-800 space-y-2">
            <button
              type="button"
              onClick={() => handleSubscribe('account')}
              disabled={loadingPlan !== null}
              className="w-full py-3.5 px-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-zinc-100 font-extrabold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loadingPlan === 'account' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Get Verified Account for €9.99/mo</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-400 text-center">Cancel anytime with 1 click</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:border-gray-300 dark:hover:border-zinc-700 transition-all duration-200 relative">
          <div className="space-y-4">
            <div className="w-full rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800/80 bg-zinc-900 shadow-xs">
              <Image
                src="/ListMeBusinessVerifiedPage.png"
                alt="ListMe Business Verified Page Banner"
                width={1020}
                height={120}
                className="w-full h-auto object-cover"
                priority
              />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 text-[11px] font-bold">
                Business
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                Verified Page
              </h3>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl font-black text-gray-900 dark:text-white">€14.99</span>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">/month</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed pt-1">
                Perfect for Business Page owners who want their storefront to stand out.
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">
                What&apos;s Included:
              </span>
              <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Official Verified Badge on your Business Page</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Priority ranking for your Business Page in search and categories</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Priority support ticket escalation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Extra layer of safety. Verified businesses are checked and trusted</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Cancel anytime in one click</span>
                </li>
              </ul>

              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700/60 text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                Please note: Business accounts are seller only and cannot purchase on ListMe.ie, so buyer benefits do not apply.
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100 dark:border-zinc-800 space-y-2">
            <button
              type="button"
              onClick={() => handleSubscribe('page')}
              disabled={loadingPlan !== null}
              className="w-full py-3.5 px-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-zinc-100 font-extrabold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loadingPlan === 'page' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Get Verified Page for €14.99/mo</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-400 text-center">Cancel anytime with 1 click</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border-2 border-primary rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-lg ring-4 ring-primary/10 transition-all duration-200 relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Best Value • Save €4.99/month</span>
          </div>

          <div className="space-y-4 pt-1">
            <div className="w-full rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800/80 bg-zinc-900 shadow-xs">
              <Image
                src="/ListMeVerifiedBundle.png"
                alt="ListMe Verified Bundle Banner"
                width={1020}
                height={123}
                className="w-full h-auto object-cover"
                priority
              />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold">
                Account + Page Bundle
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                Verified Bundle
              </h3>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl font-black text-primary">€19.99</span>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">/month</span>
                <span className="text-[11px] text-gray-400 line-through ml-1.5">€24.98</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed pt-1">
                Best value. Get both your personal account and your Business Page verified.
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                Complete Bundle Perks:
              </span>
              <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Official Verified Badge on your profile, all listings, and your Business Page</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Priority search ranking across your account and storefront</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Priority support ticket escalation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Enhanced Buyer Protection coverage up to €10,000 (personal account)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="font-semibold text-gray-900 dark:text-white">50% off all buyer Service Fees on every purchase (personal account)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Extra layer of safety across your account and Business Page</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Cancel anytime in one click</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100 dark:border-zinc-800 space-y-2">
            <button
              type="button"
              onClick={() => handleSubscribe('bundle')}
              disabled={loadingPlan !== null}
              className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-green-700 text-white font-extrabold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
            >
              {loadingPlan === 'bundle' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Get the Bundle for €19.99/mo (Save €4.99/month)</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-400 text-center">Instant badge activation once payment is confirmed</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2">
        <ShieldCheck className="w-4 h-4 text-primary" />
        <span>Secured by Stripe • 256-bit encryption • Cancel anytime in 1 click • Instant badge activation</span>
      </div>
    </div>
  );
}
