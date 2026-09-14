import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ unreadCount: 0, unreadQuestions: 0 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ unreadCount: 0, unreadQuestions: 0 });
    }

    const admin = createAdminClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // 1. Fetch conversations for user
    const { data: convs, error: convErr } = await admin
      .from('conversations')
      .select('id, seller_id, buyer_id')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

    if (convErr || !convs || convs.length === 0) {
      return NextResponse.json({ unreadCount: 0, unreadQuestions: 0 });
    }

    const convIds = convs.map(c => c.id);

    // 2. Count unread messages from other users
    const { count: unreadCount } = await admin
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('conversation_id', convIds)
      .neq('sender_id', user.id)
      .eq('is_read', false);

    // 3. Count unread question messages for listings where current user is seller
    const sellerConvIds = convs.filter(c => c.seller_id === user.id).map(c => c.id);
    let unreadQuestions = 0;

    if (sellerConvIds.length > 0) {
      const { count: qCount } = await admin
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', sellerConvIds)
        .neq('sender_id', user.id)
        .like('content', 'QUESTION:%')
        .eq('is_read', false);

      unreadQuestions = qCount || 0;
    }

    return NextResponse.json({
      unreadCount: unreadCount || 0,
      unreadQuestions,
    });
  } catch (err: any) {
    console.error('unread-count API error:', err);
    return NextResponse.json({ unreadCount: 0, unreadQuestions: 0 });
  }
}
