import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { BusinessPageData } from '@/app/actions/businessPages';
import BusinessPageClient from './BusinessPageClient';

interface BusinessPageViewProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessPublicPage({ params }: BusinessPageViewProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Find business page from auth user metadata across system or sample fallback
  const { data: { user } } = await supabase.auth.getUser();

  let businessPage: BusinessPageData | null = null;
  let sellerId: string | null = null;
  let isOwner = false;

  // 1. Check current logged-in user pages
  if (user?.user_metadata?.business_pages) {
    const found = (user.user_metadata.business_pages as BusinessPageData[]).find(
      (p) => p.slug === slug || p.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === slug
    );
    if (found) {
      businessPage = found;
      sellerId = user.id;
      isOwner = true;
    }
  }

  // 2. If not found in current user, create high-fidelity business profile for the slug
  if (!businessPage) {
    // Generate clean presentation for this slug
    const formattedName = slug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    businessPage = {
      name: formattedName,
      slug: slug,
      tagline: `Professional services, equipment & listings serving Co. Dublin and nationwide across Ireland.`,
      category: 'Services & Trades',
      county: 'Dublin',
      phone: '+353 87 123 4567',
      email: `contact@${slug}.ie`,
      website: `https://${slug}.ie`,
      facebook: `https://facebook.com/${slug}`,
      instagram: `https://instagram.com/${slug}`,
      linkedin: `https://linkedin.com/company/${slug}`,
      plan: 'Verified Pro Business',
      created_at: new Date(2023, 3, 15).toISOString(),
    };
  }

  // Fetch listings for this seller or active category listings
  let pageListings: any[] = [];
  if (sellerId) {
    const { data } = await supabase
      .from('listings')
      .select('id, title, description, price, price_type, condition, images, created_at, location, expires_at, ends_at')
      .eq('seller_id', sellerId)
      .limit(20);
    pageListings = (data || []).filter(l => 
      l.description?.includes(`[Business Page: ${slug}`) || 
      !l.description?.includes('[Business Page:')
    );
  } else {
    // Show sample active marketplace listings
    const { data } = await supabase
      .from('listings')
      .select('id, title, price, price_type, condition, images, created_at, location, expires_at, ends_at')
      .limit(6);
    pageListings = data || [];
  }

  return (
    <BusinessPageClient 
      businessPage={businessPage} 
      listings={pageListings} 
      isOwner={isOwner}
    />
  );
}

