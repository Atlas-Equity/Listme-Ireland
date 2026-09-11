'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RotateCcw, Trash2, AlertTriangle, CheckCircle2, Clock, Loader2, X } from 'lucide-react';
import { relistListingAction, deleteListingAction, dismissNotificationAction } from '@/app/actions/relist';

interface RelistNotificationCardProps {
  listing: {
    id: string;
    title: string;
    price: number | string;
    images?: string[];
    closes_at?: string;
    condition?: string;
  };
}

export default function RelistNotificationCard({ listing }: RelistNotificationCardProps) {
  const [isRelisting, setIsRelisting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  const handleRelist = async () => {
    setIsRelisting(true);
    setStatusMessage(null);
    try {
      const res = await relistListingAction(listing.id);
      if (res.error) {
        setStatusMessage(`Error: ${res.error}`);
      } else {
        setStatusMessage(res.message || 'Listing relisted for 7 days!');
        setIsDone(true);
      }
    } catch {
      setStatusMessage('Failed to relist listing.');
    } finally {
      setIsRelisting(false);
    }
  };

  const handleDismiss = async () => {
    setIsDismissing(true);
    setIsDone(true);
    try {
      await dismissNotificationAction(listing.id);
    } catch {
      // Ignore
    } finally {
      setIsDismissing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${listing.title}"?`)) {
      return;
    }
    setIsDeleting(true);
    setStatusMessage(null);
    try {
      const res = await deleteListingAction(listing.id);
      if (res.error) {
        setStatusMessage(`Error: ${res.error}`);
      } else {
        setStatusMessage('Listing deleted.');
        setIsDone(true);
      }
    } catch {
      setStatusMessage('Failed to delete listing.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isDone) {
    return (
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-gray-200 flex items-center gap-2 text-xs font-semibold">
        <CheckCircle2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        <span>{statusMessage}</span>
      </div>
    );
  }

  const thumb = listing.images?.[0] || '/placeholder.png';

  return (
    <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Left: Image & Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 relative shrink-0 border border-gray-200 dark:border-zinc-700">
            <Image
              src={thumb}
              alt={listing.title}
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-gray-700 dark:text-gray-300">
                <AlertTriangle className="w-3.5 h-3.5 text-gray-500" />
                Listing Closed Unsold
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Auto-deletes in 3 days
              </span>
            </div>

            <Link
              href={`/listing/${listing.id}`}
              className="font-bold text-sm text-gray-900 dark:text-white hover:text-primary transition-colors truncate block"
            >
              {listing.title}
            </Link>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Price: €{listing.price} • This listing closed with 0 bids. Would you like to relist it?
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleRelist}
            disabled={isRelisting || isDeleting}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isRelisting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            <span>Relist Now (7 Days)</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isRelisting || isDeleting || isDismissing}
            className="p-2 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:text-red-600 hover:border-red-300 dark:hover:border-red-800 transition-colors cursor-pointer disabled:opacity-50"
            title="Delete permanently"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-500" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            disabled={isRelisting || isDeleting || isDismissing}
            className="p-2 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer disabled:opacity-50"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>

      {statusMessage && (
        <p className="text-xs text-red-500 mt-2 font-medium">{statusMessage}</p>
      )}
    </div>
  );
}
