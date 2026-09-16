import React from 'react';
import Link from 'next/link';
import Stripe from 'stripe';
import { CheckCircle2, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; listing_id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const sessionId = resolvedParams.session_id;
  let listingId = resolvedParams.listing_id;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminDb = (serviceRoleKey && process.env.NEXT_PUBLIC_SUPABASE_URL)
    ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey)
    : supabase;

  let stripeVerified = false;
  let totalPaid: number | null = null;
  let listingTitle = 'Listing';
  let paymentMethodDesc = 'Card Payment (Stripe)';

  if (sessionId) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      try {
        const stripe = new Stripe(stripeKey);
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
          stripeVerified = true;
          totalPaid = session.amount_total ? session.amount_total / 100 : null;
          if (session.metadata?.listing_id && !listingId) {
            listingId = session.metadata.listing_id;
          }
          paymentMethodDesc = 'Stripe Verified Card Payment';
        }
      } catch (err) {
        console.error('Error verifying Stripe session on success page:', err);
      }
    } else {
      stripeVerified = true;
    }
  }

  if (listingId) {
    try {
      const { data: listing } = await adminDb
        .from('listings')
        .select('id, title, price, seller_id, status')
        .eq('id', listingId)
        .single();

      if (listing) {
        listingTitle = listing.title;
        if (!totalPaid) {
          totalPaid = Number(listing.price) || 0;
        }

        if (listing.status !== 'closed') {
          await adminDb
            .from('listings')
            .update({ status: 'closed' })
            .eq('id', listing.id);

          if (user && listing.seller_id !== user.id) {
            try {
              let convId: string | null = null;
              const { data: existingConvs } = await adminDb
                .from('conversations')
                .select('id')
                .eq('listing_id', listing.id)
                .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
                .limit(1);

              if (existingConvs && existingConvs.length > 0) {
                convId = existingConvs[0].id;
              } else {
                const { data: newConv } = await adminDb
                  .from('conversations')
                  .insert({
                    listing_id: listing.id,
                    buyer_id: user.id,
                    seller_id: listing.seller_id,
                    last_message: `Payment of €${(totalPaid || 0).toFixed(2)} confirmed!`,
                  })
                  .select('id')
                  .single();
                if (newConv) convId = newConv.id;
              }

              if (convId) {
                const buyerName = user.user_metadata?.full_name || user.user_metadata?.username || 'Buyer';
                await adminDb.from('messages').insert({
                  conversation_id: convId,
                  sender_id: user.id,
                  content: `Payment confirmed! ${buyerName} completed purchase for "${listing.title}" (€${(totalPaid || 0).toFixed(2)}) via Stripe card payment. Transaction covered by Listme Buyer Protection (Up to €5,000). You can now arrange delivery or collection.`,
                  is_read: false,
                });
              }
            } catch (chatErr) {
              console.error('Non-critical error creating purchase confirmation chat message:', chatErr);
            }
          }
        }
      }
    } catch (dbErr) {
      console.error('Error updating listing on payment success:', dbErr);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white p-4 py-12">
      <div className="max-w-lg w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 text-center shadow-xl">
        
        
        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-gray-200 dark:border-zinc-700">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          Payment Successful!
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          Your payment has been securely processed. The listing has been marked as sold and the seller has been notified to arrange delivery or pick-up.
        </p>

        
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 mb-6 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-zinc-800">
            <span className="font-semibold text-gray-500 dark:text-gray-400">Item</span>
            <span className="font-bold text-gray-900 dark:text-white truncate max-w-[220px]">
              {listingTitle}
            </span>
          </div>

          {totalPaid !== null && (
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-500 dark:text-gray-400">Total Paid</span>
              <span className="font-mono font-black text-primary text-sm">
                €{totalPaid.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-500 dark:text-gray-400">Payment Gateway</span>
            <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-primary" />
              {paymentMethodDesc}
            </span>
          </div>

          {sessionId && (
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-zinc-800 text-[11px]">
              <span className="text-gray-400">Reference ID</span>
              <span className="font-mono text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                {sessionId.slice(0, 18)}...
              </span>
            </div>
          )}
        </div>

        
        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-left flex items-start gap-2.5 mb-6 text-xs text-gray-600 dark:text-gray-400">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>
            <strong>Listme Buyer Protection:</strong> You are fully covered up to €5,000 against non-delivery or items not matching descriptions.
          </span>
        </div>

        
        <div className="space-y-3">
          {listingId && (
            <>
              <Link 
                href={`/leave-review/${listingId}`}
                className="w-full flex items-center justify-center py-2.5 px-4 bg-primary hover:bg-green-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
              >
                Leave a Review for Seller
              </Link>
              <Link 
                href={`/listing/${listingId}`}
                className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl transition-colors shadow-2xs"
              >
                View Listing Details
              </Link>
            </>
          )}
          
          <Link 
            href="/"
            className="w-full flex items-center justify-center py-2.5 px-4 text-xs font-bold text-[#0073e6] hover:underline transition-colors"
          >
            Continue Shopping <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

      </div>
    </div>
  );
}
