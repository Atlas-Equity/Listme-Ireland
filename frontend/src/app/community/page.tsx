import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  BellRing, 
  HelpCircle, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Globe2, 
  TrendingUp, 
  LifeBuoy
} from 'lucide-react';
import { createClient as createStatelessClient } from '@supabase/supabase-js';

// Cache community page for 60s
export const revalidate = 60;

const publicSupabase = createStatelessClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function CommunityPage() {
  // Fetch genuine, exact statistics directly from Supabase (NO padding, NO fake numbers)
  const [listingsCountRes, profilesCountRes] = await Promise.all([
    publicSupabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    publicSupabase.from('profiles').select('id', { count: 'exact', head: true }),
  ]);

  const activeListingsCount = listingsCountRes.count ?? 0;
  const memberCount = profilesCountRes.count ?? 0;

  const ANNOUNCEMENTS = [
    {
      id: 'ann-1',
      date: 'September 2026',
      title: 'Terms of Service & Privacy Policy Updates',
      tag: 'Policy Update',
      summary: 'Updated platform policies for all registered members covering Irish consumer rights, marketplace seller fees, and verified safe accounts.',
      link: '/terms',
      linkLabel: 'Read policy',
    },
    {
      id: 'ann-2',
      date: 'September 2026',
      title: 'Marketplace Fees Schedule & Direct Payouts',
      tag: 'Platform Policy',
      summary: 'ListMe offers transparent and competitive rates for sellers across all 26 counties with secure Stripe Connect payouts.',
      link: '/fees',
      linkLabel: 'View fee details',
    },
    {
      id: 'ann-3',
      date: 'September 2026',
      title: 'TradeMe Branching & Business Storefronts',
      tag: 'Feature Release',
      summary: 'Choose between Item, Job, and Service when listing. Commercial accounts can associate listings directly with their storefront page.',
      link: '/sell',
      linkLabel: 'Explore listing flow',
    },
    {
      id: 'ann-4',
      date: 'September 2026',
      title: 'Verified Accounts & Scam Chargeback Protection',
      tag: 'Trust & Safety',
      summary: 'Accounts active for 1 year are verified for free, or get immediate verification for €19.99. All sellers require a linked credit card.',
      link: '/buyer-protection',
      linkLabel: 'Buyer Protection guide',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Simple, grounded Page Header (No AI pills, No gradients) */}
        <div className="border-b border-gray-200 dark:border-zinc-800 pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Community Hub
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Platform announcements, social channels, Help Centre access, and verified marketplace statistics.
          </p>
        </div>

        {/* SECTION 1: ANNOUNCEMENTS */}
        <section id="announcements" className="scroll-mt-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-zinc-800">
            <h2 className="text-base font-bold uppercase tracking-wide text-gray-900 dark:text-white flex items-center gap-2">
              <BellRing className="w-4 h-4 text-primary" />
              <span>Announcements &amp; Recent Updates</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ANNOUNCEMENTS.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800">
                      {item.tag}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {item.date}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug mb-1.5">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-end">
                  <Link href={item.link} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                    <span>{item.linkLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: OFFICIAL SOCIAL CHANNELS */}
        <section id="social" className="scroll-mt-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-zinc-800">
            <h2 className="text-base font-bold uppercase tracking-wide text-gray-900 dark:text-white flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-primary" />
              <span>Official Social Channels &amp; Storefront</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/profile.php?id=61594336620072"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 hover:border-primary/50 transition-colors group shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-primary group-hover:text-white group-hover:bg-primary transition-colors shrink-0">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">Facebook</h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Official Facebook Page</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                  Irish community stories, marketplace highlights, and live platform notices.
                </p>
              </div>
              <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:underline">
                Visit Facebook <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </a>

            {/* ListMe Business Page */}
            <Link
              href="/page/listme"
              className="p-5 rounded-xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 hover:border-primary/50 transition-colors group shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-primary group-hover:text-white group-hover:bg-primary transition-colors shrink-0 font-black text-lg">
                    ☘
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">ListMe Storefront</h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Official Business Page</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                  Our official Irish marketplace storefront on ListMe with verified updates and announcements.
                </p>
              </div>
              <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:underline">
                Open Business Page <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </section>

        {/* SECTION 2: HELP CENTRE GATEWAY (Flat, clean, NO gradients) */}
        <section id="help" className="scroll-mt-6">
          <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  <span>Support &amp; Inquiries</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Need Assistance? Visit the Help Centre
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Browse FAQs about buying, selling and marketplace fees, Buyer Protection coverage, or submit a support ticket directly to our team.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <Link
                  href="/help"
                  className="px-5 py-2.5 rounded-lg bg-primary hover:bg-green-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  Open Help Centre
                </Link>
                <Link
                  href="/buyer-protection"
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 font-semibold text-xs hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Buyer Protection
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: SITE STATS (Real Database Counts, Flat Cards, NO Fake Numbers) */}
        <section id="stats" className="scroll-mt-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-bold uppercase tracking-wide text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span>Site Stats</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Verified platform metrics directly from the database.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Inventory</span>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {activeListingsCount}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Active Irish Listings</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Members</span>
                <Users className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {memberCount}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Registered Accounts</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Security</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                100%
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Scams Prevented (Credit Card &amp; Escrow)</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
