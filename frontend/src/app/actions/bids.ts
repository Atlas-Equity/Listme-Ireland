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
    // 1. Fetch current listing to get starting price
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('price, seller_id, ends_at')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) throw new Error('Listing not found');

    if (listing.seller_id === user.id) {
      return { success: false, error: 'You cannot bid on your own listing.' };
    }

    if (listing.ends_at && new Date(listing.ends_at) < new Date()) {
      return { success: false, error: 'This auction has already closed.' };
    }

    // 2. Fetch current highest bid
    const { data: highestBid } = await supabase
      .from('bids')
      .select('amount')
      .eq('listing_id', listingId)
      .order('amount', { ascending: false })
      .limit(1)
      .single();

    const minRequiredBid = highestBid ? highestBid.amount + 1 : listing.price;

    if (amount < minRequiredBid) {
      return { success: false, error: `Bid must be at least $${minRequiredBid.toFixed(2)}` };
    }

    // 3. Insert bid
    const { error } = await supabase
      .from('bids')
      .insert({
        listing_id: listingId,
        bidder_id: user.id,
        amount
      });

    if (error) throw error;

    revalidatePath(`/listing/${listingId}`);
    return { success: true };
  } catch (err: any) {
    console.error('Error placing bid:', err);
    return { success: false, error: err.message };
  }
}
