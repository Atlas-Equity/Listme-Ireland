'use client';

import React, { useState } from 'react';
import { Loader2, ShieldCheck, Settings, ExternalLink, X, CheckCircle2 } from 'lucide-react';
import StripePricingTable from '@/components/StripePricingTable';

interface VerifyAccountButtonProps {
  isSubscribed?: boolean;
  userId?: string;
  userEmail?: string;
}

export default function VerifyAccountButton({ 
  isSubscribed = false,
  userId,
  userEmail,
}: VerifyAccountButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManage = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/verified/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to open billing portal.');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No billing portal URL returned.');
      }
    } catch (err: any) {
      console.error('Customer portal error:', err);
      setError(err?.message || 'Failed to open billing portal.');
      setLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <button
          type="button"
          onClick={handleManage}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
          ) : (
            <Settings className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          )}
          <span>Manage Subscription</span>
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </button>

        {error && (
          <p className="text-[11px] text-red-500 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-start sm:items-end gap-1.5">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-200" />
          <span>Get Verified for €4.99/mo</span>
        </button>

        {error && (
          <p className="text-[11px] text-red-500 font-medium max-w-xs text-left sm:text-right">
            {error}
          </p>
        )}
      </div>

      {/* Embedded Stripe Pricing Table Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-zinc-800 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span>ListMe Verified Badge</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                      Official
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Subscribe for €4.99/month to earn immediate verified seller &amp; buyer status.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Perks Summary */}
            <div className="px-6 py-3.5 bg-emerald-50/50 dark:bg-emerald-950/15 border-b border-emerald-100/60 dark:border-emerald-900/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Exclusive badge on profile &amp; listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Increased buyer confidence &amp; faster sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Priority search and category ranking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Cancel anytime in your Account Portal</span>
                </div>
              </div>
            </div>

            {/* Embedded Stripe Pricing Table */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <StripePricingTable
                pricingTableId="prctbl_1UFYqWQ4vWyFpILpWMsKMVmf"
                publishableKey="pk_live_51TlR2gQ4vWyFpILpKmPSa2iCMOGH5zCE0dracV3PaWTDk1uA4MGJtC0kcIPXIjgSUVNZ6s5WGPOKbqclUPxuwemA00UMLqRB6r"
                clientReferenceId={userId}
                customerEmail={userEmail}
                className="min-h-[340px]"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Processed securely by Stripe • 256-bit encryption
              </span>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:underline"
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
