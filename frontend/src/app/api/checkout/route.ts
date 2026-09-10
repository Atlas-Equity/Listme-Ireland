import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';
import { calculateServiceFee } from '@/utils/serviceFee';

const JAVA_BACKEND_URL = process.env.JAVA_BACKEND_URL;

async function createDirectCheckoutSession(req: NextRequest, user: any, body: any, supabase: any) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }

  const { listingId } = body;
  if (!listingId) {
    throw new Error('Listing ID is required');
  }

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .single();

  if (listingError || !listing) {
    throw new Error('Listing not found');
  }

  if (listing.seller_id === user.id) {
    throw new Error('Cannot buy your own listing');
  }

  const stripe = new Stripe(stripeKey);
  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const priceInCents = Math.round(Number(listing.price) * 100);
  const feeCalc = calculateServiceFee(Number(listing.price));
  const feeInCents = Math.round(feeCalc.fee * 100);

  const lineItems: any[] = [
    {
      price_data: {
        currency: 'eur',
        product_data: {
          name: listing.title,
          description: listing.description?.substring(0, 200) || undefined,
          images: listing.images && listing.images.length > 0 ? [listing.images[0]] : undefined,
        },
        unit_amount: priceInCents,
      },
      quantity: 1,
    },
  ];

  if (feeInCents > 0) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `Listme Service Fee (${feeCalc.percentageFormatted})`,
          description: 'Platform operation and Buyer Protection coverage up to €5,000.',
        },
        unit_amount: feeInCents,
      },
      quantity: 1,
    });
  }

  let customerId: string | undefined = user.user_metadata?.stripe_customer_id;
  if (!customerId && user.email) {
    try {
      const existing = await stripe.customers.list({ email: user.email, limit: 1 });
      if (existing.data && existing.data.length > 0) {
        customerId = existing.data[0].id;
      }
    } catch {}
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&listing_id=${listing.id}`,
    cancel_url: `${origin}/listing/${listing.id}`,
    metadata: {
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
      service_fee: feeCalc.fee.toString(),
      total_amount: feeCalc.total.toString(),
    },
  };

  if (customerId) {
    sessionParams.customer = customerId;
    sessionParams.saved_payment_method_options = {
      payment_method_save: 'enabled',
    };
    sessionParams.customer_update = {
      name: 'auto',
      address: 'auto',
    };
  } else if (user.email) {
    sessionParams.customer_email = user.email;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return { sessionId: session.id, url: session.url };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Fast check if Java backend is responsive
    if (JAVA_BACKEND_URL) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          const res = await fetch(`${JAVA_BACKEND_URL}/api/checkout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            if (data?.url) return NextResponse.json(data);
          }
        } catch {
          // Java backend not available, fall back to direct Next.js Stripe session
        }
      }
    }

    const result = await createDirectCheckoutSession(req, user, body, supabase);
    return NextResponse.json(result);

  } catch (err: any) {
    console.error('Checkout Error:', err);
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 });
  }
}
