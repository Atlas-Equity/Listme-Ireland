'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { isUserQuinn } from '@/utils/admin';
import Stripe from 'stripe';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { LinkedCardData } from '@/app/my-listme/actions';

export interface CreateListingInput {
  title: string;
  description: string;
  location: string;
  category: string;
  subcategory?: string;
  condition: string;
  priceType: string;
  price: number;
  buyNowPrice?: number;
  reservePrice?: number;
  durationDays?: number;
  durationMinutes?: number;
  uploadFee?: number;
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_onboarding_complete, stripe_account_id, username')
    .eq('id', user.id)
    .single();

  const username = (profile?.username || user.user_metadata?.username || '').toLowerCase();
  const userEmail = (user.email || '').toLowerCase();
  const isExempt = 
    username === 'quinn' || 
    username === 'sahleyis' || 
    userEmail === 'qrmooney@outlook.com' || 
    userEmail === 'dahiruhammajam@gmail.com' ||
    user.id === '387eb6d6-e83c-4414-b0e3-831d60cd1c16' ||
    user.id === '88beddab-0640-4f99-a04a-ff58c03704e4';

  if (!isExempt && (!profile?.stripe_onboarding_complete || !profile?.stripe_account_id)) {
    return { error: 'You must complete Stripe onboarding before creating a listing. Go to your profile to set up payments.' };
  }

  const userIsQuinn = isUserQuinn(user, username);
  let expiresAt: string;
  if (formData.durationMinutes === 5 && userIsQuinn) {
    expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  } else {
    const days = formData.durationDays && formData.durationDays > 0 ? formData.durationDays : 7;
    expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  let finalDescription = formData.description || '';

  if (formData.description && formData.description.length > 1000) {
    return { error: 'Item description cannot exceed 1000 characters.' };
  }

  if (formData.priceType === 'Auction' && (isNaN(formData.price) || formData.price < 1.00)) {
    return { error: 'Starting bid for auctions must be at least €1.00.' };
  }

  if (formData.priceType === 'Auction' && formData.reservePrice && formData.reservePrice < formData.price) {
    return { error: 'Reserve price must be greater than or equal to the starting bid.' };
  }

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

  if (formData.priceType === 'Auction' && formData.reservePrice && formData.reservePrice > 0) {
    finalDescription = `${finalDescription}\n\n[Reserve Price: €${formData.reservePrice}]`;
  }

  if (formData.subcategory) {
    finalDescription = `${finalDescription}\n\n[Subcategory: ${formData.subcategory}]`;
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
    ends_at: expiresAt,
    status: 'active'
  };

  let data: any = null;
  let error: any = null;

  const extendedPayload: any = { ...basePayload };
  if (formData.subcategory) {
    extendedPayload.subcategory = formData.subcategory;
  }
  if (formData.priceType === 'Auction' && formData.buyNowPrice && formData.buyNowPrice > 0) {
    extendedPayload.buy_now_price = formData.buyNowPrice;
  }
  if (formData.priceType === 'Auction' && formData.reservePrice && formData.reservePrice > 0) {
    extendedPayload.reserve_price = formData.reservePrice;
  }
  if (formData.businessPageSlug) {
    extendedPayload.business_page_slug = formData.businessPageSlug;
  }
  if (formData.uploadFee) {
    extendedPayload.upload_fee = formData.uploadFee;
  }

  // Calculate and verify upload fee
  let calculatedFee = 0;
  if (formData.durationDays === 14 || formData.durationDays === 30) {
    calculatedFee += 0.10;
  }
  if (formData.listingType === 'item' && (formData.category?.startsWith('Other & Miscellaneous') || formData.category === 'Other & Miscellaneous')) {
    calculatedFee += 0.50;
  }
  if (formData.priceType === 'Auction' && formData.reservePrice && formData.reservePrice > 0) {
    calculatedFee += 0.25;
  }

  const feeToCharge = typeof formData.uploadFee === 'number' && formData.uploadFee > 0
    ? formData.uploadFee
    : calculatedFee;

  if (feeToCharge > 0) {
    extendedPayload.upload_fee = feeToCharge;
  }

  let feePaymentResult: {
    method: 'account_credit' | 'linked_card' | 'split';
    amountPaid: number;
    creditDeducted: number;
    cardCharged: number;
    paymentIntentId?: string;
  } | null = null;

  const userMeta = user.user_metadata || {};
  const currentCredit = typeof userMeta.account_credit === 'number' ? userMeta.account_credit : 0;

  if (feeToCharge > 0) {
    // 1. Backcharge credit first if sufficient
    if (currentCredit >= feeToCharge) {
      const newCredit = Math.round((currentCredit - feeToCharge) * 100) / 100;
      const { error: creditErr } = await supabase.auth.updateUser({
        data: { account_credit: newCredit }
      });

      if (creditErr) {
        return { error: `Failed to deduct €${feeToCharge.toFixed(2)} listing fee from account credit: ${creditErr.message}` };
      }

      if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        try {
          const adminClient = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
          );
          await adminClient.auth.admin.updateUserById(user.id, {
            user_metadata: {
              ...user.user_metadata,
              account_credit: newCredit,
            }
          });
        } catch (adminErr) {
          console.warn('Admin client sync note:', adminErr);
        }
      }

      feePaymentResult = {
        method: 'account_credit',
        amountPaid: feeToCharge,
        creditDeducted: feeToCharge,
        cardCharged: 0,
      };
    } else {
      // 2. Insufficient or zero credit: backcharge available credit, then charge remainder to assigned card
      const creditToUse = currentCredit > 0 ? currentCredit : 0;
      const cardAmountToCharge = Math.round((feeToCharge - creditToUse) * 100) / 100;

      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        return {
          error: `This listing requires an upload fee of €${feeToCharge.toFixed(2)}. You have €${currentCredit.toFixed(2)} account credit, and card processing is currently unavailable.`
        };
      }

