'use client';

import React, { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { toggleFavouriteSeller } from '@/app/actions/favourites';
import { emitToast } from '@/context/ToastContext';

interface FavouriteSellerButtonProps {
  sellerId: string;
  initialIsFavourite: boolean;
  className?: string;
}

export default function FavouriteSellerButton({ 
  sellerId, 
  initialIsFavourite, 
  className 
}: FavouriteSellerButtonProps) {
  const [isFavourite, setIsFavourite] = useState(initialIsFavourite);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    
    const previousStatus = isFavourite;
    const newStatus = !previousStatus;
    setIsFavourite(newStatus);
    setLoading(true);

    try {
      const result = await toggleFavouriteSeller(sellerId, previousStatus);
      
      if (result.error) {
        setIsFavourite(previousStatus);
        emitToast(result.error === 'Unauthorized' ? 'Please sign in to add favourite sellers.' : 'Failed to update favourites.', 'error');
      } else {
        emitToast(newStatus ? 'Seller added to favourites!' : 'Seller removed from favourites.', 'success');
      }
    } catch (err) {
      setIsFavourite(previousStatus);
      console.error(err);
      emitToast('Failed to update favourites.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 shadow-xs flex items-center justify-center gap-2 cursor-pointer border ${
        isFavourite 
          ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' 
          : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-200 hover:border-emerald-400 dark:hover:border-emerald-700/60 group'
      } ${className || ''}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      ) : (
        <Heart 
          className={`w-4 h-4 transition-all duration-200 ${
            isFavourite 
              ? 'fill-emerald-500 text-emerald-500 scale-105' 
              : 'text-gray-400 dark:text-zinc-500 group-hover:text-emerald-500 group-hover:scale-110'
          }`} 
        />
      )}
      <span>{isFavourite ? 'Saved Seller' : 'Add to Favourite Sellers'}</span>
    </button>
  );
}
