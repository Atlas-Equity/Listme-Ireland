'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import Stripe from 'stripe';

export async function placeBid(listingId: string, amount: number) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'You must be logged in to place a bid.' };
  }

  try {
    // 1. eBay Buyer Verification: Must have card or wallet credit on file
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      const stripe = new Stripe(stripeKey);
      
      // Look up customer by email to check for active saved payment methods
      const customers = await stripe.customers.list({ email: user.email, limit: 3 });
      let hasCardOnFile = false;

      for (const customer of customers.data) {
        const pms = await stripe.paymentMethods.list({
          customer: customer.id,
          type: 'card',
          limit: 1,
        });
        if (pms.data && pms.data.length > 0) {
          hasCardOnFile = true;
          break;
        }
      }

      // Check if user has an active seller stripe account as alternative verified identity
      if (!hasCardOnFile) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('stripe_account_id, stripe_onboarding_complete')
          .eq('id', user.id)
          .single();

        if (profile?.stripe_account_id && profile?.stripe_onboarding_complete) {
          hasCardOnFile = true;
        }
      }

      // Check if user has verified Listme Account Credit or linked card
      if (!hasCardOnFile) {
        const linkedCard = user.user_metadata?.linked_card;
        const credit = user.user_metadata?.account_credit;
        if ((linkedCard && linkedCard.cardNumberBlocks?.length === 4) || (typeof credit === 'number' && credit > 0)) {
          hasCardOnFile = true;
        }
      }

      if (!hasCardOnFile) {
        return {
          success: false,
          requiresPaymentMethod: true,
          error: 'Payment method required: Under auction rules, you must link a credit/debit card to your wallet before placing a bid.',
        };
      }
    }

    // 2. Fetch current listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('price, seller_id, ends_at, price_type, description')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) throw new Error('Listing not found');

    if (listing.seller_id === user.id) {
      return { success: false, error: 'You cannot bid on your own listing.' };
    }

    if (listing.ends_at && new Date(listing.ends_at) < new Date()) {
      return { success: false, error: 'This auction has already closed.' };
    }

    // 3. Fetch current highest bid
    const { data: highestBid } = await supabase
      .from('bids')
      .select('amount')
      .eq('listing_id', listingId)
      .order('amount', { ascending: false })
      .limit(1)
      .single();

    const currentPrice = highestBid ? highestBid.amount : listing.price;
    const minRequiredBid = currentPrice + 1;

    if (amount < minRequiredBid) {
      return { success: false, error: `Bid must be at least €${minRequiredBid.toFixed(2)}` };
    }

    // 4. Absurdly high bid protection (eBay style typo & manipulation guardrail)
    // A single bid cannot exceed 5x current price or €500 above current, with a €1,000,000 maximum ceiling
    const maxAllowedBid = Math.min(
      Math.max(currentPrice * 5, currentPrice + 500),
      1000000
    );

    if (amount > maxAllowedBid) {
      return {
        success: false,
        error: `Bid rejected: €${amount.toLocaleString()} is too high. Under auction safety rules, a single bid cannot exceed €${maxAllowedBid.toLocaleString()} (maximum allowed: 5x current price) to protect against accidental typos and bid manipulation.`,
      };
    }

    // 5. Insert bid
    const { error: bidInsertError } = await supabase
      .from('bids')
      .insert({
        listing_id: listingId,
        bidder_id: user.id,
        amount,
      });

    if (bidInsertError) throw bidInsertError;

    // 6. Synchronize listing's price with the new highest bid
    const updatePayload: Record<string, any> = { price: amount };

    // If the bid reaches or exceeds the Buy Now price, remove Buy Now and push it purely to auction
    const buyNowMatch = listing.description?.match(/\[Buy It Now:\s*€?([0-9.]+)\]/i);
    const existingBuyNow = buyNowMatch ? parseFloat(buyNowMatch[1]) : null;

    if (existingBuyNow !== null && amount >= existingBuyNow) {
      if (listing.description && buyNowMatch) {
        updatePayload.description = listing.description.replace(/\[Buy It Now:\s*€?[0-9.]+\]/gi, '').trim();
      }
    }

    await supabase
      .from('listings')
      .update(updatePayload)
      .eq('id', listingId);

    // 7. Revalidate all relevant pages so listings show identical price
    revalidatePath(`/listing/${listingId}`);
    revalidatePath('/');
    revalidatePath('/category/marketplace');
    revalidatePath('/search');
    revalidatePath('/browse');

    return { success: true };
  } catch (err: any) {
    console.error('Error placing bid:', err);
    return { success: false, error: err.message || 'Failed to place bid' };
  }
}
