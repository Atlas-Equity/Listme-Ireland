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

    let plan = 'account';
    let requestedSlug = '';
    try {
      const body = await req.json();
      if (body?.plan === 'bundle' || body?.plan === 'verified_bundle' || body?.plan === 'business_combined') {
        plan = 'bundle';
      } else if (body?.plan === 'page' || body?.plan === 'verified_page') {
        plan = 'page';
      } else {
        plan = 'account';
      }
      if (typeof body?.businessPageSlug === 'string') {
        requestedSlug = body.businessPageSlug.trim().toLowerCase();
      }
    } catch {}

    const isBundle = plan === 'bundle';
    const isPage = plan === 'page';
    let selectedBusinessSlug = '';

    // Guard: prevent re-purchasing account verification if already verified
    if (plan === 'account') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.is_verified || user.user_metadata?.is_verified) {
        return NextResponse.json(
          { error: 'Your personal account is already verified. You can manage your subscription in account settings.' },
          { status: 400 }
        );
      }
    }

    if (isBundle || isPage) {
      return NextResponse.json(
        { error: 'Business page verification is currently disabled.' },
        { status: 400 }
      );
    }

    const productName = 'ListMe Verified Account';
    const productDesc = 'Official Verified Badge on your profile and all listings. 50% off buyer fees and up to €10,000 Buyer Protection.';
    const unitAmount = 999;
    const productImages = [`${origin}/ListMeVerifiedPersonalAccount.png`];

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'eur',
          unit_amount: unitAmount,
          recurring: {
            interval: 'month',
          },
          product_data: {
            name: productName,
            description: productDesc,
            images: productImages,
          },
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: lineItems,
      success_url: `${origin}/my-listme?tab=account&verified_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/verified?status=cancelled`,
      metadata: {
        userId: user.id,
        planType: plan,
        businessPageSlug: selectedBusinessSlug,
        type: 'verified_subscription',
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planType: plan,
          businessPageSlug: selectedBusinessSlug,
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
