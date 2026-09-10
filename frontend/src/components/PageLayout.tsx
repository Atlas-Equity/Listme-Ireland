import React from 'react';
import FilterSidebar, { FilterGroup } from './FilterSidebar';
import { ListingCard } from './ListingCard';
import { AnyListing } from '@/lib/mockData';

interface PageLayoutProps {
  title: string;
  description: string;
  filterGroups: FilterGroup[];
  listings: AnyListing[];
}

export default function PageLayout({ title, description, filterGroups, listings }: PageLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
        <p className="text-gray-500 dark:text-gray-400">{description}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <FilterSidebar title="Filters" filterGroups={filterGroups} />

        {/* Main Content */}
        <div className="flex-1 w-full">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6 bg-white dark:bg-zinc-950 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Showing {listings.length} results
            </span>
            <select className="bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm rounded-md focus:ring-primary focus:border-primary block p-2">
              <option>Featured first</option>
              <option>Lowest price</option>
              <option>Highest price</option>
              <option>Latest listings</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {listings.map((listing: any) => (
              <ListingCard 
                key={listing.id} 
                id={listing.id}
                title={listing.title}
                price={typeof listing.price === 'string' ? parseFloat(listing.price.replace(/[^0-9.]/g, '')) || 0 : listing.price}
                priceType={listing.type === 'auction' ? 'Auction' : 'Fixed Price'}
                condition={listing.condition || 'Used - Good'}
                images={[listing.imageUrl]}
                createdAt={new Date().toISOString()}
                location={listing.location || 'Dublin'}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
