'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleFavouriteSeller(sellerId: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  try {
    if (currentStatus) {
      const { error } = await supabase
        .from('favourite_sellers')
        .delete()
        .eq('user_id', user.id)
        .eq('seller_id', sellerId);
        
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('favourite_sellers')
        .insert([
          { user_id: user.id, seller_id: sellerId }
        ]);
        
      if (error) throw error;
    }

    revalidatePath('/listing/[id]', 'page');
    revalidatePath('/my-listme');
    return { success: true };
  } catch (err: any) {
    console.error('Error toggling favourite seller:', err);
    return { error: err.message || 'Failed to update favourite sellers' };
  }
}
