'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateAccountType } from './actions';
import BusinessUpgradeModal from '@/components/BusinessUpgradeModal';
import { Briefcase, User, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AccountTypeSwitchProps {
  currentType: 'personal' | 'business';
  userPhone: string;
}

export default function AccountTypeSwitch({ currentType, userPhone }: AccountTypeSwitchProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const router = useRouter();

  const handleSwitch = async () => {
    setError(null);

    // If upgrading to business and user doesn't have a valid phone number, open modal
    if (currentType === 'personal') {
      const trimmedPhone = userPhone?.trim() || '';
      const digitsOnly = trimmedPhone.replace(/\D/g, '');
      if (!trimmedPhone || digitsOnly.length < 7) {
        setIsUpgradeModalOpen(true);
        return;
      }
    }

    setLoading(true);
    const targetType = currentType === 'personal' ? 'business' : 'personal';
    const result = await updateAccountType(targetType);

    if (result.error) {
      if (result.requiresPhone) {
        setIsUpgradeModalOpen(true);
      } else {
        setError(result.error);
      }
      setLoading(false);
    } else {
      router.refresh();
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-900/50">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {currentType === 'business' ? (
              <Briefcase className="w-4 h-4 text-primary" />
            ) : (
              <User className="w-4 h-4 text-gray-500" />
            )}
            Current status:{' '}
            <span className="capitalize text-primary font-bold">{currentType}</span>
            {currentType === 'business' && (
              <span className="text-xs px-2 py-0.5 rounded-md border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium">
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
            onClick={handleSwitch}
            disabled={loading}
            className="px-5 py-2.5 bg-primary hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                Switch to {currentType === 'personal' ? 'Business' : 'Personal'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Business Upgrade Modal */}
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
