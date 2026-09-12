'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Users, ChevronDown, BellRing, HelpCircle, BarChart3, ArrowRight } from 'lucide-react';

export default function CommunityNavDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center h-11 text-sm font-medium transition-colors cursor-pointer ${
          isOpen ? 'text-primary dark:text-white' : 'text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white'
        }`}
      >
        <Users className="w-4 h-4 mr-2 text-gray-400 group-hover:text-primary dark:group-hover:text-white transition-colors" /> 
        <span>Community</span>
        <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : 'text-gray-400'}`} />
      </button>

      {/* Flyout Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-72 bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">

          <Link
            href="/community#announcements"
            onClick={() => setIsOpen(false)}
            className="flex items-start gap-3 px-3 py-2.5 mx-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/80 transition-colors group"
          >
            <BellRing className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                Announcements
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                Latest updates, feature releases &amp; news
              </p>
            </div>
          </Link>

          <Link
            href="/help"
            onClick={() => setIsOpen(false)}
            className="flex items-start gap-3 px-3 py-2.5 mx-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/80 transition-colors group"
          >
            <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                Help Centre
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                Support, FAQs, Buyer Protection &amp; contact
              </p>
            </div>
          </Link>

          <Link
            href="/community#stats"
            onClick={() => setIsOpen(false)}
            className="flex items-start gap-3 px-3 py-2.5 mx-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/80 transition-colors group"
          >
            <BarChart3 className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                Site Stats
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                Live listings, volume &amp; marketplace metrics
              </p>
            </div>
          </Link>

          <div className="pt-1.5 mt-1 border-t border-gray-100 dark:border-zinc-800 px-3 pb-1">
            <Link
              href="/community"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-primary hover:underline flex items-center justify-between py-1"
            >
              <span>Explore Community Hub</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