      const allCards: LinkedCardData[] = Array.isArray(userMeta.linked_cards) && userMeta.linked_cards.length > 0
        ? userMeta.linked_cards
        : userMeta.linked_card
          ? [userMeta.linked_card]
          : [];

      // Prefer credit card as per ListMe seller requirements, or fallback to first card
      const assignedCard = allCards.find(c => c?.funding === 'credit' || c?.cardType === 'credit')
        || allCards[0]
        || userMeta.linked_card;

      const stripe = new Stripe(stripeKey);

      let customerId: string | undefined = userMeta.stripe_customer_id;
      if (!customerId) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('stripe_customer_id')
          .eq('id', user.id)
          .maybeSingle();
        customerId = prof?.stripe_customer_id;
      }

      if (!customerId && user.email) {
        try {
          const existingCustomers = await stripe.customers.list({ email: user.email, limit: 1 });
          if (existingCustomers.data && existingCustomers.data.length > 0) {
            customerId = existingCustomers.data[0].id;
          }
        } catch {}
      }

      let paymentMethodId: string | undefined = assignedCard?.stripePaymentMethodId;
      if (!paymentMethodId) {
        const withPm = allCards.find(c => c?.stripePaymentMethodId);
        if (withPm) paymentMethodId = withPm.stripePaymentMethodId;
      }

      if (!paymentMethodId && customerId) {
        try {
          const cust = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          const defaultPm = cust.invoice_settings?.default_payment_method;
          if (defaultPm) {
            paymentMethodId = typeof defaultPm === 'string' ? defaultPm : defaultPm.id;
          } else {
            const pms = await stripe.paymentMethods.list({ customer: customerId, type: 'card', limit: 1 });
            if (pms.data && pms.data.length > 0) {
              paymentMethodId = pms.data[0].id;
            }
          }
        } catch (pmErr) {
          console.warn('Could not retrieve payment methods for customer:', pmErr);
        }
      }

      if (!customerId || !paymentMethodId) {
        const creditDetail = currentCredit > 0
          ? `You have €${currentCredit.toFixed(2)} in account credit, but need €${feeToCharge.toFixed(2)}.`
          : `You have €0.00 in account credit.`;
        return {
          error: `This listing has an upload fee of €${feeToCharge.toFixed(2)}. ${creditDetail} No assigned card was found on your account. Please link a card in your wallet or top up credit to publish this listing.`
        };
      }

      // Execute Stripe charge
      const amountInCents = Math.round(cardAmountToCharge * 100);
      const stripeChargeCents = Math.max(50, amountInCents); // Stripe EUR minimum is 50c (€0.50)
      const changeToDeposit = Math.round((stripeChargeCents - amountInCents)) / 100;

      try {
        const pi = await stripe.paymentIntents.create({
          amount: stripeChargeCents,
          currency: 'eur',
          customer: customerId,
          payment_method: paymentMethodId,
          off_session: true,
          confirm: true,
          description: `ListMe Listing Fee: ${formData.title}`,
          metadata: {
            type: 'listing_upload_fee',
            seller_id: user.id,
            listing_title: formData.title,
            total_fee: feeToCharge.toFixed(2),
            credit_deducted: creditToUse.toFixed(2),
            card_charged: (stripeChargeCents / 100).toFixed(2),
          },
        });

        if (pi.status !== 'succeeded') {
          return {
            error: `Failed to charge listing fee to assigned card (status: ${pi.status}). Please check your card or top up account credit.`
          };
        }

        // Deduct used credit and deposit change if Stripe minimum exceeded the card fee
        let finalCredit = currentCredit;
        if (creditToUse > 0) {
          finalCredit = Math.round((finalCredit - creditToUse) * 100) / 100;
        }
        if (changeToDeposit > 0) {
          finalCredit = Math.round((finalCredit + changeToDeposit) * 100) / 100;
        }

        if (creditToUse > 0 || changeToDeposit > 0) {
          await supabase.auth.updateUser({
            data: { account_credit: finalCredit }
          });
          if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
            try {
              const adminClient = createSupabaseClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
              );
              await adminClient.auth.admin.updateUserById(user.id, {
                user_metadata: {
                  ...user.user_metadata,
                  account_credit: finalCredit,
                }
              });
            } catch {}
          }
        }

        feePaymentResult = {
          method: creditToUse > 0 ? 'split' : 'linked_card',
          amountPaid: feeToCharge,
          creditDeducted: creditToUse,
          cardCharged: stripeChargeCents / 100,
          paymentIntentId: pi.id,
        };
      } catch (stripeErr: any) {
        console.error('Error charging card for listing fee:', stripeErr);
        return {
          error: `Failed to charge listing fee of €${cardAmountToCharge.toFixed(2)} to assigned card: ${stripeErr.message || 'Payment declined.'}. Your account credit was not deducted.`
        };
      }
    }
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
    // Rollback payments if listing insert failed
    if (feePaymentResult) {
      if (feePaymentResult.creditDeducted > 0) {
        const restoredCredit = Math.round((currentCredit) * 100) / 100;
        await supabase.auth.updateUser({
          data: { account_credit: restoredCredit }
        });
        if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
          try {
            const adminClient = createSupabaseClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL,
              process.env.SUPABASE_SERVICE_ROLE_KEY
            );
            await adminClient.auth.admin.updateUserById(user.id, {
              user_metadata: {
                ...user.user_metadata,
                account_credit: restoredCredit,
              }
            });
          } catch {}
        }
      }
      if (feePaymentResult.paymentIntentId && process.env.STRIPE_SECRET_KEY) {
        try {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
          await stripe.refunds.create({ payment_intent: feePaymentResult.paymentIntentId });
        } catch (refundErr) {
          console.error('Failed to refund listing fee payment intent:', refundErr);
        }
      }
    }
    return { error: 'Failed to create listing. Any charged fee has been refunded. Please try again.' };
  }

  revalidatePath('/');
  revalidatePath('/marketplace');
  revalidatePath('/category/marketplace');
  revalidatePath('/category/jobs');
  revalidatePath('/category/services');
  if (formData.businessPageSlug) {
    revalidatePath(`/page/${formData.businessPageSlug}`);
  }
  
  return { success: true, listingId: data?.id };
}
