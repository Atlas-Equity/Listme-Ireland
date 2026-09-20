'use client';

import React, { useState, useTransition } from 'react';
import { placeBid } from '@/app/actions/bids';
import { AlertCircle, CreditCard, Loader2 } from 'lucide-react';

interface BiddingFormProps {
  listingId: string;
  minBid: number;
}

export default function BiddingForm({ listingId, minBid }: BiddingFormProps) {
  const effectiveMinBid = Math.max(1.00, Number(minBid) || 1.00);
  const [amount, setAmount] = useState<string>(effectiveMinBid.toFixed(2));
  const [error, setError] = useState<string | null>(null);
  const [requiresCard, setRequiresCard] = useState(false);
  const [linkingCard, setLinkingCard] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLinkCard = async () => {
    setLinkingCard(true);
    try {
      const res = await fetch('/api/wallet/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: `/listing/${listingId}` }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to start card setup.');
        setLinkingCard(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start card setup.');
      setLinkingCard(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRequiresCard(false);

    const bidAmount = Math.round((parseFloat(amount) || 0) * 100) / 100;
    if (isNaN(bidAmount) || bidAmount < effectiveMinBid) {
      setError(`Bid must be at least €${effectiveMinBid.toFixed(2)}`);
      return;
    }

    startTransition(async () => {
      const result = await placeBid(listingId, bidAmount);
      if (!result.success) {
        setError(result.error || 'Failed to place bid');
        if (result.requiresPaymentMethod) {
          setRequiresCard(true);
        }
      } else {
        // Clear input, path will be revalidated
        setAmount((bidAmount + 1).toString());
      }
    });
  };

  return (
    <div className="mt-6 w-full">
      {error && (
        <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span className="leading-snug">{error}</span>
          </div>

          {requiresCard && (
            <div className="mt-3 pt-3 border-t border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-xs text-gray-300">
                Link a card via Stripe to satisfy eBay-style buyer verification:
              </span>
              <button
                type="button"
                onClick={handleLinkCard}
                disabled={linkingCard}
                className="w-full sm:w-auto px-4 py-1.5 bg-primary hover:bg-green-700 text-white font-bold text-xs rounded shadow-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                {linkingCard ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Connecting...</>
                ) : (
                  <><CreditCard className="w-3.5 h-3.5" /> Link Card to Bid</>
                )}
              </button>
            </div>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
          <input
            type="number"
            step="0.01"
            min={effectiveMinBid}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-md py-3 pl-8 pr-4 text-white text-lg font-bold focus:outline-none focus:border-[#0073e6]"
            required
            disabled={isPending}
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 bg-[#0073e6] hover:bg-[#005bb5] text-white font-bold rounded-sm transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? 'Placing Bid...' : 'Place Bid'}
        </button>
      </form>
    </div>
  );
}
