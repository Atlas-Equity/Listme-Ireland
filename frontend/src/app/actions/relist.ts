'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

/**
 * 1-Click Relist action for closed/unsold listings.
 * Extends listing for 7 days, sets status back to 'active', resets created_at.
 */
export async function relistListingAction(listingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to relist an item.' };
  }

  // Fetch listing to verify ownership
  const { data: listing, error: fetchErr } = await supabase
    .from('listings')
    .select('id, seller_id, title')
    .eq('id', listingId)
    .maybeSingle();

  if (fetchErr || !listing) {
    return { error: 'Listing not found.' };
  }

  if (listing.seller_id !== user.id) {
    return { error: 'You are not authorized to relist this listing.' };
  }

  // 7 days extension from right now
  const newClosesAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  const { error: updateErr } = await supabase
    .from('listings')
    .update({
      status: 'active',
      expires_at: newClosesAt,
      ends_at: newClosesAt,
      created_at: now,
    })
    .eq('id', listingId);

  if (updateErr) {
    return { error: updateErr.message };
  }

  revalidatePath('/my-listme');
  revalidatePath(`/listing/${listingId}`);
  revalidatePath('/');
  return { success: true, message: `"${listing.title}" has been relisted for 7 days!` };
}

/**
 * Delete a closed or unwanted listing permanently.
 */
export async function deleteListingAction(listingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to delete this listing.' };
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const db = (serviceKey && supabaseUrl) 
    ? createAdminClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    : supabase;

  const { data: listing, error: fetchErr } = await db
    .from('listings')
    .select('id, seller_id, title')
    .eq('id', listingId)
    .maybeSingle();

  if (fetchErr || !listing) {
    return { error: 'Listing not found.' };
  }

  const isOwner = listing.seller_id === user.id;
  const isAdmin = user.user_metadata?.role === 'admin' || user.email === 'qrmooney@outlook.com';

  if (!isOwner && !isAdmin) {
    return { error: 'You are not authorized to delete this listing.' };
  }

  // 1. Delete associated bids to prevent foreign key constraint violations
  try {
    await db.from('bids').delete().eq('listing_id', listingId);
  } catch (err) {
    console.warn('Could not delete bids for listing:', err);
  }

  // 2. Delete associated watchlist entries if any
  try {
    await db.from('watchlist').delete().eq('listing_id', listingId);
  } catch (err) {
    console.warn('Could not delete watchlist for listing:', err);
  }

  // 3. Delete the listing
  const { error: deleteErr } = await db
    .from('listings')
    .delete()
    .eq('id', listingId);

  if (deleteErr) {
    return { error: deleteErr.message };
  }

  revalidatePath('/my-listme');
  revalidatePath('/');
  revalidatePath('/marketplace');
  revalidatePath('/services');
  return { success: true, message: `Listing "${listing.title}" deleted.` };
}

/**
 * Auto-cleanup: permanently deletes listings that are closed or expired without a relist or reply.
 */
export async function autoCleanupExpiredListings() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  try {
    // Delete any listings where status is explicitly closed or expires_at is past
    const { error } = await supabase
      .from('listings')
      .delete()
      .or(`status.eq.closed,expires_at.lt.${now}`);

    if (error) {
      console.warn('Auto cleanup warning:', error.message);
    }
  } catch (err) {
    console.error('Auto cleanup error:', err);
  }
}

/**
 * Dismiss a notification for a closed listing.
 * When the notification is ignored/dismissed, the closed listing is automatically deleted.
 */
export async function dismissNotificationAction(listingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in.' };
  }

  // Automatically delete the closed listing when notification is dismissed/ignored
  try {
    await supabase
      .from('listings')
      .delete()
      .eq('id', listingId)
      .eq('seller_id', user.id);
  } catch (delErr) {
    console.warn('Auto-delete on notification dismissal note:', delErr);
  }

  const dismissed: string[] = user.user_metadata?.dismissed_notifications || [];
  if (!dismissed.includes(listingId)) {
    dismissed.push(listingId);
    await supabase.auth.updateUser({
      data: { dismissed_notifications: dismissed },
    });
  }

  revalidatePath('/my-listme');
  revalidatePath('/');
  return { success: true };
}

/**
 * Clear all notifications for closed listings.
 * All dismissed closed listings are automatically purged.
 */
export async function clearAllNotificationsAction(listingIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in.' };
  }

  // Purge all closed listings whose notifications were ignored
  try {
    if (listingIds.length > 0) {
      await supabase
        .from('listings')
        .delete()
        .in('id', listingIds)
        .eq('seller_id', user.id);
    }
  } catch (delErr) {
    console.warn('Batch auto-delete closed listings note:', delErr);
  }

  const dismissed: string[] = user.user_metadata?.dismissed_notifications || [];
  const combined = Array.from(new Set([...dismissed, ...listingIds]));
  await supabase.auth.updateUser({
    data: { dismissed_notifications: combined },
  });

  revalidatePath('/my-listme');
  revalidatePath('/');
  return { success: true };
}

