'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateAccountType } from './actions';
import BusinessUpgradeModal from '@/components/BusinessUpgradeModal';
import { Briefcase, User, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface AccountTypeSwitchProps {
  currentType: 'personal' | 'business';
  userPhone: string;
}

export default function AccountTypeSwitch({ currentType, userPhone }: AccountTypeSwitchProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const router = useRouter();

  const handleSwitchClick = () => {
    setError(null);

    if (currentType === 'business') {
      setIsConfirmModalOpen(true);
      return;
    }

    const trimmedPhone = userPhone?.trim() || '';
    const digitsOnly = trimmedPhone.replace(/\D/g, '');
    if (!trimmedPhone || digitsOnly.length < 7) {
      setIsUpgradeModalOpen(true);
      return;
    }

    executeSwitch('business');
  };

  const executeSwitch = async (targetType: 'personal' | 'business') => {
    setError(null);
    setLoading(true);

    try {
      const result = await updateAccountType(targetType);

      if (result?.error) {
        if (result.requiresPhone) {
          setIsConfirmModalOpen(false);
          setIsUpgradeModalOpen(true);
        } else {
          setError(result.error);
        }
        setLoading(false);
      } else {
        setIsConfirmModalOpen(false);
        router.refresh();
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update account type. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900/50">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
            {currentType === 'business' ? (
              <Briefcase className="w-4 h-4 text-primary" />
            ) : (
              <User className="w-4 h-4 text-gray-500" />
            )}
            <span>Current status:</span>
            <span className="capitalize text-primary font-bold">{currentType}</span>
            {currentType === 'business' && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Verified Seller
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {currentType === 'personal'
              ? 'Upgrade to a business account to unlock bulk listing tools, verified business badge, and lower seller fees. (Requires a verified phone number).'
              : 'Switch back to a personal account if you are no longer selling as a commercial or trade seller.'}
          </p>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </p>
          )}
        </div>
        <div className="flex items-center justify-end sm:justify-start">
          <button
            type="button"
            onClick={handleSwitchClick}
            disabled={loading}
            className="px-5 py-2.5 bg-primary hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-xs whitespace-nowrap flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <span>Switch to {currentType === 'personal' ? 'Business' : 'Personal'}</span>
            )}
          </button>
        </div>
      </div>

      
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Are you sure?
              </h3>
              <button
                type="button"
                onClick={() => !loading && setIsConfirmModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Switching to a Personal account will remove commercial seller badges and tools from your profile.
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              This is not a permanent choice — you can switch back to a Business account at any time.
            </p>

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeSwitch('personal')}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-green-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Switching...</span>
                  </>
                ) : (
                  <span>Switch to Personal</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      
      <BusinessUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        initialPhone={userPhone}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </>
  );
}
