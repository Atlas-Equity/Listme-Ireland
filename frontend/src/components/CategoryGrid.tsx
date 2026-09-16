import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Users } from 'lucide-react';

const categories = [
  { name: 'Marketplace', icon: ShoppingBag, href: '/marketplace' },
  { name: 'Community', icon: Users, href: '/community' },
];

export default function CategoryGrid() {
  return (
    <section className="py-8 sm:py-12 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Explore ListMe
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Browse marketplace auctions or join discussions in the community hub.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          {categories.map((category, idx) => (
            <Link 
              key={idx} 
              href={category.href}
              prefetch={true}
              className="flex flex-col items-center group cursor-pointer p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors border border-gray-200 dark:border-zinc-800"
            >
              <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white dark:bg-zinc-800 rounded-2xl mb-3 group-hover:bg-primary/20 transition-all duration-300 border border-gray-200 dark:border-zinc-700">
                <category.icon className="w-6 h-6 sm:w-7 sm:h-7 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors" />
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 text-center group-hover:text-primary transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

