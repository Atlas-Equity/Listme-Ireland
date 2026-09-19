'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';

type PlanType = 'account' | 'page' | 'bundle';

interface VerifiedPricingCardProps {
  initialPlan?: PlanType;
}

export default function VerifiedPricingCard({ initialPlan = 'bundle' }: VerifiedPricingCardProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(initialPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planToCheckout: PlanType = selectedPlan) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/verified/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planToCheckout }),
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
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#fafbfc] dark:bg-zinc-900/90 border border-gray-200/90 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-medium text-center">
          {error}
        </div>
      )}

      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Choose Your Verification Plan
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Select the verification tier that fits your activity on ListMe.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div
          onClick={() => setSelectedPlan('account')}
          className={`p-4 rounded-2xl border cursor-pointer text-left transition-all ${
            selectedPlan === 'account'
              ? 'border-primary bg-primary/10 shadow-xs ring-2 ring-primary/20'
              : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300'
          }`}
        >
          <span className="text-xs font-bold text-gray-900 dark:text-white block">Verified Account</span>
          <span className="text-xl font-black text-primary block mt-1">
            €4.99<span className="text-[10px] font-medium text-gray-500">/mo</span>
          </span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">For individual sellers</span>
        </div>

        <div
          onClick={() => setSelectedPlan('page')}
          className={`p-4 rounded-2xl border cursor-pointer text-left transition-all ${
            selectedPlan === 'page'
              ? 'border-primary bg-primary/10 shadow-xs ring-2 ring-primary/20'
              : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300'
          }`}
        >
          <span className="text-xs font-bold text-gray-900 dark:text-white block">Verified Page</span>
          <span className="text-xl font-black text-primary block mt-1">
            €4.99<span className="text-[10px] font-medium text-gray-500">/mo</span>
          </span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">For Business Pages</span>
        </div>

        <div
          onClick={() => setSelectedPlan('bundle')}
          className={`p-4 rounded-2xl border cursor-pointer text-left transition-all relative ${
            selectedPlan === 'bundle'
              ? 'border-primary bg-primary/10 shadow-xs ring-2 ring-primary/20'
              : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300'
          }`}
        >
          <span className="absolute -top-2.5 right-3 bg-primary text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wide">
            Save €1.99
          </span>
          <span className="text-xs font-bold text-gray-900 dark:text-white block">Account + Page</span>
          <span className="text-xl font-black text-primary block mt-1">
            €7.99<span className="text-[10px] font-medium text-gray-500">/mo</span>
          </span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">Best value bundle</span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/70 border border-gray-200/80 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <VerifiedBadge size="sm" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            {selectedPlan === 'account' && 'Verified Account Perks'}
            {selectedPlan === 'page' && 'Verified Page Perks'}
            {selectedPlan === 'bundle' && 'Bundle Perks (Account + Storefront)'}
          </span>
        </div>

        <ul className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              {selectedPlan === 'account' && 'Official Verified Badge on your profile and all listings'}
              {selectedPlan === 'page' && 'Official Verified Badge on your Business Page'}
              {selectedPlan === 'bundle' && 'Official Verified Badge on your profile, all listings, and your Business Page'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              {selectedPlan === 'account' && 'Priority search ranking and up to 3x higher buyer trust'}
              {selectedPlan === 'page' && 'Priority ranking for your Business Page in search and categories'}
              {selectedPlan === 'bundle' && 'Priority search ranking across your account and storefront'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>Priority support ticket escalation</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>Enhanced Buyer Protection coverage up to €5,000</span>
          </li>
        </ul>
      </div>

      <button
        type="button"
        onClick={() => handleSubscribe(selectedPlan)}
        disabled={loading}
        className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-green-700 text-white font-extrabold text-sm sm:text-base transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span>
              {selectedPlan === 'account' && 'Get Verified Account for €4.99/mo'}
              {selectedPlan === 'page' && 'Get Verified Page for €4.99/mo'}
              {selectedPlan === 'bundle' && 'Get the Bundle for €7.99/mo (Save €1.99/month)'}
            </span>
          </>
        )}
      </button>

      <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center mt-3 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
        <span>Secured by Stripe • Cancel anytime in 1 click • Instant activation</span>
      </p>
    </div>
  );
}
