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

    if (isBundle || isPage) {
      const userPages: { slug: string; name: string }[] = [];
      const metaPages = (user.user_metadata?.business_pages || []) as any[];
      for (const p of metaPages) {
        if (p?.slug) {
          userPages.push({ slug: p.slug.toLowerCase(), name: p.name || p.slug });
        }
      }

      try {
        const { data: dbPages } = await supabase
          .from('business_pages')
          .select('slug, name')
          .eq('owner_id', user.id);

        if (Array.isArray(dbPages)) {
          for (const p of dbPages) {
            if (p?.slug && !userPages.some((existing) => existing.slug === p.slug.toLowerCase())) {
              userPages.push({ slug: p.slug.toLowerCase(), name: p.name || p.slug });
            }
          }
        }
      } catch {}

      if (userPages.length === 0) {
        return NextResponse.json(
          { error: 'An active Business Page is required to sign up for this subscription.' },
          { status: 400 }
        );
      }

      if (requestedSlug) {
        const matched = userPages.find((p) => p.slug === requestedSlug);
        if (!matched) {
          return NextResponse.json(
            { error: 'The selected Business Page was not found on your account.' },
            { status: 400 }
          );
        }
        selectedBusinessSlug = matched.slug;
      } else if (userPages.length === 1) {
        selectedBusinessSlug = userPages[0].slug;
      } else {
        return NextResponse.json(
          { error: 'Please select which Business Page you want to verify.' },
          { status: 400 }
        );
      }
    }

    let productName = 'ListMe Verified Account';
    let productDesc = 'Official Verified Badge on your profile and all listings. 50% off buyer fees and up to €10,000 Buyer Protection.';
    let unitAmount = 999;
    let productImages = [`${origin}/ListMeVerifiedPersonalAccount.png`];

    if (isBundle) {
      productName = 'ListMe Verified Account + Verified Page Bundle';
      productDesc = 'Official Verified Badge on your profile, all listings, and your Business Page storefront. Best value bundle.';
      unitAmount = 1999;
      productImages = [`${origin}/ListMeVerifiedBundle.png`];
    } else if (isPage) {
      productName = 'ListMe Verified Page';
      productDesc = 'Official Verified Badge and priority ranking for your Business Page storefront.';
      unitAmount = 1499;
      productImages = [`${origin}/ListMeBusinessVerifiedPage.png`];
    }

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
