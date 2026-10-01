'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

function SearchBarInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/marketplace?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/marketplace');
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <div className="relative flex items-center w-full">
        <Search className="absolute left-3.5 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search marketplace items..."
          className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-full bg-gray-100 dark:bg-zinc-800/90 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white dark:focus:bg-zinc-800 transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 p-0.5 text-gray-400 hover:text-gray-600 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-full transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </form>
  );
}

export default function NavbarSearchBar() {
  return (
    <Suspense
      fallback={
        <div className="relative w-full max-w-md">
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              readOnly
              placeholder="Search marketplace items..."
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-full bg-gray-100 dark:bg-zinc-800/90 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
        </div>
      }
    >
      <SearchBarInput />
    </Suspense>
  );
}
