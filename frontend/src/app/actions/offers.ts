'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface OfferPayload {
  id: string;
  amount: number;
  listingId: string;
  listingTitle: string;
  status: 'pending' | 'accepted' | 'declined';
  buyerId: string;
  buyerName: string;
  createdAt: string;
  note?: string;
}

export async function submitOfferAction({
  listingId,
  sellerId,
  amount,
  note,
}: {
  listingId: string;
  sellerId: string;
  amount: number;
  note?: string;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Please sign in to make an offer.' };
  }

  if (user.id === sellerId) {
    return { success: false, error: 'You cannot make an offer on your own listing.' };
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return { success: false, error: 'Please enter a valid offer amount.' };
  }

  try {
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, title, price, price_type')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return { success: false, error: 'Listing not found.' };
    }

    if (listing.price_type === 'Auction') {
      return { success: false, error: 'Offers cannot be made on auction listings. Please place a bid.' };
    }

    const askingPrice = typeof listing.price === 'string' ? parseFloat(listing.price.replace(/[^0-9.]/g, '')) : Number(listing.price);
    if (!isNaN(askingPrice) && askingPrice > 0) {
      const minAllowed = Math.round((askingPrice * 0.90) * 100) / 100;
      if (amount < minAllowed) {
        return { success: false, error: `Offers must be at least 90% of the asking price (€${minAllowed.toFixed(2)}).` };
      }
    }

    const buyerName = user.user_metadata?.username || user.email?.split('@')[0] || 'Buyer';

    const offerPayload: OfferPayload = {
      id: `off_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      amount: Number(amount.toFixed(2)),
      listingId: listing.id,
      listingTitle: listing.title,
      status: 'pending',
      buyerId: user.id,
      buyerName,
      createdAt: new Date().toISOString(),
      note: note?.trim() || undefined,
    };

    const offerContent = `OFFER:${JSON.stringify(offerPayload)}`;

    // 3. Find or create conversation between buyer and seller for this listing
    const { data: existingConvs } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(buyer_id.eq.${user.id},seller_id.eq.${sellerId}),and(buyer_id.eq.${sellerId},seller_id.eq.${user.id})`)
      .eq('listing_id', listingId)
      .limit(1);

    let conversationId: string;

    const now = new Date().toISOString();
    const snippetText = `Offer sent: €${offerPayload.amount.toFixed(2)}`;

    if (existingConvs && existingConvs.length > 0) {
      conversationId = existingConvs[0].id;
      // Update existing conversation timestamp & snippet
      await supabase
        .from('conversations')
        .update({
          last_message: snippetText,
          last_message_at: now,
          updated_at: now,
        })
        .eq('id', conversationId);
    } else {
      // Create conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: sellerId,
          last_message: snippetText,
          last_message_at: now,
          updated_at: now,
        })
        .select('id')
        .single();

      if (convError || !newConv) {
        throw new Error(convError?.message || 'Failed to start conversation for offer.');
      }
      conversationId = newConv.id;
    }

    // 4. Insert offer message
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: offerContent,
        is_read: false,
      });

    if (msgError) {
      throw msgError;
    }

    // Also insert note as follow-up message if provided
    if (note && note.trim()) {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: note.trim(),
        is_read: false,
      });
    }

    revalidatePath(`/messages`);
    revalidatePath(`/listing/${listingId}`);

    return { success: true, conversationId };
  } catch (err: any) {
    console.error('Error submitting offer:', err);
    return { success: false, error: err.message || 'Failed to submit offer.' };
  }
}

export async function respondToOfferAction({
  conversationId,
  messageId,
  offerId,
  response,
}: {
  conversationId: string;
  messageId: string;
  offerId: string;
  response: 'accepted' | 'declined';
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // 1. Fetch the target message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .select('content')
      .eq('id', messageId)
      .single();

    if (msgError || !message || !message.content.startsWith('OFFER:')) {
      return { success: false, error: 'Offer message not found.' };
    }

    const payload: OfferPayload = JSON.parse(message.content.slice(6));
    if (payload.id !== offerId) {
      return { success: false, error: 'Offer ID mismatch.' };
    }

    payload.status = response;
    const updatedContent = `OFFER:${JSON.stringify(payload)}`;

    // 2. Update message content with new offer status
    const { error: updateError } = await supabase
      .from('messages')
      .update({ content: updatedContent })
      .eq('id', messageId);

    if (updateError) {
      throw updateError;
    }

    // 3. Post a status confirmation message to the chat
    const responseText = response === 'accepted'
      ? `Offer of €${payload.amount.toFixed(2)} was accepted! You can now arrange collection and payment.`
      : `Offer of €${payload.amount.toFixed(2)} was declined.`;

    const now = new Date().toISOString();
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: responseText,
      is_read: false,
    });

    await supabase
      .from('conversations')
      .update({
        last_message: responseText,
        last_message_at: now,
        updated_at: now,
      })
      .eq('id', conversationId);

    revalidatePath('/messages');
    return { success: true };
  } catch (err: any) {
    console.error('Error responding to offer:', err);
    return { success: false, error: err.message || 'Failed to update offer status.' };
  }
}
