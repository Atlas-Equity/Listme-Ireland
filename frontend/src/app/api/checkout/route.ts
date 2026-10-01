import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
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

async function chargeLinkedCardDirectly(req: NextRequest, user: any, body: any, supabase: any) {
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

  if (listing.status === 'closed') {
    throw new Error('This listing has already closed or been sold.');
  }

  const cards = Array.isArray(user.user_metadata?.linked_cards) && user.user_metadata.linked_cards.length > 0
    ? user.user_metadata.linked_cards
    : (user.user_metadata?.linked_card ? [user.user_metadata.linked_card] : []);
  const linkedCard = cards.find((c: any) => c.isDefault) || cards[0] || null;

  if (!linkedCard) {
    return {
      error: 'No linked card found on your account. Please link a card in My Listme or use Stripe Checkout.',
      requiresCardRelink: true,
    };
  }

  const stripe = new Stripe(stripeKey);
  let customerId: string | undefined = user.user_metadata?.stripe_customer_id;
  let pmId: string | undefined = linkedCard.stripePaymentMethodId;

  if (!customerId && user.email) {
    try {
      const existing = await stripe.customers.list({ email: user.email, limit: 1 });
      if (existing.data && existing.data.length > 0) {
        customerId = existing.data[0].id;
      }
    } catch {}
  }

  if (customerId && !pmId) {
    try {
      const pms = await stripe.paymentMethods.list({ customer: customerId, type: 'card', limit: 1 });
      if (pms.data && pms.data.length > 0) {
        pmId = pms.data[0].id;
      }
    } catch {}
  }

  if (!pmId || !customerId) {
    const cardLast4 = linkedCard.cardNumberBlocks?.[3] || '••••';
    return {
      error: `Your saved card (Visa •• ${cardLast4}) was added prior to Stripe secure vaulting or has expired. Please re-link your card in My Listme to enable 1-click payments, or pay via Stripe Checkout.`,
      requiresCardRelink: true,
    };
  }

  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const priceNum = Number(listing.price);
  const feeCalc = calculateServiceFee(priceNum);
  const totalAmountInCents = Math.round(feeCalc.total * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmountInCents,
    currency: 'eur',
    customer: customerId,
    payment_method: pmId,
    off_session: true,
    confirm: true,
    return_url: `${origin}/payment-success?listing_id=${listing.id}&payment_intent_id={PAYMENT_INTENT_ID}`,
    description: `Listme Purchase: ${listing.title}`,
    metadata: {
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
      service_fee: feeCalc.fee.toString(),
      total_amount: feeCalc.total.toString(),
    },
  });

  if (paymentIntent.status === 'succeeded') {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminDb = (serviceRoleKey && process.env.NEXT_PUBLIC_SUPABASE_URL)
      ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey)
      : supabase;

    await adminDb
      .from('listings')
      .update({ status: 'closed' })
      .eq('id', listing.id);

    try {
      const cardLast4 = linkedCard.cardNumberBlocks?.[3] || '••••';
      const buyerName = user.user_metadata?.full_name || user.user_metadata?.username || 'Buyer';

      let convId: string | null = null;
      const { data: convs } = await adminDb
        .from('conversations')
        .select('id')
        .eq('listing_id', listing.id)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .limit(1);

      if (convs && convs.length > 0) {
        convId = convs[0].id;
      } else {
        const { data: newConv } = await adminDb
          .from('conversations')
          .insert({
            listing_id: listing.id,
            buyer_id: user.id,
            seller_id: listing.seller_id,
            last_message: `Payment of €${feeCalc.total.toFixed(2)} completed!`,
          })
          .select('id')
          .single();
        if (newConv) convId = newConv.id;
      }

      if (convId) {
        await adminDb.from('messages').insert({
          conversation_id: convId,
          sender_id: user.id,
          content: `Payment confirmed! ${buyerName} purchased "${listing.title}" for €${feeCalc.total.toFixed(2)} using Linked Card (Visa •• ${cardLast4}). Covered by Listme Buyer Protection (Up to €5,000). You can now arrange delivery or collection.`,
          is_read: false,
        });
      }
    } catch (msgErr) {
      console.error('Non-critical error logging purchase message:', msgErr);
    }

    return {
      success: true,
      instant: true,
      url: `${origin}/payment-success?listing_id=${listing.id}&payment_intent_id=${paymentIntent.id}`,
    };
  }

  if (paymentIntent.status === 'requires_action' && paymentIntent.next_action?.redirect_to_url?.url) {
    return {
      success: true,
      requiresAction: true,
      url: paymentIntent.next_action.redirect_to_url.url,
    };
  }

  return {
    error: 'Card authorization could not be completed. Please try another card or payment method.',
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // 1. Direct charge via saved card if requested
    if (body.useLinkedCard) {
      const chargeResult = await chargeLinkedCardDirectly(req, user, body, supabase);
      if (chargeResult.error) {
        return NextResponse.json(chargeResult, { status: 400 });
      }
      return NextResponse.json(chargeResult);
    }

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
