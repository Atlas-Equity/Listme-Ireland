'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export default function CreateWatchlistModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [createdLists, setCreatedLists] = useState<string[]>([]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreatedLists((prev) => [...prev, name.trim()]);
    setName('');
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0073e6] hover:bg-[#005bb5] text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors shadow-sm cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Create Watchlist
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-zinc-800 w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                New Watchlist
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Watchlist name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='e.g "Kitchen things" or "Find a new flat"'
                  autoFocus
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0073e6] focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0073e6] hover:bg-[#005bb5] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  Create Watchlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
