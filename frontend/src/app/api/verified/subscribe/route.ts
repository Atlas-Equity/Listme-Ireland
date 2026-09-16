import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        { 
          error: 'Stripe Secret Key is not configured. Please add STRIPE_SECRET_KEY in frontend/.env.local' 
        }, 
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Please sign in to get verified.' }, { status: 401 });
    }

    const stripe = new Stripe(stripeKey);
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    let customerId = user.user_metadata?.stripe_customer_id;

    if (!customerId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id, username, email')
        .eq('id', user.id)
        .maybeSingle();

      customerId = profile?.stripe_customer_id;

      if (!customerId && user.email) {
        const existingCustomers = await stripe.customers.list({ email: user.email, limit: 1 });
        if (existingCustomers.data && existingCustomers.data.length > 0) {
          customerId = existingCustomers.data[0].id;
        }
      }

      if (!customerId) {
        const newCustomer = await stripe.customers.create({
          email: user.email,
          name: profile?.username || user.email?.split('@')[0] || 'ListMe User',
          metadata: {
            supabase_uid: user.id,
          },
        });
        customerId = newCustomer.id;
      }

      try {
        await supabase.auth.updateUser({
          data: { stripe_customer_id: customerId },
        });
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id);
      } catch {
      }
    }

    const configuredPriceOrProduct = (
      process.env.STRIPE_VERIFIED_PRICE_ID || 
      process.env.NEXT_PUBLIC_STRIPE_VERIFIED_PRICE_ID || 
      process.env.STRIPE_VERIFIED_PRODUCT_ID || 
      ''
    ).trim();

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (configuredPriceOrProduct) {
      if (configuredPriceOrProduct.startsWith('price_') || configuredPriceOrProduct.startsWith('plan_')) {
        lineItems = [
          {
            price: configuredPriceOrProduct,
            quantity: 1,
          },
        ];
      } else if (configuredPriceOrProduct.startsWith('prod_')) {
        try {
          const prices = await stripe.prices.list({
            product: configuredPriceOrProduct,
            active: true,
            type: 'recurring',
            limit: 5,
          });

          const monthlyPrice = prices.data.find(p => p.recurring?.interval === 'month');
          if (monthlyPrice) {
            lineItems = [{ price: monthlyPrice.id, quantity: 1 }];
          } else {
            lineItems = [
              {
                price_data: {
                  currency: 'eur',
                  product: configuredPriceOrProduct,
                  unit_amount: 499,
                  recurring: {
                    interval: 'month',
                  },
                },
                quantity: 1,
              },
            ];
          }
        } catch {
          lineItems = [
            {
              price_data: {
                currency: 'eur',
                unit_amount: 499,
                recurring: {
                  interval: 'month',
                },
                product_data: {
                  name: 'ListMe Verified Account Badge',
                  description: 'Monthly Verified Badge subscription — exclusive trust badge on your profile and listings.',
                },
              },
              quantity: 1,
            },
          ];
        }
      } else {
        lineItems = [
          {
            price: configuredPriceOrProduct,
            quantity: 1,
          },
        ];
      }
    } else {
      lineItems = [
        {
          price_data: {
            currency: 'eur',
            unit_amount: 499,
            recurring: {
              interval: 'month',
            },
            product_data: {
              name: 'ListMe Verified Account Badge',
              description: 'Monthly Verified Badge subscription — exclusive trust badge on your profile and listings.',
            },
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: lineItems,
      success_url: `${origin}/my-listme?tab=account&verified_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/my-listme?tab=account&verified_status=cancelled`,
      metadata: {
        userId: user.id,
        type: 'verified_subscription',
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          type: 'verified_subscription',
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Verified subscription checkout error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to initialize subscription checkout.' },
      { status: 500 }
    );
  }
}
