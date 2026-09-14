import React from 'react';
import { createClient as createStatelessClient } from '@supabase/supabase-js';
import { getAllRegisteredBusinessPages } from '@/app/actions/businessPages';
import CommunityHubClient from './CommunityHubClient';

import { Metadata } from 'next';

// Cache community page for 60s
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Community Hub & Verified Irish Businesses',
  description: 'ListMe Ireland Community Hub: Discover verified local business storefronts, platform announcements, safety guidelines, and live marketplace stats.',
  alternates: {
    canonical: '/community',
  },
  openGraph: {
    title: 'Community Hub & Irish Businesses | ListMe',
    description: 'Discover verified local business storefronts, platform announcements, and community updates.',
    url: '/community',
    siteName: 'ListMe Ireland',
    locale: 'en_IE',
    type: 'website',
  },
};

const publicSupabase = createStatelessClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function CommunityPage() {
  // Fetch genuine statistics directly from Supabase (NO padding, NO fake numbers) and registered business pages
  const [listingsCountRes, profilesCountRes, businessPages] = await Promise.all([
    publicSupabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    publicSupabase.from('profiles').select('id', { count: 'exact', head: true }),
    getAllRegisteredBusinessPages(),
  ]);

  const activeListingsCount = listingsCountRes.count ?? 0;
  const memberCount = profilesCountRes.count ?? 0;

  return (
    <CommunityHubClient
      activeListingsCount={activeListingsCount}
      memberCount={memberCount}
      businessPages={businessPages}
    />
  );
}
