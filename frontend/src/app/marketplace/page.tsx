import React from 'react';
import { Metadata } from 'next';
import { createPublicClient } from '@/utils/supabase/server';
import { getAllRegisteredBusinessPages } from '@/app/actions/businessPages';
import { enrichListingsWithSellers } from '@/utils/sellerMeta';
import MarketplaceClient from './MarketplaceClient';

export const revalidate = 30;

export const metadata: Metadata = {
  title: 'Marketplace Ireland | Buy, Sell, Auctions & Deals',
  description: 'Explore active marketplace listings and live auctions across Ireland. Buy cars, electronics, clothing, collectibles, furniture, and more with secure buyer protection on ListMe.',
  alternates: {
    canonical: '/marketplace',
  },
  openGraph: {
    title: 'Marketplace Ireland | Buy, Sell & Auctions | ListMe',
    description: 'Explore active marketplace listings and live auctions across Ireland with secure buyer protection.',
    url: '/marketplace',
    siteName: 'ListMe Ireland',
    locale: 'en_IE',
    type: 'website',
  },
};

export default async function MarketplacePage({
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
      .limit(120),
  ]);

  const enrichedListings = await enrichListingsWithSellers(listingsResult.data || []);

  return (
    <MarketplaceClient
      initialStores={businessPages}
      initialListings={enrichedListings}
      defaultFormat={defaultFormat}
    />
  );
}
