'use client';

import React, { useState, useTransition } from 'react';
import { placeBid } from '@/app/actions/bids';
import { AlertCircle } from 'lucide-react';

interface BiddingFormProps {
  listingId: string;
  minBid: number;
}

export default function BiddingForm({ listingId, minBid }: BiddingFormProps) {
  const [amount, setAmount] = useState<string>(minBid.toString());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const bidAmount = parseFloat(amount);
    if (isNaN(bidAmount) || bidAmount < minBid) {
      setError(`Bid must be at least $${minBid.toFixed(2)}`);
      return;
    }

    startTransition(async () => {
      const result = await placeBid(listingId, bidAmount);
      if (!result.success) {
        setError(result.error || 'Failed to place bid');
      } else {
        // Clear input, path will be revalidated
        setAmount((bidAmount + 1).toString());
      }
    });
  };

  return (
    <div className="mt-6 w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm flex items-start">
          <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
          <input
            type="number"
            step="0.01"
            min={minBid}
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
