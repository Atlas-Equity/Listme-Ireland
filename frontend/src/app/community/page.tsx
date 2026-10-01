import React from 'react';
import { createClient as createStatelessClient } from '@supabase/supabase-js';
import CommunityHubClient from './CommunityHubClient';

import { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Community Hub | Platform Updates & Community',
  description: 'ListMe Ireland Community Hub: Discover platform announcements, safety guidelines, and live marketplace stats.',
  alternates: {
    canonical: '/community',
  },
  openGraph: {
    title: 'Community Hub | ListMe',
    description: 'Discover platform announcements, safety guidelines, and live marketplace stats.',
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
  const [listingsCountRes, profilesCountRes] = await Promise.all([
    publicSupabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    publicSupabase.from('profiles').select('id', { count: 'exact', head: true }),
  ]);

  const activeListingsCount = listingsCountRes.count ?? 0;
  const memberCount = profilesCountRes.count ?? 0;

  return (
    <CommunityHubClient
      activeListingsCount={activeListingsCount}
      memberCount={memberCount}
    />
  );
}
