import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Car, Home, ChevronRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export default async function TrendingCategories() {
  const supabase = await createClient();

  // Fast count query using head: true (transfers 0 bytes of row data, executes index count)
  const [marketplaceRes, motorsRes, propertyRes] = await Promise.all([
    supabase.from('listings').select('id', { count: 'exact', head: true }).ilike('category', '%Marketplace%').eq('status', 'active'),
    supabase.from('listings').select('id', { count: 'exact', head: true }).ilike('category', '%Motors%').eq('status', 'active'),
    supabase.from('listings').select('id', { count: 'exact', head: true }).ilike('category', '%Property%').eq('status', 'active'),
  ]);

  const categories = [
    {
      category: 'Marketplace',
      count: marketplaceRes.count ?? 0,
      icon: ShoppingBag,
      slug: 'marketplace',
    },
    {
      category: 'Motors',
      count: motorsRes.count ?? 0,
      icon: Car,
      slug: 'motors',
    },
    {
      category: 'Property',
      count: propertyRes.count ?? 0,
      icon: Home,
      slug: 'property',
    },
  ];

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
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
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
