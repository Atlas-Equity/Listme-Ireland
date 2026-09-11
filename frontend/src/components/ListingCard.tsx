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
      className="group flex flex-col bg-white dark:bg-[#181818] rounded-xl border border-gray-200 dark:border-zinc-800/80 overflow-hidden hover:shadow-xl hover:border-gray-300 dark:hover:border-zinc-700 transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Image Container with TradeMe Yellow Corner Watchlist Bookmark */}
      <div className="relative aspect-square bg-gray-100 dark:bg-zinc-800/70 w-full overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            loading="lazy"
            decoding="async"
            unoptimized={!mainImage.includes('supabase.co') && !mainImage.includes('unsplash.com')}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600">
            <Package className="w-10 h-10 mb-2" />
            <span className="text-xs font-medium">No Image</span>
          </div>
        )}

        {/* Quick View Magnifier Icon (TradeMe Style) */}
        <div className="absolute top-2.5 left-2.5 z-10 w-7 h-7 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-white/90 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xs">
          <Eye className="w-3.5 h-3.5" />
        </div>

        {/* TradeMe Golden Corner Bookmark for Watchlist */}
        <button
          type="button"
          onClick={handleWatchlistToggle}
          aria-label={isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
          className="absolute top-0 right-0 z-20 transition-transform active:scale-95 focus:outline-none cursor-pointer"
        >
          {isSaved ? (
            /* Iconic golden triangle bookmark with checkmark */
            <div className="relative w-12 h-12 overflow-hidden drop-shadow-md">
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-[#f8c633] to-[#e6ac10] rotate-45 flex items-end justify-center pb-1">
                <Check className="w-3.5 h-3.5 text-[#5e3800] stroke-[3.5] -rotate-45 mb-1 mr-1" />
              </div>
            </div>
          ) : (
            /* Subtle watchlist button on unwatchlisted items, glowing on hover */
            <div className="p-2">
              <div className="w-7 h-7 rounded-full bg-black/35 hover:bg-black/65 backdrop-blur-xs flex items-center justify-center text-white/80 hover:text-white transition-all shadow-xs group-hover:scale-105">
                <Heart className="w-4 h-4 hover:fill-amber-400 hover:text-amber-400 transition-colors" />
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Card Content Area */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Line: Core Location on Left, Closes On Right */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
            <span className="truncate pr-2">{coreLocation}</span>
            <span className={`shrink-0 ${isClosed ? 'text-red-500 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>
              {closesFormatted}
            </span>
          </div>

          {/* Listing Title */}
          <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2 min-h-[2.5rem] leading-snug group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Condition and Time Ago */}
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 mt-1">
            <span>{condition}</span>
            <span>•</span>
            <span className="flex items-center">
              <Clock className="w-2.5 h-2.5 mr-1 inline" />
              {timeAgo}
            </span>
          </div>
        </div>

        {/* Bottom Price Section (TradeMe Layout) */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-zinc-800/80 flex items-end justify-between">
          <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
            {condition?.toLowerCase().includes('new') ? 'Brand New' : 'Used'}
          </div>
          <div className="text-right">
            <div className="text-[10px] sm:text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight">
              {isAuction ? 'Current bid' : 'Buy Now'}
            </div>
            <div className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight">
              €{price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
