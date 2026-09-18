'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { useWatchlist } from '@/context/WatchlistContext';

interface WatchlistButtonProps {
  listingId: string;
  initialIsWatchlisted?: boolean;
}

export default function WatchlistButton({ listingId, initialIsWatchlisted = false }: WatchlistButtonProps) {
  const { isWatchlisted, toggleWatchlist } = useWatchlist();
  const isSaved = isWatchlisted(listingId) || initialIsWatchlisted;

  const handleToggle = async () => {
    await toggleWatchlist(listingId);
  };

  return (
    <button 
      type="button"
      onClick={handleToggle}
      className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-xs flex items-center justify-center mb-6 cursor-pointer border ${
        isSaved 
          ? 'border-primary/30 dark:border-primary/40 bg-primary/10 dark:bg-primary/20 hover:bg-primary/15 text-primary dark:text-emerald-400'
          : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-200 hover:border-primary/40 group'
      }`}
    >
      <Eye 
        className={`w-4 h-4 mr-2 transition-all duration-200 ${
          isSaved 
            ? 'text-primary scale-105' 
            : 'text-gray-400 dark:text-zinc-500 group-hover:text-primary group-hover:scale-110'
        }`} 
      /> 
      <span>{isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}</span>
    </button>
  );
}
