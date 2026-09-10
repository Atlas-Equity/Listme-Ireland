import { createClient } from '@/utils/supabase/server';

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

const JAVA_BACKEND_URL = (process.env.JAVA_BACKEND_URL || 'https://listme-u0k4.onrender.com').replace(/\/$/, '');

// In-memory memory cache with TTL for blazing fast server-side responses
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const memoryCache = new Map<string, CacheEntry<any>>();

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

// Circuit breaker for Java backend: if it fails once, skip for 60s to avoid latency
let javaBackendAvailable = true;
let lastJavaBackendCheck = 0;

function canAttemptJavaBackend(): boolean {
  if (!JAVA_BACKEND_URL) return false;
  if (javaBackendAvailable) return true;
  if (Date.now() - lastJavaBackendCheck > 60000) {
    javaBackendAvailable = true; // Retry after 60s
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

/**
 * High-speed home page listings loader.
 * Serves from in-memory cache in <1ms, or queries Java backend / Supabase.
 */
export async function fetchHomeListings(): Promise<{ latest: ListingCardData[]; auctions: ListingCardData[] }> {
  const cacheKey = 'home_listings';
  const cached = getCached<{ latest: ListingCardData[]; auctions: ListingCardData[] }>(cacheKey);
  if (cached) {
    return cached;
  }

  // 1. Try Java Spring Boot backend if available
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
        const result = {
          latest: (data.latest || []).map(normalizeListing),
          auctions: (data.auctions || []).map(normalizeListing),
        };
        setCached(cacheKey, result, 30);
        return result;
      } else {
        markJavaBackendFailure();
      }
    } catch {
      markJavaBackendFailure();
    }
  }

  // 2. Direct Supabase fallback with lean columns
  const supabase = await createClient();
  const [latestResult, auctionResult] = await Promise.all([
    supabase
      .from('listings')
      .select('id, title, price, price_type, condition, images, created_at, location, expires_at, ends_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('listings')
      .select('id, title, price, price_type, condition, images, created_at, location, expires_at, ends_at')
      .eq('status', 'active')
      .ilike('price_type', 'Auction')
      .order('created_at', { ascending: false })
      .limit(4),
  ]);

  const result = {
    latest: (latestResult.data || []).map(normalizeListing),
    auctions: (auctionResult.data || []).map(normalizeListing),
  };

  setCached(cacheKey, result, 30);
  return result;
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

  const supabase = await createClient();
  const { data } = await supabase
    .from('listings')
    .select('id, title, price, price_type, condition, images, created_at, location, expires_at, ends_at')
    .ilike('category', categoryName)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(30);

  const list = (data || []).map(normalizeListing);
  setCached(cacheKey, list, 60);
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
        next: { revalidate: 15 },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const list = data.map(normalizeListing);
          setCached(cacheKey, list, 15);
          return list;
        }
      } else {
        markJavaBackendFailure();
      }
    } catch {
      markJavaBackendFailure();
    }
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from('listings')
    .select('id, title, price, price_type, condition, images, created_at, location, expires_at, ends_at')
    .eq('status', 'active')
    .or(`title.ilike.%${query}%,category.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(50);

  const list = (data || []).map(normalizeListing);
  setCached(cacheKey, list, 15);
  return list;
}
