'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function WalletLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/connect/login', {
        method: 'POST',
      });
      const data = await res.json();
      
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to open wallet');
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-medium rounded-md transition-colors whitespace-nowrap flex items-center justify-center min-w-[140px]"
    >
      {loading ? (
        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...</>
      ) : (
        'Manage Wallet'
      )}
    </button>
  );
}
