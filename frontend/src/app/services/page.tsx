import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { getAllRegisteredBusinessPages } from '@/app/actions/businessPages';
import ServicesClient from './ServicesClient';

export const revalidate = 15;

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
