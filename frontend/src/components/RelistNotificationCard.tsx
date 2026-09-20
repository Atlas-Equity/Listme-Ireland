'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RotateCcw, Trash2, AlertTriangle, CheckCircle2, Clock, Loader2, Coins, ExternalLink } from 'lucide-react';
import { relistListingAction, deleteListingAction } from '@/app/actions/relist';

interface RelistNotificationCardProps {
  listing: {
    id: string;
    title: string;
    price: number | string;
    images?: string[];
    closes_at?: string;
    condition?: string;
    price_type?: string;
    reserve_price?: number;
    category?: string;
  };
  userCredit?: number;
  isQuinn?: boolean;
}

export default function RelistNotificationCard({ 
  listing, 
  userCredit = 0, 
  isQuinn = false 
}: RelistNotificationCardProps) {
  const [duration, setDuration] = useState<'5m' | '7' | '14' | '30'>('7');
  const [isRelisting, setIsRelisting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Calculate fee for selected duration and listing properties
  const durationFee = duration === '14' || duration === '30' ? 0.10 : 0;
  const hasReserve = listing.price_type === 'Auction' && listing.reserve_price && Number(listing.reserve_price) > 0;
  const reserveFee = hasReserve ? 0.25 : 0;
  const isOtherCategory = listing.category?.startsWith('Other & Miscellaneous') || listing.category === 'Other & Miscellaneous';
  const categoryFee = isOtherCategory ? 0.50 : 0;
  const totalFee = Math.round((durationFee + reserveFee + categoryFee) * 100) / 100;

  const hasEnoughCredit = userCredit >= totalFee;

  const handleRelist = async () => {
    if (totalFee > 0 && !hasEnoughCredit) {
      setStatusMessage(`Account credit required: Relisting incurs €${totalFee.toFixed(2)}, but your credit balance is €${userCredit.toFixed(2)}. Please top up credit in your wallet.`);
      return;
    }

    setIsRelisting(true);
    setStatusMessage(null);
    try {
      const res = await relistListingAction(listing.id, duration);
      if (res.error) {
        setStatusMessage(res.error);
      } else {
        setStatusMessage(res.message || 'Listing successfully relisted!');
        setIsDone(true);
      }
    } catch {
      setStatusMessage('Failed to relist listing. Please try again.');
    } finally {
      setIsRelisting(false);
    }
  };

  const executeDelete = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    setStatusMessage(null);
    try {
      const res = await deleteListingAction(listing.id);
      if (res.error) {
        setStatusMessage(`Error: ${res.error}`);
      } else {
        setStatusMessage('Listing permanently deleted.');
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
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-gray-200 flex items-center gap-2 text-xs font-semibold animate-in fade-in duration-200">
        <CheckCircle2 className="w-4 h-4 text-primary" />
        <span>{statusMessage}</span>
      </div>
    );
  }

  const thumb = listing.images?.[0] || '/placeholder.png';

  return (
    <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Listing Info */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
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
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Listing Closed Unsold
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Relist or Delete
              </span>
            </div>

            <Link
              href={`/listing/${listing.id}`}
              className="font-bold text-sm text-gray-900 dark:text-white hover:text-primary transition-colors truncate block"
            >
              {listing.title}
            </Link>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Price: €{listing.price} • Closed with 0 bids. Choose duration to relist, or delete permanently.
            </p>
          </div>
        </div>

        {/* Action Controls: Strictly Relist or Delete (Forced Choice - No Dismiss) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          
          {/* Duration Selector */}
          <div className="flex items-center gap-1">
            <label htmlFor={`duration-${listing.id}`} className="sr-only">Duration</label>
            <select
              id={`duration-${listing.id}`}
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value as any);
                setStatusMessage(null);
              }}
              disabled={isRelisting || isDeleting}
              className="px-2.5 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-700 outline-hidden cursor-pointer hover:border-gray-300 dark:hover:border-zinc-600 transition-colors"
            >
              {isQuinn && <option value="5m">5 Min (Test Mode)</option>}
              <option value="7">7 Days {reserveFee > 0 ? `(+€${reserveFee.toFixed(2)})` : '(Free)'}</option>
              <option value="14">14 Days (+€{(0.10 + reserveFee).toFixed(2)})</option>
              <option value="30">30 Days (+€{(0.10 + reserveFee).toFixed(2)})</option>
            </select>
          </div>

          {/* Relist Button */}
          <button
            type="button"
            onClick={handleRelist}
            disabled={isRelisting || isDeleting || (totalFee > 0 && !hasEnoughCredit)}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title={totalFee > 0 && !hasEnoughCredit ? `Requires €${totalFee.toFixed(2)} account credit` : undefined}
          >
            {isRelisting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            <span>
              {totalFee > 0 
                ? `Relist (€${totalFee.toFixed(2)} Fee)`
                : `Relist (${duration === '5m' ? '5m' : `${duration} Days`})`}
            </span>
          </button>

          {/* Force Delete Action */}
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1.5 p-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl">
              <span className="text-[11px] font-bold text-red-600 dark:text-red-400 px-1.5">Delete?</span>
              <button
                type="button"
                onClick={executeDelete}
                disabled={isDeleting}
                className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
              >
                {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2.5 py-1 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isRelisting || isDeleting}
              className="p-2 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:text-red-600 hover:border-red-300 dark:hover:border-red-800 transition-colors cursor-pointer disabled:opacity-50"
              title="Delete permanently"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>

      {/* Credit & Fee Breakdown Bar (shown when fee applies) */}
      {totalFee > 0 && (
        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 text-[11px]">
            <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              Fee: <strong>€{totalFee.toFixed(2)}</strong> (Runs through Account Credit: {durationFee > 0 ? `${duration}-day listing €0.10` : ''}{durationFee > 0 && reserveFee > 0 ? ' + ' : ''}{reserveFee > 0 ? 'reserve fee €0.25' : ''})
            </span>
          </div>

          <div className="text-[11px] flex items-center gap-2">
            {hasEnoughCredit ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                ✓ Available Credit: €{userCredit.toFixed(2)}
              </span>
            ) : (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                <span>Credit: €{userCredit.toFixed(2)} (Insufficient)</span>
                <Link 
                  href="/my-listme?tab=account" 
                  className="underline hover:text-red-700 dark:hover:text-red-300 inline-flex items-center gap-0.5 ml-1"
                >
                  <span>Top up</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 font-medium">
          {statusMessage}
        </div>
      )}
    </div>
  );
}
