import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 3600; // Cache and revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://listme.ie';
  const now = new Date();

  // Core Static Routes
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
      url: `${baseUrl}/jobs`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  // Category Pages
  const categories = [
    'marketplace',
    'jobs',
    'services',
    'clothing',
    'mobiles',
    'music',
    'home-garden',
    'baby-kids',
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Dynamic Marketplace Listings
  let listingRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: listings } = await supabase
        .from('listings')
        .select('id, updated_at, created_at')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (listings && listings.length > 0) {
        listingRoutes = listings.map((item) => ({
          url: `${baseUrl}/listing/${item.id}`,
          lastModified: new Date(item.updated_at || item.created_at || now),
          changeFrequency: 'daily',
          priority: 0.7,
        }));
      }
    }
  } catch (error) {
    console.error('Error generating listing sitemap URLs:', error);
  }

  return [...staticRoutes, ...categoryRoutes, ...listingRoutes];
}
