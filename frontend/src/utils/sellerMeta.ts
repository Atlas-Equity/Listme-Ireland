import { createClient as createStatelessClient } from '@supabase/supabase-js';
import { isAdmin, isSupportOfficer } from './admin';

interface SellerMeta {
  username: string;
  is_verified: boolean;
  account_type: string;
  is_staff: boolean;
}

const cache = new Map<string, { meta: SellerMeta; expiresAt: number }>();
let cachedAuthUsers: any[] | null = null;
let cachedAuthUsersExpiresAt = 0;

function getStatelessClient() {
  return createStatelessClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createStatelessClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function getAuthUsersList(): Promise<any[]> {
  const now = Date.now();
  if (cachedAuthUsers && now < cachedAuthUsersExpiresAt) {
    return cachedAuthUsers;
  }
  const admin = getAdminClient();
  if (!admin) return [];
  try {
    const { data } = await admin.auth.admin.listUsers();
    cachedAuthUsers = data?.users || [];
    cachedAuthUsersExpiresAt = now + 60 * 1000;
    return cachedAuthUsers;
  } catch {
    return [];
  }
}

export async function getSellerMetaMap(sellerIds: string[]): Promise<Map<string, SellerMeta>> {
  const result = new Map<string, SellerMeta>();
  const missingIds: string[] = [];
  const now = Date.now();

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
  const authUsers = await getAuthUsersList();
  const authUserMap = new Map<string, any>();
  for (const u of authUsers) {
    authUserMap.set(u.id, u);
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, account_type')
    .in('id', missingIds);

  const profileMap = new Map<string, any>();
  if (profiles) {
    for (const p of profiles) {
      profileMap.set(p.id, p);
    }
  }

  for (const id of missingIds) {
    const prof = profileMap.get(id);
    const authUser = authUserMap.get(id);

    const rawUsername = prof?.username || authUser?.user_metadata?.username || authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'Seller';
    const isVerified = Boolean(
      authUser?.user_metadata?.is_verified ||
      authUser?.user_metadata?.verification_type === 'paid' ||
      authUser?.user_metadata?.verified_account === true
    );
    const accountType = prof?.account_type || authUser?.user_metadata?.account_type || 'personal';
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

    cache.set(id, { meta, expiresAt: now + 5 * 60 * 1000 });
    result.set(id, meta);
  }

  return result;
}

export async function enrichListingsWithSellers(listings: any[]): Promise<any[]> {
  if (!listings || listings.length === 0) return [];
  const sellerIds = Array.from(new Set(listings.map(l => l.seller_id).filter(Boolean)));
  const metaMap = await getSellerMetaMap(sellerIds);

  return listings.map(item => {
    const meta = item.seller_id ? metaMap.get(item.seller_id) : undefined;
    return {
      ...item,
      seller_name: meta?.username || item.seller_name || 'Seller',
      seller_verified: meta ? meta.is_verified : Boolean(item.seller_verified),
      seller_account_type: meta?.account_type || item.seller_account_type || 'personal',
      seller_is_staff: meta ? meta.is_staff : Boolean(item.seller_is_staff),
    };
  });
}
