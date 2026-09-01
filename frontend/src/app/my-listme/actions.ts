'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateAccountType(newType: 'personal' | 'business') {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ account_type: newType })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  // Revalidate the profile page so it shows the new data
  revalidatePath('/my-listme');
  return { success: true };
}
