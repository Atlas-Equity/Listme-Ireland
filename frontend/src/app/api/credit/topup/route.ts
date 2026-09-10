import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in to top up credit.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const amount = typeof body.amount === 'number' ? body.amount : parseFloat(body.amount);

    if (isNaN(amount) || amount < 1) {
      return NextResponse.json({ error: 'Minimum top-up amount is €1.00.' }, { status: 400 });
    }

    if (amount > 5000) {
      return NextResponse.json({ error: 'Maximum top-up amount per transaction is €5,000.00.' }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({
        error: 'STRIPE_SECRET_KEY is not configured in this environment.',
        unconfigured: true,
      }, { status: 400 });
    }

    const stripe = new Stripe(stripeKey);
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const amountInCents = Math.round(amount * 100);

    // Look up or link Stripe Customer
    let customerId: string | undefined;
    if (user.email) {
      try {
        const existingCustomers = await stripe.customers.list({ email: user.email, limit: 1 });
        if (existingCustomers.data && existingCustomers.data.length > 0) {
          customerId = existingCustomers.data[0].id;
        } else {
          const newCustomer = await stripe.customers.create({
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.username || user.email.split('@')[0],
            metadata: {
              supabase_uid: user.id,
            },
          });
          customerId = newCustomer.id;
        }
      } catch (custErr) {
        console.warn('Could not retrieve or create Stripe customer, proceeding without customer ID:', custErr);
      }
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Listme Account Credit Top-Up',
              description: `Add €${amount.toFixed(2)} to your Listme Account Credit. 100% secure card transaction protected by Listme Buyer Protection.`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/my-listme?tab=account&topup_session_id={CHECKOUT_SESSION_ID}&topup_amount=${amount}`,
      cancel_url: `${origin}/my-listme?tab=account&topup_status=cancelled`,
      metadata: {
        type: 'account_credit_topup',
        userId: user.id,
        userEmail: user.email || '',
        amount: amount.toString(),
      },
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else if (user.email) {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error('Credit Top-Up Session Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to initialize Stripe checkout.' }, { status: 500 });
  }
}
