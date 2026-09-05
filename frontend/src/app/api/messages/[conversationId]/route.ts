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

    const otherUserId = conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id;

    // Parallelize message history, other participant profile, and listing lookups
    const [messagesResult, profileResult, listingResult] = await Promise.all([
      supabase
        .from('messages')
        .select('id, conversation_id, sender_id, content, is_read, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(100),
      supabase
        .from('profiles')
        .select('id, username')
        .eq('id', otherUserId)
        .maybeSingle(),
      conversation.listing_id
        ? supabase
            .from('listings')
            .select('id, title, price, price_type, images, status, condition, location')
            .eq('id', conversation.listing_id)
            .maybeSingle()
        : Promise.resolve({ data: null })
    ]);

    if (messagesResult.error) {
      return NextResponse.json({ error: messagesResult.error.message }, { status: 500 });
    }

    // Mark unread messages from other user as read asynchronously (non-blocking)
    supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('sender_id', otherUserId)
      .eq('is_read', false)
      .then();

    return NextResponse.json({
      conversation,
      messages: messagesResult.data || [],
      otherUser: {
        id: otherUserId,
        username: profileResult.data?.username || 'User',
      },
      listing: listingResult.data,
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
