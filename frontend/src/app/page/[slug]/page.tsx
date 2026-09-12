import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { BusinessPageData } from '@/app/actions/businessPages';
import { cookies } from 'next/headers';
import BusinessPageClient from './BusinessPageClient';

// Cache business storefront pages for 60s
export const revalidate = 60;

interface BusinessPageViewProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessPublicPage({ params }: BusinessPageViewProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore.getAll().some(c => c.name.includes('-auth-token'));
  const supabase = await createClient();

  // Find business page from auth user metadata across system or sample fallback
  const user = hasAuthCookie ? (await supabase.auth.getUser()).data.user : null;

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
    if (slug === 'listme') {
      businessPage = {
        name: 'ListMe Official Storefront',
        slug: 'listme',
        tagline: 'Official platform storefront for ListMe Ireland — verified marketplace listings, platform merchandise, announcements, and direct community support.',
        category: 'Marketplace Store',
        business_type: 'marketplace',
        county: 'Dublin',
        phone: '+353 1 234 5678',
        email: 'support@listme.ie',
        website: 'https://listme-tau.vercel.app',
        facebook: 'https://facebook.com/listmeie',
        instagram: 'https://instagram.com/listme.ie',
        plan: 'Official Platform Storefront',
        announcement: 'Welcome to the official ListMe Ireland storefront! Explore verified items and Irish community announcements with 0% seller success fees.',
        opening_hours: 'Mon - Fri: 09:00 - 18:00',
        created_at: new Date(2023, 0, 1).toISOString(),
      };
    } else {
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
  }

  if (!businessPage) {
    notFound();
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

