'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWatchlistIdsAction, toggleWatchlist as toggleWatchlistServer } from '@/app/actions/wishlist';
import { createClient } from '@/utils/supabase/client';

interface WatchlistContextType {
  isWatchlisted: (listingId: string) => boolean;
  toggleWatchlist: (listingId: string) => Promise<boolean>;
  watchlistIds: string[];
  isLoading: boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'listme_watchlist_ids';

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initial hydration: verify auth state, load from server if logged in, otherwise clear
  useEffect(() => {
    const hasAuthCookie = typeof document !== 'undefined' && document.cookie.includes('-auth-token');

    if (!hasAuthCookie) {
      setWatchlistIds([]);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {}
      setIsLoading(false);
    } else {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setWatchlistIds(parsed);
          }
        }
      } catch {}

      getWatchlistIdsAction().then((serverIds) => {
        if (Array.isArray(serverIds)) {
          setWatchlistIds(serverIds);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverIds));
          } catch {}
        }
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    }

    // Listen to Supabase auth events (e.g. user signs out in another tab or clicks Sign Out)
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setWatchlistIds([]);
        try {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch {}
      } else if (event === 'SIGNED_IN' && session) {
        getWatchlistIdsAction().then((serverIds) => {
          if (Array.isArray(serverIds)) {
            setWatchlistIds(serverIds);
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverIds));
            } catch {}
          }
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isWatchlisted = useCallback(
    (listingId: string) => {
      return watchlistIds.includes(listingId);
    },
    [watchlistIds]
  );

  const toggleWatchlist = useCallback(
    async (listingId: string): Promise<boolean> => {
      const currentlySaved = watchlistIds.includes(listingId);
      const nextStatus = !currentlySaved;

      // Optimistic update
      setWatchlistIds((prev) => {
        const updated = nextStatus
          ? Array.from(new Set([...prev, listingId]))
          : prev.filter((id) => id !== listingId);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      try {
        const res = await toggleWatchlistServer(listingId, nextStatus);
        if (!res.success) {
          // Revert optimistic update
          setWatchlistIds((prev) => {
            const reverted = currentlySaved
              ? Array.from(new Set([...prev, listingId]))
              : prev.filter((id) => id !== listingId);
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reverted));
            } catch {}
            return reverted;
          });

          if (res.error === 'Unauthorized') {
            alert('Please sign in to add items to your watchlist.');
          }
          return currentlySaved;
        }

        return nextStatus;
      } catch (err) {
        console.error('Failed to toggle watchlist:', err);
        // Revert optimistic update
        setWatchlistIds((prev) => {
          const reverted = currentlySaved
            ? Array.from(new Set([...prev, listingId]))
            : prev.filter((id) => id !== listingId);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reverted));
          } catch {}
          return reverted;
        });
        return currentlySaved;
      }
    },
    [watchlistIds]
  );

  return (
    <WatchlistContext.Provider
      value={{
        isWatchlisted,
        toggleWatchlist,
        watchlistIds,
        isLoading,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    // Fallback safe dummy context if outside provider
    return {
      isWatchlisted: () => false,
      toggleWatchlist: async () => false,
      watchlistIds: [],
      isLoading: false,
    };
  }
  return context;
}
