import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Clock, MapPin, ShieldCheck, Info, ChevronRight, Banknote, Store } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { getAllRegisteredBusinessPages, BusinessPageData } from '@/app/actions/businessPages';
import Link from 'next/link';
import Image from 'next/image';
import CheckoutButton from '@/components/CheckoutButton';
import ListingCarousel from '@/components/ListingCarousel';
import WatchlistButton from '@/components/WatchlistButton';
import BiddingForm from '@/components/BiddingForm';
import FavouriteSellerButton from '@/components/FavouriteSellerButton';
import MakeOfferButton from '@/components/MakeOfferButton';
import ServiceFeeModal from '@/components/ServiceFeeModal';
import DeleteListingButton from '@/components/DeleteListingButton';
import ListingQuestionsSection from '@/components/ListingQuestionsSection';
import { getListingQuestions } from '@/app/actions/listingQuestions';
import { Metadata } from 'next';
import { getCoreLocation, getMemberNumber } from '@/utils/irelandLocations';
import { cookies } from 'next/headers';
import VerifiedBadge from '@/components/VerifiedBadge';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from('listings')
    .select('title, description, price, price_type, images, location, category')
    .eq('id', id)
    .maybeSingle();

  if (!listing) {
    return {
      title: 'Listing Not Found | ListMe Ireland',
    };
  }

  const cleanDescription = listing.description
    ? listing.description.replace(/<[^>]*>?/gm, '').slice(0, 160)
    : `Buy ${listing.title} for €${listing.price} on ListMe Ireland. Located in ${listing.location || 'Ireland'}.`;

  const firstImage = Array.isArray(listing.images) && listing.images.length > 0 ? listing.images[0] : '/clover-logo.png';
  const priceDisplay = listing.price != null ? `€${Number(listing.price).toLocaleString('en-IE')}` : '';

  return {
    title: `${listing.title} ${priceDisplay ? `(${priceDisplay})` : ''}`,
    description: cleanDescription,
    alternates: {
      canonical: `/listing/${id}`,
    },
    openGraph: {
      title: `${listing.title} ${priceDisplay ? `• ${priceDisplay}` : ''} | ListMe Ireland`,
      description: cleanDescription,
      url: `/listing/${id}`,
      siteName: 'ListMe Ireland',
      images: [
        {
          url: firstImage,
          width: 800,
          height: 600,
          alt: listing.title,
        },
      ],
      locale: 'en_IE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${listing.title} ${priceDisplay ? `• ${priceDisplay}` : ''} | ListMe Ireland`,
      description: cleanDescription,
      images: [firstImage],
    },
  };
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore.getAll().some(c => c.name.includes('-auth-token'));
  const supabase = await createClient();

  const [userResult, listingResult] = await Promise.all([
    hasAuthCookie ? supabase.auth.getUser() : Promise.resolve({ data: { user: null } }),
    supabase.from('listings').select('*').eq('id', id).single()
  ]);

  const user = userResult.data?.user;
  const listing = listingResult.data;

  if (listingResult.error || !listing) {
    console.error('Error fetching listing:', listingResult.error);
    notFound();
  }

  const isAuction = listing.price_type?.toLowerCase() === 'auction';
  const isOwnListing = Boolean(user && user.id === listing.seller_id);

  const sellerCache = (globalThis as any).__sellerProfileCache ?? new Map<string, any>();
  (globalThis as any).__sellerProfileCache = sellerCache;
  const cachedSeller = sellerCache.get(listing.seller_id);

  const reviewsCache = (globalThis as any).__sellerReviewsCache ?? new Map<string, any>();
  (globalThis as any).__sellerReviewsCache = reviewsCache;
  const cachedReviews = reviewsCache.get(listing.seller_id);

  const [
    sellerResult,
    reviewsResult,
    bidsResult,
    watchlistResult,
    favouriteResult,
    initialQuestions
  ] = await Promise.all([
    cachedSeller && Date.now() < cachedSeller.expiresAt
      ? Promise.resolve({ data: cachedSeller.data })
      : supabase.from('profiles').select('id, username, account_type, updated_at, avatar_url').eq('id', listing.seller_id).maybeSingle().then(res => {
          if (res.data) sellerCache.set(listing.seller_id, { data: res.data, expiresAt: Date.now() + 60 * 1000 });
          return res;
        }),
    cachedReviews && Date.now() < cachedReviews.expiresAt
      ? Promise.resolve({ data: cachedReviews.data })
      : supabase.from('reviews').select('rating').eq('reviewee_id', listing.seller_id).then(res => {
          if (res.data) reviewsCache.set(listing.seller_id, { data: res.data, expiresAt: Date.now() + 60 * 1000 });
          return res;
        }),
    isAuction 
      ? supabase.from('bids').select('amount', { count: 'exact' }).eq('listing_id', id).order('amount', { ascending: false }).limit(1)
      : Promise.resolve({ data: null, count: 0 }),
    user 
      ? supabase.from('wishlists').select('id').eq('user_id', user.id).eq('listing_id', id).maybeSingle()
      : Promise.resolve({ data: null }),
    user && !isOwnListing
      ? supabase.from('favourite_sellers').select('id').eq('user_id', user.id).eq('seller_id', listing.seller_id).maybeSingle()
      : Promise.resolve({ data: null }),
    getListingQuestions(id),
  ]);

  const currentUser = user ? {
    id: user.id,
    username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
    avatarUrl: user.user_metadata?.avatar_url,
  } : null;

  const seller = sellerResult.data;
  const reviews = reviewsResult.data;
  const isWatchlisted = !!watchlistResult.data;
  const isSellerFavourited = !!favouriteResult.data;

  const sellerDisplayName = seller?.username || (isOwnListing ? (user?.user_metadata?.username || user?.email?.split('@')[0] || 'You') : 'Seller');
  const sellerAvatarUrl = seller?.avatar_url || (isOwnListing ? user?.user_metadata?.avatar_url : undefined);
  const sellerInitial = sellerDisplayName.charAt(0).toUpperCase();
  const memberSinceDate = seller?.updated_at ? new Date(seller.updated_at) : (listing.created_at ? new Date(listing.created_at) : new Date());
  const memberSinceText = format(memberSinceDate, 'MMMM yyyy');
  const isSellerOneYearOld = seller?.updated_at ? Date.now() - new Date(seller.updated_at).getTime() >= 365 * 24 * 60 * 60 * 1000 : false;
  const isSellerVerified = Boolean(isSellerOneYearOld || (seller as any)?.is_verified || (seller as any)?.user_metadata?.is_verified);

  const bizMatch = listing.description?.match(/\[Business Page:\s*([a-z0-9-]+)(?:\s*\|\s*([^\]]+))?\]/i);
  const businessSlug = (listing as any).business_page_slug || (bizMatch ? bizMatch[1].trim().toLowerCase() : null);

  let listingBusinessPage: BusinessPageData | null = null;
  if (businessSlug) {
    const allBiz = await getAllRegisteredBusinessPages();
    listingBusinessPage = allBiz.find(b => b.slug?.toLowerCase() === businessSlug.toLowerCase()) || null;
  }

  const buyNowMatch = listing.description?.match(/\[Buy It Now:\s*€?([0-9.]+)\]/i);
  const rawBuyNowPrice: number | null = listing.buy_now_price || (buyNowMatch ? parseFloat(buyNowMatch[1]) : null);
  const cleanDescription = listing.description 
    ? listing.description
        .replace(/\[Buy It Now:\s*€?[0-9.]+\]/gi, '')
        .replace(/\[Business Page:[^\]]+\]/gi, '')
        .replace(/\[Job:[^\]]+\]/gi, '')
        .replace(/\[Service:[^\]]+\]/gi, '')
        .trim() 
    : '';

  let highestBidAmount = null;
  const totalBids = bidsResult.count || 0;
  if (isAuction && bidsResult.data && bidsResult.data.length > 0) {
    highestBidAmount = bidsResult.data[0].amount;
  }

  const isBuyNowOverriddenByBid = rawBuyNowPrice !== null && highestBidAmount !== null && highestBidAmount >= rawBuyNowPrice;
  const buyNowPrice: number | null = isBuyNowOverriddenByBid ? null : rawBuyNowPrice;

  const currentPrice = highestBidAmount !== null ? highestBidAmount : listing.price;
  const minNextBid = highestBidAmount !== null ? highestBidAmount + 1 : listing.price;

  const totalReviews = reviews?.length || 0;
  const positiveReviews = reviews?.filter((r: any) => r.rating >= 4).length || 0;
  const feedbackPercentage = totalReviews > 0 
    ? Math.round((positiveReviews / totalReviews) * 100) 
    : 0;

  const expirationDate = listing.expires_at 
    ? new Date(listing.expires_at) 
    : new Date(new Date(listing.created_at).getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const isClosed = expirationDate < new Date();
  const timeRemaining = isClosed ? 'Closed' : formatDistanceToNow(expirationDate);

  const itemLocation = getCoreLocation(listing.location);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.listme.ie';
  const firstImage = Array.isArray(listing.images) && listing.images.length > 0 ? listing.images[0] : `${siteUrl}/clover-logo.png`;
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description || listing.title,
    image: Array.isArray(listing.images) && listing.images.length > 0 ? listing.images : [firstImage],
    category: listing.category || 'Marketplace',
    offers: {
      '@type': 'Offer',
      price: listing.price != null ? Number(listing.price) : 0,
      priceCurrency: 'EUR',
      availability: isClosed ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      itemCondition: listing.condition?.toLowerCase() === 'brand new' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
      url: `${siteUrl}/listing/${id}`,
      seller: {
        '@type': 'Person',
        name: seller?.username || 'ListMe Member',
      },
    },
  };

  // Ensure payment options is an array
  const paymentOptions: string[] = listing.payment_options || ['cash'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        
        <div className="flex items-center text-xs text-blue-400 mb-6">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2 text-gray-500">/</span>
          <Link
            href={listing.category.toLowerCase() === 'marketplace' ? '/marketplace' : `/category/${listing.category.toLowerCase()}`}
            className="hover:underline capitalize"
          >
            {listing.category}
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-500 dark:text-gray-400 truncate max-w-xs">{listing.title}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          
          <div className="flex-1 w-full max-w-[700px] space-y-8">
            
            
            <ListingCarousel title={listing.title} images={listing.images || []} />

            
            <div className="grid grid-cols-[180px_1fr] gap-x-4 gap-y-8 text-sm">
              
              
              <div className="font-semibold text-gray-900 dark:text-white">Details</div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 mr-2">Condition:</span> 
                <span className="text-gray-700 dark:text-gray-300 font-medium">{listing.condition}</span>
              </div>

              
              <div className="font-semibold text-gray-900 dark:text-white">Description</div>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {cleanDescription || listing.description}
              </div>

              
              <div className="font-semibold text-gray-900 dark:text-white">Shipping & pick-up options</div>
              <div>
                <table className="w-full text-left text-sm border-b border-gray-200 dark:border-[#333] mb-4">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-[#333] text-gray-500 dark:text-gray-400">
                      <th className="font-normal pb-2">Destination & description</th>
                      <th className="font-normal pb-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-3 text-gray-700 dark:text-gray-300">To be arranged</td>
                      <td className="py-3 text-right text-gray-700 dark:text-gray-300">TBD</td>
                    </tr>
                  </tbody>
                </table>
                <Link href="/shipping" className="text-[#0073e6] hover:underline">
                  Learn more about shipping &amp; delivery options.
                </Link>
              </div>

              
              <div className="font-semibold text-gray-900 dark:text-white">Payment Options</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#202020]/40">
                  <div className="font-bold text-gray-900 dark:text-white text-lg tracking-tighter mb-1.5">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
                      alt="Stripe" 
                      className="h-5 w-auto object-contain" 
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pay securely with Visa, Mastercard, Apple Pay, Google Pay via Stripe.</p>
                </div>

                {(paymentOptions.includes('cash') || paymentOptions.includes('euro_in_hand')) && (
                  <div className="p-3.5 rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#202020]/40 space-y-2">
                    <div className="font-semibold text-xs text-gray-900 dark:text-white uppercase tracking-wider">Other Accepted Options</div>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-2">
                      <li className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-medium">Euro in Hand (Cash on Collection)</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

            </div>

            
            <div className="pt-2">
              <ListingQuestionsSection
                listingId={listing.id}
                sellerId={listing.seller_id}
                isOwnListing={isOwnListing}
                currentUser={currentUser}
                initialQuestions={initialQuestions}
              />
            </div>

          </div>

          
          <div className="w-full lg:w-[360px] flex-shrink-0 space-y-4">
            
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
              {listing.title}
            </h1>
            
            <div className="text-gray-500 dark:text-gray-400 text-sm flex items-center mb-4">
              <MapPin className="w-4 h-4 mr-1" /> {itemLocation}
            </div>

            <div className="flex items-center text-sm mb-6">
              <Clock className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" /> 
              {isClosed ? (
                <span className="text-red-500 font-semibold mr-1">Closed</span>
              ) : (
                <>
                  <span className="text-[#e35205] font-semibold mr-1">Closes:</span>
                  <span className="text-gray-500 dark:text-gray-400">in {timeRemaining}</span>
                </>
              )}
            </div>

            {!isOwnListing && (
              <WatchlistButton listingId={listing.id} initialIsWatchlisted={isWatchlisted} />
            )}

            
            <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-[#333] rounded-sm">
              <div className="p-6 text-center border-b border-gray-200 dark:border-[#333]">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {isAuction ? (highestBidAmount !== null ? 'Current bid' : 'Starting price') : 'Buy Now'}
                </div>
                <div className="text-[40px] font-bold text-gray-900 dark:text-white leading-none mb-4">
                  €{currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>

                {isAuction && buyNowPrice && (
                  <div className="text-xs text-gray-400 mb-5">
                    Buy It Now Price: <span className="font-semibold text-white">€{buyNowPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                
                {!isClosed ? (
                  isOwnListing ? (
                    <div className="space-y-3">
                      <div className="w-full py-3 px-4 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl text-xs flex items-center justify-center">
                        You are the seller of this listing
                      </div>
                      <DeleteListingButton 
                        listingId={listing.id} 
                        listingTitle={listing.title} 
                        redirectTo="/my-listme?tab=listings"
                      />
                    </div>
                  ) : isAuction ? (
                    <div className="space-y-4">
                      <BiddingForm listingId={listing.id} minBid={minNextBid} />
                      {buyNowPrice && (
                        <div className="pt-3 border-t border-gray-200 dark:border-[#333]">
                          <div className="text-xs text-gray-400 mb-2">
                            Skip bidding & buy instantly:
                          </div>
                          <CheckoutButton 
                            listingId={listing.id} 
                            isAuction={false} 
                            stripeEnabled={true} 
                            listingTitle={listing.title}
                            price={buyNowPrice}
                          />
                        </div>
                      )}
                      <MakeOfferButton
                        listingId={listing.id}
                        sellerId={listing.seller_id}
                        listingTitle={listing.title}
                        askingPrice={buyNowPrice || currentPrice}
                        isAuction={true}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <CheckoutButton 
                        listingId={listing.id} 
                        isAuction={false} 
                        stripeEnabled={true} 
                        listingTitle={listing.title}
                        price={currentPrice}
                      />
                      <MakeOfferButton
                        listingId={listing.id}
                        sellerId={listing.seller_id}
                        listingTitle={listing.title}
                        askingPrice={currentPrice}
                      />
                    </div>
                  )
                ) : (
                  <div className="w-full py-3 px-4 bg-gray-600 text-gray-900 dark:text-white font-bold rounded-sm cursor-not-allowed">
                    Listing Closed
                  </div>
                )}
                
                {isAuction && (
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    <div>No reserve</div>
                    <div>{totalBids === 0 ? 'No bids' : `${totalBids} bid${totalBids === 1 ? '' : 's'}`}</div>
                  </div>
                )}
              </div>
              <div className="p-3 text-sm bg-white dark:bg-[#242424] border-t border-gray-100 dark:border-zinc-800">
                <ServiceFeeModal 
                  price={currentPrice} 
                  buyNowPrice={buyNowPrice}
                  isAuction={isAuction}
                />
              </div>
            </div>

            
            <div className="border border-gray-200 dark:border-[#333] rounded-sm p-4 bg-white dark:bg-[#242424] flex gap-4">
              <ShieldCheck className="w-8 h-8 text-[#0073e6] flex-shrink-0" />
              <div>
                <div className="font-bold text-gray-900 dark:text-white text-sm mb-1">Am I covered by Buyer Protection?</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-1">
                  When you make a purchase using secure card payments, we are able to protect your trade under our Buyer Protection policy, up to €5,000.
                </div>
                <Link href="/buyer-protection" className="text-xs text-[#0073e6] hover:underline font-semibold">
                  Learn more about our Buyer Protection.
                </Link>
              </div>
            </div>

            
            <div className="border border-gray-200 dark:border-[#333] rounded-sm p-4 bg-white dark:bg-[#242424] space-y-3">
              {listingBusinessPage ? (
                <Link 
                  href={`/page/${listingBusinessPage.slug}`}
                  className="flex items-center group hover:opacity-90 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 relative mr-4 group-hover:scale-105 transition-transform">
                    {listingBusinessPage.avatarUrl ? (
                      <Image
                        src={listingBusinessPage.avatarUrl}
                        alt={listingBusinessPage.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <Store className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1 group-hover:text-primary transition-colors">
                      <span className="truncate">{listingBusinessPage.name}</span>
                      {listingBusinessPage.is_verified && <VerifiedBadge size="xs" />}
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                    <div className="text-xs text-primary font-semibold mt-0.5">
                      Verified Storefront
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Store located in {listingBusinessPage.county || itemLocation}
                    </div>
                  </div>
                </Link>
              ) : (
                <Link 
                  href={`/member/${getMemberNumber(listing.seller_id)}`}
                  className="flex items-center group hover:opacity-90 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 relative mr-4 group-hover:scale-105 transition-transform">
                    {sellerAvatarUrl ? (
                      <Image
                        src={sellerAvatarUrl}
                        alt={sellerDisplayName}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-xl font-bold text-zinc-700 dark:text-zinc-200">{sellerInitial}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1 group-hover:text-primary transition-colors">
                      <span className="truncate">{sellerDisplayName}</span>
                      {isSellerVerified && <VerifiedBadge size="xs" />}
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Seller located in {itemLocation}
                    </div>
                  </div>
                </Link>
              )}
            </div>

          </div>

        </div>

        
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-[#333] flex flex-col items-center pb-20">
          {listingBusinessPage ? (
            <div className="w-full max-w-[600px]">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center sm:text-left">
                About the storefront
              </h2>
              <div className="flex flex-col items-center mb-6">
                <Link href={`/page/${listingBusinessPage.slug}`} className="group flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 relative mb-3 group-hover:scale-105 transition-transform">
                    {listingBusinessPage.avatarUrl ? (
                      <Image
                        src={listingBusinessPage.avatarUrl}
                        alt={listingBusinessPage.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <Store className="w-8 h-8 text-zinc-500 dark:text-zinc-400" />
                    )}
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>{listingBusinessPage.name}</span>
                    {listingBusinessPage.is_verified && <VerifiedBadge size="sm" />}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
                {listingBusinessPage.tagline && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center max-w-md mt-1 leading-relaxed">
                    {listingBusinessPage.tagline}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-[#333] pt-4 pb-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Store Location</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{listingBusinessPage.county || itemLocation}, Ireland</span>
                </div>
                {listingBusinessPage.opening_hours && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Opening Hours</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{listingBusinessPage.opening_hours}</span>
                  </div>
                )}
                {listingBusinessPage.category && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Business Category</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{listingBusinessPage.category}</span>
                  </div>
                )}
              </div>

              <Link 
                href={`/page/${listingBusinessPage.slug}`} 
                className="border-t border-gray-200 dark:border-[#333] py-3.5 flex justify-between items-center text-[#0073e6] hover:underline text-sm font-medium"
              >
                <span>Visit Storefront &amp; view all items</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              <div className="text-center pt-3 pb-1 border-t border-gray-100 dark:border-zinc-800/80">
                <Link href="/safety" className="text-[#0073e6] text-xs hover:underline">Read our safe buying advice</Link>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[600px]">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center sm:text-left">
                About the seller
              </h2>
              <div className="flex flex-col items-center mb-6">
                <Link href={`/member/${getMemberNumber(listing.seller_id)}`} className="group flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 bg-primary/20 flex items-center justify-center shrink-0 relative mb-3 group-hover:scale-105 transition-transform">
                    {sellerAvatarUrl ? (
                      <Image
                        src={sellerAvatarUrl}
                        alt={sellerDisplayName}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary">{sellerInitial}</span>
                    )}
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>{sellerDisplayName}</span>
                    {isSellerVerified && <VerifiedBadge size="sm" />}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              </div>

              <div className="border-t border-gray-200 dark:border-[#333] pt-4 pb-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Location</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{itemLocation}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Member since</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{memberSinceText}</span>
                </div>
              </div>

              <Link href={`/member/${getMemberNumber(listing.seller_id)}`} className="border-t border-gray-200 dark:border-[#333] py-3.5 flex justify-between items-center text-[#0073e6] hover:underline text-sm font-medium">
                View seller&apos;s other listings
                <ChevronRight className="w-4 h-4" />
              </Link>

              {!isOwnListing && (
                <div className="py-2.5 my-1">
                  <FavouriteSellerButton sellerId={listing.seller_id} initialIsFavourite={isSellerFavourited} />
                </div>
              )}
              
              <div className="text-center pt-3 pb-1 border-t border-gray-100 dark:border-zinc-800/80">
                <Link href="/safety" className="text-[#0073e6] text-xs hover:underline">Read our safe buying advice</Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
