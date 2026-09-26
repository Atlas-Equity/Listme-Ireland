import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  CreditCard, 
  Clock, 
  Check, 
  ChevronRight,
  Percent,
  HelpCircle
} from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';
import VerifiedPricingCard from './VerifiedPricingCard';
import { StripeLogo, StripeBadge } from '@/components/StripeLogo';

export const metadata: Metadata = {
  title: 'ListMe Verified — Trust & Safety | Stand Out with the Verified Badge',
  description: 'Gain immediate buyer trust across Ireland with the ListMe Verified Badge. Choose between Verified Account (€9.99/mo), Verified Page (€14.99/mo), or the Bundle (€19.99/mo).',
};

export const revalidate = 300;

export default function VerifiedPage() {
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
      benefit: 'Scam and Fraud Shield',
      whatItMeans: 'Verified accounts unlock guaranteed platform resolution and enhanced Buyer Protection up to €10,000',
    },
    {
      benefit: 'Extra Layer of Safety',
      whatItMeans: 'Verified members are checked and trusted. They are safer to trade with, buy from, and sell to',
    },
    {
      benefit: 'Priority Support',
      whatItMeans: 'Your support tickets are escalated and handled faster by our team',
    },
    {
      benefit: '50% Off Buyer Service Fees',
      whatItMeans: 'Verified buyers pay half the standard Service Fee on every purchase',
    },
    {
      benefit: 'Simple, Transparent Pricing',
      whatItMeans: 'Cancel anytime with one click in your account settings',
    },
  ];

  const planComparison = [
    {
      feature: 'Official Verified Badge',
      account: 'Profile and Listings',
      page: 'Business Page',
      bundle: 'Both',
    },
    {
      feature: 'Priority Search Ranking',
      account: 'Yes',
      page: 'Yes',
      bundle: 'Yes',
    },
    {
      feature: 'Priority Support Escalation',
      account: 'Yes',
      page: 'Yes',
      bundle: 'Yes',
    },
    {
      feature: 'Extra Layer of Safety',
      account: 'Yes',
      page: 'Yes',
      bundle: 'Yes',
    },
    {
      feature: 'Buyer Protection',
      account: 'Up to €10,000',
      page: 'N/A (business cannot buy)',
      bundle: 'Up to €10,000 (personal)',
    },
    {
      feature: '50% Off Buyer Service Fees',
      account: 'Yes',
      page: 'N/A',
      bundle: 'Yes (personal)',
    },
    {
      feature: 'Monthly Price',
      account: '€9.99',
      page: '€14.99',
      bundle: '€19.99',
    },
    {
      feature: 'Cancel Anytime',
      account: 'Yes',
      page: 'Yes',
      bundle: 'Yes',
    },
  ];

  const feeDiscountTiers = [
    {
      range: '€10.00 – €50.00',
      standard: '4%',
      verified: '2%',
    },
    {
      range: '€50.01 – €250.00',
      standard: '3.5%',
      verified: '1.75%',
    },
    {
      range: '€250.01+',
      standard: '3%',
      verified: '1.5%',
    },
  ];

  const buyerProtectionComparison = [
    {
      level: 'Maximum Buyer Protection',
      standard: 'Up to €5,000',
      verified: 'Up to €10,000',
    },
    {
      level: 'Extra Layer of Safety',
      standard: 'No',
      verified: 'Yes',
    },
    {
      level: 'Safer to Trade With, Buy From, and Sell To',
      standard: 'Standard',
      verified: 'Verified and Trusted',
    },
    {
      level: 'Human Investigation',
      standard: 'Yes',
      verified: 'Yes',
    },
    {
      level: 'Scam Penalties for Sellers',
      standard: 'Yes',
      verified: 'Yes',
    },
    {
      level: 'Priority Ticket Handling',
      standard: 'No',
      verified: 'Yes',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-black py-10 px-4 sm:px-6 lg:px-8 text-gray-800 dark:text-gray-200">
      <div className="max-w-6xl mx-auto space-y-12">
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
          <div className="bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Choose Your Verification Plan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Select the Ideal Tier for You
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Personal account, Business Page storefront, or the all-inclusive bundle. Cancel anytime with one click in your account settings.
              </p>
            </div>

            <VerifiedPricingCard />
          </div>
        </section>

        <section className="bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-200/80 dark:border-zinc-800 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              What You Get With Every Plan
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Compare features across Verified Account, Verified Page, and the complete Bundle.
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
          <div className="border-b border-gray-200/80 dark:border-zinc-800 pb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-2">
              <Percent className="w-3.5 h-3.5" />
              <span>50% Fee Discount</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              How the 50% Buyer Service Fee Discount Works
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Verified buyers pay half the standard Service Fee on every single item purchased across ListMe.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white bg-gray-50/80 dark:bg-zinc-900/60 font-bold">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl">Purchase Price</th>
                  <th className="py-3.5 px-4 text-center">Standard Service Fee</th>
                  <th className="py-3.5 px-4 text-center rounded-r-xl text-emerald-600 dark:text-emerald-400">Verified Member Fee (50% Off)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80 font-medium">
                {feeDiscountTiers.map((tier, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                      {tier.range}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-gray-600 dark:text-gray-400">
                      {tier.standard}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {tier.verified}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-200/80 dark:border-emerald-900/40 space-y-2">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Real World Example:</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              You buy an item for €200. Standard Service Fee would be 3.5% (€7.00). As a Verified member, you pay 1.75% (€3.50). That is a saving of €3.50 on a single purchase.
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              If you buy regularly, the subscription pays for itself quickly.
            </p>
          </div>
        </section>

        <section className="bg-[#fafbfc] dark:bg-[#181818] border border-gray-200/90 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-200/80 dark:border-zinc-800 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              Buyer Protection and Safety — Verified vs Standard
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Compare coverage limits and security levels between standard and verified platform members.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white bg-gray-50/80 dark:bg-zinc-900/60 font-bold">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl">Protection Level</th>
                  <th className="py-3.5 px-4 text-center">Standard Members</th>
                  <th className="py-3.5 px-4 text-center rounded-r-xl text-primary font-bold">Verified Members</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80 font-medium">
                {buyerProtectionComparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                      {row.level}
                    </td>
                    <td className="py-3.5 px-4 text-center text-gray-600 dark:text-gray-400">
                      {row.standard}
                    </td>
                    <td className="py-3.5 px-4 text-center text-primary font-bold">
                      {row.verified}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800">
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Verified members get double the protection ceiling and an extra layer of safety. That means if something goes wrong on a high value purchase, you are covered far beyond the standard limit. And when you trade with a verified member, you know you are dealing with someone who has been checked and trusted.
            </p>
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
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="w-5 h-5 text-[#635BFF]" />
                <StripeBadge variant="pill" size="sm" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                <StripeLogo height={13} variant="blurple" />
                <span>Security</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Processed securely by Stripe with 256-bit bank-grade encryption for all transactions.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800">
              <Clock className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">No Long Term Contracts</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Rolling monthly subscription. You can cancel at any moment with one click.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800">
              <ShieldCheck className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Instant Badge Activation</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Instant badge activation once payment is confirmed.
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
                  <th className="py-3.5 px-4">Best For</th>
                  <th className="py-3.5 px-4 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80 font-medium">
                <tr className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">Verified Account</td>
                  <td className="py-3.5 px-4 font-mono text-gray-700 dark:text-gray-300">€9.99/month</td>
                  <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">Personal buyers and sellers</td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href="#plans"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs hover:bg-black dark:hover:bg-zinc-100 transition-colors shadow-xs"
                    >
                      <span>Get Verified Account</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">Verified Page</td>
                  <td className="py-3.5 px-4 font-mono text-gray-700 dark:text-gray-300">€14.99/month</td>
                  <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">Business sellers only</td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href="#plans"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs hover:bg-black dark:hover:bg-zinc-100 transition-colors shadow-xs"
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
                  <td className="py-3.5 px-4 font-mono text-primary font-bold">€19.99/month</td>
                  <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">Personal and Business together (best value)</td>
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
            <p className="font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1.5 flex-wrap">
              <span>Secured by</span>
              <StripeLogo height={13} variant="blurple" />
              <span>• Cancel anytime in 1 click • No long term contracts • Instant badge activation</span>
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
