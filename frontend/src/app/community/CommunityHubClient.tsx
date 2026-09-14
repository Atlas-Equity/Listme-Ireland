'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Building2, 
  Store, 
  MapPin, 
  ExternalLink,
  ShieldAlert,
  FileText,
  Clock
} from 'lucide-react';
import { BusinessPageData } from '@/app/actions/businessPages';

interface CommunityHubClientProps {
  activeListingsCount: number;
  memberCount: number;
  businessPages: BusinessPageData[];
}

export default function CommunityHubClient({
  activeListingsCount,
  memberCount,
  businessPages,
}: CommunityHubClientProps) {
  const [activeSection, setActiveSection] = useState('announcements');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
      summary: 'ListMe offers transparent and competitive rates for casual and commercial sellers across all 26 counties with secure Stripe Connect payouts.',
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
      summary: 'Accounts active for 1 year are verified for free, or get immediate verification for €4.99/month. All sellers require a linked credit card.',
      link: '/buyer-protection',
      linkLabel: 'Buyer Protection guide',
    },
  ];

  const featuredStores = businessPages
    .filter((p) => p.business_type === 'marketplace' || p.category?.toLowerCase().includes('retail'))
    .slice(0, 3);

  const featuredServices = businessPages
    .filter((p) => p.business_type === 'service' || p.category?.toLowerCase().includes('service'))
    .slice(0, 3);

  const SECTIONS = [
    { id: 'announcements', number: 1, title: 'Announcements & Updates' },
    { id: 'featured-stores', number: 2, title: 'Featured Marketplace Stores' },
    { id: 'featured-services', number: 3, title: 'Verified Services & Trades' },
    { id: 'trust-safety', number: 4, title: 'Trust & Safety Advisories' },
    { id: 'social-storefront', number: 5, title: 'Official Social & Storefront' },
    { id: 'help-centre', number: 6, title: 'Support & Help Centre' },
    { id: 'site-stats', number: 7, title: 'Live Platform Statistics' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-gray-200 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#0073e6] dark:hover:text-[#3894ff] transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-400 dark:text-gray-500">Community</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-medium">Community Hub</span>
        </nav>

        {/* Page Header matching Terms layout */}
        <div className="mb-10 pb-6 border-b border-gray-200 dark:border-zinc-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5 text-primary" />
            Official Community Hub
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            Listme.ie Community Hub
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
            Platform announcements, featured verified storefronts, safe buying guidelines, and real-time marketplace metrics across Ireland.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800/80 text-xs text-gray-500">
            <div className="flex items-center gap-2 sm:gap-4">
              <span>Last updated: September 2026</span>
              <span>•</span>
              <span>Applies to all registered members</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Scam Protected
              </span>
            </div>
          </div>
        </div>

        {/* Main Layout: Sidebar Navigation + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Table of Contents Sticky Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-200 dark:border-zinc-800 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-3">
                ON THIS PAGE
              </h2>
              <nav className="space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left block py-2 px-2.5 rounded-xl transition-colors cursor-pointer text-xs font-medium ${
                      activeSection === sec.id
                        ? 'bg-gray-100 dark:bg-zinc-800 text-primary font-bold'
                        : 'hover:bg-gray-100/60 dark:hover:bg-zinc-800/60 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {sec.number}. {sec.title}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-zinc-800">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Quick Shortcuts
                </h3>
                <div className="space-y-1.5 text-xs">
                  <Link href="/safety" className="text-[#0073e6] dark:text-[#3894ff] hover:underline block">
                    • Safe Buying Tips &amp; Scam Advice
                  </Link>
                  <Link href="/buyer-protection" className="text-[#0073e6] dark:text-[#3894ff] hover:underline block">
                    • Buyer Protection Guide
                  </Link>
                  <Link href="/fees" className="text-[#0073e6] dark:text-[#3894ff] hover:underline block">
                    • Marketplace Fees Schedule
                  </Link>
                  <Link href="/services" className="text-[#0073e6] dark:text-[#3894ff] hover:underline block">
                    • Search Irish Services
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Document Content */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-12">
            
            {/* 1. ANNOUNCEMENTS & RECENT UPDATES */}
            <section id="announcements" className="scroll-mt-28 space-y-4">
              <div className="border-b border-gray-200 dark:border-zinc-800 pb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-primary" />
                  <span>1. Announcements &amp; Recent Updates</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Official notices, regulatory policies, and platform features released for ListMe members.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ANNOUNCEMENTS.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800">
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

            {/* 2. FEATURED MARKETPLACE STORES */}
            <section id="featured-stores" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Store className="w-5 h-5 text-primary" />
                    <span>2. Featured Marketplace Stores</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Commercial storefronts and retail stores selling inventory directly on ListMe.
                  </p>
                </div>
                <Link href="/marketplace" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  View All Stores <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {featuredStores.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {featuredStores.map((store) => (
                    <Link
                      key={store.slug}
                      href={`/page/${store.slug}`}
                      className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-primary/50 transition-all group shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 overflow-hidden relative shrink-0 flex items-center justify-center">
                            {store.avatarUrl ? (
                              <Image src={store.avatarUrl} alt={store.name} fill className="object-cover" unoptimized />
                            ) : (
                              <Store className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
                              {store.name}
                            </h3>
                            <span className="text-[10px] text-primary font-semibold">
                              Verified Storefront
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">
                          {store.announcement || store.tagline || 'Official storefront on ListMe.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{store.county || 'Dublin'}</span>
                        </span>
                        <span className="font-bold text-primary flex items-center gap-1 group-hover:underline">
                          Open Store <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Explore all verified stores and retail inventory on our dedicated Marketplace portal.
                  </p>
                  <Link href="/marketplace" className="mt-3 inline-block text-xs font-bold text-primary hover:underline">
                    Browse Marketplace Storefronts →
                  </Link>
                </div>
              )}
            </section>

            {/* 3. VERIFIED SERVICES & TRADES */}
            <section id="featured-services" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <span>3. Verified Services &amp; Trades</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Contractors, domestic trades, repairs, and professional service business pages.
                  </p>
                </div>
                <Link href="/services" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  Search Services <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {featuredServices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {featuredServices.map((svc) => (
                    <Link
                      key={svc.slug}
                      href={`/page/${svc.slug}`}
                      className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-primary/50 transition-all group shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 overflow-hidden relative shrink-0 flex items-center justify-center">
                            {svc.avatarUrl ? (
                              <Image src={svc.avatarUrl} alt={svc.name} fill className="object-cover" unoptimized />
                            ) : (
                              <Building2 className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
                              {svc.name}
                            </h3>
                            <span className="text-[10px] text-primary font-semibold">
                              Verified Trade
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">
                          {svc.announcement || svc.tagline || 'Official service business on ListMe.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{svc.county || 'Ireland'}</span>
                        </span>
                        <span className="font-bold text-primary flex items-center gap-1 group-hover:underline">
                          View Services <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Search and hire vetted tradespeople and service contractors across Ireland.
                  </p>
                  <Link href="/services" className="mt-3 inline-block text-xs font-bold text-primary hover:underline">
                    Explore Services &amp; Trades →
                  </Link>
                </div>
              )}
            </section>

            {/* 4. TRUST & SAFETY ADVISORIES */}
            <section id="trust-safety" className="scroll-mt-28 space-y-4">
              <div className="border-b border-gray-200 dark:border-zinc-800 pb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span>4. Trust &amp; Safety Advisories</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Guidelines and protections designed to keep every Irish buyer and seller safe.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/safety"
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-primary/50 transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-2.5 mb-2 text-primary font-bold text-sm">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-gray-900 dark:text-white group-hover:text-primary transition-colors">Safe Buying Tips &amp; Scam Advice</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Learn how to inspect listings, verify sellers, detect wire fraud, avoid counterfeit goods, and report suspicious activities.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-3 group-hover:underline">
                    Read safety guide <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>

                <Link
                  href="/buyer-protection"
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-primary/50 transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-2.5 mb-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-gray-900 dark:text-white group-hover:text-primary transition-colors">Buyer Protection Policy</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Full purchase price coverage up to €5,000 for qualifying marketplace orders paid via card or NexyPay with 3-day dispute resolution.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-3 group-hover:underline">
                    Learn about coverage <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </div>
            </section>

            {/* 5. OFFICIAL CHANNELS & STOREFRONT (NO INSTAGRAM) */}
            <section id="social-storefront" className="scroll-mt-28 space-y-4">
              <div className="border-b border-gray-200 dark:border-zinc-800 pb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-primary" />
                  <span>5. Official Social Channels &amp; Storefront</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Connect with our official verified Facebook community and our central platform storefront.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Official Facebook */}
                <a
                  href="https://www.facebook.com/profile.php?id=61594336620072"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-primary/50 transition-colors group shadow-xs flex flex-col justify-between"
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
                      Irish community stories, marketplace highlights, platform notices, and member discussions.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:underline">
                    Visit Facebook <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </a>

                {/* ListMe Business Page */}
                <Link
                  href="/page/listme"
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-primary/50 transition-colors group shadow-xs flex flex-col justify-between"
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

            {/* 6. SUPPORT & HELP CENTRE */}
            <section id="help-centre" className="scroll-mt-28">
              <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="max-w-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <HelpCircle className="w-4 h-4 text-primary" />
                      <span>Support &amp; Inquiries</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      6. Need Assistance? Visit the Help Centre
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Browse FAQs about buying, selling, and marketplace fees, learn about Buyer Protection coverage, or submit a support ticket directly to our Dublin team.
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <Link
                      href="/help"
                      className="px-5 py-2.5 rounded-xl bg-primary hover:bg-green-700 text-white font-bold text-xs transition-colors shadow-xs"
                    >
                      Open Help Centre
                    </Link>
                    <Link
                      href="/buyer-protection"
                      className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 font-semibold text-xs hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Buyer Protection
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. VERIFIED PLATFORM STATISTICS */}
            <section id="site-stats" className="scroll-mt-28 space-y-4">
              <div className="border-b border-gray-200 dark:border-zinc-800 pb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span>7. Live Platform Statistics</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Verified platform metrics queried live from our production database.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Inventory</span>
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {activeListingsCount}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Active Irish Listings</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Members</span>
                    <Users className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {memberCount}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Registered Accounts</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs">
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

          </main>
        </div>

      </div>
    </div>
  );
}
