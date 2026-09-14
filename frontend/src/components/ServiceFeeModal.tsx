'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Info, X, ShieldCheck, Sparkles } from 'lucide-react';
import { calculateServiceFee, SERVICE_FEE_TIERS } from '@/utils/serviceFee';

interface ServiceFeeModalProps {
  price: number | string;
  buyNowPrice?: number | string | null;
  isAuction?: boolean;
  className?: string;
}

export default function ServiceFeeModal({ 
  price, 
  buyNowPrice, 
  isAuction = false, 
  className 
}: ServiceFeeModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const numericBuyNow = buyNowPrice !== undefined && buyNowPrice !== null ? Number(buyNowPrice) : null;
  const isMixed = isAuction && numericBuyNow !== null && numericBuyNow > 0;

  const primaryFeeCalc = calculateServiceFee(price);
  const buyNowFeeCalc = numericBuyNow ? calculateServiceFee(numericBuyNow) : null;

  return (
    <>
      {/* Clickable Trigger on Listing */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center text-xs sm:text-sm text-[#0073e6] hover:underline cursor-pointer transition-colors text-left ${className || ''}`}
        title="View Service Fee breakdown"
      >
        <Info className="w-4 h-4 mr-1.5 shrink-0 text-[#0073e6]" />
        {isMixed && buyNowFeeCalc ? (
          <span className="leading-snug">
            Auction Fee: <span className="font-semibold">€{primaryFeeCalc.fee.toFixed(2)} ({primaryFeeCalc.percentageFormatted})</span>
            <span className="mx-1.5 text-gray-400 dark:text-zinc-600">•</span>
            Buy Now Fee: <span className="font-semibold">€{buyNowFeeCalc.fee.toFixed(2)} ({buyNowFeeCalc.percentageFormatted})</span>
          </span>
        ) : (
          <span>
            €{primaryFeeCalc.fee.toFixed(2)} ({primaryFeeCalc.percentageFormatted}) Service Fee applies
          </span>
        )}
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div 
            className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  What is the Service Fee?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Transparent marketplace pricing & buyer protection
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Our Service Fee helps keep our platform operating and means we can continue to offer local support and Buyer Protection up to €5,000. The fee is charged to buyers for payments made on Listme. It&apos;s calculated based on the purchase price.
              </p>

              {/* Service Fee Table */}
              <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 font-bold">
                    <tr>
                      <th className="py-3 px-4">Purchase price</th>
                      <th className="py-3 px-4 text-right">Standard Fee</th>
                      <th className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400">With Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                    {SERVICE_FEE_TIERS.map((tier) => {
                      const isCurrentTier = 
                        (tier.range === '€10 – €50' && primaryFeeCalc.price <= 50) ||
                        (tier.range === '€50.01 – €250' && primaryFeeCalc.price > 50 && primaryFeeCalc.price <= 250) ||
                        (tier.range === '€250.01+' && primaryFeeCalc.price > 250);

                      const basePct = parseFloat(tier.feePercent);
                      const creditPct = Math.max(0, basePct - 0.5);

                      return (
                        <tr 
                          key={tier.range}
                          className={isCurrentTier ? 'bg-blue-50/70 dark:bg-blue-950/30 font-semibold text-primary dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}
                        >
                          <td className="py-2.5 px-4 flex items-center gap-2">
                            <span>{tier.range}</span>
                            {isCurrentTier && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-primary text-white rounded-full uppercase font-bold">
                                Current
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-medium">
                            {tier.feePercent}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {creditPct}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Special Account Credit Discount Callout */}
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">ListMe Account Credit Discount:</span> Pay using your ListMe Account Credit at checkout and your service fee automatically drops by <strong>0.5%</strong>!
                </div>
              </div>

              {/* Specific Item Breakdown */}
              {isMixed && buyNowFeeCalc ? (
                <div className="space-y-3">
                  {/* Auction Fee Breakdown */}
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Auction Fee Breakdown (Current Bid)
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Current Bid:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">€{primaryFeeCalc.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Service Fee ({primaryFeeCalc.percentageFormatted}):</span>
                      <span className="font-semibold text-primary dark:text-blue-400">+€{primaryFeeCalc.fee.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-zinc-800 flex justify-between text-xs font-bold text-gray-900 dark:text-white">
                      <span>Est. Total:</span>
                      <span className="text-sm text-primary dark:text-blue-400">€{primaryFeeCalc.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Buy Now Fee Breakdown */}
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Buy Now Fee Breakdown
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Buy Now Price:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">€{buyNowFeeCalc.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Service Fee ({buyNowFeeCalc.percentageFormatted}):</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">+€{buyNowFeeCalc.fee.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-zinc-800 flex justify-between text-xs font-bold text-gray-900 dark:text-white">
                      <span>Est. Total:</span>
                      <span className="text-sm text-emerald-600 dark:text-emerald-400">€{buyNowFeeCalc.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 space-y-2">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{isAuction ? 'Current Bid:' : 'Item Purchase Price:'}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">€{primaryFeeCalc.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Calculated Service Fee ({primaryFeeCalc.percentageFormatted}):</span>
                    <span className="font-semibold text-primary dark:text-green-400">+€{primaryFeeCalc.fee.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-zinc-800 flex justify-between text-sm font-bold text-gray-900 dark:text-white">
                    <span>Estimated Total (incl. Fee):</span>
                    <span className="text-base text-primary dark:text-green-400">€{primaryFeeCalc.total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Protection Notice */}
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Your trade is protected under Listme Buyer Protection up to €5,000.</span>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-900/80 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <Link
                href="/buyer-protection"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-bold text-gray-800 dark:text-gray-200 transition-colors"
              >
                Learn more
              </Link>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 rounded-lg bg-[#0073e6] hover:bg-[#005bb5] text-white text-xs font-bold transition-colors shadow-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
