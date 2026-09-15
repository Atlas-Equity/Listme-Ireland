import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Car, Laptop, ChevronRight } from 'lucide-react';
import { createClient as createStatelessClient } from '@supabase/supabase-js';

const publicSupabase = createStatelessClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const globalForCatCache = globalThis as unknown as {
  categoryCountsCache?: { counts: { marketplace: number; motors: number; tech: number }; expiresAt: number };
};

export default async function TrendingCategories() {
  let counts = globalForCatCache.categoryCountsCache?.counts;
  const isExpired = !globalForCatCache.categoryCountsCache || Date.now() > globalForCatCache.categoryCountsCache.expiresAt;

  if (!counts || isExpired) {
    const [marketplaceRes, motorsRes, techRes] = await Promise.all([
      publicSupabase.from('listings').select('id', { count: 'exact', head: true }).ilike('category', '%Marketplace%').eq('status', 'active'),
      publicSupabase.from('listings').select('id', { count: 'exact', head: true }).or('category.ilike.%Motor%,category.ilike.%Vehicle%').eq('status', 'active'),
      publicSupabase.from('listings').select('id', { count: 'exact', head: true }).or('category.ilike.%Tech%,category.ilike.%Electronic%').eq('status', 'active'),
    ]);

    counts = {
      marketplace: marketplaceRes.count ?? 0,
      motors: motorsRes.count ?? 0,
      tech: techRes.count ?? 0,
    };

    globalForCatCache.categoryCountsCache = {
      counts,
      expiresAt: Date.now() + 60 * 1000,
    };
  }

  const categories = [
    {
      category: 'Marketplace',
      count: counts.marketplace,
      icon: ShoppingBag,
      slug: 'marketplace',
    },
    {
      category: 'Motors & Vehicles',
      count: counts.motors,
      icon: Car,
      slug: 'motors',
    },
    {
      category: 'Electronics & Tech',
      count: counts.tech,
      icon: Laptop,
      slug: 'marketplace',
    },
  ];

  console.timeEnd('TrendingCategories');

  return (
    <div className="mb-8 mt-8 sm:mt-12">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Trending Categories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {categories.map(({ category, count, icon: Icon, slug }) => (
          <Link 
            key={category}
            href={`/category/${slug}`}
            prefetch={true}
            className="flex items-center justify-between bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-800 hover:border-primary dark:hover:border-primary rounded-xl p-4 group transition-all shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-200 flex items-center justify-center shrink-0 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
                  {category}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {count === 0 ? 'Browse listings' : `${count} available`}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
