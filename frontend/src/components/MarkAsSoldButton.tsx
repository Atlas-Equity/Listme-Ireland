'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, X, Banknote } from 'lucide-react';
import { markListingAsSoldAction } from '@/app/sell/actions';

interface MarkAsSoldButtonProps {
  listingId: string;
  listingTitle: string;
  isCashOnly?: boolean;
  className?: string;
}

export default function MarkAsSoldButton({
  listingId,
  listingTitle,
  isCashOnly = false,
  className = '',
}: MarkAsSoldButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMarkSold = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await markListingAsSoldAction(listingId);
      if (!res.success) {
        setError(res.error || 'Failed to mark listing as sold.');
        setIsSubmitting(false);
      } else {
        setIsOpen(false);
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-800 transition-colors cursor-pointer ${className}`}
        title="Mark listing as sold"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Mark as Sold</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              Mark as Sold?
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
              Are you sure you want to mark <strong>&quot;{listingTitle}&quot;</strong> as sold? This will close the listing to new buyers.
            </p>

            {isCashOnly && (
              <div className="p-3 mb-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <Banknote className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  For cash-on-collection sales, a ListMe seller transaction fee of <strong>€0.50</strong> applies upon sale.
                </span>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 mb-4 bg-red-50 dark:bg-red-950/30 p-2 rounded-lg border border-red-200 dark:border-red-900/40 font-medium">
                {error}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 px-4 text-xs font-semibold rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMarkSold}
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Confirm Sold'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
