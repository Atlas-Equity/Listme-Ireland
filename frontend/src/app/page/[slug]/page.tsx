import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { BusinessPageData, getAllRegisteredBusinessPages } from '@/app/actions/businessPages';

import { cookies } from 'next/headers';
import BusinessPageClient from './BusinessPageClient';
import { isAdmin } from '@/utils/admin';

// Cache business storefront pages for 60s
export const revalidate = 60;

interface BusinessPageViewProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessPublicPage({ params }: BusinessPageViewProps) {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase().trim();

  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore.getAll().some(c => c.name.includes('-auth-token'));
  const supabase = await createClient();

  const user = hasAuthCookie ? (await supabase.auth.getUser()).data.user : null;
  const userIsAdmin = isAdmin(user);

  let businessPage: BusinessPageData | null = null;
  let sellerId: string | null = null;
  let isOwner = false;

  // 1. Official Platform Storefront for ListMe
  if (cleanSlug === 'listme') {
    businessPage = {
      name: 'ListMe',
      slug: 'listme',
      tagline: 'Official platform storefront for ListMe Ireland — verified marketplace listings, announcements, safety guidelines, and direct community support.',
      category: 'Official Platform',
      business_type: 'marketplace',
      county: 'Dublin',
      phone: '', // Phone removed as requested
      email: 'support@listme.ie',
      website: 'https://listme.ie',
      facebook: 'https://www.facebook.com/profile.php?id=61594336620072',
      plan: 'Official Platform Storefront',
      announcement: 'Welcome to ListMe Ireland! Ireland’s next-generation platform for items, jobs, and services across all 26 counties.',
      opening_hours: 'Mon - Sun: 24/7 Platform Access',
      created_at: new Date(2023, 0, 1).toISOString(),
      avatarUrl: '/ListMeBanner.png',
      coverUrl: '/ListMeBanner.png',
    };

    if (userIsAdmin) {
      isOwner = true;
    }
  } else {
    // 2. Search for REAL business pages created by actual registered users

    // Step A: Check current user's business pages
    if (user?.user_metadata?.business_pages) {
      const found = (user.user_metadata.business_pages as BusinessPageData[]).find(
        (p) => p.slug === cleanSlug || p.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === cleanSlug
      );
      if (found) {
        businessPage = found;
        sellerId = user.id;
        isOwner = true;
      }
    }

    // Step B: If not current user, search across all registered business pages (served instantly from cache)
    if (!businessPage) {
      const allPages = await getAllRegisteredBusinessPages();
      const matched = allPages.find(
        (p: BusinessPageData) => p.slug === cleanSlug || p.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === cleanSlug
      );
      if (matched) {
        businessPage = matched;
        sellerId = matched.owner_id || null;
        isOwner = Boolean(user && user.id === matched.owner_id);
      }
    }
  }

  // If no REAL business page exists in the database, return 404 NOT FOUND.
  // STRICT RULE: NEVER generate fake, simulated, or placeholder pages!
  if (!businessPage) {
    notFound();
  }

  // Fetch listings ONLY for this specific actual seller
  let pageListings: any[] = [];
  if (cleanSlug === 'listme') {
    // Official ListMe storefront has listings removed as requested
    pageListings = [];
  } else if (sellerId) {
    const nowIso = new Date().toISOString();
    const { data } = await supabase
      .from('listings')
      .select('id, title, description, price, price_type, condition, images, created_at, location, expires_at, ends_at')
      .eq('seller_id', sellerId)
      .eq('status', 'active')
      .gt('expires_at', nowIso)
      .limit(50);
    pageListings = (data || []).filter(l => 
      l.description?.includes(`[Business Page: ${cleanSlug}`) || 
      !l.description?.includes('[Business Page:')
    );
  }

  return (
    <BusinessPageClient 
      businessPage={businessPage} 
      listings={pageListings} 
      isOwner={isOwner}
      isAdmin={userIsAdmin}
    />
  );
}
