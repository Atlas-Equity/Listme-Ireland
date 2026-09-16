'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingSuccessPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyAndMark = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/connect/verify', { method: 'POST' });
      const data = await res.json();

      if (data.verified) {
        setVerified(true);
      }
      
      setLoading(false);
    };

    verifyAndMark();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800 p-8 text-center">
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-yellow-600 dark:text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Onboarding Not Complete
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            It looks like your Stripe setup isn&apos;t finished yet. Please complete all required fields in the Stripe form to start selling.
          </p>
          <Link 
            href="/stripe-setup"
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-green-700 transition-colors"
          >
            Try Again <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800 p-8 text-center">
        
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Bank Account Linked!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Your wallet is now active. You are all set to start selling items and receiving payouts directly to your bank account.
        </p>

        <Link 
          href="/sell"
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-green-700 transition-colors"
        >
          Create a Listing <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </div>
  );
}
