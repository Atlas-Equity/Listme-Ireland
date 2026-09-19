'use client';

import React, { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { toggleFavouriteBusiness } from '@/app/actions/favourites';
import { emitToast } from '@/context/ToastContext';

interface FavouriteBusinessButtonProps {
  businessSlug: string;
  initialIsFavourite?: boolean;
  className?: string;
  compact?: boolean;
}

export default function FavouriteBusinessButton({
  businessSlug,
  initialIsFavourite = false,
  className,
  compact = false,
}: FavouriteBusinessButtonProps) {
  const [isFavourite, setIsFavourite] = useState(initialIsFavourite);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;

    const previousStatus = isFavourite;
    const newStatus = !previousStatus;
    setIsFavourite(newStatus);
    setLoading(true);

    try {
      const result = await toggleFavouriteBusiness(businessSlug, previousStatus);

      if (result.error) {
        setIsFavourite(previousStatus);
        emitToast(result.error === 'Unauthorized' ? 'Please sign in to favourite businesses.' : 'Failed to update favourites.', 'error');
      } else {
        emitToast(newStatus ? 'Business added to favourites!' : 'Business removed from favourites.', 'success');
      }
    } catch (err) {
      setIsFavourite(previousStatus);
      console.error(err);
      emitToast('Failed to update favourites.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer disabled:opacity-50 ${className || ''}`}
        title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
        aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        ) : (
          <Heart
            className={`w-4 h-4 transition-all duration-200 ${
              isFavourite
                ? 'fill-emerald-500 text-emerald-500 scale-105'
                : 'text-gray-400 dark:text-zinc-500'
            }`}
          />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`py-2 px-3.5 rounded-xl border text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
        isFavourite
          ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
          : 'border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200'
      } ${className || ''}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
      ) : (
        <Heart
          className={`w-3.5 h-3.5 ${
            isFavourite ? 'fill-emerald-500 text-emerald-500' : 'text-gray-400 dark:text-zinc-500'
          }`}
        />
      )}
      <span>{isFavourite ? 'Saved Business' : 'Save Business'}</span>
    </button>
  );
}
