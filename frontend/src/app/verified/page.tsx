import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, ArrowRight, TrendingUp, Lock } from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';
import { createClient } from '@/utils/supabase/server';
import VerifiedPricingCard from './VerifiedPricingCard';

export const metadata: Metadata = {
  title: 'ListMe Verified | Get Verified for €4.99/month',
  description: 'Earn the official ListMe Verified Badge on your profile and listings. Unlock higher buyer trust, priority search visibility, and scam protection for €4.99/month.',
};

export default async function VerifiedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold border border-zinc-200 dark:border-zinc-700 shadow-xs">
            <VerifiedBadge size="xs" />
            <span>Official ListMe Trust &amp; Safety</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Stand out with the <br />
            <span className="text-gray-900 dark:text-white inline-flex items-center gap-2">
              ListMe Verified Badge
              <VerifiedBadge size="lg" />
            </span>
          </h1>

          <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Gain immediate buyer trust across Ireland. Verified sellers receive up to 3x more offers and instant credibility on every listing.
          </p>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#181818] border border-gray-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-xs flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Instant Trust Badge
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Showcase the verified checkmark on your public profile, member page, and every item, car, or service you post.
            </p>
          </div>

          <div className="bg-white dark:bg-[#181818] border border-gray-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-xs flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Priority Ranking
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Verified listings appear prominently in search filters, marketplace categories, and featured recommendations.
            </p>
          </div>

          <div className="bg-white dark:bg-[#181818] border border-gray-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-xs flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Scam &amp; Fraud Shield
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Verified accounts unlock guaranteed platform resolution and Buyer Protection support up to €5,000.
            </p>
          </div>
        </div>

        
        <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              €4.99 per month • Cancel anytime with one click in your account settings.
            </p>
          </div>

          <VerifiedPricingCard />

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No long-term contracts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Instant badge activation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Secured by Stripe</span>
            </div>
          </div>
        </div>

        
        <div className="p-6 rounded-2xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">
              Been on ListMe for over a year?
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Platform veteran accounts active for 12+ months automatically receive free verification.
            </p>
          </div>
          <Link
            href="/my-listme?tab=account"
            className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 text-xs font-bold border border-gray-200 dark:border-zinc-700 transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>Check Account Status</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
