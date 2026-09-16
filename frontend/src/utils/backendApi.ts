import '@/utils/dnsOptimizer';
import { createClient as createStatelessClient } from '@supabase/supabase-js';

export interface ListingCardData {
  id: string;
  title: string;
  price: number;
  price_type: string;
  condition?: string;
  images?: string[];
  created_at?: string;
  location?: string;
  expires_at?: string;
  ends_at?: string;
}

const publicSupabase = createStatelessClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const JAVA_BACKEND_URL = (process.env.JAVA_BACKEND_URL || 'https://listme-u0k4.onrender.com').replace(/\/$/, '');

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const globalForCache = globalThis as unknown as {
  listmeMemoryCache?: Map<string, CacheEntry<any>>;
};

const memoryCache = globalForCache.listmeMemoryCache ?? new Map<string, CacheEntry<any>>();
if (!globalForCache.listmeMemoryCache) {
  globalForCache.listmeMemoryCache = memoryCache;
}

function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached<T>(key: string, data: T, ttlSeconds: number): void {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

let javaBackendAvailable = true;
let lastJavaBackendCheck = 0;

function canAttemptJavaBackend(): boolean {
  if (process.env.ENABLE_JAVA_BACKEND !== 'true') return false;
  if (!JAVA_BACKEND_URL) return false;
  if (javaBackendAvailable) return true;
  if (Date.now() - lastJavaBackendCheck > 60000) {
    javaBackendAvailable = true;
    return true;
  }
  return false;
}

function markJavaBackendFailure(): void {
  javaBackendAvailable = false;
  lastJavaBackendCheck = Date.now();
}

function normalizeListing(item: any): ListingCardData {
  return {
    id: item.id,
    title: item.title,
    price: Number(item.price),
    price_type: item.price_type || item.priceType || 'Buy Now',
    condition: item.condition,
    images: Array.isArray(item.images) ? item.images : [],
    created_at: item.created_at || item.createdAt,
    location: item.location,
    expires_at: item.expires_at || item.expiresAt,
    ends_at: item.ends_at || item.endsAt,
  };
}

export async function fetchHomeListings(): Promise<{ latest: ListingCardData[]; auctions: ListingCardData[]; closingSoon: ListingCardData[] }> {
  const cacheKey = 'home_listings';
  const cached = getCached<{ latest: ListingCardData[]; auctions: ListingCardData[]; closingSoon: ListingCardData[] }>(cacheKey);
  if (cached) {
    return cached;
  }

  if (canAttemptJavaBackend()) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300);
      const res = await fetch(`${JAVA_BACKEND_URL}/api/public/listings/home`, {
        next: { revalidate: 30, tags: ['home-listings'] },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const all = (data.all || data.latest || []).map(normalizeListing);
        const nowMs = Date.now();
        const closingSoon = all.filter((l: ListingCardData) => {
          const end = l.expires_at || l.ends_at;
          if (!end) return false;
          const diff = new Date(end).getTime() - nowMs;
          return diff > 0 && diff <= 24 * 60 * 60 * 1000;
        });
        const result = {
          latest: (data.latest || []).map(normalizeListing),
          auctions: (data.auctions || []).map(normalizeListing),
          closingSoon,
        };
        setCached(cacheKey, result, 60);
        return result;
      } else {
        markJavaBackendFailure();
      }
    } catch {
      markJavaBackendFailure();
    }
  }

  // 2. Direct Supabase query: fetch top 30 active listings in a single round-trip
  const { data: listingsData } = await publicSupabase
    .from('listings')
    .select('id, title, price, price_type, condition, images, created_at, location, expires_at, ends_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(30);

  const allListings = (listingsData || []).map(normalizeListing);

  const auctions = allListings
    .filter(l => l.price_type?.toLowerCase() === 'auction')
    .slice(0, 4);

  const latest = allListings.slice(0, 4);

  const nowMs = Date.now();
  const closingSoon = allListings.filter(l => {
    const end = l.expires_at || l.ends_at;
    if (!end) return false;
    const diff = new Date(end).getTime() - nowMs;
    return diff > 0 && diff <= 24 * 60 * 60 * 1000;
  });

  const result = {
    latest,
    auctions,
    closingSoon,
  };

  setCached(cacheKey, result, 60);
  return result;
}

export function invalidateHomeListingsCache(): void {
  memoryCache.delete('home_listings');
}

/**
 * Fetch category listings with memory caching.
 */
export async function fetchCategoryListings(categoryName: string): Promise<ListingCardData[]> {
  const cacheKey = `cat_${categoryName.toLowerCase()}`;
  const cached = getCached<ListingCardData[]>(cacheKey);
  if (cached) {
    return cached;
  }

  if (canAttemptJavaBackend()) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300);
      const res = await fetch(`${JAVA_BACKEND_URL}/api/public/listings?category=${encodeURIComponent(categoryName)}&limit=30`, {
        next: { revalidate: 60, tags: [`category-${categoryName}`] },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const list = data.map(normalizeListing);
          setCached(cacheKey, list, 60);
          return list;
        }
      } else {
        markJavaBackendFailure();
      }
    } catch {
      markJavaBackendFailure();
    }
  }

  const { data } = await publicSupabase
    .from('listings')
    .select('id, title, price, price_type, condition, images, created_at, location, expires_at, ends_at')
    .ilike('category', categoryName)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(30);

  const list = (data || []).map(normalizeListing);
  setCached(cacheKey, list, 120);
  return list;
}

/**
 * Search active listings with lean fields and memory caching.
 */
export async function searchListings(query: string): Promise<ListingCardData[]> {
  if (!query || !query.trim()) return [];

  const cacheKey = `search_${query.trim().toLowerCase()}`;
  const cached = getCached<ListingCardData[]>(cacheKey);
  if (cached) {
    return cached;
  }

  if (canAttemptJavaBackend()) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300);
      const res = await fetch(`${JAVA_BACKEND_URL}/api/public/listings?q=${encodeURIComponent(query)}&limit=50`, {
        next: { revalidate: 30 },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const list = data.map(normalizeListing);
          setCached(cacheKey, list, 30);
          return list;
        }
      } else {
        markJavaBackendFailure();
      }
    } catch {
      markJavaBackendFailure();
    }
  }

  const { data } = await publicSupabase
    .from('listings')
    .select('id, title, price, price_type, condition, images, created_at, location, expires_at, ends_at')
    .eq('status', 'active')
    .or(`title.ilike.%${query}%,category.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(50);

  const list = (data || []).map(normalizeListing);
  setCached(cacheKey, list, 30);
  return list;
}
