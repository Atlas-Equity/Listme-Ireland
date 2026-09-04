import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

    const supabase = await createClient();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 });
    }

    let returnUrl = '/my-listme';
    try {
      const body = await req.json();
      if (body?.returnUrl) {
        returnUrl = body.returnUrl;
      }
    } catch {
      // Body may be empty if called without JSON
    }

    // 2. Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    // Look for existing Stripe customer by email if not saved on profile
    if (!customerId) {
      const existingCustomers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (existingCustomers.data && existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      }
    }

    // 3. Create Stripe Customer if none exists
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        name: profile?.username || user.email?.split('@')[0] || 'ListMe User',
        metadata: {
          supabase_uid: user.id
        }
      });
      customerId = customer.id;
    }

    // Attempt to save customerId to Supabase (if column exists)
    try {
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    } catch (e) {
      // Non-blocking if column doesn't exist
    }

    // 4. Generate Checkout Session in 'setup' mode
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const successRedirect = returnUrl.includes('?') 
      ? `${origin}${returnUrl}&wallet_linked=true`
      : `${origin}${returnUrl}?wallet_linked=true`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'setup',
      customer: customerId,
      success_url: successRedirect,
      cancel_url: `${origin}${returnUrl}`,
    });

    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error('Wallet Setup Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
