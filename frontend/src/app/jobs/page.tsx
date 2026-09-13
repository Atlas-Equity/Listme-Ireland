import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { getAllRegisteredBusinessPages, getCachedJobCandidates } from '@/app/actions/businessPages';
import JobsClient from './JobsClient';

export const revalidate = 30;

export default async function JobsPage() {
  const supabase = await createClient();

  // Fetch registered business pages, candidates, and job listings in parallel
  const [businessPages, candidates, jobListingsResult] = await Promise.all([
    getAllRegisteredBusinessPages(),
    getCachedJobCandidates(),
    supabase
      .from('listings')
      .select('id, title, price, price_type, condition, images, created_at, location, expires_at, ends_at, description, category')
      .eq('status', 'active')
      .or('category.ilike.%job%,category.ilike.%employment%,category.ilike.%work%')
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  return (
    <JobsClient
      initialHiringBusinesses={businessPages}
      initialJobCandidates={candidates}
      initialJobListings={jobListingsResult.data || []}
    />
  );
}

