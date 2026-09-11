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
import { createClient } from '@/utils/supabase/server';

export default async function CommunityPage() {
  const supabase = await createClient();

  // Fetch genuine, exact statistics directly from Supabase (NO padding, NO fake numbers)
  const [listingsCountRes, profilesCountRes] = await Promise.all([
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ]);

  const activeListingsCount = listingsCountRes.count ?? 0;
  const memberCount = profilesCountRes.count ?? 0;

  const ANNOUNCEMENTS = [
    {
      id: 'ann-1',
      date: 'September 2026',
      title: '0% Success Fees on all Irish listings',
      tag: 'Platform Policy',
      summary: 'ListMe does not charge sales commissions or success fees. Keep 100% of your earnings when selling across all 26 counties.',
    },
    {
      id: 'ann-2',
      date: 'September 2026',
      title: 'Business Pages and Storefronts',
      tag: 'New Feature',
      summary: 'Verified Irish businesses and commercial sellers can now create dedicated storefront pages with opening hours, official announcements, and direct messaging.',
    },
    {
      id: 'ann-3',
      date: 'September 2026',
      title: 'Watchlist & Relisting Engine',
      tag: 'Updates',
      summary: 'Save items to your watchlist across devices. Unsold closed listings can now be relisted in 1 click or automatically cleared.',
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
            Platform announcements, Help Centre access, and verified marketplace statistics.
          </p>

          <div className="flex items-center gap-3 mt-4">
            <a
              href="#announcements"
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:border-gray-400 dark:hover:border-zinc-600 transition-colors"
            >
              Announcements
            </a>
            <Link
              href="/help"
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:border-gray-400 dark:hover:border-zinc-600 transition-colors"
            >
              Help Centre
            </Link>
            <a
              href="#stats"
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:border-gray-400 dark:hover:border-zinc-600 transition-colors"
            >
              Site Stats
            </a>
          </div>
        </div>

        {/* SECTION 1: ANNOUNCEMENTS */}
        <section id="announcements" className="scroll-mt-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-zinc-800">
            <h2 className="text-base font-bold uppercase tracking-wide text-gray-900 dark:text-white flex items-center gap-2">
              <BellRing className="w-4 h-4 text-primary" />
              <span>Announcements</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Link href="/category/marketplace" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                    <span>View marketplace</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
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
                  Browse FAQs about buying, selling with 0% fees, Buyer Protection coverage, or submit a support ticket directly to our team.
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Coverage</span>
                <Globe2 className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                26
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Core Republic Counties</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Success Fees</span>
                <ShieldCheck className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                0.0%
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Seller Commission</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
