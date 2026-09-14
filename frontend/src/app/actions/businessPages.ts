'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export interface BusinessPageData {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  business_type?: 'service' | 'marketplace';
  opening_hours?: string;
  announcement?: string;
  category: string;
  county: string;
  phone: string;
  email: string;
  website?: string;
  facebook?: string;
  linkedin?: string;
  avatarUrl?: string;
  coverUrl?: string;
  plan?: string;
  created_at?: string;
  owner_id?: string;
  is_hiring?: boolean;
}

const OFFICIAL_FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61594336620072';

/**
 * Creates or updates a subsidiary business page under the user's account.
 */
export async function createOrUpdateBusinessPage(data: BusinessPageData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to create or update a Business Page.' };
  }

  const cleanSlug = (data.slug || data.name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!cleanSlug) {
    return { error: 'Please enter a valid page name or handle slug.' };
  }

  // Format phone to Irish standard (optional for official ListMe page)
  let formattedPhone = (data.phone || '').trim();
  const isOfficial = cleanSlug === 'listme';
  if (isOfficial && (!formattedPhone || formattedPhone === '+353' || formattedPhone === '+353 ')) {
    formattedPhone = '';
  } else if (formattedPhone && !formattedPhone.startsWith('+353')) {
    formattedPhone = `+353 ${formattedPhone.replace(/^\+?353\s?|^0/, '')}`.trim();
  }

  // Truncate announcement to 250 characters max
  const cleanAnnouncement = (data.announcement || '').trim().slice(0, 250);

  // Fetch freshest user metadata via admin client if available
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let currentUserMeta = user.user_metadata || {};
  let adminClient: any = null;

  if (serviceKey && supabaseUrl) {
    adminClient = createAdminClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    try {
      const { data: adminUser } = await adminClient.auth.admin.getUserById(user.id);
      if (adminUser?.user?.user_metadata) {
        currentUserMeta = adminUser.user.user_metadata;
      }
    } catch (err) {
      console.warn('Could not fetch freshest user metadata from adminClient:', err);
    }
  }

  const existingPages: BusinessPageData[] = currentUserMeta?.business_pages || [];

  const newPage: BusinessPageData = {
    id: data.id || `biz_${Date.now()}`,
    name: data.name.trim(),
    slug: cleanSlug,
    tagline: data.tagline.trim(),
    business_type: data.business_type || 'service',
    opening_hours: data.opening_hours?.trim() || 'Open 24 Hours / 7 Days',
    announcement: cleanAnnouncement,
    category: data.category || (data.business_type === 'marketplace' ? 'Retail & Local Storefront' : 'Services & Trades'),
    county: data.county || 'Dublin',
    phone: formattedPhone,
    email: data.email.trim(),
    website: data.website?.trim() || '',
    facebook: data.facebook?.trim() || OFFICIAL_FACEBOOK_URL,
    linkedin: data.linkedin?.trim() || '',
    avatarUrl: data.avatarUrl?.trim() || currentUserMeta?.avatar_url || '',
    coverUrl: data.coverUrl || '',
    plan: 'Verified Pro Page',
    created_at: data.created_at || new Date().toISOString(),
    owner_id: user.id,
    is_hiring: Boolean(data.is_hiring),
  };

  // Match by id OR slug
  const pageIndex = existingPages.findIndex(
    p => (data.id && p.id === data.id) || (data.slug && p.slug === data.slug) || p.slug === cleanSlug
  );

  let updatedPages: BusinessPageData[];
  if (pageIndex >= 0) {
    updatedPages = [...existingPages];
    updatedPages[pageIndex] = { ...existingPages[pageIndex], ...newPage };
  } else {
    updatedPages = [...existingPages, newPage];
  }

  // Update user metadata via Admin API for 100% reliable persistence
  if (adminClient) {
    try {
      await adminClient.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...currentUserMeta,
          business_pages: updatedPages,
        },
      });
    } catch (adminErr) {
      console.error('Error updating business page via adminClient:', adminErr);
    }
  }

  // Also update session cookie client
  const { error: updateErr } = await supabase.auth.updateUser({
    data: {
      business_pages: updatedPages,
    }
  });

  if (updateErr && !adminClient) {
    return { error: updateErr.message };
  }

  invalidateBusinessPagesCache();
  revalidatePath('/my-listme');
  revalidatePath(`/page/${cleanSlug}`);
  revalidatePath('/services');
  revalidatePath('/marketplace');
  revalidatePath('/jobs');
  return { success: true, slug: cleanSlug, page: newPage };
}

/**
 * Deletes a business page owned by the current user.
 */
