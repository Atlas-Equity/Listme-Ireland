import React from 'react';
import { createPublicClient } from '@/utils/supabase/server';
import { getAllRegisteredBusinessPages } from '@/app/actions/businessPages';
import { enrichListingsWithSellers } from '@/utils/sellerMeta';
import MarketplaceClient from '@/app/marketplace/MarketplaceClient';

export const revalidate = 30;

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const defaultFormat = resolvedParams?.format === 'closing-soon' ? 'Closing Soon' : 'All';

  const supabase = createPublicClient();

  const [businessPages, listingsResult] = await Promise.all([
    getAllRegisteredBusinessPages(),
    supabase
      .from('listings')
      .select('id, title, price, price_type, condition, images, created_at, location, expires_at, ends_at, description, category, seller_id')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(60),
  ]);

  const enrichedListings = await enrichListingsWithSellers(listingsResult.data || []);

  return (
    <div className="w-full bg-[#f8fafc] dark:bg-black min-h-screen">
      <MarketplaceClient
        initialStores={businessPages}
        initialListings={enrichedListings}
        defaultFormat={defaultFormat}
      />
    </div>
  );
}
