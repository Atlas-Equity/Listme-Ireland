'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Info, X, ShieldCheck, HelpCircle } from 'lucide-react';
import { calculateServiceFee, SERVICE_FEE_TIERS } from '@/utils/serviceFee';

interface ServiceFeeModalProps {
  price: number | string;
  className?: string;
}

export default function ServiceFeeModal({ price, className }: ServiceFeeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const feeCalc = calculateServiceFee(price);

  return (
    <>
      {/* Clickable Trigger on Listing */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center text-xs sm:text-sm text-[#0073e6] hover:underline cursor-pointer transition-colors ${className || ''}`}
        title="View Service Fee breakdown"
      >
        <Info className="w-4 h-4 mr-1.5 shrink-0 text-[#0073e6]" />
        <span>
          €{feeCalc.fee.toFixed(2)} ({feeCalc.percentageFormatted}) Service Fee applies
        </span>
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
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                What is the Service Fee?
              </h3>
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
            <div className="p-6 space-y-5">
              
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Our Service Fee helps keep our platform operating and means we can continue to offer local support and Buyer Protection up to €5,000. The fee is charged to buyers for payments made via Listme Pay, for casual items. It&apos;s calculated based on the purchase price, not including shipping. Other exclusions may apply.
              </p>

              {/* Service Fee Table */}
              <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 font-bold">
                    <tr>
                      <th className="py-3 px-4">Purchase price</th>
                      <th className="py-3 px-4 text-right">Service Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                    {SERVICE_FEE_TIERS.map((tier) => {
                      const isCurrentTier = 
                        (tier.range === '€0.00 – €20.00' && feeCalc.price <= 20) ||
                        (tier.range === '€20.01 – €100.00' && feeCalc.price > 20 && feeCalc.price <= 100) ||
                        (tier.range === '€100.01 – €250.00' && feeCalc.price > 100 && feeCalc.price <= 250) ||
                        (tier.range === '€250.01+' && feeCalc.price > 250);

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
                          <td className="py-2.5 px-4 text-right font-mono font-bold">
                            {tier.feePercent} fee
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Specific Item Breakdown */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 space-y-2">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Item Purchase Price:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">€{feeCalc.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Calculated Service Fee ({feeCalc.percentageFormatted}):</span>
                  <span className="font-semibold text-primary dark:text-green-400">+€{feeCalc.fee.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-zinc-800 flex justify-between text-sm font-bold text-gray-900 dark:text-white">
                  <span>Estimated Total (incl. Fee):</span>
                  <span className="text-base text-primary dark:text-green-400">€{feeCalc.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Protection Notice */}
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Your trade is protected under Listme Buyer Protection up to €5,000.</span>
              </div>

            </div>

            {/* Modal Actions matching TradeMe */}
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
