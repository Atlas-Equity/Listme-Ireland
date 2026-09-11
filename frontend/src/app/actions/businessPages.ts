'use server';

import { createClient } from '@/utils/supabase/server';
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

  // Format phone to Irish standard
  let formattedPhone = data.phone.trim();
  if (!formattedPhone.startsWith('+353')) {
    formattedPhone = `+353 ${formattedPhone.replace(/^\+?353\s?|^0/, '')}`.trim();
  }

  // Truncate announcement to 250 characters max
  const cleanAnnouncement = (data.announcement || '').trim().slice(0, 250);

  const existingPages: BusinessPageData[] = user.user_metadata?.business_pages || [];

  const newPage: BusinessPageData = {
    id: data.id || `biz_${Date.now()}`,
    name: data.name.trim(),
    slug: cleanSlug,
    tagline: data.tagline.trim(),
    business_type: data.business_type || 'service',
    opening_hours: data.opening_hours?.trim() || 'Mon - Fri: 9:00 AM - 6:00 PM',
    announcement: cleanAnnouncement,
    category: data.category || (data.business_type === 'marketplace' ? 'Retail & Local Storefront' : 'Services & Trades'),
    county: data.county || 'Dublin',
    phone: formattedPhone,
    email: data.email.trim(),
    website: data.website?.trim() || '',
    facebook: data.facebook?.trim() || '',
    instagram: data.instagram?.trim() || '',
    linkedin: data.linkedin?.trim() || '',
    avatarUrl: data.avatarUrl?.trim() || user.user_metadata?.avatar_url || '',
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

/**
 * Deletes a business page owned by the current user.
 */
export async function deleteBusinessPage(slugOrId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to delete a Business Page.' };
  }

  const existingPages: BusinessPageData[] = user.user_metadata?.business_pages || [];
  const targetPage = existingPages.find(p => p.id === slugOrId || p.slug === slugOrId);

  if (!targetPage) {
    return { error: 'Business Page not found.' };
  }

  const updatedPages = existingPages.filter(p => p.id !== slugOrId && p.slug !== slugOrId);

  const { error: updateErr } = await supabase.auth.updateUser({
    data: {
      business_pages: updatedPages,
    }
  });

  if (updateErr) {
    return { error: updateErr.message };
  }

  revalidatePath('/my-listme');
  revalidatePath(`/page/${targetPage.slug}`);
  return { success: true };
}

