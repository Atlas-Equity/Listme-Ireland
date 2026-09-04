import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const JAVA_BACKEND_URL = process.env.JAVA_BACKEND_URL;

async function createDirectStripeConnect(req: NextRequest, user: any, supabase: any) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }

  const stripe = new Stripe(stripeKey);
  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Fetch user profile to see if they already have a stripe account
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_account_id')
    .eq('id', user.id)
    .single();

  let accountId = profile?.stripe_account_id;

  if (!accountId) {
    // Create new Stripe Express account
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        supabase_uid: user.id,
      },
    });

    accountId = account.id;

    // Save stripe_account_id to profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ stripe_account_id: accountId })
      .eq('id', user.id);

    if (updateError) {
      console.warn('Could not save stripe_account_id to profile:', updateError);
    }
  }

  // Create account onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/stripe-setup`,
    return_url: `${origin}/stripe-setup/success`,
    type: 'account_onboarding',
  });

  return { url: accountLink.url };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Attempt proxying to Java backend with a fast 3-second timeout if configured
    if (JAVA_BACKEND_URL) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          const res = await fetch(`${JAVA_BACKEND_URL}/api/connect`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const text = await res.text();
            try {
              const data = JSON.parse(text);
              if (data?.url) {
                return NextResponse.json(data);
              }
            } catch {
              console.warn('Java backend returned non-JSON, falling back to direct Stripe');
            }
          }
        } catch (backendErr: any) {
          console.warn('Java backend unavailable, switching to direct Stripe handler:', backendErr.message);
        }
      }
    }

    // Direct Stripe Connect onboarding
    const result = await createDirectStripeConnect(req, user, supabase);
    return NextResponse.json(result);

  } catch (err: any) {
    console.error('Connect Handler Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to start Stripe onboarding' },
      { status: 500 }
    );
  }
}
