'use client';

import React, { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toggleWatchlist } from '@/app/actions/wishlist';

interface WatchlistButtonProps {
  listingId: string;
  initialIsWatchlisted: boolean;
}

export default function WatchlistButton({ listingId, initialIsWatchlisted }: WatchlistButtonProps) {
  const [isWatchlisted, setIsWatchlisted] = useState(initialIsWatchlisted);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    // Optimistic update
    const newStatus = !isWatchlisted;
    setIsWatchlisted(newStatus);

    startTransition(async () => {
      const result = await toggleWatchlist(listingId, !newStatus); // pass the OLD status
      if (!result.success) {
        // Revert on failure
        setIsWatchlisted(!newStatus);
        alert(result.error === 'Unauthorized' ? 'Please sign in to add to your watchlist.' : 'Failed to update watchlist.');
      }
    });
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className="w-full py-3 px-4 bg-[#b38000] hover:bg-[#c68d00] text-black font-semibold rounded-sm transition-colors shadow-sm flex items-center justify-center mb-6 disabled:opacity-70"
    >
      <Heart 
        className={`w-4 h-4 mr-2 ${isWatchlisted ? 'fill-black' : ''}`} 
      /> 
      {isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
    </button>
  );
}
