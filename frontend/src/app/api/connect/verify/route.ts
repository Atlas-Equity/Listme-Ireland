import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

export async function POST() {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ verified: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_account_id) {
      return NextResponse.json({ verified: false, error: 'No Stripe account found' });
    }

    const account = await stripe.accounts.retrieve(profile.stripe_account_id);

    if (account.charges_enabled && account.details_submitted) {
      await supabase
        .from('profiles')
        .update({ stripe_onboarding_complete: true })
        .eq('id', user.id);

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false, error: 'Stripe onboarding not complete' });

  } catch (err: any) {
    console.error('Stripe Verify Error:', err);
    return NextResponse.json({ verified: false, error: err.message }, { status: 500 });
  }
}
