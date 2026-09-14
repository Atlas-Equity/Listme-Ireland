'use client';

import React, { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { emitToast } from '@/context/ToastContext';

export default function WalletSetupButton() {
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/wallet/setup', {
        method: 'POST',
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        emitToast(data.error || 'Failed to start wallet setup', 'error');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      emitToast('An unexpected error occurred.', 'error');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSetup}
      disabled={loading}
      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors shadow-sm whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <CreditCard className="w-5 h-5" />
      )}
      Link Card for Purchases
    </button>
  );
}
