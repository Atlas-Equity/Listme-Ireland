import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.listme.ie';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },

    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/buyer-protection`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/safety`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/scam-prevention`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/fees`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/forbidden-items`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Category Pages
  const categories = [
    'marketplace',
    'motors',
    'jobs',
    'services',
    'electronics',
    'clothing',
    'mobiles',
    'music',
    'home-garden',
    'baby-kids',
    'property',
    'sports-leisure',
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Dynamic Marketplace Listings & Business Pages
  let listingRoutes: MetadataRoute.Sitemap = [];
  let businessRoutes: MetadataRoute.Sitemap = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // 1. Listings
      const { data: listings } = await supabase
        .from('listings')
        .select('id, updated_at, created_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(2000);

      if (listings && listings.length > 0) {
        listingRoutes = listings.map((item) => ({
          url: `${baseUrl}/listing/${item.id}`,
          lastModified: new Date(item.updated_at || item.created_at || now),
          changeFrequency: 'daily',
          priority: 0.7,
        }));
      }

      // 2. Business Pages
      const { data: pages } = await supabase
        .from('business_pages')
        .select('slug, updated_at, created_at')
        .limit(500);

      if (pages && pages.length > 0) {
        businessRoutes = pages.map((page) => ({
          url: `${baseUrl}/page/${page.slug}`,
          lastModified: new Date(page.updated_at || page.created_at || now),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
      }
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap URLs:', error);
  }

  return [...staticRoutes, ...categoryRoutes, ...businessRoutes, ...listingRoutes];
}