export async function deleteBusinessPage(slugOrId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to delete a Business Page.' };
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let currentUserMeta = user.user_metadata || {};
  let adminClient: any = null;

  if (serviceKey && supabaseUrl) {
    adminClient = createAdminClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    try {
      const { data: adminUser } = await adminClient.auth.admin.getUserById(user.id);
      if (adminUser?.user?.user_metadata) {
        currentUserMeta = adminUser.user.user_metadata;
      }
    } catch (err) {}
  }

  const existingPages: BusinessPageData[] = currentUserMeta?.business_pages || [];
  const targetPage = existingPages.find(p => p.id === slugOrId || p.slug === slugOrId);

  if (!targetPage) {
    return { error: 'Business Page not found.' };
  }

  const updatedPages = existingPages.filter(p => p.id !== slugOrId && p.slug !== slugOrId);

  if (adminClient) {
    try {
      await adminClient.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...currentUserMeta,
          business_pages: updatedPages,
        },
      });
    } catch (err) {}
  }

  await supabase.auth.updateUser({
    data: {
      business_pages: updatedPages,
    }
  });

  invalidateBusinessPagesCache();
  revalidatePath('/my-listme');
  revalidatePath(`/page/${targetPage.slug}`);
  revalidatePath('/services');
  revalidatePath('/marketplace');
  revalidatePath('/jobs');
  return { success: true };
}

// In-memory cache on globalThis with 60-second TTL
declare global {
  var __businessPagesCache: { pages: BusinessPageData[]; expiresAt: number } | undefined;
  var __jobCandidatesCache: { candidates: any[]; expiresAt: number } | undefined;
}

export function invalidateBusinessPagesCache(): void {
  globalThis.__businessPagesCache = undefined;
  globalThis.__jobCandidatesCache = undefined;
}

/**
 * Returns all real registered business pages across all users (cached for 60s).
 */
export async function getAllRegisteredBusinessPages(): Promise<BusinessPageData[]> {
  const cached = globalThis.__businessPagesCache;
  if (cached && Date.now() < cached.expiresAt) {
    return cached.pages;
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !url) return [];

  try {
    const adminClient = createAdminClient(url, serviceKey, {
      auth: { persistSession: false },
    });
    const { data: usersData, error } = await adminClient.auth.admin.listUsers({ perPage: 100 });
    if (error || !usersData?.users) return cached?.pages || [];

    const allPages: BusinessPageData[] = [];
    const seenSlugs = new Set<string>();

    for (const u of usersData.users) {
      const pages = u.user_metadata?.business_pages as BusinessPageData[];
      if (Array.isArray(pages)) {
        for (const p of pages) {
          if (p && p.slug && !seenSlugs.has(p.slug)) {
            seenSlugs.add(p.slug);
            allPages.push({
              ...p,
              owner_id: u.id,
            });
          }
        }
      }
    }

    // Populate candidates cache from the same user list to save an extra roundtrip
    const candidates = usersData.users
      .filter((u) => u.user_metadata?.bio || u.user_metadata?.skills || u.user_metadata?.looking_for_work)
      .map((u) => {
        let hash = 0;
        const uid = u.id || '';
        for (let i = 0; i < uid.length; i++) {
          hash = (hash << 5) - hash + uid.charCodeAt(i);
          hash |= 0;
        }
        const memberNumber = 6000000 + Math.abs(hash % 3999999);
        return {
          id: u.id,
          name: u.user_metadata?.full_name || u.user_metadata?.username || u.email?.split('@')[0] || 'Member',
          memberNumber,
          bio: u.user_metadata?.bio || 'Verified member open to opportunities.',
          skills: u.user_metadata?.skills || '',
          location: u.user_metadata?.location || 'Ireland',
          avatarUrl: u.user_metadata?.avatar_url || '',
          contactEmail: u.email,
        };
      });

    globalThis.__businessPagesCache = {
      pages: allPages,
      expiresAt: Date.now() + 60 * 1000,
    };

    globalThis.__jobCandidatesCache = {
      candidates,
      expiresAt: Date.now() + 60 * 1000,
    };

    return allPages;
  } catch (err) {
    console.error('Error fetching registered business pages:', err);
    return cached?.pages || [];
  }
}

/**
 * Returns cached job candidates (extracted during business pages fetch).
 */
export async function getCachedJobCandidates(): Promise<any[]> {
  if (globalThis.__jobCandidatesCache && Date.now() < globalThis.__jobCandidatesCache.expiresAt) {
    return globalThis.__jobCandidatesCache.candidates;
  }
  // Refresh by calling getAllRegisteredBusinessPages
  await getAllRegisteredBusinessPages();
  return globalThis.__jobCandidatesCache?.candidates || [];
}


