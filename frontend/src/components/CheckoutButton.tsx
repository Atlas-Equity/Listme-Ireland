'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, 
  CreditCard, 
  ShieldCheck, 
  X, 
  CheckCircle2 
} from 'lucide-react';
import { calculateServiceFee } from '@/utils/serviceFee';
import { emitToast } from '@/context/ToastContext';
import { 
  getUserPaymentStateAction, 
  LinkedCardData 
} from '@/app/my-listme/actions';
import { StripeLogo, StripeBadge } from '@/components/StripeLogo';

interface CheckoutButtonProps {
  listingId: string;
  isAuction: boolean;
  stripeEnabled: boolean;
  listingTitle?: string;
  price?: number;
}

export default function CheckoutButton({ 
  listingId, 
  isAuction, 
  stripeEnabled, 
  listingTitle = 'Listing', 
  price = 0 
}: CheckoutButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canFallbackStripe, setCanFallbackStripe] = useState(false);
  const [useLinkedCard, setUseLinkedCard] = useState(true);

  const [linkedCard, setLinkedCard] = useState<LinkedCardData | null>(null);

  const numericPrice = typeof price === 'number' ? price : 0;
  const feeCalc = calculateServiceFee(numericPrice, false);
  const totalAmount = feeCalc.total;

  const handleOpenCheckout = async () => {
    if (isAuction) {
      emitToast('Please place a bid using the auction bidding form.', 'info');
      return;
    }

    setLoadingInitial(true);
    setErrorMessage(null);

    try {
      const state = await getUserPaymentStateAction();

      if (!state.isLoggedIn) {
        router.push(`/login?next=/listing/${listingId}`);
        return;
      }

      setLinkedCard(state.linkedCard || null);
      setIsOpen(true);
    } catch {
      setErrorMessage('Could not load payment options. Please try again.');
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleConfirmPayment = async (e?: React.FormEvent, forceStripeCheckout: boolean = false) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setCanFallbackStripe(false);
    setSubmitting(true);

    const chargeSavedCard = !forceStripeCheckout && useLinkedCard && Boolean(linkedCard);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          listingId,
          useLinkedCard: chargeSavedCard,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.requiresCardRelink) {
          setCanFallbackStripe(true);
        }
        throw new Error(data.error || 'Failed to process payment.');
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error('Unable to complete payment transaction.');
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during payment.');
      setSubmitting(false);
    }
  };

  const cardLast4 = linkedCard?.cardNumberBlocks?.[3] || '••••';

  return (
    <>
      <button 
        type="button"
        onClick={handleOpenCheckout}
        disabled={loadingInitial}
        className="w-full py-3 px-4 bg-[#0073e6] hover:bg-[#005bb5] text-white font-bold rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-xs"
      >
        {loadingInitial ? (
          <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading options...</>
        ) : (
          isAuction ? 'Place bid' : 'Buy Now'
        )}
      </button>

      {/* Checkout Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-5">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  Checkout &amp; Payment
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Complete your purchase securely with Buyer Protection.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-800 dark:text-red-200 space-y-2.5">
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5"></span>
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
                {canFallbackStripe && (
                  <div className="flex items-center gap-2 pt-2 border-t border-red-200/60 dark:border-red-900/40">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleConfirmPayment(undefined, true)}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                    >
                      Pay via Stripe Checkout
                    </button>
                    <Link
                      href="/my-listme?tab=account"
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      Re-link Card in My Listme
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 mb-6 space-y-2 text-xs">
              <div className="font-bold text-sm text-gray-900 dark:text-white truncate mb-2">
                {listingTitle}
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Item Price</span>
                <span className="font-semibold text-gray-900 dark:text-white font-mono">€{numericPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  Service Fee ({feeCalc.percentageFormatted})
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                </span>
                <span className="font-semibold text-gray-900 dark:text-white font-mono">€{feeCalc.fee.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-zinc-800 flex justify-between text-sm font-black text-gray-900 dark:text-white">
                <span>Total to Pay</span>
                <span className="text-base text-primary font-mono">€{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Details */}
            <form onSubmit={(e) => handleConfirmPayment(e, !useLinkedCard)} className="space-y-4">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Payment Method
              </label>

              {linkedCard ? (
                <div className="space-y-2.5">
                  {/* Option 1: Saved Linked Card */}
                  <div
                    onClick={() => { setUseLinkedCard(true); setErrorMessage(null); setCanFallbackStripe(false); }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      useLinkedCard
                        ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-xs'
                        : 'border-gray-200 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-900/40 hover:border-gray-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-[#635BFF] flex items-center justify-center shrink-0 shadow-2xs">
                          <CreditCard className="w-5 h-5 text-[#635BFF]" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span>{linkedCard.cardNickname || 'Linked Card'}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                              1-Click Instant
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Visa ending in {cardLast4}
                          </div>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        useLinkedCard
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                      }`}>
                        {useLinkedCard && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 pl-13">
                      <span>Instant charge to your saved card • No external checkout redirect</span>
                    </div>
                  </div>

                  {/* Option 2: Pay with Other Card / Apple Pay */}
                  <div
                    onClick={() => { setUseLinkedCard(false); setErrorMessage(null); setCanFallbackStripe(false); }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      !useLinkedCard
                        ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-xs'
                        : 'border-gray-200 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-900/40 hover:border-gray-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0 shadow-2xs">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span>Other Card / Apple Pay</span>
                            <StripeBadge variant="pill" size="sm" />
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Visa, Mastercard, &amp; Apple Pay via Stripe
                          </div>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        !useLinkedCard
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                      }`}>
                        {!useLinkedCard && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 pl-13">
                      <span>Processed securely by</span>
                      <StripeLogo height={12} variant="blurple" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/60 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-[#635BFF] flex items-center justify-center shrink-0 shadow-2xs">
                        <CreditCard className="w-5 h-5 text-[#635BFF]" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <span>Credit / Debit Card</span>
                          <StripeBadge variant="pill" size="sm" />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Visa, Mastercard, &amp; Apple Pay
                        </div>
                      </div>
                    </div>

                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 pl-13">
                    <span>Processed securely by</span>
                    <StripeLogo height={12} variant="blurple" />
                    <span>• Full Buyer Protection</span>
                  </div>
                </div>
              )}

              {/* Buyer Protection Guarantee Notice */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Listme Buyer Protection:</strong> Eligible for refund up to €5,000 if the item doesn&apos;t arrive or is not as described.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800 mt-5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {useLinkedCard && linkedCard ? `Pay €${totalAmount.toFixed(2)} with Linked Card` : `Pay €${totalAmount.toFixed(2)} Now`}
                  </span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}
