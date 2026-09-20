import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  Lock, 
  CreditCard, 
  Zap, 
  Check, 
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';
import StripePricingTable from '@/components/StripePricingTable';
import { createClient } from '@/utils/supabase/server';

export const metadata: Metadata = {
  title: 'ListMe Verified — Trust & Safety | Stand Out with the Verified Badge',
  description: 'Gain immediate buyer trust across Ireland with the ListMe Verified Badge. Choose between Verified Account (€4.99/mo), Verified Page (€4.99/mo), or the Bundle (€7.99/mo).',
};

export default async function VerifiedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const whyGetVerifiedBenefits = [
    {
      benefit: 'Instant Trust Badge',
      whatItMeans: 'Showcase the verified checkmark on your public profile, member page, and every item or service you post',
    },
    {
      benefit: 'Priority Ranking',
      whatItMeans: 'Verified listings appear prominently in search filters, marketplace categories, and featured recommendations',
    },
    {
      benefit: 'Scam & Fraud Shield',
      whatItMeans: 'Verified accounts unlock guaranteed platform resolution and Buyer Protection support up to €5,000',
    },
    {
      benefit: 'Priority Support',
      whatItMeans: 'Your support tickets are escalated and handled faster by our team',
    },
    {
      benefit: 'Simple, Transparent Pricing',
      whatItMeans: 'Cancel anytime with one click in your account settings',
    },
  ];

  const planComparison = [
    {
      feature: 'Official Verified Badge',
      account: '✅ Profile & Listings',
      page: '✅ Business Page',
      bundle: '✅ Both',
    },
    {
      feature: 'Priority Search Ranking',
      account: '✅',
      page: '✅',
      bundle: '✅',
    },
    {
      feature: 'Priority Support Escalation',
      account: '✅',
      page: '✅',
      bundle: '✅',
    },
    {
      feature: 'Buyer Protection up to €5,000',
      account: '✅',
      page: '✅',
      bundle: '✅',
    },
    {
      feature: 'Monthly Price',
      account: '€4.99',
      page: '€4.99',
      bundle: '€7.99',
    },
    {
      feature: 'Cancel Anytime',
      account: '✅',
      page: '✅',
      bundle: '✅',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-black py-10 px-4 sm:px-6 lg:px-8 text-gray-800 dark:text-gray-200">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">ListMe Verified</span>
        </div>

        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold border border-zinc-200 dark:border-zinc-700 shadow-xs">
            <VerifiedBadge size="xs" />
            <span>ListMe Verified — Trust &amp; Safety</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            Stand Out with the <br />
            <span className="text-gray-900 dark:text-white inline-flex items-center gap-2 mt-1">
              ListMe Verified Badge
              <VerifiedBadge size="lg" />
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Gain immediate buyer trust across Ireland. Verified sellers receive up to 3x more offers and instant credibility on every listing.
          </p>
        </div>

        <section className="bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-200/80 dark:border-zinc-800 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              Why Get Verified?
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Key advantages of holding the official ListMe Verified checkmark on your account and storefront.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white bg-gray-50/80 dark:bg-zinc-900/60 font-bold">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl">Benefit</th>
                  <th className="py-3.5 px-4 rounded-r-xl">What It Means</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                {whyGetVerifiedBenefits.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      {row.benefit}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                      {row.whatItMeans}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="plans" className="space-y-6">
          <div className="bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Choose Your Verification Plan
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xl mx-auto">
                Select your verified tier below to subscribe securely with Stripe. Cancel anytime with one click in your account settings.
              </p>
            </div>

            <StripePricingTable
              pricingTableId="prctbl_1UFYqWQ4vWyFpILpWMsKMVmf"
              publishableKey="pk_live_51TlR2gQ4vWyFpILpKmPSa2iCMOGH5zCE0dracV3PaWTDk1uA4MGJtC0kcIPXIjgSUVNZ6s5WGPOKbqclUPxuwemA00UMLqRB6r"
              clientReferenceId={user?.id}
              customerEmail={user?.email}
              className="min-h-[420px]"
            />
          </div>
        </section>

        <section className="bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-200/80 dark:border-zinc-800 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              What You Get With Every Plan
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Compare features across individual Verified Account, Verified Page, and the complete Bundle.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white bg-gray-50/80 dark:bg-zinc-900/60 font-bold">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl">Feature</th>
                  <th className="py-3.5 px-4 text-center">Verified Account</th>
                  <th className="py-3.5 px-4 text-center">Verified Page</th>
                  <th className="py-3.5 px-4 text-center rounded-r-xl">Bundle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80 font-medium">
                {planComparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                      {row.feature}
                    </td>
                    <td className="py-3.5 px-4 text-center text-gray-700 dark:text-gray-300">
                      {row.account}
                    </td>
                    <td className="py-3.5 px-4 text-center text-gray-700 dark:text-gray-300">
                      {row.page}
                    </td>
                    <td className="py-3.5 px-4 text-center text-primary font-bold">
                      {row.bundle}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Zero commitments. Cancel anytime in one click in your account settings.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800">
              <CreditCard className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Stripe Security</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Processed securely by Stripe. 256-bit encryption for all card transactions.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800">
              <Zap className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">No Long-Term Contracts</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Rolling monthly subscription. You can cancel at any moment with one click.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800">
              <ShieldCheck className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Instant Badge Activation</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Your badge activates automatically across your profile, listings, and pages once payment is confirmed.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-200/80 dark:border-zinc-800 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              Ready to Get Verified?
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select your tier below to begin checkout with Stripe.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white bg-gray-50/80 dark:bg-zinc-900/60 font-bold">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl">Plan</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80 font-medium">
                <tr className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">Verified Account</td>
                  <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300">€4.99/month</td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href="#plans"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-green-700 transition-colors shadow-xs"
                    >
                      <span>Get Verified Account</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">Verified Page</td>
                  <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300">€4.99/month</td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href="#plans"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-green-700 transition-colors shadow-xs"
                    >
                      <span>Get Verified Page</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                    Verified Account + Page Bundle
                  </td>
                  <td className="py-3.5 px-4 text-primary font-bold">€7.99/month</td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href="#plans"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-green-700 transition-colors shadow-xs"
                    >
                      <span>Get the Bundle</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-gray-200/80 dark:border-zinc-800 text-center space-y-2 text-xs text-gray-500 dark:text-gray-400">
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              Secured by Stripe • Cancel anytime in 1-click • No long-term contracts • Instant badge activation
            </p>
            <p>
              This page forms part of our{' '}
              <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>{' '}
              and{' '}
              <Link href="/buyer-protection" className="text-primary hover:underline">Buyer Protection</Link>{' '}
              policy.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
