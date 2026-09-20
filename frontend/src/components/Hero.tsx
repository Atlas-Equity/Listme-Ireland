'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function Hero() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="relative w-full bg-white dark:bg-black py-6 sm:py-8 border-b border-gray-200 dark:border-zinc-800">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        
        <form
          onSubmit={handleSearch}
          className="w-full flex items-center px-4 py-2.5 sm:py-3 rounded-full border border-gray-300 dark:border-zinc-700 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all bg-white dark:bg-zinc-900"
        >
          <Search className="w-5 h-5 text-gray-500 mr-3 shrink-0" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all of ListMe (e.g. iPhone, BMW, Apartment)..." 
            className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 text-sm sm:text-base"
          />
        </form>
      </div>
    </section>
  );
}
