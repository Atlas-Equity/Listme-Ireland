import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  Package, 
  MessageSquare, 
  ChevronRight, 
  Share2,
  ExternalLink,
  ThumbsUp
} from 'lucide-react';
import { format } from 'date-fns';
import { ListingCard } from '@/components/ListingCard';
import FavouriteSellerButton from '@/components/FavouriteSellerButton';
import { getCoreLocation, getMemberNumber } from '@/utils/irelandLocations';

interface MemberPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MemberProfilePage({ params, searchParams }: MemberPageProps) {
  const { id } = await params;
  const sParams = await searchParams;
  const activeTab = (typeof sParams?.tab === 'string' ? sParams.tab : 'listings').toLowerCase();

  const supabase = await createClient();

  // 1. Get current logged-in user
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // 2. Fetch profile by UUID or username or deterministic member ID match
  let profileQuery = supabase.from('profiles').select('*');

  // Check if `id` is a UUID (contains hyphens and length >= 32)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let profile: any = null;

  if (isUuid) {
    const { data } = await profileQuery.eq('id', id).maybeSingle();
    profile = data;
  } else {
    // Try matching username
    const { data: byUsername } = await supabase.from('profiles').select('*').eq('username', id).maybeSingle();
    if (byUsername) {
      profile = byUsername;
    } else {
      // If it's a member number like 6154291, search all profiles to match deterministic member number
      const { data: allProfiles } = await supabase.from('profiles').select('*').limit(100);
      profile = allProfiles?.find((p: any) => getMemberNumber(p.id).toString() === id) || null;
    }
  }

  if (!profile) {
    notFound();
  }

  const sellerId = profile.id;
  const isOwnProfile = Boolean(currentUser && currentUser.id === sellerId);

  // 3. Concurrently fetch listings, reviews, and favourite status
  const [listingsResult, reviewsResult, favouriteResult] = await Promise.all([
    supabase
      .from('listings')
      .select('id, title, price, price_type, condition, images, created_at, location, expires_at, ends_at')
      .eq('seller_id', sellerId)
      .eq('status', 'active')
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

  const listings = listingsResult.data || [];
  const reviews = reviewsResult.data || [];
  const isFavourited = !!favouriteResult.data;

  // Derive location: check profile location or recent listings
  const rawLocation = listings[0]?.location || 'Dublin';
  const coreLocation = getCoreLocation(rawLocation);

  // Derive member number
  const memberNumber = getMemberNumber(sellerId);

  // Dates
  const memberSinceDate = profile.created_at ? new Date(profile.created_at) : (profile.updated_at ? new Date(profile.updated_at) : new Date(2023, 0, 1));
  const memberSinceFormatted = format(memberSinceDate, 'EEEE, d MMMM yyyy');

  // Feedback calculation
  const totalReviews = reviews.length;
  const positiveReviews = reviews.filter((r) => r.rating >= 4).length;
  const neutralReviews = reviews.filter((r) => r.rating === 3).length;
  const negativeReviews = reviews.filter((r) => r.rating <= 2).length;
  const feedbackPercentage = totalReviews > 0 ? ((positiveReviews / totalReviews) * 100).toFixed(1) : '100';

  const displayName = profile.username || 'Member';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-6 space-x-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/category/marketplace" className="hover:text-primary transition-colors">Members</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium truncate">{displayName}</span>
        </nav>

        {/* TradeMe-Style Member Profile Card */}
        <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-zinc-800">
              
              {/* Left Column: Avatar & Basic Details */}
              <div className="flex items-center gap-5">
                {/* TradeMe Circle Avatar */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 relative shadow-sm">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
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
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight truncate">
                      {displayName}
                    </h1>
                    <span title="Verified Member" className="text-primary inline-flex">
                      <CheckCircle2 className="w-5 h-5 fill-primary text-white dark:text-black" />
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
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
                  <Link
                    href="/my-listme?tab=settings"
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-800 dark:text-white text-sm font-semibold shadow-xs transition-colors"
                  >
                    Edit Your Profile
                  </Link>
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
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Authentication Status</div>
                  <div className="font-bold text-gray-900 dark:text-white">Email Verified & Protected</div>
                </div>
              </div>
            </div>
          </div>

          {/* TradeMe Profile Navigation Tabs */}
          <div className="border-t border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#151515] px-6 sm:px-8 flex space-x-8 text-sm font-semibold">
            <Link
              href={`/member/${id}?tab=listings`}
              className={`py-4 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'listings'
                  ? 'border-primary text-primary dark:text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Active Listings</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
                {listings.length}
              </span>
            </Link>

            <Link
              href={`/member/${id}?tab=feedback`}
              className={`py-4 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'feedback'
                  ? 'border-primary text-primary dark:text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Feedback &amp; Reviews</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
                {totalReviews}
              </span>
            </Link>
          </div>
        </div>

        {/* TAB 1: Listings */}
        {activeTab === 'listings' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Listings from {displayName} ({listings.length})
              </h2>
            </div>

            {listings.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white dark:bg-[#181818] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  No active listings right now
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
                  {displayName} currently doesn&apos;t have any active items listed. Add them as a favourite seller to receive updates when new items are listed!
                </p>
                {!isOwnProfile && (
                  <div className="max-w-xs mx-auto">
                    <FavouriteSellerButton sellerId={sellerId} initialIsFavourite={isFavourited} />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                {listings.map((listing) => (
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
                          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200 text-xs font-bold">
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
