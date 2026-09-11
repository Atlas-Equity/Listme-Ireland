'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2, 
  Ban, 
  Briefcase, 
  EyeOff, 
  Check, 
  Lock, 
  Mail,
  UserX
} from 'lucide-react';

export default function TradeMeSettingsSections() {
  const [showRecentSearches, setShowRecentSearches] = useState(true);
  const [searchHistoryDeleted, setSearchHistoryDeleted] = useState(false);
  const [recentlyViewedCleared, setRecentlyViewedCleared] = useState(false);
  
  // Blacklist modal state
  const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false);
  const [blacklistInput, setBlacklistInput] = useState('');
  const [blacklistedUsers, setBlacklistedUsers] = useState<string[]>(['suspicious_trader_99']);
  const [blacklistSuccess, setBlacklistSuccess] = useState<string | null>(null);

  // Privacy
  const [optOutAnalytics, setOptOutAnalytics] = useState(false);

  const handleDeleteSearchHistory = () => {
    try {
      localStorage.removeItem('listme_recent_searches');
    } catch {}
    setSearchHistoryDeleted(true);
    setTimeout(() => setSearchHistoryDeleted(false), 3000);
  };

  const handleClearRecentlyViewed = () => {
    try {
      localStorage.removeItem('listme_recently_viewed');
    } catch {}
    setRecentlyViewedCleared(true);
    setTimeout(() => setRecentlyViewedCleared(false), 3000);
  };

  const handleAddBlacklist = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = blacklistInput.trim().replace(/^@/, '');
    if (clean && !blacklistedUsers.includes(clean)) {
      setBlacklistedUsers([...blacklistedUsers, clean]);
      setBlacklistInput('');
      setBlacklistSuccess(`User @${clean} added to your private blacklist.`);
      setTimeout(() => setBlacklistSuccess(null), 3000);
    }
  };

  const handleRemoveBlacklist = (username: string) => {
    setBlacklistedUsers(blacklistedUsers.filter(u => u !== username));
  };

  return (
    <div className="space-y-6">
      
      {/* 1. GENERAL SETTINGS */}
      <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <h3 className="text-base font-extrabold uppercase text-gray-900 dark:text-white mb-1">
          GENERAL SETTINGS
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Preferences for search suggestions, browsing history, and account notifications.
        </p>

        <div className="divide-y divide-gray-100 dark:divide-zinc-800 text-sm">
          
          {/* Search History Toggle & Delete */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-xs">Search History</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {showRecentSearches ? 'Displaying recent queries in the search dropdown.' : 'Recent search queries are paused.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRecentSearches}
                  onChange={(e) => setShowRecentSearches(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>

              <button
                type="button"
                onClick={handleDeleteSearchHistory}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
              >
                {searchHistoryDeleted ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                  </span>
                ) : (
                  'Delete search history'
                )}
              </button>
            </div>
          </div>

          {/* Recently Viewed */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-xs">Recently Viewed Listings</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Clear previously viewed marketplace items from your browsing cache.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearRecentlyViewed}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors self-start sm:self-auto"
            >
              {recentlyViewedCleared ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                </span>
              ) : (
                'Clear history'
              )}
            </button>
          </div>

        </div>
      </div>

      {/* 2. SELLING OPTIONS & PRIVATE BLACKLIST */}
      <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <h3 className="text-base font-extrabold uppercase text-gray-900 dark:text-white mb-1">
          SELLING OPTIONS &amp; PRIVACY
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Protect your listings from unwanted bidders and configure commercial seller status.
        </p>

        <div className="divide-y divide-gray-100 dark:divide-zinc-800 text-sm">
          
          {/* Blacklist */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900 dark:text-white text-xs">Private Blacklist</p>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                  ({blacklistedUsers.length} blocked)
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Your Blacklist is private. Blocked members cannot bid, make offers, or send messages on your listings.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsBlacklistModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors self-start sm:self-auto cursor-pointer"
            >
              Manage Blacklist
            </button>
          </div>

          {/* In-Trade Declaration */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-xs">In-Trade Commercial Seller Status</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Declare whether you sell regularly in trade in accordance with Irish Consumer Protection legislation.
              </p>
            </div>

            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Standard Individual Seller
            </span>
          </div>

          {/* Privacy & Third-party opt-out */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-xs">Privacy &amp; Data Opt-Out</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Opt out of behavioral analytics and third-party advertising cookies.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={optOutAnalytics}
                onChange={(e) => setOptOutAnalytics(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>

        </div>
      </div>

      {/* Blacklist Modal */}
      {isBlacklistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Your Private Blacklist
                </h3>
              </div>
              <button
                onClick={() => setIsBlacklistModalOpen(false)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                Done
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              Users on your private blacklist are prevented from placing bids, sending offers, or contacting you on any of your listings.
            </p>

            {/* Add User */}
            <form onSubmit={handleAddBlacklist} className="flex gap-2 mb-4">
              <input
                type="text"
                value={blacklistInput}
                onChange={(e) => setBlacklistInput(e.target.value)}
                placeholder="Enter username to block..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-red-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
              >
                Block
              </button>
            </form>

            {blacklistSuccess && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-3">
                {blacklistSuccess}
              </p>
            )}

            {/* Blocked List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {blacklistedUsers.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">
                  No users on your blacklist.
                </p>
              ) : (
                blacklistedUsers.map((user) => (
                  <div
                    key={user}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800"
                  >
                    <span className="text-xs font-mono font-medium text-gray-800 dark:text-gray-200">
                      @{user}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBlacklist(user)}
                      className="text-[11px] font-bold text-red-500 hover:underline"
                    >
                      Unblock
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
