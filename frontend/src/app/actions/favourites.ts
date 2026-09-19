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

export async function toggleFavouriteBusiness(businessSlug: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  try {
    const existingList: string[] = user.user_metadata?.favourite_businesses || [];
    let updatedList: string[];
    if (currentStatus) {
      updatedList = existingList.filter((s: string) => s !== businessSlug);
    } else {
      updatedList = Array.from(new Set([...existingList, businessSlug]));
    }

    await supabase.auth.updateUser({
      data: {
        favourite_businesses: updatedList,
      },
    });

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (serviceKey && supabaseUrl) {
      try {
        const { createClient: createAdminClient } = await import('@supabase/supabase-js');
        const adminClient = createAdminClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
        await adminClient.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...(user.user_metadata || {}),
            favourite_businesses: updatedList,
          },
        });
        if (currentStatus) {
          await adminClient.from('favourite_businesses').delete().eq('user_id', user.id).eq('business_slug', businessSlug);
        } else {
          await adminClient.from('favourite_businesses').insert([{ user_id: user.id, business_slug: businessSlug }]);
        }
      } catch {}
    }

    revalidatePath(`/page/${businessSlug}`);
    revalidatePath('/my-listme');
    return { success: true };
  } catch (err: any) {
    console.error('Error toggling favourite business:', err);
    return { error: err.message || 'Failed to update favourite businesses' };
  }
}
