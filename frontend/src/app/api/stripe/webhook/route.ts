import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Supabase service credentials not configured.');
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      event = JSON.parse(rawBody);
    }
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
  }

  const supabaseAdmin = getAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.metadata?.type === 'verified_subscription') {
          const userId = session.metadata?.userId;
          const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
          const custId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

          if (userId) {
            // Update auth metadata
            const { data: userRecord } = await supabaseAdmin.auth.admin.getUserById(userId);
            if (userRecord?.user) {
              const currentMeta = userRecord.user.user_metadata || {};
              await supabaseAdmin.auth.admin.updateUserById(userId, {
                user_metadata: {
                  ...currentMeta,
                  is_verified: true,
                  verified_at: new Date().toISOString(),
                  verification_type: 'subscription',
                  stripe_subscription_id: subId,
                  stripe_customer_id: custId || currentMeta.stripe_customer_id,
                },
              });
            }

            // Update profiles table
            await supabaseAdmin
              .from('profiles')
              .update({
                is_verified: true,
                stripe_subscription_id: subId,
                stripe_customer_id: custId,
              })
              .eq('id', userId);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const custId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

        let targetUserId = userId;
        if (!targetUserId && custId) {
          const { data: p } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', custId)
            .maybeSingle();
          targetUserId = p?.id;
        }

        if (targetUserId) {
          const { data: userRecord } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
          if (userRecord?.user) {
            const currentMeta = userRecord.user.user_metadata || {};
            await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
              user_metadata: {
                ...currentMeta,
                is_verified: false,
                verification_type: null,
                stripe_subscription_id: null,
              },
            });
          }

          await supabaseAdmin
            .from('profiles')
            .update({
              is_verified: false,
              stripe_subscription_id: null,
            })
            .eq('id', targetUserId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';
        const userId = subscription.metadata?.userId;
        const custId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

        let targetUserId = userId;
        if (!targetUserId && custId) {
          const { data: p } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', custId)
            .maybeSingle();
          targetUserId = p?.id;
        }

        if (targetUserId) {
          const { data: userRecord } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
          if (userRecord?.user) {
            const currentMeta = userRecord.user.user_metadata || {};
            await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
              user_metadata: {
                ...currentMeta,
                is_verified: isActive,
                verification_type: isActive ? 'subscription' : null,
                stripe_subscription_id: isActive ? subscription.id : null,
              },
            });
          }

          await supabaseAdmin
            .from('profiles')
            .update({
              is_verified: isActive,
              stripe_subscription_id: isActive ? subscription.id : null,
            })
            .eq('id', targetUserId);
        }
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook processing error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
