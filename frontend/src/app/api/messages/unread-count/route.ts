import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        unreadCount: 0,
        unreadQuestions: 0,
        unreadInvites: 0,
        pendingInvites: [],
        questionAlerts: [],
        closedListings: [],
        totalNotifications: 0,
      });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({
        unreadCount: 0,
        unreadQuestions: 0,
        unreadInvites: 0,
        pendingInvites: [],
        questionAlerts: [],
        closedListings: [],
        totalNotifications: 0,
      });
    }

    const admin = createAdminClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data: adminUserData } = await admin.auth.admin.getUserById(user.id);
    const userMeta = adminUserData?.user?.user_metadata || user.user_metadata || {};
    const businessInvites = Array.isArray(userMeta.business_invites) ? userMeta.business_invites : [];
    const pendingInvites = businessInvites.filter((i: any) => i.status === 'pending');
    const unreadInvites = pendingInvites.length;
    const dismissedIds: string[] = userMeta.dismissed_notifications || [];

    const now = new Date();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const { data: userListings } = await admin
      .from('listings')
      .select('id, title, price, images, expires_at, ends_at, status')
      .eq('seller_id', user.id);

    const allListings = userListings || [];

    const expiredOlderThanDay = allListings.filter((l) => {
      const closeTime = l.expires_at ? new Date(l.expires_at) : (l.ends_at ? new Date(l.ends_at) : null);
      const isClosed = l.status === 'closed' || (closeTime !== null && closeTime < now);
      return isClosed && closeTime !== null && closeTime < oneDayAgo;
    });

    if (expiredOlderThanDay.length > 0) {
      const delIds = expiredOlderThanDay.map((l) => l.id);
      await Promise.allSettled([
        admin.from('wishlists').delete().in('listing_id', delIds),
        admin.from('bids').delete().in('listing_id', delIds),
        admin.from('reviews').delete().in('listing_id', delIds),
        admin.from('watchlist').delete().in('listing_id', delIds),
      ]);
      await admin.from('listings').delete().in('id', delIds);
    }

    const activeClosedListings = allListings
      .filter((l) => {
        if (dismissedIds.includes(l.id)) return false;
        const closeTime = l.expires_at ? new Date(l.expires_at) : (l.ends_at ? new Date(l.ends_at) : null);
        const isClosed = l.status === 'closed' || (closeTime !== null && closeTime < now);
        const isWithinDay = closeTime !== null ? closeTime >= oneDayAgo : true;
        return isClosed && isWithinDay;
      })
      .map((l) => ({
        id: l.id,
        title: l.title,
        price: l.price,
        images: l.images || [],
        closes_at: l.expires_at || l.ends_at,
      }));

    const { data: convs } = await admin
      .from('conversations')
      .select('id, seller_id, buyer_id')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

    let unreadCount = 0;
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
        const { data: qMessages } = await admin
          .from('messages')
          .select('id, conversation_id, content, created_at')
          .in('conversation_id', sellerConvIds)
          .like('content', 'QUESTION:%')
          .order('created_at', { ascending: false });

        if (qMessages && qMessages.length > 0) {
          for (const m of qMessages) {
            try {
              const questionContent = m.content.replace(/^QUESTION:/, '').trim();
              const parsed = JSON.parse(questionContent);
              if (!parsed.answer && !parsed.hasAnswer) {
                const listing = allListings.find((l) => l.id === parsed.listingId);
                questionAlerts.push({
                  id: parsed.id || m.id,
                  msgId: m.id,
                  conversationId: m.conversation_id,
                  question: parsed.question || questionContent,
                  listingId: parsed.listingId || '',
                  listingTitle: listing?.title || 'Listing',
                  buyerUsername: parsed.buyerUsername || 'User',
                  createdAt: parsed.createdAt || m.created_at,
                });
              }
            } catch {}
          }
        }
      }
    }

    let favUploadsCount = 0;
    try {
      const { data: favSellers } = await admin
        .from('favourite_sellers')
        .select('seller_id')
        .eq('user_id', user.id);
      const favSellerIds = (favSellers || []).map((f: any) => f.seller_id);
      const favBusinessSlugs: string[] = userMeta.favourite_businesses || [];

      if (favSellerIds.length > 0 || favBusinessSlugs.length > 0) {
        const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        let q = admin
          .from('listings')
          .select('id, seller_id, business_page_slug')
          .eq('status', 'active')
          .gte('created_at', twoDaysAgo)
          .limit(20);

        if (favSellerIds.length > 0 && favBusinessSlugs.length > 0) {
          q = q.or(`seller_id.in.(${favSellerIds.join(',')}),business_page_slug.in.(${favBusinessSlugs.join(',')})`);
        } else if (favSellerIds.length > 0) {
          q = q.in('seller_id', favSellerIds);
        } else {
          q = q.in('business_page_slug', favBusinessSlugs);
        }

        const { data: uploads } = await q;
        if (uploads) {
          favUploadsCount = uploads.filter((u: any) => !dismissedIds.includes(`fav_${u.id}`)).length;
        }
      }
    } catch {}

    const hasWelcomeGuide = !dismissedIds.includes('welcome_guide');
    const totalNotifications = pendingInvites.length + questionAlerts.length + activeClosedListings.length + favUploadsCount + (hasWelcomeGuide ? 1 : 0);

    return NextResponse.json({
      unreadCount,
      unreadQuestions: questionAlerts.length,
      unreadInvites,
      unreadFavUploads: favUploadsCount,
      pendingInvites,
      questionAlerts,
      closedListings: activeClosedListings,
      totalNotifications,
      hasWelcomeGuide,
    });
  } catch (err: any) {
    console.error('unread-count API error:', err);
    return NextResponse.json({
      unreadCount: 0,
      unreadQuestions: 0,
      unreadInvites: 0,
      pendingInvites: [],
      questionAlerts: [],
      closedListings: [],
      totalNotifications: 0,
    });
  }
}
