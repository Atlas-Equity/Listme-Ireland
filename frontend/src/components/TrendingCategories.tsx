import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Car, Home, Briefcase, Wrench, ChevronRight, Package } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Marketplace': ShoppingBag,
  'Property': Home,
  'Motors': Car,
  'Jobs': Briefcase,
  'Services': Wrench,
};

export default async function TrendingCategories() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from('listings')
    .select('category')
    .eq('status', 'active');

  const counts: Record<string, number> = {};
  
  // Default categories so the UI is never empty
  const defaultCategories = ['Marketplace', 'Motors', 'Property'];
  defaultCategories.forEach(cat => { counts[cat] = 0; });

  listings?.forEach(item => {
    counts[item.category] = (counts[item.category] || 0) + 1;
  });

  const topCategories = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, count]) => ({ category, count }));

  return (
    <div className="mb-8 mt-12">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Trending Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {topCategories.map(({ category, count }) => {
          const Icon = CATEGORY_ICONS[category] || Package;
          const slug = category.toLowerCase().replace(/\s+/g, '-');
          
          return (
            <Link 
              key={category}
              href={`/category/${slug}`} 
              className="flex items-center justify-between bg-white dark:bg-[#202020] border-2 border-blue-500 rounded-md p-4 group hover:bg-blue-50 dark:hover:bg-[#1a2333] transition-colors"
            >
              <div className="flex items-center">
                <Icon className="w-5 h-5 text-blue-500 mr-3" />
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {count === 0 ? 'No' : count} {category} Listings 
                  <span className="font-normal text-sm text-gray-500 dark:text-gray-400 ml-1">AVAILABLE NOW</span>
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-blue-500 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          );
        })}

      </div>
    </div>
  );
}
