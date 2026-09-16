'use server';

import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

export async function createStripeConnectAction() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return { error: 'STRIPE_SECRET_KEY is not configured on the server.' };
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized. Please log in.' };
  }

  try {
    const stripe = new Stripe(stripeKey);
    const headerList = await headers();
    const origin = headerList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.listme.ie';

    const createNewAccount = async () => {
      let accountId: string;

      let platformCountry = 'IE';
      try {
        const platform = await (stripe.accounts as any).retrieve();
        platformCountry = platform.country || 'IE';
      } catch (e: any) {
        console.warn('Could not retrieve platform country, defaulting to IE:', e.message);
      }

      try {
        const v2Account = await stripe.v2.core.accounts.create({
          contact_email: user.email,
          display_name: user.user_metadata?.username || user.email?.split('@')[0] || 'Seller',
          identity: { country: platformCountry },
          dashboard: 'express',
          defaults: {
            responsibilities: {
              fees_collector: 'application',
              losses_collector: 'application',
            },
          },
          configuration: {
            merchant: {},
          },
        });
        accountId = v2Account.id;
      } catch (v2Err: any) {
        console.warn('Accounts v2 fallback to v1:', v2Err.message);
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

      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          stripe_account_id: accountId,
          stripe_onboarding_complete: false,
          email: user.email,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      return accountId;
    };

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
          const v2Link = await (stripe as any).v2.core.accountLinks.create({
            account: accId,
            use_case: {
              type: 'account_onboarding',
              account_onboarding: {
                configurations: ['merchant'],
                refresh_url: `${origin}/stripe-setup`,
                return_url: `${origin}/stripe-setup/success`,
              },
            },
          });
          return v2Link.url;
        }
        throw linkErr;
      }
    };

    // Check existing stripe account ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', user.id)
      .maybeSingle();

    let accountId = profile?.stripe_account_id;

    if (accountId) {
      try {
        const existing = await stripe.accounts.retrieve(accountId);
        if (!existing || (existing as any).deleted) {
          accountId = null;
        }
      } catch (retrieveErr: any) {
        console.warn(`Stripe account ${accountId} invalid, recreating:`, retrieveErr.message);
        accountId = null;
      }
    }

    if (!accountId) {
      accountId = await createNewAccount();
    }

    try {
      const url = await createLinkForAccount(accountId);
      return { url };
    } catch (linkErr: any) {
      console.warn(`Account link failed for ${accountId}, retrying fresh account:`, linkErr.message);
      const freshAccountId = await createNewAccount();
      const url = await createLinkForAccount(freshAccountId);
      return { url };
    }
  } catch (err: any) {
    console.error('createStripeConnectAction error:', err);
    return { error: err.message || 'Failed to start Stripe onboarding' };
  }
}
