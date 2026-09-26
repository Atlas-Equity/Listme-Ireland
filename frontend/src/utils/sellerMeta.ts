import { createClient as createStatelessClient } from '@supabase/supabase-js';
import { isAdmin, isSupportOfficer } from './admin';

interface SellerMeta {
  username: string;
  is_verified: boolean;
  account_type: string;
  is_staff: boolean;
}

declare global {
  var __sellerMetaCache: Map<string, { meta: SellerMeta; expiresAt: number }> | undefined;
}

if (!globalThis.__sellerMetaCache) {
  globalThis.__sellerMetaCache = new Map();
}

function getCache() {
  return globalThis.__sellerMetaCache!;
}

let cachedStatelessClient: ReturnType<typeof createStatelessClient> | null = null;
let cachedAdminClient: ReturnType<typeof createStatelessClient> | null = null;

function getStatelessClient() {
  if (!cachedStatelessClient) {
    cachedStatelessClient = createStatelessClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return cachedStatelessClient;
}

function getAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  if (!cachedAdminClient) {
    cachedAdminClient = createStatelessClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return cachedAdminClient;
}

const inFlightLookups = new Map<string, Promise<SellerMeta>>();

export async function getSellerMetaMap(sellerIds: string[]): Promise<Map<string, SellerMeta>> {
  const result = new Map<string, SellerMeta>();
  const missingIds: string[] = [];
  const now = Date.now();
  const cache = getCache();

  for (const id of sellerIds) {
    if (!id) continue;
    const entry = cache.get(id);
    if (entry && now < entry.expiresAt) {
      result.set(id, entry.meta);
    } else {
      missingIds.push(id);
    }
  }

  if (missingIds.length === 0) {
    return result;
  }

  const supabase = getStatelessClient();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, account_type, is_verified, is_staff, role, email')
    .in('id', missingIds);

  const profileMap = new Map<string, any>();
  if (profiles && Array.isArray(profiles)) {
    for (const p of (profiles as any[])) {
      profileMap.set(p.id, p);
    }
  }

  const authLookupIds: string[] = [];

  for (const id of missingIds) {
    const prof = profileMap.get(id);

    if (prof) {
      const isStaff = Boolean(
        prof.is_staff ||
        prof.role === 'admin' ||
        prof.role === 'staff' ||
        prof.role === 'support' ||
        prof.email === 'admin@listme.ie'
      );

      const meta: SellerMeta = {
        username: prof.username || 'Seller',
        is_verified: Boolean(prof.is_verified),
        account_type: prof.account_type || 'personal',
        is_staff: isStaff,
      };

      cache.set(id, { meta, expiresAt: now + 15 * 60 * 1000 });
      result.set(id, meta);
    } else {
      authLookupIds.push(id);
    }
  }

  if (authLookupIds.length > 0) {
    const adminClient = getAdminClient();

    // Parallelize all auth lookups simultaneously with in-flight deduplication
    const authResults = await Promise.allSettled(
      authLookupIds.map(async (id) => {
        if (inFlightLookups.has(id)) {
          return inFlightLookups.get(id)!;
        }

        const lookupPromise = (async () => {
          let authUser: any = null;
          if (adminClient) {
            try {
              const { data: userRes } = await adminClient.auth.admin.getUserById(id);
              authUser = userRes?.user;
            } catch {}
          }

          const rawUsername =
            authUser?.user_metadata?.username ||
            authUser?.user_metadata?.full_name ||
            authUser?.email?.split('@')[0] ||
            'Seller';

          const isVerified = Boolean(
            authUser?.user_metadata?.is_verified ||
            authUser?.user_metadata?.verification_type === 'paid' ||
            authUser?.user_metadata?.verification_type === 'subscription' ||
            authUser?.user_metadata?.verified_account === true
          );

          const accountType = authUser?.user_metadata?.account_type || 'personal';
          const isStaff = Boolean(
            isAdmin(authUser) ||
            isSupportOfficer(authUser) ||
            authUser?.user_metadata?.role === 'staff' ||
            authUser?.user_metadata?.role === 'admin'
          );

          const meta: SellerMeta = {
            username: rawUsername,
            is_verified: isVerified,
            account_type: accountType,
            is_staff: isStaff,
          };

          cache.set(id, { meta, expiresAt: Date.now() + 15 * 60 * 1000 });
          return meta;
        })();

        inFlightLookups.set(id, lookupPromise);
        try {
          return await lookupPromise;
        } finally {
          inFlightLookups.delete(id);
        }
      })
    );

    authLookupIds.forEach((id, idx) => {
      const settled = authResults[idx];
      if (settled.status === 'fulfilled' && settled.value) {
        result.set(id, settled.value);
      } else {
        const fallback: SellerMeta = {
          username: 'Seller',
          is_verified: false,
          account_type: 'personal',
          is_staff: false,
        };
        cache.set(id, { meta: fallback, expiresAt: Date.now() + 15 * 60 * 1000 });
        result.set(id, fallback);
      }
    });
  }

  return result;
}

export async function enrichListingsWithSellers(listings: any[]): Promise<any[]> {
  if (!listings || listings.length === 0) return [];
  const sellerIds = Array.from(new Set(listings.map((l) => l.seller_id).filter(Boolean)));
  const metaMap = await getSellerMetaMap(sellerIds);

  return listings.map((item) => {
    const meta = item.seller_id ? metaMap.get(item.seller_id) : undefined;
    const bizMatch = item.description?.match(/\[Business Page:\s*([a-z0-9-]+)(?:\s*\|\s*([^\]]+))?\]/i);
    const businessSlug = item.business_page_slug || (bizMatch ? bizMatch[1].trim().toLowerCase() : undefined);
    const businessName = bizMatch && bizMatch[2] ? bizMatch[2].trim() : (businessSlug ? businessSlug : undefined);

    return {
      ...item,
      seller_name: businessName || meta?.username || item.seller_name || 'Seller',
      seller_verified: meta ? meta.is_verified : Boolean(item.seller_verified),
      seller_account_type: businessSlug ? 'business' : (meta?.account_type || item.seller_account_type || 'personal'),
      seller_is_staff: meta ? meta.is_staff : Boolean(item.seller_is_staff),
      business_page_slug: businessSlug,
      business_page_name: businessName,
    };
  });
}
