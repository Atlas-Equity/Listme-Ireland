import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch conversation and verify user is participant
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch message history
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) {
      return NextResponse.json({ error: msgError.message }, { status: 500 });
    }

    // Fetch other user's profile
    const otherUserId = conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id;
    const { data: otherProfile } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', otherUserId)
      .single();

    // Fetch listing info if present
    let listing = null;
    if (conversation.listing_id) {
      const { data: listingData } = await supabase
        .from('listings')
        .select('id, title, price, price_type, images, status, condition, location')
        .eq('id', conversation.listing_id)
        .single();
      listing = listingData;
    }

    // Mark messages from other user as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('sender_id', otherUserId)
      .eq('is_read', false);

    return NextResponse.json({
      conversation,
      messages: messages || [],
      otherUser: {
        id: otherUserId,
        username: otherProfile?.username || 'User',
      },
      listing,
      currentUserId: user.id,
    });

  } catch (err: any) {
    console.error('Fetch conversation thread error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mark messages from the other user as read
    const { error: updateError } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('is_read', false);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Mark read error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
