'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function placeBid(listingId: string, amount: number) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'You must be logged in to place a bid.' };
  }

  try {
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

    const { data: highestBid } = await supabase
      .from('bids')
      .select('amount')
      .eq('listing_id', listingId)
      .order('amount', { ascending: false })
      .limit(1)
      .single();

    const currentPrice = highestBid ? highestBid.amount : listing.price;
    const minRequiredBid = Math.max(1.00, highestBid ? highestBid.amount + 1 : listing.price);
    const roundedAmount = Math.round(amount * 100) / 100;

    if (roundedAmount < 1.00) {
      return { success: false, error: 'Minimum bid allowed on Listme is €1.00.' };
    }

    if (roundedAmount < minRequiredBid) {
      return { success: false, error: `Bid must be at least €${minRequiredBid.toFixed(2)}` };
    }

    // 4. Absurdly high bid protection (eBay style typo & manipulation guardrail)
    // A single bid cannot exceed 5x current price or €500 above current, with a €1,000,000 maximum ceiling
    const maxAllowedBid = Math.min(
      Math.max(currentPrice * 5, currentPrice + 500),
      1000000
    );

    if (roundedAmount > maxAllowedBid) {
      return {
        success: false,
        error: `Bid rejected: €${roundedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} is too high. Under auction safety rules, a single bid cannot exceed €${maxAllowedBid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to protect against accidental typos.`,
      };
    }

    // 5. Insert bid
    const { error: bidInsertError } = await supabase
      .from('bids')
      .insert({
        listing_id: listingId,
        bidder_id: user.id,
        amount: roundedAmount,
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
    revalidatePath('/marketplace');
    revalidatePath('/category/marketplace');
    revalidatePath('/search');

    return { success: true };
  } catch (err: any) {
    console.error('Error placing bid:', err);
    return { success: false, error: err.message || 'Failed to place bid' };
  }
}
