'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleWatchlist(listingId: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    if (currentStatus) {
      // Remove from watchlist
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);
        
      if (error) throw error;
    } else {
      // Add to watchlist
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          listing_id: listingId
        });
        
      if (error) throw error;
    }

    revalidatePath(`/listing/${listingId}`);
    return { success: true };
  } catch (err: any) {
    console.error('Error toggling watchlist:', err);
    return { success: false, error: err.message };
  }
}
