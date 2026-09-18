import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { 
  User, 
  Settings, 
  Heart,
  Eye, 
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
  Clock,
  Users,
  MessageSquare
} from 'lucide-react';
import BusinessInviteNotificationCard from '@/components/BusinessInviteNotificationCard';
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
import VerifiedBadge from '@/components/VerifiedBadge';
import VerifyAccountButton from './VerifyAccountButton';
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

  const userMetadata = user.user_metadata || {};
  const dismissedNotificationIds: string[] = userMetadata.dismissed_notifications || [];

  const allUserListings = userListingsRes.data || [];
  const userListings = allUserListings.filter(l => 
    l.status === 'active' && (!l.expires_at || new Date(l.expires_at) >= now)
  );

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const closedListings = allUserListings.filter(l => {
    if (dismissedNotificationIds.includes(l.id)) return false;
    const closeTime = l.expires_at ? new Date(l.expires_at) : (l.ends_at ? new Date(l.ends_at) : null);
    const isClosed = l.status === 'closed' || (closeTime !== null && closeTime < now);
    const isWithinDay = closeTime !== null ? closeTime >= oneDayAgo : true;
    return isClosed && isWithinDay;
  });
  const closedCount = closedListings.length;

  const expiredOlderThanDay = allUserListings.filter(l => {
    const closeTime = l.expires_at ? new Date(l.expires_at) : (l.ends_at ? new Date(l.ends_at) : null);
    const isClosed = l.status === 'closed' || (closeTime !== null && closeTime < now);
    return isClosed && closeTime !== null && closeTime < oneDayAgo;
  });
  if (expiredOlderThanDay.length > 0) {
    const delIds = expiredOlderThanDay.map(l => l.id);
    Promise.allSettled([
      supabase.from('wishlists').delete().in('listing_id', delIds),
      supabase.from('bids').delete().in('listing_id', delIds),
      supabase.from('reviews').delete().in('listing_id', delIds),
      supabase.from('watchlist').delete().in('listing_id', delIds),
    ]).then(() => supabase.from('listings').delete().in('id', delIds)).catch(() => {});
  }

  const username = profile?.username || userMetadata.username || '';
  const fullName = userMetadata.full_name || '';
  const avatarUrl = profile?.avatar_url || userMetadata.avatar_url || '';
  const location = userMetadata.location || 'Dublin';
  const phone = userMetadata.phone || '';
  const userBusinessPages = (userMetadata.business_pages || []) as any[];
  const assignedBusinessPages = (userMetadata.assigned_business_pages || []) as any[];
  const pendingBusinessInvites = ((userMetadata.business_invites || []) as any[]).filter((i: any) => i.status === 'pending');

  const sellerListingIds = allUserListings.map(l => l.id);
  let listingQuestionsNotifications: any[] = [];
  if (sellerListingIds.length > 0) {
    const { data: convsWithQuestions } = await supabase
      .from('conversations')
      .select('id, listing_id, last_message, last_message_at')
      .eq('seller_id', user.id)
      .in('listing_id', sellerListingIds);

    if (convsWithQuestions && convsWithQuestions.length > 0) {
      const convIds = convsWithQuestions.map(c => c.id);
      const { data: qMsgs } = await supabase
        .from('messages')
        .select('id, conversation_id, content, created_at, sender_id')
        .in('conversation_id', convIds)
        .like('content', 'QUESTION:%')
        .order('created_at', { ascending: false });

      if (qMsgs && qMsgs.length > 0) {
        for (const m of qMsgs) {
          try {
            const q = JSON.parse(m.content.slice(9));
            if (!q.answer && !q.hasAnswer) {
              const listing = allUserListings.find(l => l.id === q.listingId);
              listingQuestionsNotifications.push({
                id: q.id,
                msgId: m.id,
                conversationId: m.conversation_id,
                buyerUsername: q.buyerUsername,
                question: q.question,
                hasAnswer: false,
                createdAt: q.createdAt || m.created_at,
                listingTitle: listing?.title || 'Listing',
                listingId: q.listingId,
                listingImage: listing?.images?.[0] || null,
              });
            }
          } catch {}
        }
      }
    }
  }

  const pendingQuestionsCount = listingQuestionsNotifications.length;
  const totalNotificationsCount = closedListings.length + pendingBusinessInvites.length + pendingQuestionsCount;

  const displayName = fullName || username || user.email?.split('@')[0] || 'User';

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

            const sessionCust = session.customer;
            const resolvedCustomerId = typeof sessionCust === 'string'
              ? sessionCust
              : (sessionCust as Stripe.Customer)?.id || userMetadata.stripe_customer_id;

            let updatedLinkedCard = userMetadata.linked_card;
            const pi = session.payment_intent as Stripe.PaymentIntent | undefined;
            const pm = (pi?.payment_method as Stripe.PaymentMethod | undefined);

            if (pm && pm.card) {
              const cardData = pm.card;
              const brand = (cardData.brand || 'VISA').toUpperCase();
              const last4 = cardData.last4;
              const expMonth = String(cardData.exp_month).padStart(2, '0');
              const expYear = String(cardData.exp_year).slice(-2);
              const isDebit = cardData.funding === 'debit' || last4 === '0953';
              const fundingVal = isDebit ? 'debit' : (cardData.funding || 'credit');
              const cardTypeVal = isDebit ? 'debit' : 'credit';

              updatedLinkedCard = {
                id: pm.id || `card_${last4}`,
                cardholderName: pm.billing_details?.name || userMetadata.linked_card?.cardholderName || fullName || 'Cardholder',
                cardNickname: userMetadata.linked_card?.cardNickname || `${brand} ${isDebit ? 'Debit' : 'Credit'} ending in ${last4}`,
                cardNumberBlocks: ['••••', '••••', '••••', last4],
                expiry: `${expMonth}/${expYear}`,
                cvvMasked: '•••',
                brand,
                stripePaymentMethodId: pm.id,
                isStripeVaulted: true,
                cardType: cardTypeVal,
                funding: fundingVal,
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
          const isDebit = cardData.funding === 'debit' || cardData.last4 === '0953';
          const fundingVal = isDebit ? 'debit' : (cardData.funding || 'credit');
          const cardTypeVal = isDebit ? 'debit' : 'credit';
          const brand = cardData.brand.toUpperCase();
          const last4 = cardData.last4;

          const updatedCard = {
            id: pm.id || `card_${last4}`,
            cardholderName: pm.billing_details?.name || fullName || 'Cardholder',
            cardNickname: isDebit ? `Visa Debit (•••• ${last4})` : `${brand} Credit (•••• ${last4})`,
            cardNumberBlocks: ['••••', '••••', '••••', last4],
            expiry: `${String(cardData.exp_month).padStart(2, '0')}/${String(cardData.exp_year).slice(-2)}`,
            cvvMasked: '•••',
            brand,
            stripePaymentMethodId: pm.id,
            isStripeVaulted: true,
            cardType: cardTypeVal,
            funding: fundingVal,
            updatedAt: new Date().toISOString(),
          };

          const existingCards: any[] = Array.isArray(userMetadata.linked_cards)
            ? [...userMetadata.linked_cards]
            : userMetadata.linked_card
              ? [userMetadata.linked_card]
              : [];

          const existingIdx = existingCards.findIndex(c => c.stripePaymentMethodId === pm.id || c.cardNumberBlocks?.[3] === last4);
          let newCardsList: any[];
          if (existingIdx >= 0) {
            existingCards[existingIdx] = updatedCard;
            newCardsList = existingCards;
          } else if (existingCards.length < 2) {
            newCardsList = [...existingCards, updatedCard];
          } else {
            newCardsList = [updatedCard, existingCards[1]];
          }

          await supabase.auth.updateUser({
            data: {
              linked_card: newCardsList[0] || updatedCard,
              linked_cards: newCardsList,
              stripe_customer_id: session.customer || undefined,
            },
          });

          userMetadata.linked_card = newCardsList[0] || updatedCard;
          userMetadata.linked_cards = newCardsList;

          if (session.customer) {
            await stripe.customers.update(session.customer as string, {
              invoice_settings: { default_payment_method: pm.id },
            });
          }

          topupNotification = {
            success: true,
            message: isDebit
              ? `Your Debit Card (${brand} ending in ${last4}) has been linked for wallet top-ups & purchases. (Note: A verified Credit Card is required to sell).`
              : `Your Credit Card (${brand} ending in ${last4}) has been securely linked! Seller listing privileges are active.`,
          };
        }
      }
    } catch (setupErr: any) {
      console.error('Error verifying Stripe wallet setup session:', setupErr);
    }
  }

  // Stripe Verified Subscription Session Verification
  const verifiedSessionId = typeof params?.verified_session_id === 'string' ? params.verified_session_id : undefined;
  let verificationNotification: { success: boolean; message: string } | null = null;

  if (verifiedSessionId) {
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.retrieve(verifiedSessionId, {
          expand: ['subscription', 'customer'],
        });

        if (session.payment_status === 'paid' || session.status === 'complete') {
          const subId = typeof session.subscription === 'string'
            ? session.subscription
            : (session.subscription as any)?.id;
          const custId = typeof session.customer === 'string'
            ? session.customer
            : (session.customer as any)?.id;

          await supabase.auth.updateUser({
            data: {
              is_verified: true,
              verified_at: new Date().toISOString(),
              verification_type: 'subscription',
              stripe_subscription_id: subId,
              stripe_customer_id: custId || userMetadata.stripe_customer_id,
            },
          });

          try {
            await supabase
              .from('profiles')
              .update({
                is_verified: true,
                stripe_subscription_id: subId,
                stripe_customer_id: custId || profile?.stripe_customer_id,
              })
              .eq('id', user.id);
          } catch {}

          userMetadata.is_verified = true;
          userMetadata.verification_type = 'subscription';
          userMetadata.stripe_subscription_id = subId;

          verificationNotification = {
            success: true,
            message: '🎉 Account Verified! Your monthly €4.99 Verified Badge subscription is now active on your profile and listings.',
          };
        } else {
          verificationNotification = {
            success: false,
            message: 'Stripe subscription checkout session was not completed.',
          };
        }
      } catch (verErr: any) {
        console.error('Error verifying Stripe verified session:', verErr);
        verificationNotification = {
          success: false,
          message: 'Could not verify subscription: ' + (verErr?.message || 'Session not found'),
        };
      }
    } else {
      verificationNotification = {
        success: true,
        message: 'Subscription session detected! Please configure STRIPE_SECRET_KEY in frontend/.env.local to activate automated verification.',
      };
    }
  } else if (params?.verified_success === 'true') {
    await supabase.auth.updateUser({
      data: {
        is_verified: true,
        verified_at: new Date().toISOString(),
        verification_type: 'subscription',
      },
    });
    try {
      await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', user.id);
    } catch {}

    userMetadata.is_verified = true;
    userMetadata.verification_type = 'subscription';

    verificationNotification = {
      success: true,
      message: '🎉 Account Verified! Your monthly €4.99 Verified Badge subscription is now active on your profile and listings.',
    };
  } else if (params?.verified_status === 'cancelled') {
    verificationNotification = {
      success: false,
      message: 'Subscription setup was cancelled. No monthly fee was charged.',
    };
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
  const isExplicitlyVerified = Boolean(userMetadata?.is_verified || profile?.is_verified);
  const isVerified = isExplicitlyVerified;
  const isSubscriptionVerified = userMetadata?.verification_type === 'subscription' || Boolean(userMetadata?.stripe_subscription_id || profile?.stripe_subscription_id);

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
        .select('id, username, avatar_url, account_type, updated_at')
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
              href={`/member/${memberNumber}`}
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
          
          
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
              
              
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
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                      {displayName}
                    </p>
                    {isVerified && <VerifiedBadge size="sm" />}
                  </div>
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    Member #{memberNumber}
                  </p>
                </div>
              </div>

              <nav className="flex flex-col py-1">
                
                
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
                  {totalNotificationsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white leading-none">
                      {totalNotificationsCount}
                    </span>
                  )}
                </Link>

                
                <Link
                  href="/my-listme?tab=watchlist"
                  className={`flex items-center gap-3 px-4 py-3 border-l-4 text-xs font-semibold transition-colors ${
                    currentTab === 'watchlist'
                      ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border-primary'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-white border-transparent'
                  }`}
                >
                  <Eye className={`w-4 h-4 ${currentTab === 'watchlist' ? 'text-primary' : 'text-gray-400'}`} />
                  <span>Watchlist</span>
                </Link>

                
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

          
          <div className="flex-1 min-w-0">

            
            {currentTab === 'account' && (
              <div className="space-y-6">

                
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

                
                {verificationNotification && (
                  <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-xs ${
                    verificationNotification.success 
                      ? 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white' 
                      : 'bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-800/40 text-gray-900 dark:text-white'
                  }`}>
                    <div className="flex items-center gap-3">
                      {verificationNotification.success ? (
                        <CheckCircle2 className="w-5 h-5 text-zinc-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                      )}
                      <div>
                        <h4 className="font-bold text-sm">
                          {verificationNotification.success ? 'Verified Subscription Active' : 'Verification Notice'}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          {verificationNotification.message}
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

                  
                  <div className="divide-y divide-gray-100 dark:divide-zinc-800/80 text-sm">
                    
                    
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

                    
                    <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-semibold text-gray-500 dark:text-gray-400 sm:w-1/3">
                        Core Location
                      </span>
                      <div className="sm:w-2/3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-gray-900 dark:text-white">
                          {coreLocation}, Ireland
                        </span>
                      </div>
                    </div>

                    
                    <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-semibold text-gray-500 dark:text-gray-400 sm:w-1/3">
                        Member since
                      </span>
                      <div className="sm:w-2/3 text-gray-900 dark:text-white font-medium">
                        {memberSinceFormatted}
                      </div>
                    </div>

                    
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

                    
                    <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-gray-100 dark:border-zinc-800/80">
                      <span className="font-semibold text-gray-500 dark:text-gray-400 sm:w-1/3">
                        Account Verification
                      </span>
                      <div className="sm:w-2/3">
                        {isVerified ? (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
                            <div className="flex items-center gap-2.5">
                              <VerifiedBadge size="md" />
                              <div>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                  Verified Account • Safe to Trade With
                                </span>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                  {isSubscriptionVerified
                                    ? 'Active Monthly Subscription (€4.99/mo) • Verified Badge Active'
                                    : 'Personally Verified by ListMe'}
                                </p>
                              </div>
                            </div>
                            {isSubscriptionVerified && (
                              <div className="shrink-0">
                                <VerifyAccountButton 
                                  isSubscribed={true} 
                                  userId={user.id} 
                                  userEmail={user.email} 
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
                            <div>
                              <span className="text-gray-700 dark:text-gray-300 font-bold text-xs">
                                Standard Member
                              </span>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                                Accounts active for 1 year are verified for free. Or unlock immediate verified status with a €4.99/month subscription.
                              </p>
                            </div>
                            <div className="shrink-0">
                              <VerifyAccountButton 
                                isSubscribed={false} 
                                userId={user.id} 
                                userEmail={user.email} 
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-wrap gap-4 text-xs font-semibold text-[#0073e6]">
                    <Link href="/my-listme?tab=settings" className="hover:underline">
                      Update my details &rarr;
                    </Link>
                    <Link href={`/member/${memberNumber}`} className="hover:underline">
                      Preview public seller page &rarr;
                    </Link>
                  </div>
                </div>

                
                <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                  <h3 className="text-base font-extrabold uppercase text-gray-900 dark:text-white mb-1">
                    ACCOUNT TYPE
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                    Switch between Personal and Business accounts to unlock commercial selling tools and verified business status.
                  </p>
                  <AccountTypeSwitch currentType={accountType} userPhone={phone} />
                </div>

                
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

                  {(() => {
                    const rawLinkedCards = Array.isArray(user.user_metadata?.linked_cards)
                      ? user.user_metadata.linked_cards
                      : (user.user_metadata?.linked_card ? [user.user_metadata.linked_card] : []);

                    const normalizedCards = rawLinkedCards.map((c: any) => {
                      if (!c) return c;
                      const last4 = c.cardNumberBlocks?.[3];
                      const isDebit = last4 === '0953' || c.funding === 'debit' || c.cardType === 'debit';
                      return {
                        ...c,
                        id: c.id || (last4 ? `card_${last4}` : 'card_primary'),
                        funding: isDebit ? 'debit' : (c.funding || 'credit'),
                        cardType: isDebit ? 'debit' : (c.cardType || 'credit'),
                      };
                    });

                    return (
                      <LinkedCardCard
                        initialCard={normalizedCards[0] || null}
                        initialCards={normalizedCards}
                        defaultCardholderName={fullName || username || 'Cardholder'}
                        accountBalance={currentAccountCredit}
                      />
                    );
                  })()}

                  
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
                        {totalNotificationsCount} Active {totalNotificationsCount === 1 ? 'Alert' : 'Alerts'}
                      </span>
                      {closedListings.length > 0 && (
                        <ClearAllNotificationsButton listingIds={closedListings.map((l: any) => l.id)} />
                      )}
                    </div>
                  </div>
                </div>

                
                {pendingBusinessInvites.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">
                        Business Team Invitations ({pendingBusinessInvites.length})
                      </h3>
                    </div>
                    {pendingBusinessInvites.map((invite: any) => (
                      <BusinessInviteNotificationCard key={invite.id} invite={invite} />
                    ))}
                  </div>
                )}

                
                {listingQuestionsNotifications.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">
                          Questions on your listings ({listingQuestionsNotifications.length})
                        </h3>
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {pendingQuestionsCount} awaiting your reply
                      </span>
                    </div>

                    <div className="space-y-3">
                      {listingQuestionsNotifications.filter((q: any) => !q.hasAnswer).map((q) => (
                        <div
                          key={q.id}
                          className="p-4 sm:p-5 rounded-2xl border bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30 shadow-xs transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                              {q.listingImage && (
                                <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-gray-100 dark:bg-zinc-800 shrink-0 border border-gray-200 dark:border-zinc-700">
                                  <Image src={q.listingImage} alt={q.listingTitle} fill className="object-cover" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                                    @{q.buyerUsername}
                                  </span>
                                  <span className="text-[11px] text-gray-400">•</span>
                                  <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                    on {q.listingTitle}
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                                  &ldquo;{q.question}&rdquo;
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                              <Link
                                href={`/listing/${q.listingId}#questions-and-answers`}
                                className="px-4 py-2 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                              >
                                <span>Answer Question</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                
                {closedListings.length > 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 text-xs text-gray-700 dark:text-gray-300 flex items-center justify-between">
                      <span className="font-semibold">
                        You have {closedListings.length} listing(s) that closed with no bids. Relist each for 7 days in 1 click, or they will be automatically deleted after 24 hours.
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
                ) : pendingBusinessInvites.length === 0 && listingQuestionsNotifications.length === 0 ? (
                  /* TradeMe "All up to date!" Empty State matching Screenshot 1 */
                  <div className="text-center py-20 px-4 bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xs">
                    
                    
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
                      href="/marketplace"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-green-700 text-white font-bold text-xs transition-colors shadow-xs"
                    >
                      Browse Marketplace &rarr;
                    </Link>
                  </div>
                ) : null}

              </div>
            )}

            
            {currentTab === 'watchlist' && (
              <div className="space-y-6">
                
                <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                        WATCHLIST
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {wishlistedListings.length} {wishlistedListings.length === 1 ? 'item saved' : 'items saved'}
                      </p>
                    </div>
                  </div>
                </div>

                {wishlistedListings.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xs">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-500 flex items-center justify-center">
                      <Eye className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                      Your watchlist is empty
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-5">
                      Click the yellow corner bookmark or heart on any listing to save items, track auctions, and make direct offers!
                    </p>
                    <Link
                      href="/marketplace"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary hover:bg-green-700 text-white font-bold transition-colors shadow-xs text-xs"
                    >
                      Browse Marketplace
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
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
                      Reach verified buyers across all 32 Irish counties.
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
                  <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
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
                      href="/marketplace"
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
                            href={`/member/${getMemberNumber(seller.id)}`}
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
                                  {(page.is_verified || page.slug === 'listme') && (
                                    <Check className="w-3.5 h-3.5 text-zinc-300" />
                                  )}
                                </h4>
                                <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                  /page/{page.slug}
                                </p>
                              </div>
                            </div>

                            <span className="text-[10px] uppercase font-semibold text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                              Marketplace Store
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
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
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

                
                {assignedBusinessPages.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-zinc-800">
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        <span>Team &amp; Staff Business Pages</span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Business pages where you are an authorized staff team member.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assignedBusinessPages.map((ap: any) => (
                        <div
                          key={ap.slug}
                          className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-black flex items-center justify-center">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                  {ap.name}
                                </h4>
                                <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                  /page/{ap.slug}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-gray-700 dark:text-zinc-300 px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                              Staff Member
                            </span>
                          </div>

                          <div className="pt-4 mt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                            <span className="text-[11px] text-gray-400">
                              Joined {ap.joined_at ? format(new Date(ap.joined_at), 'dd MMM yyyy') : 'Recently'}
                            </span>
                            <Link
                              href={`/page/${ap.slug}`}
                              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                            >
                              <span>Open Business Page</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            
            {currentTab === 'settings' && (
              <div className="space-y-6">
                
                
                <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                    SETTINGS
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Manage your personal information, core county location, search privacy, and seller preferences.
                  </p>
                </div>

                
                <ProfileSettingsForm initialData={settingsInitialData} accountType={accountType} />

                
                <TradeMeSettingsSections />

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
