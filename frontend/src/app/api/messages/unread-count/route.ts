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

    const { data: adminUserData } = await admin.auth.admin.getUserById(user.id);
    const userMeta = adminUserData?.user?.user_metadata || user.user_metadata || {};
    const businessInvites = Array.isArray(userMeta.business_invites) ? userMeta.business_invites : [];
    const pendingInvites = businessInvites.filter((i: any) => i.status === 'pending');
    const unreadInvites = pendingInvites.length;

    const { data: convs } = await admin
      .from('conversations')
      .select('id, seller_id, buyer_id')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

    let unreadCount = 0;
    let unreadQuestions = 0;
    let questionAlerts: any[] = [];

    if (convs && convs.length > 0) {
      const convIds = convs.map((c) => c.id);

      const { count: mCount } = await admin
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', convIds)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      unreadCount = mCount || 0;

      const sellerConvIds = convs.filter((c) => c.seller_id === user.id).map((c) => c.id);

      if (sellerConvIds.length > 0) {
        const { count: qCount } = await admin
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .in('conversation_id', sellerConvIds)
          .neq('sender_id', user.id)
          .like('content', 'QUESTION:%')
          .eq('is_read', false);

        unreadQuestions = qCount || 0;

        if (unreadQuestions > 0) {
          const { data: qMessages } = await admin
            .from('messages')
            .select('id, conversation_id, content, created_at')
            .in('conversation_id', sellerConvIds)
            .neq('sender_id', user.id)
            .like('content', 'QUESTION:%')
            .eq('is_read', false)
            .order('created_at', { ascending: false })
            .limit(5);

          questionAlerts = (qMessages || []).map((m) => {
            let questionText = m.content.replace(/^QUESTION:/, '').trim();
            let listingId = '';
            try {
              const parsed = JSON.parse(questionText);
              questionText = parsed.question || questionText;
              listingId = parsed.listingId || '';
            } catch {}
            return {
              id: m.id,
              conversationId: m.conversation_id,
              question: questionText,
              listingId,
              createdAt: m.created_at,
            };
          });
        }
      }
    }

    const totalNotifications = unreadQuestions + unreadInvites;

    return NextResponse.json({
      unreadCount,
      unreadQuestions,
      unreadInvites,
      pendingInvites,
      questionAlerts,
      totalNotifications,
    });
  } catch (err: any) {
    console.error('unread-count API error:', err);
    return NextResponse.json({
      unreadCount: 0,
      unreadQuestions: 0,
      unreadInvites: 0,
      pendingInvites: [],
      questionAlerts: [],
      totalNotifications: 0,
    });
  }
}
