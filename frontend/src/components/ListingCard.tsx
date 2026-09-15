'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Heart, Check, Clock, Eye } from 'lucide-react';
import { formatDistanceToNow, format, addDays } from 'date-fns';
import { useWatchlist } from '@/context/WatchlistContext';
import { getCoreLocation } from '@/utils/irelandLocations';

export interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  priceType?: string;
  condition?: string;
  images?: string[];
  createdAt?: string;
  location?: string;
  closesAt?: string | null;
  initialWatchlisted?: boolean;
  priority?: boolean;
}

export function ListingCard({
  id,
  title,
  price,
  priceType = 'buy_now',
  condition = 'Used - Good',
  images = [],
  createdAt,
  location = 'Dublin',
  closesAt,
  initialWatchlisted = false,
  priority = false,
}: ListingCardProps) {
  const { isWatchlisted, toggleWatchlist } = useWatchlist();
  const isSaved = isWatchlisted(id) || initialWatchlisted;

  const mainImage = images && images.length > 0 ? images[0] : null;
  const coreLocation = getCoreLocation(location);

  // Time calculations
  const createdDate = createdAt ? new Date(createdAt) : new Date();
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });

  // Closing date calculation (default to 7 days from creation if not provided)
  const closingDate = closesAt ? new Date(closesAt) : addDays(createdDate, 7);
  const isClosed = closingDate.getTime() < Date.now();
  const closesFormatted = isClosed
    ? 'Closed'
    : `Closes: ${format(closingDate, 'EEE, d MMM')}`;

  const isAuction = priceType?.toLowerCase() === 'auction';

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWatchlist(id);
  };


  return (
    <Link
      href={`/listing/${id}`}
      prefetch={true}
      className="group flex flex-col bg-white dark:bg-[#181818] rounded-xl border border-gray-200/80 dark:border-zinc-800/80 overflow-hidden hover:shadow-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-all duration-200"
    >
      {/* Vinted-Style Portrait Image Container */}
      <div className="relative aspect-[3/4] bg-gray-100 dark:bg-zinc-800/60 w-full overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            decoding="async"
            unoptimized={!mainImage.includes('supabase.co') && !mainImage.includes('unsplash.com')}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600">
            <Package className="w-8 h-8 mb-1" />
            <span className="text-[11px] font-medium">No Image</span>
          </div>
        )}

        {/* Format / Status Badge */}
        {isAuction ? (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold tracking-wide uppercase">
            Auction
          </div>
        ) : isClosed ? (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-red-600/90 text-white text-[10px] font-semibold">
            Closed
          </div>
        ) : null}

        {/* Vinted-Style Floating Heart Watchlist Button */}
        <button
          type="button"
          onClick={handleWatchlistToggle}
          aria-label={isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
          className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/35 hover:bg-black/65 backdrop-blur-xs flex items-center justify-center transition-all active:scale-90 shadow-xs cursor-pointer"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isSaved
                ? 'fill-red-500 text-red-500'
                : 'text-white/90 hover:text-white'
            }`}
          />
        </button>
      </div>

      {/* Vinted-Style Metadata Section */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Buying Format */}
          <div className="flex items-baseline justify-between gap-1">
            <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white tracking-tight">
              €{price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium shrink-0">
              {isAuction ? 'bid' : 'incl.'}
            </span>
          </div>

          {/* Listing Title */}
          <h3 className="font-medium text-xs sm:text-sm text-gray-800 dark:text-gray-200 line-clamp-1 mt-1 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Condition & County Location */}
          <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
            <span className="truncate">{condition}</span>
            <span>•</span>
            <span className="truncate">{coreLocation}</span>
          </div>
        </div>

        {/* Closing Time for Live Auctions */}
        {isAuction && !isClosed && (
          <div className="mt-2 pt-1.5 border-t border-gray-100 dark:border-zinc-800/60 flex items-center text-[10px] text-amber-600 dark:text-amber-400 font-medium">
            <Clock className="w-3 h-3 mr-1 inline shrink-0" />
            <span className="truncate">{closesFormatted}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
