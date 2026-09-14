'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, 
  ShoppingBag, 
  Briefcase, 
  Wrench, 
  Users, 
  ArrowRight,
  CheckCircle2,
  X
} from 'lucide-react';

const MARKETPLACE_SUBCATEGORIES = [
  'Antiques & collectables',
  'Art',
  'Baby gear',
  'Books',
  'Building & renovation',
  'Business, farming & industry',
  'Clothing & fashion',
  'Computers',
  'Crafts',
  'Electronics & photography',
  'Gaming',
  'Health & beauty',
  'Home & living',
  'Jewellery & watches',
  'Mobile phones',
  'Movies & TV',
  'Music & instruments',
  'Pets & animals',
  'Pottery & glass',
  'Sports',
  'Toys & models',
  'Travel & events',
];

const JOBS_SUBCATEGORIES = [
  'Accounting & finance',
  'Construction & trades',
  'Customer service',
  'Education',
  'Healthcare',
  'Hospitality & tourism',
  'IT & telecommunications',
  'Marketing & media',
  'Retail',
  'Transport & logistics',
];

const SERVICES_SUBCATEGORIES = [
  'Automotive & mechanical',
  'Building & trades',
  'Cleaning & domestic',
  'Events & entertainment',
  'Financial & legal',
  'Health & wellbeing',
  'Moving & storage',
  'Property maintenance',
  'Tech & web services',
];

const COMMUNITY_SUBCATEGORIES = [
  'Announcements & notices',
  'Clubs & societies',
  'Lost & found',
  'Volunteer & charity',
  'Groups & meetups',
];

type CategoryTab = 'marketplace' | 'jobs' | 'services' | 'community';

export default function CategoriesMegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CategoryTab>('marketplace');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Esc
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const tabs: { id: CategoryTab; label: string; icon: React.ReactNode; count: number; href: string }[] = [
    { id: 'marketplace', label: 'Marketplace', icon: <ShoppingBag className="w-4 h-4" />, count: MARKETPLACE_SUBCATEGORIES.length, href: '/category/marketplace' },
    { id: 'community', label: 'Community', icon: <Users className="w-4 h-4" />, count: COMMUNITY_SUBCATEGORIES.length, href: '/community' },
  ];

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Mega Menu Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          isOpen
            ? 'bg-primary text-white shadow-xs'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
        }`}
      >
        <span>Categories</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : 'text-gray-400'}`} />
      </button>

      {/* Flyout Mega-Menu Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-[850px] max-w-[90vw] bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Top Tabs Bar */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/80 px-4 pt-2">
            <div className="flex items-center gap-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                      isActive
                        ? 'border-primary text-primary dark:text-green-400 bg-white dark:bg-[#1a1a1a] rounded-t-lg shadow-2xs'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? 'bg-primary/10 text-primary dark:text-green-400'
                        : 'bg-gray-200 dark:bg-zinc-800 text-gray-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="p-6">
            
            {/* MARKETPLACE TAB */}
            {activeTab === 'marketplace' && (
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    Browse Marketplace
                  </h3>
                  <Link
                    href="/category/marketplace"
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>View all Marketplace items</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2.5">
                  {MARKETPLACE_SUBCATEGORIES.map((sub) => (
                    <Link
                      key={sub}
                      href={`/search?category=Marketplace&sub=${encodeURIComponent(sub)}`}
                      onClick={() => setIsOpen(false)}
                      className="text-xs text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-green-400 hover:font-medium transition-colors py-0.5 truncate block"
                      title={sub}
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* JOBS TAB */}
            {activeTab === 'jobs' && (
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    Browse Jobs in Ireland
                  </h3>
                  <Link
                    href="/category/jobs"
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>View all Job listings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5">
                  {JOBS_SUBCATEGORIES.map((sub) => (
                    <Link
                      key={sub}
                      href={`/category/jobs?sub=${encodeURIComponent(sub)}`}
                      onClick={() => setIsOpen(false)}
                      className="text-xs text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-green-400 hover:font-medium transition-colors py-0.5 truncate block"
                      title={sub}
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* SERVICES TAB */}
            {activeTab === 'services' && (
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-primary" />
                    Browse Services &amp; Trades
                  </h3>
                  <Link
                    href="/category/services"
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>View all Services</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5">
                  {SERVICES_SUBCATEGORIES.map((sub) => (
                    <Link
                      key={sub}
                      href={`/category/services?sub=${encodeURIComponent(sub)}`}
                      onClick={() => setIsOpen(false)}
                      className="text-xs text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-green-400 hover:font-medium transition-colors py-0.5 truncate block"
                      title={sub}
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* COMMUNITY TAB */}
            {activeTab === 'community' && (
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Browse Community Notices
                  </h3>
                  <Link
                    href="/community"
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>View Community Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5">
                  {COMMUNITY_SUBCATEGORIES.map((sub) => (
                    <Link
                      key={sub}
                      href={`/community?sub=${encodeURIComponent(sub)}`}
                      onClick={() => setIsOpen(false)}
                      className="text-xs text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-green-400 hover:font-medium transition-colors py-0.5 truncate block"
                      title={sub}
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Bottom Banner */}
          <div className="p-3 bg-gray-50 dark:bg-zinc-900/60 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>All 32 Irish counties supported with verified local trade &amp; fast payouts.</span>
            </div>
            <Link
              href="/sell"
              onClick={() => setIsOpen(false)}
              className="font-bold text-primary hover:underline"
            >
              List an item &rarr;
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
