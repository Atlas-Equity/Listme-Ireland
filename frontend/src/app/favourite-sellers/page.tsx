import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import FavouriteSellerButton from '@/components/FavouriteSellerButton';
import Link from 'next/link';
import { Store } from 'lucide-react';

export default async function FavouriteSellersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch favourite sellers and then their profiles directly
  const { data: favs, error } = await supabase
    .from('favourite_sellers')
    .select('id, seller_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favourite sellers:', error);
  }

  const sellerIds = (favs || []).map((f: any) => f.seller_id);
  let activeSellers: any[] = [];

  if (sellerIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, account_type, created_at')
      .in('id', sellerIds);
    activeSellers = profiles || [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Favourite Sellers</h1>
        <p className="text-gray-500 dark:text-gray-400">Sellers you have saved.</p>
      </div>

      {activeSellers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 text-lg">You haven't saved any sellers yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSellers.map((seller: any) => (
            <div key={seller.id} className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-[#1a1a1a] shadow-sm flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-[#4a3b3b] rounded-full flex items-center justify-center text-2xl font-bold text-gray-700 dark:text-white mb-3">
                {seller.username ? seller.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {seller.username || 'Unknown Seller'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center">
                <Store className="w-4 h-4 mr-1" />
                <span className="capitalize">{seller.account_type || 'Personal'} Account</span>
              </div>
              
              <div className="w-full space-y-2 mt-auto">
                <Link href={`/seller/${seller.id}`} className="block w-full text-center py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-medium rounded-md transition-colors">
                  View Profile
                </Link>
                <FavouriteSellerButton sellerId={seller.id} initialIsFavourite={true} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
