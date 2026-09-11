'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCheck, Loader2 } from 'lucide-react';
import { clearAllNotificationsAction } from '@/app/actions/relist';

export default function ClearAllNotificationsButton({ listingIds }: { listingIds: string[] }) {
  const router = useRouter();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearAll = async () => {
    if (listingIds.length === 0) return;
    setIsClearing(true);
    try {
      await clearAllNotificationsAction(listingIds);
      router.refresh();
    } catch {
      setIsClearing(false);
    }
  };

  if (listingIds.length === 0) return null;

  return (
    <button
      type="button"
      onClick={handleClearAll}
      disabled={isClearing}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
    >
      {isClearing ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <CheckCheck className="w-3.5 h-3.5 text-primary" />
      )}
      <span>Clear All</span>
    </button>
  );
}
