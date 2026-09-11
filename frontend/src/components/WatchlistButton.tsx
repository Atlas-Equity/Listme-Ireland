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
      className="w-full py-3 px-4 bg-[#b38000] hover:bg-[#c68d00] text-black font-semibold rounded-sm transition-colors shadow-sm flex items-center justify-center mb-6 cursor-pointer"
    >
      <Heart 
        className={`w-4 h-4 mr-2 ${isSaved ? 'fill-black' : ''}`} 
      /> 
      {isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
    </button>
  );
}

