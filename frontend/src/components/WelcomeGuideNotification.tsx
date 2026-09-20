'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Store, 
  Wallet, 
  Headphones, 
  HeartHandshake, 
  Coins, 
  ArrowRight, 
  X, 
  Check, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Percent,
  BadgeCheck,
  LifeBuoy
} from 'lucide-react';
import { dismissNotificationAction } from '@/app/actions/relist';

interface WelcomeGuideNotificationProps {
  initialDismissed?: boolean;
}

export default function WelcomeGuideNotification({ initialDismissed = false }: WelcomeGuideNotificationProps) {
  const [isDismissed, setIsDismissed] = useState(initialDismissed);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  if (isDismissed) return null;

  const handleDismiss = async () => {
    setIsDismissing(true);
    setIsDismissed(true);
    try {
      await dismissNotificationAction('welcome_guide');
    } catch (err) {
      console.warn('Could not persist dismiss state:', err);
    } finally {
      setIsDismissing(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 dark:from-emerald-950/20 dark:via-[#1a1a1a] dark:to-emerald-950/10 shadow-sm transition-all">
      
      {/* Header Bar */}
      <div className="p-4 sm:p-6 border-b border-emerald-100 dark:border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
            ☘️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-base sm:text-lg text-gray-900 dark:text-white tracking-tight">
                Welcome to ListMe.ie
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Official Guide
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
              Welcome to ListMe — Ireland&apos;s trusted marketplace, built by Irish people, for Irish people.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{isExpanded ? 'Collapse' : 'Expand Guide'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          
          <button
            type="button"
            onClick={handleDismiss}
            disabled={isDismissing}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            title="Dismiss Welcome Guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6">

          {/* 2-Column Core Features Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Storefront Feature */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#202020] border border-gray-200/80 dark:border-zinc-800 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <Store className="w-4 h-4" />
                  <span>Reseller or Business Owner?</span>
                </div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                  Create your own branded storefront on ListMe
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                  Set up your Business Page, showcase your listings, and start selling with a storefront that represents your brand.
                </p>
              </div>
              <div>
                <Link
                  href="/my-listme?tab=pages"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs"
                >
                  <span>Set Up Business Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Account Credit Discount Feature */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#202020] border border-gray-200/80 dark:border-zinc-800 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <Coins className="w-4 h-4" />
                  <span>Save on Every Purchase</span>
                </div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                  Pay with Account Credit for Service Fee Discounts
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                  We recommend using Account Credit to pay for things on ListMe. When you pay with Account Credit, you get an automatic discount off your Service Fee:
                </p>
                
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-semibold">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-center">
                    <span className="font-black text-sm block text-emerald-700 dark:text-emerald-400">-€1 OFF</span>
                    <span className="text-[11px] text-gray-600 dark:text-gray-400">purchases up to €250</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-center">
                    <span className="font-black text-sm block text-emerald-700 dark:text-emerald-400">-€5 OFF</span>
                    <span className="text-[11px] text-gray-600 dark:text-gray-400">purchases above €250</span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
                  Using credit is advised for security, instant refunds, and listing fee checkout.
                </p>
              </div>

              <div>
                <Link
                  href="/my-listme?tab=account"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-bold text-xs transition-colors"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Top Up Account Credit</span>
                </Link>
              </div>
            </div>

          </div>

          {/* What You Get on ListMe (Core Pillars) */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#202020] border border-gray-200/80 dark:border-zinc-800 shadow-2xs space-y-3">
            <h4 className="font-black text-xs uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>What You Get on ListMe</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900/60">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-gray-900 dark:text-white block">Buyer Protection up to €5,000</span>
                  <span className="text-gray-500 dark:text-gray-400 text-[11px]">(€10,000 for Verified members)</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900/60">
                <Headphones className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-gray-900 dark:text-white block">Real Human Support</span>
                  <span className="text-gray-500 dark:text-gray-400 text-[11px]">No AI, no bots, no endless email loops</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900/60">
                <Percent className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-gray-900 dark:text-white block">Keep 100% of What You Sell</span>
                  <span className="text-gray-500 dark:text-gray-400 text-[11px]">No success fees, no commission</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900/60">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-gray-900 dark:text-white block">Irish Owned &amp; Operated</span>
                  <span className="text-gray-500 dark:text-gray-400 text-[11px]">Every euro stays in Ireland</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900/60 sm:col-span-2">
                <HeartHandshake className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-gray-900 dark:text-white block">10% Donated to Charity</span>
                  <span className="text-gray-500 dark:text-gray-400 text-[11px]">Autism awareness, autism research, Asperger syndrome, and cancer research</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links & Footer */}
          <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            {/* Quick Action Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <span className="text-gray-500 dark:text-gray-400 text-[11px] mr-1">Get Started:</span>
              <Link 
                href="/marketplace"
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200 hover:text-primary transition-colors text-[11px]"
              >
                Browse Marketplace
              </Link>
              <Link 
                href="/my-listme?tab=pages"
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200 hover:text-primary transition-colors text-[11px]"
              >
                Business Pages
              </Link>
              <Link 
                href="/about"
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200 hover:text-primary transition-colors text-[11px]"
              >
                About Us
              </Link>
              <Link 
                href="/verified"
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200 hover:text-primary transition-colors text-[11px]"
              >
                Get Verified
              </Link>
              <Link 
                href="/help"
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200 hover:text-primary transition-colors text-[11px]"
              >
                Support Ticket
              </Link>
            </div>

            {/* Tagline */}
            <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 shrink-0">
              ListMe.ie — Irish Owned. Irish Operated. Community First.
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
