'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface CreateListingInput {
  title: string;
  description: string;
  location: string;
  category: string;
  condition: string;
  priceType: string;
  price: number;
  buyNowPrice?: number;
  durationDays: number;
  paymentOptions: string[];
  images: string[];
  listingType?: 'item' | 'job' | 'service';
  businessPageSlug?: string;
  businessPageName?: string;
  jobDetails?: {
    companyName?: string;
    jobType?: string;
    salary?: string;
    applicationMethod?: string;
  };
  serviceDetails?: {
    serviceCategory?: string;
    pricingModel?: string;
  };
}

export async function createListing(formData: CreateListingInput) {
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

  // Construct description with rich TradeMe metadata tags
  let finalDescription = formData.description || '';

  if (formData.businessPageSlug) {
    finalDescription = `${finalDescription}\n\n[Business Page: ${formData.businessPageSlug} | ${formData.businessPageName || formData.businessPageSlug}]`;
  }

  if (formData.listingType === 'job' && formData.jobDetails) {
    finalDescription = `${finalDescription}\n\n[Job: ${formData.jobDetails.jobType || 'Full-Time'} | Salary: ${formData.jobDetails.salary || 'Competitive'} | Company: ${formData.jobDetails.companyName || 'Verified Employer'}]`;
  } else if (formData.listingType === 'service' && formData.serviceDetails) {
    finalDescription = `${finalDescription}\n\n[Service: ${formData.serviceDetails.serviceCategory || 'Trades'} | Pricing: ${formData.serviceDetails.pricingModel || 'Hourly'}]`;
  }

  if (formData.priceType === 'Auction' && formData.buyNowPrice && formData.buyNowPrice > 0) {
    finalDescription = `${finalDescription}\n\n[Buy It Now: €${formData.buyNowPrice}]`;
  }

  const basePayload: any = {
    seller_id: user.id,
    title: formData.title,
    description: finalDescription,
    location: formData.location,
    category: formData.category,
    condition: formData.condition,
    price_type: formData.priceType,
    price: formData.price,
    payment_options: formData.paymentOptions,
    images: formData.images,
    expires_at: expiresAt,
    status: 'active'
  };

  // Attempt insert with additional columns if present, otherwise fallback to standard
  let data: any = null;
  let error: any = null;

  const extendedPayload: any = { ...basePayload };
  if (formData.priceType === 'Auction' && formData.buyNowPrice && formData.buyNowPrice > 0) {
    extendedPayload.buy_now_price = formData.buyNowPrice;
  }
  if (formData.businessPageSlug) {
    extendedPayload.business_page_slug = formData.businessPageSlug;
  }

  const attempt = await supabase
    .from('listings')
    .insert(extendedPayload)
    .select()
    .single();

  if (attempt.error) {
    // Fallback without dynamic extra columns
    const fallback = await supabase
      .from('listings')
      .insert(basePayload)
      .select()
      .single();
    data = fallback.data;
    error = fallback.error;
  } else {
    data = attempt.data;
    error = attempt.error;
  }

  if (error) {
    console.error('Error creating listing:', error);
    return { error: 'Failed to create listing. Please try again.' };
  }

  // Revalidate relevant pages
  revalidatePath('/');
  revalidatePath('/browse');
  revalidatePath('/category/marketplace');
  revalidatePath('/category/jobs');
  revalidatePath('/category/services');
  if (formData.businessPageSlug) {
    revalidatePath(`/page/${formData.businessPageSlug}`);
  }
  
  return { success: true, listingId: data?.id };
}
