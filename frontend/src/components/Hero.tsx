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
    <section className="relative w-full bg-white dark:bg-black py-8 border-b border-gray-200 dark:border-zinc-800">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        {/* Big Search Bar */}
        <form onSubmit={handleSearch} className="w-full flex flex-col sm:flex-row gap-0 rounded-full border border-gray-300 dark:border-zinc-700 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all bg-white dark:bg-zinc-900">
          
          <div className="flex-1 flex items-center px-4 py-3 sm:py-2">
            <Search className="w-5 h-5 text-gray-500 mr-3 shrink-0" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search all of ListMe..." 
              className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 text-base"
            />
          </div>

          <button type="submit" className="w-full sm:w-32 bg-[#4a4a4a] hover:bg-[#333333] dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-bold py-3 sm:py-2 px-6 transition-colors text-sm">
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
