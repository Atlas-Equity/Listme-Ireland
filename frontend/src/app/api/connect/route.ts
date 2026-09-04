import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

async function createDirectStripeConnect(req: NextRequest, user: any, supabase: any) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }

  const stripe = new Stripe(stripeKey);
  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Helper to create a new connected account and save to Supabase profile
  const createNewAccount = async () => {
    let accountId: string;

    // Retrieve platform account country to match supported Express onboarding countries
    let platformCountry = 'IE';
    try {
      const platform = await (stripe.accounts as any).retrieve();
      platformCountry = platform.country || 'IE';
    } catch (e: any) {
      console.warn('Could not retrieve platform country, defaulting to IE:', e.message);
    }

    // Try Accounts v2 first (Stripe requirement for new Connect platforms)
    try {
      const v2Account = await stripe.v2.core.accounts.create({
        contact_email: user.email,
        display_name: user.email?.split('@')[0] || 'Seller',
        identity: { country: platformCountry },
        dashboard: 'express',
        defaults: {
          responsibilities: {
            fees_collector: 'application',
            losses_collector: 'application'
          }
        },
        configuration: {
          merchant: {}
        }
      });
      accountId = v2Account.id;
    } catch (v2Err: any) {
      console.warn('Stripe Accounts v2 creation fallback to Accounts v1:', v2Err.message);
      // Fallback to Accounts v1
      const v1Account = await stripe.accounts.create({
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
      accountId = v1Account.id;
    }

    // Update profile in Supabase
    await supabase
      .from('profiles')
      .update({ stripe_account_id: accountId, stripe_onboarding_complete: false })
      .eq('id', user.id);

    return accountId;
  };

  // Helper to create onboarding link (tries standard accountLinks, then v2 accountLinks)
  const createLinkForAccount = async (accId: string) => {
    try {
      const link = await stripe.accountLinks.create({
        account: accId,
        refresh_url: `${origin}/stripe-setup`,
        return_url: `${origin}/stripe-setup/success`,
        type: 'account_onboarding',
      });
      return link.url;
    } catch (linkErr: any) {
      if ((stripe as any).v2?.core?.accountLinks) {
        try {
          const v2Link = await (stripe as any).v2.core.accountLinks.create({
            account: accId,
            use_case: {
              type: 'account_onboarding',
              account_onboarding: {
                configurations: ['merchant'],
                refresh_url: `${origin}/stripe-setup`,
                return_url: `${origin}/stripe-setup/success`,
              }
            }
          });
          return v2Link.url;
        } catch (v2LinkErr) {
          throw linkErr;
        }
      }
      throw linkErr;
    }
  };

  // Fetch user profile to see if they already have a stripe account
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_account_id')
    .eq('id', user.id)
    .single();

  let accountId = profile?.stripe_account_id;

  // Validate existing account with Stripe if present
  if (accountId) {
    try {
      const existing = await stripe.accounts.retrieve(accountId);
      if (!existing || (existing as any).deleted) {
        accountId = null;
      }
    } catch (retrieveErr: any) {
      console.warn(`Stripe account ${accountId} is invalid or from a different Stripe key. Recreating...`, retrieveErr.message);
      accountId = null;
    }
  }

  if (!accountId) {
    accountId = await createNewAccount();
  }

  // Create account onboarding link with auto-recovery
  try {
    const url = await createLinkForAccount(accountId);
    return { url };
  } catch (linkErr: any) {
    console.warn(`Account link failed for ${accountId}, re-provisioning fresh account:`, linkErr.message);
    const freshAccountId = await createNewAccount();
    const url = await createLinkForAccount(freshAccountId);
    return { url };
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // Direct, resilient Stripe Connect onboarding
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
