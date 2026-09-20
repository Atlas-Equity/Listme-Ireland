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
        if (session.mode === 'subscription') {
          const userId = session.metadata?.userId || session.client_reference_id;
          const planType = session.metadata?.planType;
          const businessPageSlug = session.metadata?.businessPageSlug;
          const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
          const custId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

          let targetUserId = userId;
          if (!targetUserId && (session.customer_details?.email || session.customer_email)) {
            const email = session.customer_details?.email || session.customer_email;
            const { data: p } = await supabaseAdmin
              .from('profiles')
              .select('id')
              .eq('email', email)
              .maybeSingle();
            targetUserId = p?.id;
          }

          if (targetUserId) {
            const { data: userRecord } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
            const currentMeta = userRecord?.user?.user_metadata || {};

            let updatedBusinessPages = currentMeta.business_pages;
            if (businessPageSlug && Array.isArray(currentMeta.business_pages)) {
              updatedBusinessPages = currentMeta.business_pages.map((p: any) => {
                if (p && typeof p.slug === 'string' && p.slug.toLowerCase() === businessPageSlug.toLowerCase()) {
                  return { ...p, is_verified: true, plan: 'Verified Pro Page' };
                }
                return p;
              });
            }

            if (businessPageSlug) {
              try {
                await supabaseAdmin
                  .from('business_pages')
                  .update({ is_verified: true, plan: 'Verified Pro Page' })
                  .ilike('slug', businessPageSlug);
              } catch {}
            }

            const shouldVerifyAccount = planType === 'account' || planType === 'bundle' || !planType;

            await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
              user_metadata: {
                ...currentMeta,
                ...(shouldVerifyAccount
                  ? {
                      is_verified: true,
                      verified_at: new Date().toISOString(),
                      verification_type: 'subscription',
                    }
                  : {}),
                business_pages: updatedBusinessPages,
                stripe_subscription_id: subId,
                stripe_customer_id: custId || currentMeta.stripe_customer_id,
              },
            });

            if (shouldVerifyAccount) {
              await supabaseAdmin
                .from('profiles')
                .update({
                  is_verified: true,
                  stripe_subscription_id: subId,
                  stripe_customer_id: custId,
                })
                .eq('id', targetUserId);
            }
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const planType = subscription.metadata?.planType;
        const businessPageSlug = subscription.metadata?.businessPageSlug;
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
          const currentMeta = userRecord?.user?.user_metadata || {};

          let updatedBusinessPages = currentMeta.business_pages;
          if (businessPageSlug && Array.isArray(currentMeta.business_pages)) {
            updatedBusinessPages = currentMeta.business_pages.map((p: any) => {
              if (p && typeof p.slug === 'string' && p.slug.toLowerCase() === businessPageSlug.toLowerCase()) {
                return { ...p, is_verified: false, plan: 'Commercial Storefront' };
              }
              return p;
            });
          }

          if (businessPageSlug) {
            try {
              await supabaseAdmin
                .from('business_pages')
                .update({ is_verified: false, plan: 'Commercial Storefront' })
                .ilike('slug', businessPageSlug);
            } catch {}
          }

          const shouldUnverifyAccount = planType === 'account' || planType === 'bundle' || !planType;

          await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
            user_metadata: {
              ...currentMeta,
              ...(shouldUnverifyAccount
                ? {
                    is_verified: false,
                    verification_type: null,
                    stripe_subscription_id: null,
                  }
                : {}),
              business_pages: updatedBusinessPages,
            },
          });

          if (shouldUnverifyAccount) {
            await supabaseAdmin
              .from('profiles')
              .update({
                is_verified: false,
                stripe_subscription_id: null,
              })
              .eq('id', targetUserId);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';
        const userId = subscription.metadata?.userId;
        const planType = subscription.metadata?.planType;
        const businessPageSlug = subscription.metadata?.businessPageSlug;
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
          const currentMeta = userRecord?.user?.user_metadata || {};

          let updatedBusinessPages = currentMeta.business_pages;
          if (businessPageSlug && Array.isArray(currentMeta.business_pages)) {
            updatedBusinessPages = currentMeta.business_pages.map((p: any) => {
              if (p && typeof p.slug === 'string' && p.slug.toLowerCase() === businessPageSlug.toLowerCase()) {
                return { ...p, is_verified: isActive, plan: isActive ? 'Verified Pro Page' : 'Commercial Storefront' };
              }
              return p;
            });
          }

          if (businessPageSlug) {
            try {
              await supabaseAdmin
                .from('business_pages')
                .update({ is_verified: isActive, plan: isActive ? 'Verified Pro Page' : 'Commercial Storefront' })
                .ilike('slug', businessPageSlug);
            } catch {}
          }

          const shouldUpdateAccount = planType === 'account' || planType === 'bundle' || !planType;

          await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
            user_metadata: {
              ...currentMeta,
              ...(shouldUpdateAccount
                ? {
                    is_verified: isActive,
                    verification_type: isActive ? 'subscription' : null,
                    stripe_subscription_id: isActive ? subscription.id : null,
                  }
                : {}),
              business_pages: updatedBusinessPages,
            },
          });

          if (shouldUpdateAccount) {
            await supabaseAdmin
              .from('profiles')
              .update({
                is_verified: isActive,
                stripe_subscription_id: isActive ? subscription.id : null,
              })
              .eq('id', targetUserId);
          }
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook processing error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
