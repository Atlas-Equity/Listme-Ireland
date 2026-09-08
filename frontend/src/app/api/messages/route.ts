import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { purgeInactiveChats } from '@/utils/chatCleanup';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Auto-delete chats inactive for 3+ days
    await purgeInactiveChats().catch((err) => console.error('Auto-cleanup error:', err));

    // Fetch conversations where user is buyer OR seller
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        listing_id,
        buyer_id,
        seller_id,
        last_message,
        last_message_at,
        created_at,
        updated_at
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (convError) {
      // If table doesn't exist yet, return empty list gracefully
      if (convError.message?.includes('does not exist') || convError.message?.includes('schema cache')) {
        return NextResponse.json({ conversations: [], tableReady: false });
      }
      console.error('Fetch conversations error:', convError);
      return NextResponse.json({ error: convError.message }, { status: 500 });
    }

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({ conversations: [], tableReady: true });
    }

    // Collect all other user IDs and listing IDs to batch fetch
    const otherUserIds = Array.from(new Set(
      conversations.map(c => c.buyer_id === user.id ? c.seller_id : c.buyer_id)
    ));
    const listingIds = Array.from(new Set(
      conversations.map(c => c.listing_id).filter(Boolean)
    ));

    // Fetch profiles of other participants
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', otherUserIds);

    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    // Fetch listings
    let listingMap = new Map();
    if (listingIds.length > 0) {
      const { data: listings } = await supabase
        .from('listings')
        .select('id, title, price, price_type, images, status')
        .in('id', listingIds);
      listingMap = new Map((listings || []).map(l => [l.id, l]));
    }

    // Build enriched conversations list
    const enriched = await Promise.all(conversations.map(async (c) => {
      const otherUserId = c.buyer_id === user.id ? c.seller_id : c.buyer_id;
      const otherUser = profileMap.get(otherUserId);
      const listing = c.listing_id ? listingMap.get(c.listing_id) : null;

      // Count unread messages in this conversation sent by other user
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', c.id)
        .eq('sender_id', otherUserId)
        .eq('is_read', false);

      return {
        id: c.id,
        listingId: c.listing_id,
        listing: listing || null,
        otherUser: {
          id: otherUserId,
          username: otherUser?.username || 'User',
          avatarUrl: (otherUser as any)?.avatar_url || null,
        },
        isSeller: c.seller_id === user.id,
        lastMessage: c.last_message,
        lastMessageAt: c.last_message_at,
        unreadCount: count || 0,
      };
    }));

    return NextResponse.json({ conversations: enriched, tableReady: true });

  } catch (err: any) {
    console.error('Messages GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { conversationId, listingId, sellerId, recipientId, content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 });
    }

    const trimmedContent = content.trim();
    let targetConversationId = conversationId;

    // If conversationId is not provided, look up or create conversation using listingId & sellerId/recipientId
    if (!targetConversationId) {
      const otherUserId = sellerId || recipientId;
      if (!otherUserId) {
        return NextResponse.json({ error: 'sellerId, recipientId or conversationId is required' }, { status: 400 });
      }

      if (otherUserId === user.id) {
        return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
      }

      // Look up existing conversation between the two users
      let query = supabase
        .from('conversations')
        .select('id')
        .or(`and(buyer_id.eq.${user.id},seller_id.eq.${otherUserId}),and(buyer_id.eq.${otherUserId},seller_id.eq.${user.id})`);

      if (listingId) {
        query = query.eq('listing_id', listingId);
      }

      const { data: existingConv } = await query
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingConv?.id) {
        targetConversationId = existingConv.id;
      } else {
        // Create new conversation
        const now = new Date().toISOString();
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            listing_id: listingId || null,
            buyer_id: user.id,
            seller_id: otherUserId,
            last_message: trimmedContent,
            last_message_at: now,
            updated_at: now,
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating conversation:', createError);
          return NextResponse.json({ 
            error: createError.message?.includes('schema cache')
              ? 'Database messaging table needs to be created first. Please run messaging_migration.sql in Supabase.'
              : createError.message 
          }, { status: 500 });
        }

        targetConversationId = newConv.id;
      }
    }

    // Insert message
    const { data: newMessage, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: targetConversationId,
        sender_id: user.id,
        content: trimmedContent,
        is_read: false,
      })
      .select('*')
      .single();

    if (msgError) {
      console.error('Error inserting message:', msgError);
      return NextResponse.json({ error: msgError.message }, { status: 500 });
    }

    // Update conversation last_message and last_message_at
    const now = new Date().toISOString();
    await supabase
      .from('conversations')
      .update({
        last_message: trimmedContent,
        last_message_at: now,
        updated_at: now,
      })
      .eq('id', targetConversationId);

    return NextResponse.json({
      success: true,
      message: newMessage,
      conversationId: targetConversationId,
    });

  } catch (err: any) {
    console.error('Messages POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
