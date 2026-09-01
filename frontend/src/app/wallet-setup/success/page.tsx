import React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function WalletSetupSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  if (!searchParams.session_id) {
    redirect('/my-listme');
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#1a1a1a] p-8 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 text-center">
        
        <div className="flex justify-center">
          <CheckCircle2 className="h-20 w-20 text-green-500" />
        </div>
        
        <div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">
            Card Linked Successfully!
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Your payment method has been securely saved to your Wallet. You can now use it to quickly make purchases or add funds.
          </p>
        </div>
        
        <div className="pt-4">
          <Link
            href="/my-listme"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            Return to My Account
          </Link>
        </div>
        
      </div>
    </div>
  );
}
