'use client';

import React from 'react';
import { Heart } from 'lucide-react';
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
          ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100/80 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-300'
          : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-200 hover:border-rose-300 dark:hover:border-rose-900/60 group'
      }`}
    >
      <Heart 
        className={`w-4 h-4 mr-2 transition-all duration-200 ${
          isSaved 
            ? 'text-rose-500 fill-rose-500 scale-105' 
            : 'text-gray-400 dark:text-zinc-500 group-hover:text-rose-500 group-hover:scale-110'
        }`} 
      /> 
      <span>{isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}</span>
    </button>
  );
}

