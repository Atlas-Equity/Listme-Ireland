'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  X, 
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import { dismissNotificationAction } from '@/app/actions/relist';

interface WelcomeGuideNotificationProps {
  initialDismissed?: boolean;
}

export default function WelcomeGuideNotification({ initialDismissed = false }: WelcomeGuideNotificationProps) {
  const [isDismissed, setIsDismissed] = useState(initialDismissed);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  React.useEffect(() => {
    const handleUpdate = () => {
      setIsDismissed(true);
    };
    window.addEventListener('welcome_guide_updated', handleUpdate);
    return () => window.removeEventListener('welcome_guide_updated', handleUpdate);
  }, []);

  if (isDismissed) return null;

  const handleDismiss = async () => {
    setIsDismissing(true);
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('welcome_guide_updated'));
    }
    try {
      await dismissNotificationAction('welcome_guide');
    } catch (err) {
      console.warn('Could not persist dismiss state:', err);
    } finally {
      setIsDismissing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818] p-5 sm:p-6 shadow-xs space-y-5">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
            <Image 
              src="/clover-logo.png" 
              alt="ListMe Logo" 
              width={26} 
              height={26} 
              className="object-contain" 
            />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white tracking-tight">
              Welcome to ListMe.ie
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
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
        <div className="space-y-6">

          {/* 2-Column Sections: Storefront & Account Credit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Storefront Feature */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">
                  Reseller or Business Owner?
                </span>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                  Create your own branded storefront on ListMe
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                  Set up your Business Page, showcase your listings, and start selling with a storefront that represents your brand.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/my-listme?tab=pages"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-green-700 text-white font-bold text-xs transition-colors"
                >
                  <span>Set Up Business Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* ListMe Verified Feature */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">
                  Trust &amp; Benefits
                </span>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                  Get ListMe Verified for 50% Service Fee Discount
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                  Verified buyers pay half the standard Service Fee on every purchase, enjoy enhanced Buyer Protection up to €10,000, and earn an official trust badge.
                </p>
                
                <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-center">
                    <span className="font-black text-sm block text-emerald-600 dark:text-emerald-400">50% OFF</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">Buyer Service Fee</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-center">
                    <span className="font-black text-sm block text-gray-900 dark:text-white">€10,000</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">Buyer Protection</span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
                  Plans start from €9.99/mo with zero long-term commitment.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/verified"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-700 font-bold text-xs transition-colors"
                >
                  <span>Explore Verified Plans</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

          {/* What You Get on ListMe (Clean Typographic Grid - No Excessive Icons) */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-black text-xs uppercase tracking-wider text-gray-900 dark:text-white">
              What You Get on ListMe
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                <span className="font-bold text-gray-900 dark:text-white block mb-0.5">
                  Buyer Protection up to €5,000
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                  (€10,000 for Verified members)
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                <span className="font-bold text-gray-900 dark:text-white block mb-0.5">
                  Real Human Support
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                  No AI, no bots, no endless email loops
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                <span className="font-bold text-gray-900 dark:text-white block mb-0.5">
                  Keep 100% of What You Sell
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                  No Success Fees, no commission
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                <span className="font-bold text-gray-900 dark:text-white block mb-0.5">
                  Irish Owned, Irish Operated
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                  Every euro stays in Ireland
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 sm:col-span-2">
                <span className="font-bold text-gray-900 dark:text-white block mb-0.5">
                  10% of Our Income Donated to Charity
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                  Autism awareness, autism research, Asperger syndrome, and cancer research
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links & Footer */}
          <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <span className="text-gray-500 dark:text-gray-400 text-[11px] mr-1">Get Started:</span>
              <Link 
                href="/marketplace"
                className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 text-[11px] transition-colors"
              >
                Browse Marketplace
              </Link>
              <Link 
                href="/my-listme?tab=pages"
                className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 text-[11px] transition-colors"
              >
                Business Pages
              </Link>
              <Link 
                href="/about"
                className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 text-[11px] transition-colors"
              >
                About Us
              </Link>
              <Link 
                href="/verified"
                className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 text-[11px] transition-colors"
              >
                Get Verified
              </Link>
              <Link 
                href="/help"
                className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 text-[11px] transition-colors"
              >
                Support Ticket
              </Link>
            </div>

            <div className="text-[11px] font-bold text-gray-600 dark:text-gray-400 shrink-0">
              ListMe.ie — Irish Owned. Irish Operated. Community First.
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
