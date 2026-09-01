import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { ListingCard } from '@/components/ListingCard';
import { PackageX } from 'lucide-react';
import Link from 'next/link';

// Next.js 15+ requires params to be awaited
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  // Format slug back to category name (e.g. "marketplace" -> "Marketplace")
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

  const supabase = await createClient();

    // Fetch user to check if they are a business
  const { data: { user } } = await supabase.auth.getUser();
  let isBusiness = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', user.id)
      .single();
    isBusiness = profile?.account_type === 'business';
  }

  // Fetch listings for this category
  const { data: listings, error } = await supabase
    .from('listings')
    .select('*')
    .ilike('category', categoryName)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching category listings:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Category Header */}
        <div className="mb-8 border-b border-gray-200 dark:border-zinc-800 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
            {categoryName}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Browse all active listings in {categoryName}.
          </p>
        </div>

        {/* Listings Grid */}
        {listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-zinc-800">
            <PackageX className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No listings found</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md text-center mb-6">
              There are currently no active listings in the {categoryName} category. Check back later or be the first to list an item!
            </p>
            {isBusiness && (
              <Link 
                href="/sell" 
                className="px-6 py-2 bg-primary hover:bg-green-700 text-white font-medium rounded-md transition-colors"
              >
                Start a Listing
              </Link>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
