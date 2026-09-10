'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  CreditCard, 
  Coins, 
  ShieldCheck, 
  Lock, 
  ExternalLink, 
  X, 
  CheckCircle2 
} from 'lucide-react';
import { calculateServiceFee } from '@/utils/serviceFee';
import { 
  getUserPaymentStateAction, 
  payForListingAction, 
  LinkedCardData 
} from '@/app/my-listme/actions';

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

  // User payment state
  const [credit, setCredit] = useState(0);
  const [linkedCard, setLinkedCard] = useState<LinkedCardData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'account_credit' | 'stripe'>('stripe');

  const numericPrice = typeof price === 'number' ? price : 0;
  const feeCalc = calculateServiceFee(numericPrice);
  const totalAmount = feeCalc.total;

  const handleOpenCheckout = async () => {
    if (isAuction) {
      alert('Please place a bid using the auction bidding form.');
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

      setCredit(state.credit || 0);
      setLinkedCard(state.linkedCard || null);

      // Default to Account Credit if balance covers the total, otherwise Stripe Card
      if (state.credit >= totalAmount) {
        setSelectedMethod('account_credit');
      } else {
        setSelectedMethod('stripe');
      }

      setIsOpen(true);
    } catch {
      setErrorMessage('Could not load payment options. Please try again.');
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      if (selectedMethod === 'stripe') {
        // Real card payment processed by Stripe Gateway
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId }),
        });

        const data = await res.json();
        if (!res.ok || !data.url) {
          throw new Error(data.error || 'Failed to initialize Stripe checkout session.');
        }

        // Redirect to Stripe's secure payment page to charge real card
        window.location.href = data.url;
        return;
      }

      // Process via Listme Account Credit
      const res = await payForListingAction(listingId, 'account_credit');
      if (res.error) {
        setErrorMessage(res.error);
        setSubmitting(false);
        return;
      }

      // Success -> Redirect to payment success page
      router.push(`/payment-success?listing_id=${listingId}`);
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

      {/* Payment Selection Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-5">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  Checkout &amp; Payment
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Select your preferred payment method to complete purchase.
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
              <div className="mb-4 p-3 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Order Breakdown Card */}
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

            {/* Form & Payment Options */}
            <form onSubmit={handleConfirmPayment} className="space-y-3">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Select Payment Method
              </label>

              {/* Option 1: Credit / Debit Card (Powered by Stripe) */}
              <div
                onClick={() => setSelectedMethod('stripe')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  selectedMethod === 'stripe'
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-2xs'
                    : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-zinc-800 text-primary flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <span>Credit / Debit Card (Stripe)</span>
                        <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">Real Money</span>
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        {linkedCard ? `${linkedCard.cardNickname} (Visa •• ${cardLast4}) or any card` : 'Visa, Mastercard, Apple Pay, Google Pay'}
                      </div>
                    </div>
                  </div>

                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={selectedMethod === 'stripe'}
                    onChange={() => setSelectedMethod('stripe')}
                    className="w-4 h-4 text-primary"
                  />
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 pl-12">
                  Processed securely by Stripe. Instant charge from your card with full Buyer Protection.
                </p>
              </div>

              {/* Option 2: Listme Account Credit */}
              <div
                onClick={() => setSelectedMethod('account_credit')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedMethod === 'account_credit'
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-2xs'
                    : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-zinc-800 text-primary flex items-center justify-center shrink-0">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white">
                      Listme Account Credit
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      Balance: €{credit.toFixed(2)} {credit >= totalAmount ? '(Sufficient balance)' : '(Insufficient balance)'}
                    </div>
                  </div>
                </div>

                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedMethod === 'account_credit'}
                  onChange={() => setSelectedMethod('account_credit')}
                  className="w-4 h-4 text-primary"
                />
              </div>

              {/* Buyer Protection Banner */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2.5 mt-4">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Listme Buyer Protection:</strong> Eligible for refund up to €5,000 if the item doesn&apos;t arrive or is faulty.
                </span>
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800 mt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || (selectedMethod === 'account_credit' && credit < totalAmount)}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    Pay €{totalAmount.toFixed(2)} Now
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

