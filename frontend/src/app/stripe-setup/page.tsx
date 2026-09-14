'use client';

import React, { useState, useEffect } from 'react';
import { Building, ShieldCheck, ArrowRight, Loader2, Landmark, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { createStripeConnectAction } from '@/app/actions/stripeConnect';

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        setError('You must be logged in to set up payouts. Redirecting to login...');
        setTimeout(() => {
          router.push('/login?next=/stripe-setup');
        }, 1500);
      } else {
        setUserEmail(user.email || 'Authenticated User');
      }
    });
  }, [router]);

  const startOnboarding = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Primary path: Server Action (handles cookies natively with zero network header issues)
      const actionRes = await createStripeConnectAction();
      if (actionRes?.url) {
        window.location.href = actionRes.url;
        return;
      }

      // 2. Fallback path: API route with explicit client session Bearer token
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Your login session has expired. Please sign in again.');
      }

      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        const isHtml = rawText.trim().startsWith('<');
        const cleanMsg = isHtml 
          ? `Server returned status ${res.status}. Please try again.` 
          : (rawText.trim().substring(0, 200) || `Server error (${res.status})`);
        throw new Error(cleanMsg);
      }

      if (!res.ok) {
        throw new Error(data.error || actionRes?.error || 'Failed to start onboarding');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Stripe setup error:', err);
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800 p-8">
        
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 rounded-2xl flex items-center justify-center mb-6">
          <Landmark className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Link your bank account
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          To receive payouts from your sales, you need to securely link a bank account. We partner with Stripe to handle payments and keep your information safe.
        </p>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="flex items-start">
            <ShieldCheck className="w-5 h-5 text-green-500 mr-3 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Bank-grade security. Your data is encrypted and securely stored by Stripe.
            </p>
          </div>
          <div className="flex items-start">
            <Building className="w-5 h-5 text-green-500 mr-3 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Get paid faster. Earnings are automatically transferred to your linked account.
            </p>
          </div>
        </div>

        {userEmail && (
          <div className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-100 dark:border-zinc-800 text-xs text-gray-600 dark:text-gray-300">
            <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="truncate">Setting up payouts for <strong className="text-gray-900 dark:text-white">{userEmail}</strong></span>
          </div>
        )}

        <button
          onClick={startOnboarding}
          disabled={loading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors cursor-pointer"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Connecting...</>
          ) : (
            <>Link with Stripe <ArrowRight className="w-5 h-5 ml-2" /></>
          )}
        </button>
      </div>
    </div>
  );
}
