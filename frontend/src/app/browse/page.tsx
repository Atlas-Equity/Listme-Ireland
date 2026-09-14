import React from 'react';
import CategoryGrid from '@/components/CategoryGrid';

export const revalidate = 60;

export default function BrowsePage() {
  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Browse All Categories</h1>
        <p className="text-gray-500 dark:text-gray-400">Find exactly what you're looking for by exploring our categories below.</p>
      </div>
      <CategoryGrid />
    </div>
  );
}
