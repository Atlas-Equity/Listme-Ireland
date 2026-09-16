'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitReview(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  const listingId = formData.get('listingId') as string;
  const revieweeId = formData.get('revieweeId') as string;
  const rating = parseInt(formData.get('rating') as string);
  const comment = formData.get('comment') as string;

  if (!listingId || !revieweeId || !rating || rating < 1 || rating > 5) {
    return { success: false, error: 'Invalid review data' };
  }

  try {
    const { error } = await supabase
      .from('reviews')
      .insert({
        listing_id: listingId,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        rating,
        comment
      });

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'You have already reviewed this transaction.' };
      }
      throw error;
    }

    revalidatePath(`/listing/${listingId}`);
    return { success: true };
  } catch (err: any) {
    console.error('Error submitting review:', err);
    return { success: false, error: err.message };
  }
}
