'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  listingId: string;
  isAuction: boolean;
  stripeEnabled: boolean;
}

export default function CheckoutButton({ listingId, isAuction, stripeEnabled }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (isAuction) {
      alert("Bidding is not yet implemented.");
      return;
    }

    if (!stripeEnabled) {
      alert("This seller has not enabled online payments.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to checkout');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An error occurred during checkout');
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCheckout}
      disabled={loading || (isAuction && !stripeEnabled)}
      className="w-full py-3 px-4 bg-[#0073e6] hover:bg-[#005bb5] text-white font-bold rounded-sm transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer"
    >
      {loading ? (
        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Redirecting...</>
      ) : (
        isAuction ? 'Place bid' : 'Buy Now'
      )}
    </button>
  );
}
