import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ListingCard } from '@/components/ListingCard';

export default async function WatchlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch wishlists with joined listing data
  const { data: wishlists, error } = await supabase
    .from('wishlists')
    .select(`
      id,
      listing:listings (
        id,
        title,
        price,
        price_type,
        condition,
        images,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching wishlists:', error);
  }

  // Filter out any wishlists where listing was deleted, then map to listing array
  const activeListings = (wishlists || [])
    .filter(item => item.listing !== null)
    .map(item => item.listing);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Watchlist</h1>
        <p className="text-gray-500 dark:text-gray-400">Items you are keeping an eye on.</p>
      </div>

      {activeListings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 text-lg">Your watchlist is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeListings.map((listing: any) => (
            <ListingCard 
              key={listing.id} 
              id={listing.id}
              title={listing.title}
              price={typeof listing.price === 'string' ? parseFloat(listing.price.replace(/[^0-9.]/g, '')) || 0 : listing.price}
              priceType={listing.price_type === 'Auction' ? 'Auction' : 'Fixed Price'}
              condition={listing.condition || 'Used - Good'}
              images={listing.images || []}
              createdAt={listing.created_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}
