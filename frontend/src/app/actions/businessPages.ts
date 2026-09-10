'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface BusinessPageData {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  category: string;
  county: string;
  phone: string;
  email: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  avatarUrl?: string;
  coverUrl?: string;
  plan?: string;
  created_at?: string;
  owner_id?: string;
}

/**
 * Creates or updates a subsidiary business page under the user's account.
 */
export async function createOrUpdateBusinessPage(data: BusinessPageData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to create a Business Page.' };
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

  const existingPages: BusinessPageData[] = user.user_metadata?.business_pages || [];

  const newPage: BusinessPageData = {
    id: data.id || `biz_${Date.now()}`,
    name: data.name.trim(),
    slug: cleanSlug,
    tagline: data.tagline.trim(),
    category: data.category || 'Services & Trades',
    county: data.county || 'Dublin',
    phone: data.phone.trim(),
    email: data.email.trim(),
    website: data.website?.trim() || '',
    facebook: data.facebook?.trim() || '',
    instagram: data.instagram?.trim() || '',
    linkedin: data.linkedin?.trim() || '',
    avatarUrl: data.avatarUrl || user.user_metadata?.avatar_url || '',
    coverUrl: data.coverUrl || '',
    plan: 'Verified Pro Page',
    created_at: data.created_at || new Date().toISOString(),
    owner_id: user.id,
  };

  // Replace or append
  const pageIndex = existingPages.findIndex(p => p.id === newPage.id || p.slug === newPage.slug);
  let updatedPages: BusinessPageData[];
  if (pageIndex >= 0) {
    updatedPages = [...existingPages];
    updatedPages[pageIndex] = newPage;
  } else {
    updatedPages = [...existingPages, newPage];
  }

  // Update user metadata in Supabase Auth
  const { error: updateErr } = await supabase.auth.updateUser({
    data: {
      business_pages: updatedPages,
    }
  });

  if (updateErr) {
    return { error: updateErr.message };
  }

  revalidatePath('/my-listme');
  revalidatePath(`/page/${cleanSlug}`);
  return { success: true, slug: cleanSlug, page: newPage };
}
