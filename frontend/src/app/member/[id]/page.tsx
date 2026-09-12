import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Package, 
  MessageSquare, 
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { ListingCard } from '@/components/ListingCard';
import FavouriteSellerButton from '@/components/FavouriteSellerButton';
import { getCoreLocation, getMemberNumber } from '@/utils/irelandLocations';
import { cookies } from 'next/headers';
import VerifiedBadge from '@/components/VerifiedBadge';
import MemberAdminActions from '@/components/MemberAdminActions';
import { isAdmin, isAccountBanned } from '@/utils/admin';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Always serve real-time dynamic profile data without stale cache
export const dynamic = 'force-dynamic';

interface MemberPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MemberProfilePage({ params, searchParams }: MemberPageProps) {
  const { id } = await params;
  const sParams = await searchParams;
  const activeTab = (typeof sParams?.tab === 'string' ? sParams.tab : 'listings').toLowerCase() === 'feedback' ? 'feedback' : 'listings';

  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore.getAll().some(c => c.name.includes('-auth-token'));
  const supabase = await createClient();

  // 1. If accessed via UUID, seamlessly redirect to deterministic member number URL (#/id)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUuid) {
    const memberNum = getMemberNumber(id);
    const searchEntries = Object.entries(sParams || {}).filter(([_, v]) => typeof v === 'string') as [string, string][];
    const searchStr = searchEntries.length > 0 ? `?${new URLSearchParams(searchEntries).toString()}` : '';
    redirect(`/member/${memberNum}${searchStr}`);
  }

  // 2. Get current logged-in user (only if session cookie present)
  const currentUser = hasAuthCookie ? (await supabase.auth.getUser()).data.user : null;
  const currentUserIsAdmin = isAdmin(currentUser);

  // 3. Resolve profile by member number or username
  let profile: any = null;
  const { data: allProfiles } = await supabase.from('profiles').select('*');

  if (allProfiles && allProfiles.length > 0) {
    // Attempt 1: Match by deterministic member number
    profile = allProfiles.find((p: any) => getMemberNumber(p.id).toString() === id);

    // Attempt 2: Match by username (case-insensitive)
    if (!profile) {
      profile = allProfiles.find((p: any) => p.username?.toLowerCase() === id.toLowerCase());
      // If found by username, redirect to member number for canonical URL
      if (profile) {
        const memberNum = getMemberNumber(profile.id);
        const searchEntries = Object.entries(sParams || {}).filter(([_, v]) => typeof v === 'string') as [string, string][];
        const searchStr = searchEntries.length > 0 ? `?${new URLSearchParams(searchEntries).toString()}` : '';
        redirect(`/member/${memberNum}${searchStr}`);
      }
    }
  }

  // Fallback: If not found in public.profiles, look up via admin client from auth.users
  if (!profile && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      const { data: { users } } = await adminClient.auth.admin.listUsers();
      const matched = users?.find(u => getMemberNumber(u.id).toString() === id || u.user_metadata?.username?.toLowerCase() === id.toLowerCase() || u.id === id);
      if (matched) {
        profile = {
          id: matched.id,
          username: matched.user_metadata?.username || matched.user_metadata?.full_name || matched.email?.split('@')[0],
          email: matched.email,
          avatar_url: matched.user_metadata?.avatar_url,
          account_type: matched.user_metadata?.account_type || 'personal',
          created_at: matched.created_at,
          is_verified: matched.user_metadata?.is_verified,
          location: matched.user_metadata?.location,
        };
      }
    } catch (err) {
      console.warn('Admin user lookup note:', err);
    }
  }

  if (!profile) {
    notFound();
  }

  const sellerId = profile.id;
  const isOwnProfile = Boolean(currentUser && currentUser.id === sellerId);

  // 4. Retrieve complete real user metadata (avatar, verified, location, email)
  let targetUserMeta: any = {};
  let targetUserEmail: string = profile.email || '';
  if (isOwnProfile && currentUser) {
    targetUserMeta = currentUser.user_metadata || {};
    targetUserEmail = currentUser.email || targetUserEmail;
  } else if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      const { data: { user: authUser } } = await adminClient.auth.admin.getUserById(sellerId);
      if (authUser) {
        targetUserMeta = authUser.user_metadata || {};
        targetUserEmail = authUser.email || targetUserEmail;
      }
    } catch {}
  }

  // Check ban status & admin status of target user
  const banStatus = isAccountBanned(profile);
  const targetIsAdmin = Boolean(
    isAdmin({
      ...profile,
      email: targetUserEmail,
      user_metadata: targetUserMeta,
    }) ||
    profile.role === 'admin' ||
    profile.is_admin ||
    targetUserMeta.role === 'admin' ||
    targetUserMeta.is_admin
  );

  // 5. Concurrently fetch all active listings, reviews, and favourite status
  const now = new Date();
  const [allListingsResult, reviewsResult, favouriteResult] = await Promise.all([
    supabase
      .from('listings')
      .select('id, title, price, price_type, condition, images, created_at, location, expires_at, ends_at, status, description')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false }),
    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, reviewer_id')
      .eq('reviewee_id', sellerId)
      .order('created_at', { ascending: false }),
    currentUser && !isOwnProfile
      ? supabase.from('favourite_sellers').select('id').eq('user_id', currentUser.id).eq('seller_id', sellerId).maybeSingle()
      : Promise.resolve({ data: null })
  ]);

  const rawListings = allListingsResult.data || [];
  const activeListings = rawListings.filter(l => 
    l.status === 'active' && (!l.expires_at || new Date(l.expires_at) >= now)
  );
  const reviews = reviewsResult.data || [];
  const isFavourited = !!favouriteResult.data;

  // Derive identity and metadata
  const avatarUrl = profile.avatar_url || targetUserMeta.avatar_url || '';
  const displayName = targetUserMeta.full_name || profile.username || targetUserMeta.username || 'Member';
  const rawLocation = targetUserMeta.location || profile.location || (rawListings[0]?.location) || 'Dublin';
  const coreLocation = getCoreLocation(rawLocation);
  const accountType = (profile.account_type || targetUserMeta.account_type || 'personal').toLowerCase();
  const memberNumber = getMemberNumber(sellerId);

  // Dates & verification
  const memberSinceDate = profile.created_at ? new Date(profile.created_at) : (profile.updated_at ? new Date(profile.updated_at) : new Date(2023, 0, 1));
  const memberSinceFormatted = format(memberSinceDate, 'EEEE, d MMMM yyyy');
  const isOneYearOld = Date.now() - memberSinceDate.getTime() >= 365 * 24 * 60 * 60 * 1000;
  const isExplicitlyVerified = Boolean(profile.is_verified || targetUserMeta.is_verified || targetUserMeta.verification_type === 'paid');
  const isVerified = isOneYearOld || isExplicitlyVerified;

  // Feedback calculation
  const totalReviews = reviews.length;
  const positiveReviews = reviews.filter((r) => r.rating >= 4).length;
  const neutralReviews = reviews.filter((r) => r.rating === 3).length;
  const negativeReviews = reviews.filter((r) => r.rating <= 2).length;
  const feedbackPercentage = totalReviews > 0 ? ((positiveReviews / totalReviews) * 100).toFixed(1) : '100';

  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Admin Moderation Panel (visible only to platform administrators) */}
        {currentUserIsAdmin && !isOwnProfile && (
          <MemberAdminActions
            targetUserId={sellerId}
            targetUsername={displayName}
            isCurrentlyVerified={isVerified}
            isCurrentlyAdmin={targetIsAdmin}
            banStatus={banStatus}
          />
        )}

        {/* Account Suspended Alert Banner */}
        {banStatus.isBanned && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-3">
            <span className="p-2 rounded-xl bg-red-900/80 font-bold">SUSPENDED</span>
            <div>
              <p className="font-bold text-sm text-white">This account is currently suspended</p>
              <p className="text-red-300 mt-0.5">
                Reason: {banStatus.reason}
                {banStatus.bannedUntil ? ` • Active until ${new Date(banStatus.bannedUntil).toLocaleDateString()}` : ' • Permanent ban'}
              </p>
            </div>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-6 space-x-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/category/marketplace" className="hover:text-primary transition-colors">Members</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium truncate">{displayName} (#{memberNumber})</span>
        </nav>

        {/* TradeMe-Style Member Profile Card */}
        <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-zinc-800">
              
              {/* Left Column: Avatar & Basic Details */}
              <div className="flex items-center gap-5">
                {/* TradeMe Circle Avatar */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 relative shadow-sm">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      fill
                      sizes="96px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl font-black text-gray-700 dark:text-gray-300">
                      {initials}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight truncate">
                      {displayName}
                    </h1>
                    {isVerified && (
                      <VerifiedBadge
                        size="md"
                        tooltipText={
                          isOneYearOld
                            ? 'Verified Account • Safe to Trade With (1+ Year Active Platform Veteran)'
                            : 'Verified Account • Safe to Trade With (Personally verified by ListMe)'
                        }
                      />
                    )}
                    {targetIsAdmin && (
                      <span className="text-xs font-bold text-amber-500 dark:text-amber-400">
                        ListMe Staff
                      </span>
                    )}
                    {accountType === 'business' && (
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        Business Account
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-mono font-bold text-gray-500 dark:text-gray-400 mt-1">
                    Member #{memberNumber}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {totalReviews > 0 ? `${feedbackPercentage}% positive feedback` : '100% positive feedback'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({totalReviews > 0 ? `${totalReviews} reviews` : 'New Member'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3">
                {isOwnProfile ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/my-listme?tab=settings"
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-800 dark:text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      Edit Profile
                    </Link>
                    <Link
                      href="/sell"
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold shadow-xs transition-colors gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>List Item</span>
                    </Link>
                  </div>
                ) : (
                  <div className="w-full sm:w-auto">
                    <FavouriteSellerButton sellerId={sellerId} initialIsFavourite={isFavourited} />
                  </div>
                )}
              </div>
            </div>

            {/* Middle Row: TradeMe Meta Information Table */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-sm">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-100 dark:border-zinc-800/80">
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Core Location</div>
                  <div className="font-bold text-gray-900 dark:text-white">{coreLocation}, Ireland</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-100 dark:border-zinc-800/80">
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Member Since</div>
                  <div className="font-bold text-gray-900 dark:text-white">{memberSinceFormatted}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-100 dark:border-zinc-800/80">
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Authentication Status</div>
                  <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    {isVerified ? (
                      <>
                        <VerifiedBadge size="xs" />
                        <span>Verified Safe Trader</span>
                      </>
                    ) : (
                      <span>Phone &amp; Email Protected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TradeMe Profile Navigation Tabs */}
          <div className="border-t border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#151515] px-6 sm:px-8 flex space-x-8 text-sm font-semibold overflow-x-auto">
            <Link
              href={`/member/${memberNumber}?tab=listings`}
              className={`py-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'listings'
                  ? 'border-primary text-primary dark:text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Active Listings ({activeListings.length})</span>
            </Link>

            <Link
              href={`/member/${memberNumber}?tab=feedback`}
              className={`py-4 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'feedback'
                  ? 'border-primary text-primary dark:text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Feedback &amp; Reviews ({totalReviews})</span>
            </Link>
          </div>
        </div>

        {/* TAB 1: Active Listings */}
        {activeTab === 'listings' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Active Listings from {displayName} ({activeListings.length})
              </h2>
              {isOwnProfile && (
                <Link
                  href="/sell"
                  className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Listing</span>
                </Link>
              )}
            </div>

            {activeListings.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white dark:bg-[#181818] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  No active listings right now
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
                  {displayName} currently doesn&apos;t have any active items listed.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {isOwnProfile ? (
                    <Link
                      href="/sell"
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-green-700 text-xs font-bold text-white transition-colors"
                    >
                      Create Your First Listing
                    </Link>
                  ) : (
                    <FavouriteSellerButton sellerId={sellerId} initialIsFavourite={isFavourited} />
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                {activeListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    id={listing.id}
                    title={listing.title}
                    price={listing.price}
                    priceType={listing.price_type}
                    condition={listing.condition}
                    images={listing.images}
                    createdAt={listing.created_at}
                    location={listing.location || coreLocation}
                    closesAt={listing.expires_at || listing.ends_at}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Feedback & Reviews */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            {/* Feedback Breakdown Stats */}
            <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Feedback Summary
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 text-center">
                  <div className="text-2xl font-black text-gray-900 dark:text-white">
                    {positiveReviews}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
                    Positive (Score 4-5)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 text-center">
                  <div className="text-2xl font-black text-gray-900 dark:text-white">
                    {neutralReviews}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
                    Neutral (Score 3)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 text-center">
                  <div className="text-2xl font-black text-gray-900 dark:text-white">
                    {negativeReviews}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
                    Negative (Score 1-2)
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Reviews List */}
            <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Recent Reviews ({reviews.length})
              </h3>

              {reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
                  No reviews submitted yet for this member.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {reviews.map((rev: any) => (
                    <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            Score: {rev.rating} / 5
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {format(new Date(rev.created_at), 'd MMM yyyy')}
                        </span>
                      </div>
                      {rev.comment && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {rev.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
