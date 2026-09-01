import React from 'react';
import { Sofa, Laptop, Briefcase, Wrench, Baby, Car, Home, Smartphone, Music, Shirt } from 'lucide-react';

const categories = [
  { name: 'Home & Garden', icon: Home },
  { name: 'Electronics', icon: Laptop },
  { name: 'Jobs', icon: Briefcase, highlight: true },
  { name: 'Services', icon: Wrench },
  { name: 'Baby & Kids', icon: Baby },
  { name: 'Motors', icon: Car, isNew: true },
  { name: 'Property', icon: Home, isNew: true },
  { name: 'Mobiles', icon: Smartphone },
  { name: 'Music', icon: Music },
  { name: 'Clothing', icon: Shirt },
];

export default function CategoryGrid() {
  return (
    <section className="py-12 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Browse Marketplace
        </h2>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-4 sm:gap-6">
          {categories.map((category, idx) => (
            <a 
              key={idx} 
              href="#" 
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 dark:bg-zinc-900 rounded-xl mb-3 group-hover:bg-primary group-hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-zinc-800">
                <category.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                {category.isNew && (
                  <span className="absolute -top-1 -right-2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase border-2 border-white dark:border-zinc-950">
                    New
                  </span>
                )}
                {category.highlight && (
                  <span className="absolute -bottom-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase border-2 border-white dark:border-zinc-950">
                    Hot
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center group-hover:text-primary transition-colors">
                {category.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
