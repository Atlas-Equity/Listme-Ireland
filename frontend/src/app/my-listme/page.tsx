import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { User, Settings, Heart, Package, LogOut, CheckCircle2, Plus, ArrowRight, MapPin, Phone, Edit } from 'lucide-react';
import { updateAccountType } from './actions';
import Link from 'next/link';
import Image from 'next/image';
import WalletLoginButton from '@/components/WalletLoginButton';
import WalletSetupButton from '@/components/WalletSetupButton';
import { ListingCard } from '@/components/ListingCard';
import ProfileSettingsForm from './ProfileSettingsForm';
import AccountTypeSwitch from './AccountTypeSwitch';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MyListMePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentTab = (typeof params?.tab === 'string' ? params.tab : 'account').toLowerCase();

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

  // Extract user metadata
  const userMetadata = user.user_metadata || {};
  const username = profile?.username || userMetadata.username || '';
  const fullName = userMetadata.full_name || '';
  const bio = userMetadata.bio || '';
  const avatarUrl = userMetadata.avatar_url || '';
  const location = userMetadata.location || '';
  const phone = userMetadata.phone || '';

  const displayName = fullName || username || user.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((p: string) => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Tab 1: Watchlist data (if active or for prefetch/count)
  let wishlistedListings: any[] = [];
  if (currentTab === 'watchlist') {
    const { data: wishlists } = await supabase
      .from('wishlists')
      .select(`
        id,
        listing:listings (
          id,
          title,
          price,
          price_type,
          condition,
          images,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    wishlistedListings = (wishlists || [])
      .filter((item: any) => item.listing !== null)
      .map((item: any) => item.listing);
  }

  // Tab 2: User's own listings
  let userListings: any[] = [];
  if (currentTab === 'listings') {
    const { data: listings } = await supabase
      .from('listings')
      .select('id, title, price, price_type, condition, images, created_at')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    userListings = listings || [];
  }

  const settingsInitialData = {
    username,
    fullName,
    bio,
    avatarUrl,
    phone,
    location,
    email: user.email || '',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My ListMe</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your profile, saved items, listings, and preferences.
            </p>
          </div>
          <div className="hidden sm:block">
            <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200">
              {accountType === 'business' ? 'Business Account' : 'Personal Account'}
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation - Always present */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
              <nav className="flex flex-col">
                {/* Account Details */}
                <Link
                  href="/my-listme?tab=account"
                  className={`flex items-center gap-3 px-4 py-3.5 border-l-4 transition-colors ${
                    currentTab === 'account'
                      ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border-primary font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white border-transparent'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Account Details</span>
                </Link>

                {/* Watchlist */}
                <Link
                  href="/my-listme?tab=watchlist"
                  className={`flex items-center gap-3 px-4 py-3.5 border-l-4 transition-colors ${
                    currentTab === 'watchlist'
                      ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border-primary font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white border-transparent'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">Watchlist</span>
                </Link>

                {/* My Listings */}
                <Link
                  href="/my-listme?tab=listings"
                  className={`flex items-center gap-3 px-4 py-3.5 border-l-4 transition-colors ${
                    currentTab === 'listings'
                      ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border-primary font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white border-transparent'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span className="font-medium">My Listings</span>
                </Link>

                {/* Settings */}
                <Link
                  href="/my-listme?tab=settings"
                  className={`flex items-center gap-3 px-4 py-3.5 border-l-4 transition-colors ${
                    currentTab === 'settings'
                      ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border-primary font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white border-transparent'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </Link>

                <div className="border-t border-gray-200 dark:border-zinc-800 my-1"></div>

                {/* Log Out */}
                <Link
                  href="/auth/signout"
                  className="flex items-center gap-3 px-4 py-3.5 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 border-l-4 border-transparent transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Log out</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">

            {/* TAB: Account Details */}
            {currentTab === 'account' && (
              <div className="space-y-6">
                {/* Profile Card with Avatar & Bio */}
                <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                      {/* Avatar preview */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-primary/20 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 relative shadow-sm">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt={displayName}
                            fill
                            sizes="80px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="text-2xl font-bold text-primary dark:text-green-400">
                            {initials}
                          </span>
                        )}
                      </div>

                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {displayName}
                        </h2>
                        {username && (
                          <p className="text-sm font-medium text-primary">@{username}</p>
                        )}
                        {location && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {location}
                          </p>
                        )}
                      </div>
                    </div>

                    <Link
                      href="/my-listme?tab=settings"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 text-sm font-medium transition-colors shadow-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Link>
                  </div>

                  <div className="space-y-6">
                    {/* Bio Snippet */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        About Me / Bio
                      </label>
                      {bio ? (
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line bg-gray-50 dark:bg-zinc-900/60 p-4 rounded-lg border border-gray-100 dark:border-zinc-800">
                          {bio}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                          No bio added yet. Tell buyers and sellers about yourself in{' '}
                          <Link href="/my-listme?tab=settings" className="text-primary hover:underline not-italic font-medium">
                            Settings
                          </Link>.
                        </p>
                      )}
                    </div>

                    {/* Email and Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Email Address
                        </label>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-medium text-gray-900 dark:text-white">{user.email}</p>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                      </div>

                      {phone && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Contact Phone
                          </label>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <p className="text-base font-medium text-gray-900 dark:text-white">{phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Type Settings Card */}
                <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Account Type</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    You can switch between a Personal and Business account at any time. Business accounts get access to advanced selling tools.
                  </p>

                  <AccountTypeSwitch currentType={accountType} userPhone={phone} />
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
                            <span className="text-green-600 dark:text-green-500 flex items-center text-sm font-medium"><CheckCircle2 className="w-4 h-4 mr-1" /> Active</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Link a credit or debit card to quickly make purchases or place auction bids.
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
                              <span className="text-green-600 dark:text-green-500 flex items-center text-sm font-medium"><CheckCircle2 className="w-4 h-4 mr-1" /> Active</span>
                            ) : (
                              <span className="text-red-500 text-sm font-medium">Not Linked</span>
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
            )}

            {/* TAB: Watchlist */}
            {currentTab === 'watchlist' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      My Watchlist
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300">
                        {wishlistedListings.length} {wishlistedListings.length === 1 ? 'item' : 'items'}
                      </span>
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Auctions and listings you have saved to keep track of.
                    </p>
                  </div>
                  <Link
                    href="/browse"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    Browse more items <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {wishlistedListings.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 flex items-center justify-center">
                      <Heart className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Your watchlist is empty
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                      Explore auctions and listings to save your favourite items and get alerts on bidding activity.
                    </p>
                    <Link
                      href="/browse"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-green-700 text-white font-medium transition-colors shadow-sm text-sm"
                    >
                      Browse Marketplace
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {wishlistedListings.map((listing: any) => (
                      <ListingCard
                        key={listing.id}
                        id={listing.id}
                        title={listing.title}
                        price={typeof listing.price === 'string' ? parseFloat(listing.price.replace(/[^0-9.]/g, '')) || 0 : listing.price}
                        priceType={listing.price_type === 'Auction' ? 'Auction' : 'Fixed Price'}
                        condition={listing.condition || 'Used - Good'}
                        images={listing.images || []}
                        createdAt={listing.created_at}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: My Listings */}
            {currentTab === 'listings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      My Listings
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        {userListings.length} {userListings.length === 1 ? 'item' : 'items'}
                      </span>
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Manage all items you have listed for sale or auction.
                    </p>
                  </div>
                  <Link
                    href="/sell"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-green-700 text-white font-medium transition-colors shadow-sm text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    New Listing
                  </Link>
                </div>

                {userListings.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Package className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      You have no active listings
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                      Reach thousands of buyers across Ireland by listing your products or auctions today.
                    </p>
                    <Link
                      href="/sell"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-green-700 text-white font-medium transition-colors shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Create a Listing
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {userListings.map((listing: any) => (
                      <ListingCard
                        key={listing.id}
                        id={listing.id}
                        title={listing.title}
                        price={typeof listing.price === 'string' ? parseFloat(listing.price.replace(/[^0-9.]/g, '')) || 0 : listing.price}
                        priceType={listing.price_type === 'Auction' ? 'Auction' : 'Fixed Price'}
                        condition={listing.condition || 'Used - Good'}
                        images={listing.images || []}
                        createdAt={listing.created_at}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Settings */}
            {currentTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Profile Settings
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Customize your profile picture, bio, username, and public profile details.
                  </p>
                </div>

                <ProfileSettingsForm initialData={settingsInitialData} accountType={accountType} />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
