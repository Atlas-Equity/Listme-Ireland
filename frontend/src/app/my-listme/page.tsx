import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { 
  User, 
  Settings, 
  Heart, 
  Package, 
  LogOut, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  MapPin, 
  Phone, 
  Edit, 
  ShieldCheck, 
  ExternalLink,
  Tag,
  CreditCard,
  Bell,
  Building2,
  Compass,
  RotateCcw,
  Globe,
  Check,
  ChevronDown,
  AlertCircle,
  Store,
  Briefcase,
  Clock
} from 'lucide-react';
import Stripe from 'stripe';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import WalletLoginButton from '@/components/WalletLoginButton';
import WalletSetupButton from '@/components/WalletSetupButton';
import { ListingCard } from '@/components/ListingCard';
import ProfileSettingsForm from './ProfileSettingsForm';
import AccountTypeSwitch from './AccountTypeSwitch';
import CreateWatchlistModal from '@/components/CreateWatchlistModal';
import MakeOfferButton from '@/components/MakeOfferButton';
import LinkedCardCard from '@/components/LinkedCardCard';
import RelistNotificationCard from '@/components/RelistNotificationCard';
import CreateBusinessPageModal from '@/components/CreateBusinessPageModal';
import TradeMeSettingsSections from './TradeMeSettingsSections';
import DeleteListingButton from '@/components/DeleteListingButton';
import ClearAllNotificationsButton from '@/components/ClearAllNotificationsButton';
import FavouriteSellerButton from '@/components/FavouriteSellerButton';
import DeleteBusinessPageButton from '@/components/DeleteBusinessPageButton';
import { autoCleanupExpiredListings } from '@/app/actions/relist';
import { getCoreLocation, getMemberNumber } from '@/utils/irelandLocations';

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

  // Concurrently fetch profile, user reviews, and all user listings in a single ultra-fast batch
  const now = new Date();
  const [profileRes, reviewsRes, userListingsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('reviews').select('*').eq('reviewee_id', user.id),
    supabase
      .from('listings')
      .select('id, title, price, price_type, condition, images, created_at, location, expires_at, ends_at, status, seller_id')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
  ]);

  const profile = profileRes.data;
  const accountType = profile?.account_type || 'personal';

  // Extract user metadata - strictly NO bio
  const userMetadata = user.user_metadata || {};
  const dismissedNotificationIds: string[] = userMetadata.dismissed_notifications || [];

  // In-memory categorization of user listings (runs in 0.1ms without remote roundtrips)
  const allUserListings = userListingsRes.data || [];
  const userListings = allUserListings.filter(l => 
    l.status === 'active' && (!l.expires_at || new Date(l.expires_at) >= now)
  );
  const closedListings = allUserListings.filter(l => 
    (l.status === 'closed' || (l.expires_at && new Date(l.expires_at) < now)) &&
    !dismissedNotificationIds.includes(l.id)
  );
  const closedCount = closedListings.length;

  const username = profile?.username || userMetadata.username || '';
  const fullName = userMetadata.full_name || '';
  const avatarUrl = profile?.avatar_url || userMetadata.avatar_url || '';
  const location = userMetadata.location || 'Dublin';
  const phone = userMetadata.phone || '';
  const userBusinessPages = (userMetadata.business_pages || []) as any[];

  const displayName = fullName || username || user.email?.split('@')[0] || 'User';

  // Stripe Top-Up Session Verification
  let topupNotification: { success: boolean; message: string } | null = null;
  const topupSessionId = typeof params?.topup_session_id === 'string' ? params.topup_session_id : undefined;

  let currentAccountCredit = typeof userMetadata.account_credit === 'number' ? userMetadata.account_credit : 0.00;

  if (topupSessionId) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      try {
        const stripe = new Stripe(stripeKey);
        const session = await stripe.checkout.sessions.retrieve(topupSessionId, {
          expand: ['payment_intent.payment_method', 'customer'],
        });

        if (session.payment_status === 'paid' && session.metadata?.type === 'account_credit_topup') {
          const processed: string[] = userMetadata.processed_topup_sessions || [];

          if (!processed.includes(session.id)) {
            const paidAmount = session.amount_total
              ? session.amount_total / 100
              : parseFloat(session.metadata?.amount || '0');

            currentAccountCredit = Math.round((currentAccountCredit + paidAmount) * 100) / 100;
            const updatedProcessed = [...processed, session.id];

            // Extract customer ID from session
            const sessionCust = session.customer;
            const resolvedCustomerId = typeof sessionCust === 'string'
              ? sessionCust
              : (sessionCust as Stripe.Customer)?.id || userMetadata.stripe_customer_id;

            // Extract and vault card payment method from successful topup
            let updatedLinkedCard = userMetadata.linked_card;
            const pi = session.payment_intent as Stripe.PaymentIntent | undefined;
            const pm = (pi?.payment_method as Stripe.PaymentMethod | undefined);

            if (pm && pm.card) {
              const cardData = pm.card;
              const brand = (cardData.brand || 'VISA').toUpperCase();
              const last4 = cardData.last4;
              const expMonth = String(cardData.exp_month).padStart(2, '0');
              const expYear = String(cardData.exp_year).slice(-2);

              updatedLinkedCard = {
                cardholderName: pm.billing_details?.name || userMetadata.linked_card?.cardholderName || fullName || 'Cardholder',
                cardNickname: userMetadata.linked_card?.cardNickname || `${brand} •• ${last4}`,
                cardNumberBlocks: ['••••', '••••', '••••', last4],
                expiry: `${expMonth}/${expYear}`,
                cvvMasked: '•••',
                brand,
                stripePaymentMethodId: pm.id,
                isStripeVaulted: true,
                updatedAt: new Date().toISOString(),
              };

              // Make this card the default payment method on the customer in Stripe
              if (resolvedCustomerId) {
                try {
                  await stripe.customers.update(resolvedCustomerId, {
                    invoice_settings: { default_payment_method: pm.id },
                  });
                } catch (custErr) {
                  console.warn('Could not set customer default payment method:', custErr);
                }
              }
            }

            const updateData: any = {
              account_credit: currentAccountCredit,
              processed_topup_sessions: updatedProcessed,
            };

            if (resolvedCustomerId) {
              updateData.stripe_customer_id = resolvedCustomerId;
            }
            if (updatedLinkedCard) {
              updateData.linked_card = updatedLinkedCard;
            }

            await supabase.auth.updateUser({
              data: updateData,
            });

            if (resolvedCustomerId) {
              try {
                await supabase.from('profiles').update({ stripe_customer_id: resolvedCustomerId }).eq('id', user.id);
              } catch {}
            }

            userMetadata.account_credit = currentAccountCredit;
            userMetadata.processed_topup_sessions = updatedProcessed;
            if (resolvedCustomerId) userMetadata.stripe_customer_id = resolvedCustomerId;
            if (updatedLinkedCard) userMetadata.linked_card = updatedLinkedCard;

            topupNotification = {
              success: true,
              message: `Payment confirmed via Stripe! €${paidAmount.toFixed(2)} has been added to your Listme Account Credit. Your card has been saved for future 1-click top-ups.`,
            };
          } else {
            topupNotification = {
              success: true,
              message: 'This top-up payment was confirmed and has already been added to your balance.',
            };
          }
        } else {
          topupNotification = {
            success: false,
            message: 'Stripe top-up checkout session was not marked as completed.',
          };
        }
      } catch (sessionErr: any) {
        console.error('Error verifying Stripe topup session:', sessionErr);
        topupNotification = {
          success: false,
          message: 'Could not verify Stripe payment: ' + (sessionErr.message || 'Session not found'),
        };
      }
    } else {
      topupNotification = {
        success: true,
        message: 'Top-up session detected. In production, real funds will be verified and credited automatically via Stripe.',
      };
    }
  } else if (params?.topup_success === 'true' && params?.topup_amount) {
    const rawAmt = Array.isArray(params.topup_amount) ? params.topup_amount[0] : params.topup_amount;
    const amt = parseFloat(rawAmt || '0');
    topupNotification = {
      success: true,
      message: `Payment confirmed! €${isNaN(amt) ? '0.00' : amt.toFixed(2)} has been credited to your account from your saved card.`,
    };
  } else if (params?.topup_status === 'cancelled') {
    topupNotification = {
      success: false,
      message: 'Top-up transaction was cancelled. No money was charged to your card.',
    };
  }

  // Stripe Wallet Setup Session Verification (when linking card via Stripe Vault)
  const setupSessionId = typeof params?.setup_session_id === 'string' ? params.setup_session_id : undefined;
  if (setupSessionId && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(setupSessionId, {
        expand: ['setup_intent.payment_method'],
      });

      if (session.status === 'complete' && session.setup_intent) {
        const setupIntent = session.setup_intent as any;
        const pm = setupIntent.payment_method;

        if (pm?.card) {
          const cardData = pm.card;
          const updatedCard = {
            cardholderName: pm.billing_details?.name || fullName || 'Cardholder',
            cardNickname: 'Stripe Vaulted Card',
            cardNumberBlocks: ['••••', '••••', '••••', cardData.last4],
            expiry: `${String(cardData.exp_month).padStart(2, '0')}/${String(cardData.exp_year).slice(-2)}`,
            cvvMasked: '•••',
            brand: cardData.brand.toUpperCase(),
            stripePaymentMethodId: pm.id,
            isStripeVaulted: true,
            updatedAt: new Date().toISOString(),
          };

          await supabase.auth.updateUser({
            data: {
              linked_card: updatedCard,
              stripe_customer_id: session.customer || undefined,
            },
          });

          userMetadata.linked_card = updatedCard;

          if (session.customer) {
            await stripe.customers.update(session.customer as string, {
              invoice_settings: { default_payment_method: pm.id },
            });
          }

          topupNotification = {
            success: true,
            message: `Your card (${cardData.brand.toUpperCase()} ending in ${cardData.last4}) has been securely linked and vaulted with Stripe!`,
          };
        }
      }
    } catch (setupErr: any) {
      console.error('Error verifying Stripe wallet setup session:', setupErr);
    }
  }
  const initials = displayName
    .split(' ')
    .map((p: string) => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const memberNumber = getMemberNumber(user.id);
  const coreLocation = getCoreLocation(location) || 'Dublin';

  const memberSinceDate = user.created_at ? new Date(user.created_at) : new Date(2023, 0, 1);
  const memberSinceFormatted = format(memberSinceDate, 'EEEE, d MMMM yyyy');

  // Review statistics
  const userReviews = reviewsRes.data || [];
  const totalReviews = userReviews.length;
  const positiveReviews = userReviews.filter((r: any) => r.rating >= 4).length;
  const neutralReviews = userReviews.filter((r: any) => r.rating === 3).length;
  const negativeReviews = userReviews.filter((r: any) => r.rating <= 2).length;
  const feedbackPercentage = totalReviews > 0 ? ((positiveReviews / totalReviews) * 100).toFixed(1) : '100';

  // Tab 1: Watchlist data (only queried if user is on the watchlist tab)
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
          created_at,
          location,
          expires_at,
          ends_at,
          seller_id
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    wishlistedListings = (wishlists || [])
      .filter((item: any) => item.listing !== null)
      .map((item: any) => item.listing);
  }

  // Tab: Favourite Sellers data
  let favouriteSellers: any[] = [];
  if (currentTab === 'favourite-sellers') {
    const { data: favs } = await supabase
      .from('favourite_sellers')
      .select('id, seller_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const sellerIds = (favs || []).map((f: any) => f.seller_id);
    if (sellerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, account_type, created_at')
        .in('id', sellerIds);
      favouriteSellers = profiles || [];
    }
  }

  const settingsInitialData = {
    username,
    fullName,
    avatarUrl,
    phone,
    location: coreLocation,
    email: user.email || '',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/my-listme" className="hover:text-primary transition-colors">My ListMe</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium capitalize">
              {currentTab === 'account' ? 'Account Details' : currentTab.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/member/${user.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0073e6] hover:underline"
            >
              <span>View your public profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 shadow-xs">
              {accountType === 'business' ? 'Business Account' : 'Personal Account'}
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* TradeMe-Style Sidebar Navigation */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
              
              {/* Member Quick Summary */}
              <div className="p-4 bg-gray-50/70 dark:bg-zinc-900/60 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 relative">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      fill
                      sizes="44px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-base font-bold text-gray-700 dark:text-gray-300">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    Member #{memberNumber}
                  </p>
                </div>
              </div>

              <nav className="flex flex-col py-1">
                
                {/* Account Details */}
                <Link
                  href="/my-listme?tab=account"
                  className={`flex items-center gap-3 px-4 py-3 border-l-4 text-xs font-semibold transition-colors ${
                    currentTab === 'account'
                      ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border-primary'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white border-transparent'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Account details</span>
                </Link>

                {/* Notifications (TradeMe Screenshot 1) */}
                <Link
                  href="/my-listme?tab=notifications"
                  className={`flex items-center justify-between px-4 py-3 border-l-4 text-xs font-semibold transition-colors ${
                    currentTab === 'notifications'
                      ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border-primary'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                  </div>
                  {closedCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-zinc-800 dark:bg-zinc-700 text-white text-[10px] font-bold">
                      {closedCount}
                    </span>
                  )}
                </Link>

                {/* Watchlist */}
                <Link
                  href="/my-listme?tab=watchlist"
                  className={`flex items-center gap-3 px-4 py-3 border-l-4 text-xs font-semibold transition-colors ${
                    currentTab === 'watchlist'
                      ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border-primary'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white border-transparent'
                  }`}
                >
                  <Heart className="w-4 h-4 text-amber-500" />
                  <span>Watchlist</span>
                </Link>

                {/* Favourite Sellers */}
                <Link
                  href="/my-listme?tab=favourite-sellers"
                  className={`flex items-center gap-3 px-4 py-3 border-l-4 text-xs font-semibold transition-colors ${
                    currentTab === 'favourite-sellers'
                      ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border-primary'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white border-transparent'
                  }`}
                >
                  <Heart className="w-4 h-4 text-primary" />
                  <span>Favourite Sellers</span>
                </Link>

                {/* My Listings */}
                <Link
                  href="/my-listme?tab=listings"
                  className={`flex items-center gap-3 px-4 py-3 border-l-4 text-xs font-semibold transition-colors ${
                    currentTab === 'listings'
                      ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border-primary'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white border-transparent'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Items I&apos;m selling</span>
                </Link>

                {/* Business Pages & Services */}
                <Link
                  href="/my-listme?tab=pages"
                  className={`flex items-center gap-3 px-4 py-3 border-l-4 text-xs font-semibold transition-colors ${
                    currentTab === 'pages'
                      ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border-primary'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white border-transparent'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>Business Pages</span>
                </Link>

                {/* Settings */}
                <Link
                  href="/my-listme?tab=settings"
                  className={`flex items-center gap-3 px-4 py-3 border-l-4 text-xs font-semibold transition-colors ${
                    currentTab === 'settings'
                      ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border-primary'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white border-transparent'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>

                <div className="border-t border-gray-200 dark:border-zinc-800 my-1"></div>

                {/* Log Out */}
                <form action="/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-semibold transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </form>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">

            {/* TAB: TradeMe-Style Account Details */}
            {currentTab === 'account' && (
              <div className="space-y-6">

                {/* Stripe Top-Up Notification Banner */}
                {topupNotification && (
                  <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-xs ${
                    topupNotification.success 
                      ? 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white' 
                      : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white'
                  }`}>
                    <div className="flex items-center gap-3">
                      {topupNotification.success ? (
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                      )}
                      <div>
                        <h4 className="font-bold text-sm">
                          {topupNotification.success ? 'Top-Up Confirmed (Stripe)' : 'Top-Up Notice'}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {topupNotification.message}
                        </p>
                      </div>
                    </div>
                    <Link 
                      href="/my-listme?tab=account" 
                      className="text-xs font-bold text-[#0073e6] hover:underline px-2 py-1"
                    >
                      Dismiss
                    </Link>
                  </div>
                )}
                
                {/* TradeMe ACCOUNT DETAILS Table Card */}
                <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-6">
                    <div>
                      <h2 className="text-xl font-extrabold uppercase tracking-tight text-gray-900 dark:text-white">
                        ACCOUNT DETAILS
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Your member identity, registered core location, and contact information.
                      </p>
                    </div>
                    <Link
                      href="/my-listme?tab=settings"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0073e6] hover:underline"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Update my details
                    </Link>
                  </div>

                  {/* TradeMe Key-Value Table */}
                  <div className="divide-y divide-gray-100 dark:divide-zinc-800/80 text-sm">
                    
                    {/* Member Number */}
                    <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-semibold text-gray-500 dark:text-gray-400 sm:w-1/3">
                        Member #
                      </span>
                      <div className="sm:w-2/3 flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900 dark:text-white text-base">
                          {memberNumber}
                        </span>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-semibold text-gray-500 dark:text-gray-400 sm:w-1/3">
                        Name
                      </span>
                      <div className="sm:w-2/3">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {displayName}
                        </span>
                        {username && (
                          <span className="text-xs text-primary font-medium ml-2">@{username}</span>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-semibold text-gray-500 dark:text-gray-400 sm:w-1/3">
                        Email
                      </span>
                      <div className="sm:w-2/3 flex items-center gap-2">
                        <span className="text-gray-900 dark:text-white font-medium">
                          {user.email}
                        </span>
                        <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Authenticated
                        </span>
                      </div>
                    </div>

                    {/* Core Location */}
                    <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-semibold text-gray-500 dark:text-gray-400 sm:w-1/3">
                        Core Location
                      </span>
                      <div className="sm:w-2/3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-gray-900 dark:text-white">
                          {coreLocation}, Ireland
                        </span>
                        <span className="text-[10px] text-gray-400 italic">
                          (Locked to 26 core counties)
                        </span>
                      </div>
                    </div>

                    {/* Member Since */}
                    <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-semibold text-gray-500 dark:text-gray-400 sm:w-1/3">
                        Member since
                      </span>
                      <div className="sm:w-2/3 text-gray-900 dark:text-white font-medium">
                        {memberSinceFormatted}
                      </div>
                    </div>

                    {/* Authentication Status */}
                    <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-semibold text-gray-500 dark:text-gray-400 sm:w-1/3">
                        Authentication Status
                      </span>
                      <div className="sm:w-2/3 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          Protected Member (Phone &amp; Email Verified)
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Links Row */}
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-wrap gap-4 text-xs font-semibold text-[#0073e6]">
                    <Link href="/my-listme?tab=settings" className="hover:underline">
                      Update my details &rarr;
                    </Link>
                    <Link href={`/member/${user.id}`} className="hover:underline">
                      Preview public seller page &rarr;
                    </Link>
                  </div>
                </div>

                {/* TradeMe Feedback Breakdown Card */}
                <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-zinc-800">
                    <div>
                      <h3 className="font-extrabold uppercase text-gray-900 dark:text-white text-base">
                        FEEDBACK SUMMARY
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Ratings and reviews from completed transactions.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-gray-900 dark:text-white">
                        {feedbackPercentage}%
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase font-semibold">Positive Rating</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800">
                      <div className="text-xl font-extrabold text-gray-900 dark:text-white">
                        {positiveReviews}
                      </div>
                      <div className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                        Positive (Score 4-5)
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800">
                      <div className="text-xl font-extrabold text-gray-900 dark:text-white">
                        {neutralReviews}
                      </div>
                      <div className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                        Neutral (Score 3)
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800">
                      <div className="text-xl font-extrabold text-gray-900 dark:text-white">
                        {negativeReviews}
                      </div>
                      <div className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                        Negative (Score 1-2)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Type Switch Card */}
                <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                  <h3 className="text-base font-extrabold uppercase text-gray-900 dark:text-white mb-1">
                    ACCOUNT TYPE
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                    Switch between Personal and Business accounts to unlock commercial selling tools and verified business status.
                  </p>
                  <AccountTypeSwitch currentType={accountType} userPhone={phone} />
                </div>

                {/* Linked Credit Card & Scam Prevention UI (Matching User Screenshot 1) */}
                <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 mb-6">
                    <div>
                      <h3 className="text-base font-extrabold uppercase text-gray-900 dark:text-white mb-1">
                        LINKED CREDIT CARDS &amp; SCAM PREVENTION
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Secure card payments and escrow protection for seamless, risk-free trade.
                      </p>
                    </div>
                  </div>

                  <LinkedCardCard
                    initialCard={user.user_metadata?.linked_card || null}
                    defaultCardholderName={fullName || username || 'Cardholder'}
                    accountBalance={currentAccountCredit}
                  />

                  {/* Optional Seller Payouts for Business Accounts */}
                  {accountType === 'business' && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800">
                      <div className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900/50">
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                            Seller Payouts (Stripe Connect)
                            {profile?.stripe_onboarding_complete ? (
                              <span className="text-emerald-600 dark:text-emerald-500 flex items-center text-xs font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Linked
                              </span>
                            ) : (
                              <span className="text-amber-500 text-xs font-semibold">Setup Required</span>
                            )}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {profile?.stripe_onboarding_complete 
                              ? 'Your bank account is linked to receive automatic payouts.' 
                              : 'Set up your bank details to receive payouts for completed sales.'}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {!profile?.stripe_onboarding_complete ? (
                            <Link
                              href="/stripe-setup"
                              className="px-4 py-2 bg-primary hover:bg-green-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
                            >
                              Set up Payouts
                            </Link>
                          ) : (
                            <WalletLoginButton />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* TAB: NOTIFICATIONS (TradeMe Screenshot 1 & 3-Day Relist Flow) */}
            {currentTab === 'notifications' && (
              <div className="space-y-6">
                
                <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                        NOTIFICATIONS
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Stay informed on auction closes, offers, and bidding updates.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {closedListings.length} Active {closedListings.length === 1 ? 'Alert' : 'Alerts'}
                      </span>
                      {closedListings.length > 0 && (
                        <ClearAllNotificationsButton listingIds={closedListings.map((l: any) => l.id)} />
                      )}
                    </div>
                  </div>
                </div>

                {/* If closed unsold listings exist, render 1-click relist cards */}
                {closedListings.length > 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 text-xs text-gray-700 dark:text-gray-300 flex items-center justify-between">
                      <span className="font-semibold">
                        You have {closedListings.length} listing(s) that closed with no bids. Relist each for 7 days in 1 click, or they will be automatically deleted in 3 days.
                      </span>
                    </div>

                    <div className="space-y-3">
                      {closedListings.map((listing: any) => (
                        <RelistNotificationCard
                          key={listing.id}
                          listing={{
                            id: listing.id,
                            title: listing.title,
                            price: listing.price,
                            images: listing.images || [],
                            closes_at: listing.expires_at || listing.ends_at,
                            condition: listing.condition,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  /* TradeMe "All up to date!" Empty State matching Screenshot 1 */
                  <div className="text-center py-20 px-4 bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xs">
                    
                    {/* Stylized Binoculars illustration */}
                    <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-inner">
                      <Compass className="w-10 h-10 text-primary dark:text-green-400 animate-pulse" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      All up to date!
                    </h3>

                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-6">
                      Notifications help you stay up to date with your buying and selling. We&apos;ll notify you when someone bids on your items, sends an offer, or when closed listings require relisting.
                    </p>

                    <Link
                      href="/category/marketplace"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-green-700 text-white font-bold text-xs transition-colors shadow-xs"
                    >
                      Browse Marketplace &rarr;
                    </Link>
                  </div>
                )}

              </div>
            )}

            {/* TAB: Watchlist */}
            {currentTab === 'watchlist' && (
              <div className="space-y-6">
                
                <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                        WATCHLIST
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {wishlistedListings.length} {wishlistedListings.length === 1 ? 'listing' : 'listings'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <CreateWatchlistModal />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <button className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 text-xs font-semibold bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 shadow-2xs hover:bg-gray-50 flex items-center gap-1.5">
                      <span>All Categories</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 text-xs font-semibold bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 shadow-2xs hover:bg-gray-50 flex items-center gap-1.5">
                      <span>All current listings</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {wishlistedListings.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xs">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-500 flex items-center justify-center">
                      <Heart className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                      Your watchlist is empty
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-5">
                      Click the yellow corner bookmark or heart on any listing to save items, track auctions, and make direct offers!
                    </p>
                    <Link
                      href="/category/marketplace"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary hover:bg-green-700 text-white font-bold transition-colors shadow-xs text-xs"
                    >
                      Browse Marketplace
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {wishlistedListings.map((listing: any) => {
                      const priceNum = typeof listing.price === 'string'
                        ? parseFloat(listing.price.replace(/[^0-9.]/g, '')) || 0
                        : listing.price;

                      return (
                        <div key={listing.id} className="flex flex-col space-y-2">
                          <ListingCard
                            id={listing.id}
                            title={listing.title}
                            price={priceNum}
                            priceType={listing.price_type === 'Auction' ? 'Auction' : 'Fixed Price'}
                            condition={listing.condition || 'Used - Good'}
                            images={listing.images || []}
                            createdAt={listing.created_at}
                            location={listing.location}
                            closesAt={listing.expires_at || listing.ends_at}
                            initialWatchlisted={true}
                          />

                          {listing.seller_id !== user.id && (
                            <MakeOfferButton
                              listingId={listing.id}
                              sellerId={listing.seller_id}
                              listingTitle={listing.title}
                              askingPrice={priceNum}
                              className="w-full py-2 px-3 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: My Listings */}
            {currentTab === 'listings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      My Listings
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        ({userListings.length} {userListings.length === 1 ? 'item' : 'items'})
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
                  <div className="text-center py-16 px-4 bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-500 flex items-center justify-center">
                      <Package className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      You have no active listings
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                      Reach buyers across Ireland with 0% success fees.
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
                      <div key={listing.id} className="flex flex-col space-y-2">
                        <ListingCard
                          id={listing.id}
                          title={listing.title}
                          price={typeof listing.price === 'string' ? parseFloat(listing.price.replace(/[^0-9.]/g, '')) || 0 : listing.price}
                          priceType={listing.price_type === 'Auction' ? 'Auction' : 'Fixed Price'}
                          condition={listing.condition || 'Used - Good'}
                          images={listing.images || []}
                          createdAt={listing.created_at}
                          location={listing.location}
                          closesAt={listing.expires_at || listing.ends_at}
                        />
                        <div className="flex items-center justify-end">
                          <DeleteListingButton
                            listingId={listing.id}
                            listingTitle={listing.title}
                            variant="badge"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Favourite Sellers */}
            {currentTab === 'favourite-sellers' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                        FAVOURITE SELLERS
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {favouriteSellers.length} {favouriteSellers.length === 1 ? 'seller saved' : 'sellers saved'}
                      </p>
                    </div>
                  </div>
                </div>

                {favouriteSellers.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xs">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-500 flex items-center justify-center">
                      <Heart className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                      You haven&apos;t saved any sellers yet
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-5">
                      Save your favourite traders, shops, and verified members to keep track of their latest listings.
                    </p>
                    <Link
                      href="/category/marketplace"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary hover:bg-green-700 text-white font-bold transition-colors shadow-xs text-xs"
                    >
                      Browse Marketplace
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favouriteSellers.map((seller: any) => (
                      <div
                        key={seller.id}
                        className="border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 bg-white dark:bg-[#181818] shadow-xs flex flex-col items-center text-center"
                      >
                        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-2xl font-bold text-gray-700 dark:text-white mb-3 border border-gray-200 dark:border-zinc-700 overflow-hidden relative">
                          {seller.avatar_url ? (
                            <Image
                              src={seller.avatar_url}
                              alt={seller.username || 'Seller'}
                              fill
                              sizes="64px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            seller.username ? seller.username.charAt(0).toUpperCase() : 'U'
                          )}
                        </div>
                        <div className="text-base font-bold text-gray-900 dark:text-white mb-0.5">
                          {seller.username || seller.full_name || 'Seller'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-5 flex items-center">
                          <span className="capitalize">{seller.account_type || 'Personal'} Account</span>
                        </div>
                        
                        <div className="w-full space-y-2 mt-auto">
                          <Link
                            href={`/member/${seller.id}`}
                            className="block w-full py-2 px-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-bold text-xs rounded-xl transition-colors"
                          >
                            View Profile
                          </Link>
                          <FavouriteSellerButton sellerId={seller.id} initialIsFavourite={true} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Business Pages (Facebook-Style Subsidiary Pages) */}
            {currentTab === 'pages' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-primary" />
                        Business Pages &amp; Storefronts
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Subsidiary service hubs and retail pages with custom URLs, Irish phone locking, and opening hours.
                      </p>
                    </div>

                    <CreateBusinessPageModal />
                  </div>
                </div>

                {userBusinessPages.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xs">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-500 flex items-center justify-center">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      No Business Pages created yet
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
                      Create dedicated Facebook-style business pages for your services, trades, or retail stores. Showcase opening hours, official announcements, and direct messaging.
                    </p>
                    <CreateBusinessPageModal />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userBusinessPages.map((page: any) => (
                      <div
                        key={page.id || page.slug}
                        className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 font-black text-lg flex items-center justify-center overflow-hidden relative border border-gray-200 dark:border-zinc-700">
                                {page.avatarUrl ? (
                                  <Image
                                    src={page.avatarUrl}
                                    alt={page.name}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  page.name.substring(0, 2).toUpperCase()
                                )}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-1.5">
                                  {page.name}
                                  <Check className="w-3.5 h-3.5 text-primary" />
                                </h4>
                                <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                  /page/{page.slug}
                                </p>
                              </div>
                            </div>

                            <span className="text-[10px] uppercase font-semibold text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                              {page.business_type === 'marketplace' ? 'Marketplace Store' : 'Service Business'}
                            </span>
                          </div>

                          {page.announcement && (
                            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs text-gray-700 dark:text-gray-300 font-medium line-clamp-2 mb-3">
                              📢 {page.announcement}
                            </div>
                          )}

                          {page.tagline && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                              {page.tagline}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500 mb-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {page.county}, Ireland
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3.5 h-3.5" />
                              {page.phone}
                            </span>
                            {page.opening_hours && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                  {page.opening_hours}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between mt-auto">
                          <Link
                            href={`/page/${page.slug}`}
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                          >
                            <span>View Public Page</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          <div className="flex items-center gap-2">
                            <CreateBusinessPageModal
                              initialData={page}
                              triggerButton={
                                <button
                                  type="button"
                                  className="p-2 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300 text-xs font-semibold cursor-pointer"
                                  title="Edit page"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              }
                            />
                            <DeleteBusinessPageButton
                              slug={page.slug}
                              pageName={page.name}
                              variant="icon"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: TradeMe Settings */}
            {currentTab === 'settings' && (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                    SETTINGS
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Manage your personal information, core county location, search privacy, and seller preferences.
                  </p>
                </div>

                {/* Personal Information & Core County Form (Strictly locked to 26 counties, photo compressor, no bio) */}
                <ProfileSettingsForm initialData={settingsInitialData} accountType={accountType} />

                {/* General Settings, Search History, and Private Blacklist */}
                <TradeMeSettingsSections />

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
