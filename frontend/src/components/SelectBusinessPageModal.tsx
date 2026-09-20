'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  Store,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  PlusCircle,
  ShieldAlert,
} from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';
import type { UserBusinessPageItem } from '@/app/api/verified/business-pages/route';

interface SelectBusinessPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: 'page' | 'bundle';
  onConfirm: (businessPageSlug: string) => Promise<void> | void;
  onSelectPersonal?: () => void;
  isProcessing?: boolean;
}

export default function SelectBusinessPageModal({
  isOpen,
  onClose,
  plan,
  onConfirm,
  onSelectPersonal,
  isProcessing = false,
}: SelectBusinessPageModalProps) {
  const router = useRouter();
  const [loadingPages, setLoadingPages] = useState(true);
  const [pages, setPages] = useState<UserBusinessPageItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoadingPages(true);
    setFetchError(null);

    fetch('/api/verified/business-pages')
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login?redirect=/verified');
            return null;
          }
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to load your business pages.');
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted || !data) return;

        if (data.authenticated === false) {
          router.push('/login?redirect=/verified');
          return;
        }

        const list: UserBusinessPageItem[] = Array.isArray(data.pages) ? data.pages : [];
        setPages(list);

        if (list.length > 0) {
          const firstUnverified = list.find((p) => !p.is_verified);
          setSelectedSlug(firstUnverified ? firstUnverified.slug : list[0].slug);
        } else {
          setSelectedSlug('');
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setFetchError(err?.message || 'Could not load your business pages.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingPages(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, router]);

  if (!isOpen) return null;

  const isBundle = plan === 'bundle';
  const planTitle = isBundle ? 'Verified Bundle' : 'Verified Page';
  const planPrice = isBundle ? '€19.99' : '€14.99';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#151515] border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-6 pt-6 pb-5 border-b border-gray-100 dark:border-zinc-800 flex items-start justify-between bg-white dark:bg-[#151515]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isBundle 
                ? 'bg-primary/10 text-primary' 
                : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400'
            }`}>
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  {loadingPages
                    ? 'Checking Business Page...'
                    : pages.length === 0
                    ? 'Business Page Required'
                    : 'Choose Business Page'}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                  {planPrice}/mo
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {planTitle} Subscription Setup
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {loadingPages ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Checking your registered business pages...
              </p>
            </div>
          ) : fetchError ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-red-800 dark:text-red-200">
                    Failed to Load Pages
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    {fetchError}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : pages.length === 0 ? (
            <div className="space-y-5">
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
                <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300 font-extrabold text-sm">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>You don&apos;t have a Business Page yet</span>
                </div>
                <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                  The <span className="font-bold text-amber-950 dark:text-amber-100">{planTitle}</span> plan attaches directly to a registered ListMe Business Page to grant the official verified badge and priority ranking.
                </p>
                <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                  To avoid payment errors or missing badges, please create your Business Page first before subscribing.
                </p>
              </div>

              <div className="space-y-2.5">
                <Link
                  href="/my-listme?tab=business"
                  onClick={onClose}
                  className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-green-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create a Business Page Now (Free)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {onSelectPersonal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectPersonal();
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Get Personal Verified (€9.99/mo) Instead</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Select which Business Page to verify:
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  The verified badge and ranking perks will apply to the chosen storefront.
                </p>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {pages.map((p) => {
                  const isSelected = selectedSlug.toLowerCase() === p.slug.toLowerCase();
                  const isAlreadyVerified = Boolean(p.is_verified);
                  return (
                    <div
                      key={p.slug}
                      onClick={() => !isProcessing && !isAlreadyVerified && setSelectedSlug(p.slug)}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isAlreadyVerified
                          ? 'border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-900/40 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-xs ring-2 ring-primary/20 cursor-pointer'
                          : 'border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60 hover:border-gray-300 dark:hover:border-zinc-700 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center relative border border-gray-200 dark:border-zinc-700">
                          {p.avatar_url ? (
                            <Image
                              src={p.avatar_url}
                              alt={p.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Store className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white truncate">
                              {p.name}
                            </span>
                            {isAlreadyVerified ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                <VerifiedBadge size="xs" />
                                <span>Already Verified</span>
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">
                            @{p.slug}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isAlreadyVerified ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-primary bg-primary text-white'
                                : 'border-gray-300 dark:border-zinc-700 bg-transparent'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedSlug && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 text-[11px] text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>
                    Selected: <strong className="text-gray-900 dark:text-white">@{selectedSlug}</strong>
                    {isBundle && ' + your personal account'}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (selectedSlug) {
                    onConfirm(selectedSlug);
                  }
                }}
                disabled={!selectedSlug || isProcessing || Boolean(pages.find(p => p.slug.toLowerCase() === selectedSlug.toLowerCase())?.is_verified)}
                className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-green-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Stripe...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Continue to Stripe Checkout ({planPrice}/mo)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 bg-gray-50 dark:bg-zinc-900/60 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-zinc-400" />
            256-bit encrypted • Cancel anytime
          </span>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:underline cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
