import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js'; // We can use the service role key or anon key to fetch public listing

// Initialize Stripe (requires STRIPE_SECRET_KEY in .env.local)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-01-27.acacia' as any, // Bypass strict type check
});

// Initialize Supabase admin client to reliably fetch listing details
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const { listingId } = await req.json();

    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured on this server.' }, { status: 500 });
    }

    // Fetch the listing details from Supabase
    const { data: listing, error } = await supabaseAdmin
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (error || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Verify Stripe is accepted
    const paymentOptions = Array.isArray(listing.payment_options) ? listing.payment_options : [];
    if (!paymentOptions.includes('stripe')) {
      return NextResponse.json({ error: 'This listing does not accept Stripe payments.' }, { status: 400 });
    }

    // Fetch the seller's profile to get their Stripe Account ID
    const { data: sellerProfile, error: sellerError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', listing.seller_id)
      .single();

    if (sellerError || !sellerProfile?.stripe_account_id) {
      return NextResponse.json({ error: 'The seller has not set up their bank account to receive payments.' }, { status: 400 });
    }

    // Determine the price (Stripe expects integer cents)
    const priceInCents = Math.round(listing.price * 100);

    // Get the base URL for redirecting
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Check if the seller's Stripe account is fully onboarded
    const sellerStripeAccount = await stripe.accounts.retrieve(sellerProfile.stripe_account_id);
    if (!sellerStripeAccount.charges_enabled || sellerStripeAccount.capabilities?.transfers !== 'active') {
      return NextResponse.json({ 
        error: 'The seller has not fully completed their Stripe onboarding. They cannot receive payments yet.' 
      }, { status: 400 });
    }

    // Set up images if any exist
    const images = listing.images && listing.images.length > 0 ? [listing.images[0]] : [];

    // Calculate 1% platform fee (in cents)
    const applicationFee = Math.round(priceInCents * 0.01);

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: listing.title,
              description: listing.description ? listing.description.substring(0, 255) : undefined,
              images: images,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: sellerProfile.stripe_account_id,
        },
      },
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&listing_id=${listingId}`,
      cancel_url: `${origin}/listing/${listingId}?canceled=true`,
      metadata: {
        listing_id: listingId,
        seller_id: listing.seller_id,
      },
    });

    // Return the session URL
    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error('Checkout Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
