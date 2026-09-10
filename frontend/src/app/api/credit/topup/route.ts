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
    const useSavedCard = body.useSavedCard === true;

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

    // 1. Look up or create Stripe Customer for user
    let customerId: string | undefined = user.user_metadata?.stripe_customer_id;

    if (!customerId) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('stripe_customer_id')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.stripe_customer_id) {
          customerId = profile.stripe_customer_id;
        }
      } catch (profileErr) {
        console.warn('Could not query profiles for stripe_customer_id:', profileErr);
      }
    }

    if (!customerId && user.email) {
      try {
        const existingCustomers = await stripe.customers.list({ email: user.email, limit: 10 });
        if (existingCustomers.data && existingCustomers.data.length > 0) {
          // Prioritize the customer with a default payment method or existing cards
          let bestCustomer = existingCustomers.data[0];
          for (const cust of existingCustomers.data) {
            if (cust.invoice_settings?.default_payment_method) {
              bestCustomer = cust;
              break;
            }
            const pms = await stripe.paymentMethods.list({ customer: cust.id, type: 'card', limit: 1 });
            if (pms.data && pms.data.length > 0) {
              bestCustomer = cust;
              break;
            }
          }
          customerId = bestCustomer.id;
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

        // Persist resolved customerId to user_metadata and profiles
        if (customerId) {
          await supabase.auth.updateUser({
            data: { stripe_customer_id: customerId },
          });
          try {
            await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
          } catch {}
        }
      } catch (custErr) {
        console.warn('Could not retrieve or create Stripe customer:', custErr);
      }
    }

    // 2. Resolve saved payment method from Stripe or user_metadata
    let savedPaymentMethodId: string | undefined = user.user_metadata?.linked_card?.stripePaymentMethodId;

    if (customerId) {
      try {
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const defaultPm = customer.invoice_settings?.default_payment_method;

        if (defaultPm) {
          savedPaymentMethodId = typeof defaultPm === 'string' ? defaultPm : defaultPm.id;
        }

        if (!savedPaymentMethodId) {
          const pms = await stripe.paymentMethods.list({ customer: customerId, type: 'card', limit: 5 });
          if (pms.data && pms.data.length > 0) {
            savedPaymentMethodId = pms.data[0].id;
            // Set as default for customer
            await stripe.customers.update(customerId, {
              invoice_settings: { default_payment_method: savedPaymentMethodId },
            });
          }
        }

        // If a payment method was found in Stripe, sync it into Supabase user_metadata if missing
        if (savedPaymentMethodId && !user.user_metadata?.linked_card?.stripePaymentMethodId) {
          try {
            const pmObj = await stripe.paymentMethods.retrieve(savedPaymentMethodId);
            if (pmObj?.card) {
              const currentLinked = user.user_metadata?.linked_card || {};
              const brand = (pmObj.card.brand || 'VISA').toUpperCase();
              const last4 = pmObj.card.last4;
              const expMonth = String(pmObj.card.exp_month).padStart(2, '0');
              const expYear = String(pmObj.card.exp_year).slice(-2);

              await supabase.auth.updateUser({
                data: {
                  linked_card: {
                    ...currentLinked,
                    brand,
                    cardNickname: currentLinked.cardNickname || `${brand} •• ${last4}`,
                    cardNumberBlocks: ['••••', '••••', '••••', last4],
                    expiry: `${expMonth}/${expYear}`,
                    cvvMasked: '•••',
                    stripePaymentMethodId: savedPaymentMethodId,
                    isStripeVaulted: true,
                    updatedAt: new Date().toISOString(),
                  },
                },
              });
            }
          } catch (syncErr) {
            console.warn('Could not sync payment method details to user_metadata:', syncErr);
          }
        }
      } catch (e) {
        console.warn('Could not fetch saved payment method for customer:', e);
      }
    }

    // 3. If 1-click instant charge requested and saved card is present
    if (useSavedCard && customerId && savedPaymentMethodId) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: 'eur',
          customer: customerId,
          payment_method: savedPaymentMethodId,
          off_session: true,
          confirm: true,
          return_url: `${origin}/my-listme?tab=account&topup_success=true&topup_amount=${amount}`,
          description: `Listme Account Credit Top-Up (€${amount.toFixed(2)})`,
          metadata: {
            type: 'account_credit_topup',
            userId: user.id,
            amount: amount.toString(),
          },
        });

        if (paymentIntent.status === 'succeeded') {
          const currentCredit = typeof user.user_metadata?.account_credit === 'number'
            ? user.user_metadata.account_credit
            : 0;
          const newCredit = Math.round((currentCredit + amount) * 100) / 100;
          const processedList = user.user_metadata?.processed_topup_sessions || [];

          await supabase.auth.updateUser({
            data: {
              account_credit: newCredit,
              processed_topup_sessions: [...processedList, paymentIntent.id],
            },
          });

          return NextResponse.json({
            success: true,
            instant: true,
            newCredit,
            amount,
            message: `Charged €${amount.toFixed(2)} directly to your saved card! Funds added to your Listme credit instantly.`,
          });
        }

        // If bank requires 3D Secure verification:
        if (paymentIntent.status === 'requires_action' && paymentIntent.next_action?.redirect_to_url?.url) {
          return NextResponse.json({
            requiresAction: true,
            url: paymentIntent.next_action.redirect_to_url.url,
          });
        }
      } catch (intentErr: any) {
        console.warn('Direct charge failed, falling back to Stripe Checkout:', intentErr.message);
        // If card declined or expired, provide actionable feedback
        if (intentErr.code === 'card_declined' || intentErr.code === 'expired_card') {
          return NextResponse.json({
            error: `Saved card was declined: ${intentErr.message}. Please use Stripe Checkout to update your card.`,
            canFallbackCheckout: true,
          }, { status: 400 });
        }
      }
    }

    // 4. Generate Stripe Checkout session (pre-populated with customer and saved card enabled)
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Listme Account Credit Top-Up',
              description: `Deposit €${amount.toFixed(2)} into Listme Account Credit. Protected by Buyer Protection.`,
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

    const firstTimeVault = useSavedCard && !savedPaymentMethodId;
    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      firstTimeVault,
      message: firstTimeVault
        ? 'Your card details need a one-time Stripe verification. Enter your card once in Stripe Checkout, and it will be saved permanently for future 1-click top-ups.'
        : undefined,
    });
  } catch (err: any) {
    console.error('Credit Top-Up Session Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to initialize Stripe checkout.' }, { status: 500 });
  }
}
