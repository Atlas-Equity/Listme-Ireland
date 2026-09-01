'use client';

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { toggleFavouriteSeller } from '@/app/actions/favourites';

interface FavouriteSellerButtonProps {
  sellerId: string;
  initialIsFavourite: boolean;
}

export default function FavouriteSellerButton({ sellerId, initialIsFavourite }: FavouriteSellerButtonProps) {
  const [isFavourite, setIsFavourite] = useState(initialIsFavourite);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    
    // Optimistic UI update
    const newStatus = !isFavourite;
    setIsFavourite(newStatus);
    setLoading(true);

    try {
      const result = await toggleFavouriteSeller(sellerId, !newStatus); // pass the OLD status
      
      if (result.error) {
        // Revert on error
        setIsFavourite(!newStatus);
        alert(result.error === 'Unauthorized' ? 'Please sign in to add favourite sellers.' : 'Failed to update favourites.');
      }
    } catch (err) {
      setIsFavourite(!newStatus);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      className={`w-full py-3 font-bold rounded-sm mt-2 flex items-center justify-center transition-colors ${
        isFavourite 
          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700' 
          : 'bg-[#0073e6] hover:bg-[#005bb5] text-white'
      }`}
    >
      <Heart className={`w-5 h-5 mr-2 ${isFavourite ? 'fill-current' : ''}`} />
      {isFavourite ? 'Saved Seller' : 'Add to Favourite Sellers'}
    </button>
  );
}
