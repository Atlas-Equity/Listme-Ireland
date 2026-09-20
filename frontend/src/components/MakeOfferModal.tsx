'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, X, Loader2, AlertCircle, CheckCircle2, MessageSquare, Info } from 'lucide-react';
import { submitOfferAction } from '@/app/actions/offers';
import { calculateServiceFee } from '@/utils/serviceFee';

interface MakeOfferModalProps {
  listingId: string;
  sellerId: string;
  listingTitle: string;
  askingPrice: number;
  isOpen: boolean;
  onClose: () => void;
  isAuction?: boolean;
}

export default function MakeOfferModal({
  listingId,
  sellerId,
  listingTitle,
  askingPrice,
  isOpen,
  onClose,
  isAuction = false,
}: MakeOfferModalProps) {
  const router = useRouter();
  const [offerAmount, setOfferAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const minAllowedOffer = Math.round((askingPrice * 0.90) * 100) / 100;

  const handlePreset = (percentage: number) => {
    const discounted = Math.max(minAllowedOffer, Math.round((askingPrice * (1 - percentage / 100)) * 100) / 100);
    setOfferAmount(discounted.toFixed(2));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(offerAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid offer amount.');
      return;
    }

    if (!isAuction && amountNum >= askingPrice) {
      setError('Your offer should be lower than the asking price. Consider using Buy Now instead.');
      return;
    }

    if (amountNum < minAllowedOffer) {
      setError(`Offers must be at least 90% of the asking price (€${minAllowedOffer.toFixed(2)}).`);
      return;
    }

    setError(null);

    startTransition(async () => {
      const res = await submitOfferAction({
        listingId,
        sellerId,
        amount: amountNum,
        note,
      });

      if (!res.success) {
        setError(res.error || 'Failed to submit offer. Please try again.');
        return;
      }

      onClose();
      if (res.conversationId) {
        router.push(`/messages?conversation=${res.conversationId}`);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <span>Make an Offer</span>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900/70 border border-gray-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="min-w-0 pr-3">
              <div className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
                Item
              </div>
              <div className="font-bold text-sm text-gray-900 dark:text-white truncate">
                {listingTitle}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
                Asking Price
              </div>
              <div className="font-extrabold text-sm text-gray-900 dark:text-white">
                €{askingPrice.toFixed(2)}
              </div>
            </div>
          </div>

          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Quick Suggestions
              </label>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                Minimum 90% floor (€{minAllowedOffer.toFixed(2)})
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePreset(3)}
                className="py-1.5 px-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 transition-colors"
              >
                -3% (€{(askingPrice * 0.97).toFixed(2)})
              </button>
              <button
                type="button"
                onClick={() => handlePreset(5)}
                className="py-1.5 px-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 transition-colors"
              >
                -5% (€{(askingPrice * 0.95).toFixed(2)})
              </button>
              <button
                type="button"
                onClick={() => handlePreset(10)}
                className="py-1.5 px-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 transition-colors"
              >
                -10% (€{minAllowedOffer.toFixed(2)})
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Your Offer Amount (€)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-bold text-lg">
                €
              </span>
              <input
                type="number"
                step="0.50"
                min={minAllowedOffer.toString()}
                max={askingPrice.toString()}
                value={offerAmount}
                onChange={(e) => {
                  setOfferAmount(e.target.value);
                  setError(null);
                }}
                placeholder={minAllowedOffer.toFixed(2)}
                required
                className="w-full pl-9 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl font-bold text-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-1 px-1">
              <span>Minimum allowed: €{minAllowedOffer.toFixed(2)} (90%)</span>
              <span>Asking price: €{askingPrice.toFixed(2)}</span>
            </div>
            {parseFloat(offerAmount) > 0 && (
              <div className="mt-2 p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-[#0073e6]" />
                  Service fee ({calculateServiceFee(parseFloat(offerAmount)).percentageFormatted}):
                </span>
                <span className="font-mono font-bold text-primary dark:text-blue-400">
                  +€{calculateServiceFee(parseFloat(offerAmount)).fee.toFixed(2)} (Total: €{calculateServiceFee(parseFloat(offerAmount)).total.toFixed(2)})
                </span>
              </div>
            )}
          </div>

          
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Add a note for the seller (Optional)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Can collect today with cash, or pay securely via card."
              className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !offerAmount}
              className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-green-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Tag className="w-4 h-4" />
                  Send Offer
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
