import React from 'react';
import { Metadata } from 'next';
import { ListingCard } from '@/components/ListingCard';
import { fetchCategoryListings } from '@/utils/backendApi';
import { PackageX } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

  return {
    title: `${categoryName} Ireland | Buy, Sell & Bid on ListMe`,
    description: `Browse active ${categoryName.toLowerCase()} listings, classifieds, and auctions across Ireland. Buy and sell locally in Dublin, Cork, Galway, Limerick and nationwide.`,
    alternates: {
      canonical: `/category/${slug}`,
    },
    openGraph: {
      title: `${categoryName} in Ireland | ListMe Marketplace`,
      description: `Browse active ${categoryName.toLowerCase()} listings, classifieds, and auctions across Ireland.`,
      url: `/category/${slug}`,
      siteName: 'ListMe Ireland',
      locale: 'en_IE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryName} in Ireland | ListMe Marketplace`,
      description: `Browse active ${categoryName.toLowerCase()} listings and auctions across Ireland.`,
    },
  };
}

import { redirect } from 'next/navigation';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  if (
    slug.toLowerCase() === 'marketplace' ||
    slug.toLowerCase() === 'jobs' ||
    slug.toLowerCase() === 'services' ||
    slug.toLowerCase() === 'motors' ||
    slug.toLowerCase() === 'property'
  ) {
    redirect('/marketplace');
  }
  
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  const listings = await fetchCategoryListings(categoryName);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        
        <div className="mb-6 sm:mb-8 border-b border-gray-200 dark:border-zinc-800 pb-5 sm:pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white capitalize">
            {categoryName}
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Browse all active listings and auctions in {categoryName}.
          </p>
        </div>

        
        {listings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
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
                sellerName={listing.seller_name}
                sellerVerified={listing.seller_verified}
                sellerId={listing.seller_id}
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
