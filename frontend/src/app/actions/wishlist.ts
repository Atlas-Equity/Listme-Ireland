'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Returns array of listing IDs currently in the user's watchlist.
 */
export async function getWatchlistIdsAction(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select('listing_id')
      .eq('user_id', user.id);

    if (error) {
      console.warn('Error fetching watchlist IDs:', error.message);
      return [];
    }

    return (data || []).map((row: any) => row.listing_id);
  } catch {
    return [];
  }
}

/**
 * Toggles a listing in/out of the user's watchlist idempotently.
 */
export async function toggleWatchlist(listingId: string, forceTargetStatus?: boolean) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Check if currently watchlisted
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .maybeSingle();

    const currentlyInWatchlist = !!existing;
    const shouldBeWatchlisted =
      forceTargetStatus !== undefined ? forceTargetStatus : !currentlyInWatchlist;

    if (shouldBeWatchlisted) {
      if (!existing) {
        const { error: insertErr } = await supabase
          .from('wishlists')
          .insert({
            user_id: user.id,
            listing_id: listingId,
          });

        if (insertErr && !insertErr.message.includes('duplicate')) {
          throw insertErr;
        }
      }
    } else {
      if (existing) {
        const { error: deleteErr } = await supabase
          .from('wishlists')
          .delete()
          .eq('id', existing.id);

        if (deleteErr) throw deleteErr;
      }
    }

    revalidatePath('/');
    revalidatePath('/my-listme');
    revalidatePath(`/listing/${listingId}`);
    return { success: true, isWatchlisted: shouldBeWatchlisted };
  } catch (err: any) {
    console.error('Error toggling watchlist:', err);
    return { success: false, error: err.message || 'Failed to update watchlist' };
  }
}

