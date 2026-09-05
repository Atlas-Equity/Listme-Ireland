import React from 'react';
import Link from 'next/link';
import { Sofa, Laptop, Briefcase, Wrench, Baby, Smartphone, Music, Shirt } from 'lucide-react';

const categories = [
  { name: 'Marketplace', icon: Laptop, slug: 'marketplace' },
  { name: 'Jobs', icon: Briefcase, slug: 'jobs' },
  { name: 'Services', icon: Wrench, slug: 'services' },
  { name: 'Home & Garden', icon: Sofa, slug: 'marketplace' },
  { name: 'Baby & Kids', icon: Baby, slug: 'marketplace' },
  { name: 'Mobiles', icon: Smartphone, slug: 'marketplace' },
  { name: 'Music', icon: Music, slug: 'marketplace' },
  { name: 'Clothing', icon: Shirt, slug: 'marketplace' },
];

export default function CategoryGrid() {
  return (
    <section className="py-8 sm:py-12 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Browse Marketplace
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Explore categories with live auctions and instant-buy items.
            </p>
          </div>
          <Link
            href="/browse"
            prefetch={true}
            className="text-xs sm:text-sm font-semibold text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        
        <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4 md:gap-6">
          {categories.map((category, idx) => (
            <Link 
              key={idx} 
              href={`/category/${category.slug}`}
              prefetch={true}
              className="flex flex-col items-center group cursor-pointer p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900/60 transition-colors"
            >
              <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gray-100 dark:bg-zinc-900/80 rounded-2xl mb-2 sm:mb-3 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-300 border border-gray-200 dark:border-zinc-800">
                <category.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center group-hover:text-primary transition-colors line-clamp-1">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

