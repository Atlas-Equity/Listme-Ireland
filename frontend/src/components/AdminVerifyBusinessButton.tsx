'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { adminToggleBusinessVerification } from '@/app/actions/businessPages';

interface AdminVerifyBusinessButtonProps {
  slug: string;
  isVerified?: boolean;
}

export default function AdminVerifyBusinessButton({
  slug,
  isVerified = false,
}: AdminVerifyBusinessButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verifiedState, setVerifiedState] = useState(isVerified);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await adminToggleBusinessVerification(slug);
      if (res?.success) {
        setVerifiedState(Boolean(res.is_verified));
        router.refresh();
      }
    } catch {}
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 ${
        verifiedState
          ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
          : 'bg-primary hover:bg-green-700 text-white shadow-sm'
      }`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : verifiedState ? (
        <ShieldAlert className="w-3.5 h-3.5" />
      ) : (
        <ShieldCheck className="w-3.5 h-3.5" />
      )}
      <span>{verifiedState ? 'Admin: Revoke Verified' : 'Admin: Verify Business'}</span>
    </button>
  );
}
