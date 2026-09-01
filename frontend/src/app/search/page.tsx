import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { ListingCard } from '@/components/ListingCard';
import { Search } from 'lucide-react';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = (params.q as string) || '';
  const supabase = await createClient();

  // Search across title and description
  const { data: listings, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-[70vh] bg-gray-50 dark:bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Search Results
        </h1>
        <p className="text-gray-500 mb-8">
          Showing results for <span className="font-semibold text-gray-900 dark:text-white">"{query}"</span>
        </p>

        {error && (
          <div className="p-4 bg-red-100 text-red-600 rounded-lg">
            Error loading results. Please try again.
          </div>
        )}

        {!error && (!listings || listings.length === 0) && (
          <div className="text-center py-20 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-zinc-800">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No listings found</h3>
            <p className="text-gray-500">We couldn't find anything matching your search. Try adjusting your keywords.</p>
          </div>
        )}

        {!error && listings && listings.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
        )}
      </div>
    </div>
  );
}
