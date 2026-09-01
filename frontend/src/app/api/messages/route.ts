import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET: Fetch all conversations for the current user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch conversations where user is buyer or seller
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        listing_id,
        buyer_id,
        seller_id,
        updated_at,
        created_at
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // For each conversation, fetch: listing info, other user info, last message, unread count
    const enriched = await Promise.all(
      (conversations || []).map(async (conv) => {
        const otherUserId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;

        // Fetch other user's profile
        const { data: otherUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', otherUserId)
          .single();

        // Fetch listing info
        const { data: listing } = await supabase
          .from('listings')
          .select('title, images')
          .eq('id', conv.listing_id)
          .single();

        // Fetch last message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, sender_id, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Count unread messages (messages sent by the other person that I haven't read)
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('read', false)
          .neq('sender_id', user.id);

        return {
          ...conv,
          otherUser: otherUser?.username || 'Unknown',
          otherUserId,
          listing: {
            title: listing?.title || 'Deleted Listing',
            image: listing?.images?.[0] || null,
          },
          lastMessage: lastMessage || null,
          unreadCount: unreadCount || 0,
          isBuyer: conv.buyer_id === user.id,
        };
      })
    );

    return NextResponse.json({ conversations: enriched });
  } catch (err: any) {
    console.error('Conversations Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create a new conversation (or return existing one)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listingId, message } = await req.json();

    if (!listingId || !message) {
      return NextResponse.json({ error: 'listingId and message are required' }, { status: 400 });
    }

    // Fetch the listing to get the seller
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('seller_id')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.seller_id === user.id) {
      return NextResponse.json({ error: 'You cannot message yourself' }, { status: 400 });
    }

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listingId)
      .eq('buyer_id', user.id)
      .single();

    let conversationId: string;

    if (existing) {
      conversationId = existing.id;
    } else {
      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: listing.seller_id,
        })
        .select('id')
        .single();

      if (convError || !newConv) {
        console.error('Error creating conversation:', convError);
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
      }

      conversationId = newConv.id;
    }

    // Send the first message
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: message,
      });

    if (msgError) {
      console.error('Error sending message:', msgError);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return NextResponse.json({ conversationId });
  } catch (err: any) {
    console.error('Create Conversation Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
