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

    // 2. Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    let customerId = profile.stripe_customer_id;

    // 3. Create Stripe Customer if they don't have one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email || user.email,
        name: profile.username || 'ListMe User',
        metadata: {
          supabase_uid: user.id
        }
      });
      customerId = customer.id;

      // Save it to Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error saving Stripe customer ID:', updateError);
        // Note: Even if this fails, we can proceed with the session, but we should log it
      }
    }

    // 4. Generate Checkout Session in 'setup' mode
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'setup',
      customer: customerId,
      success_url: `${origin}/wallet-setup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/my-listme`,
    });

    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error('Wallet Setup Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
