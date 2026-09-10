import React from 'react';
import { ListingCard } from '@/components/ListingCard';
import { fetchCategoryListings } from '@/utils/backendApi';
import { PackageX } from 'lucide-react';
import Link from 'next/link';

// Cache category pages for 60s for ultra-fast browsing
export const revalidate = 60;

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  // Format slug back to category name (e.g. "marketplace" -> "Marketplace")
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

  // Fetch category listings via fast cached backend API
  const listings = await fetchCategoryListings(categoryName);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Category Header */}
        <div className="mb-6 sm:mb-8 border-b border-gray-200 dark:border-zinc-800 pb-5 sm:pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white capitalize">
            {categoryName}
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Browse all active listings and auctions in {categoryName}.
          </p>
        </div>

        {/* Listings Grid */}
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {listings.map((listing) => (
              <ListingCard 
                key={listing.id}
                id={listing.id}
                title={listing.title}
                price={listing.price}
                priceType={listing.price_type}
                condition={listing.condition}
                images={listing.images}
                createdAt={listing.created_at}
                location={listing.location}
                closesAt={listing.expires_at || listing.ends_at}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-zinc-800 text-center">
            <PackageX className="w-14 h-14 sm:w-16 sm:h-16 text-gray-400 mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">No listings found</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              There are currently no active listings in the {categoryName} category. Check back later or be the first to list an item!
            </p>
            <Link 
              href="/sell" 
              className="px-6 py-2.5 bg-primary hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
            >
              Start a Listing
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
