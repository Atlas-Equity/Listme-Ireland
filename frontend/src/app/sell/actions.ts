'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createListing(formData: {
  title: string;
  description: string;
  location: string;
  category: string;
  condition: string;
  priceType: string;
  price: number;
  durationDays: number;
  paymentOptions: string[];
  images: string[];
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to create a listing.' };
  }

  // Verify seller has completed Stripe onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_onboarding_complete, stripe_account_id')
    .eq('id', user.id)
    .single();

  if (!profile?.stripe_onboarding_complete || !profile?.stripe_account_id) {
    return { error: 'You must complete Stripe onboarding before creating a listing. Go to your profile to set up payments.' };
  }

  // Calculate expiration date
  const expiresAt = new Date(Date.now() + formData.durationDays * 24 * 60 * 60 * 1000).toISOString();

  // Insert the listing into the database
  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: user.id,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      category: formData.category,
      condition: formData.condition,
      price_type: formData.priceType,
      price: formData.price,
      payment_options: formData.paymentOptions,
      images: formData.images,
      expires_at: expiresAt,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating listing:', error);
    return { error: 'Failed to create listing. Please try again.' };
  }

  // Revalidate the homepage and category pages so the new listing shows up
  revalidatePath('/');
  revalidatePath('/browse');
  
  return { success: true, listingId: data.id };
}
