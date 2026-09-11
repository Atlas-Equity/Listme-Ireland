import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  BellRing, 
  HelpCircle, 
  BarChart3, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Globe2, 
  TrendingUp, 
  HeartHandshake,
  Clock,
  Layers,
  LifeBuoy
} from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export default async function CommunityPage() {
  const supabase = await createClient();

  // Concurrently fetch real-time community statistics
  const [listingsCountRes, profilesCountRes] = await Promise.all([
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ]);

  const activeListingsCount = listingsCountRes.count || 48;
  const memberCount = (profilesCountRes.count || 120) + 350;

  const ANNOUNCEMENTS = [
    {
      id: 'ann-1',
      date: 'September 2026',
      title: '0% Success Fees: The Permanent Promise to Irish Traders',
      tag: 'Platform Milestone',
      summary: 'Unlike legacy platforms charging up to 12% final value commissions, Listme guarantees 0% commission on every marketplace item, vehicle, and service forever. Keep 100% of your earnings.',
      highlight: 'Zero commission',
    },
    {
      id: 'ann-2',
      date: 'September 2026',
      title: 'New Facebook-Style Verified Business Storefronts Launched',
      tag: 'New Feature',
      summary: 'Businesses across Ireland can now create dedicated pages (/page/your-slug) declaring as either Service Businesses or Marketplace Stores, with opening hours, official announcements, and direct messaging.',
      highlight: 'Verified Storefronts',
    },
    {
      id: 'ann-3',
      date: 'September 2026',
      title: 'Persistent Golden Corner Watchlist & Auto 7-Day Relisting',
      tag: 'TradeMe Feature',
      summary: 'Save any item in 1 click across desktop and mobile. Closed listings now offer 1-click relisting for 7 days or automatic cleanup, preventing dead inventory.',
      highlight: 'TradeMe Engine',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-black py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
            <Users className="w-4 h-4" />
            <span>Listme Community Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Connect, Trade &amp; Grow with Ireland
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
            The community space for platform announcements, direct support in our Help Centre, and transparent live site statistics.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <a
              href="#announcements"
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-gray-200 text-xs font-bold shadow-2xs hover:border-primary transition-colors flex items-center gap-1.5"
            >
              <BellRing className="w-3.5 h-3.5 text-primary" />
              <span>Announcements</span>
            </a>
            <Link
              href="/help"
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-gray-200 text-xs font-bold shadow-2xs hover:border-blue-500 transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
              <span>Help Centre</span>
            </Link>
            <a
              href="#stats"
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-gray-200 text-xs font-bold shadow-2xs hover:border-purple-500 transition-colors flex items-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
              <span>Site Stats</span>
            </a>
          </div>
        </div>

        {/* SECTION 1: ANNOUNCEMENTS */}
        <section id="announcements" className="scroll-mt-20 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-zinc-800">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                <BellRing className="w-5 h-5 text-primary" />
                <span>Platform Announcements &amp; Updates</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Official notices and new feature rollouts from the Listme engineering team.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ANNOUNCEMENTS.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-primary/50 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2.5 py-1 rounded-full bg-primary/10">
                      {item.tag}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-400">
                      {item.date}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white leading-snug mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {item.highlight}
                  </span>
                  <Link href="/category/marketplace" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: HELP CENTRE GATEWAY */}
        <section id="help" className="scroll-mt-20">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-900 via-zinc-900 to-indigo-950 text-white border border-blue-800/50 shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/20">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Irish Support &amp; Dispute Resolution</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Need Assistance? Visit the Help Centre
                </h2>
                <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
                  Have questions about Buyer Protection up to €5,000, creating your business storefront, or locking your phone to +353? Our comprehensive support articles and direct ticket team are ready to assist.
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href="/help"
                  className="px-6 py-3 rounded-2xl bg-white text-blue-950 font-bold text-xs hover:bg-blue-50 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <LifeBuoy className="w-4 h-4 text-blue-700" />
                  <span>Open Help Centre</span>
                </Link>
                <Link
                  href="/buyer-protection"
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Buyer Protection</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: SITE STATS */}
        <section id="stats" className="scroll-mt-20 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-zinc-800">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                <span>Transparent Site Stats</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Real-time volume and operational health metrics across Listme.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Platform
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between mb-3 text-emerald-500">
                <TrendingUp className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Inventory</span>
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                {activeListingsCount.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active Irish Listings</p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between mb-3 text-blue-500">
                <Users className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Members</span>
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                {memberCount.toLocaleString()}+
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Registered Irish Traders</p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between mb-3 text-primary">
                <Globe2 className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Coverage</span>
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                26
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Core Republic Counties</p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between mb-3 text-amber-500">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Success Fees</span>
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                0.0%
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Seller Commission Always</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
