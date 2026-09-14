import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        { error: 'Stripe Secret Key is not configured.' },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = new Stripe(stripeKey);
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    let customerId = user.user_metadata?.stripe_customer_id;
    if (!customerId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .maybeSingle();
      customerId = profile?.stripe_customer_id;
    }

    if (!customerId && user.email) {
      const existing = await stripe.customers.list({ email: user.email, limit: 1 });
      if (existing.data && existing.data.length > 0) {
        customerId = existing.data[0].id;
      }
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'No active Stripe billing profile found for your account.' },
        { status: 404 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/my-listme?tab=account`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: any) {
    console.error('Customer portal error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to open customer billing portal.' },
      { status: 500 }
    );
  }
}
