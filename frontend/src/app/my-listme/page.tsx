import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { User, Settings, Heart, Package, LogOut, CheckCircle2 } from 'lucide-react';
import { updateAccountType } from './actions';
import Link from 'next/link';
import WalletLoginButton from '@/components/WalletLoginButton';
import WalletSetupButton from '@/components/WalletSetupButton';

export default async function MyListMePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the full profile from the database
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const accountType = profile?.account_type || 'personal';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My ListMe</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your account, listings, and preferences.
            </p>
          </div>
          <div className="hidden sm:block">
            <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              {accountType === 'business' ? 'Business Account' : 'Personal Account'}
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
              <nav className="flex flex-col">
                <Link href="/my-listme" className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/10 text-primary border-l-4 border-primary">
                  <User className="w-5 h-5" />
                  <span className="font-medium">Account Details</span>
                </Link>
                <Link href="/watchlist" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white border-l-4 border-transparent transition-colors">
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">Watchlist</span>
                </Link>
                <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white border-l-4 border-transparent transition-colors">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">My Listings</span>
                </Link>
                <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white border-l-4 border-transparent transition-colors">
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </Link>
                <div className="border-t border-gray-200 dark:border-zinc-800 my-1"></div>
                <Link href="/auth/signout" className="flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 border-l-4 border-transparent transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Log out</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            
            {/* Profile Overview Card */}
            <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Profile Overview</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Username</label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{profile?.username || 'Not set'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-medium text-gray-900 dark:text-white">{user.email}</p>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Type Settings Card */}
            <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Account Type</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                You can switch between a Personal and Business account at any time. Business accounts get access to advanced selling tools.
              </p>

              <form action={async (formData) => {
                'use server';
                const newType = accountType === 'personal' ? 'business' : 'personal';
                await updateAccountType(newType);
              }}>
                <div className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-900/50">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Current status: <span className="capitalize text-primary">{accountType}</span>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {accountType === 'personal' 
                        ? 'Upgrade to a business account to unlock bulk listing tools and lower success fees on large volume sales.'
                        : 'Switch back to a personal account if you are no longer selling as a registered business.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-end sm:justify-start">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-primary hover:bg-green-700 text-white font-medium rounded-md transition-colors shadow-sm whitespace-nowrap"
                    >
                      Switch to {accountType === 'personal' ? 'Business' : 'Personal'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Wallet & Payment Methods Settings Card */}
            <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Wallet & Payment Methods</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Manage your payment methods for purchases, and configure your payouts if you are a seller.
              </p>

              <div className="space-y-6">
                {/* Buyer Payment Methods */}
                <div className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-900/50">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      Saved Cards (Purchases)
                      {profile?.stripe_customer_id && (
                        <span className="text-green-600 dark:text-green-500 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" /> Active</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Link a credit or debit card to quickly make purchases or add funds to your wallet.
                    </p>
                  </div>
                  <div className="flex items-center justify-end sm:justify-start">
                    <WalletSetupButton />
                  </div>
                </div>

                {/* Seller Payouts - Only show for Business accounts */}
                {accountType === 'business' && (
                  <div className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-900/50">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        Seller Payouts (Stripe Connect)
                        {profile?.stripe_onboarding_complete ? (
                          <span className="text-green-600 dark:text-green-500 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" /> Active</span>
                        ) : (
                          <span className="text-red-500">Not Linked</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {profile?.stripe_onboarding_complete 
                          ? 'Your bank account is linked and ready to receive payouts automatically.' 
                          : 'You must link a bank account to start receiving payouts for sales.'}
                      </p>
                    </div>
                    <div className="flex items-center justify-end sm:justify-start">
                      {!profile?.stripe_onboarding_complete && (
                        <Link
                          href="/stripe-setup"
                          className="px-6 py-2 bg-primary hover:bg-green-700 text-white font-medium rounded-md transition-colors shadow-sm whitespace-nowrap"
                        >
                          Set up Payouts
                        </Link>
                      )}
                      {profile?.stripe_onboarding_complete && (
                        <WalletLoginButton />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
