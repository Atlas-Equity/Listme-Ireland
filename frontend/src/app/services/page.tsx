import React from 'react';
import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { getAllRegisteredBusinessPages } from '@/app/actions/businessPages';
import ServicesClient from './ServicesClient';

export const revalidate = 15;

export const metadata: Metadata = {
  title: 'Local Services, Trades & Freelancers in Ireland',
  description: 'Find trusted local tradesmen, plumbers, electricians, cleaners, tutors, and professional business services across Dublin, Cork, Galway and all Irish counties.',
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'Local Services & Trades in Ireland | ListMe',
    description: 'Find trusted local tradesmen, plumbers, electricians, cleaners, tutors, and professional business services across Ireland.',
    url: '/services',
    siteName: 'ListMe Ireland',
    locale: 'en_IE',
    type: 'website',
  },
};

export default async function ServicesPage() {
  const supabase = await createClient();

  const [businessPages, listingsResult] = await Promise.all([
    getAllRegisteredBusinessPages(),
    supabase
      .from('listings')
      .select('id, title, price, price_type, condition, images, created_at, location, expires_at, ends_at, description, category')
      .eq('status', 'active')
      .or('category.ilike.%service%,category.ilike.%trade%,condition.eq.Service')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  return (
    <ServicesClient
      initialBusinessPages={businessPages}
      initialListings={listingsResult.data || []}
    />
  );
}
