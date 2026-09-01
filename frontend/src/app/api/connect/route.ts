import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 });
    }

    // 2. Fetch user profile to see if they already have an account ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_account_id, account_type')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    let accountId = profile.stripe_account_id;

    // 3. Create Stripe Express Account if they don't have one
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        country: "IE",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;

      // Save it to Supabase
      // Using service role client if needed, but since it's the user's own profile, RLS should allow update
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error saving Stripe account ID:', updateError);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
      }
      
      // Delay to allow Stripe Test Mode to replicate the v2 account to v1 endpoints
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 4. Generate Account Link (Onboarding URL)
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/api/connect/refresh`,
      return_url: `${origin}/stripe-setup/success`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });

  } catch (err: any) {
    console.error('Stripe Connect Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
