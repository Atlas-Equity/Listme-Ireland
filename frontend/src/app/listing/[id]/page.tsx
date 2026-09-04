import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Clock, MapPin, ShieldCheck, Heart, Share2, AlertCircle, Info, ChevronRight, MessageSquare } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import CheckoutButton from '@/components/CheckoutButton';
import ListingCarousel from '@/components/ListingCarousel';
import WatchlistButton from '@/components/WatchlistButton';
import BiddingForm from '@/components/BiddingForm';
import FavouriteSellerButton from '@/components/FavouriteSellerButton';
import ContactSellerButton from '@/components/ContactSellerButton';

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const supabase = await createClient();

  // Parallel Phase 1: Fetch user and listing simultaneously
  const [userResult, listingResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('listings').select('*').eq('id', id).single()
  ]);

  const user = userResult.data?.user;
  const listing = listingResult.data;

  if (listingResult.error || !listing) {
    console.error('Error fetching listing:', listingResult.error);
    notFound();
  }

  const isAuction = listing.price_type?.toLowerCase() === 'auction';

  // Parallel Phase 2: Fetch seller, reviews, bids, watchlist, and favourite status concurrently
  const [
    sellerResult,
    reviewsResult,
    bidsResult,
    watchlistResult,
    favouriteResult
  ] = await Promise.all([
    supabase.from('profiles').select('username, account_type, created_at').eq('id', listing.seller_id).maybeSingle(),
    supabase.from('reviews').select('rating').eq('reviewee_id', listing.seller_id),
    isAuction 
      ? supabase.from('bids').select('amount', { count: 'exact' }).eq('listing_id', id).order('amount', { ascending: false }).limit(1)
      : Promise.resolve({ data: null, count: 0 }),
    user 
      ? supabase.from('wishlists').select('id').eq('user_id', user.id).eq('listing_id', id).maybeSingle()
      : Promise.resolve({ data: null }),
    user 
      ? supabase.from('favourite_sellers').select('id').eq('user_id', user.id).eq('seller_id', listing.seller_id).maybeSingle()
      : Promise.resolve({ data: null })
  ]);

  const seller = sellerResult.data;
  const reviews = reviewsResult.data;
  const isWatchlisted = !!watchlistResult.data;
  const isSellerFavourited = !!favouriteResult.data;

  let highestBidAmount = null;
  let totalBids = bidsResult.count || 0;
  if (isAuction && bidsResult.data && bidsResult.data.length > 0) {
    highestBidAmount = bidsResult.data[0].amount;
  }

  const currentPrice = highestBidAmount !== null ? highestBidAmount : listing.price;
  const minNextBid = highestBidAmount !== null ? highestBidAmount + 1 : listing.price;

  // Calculate feedback metrics
  const totalReviews = reviews?.length || 0;
  // We'll consider a rating >= 4 as "positive" for percentage
  const positiveReviews = reviews?.filter(r => r.rating >= 4).length || 0;
  const feedbackPercentage = totalReviews > 0 
    ? Math.round((positiveReviews / totalReviews) * 100) 
    : 0;

  const mainImage = listing.images && listing.images.length > 0 ? listing.images[0] : null;
  const timeAgo = formatDistanceToNow(new Date(listing.created_at), { addSuffix: true });

  // Calculate closing time. Fallback to 7 days from creation if expires_at is null (for old test data)
  const expirationDate = listing.expires_at 
    ? new Date(listing.expires_at) 
    : new Date(new Date(listing.created_at).getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const isClosed = expirationDate < new Date();
  const timeRemaining = isClosed ? 'Closed' : formatDistanceToNow(expirationDate);

  const itemLocation = listing.location || 'Unknown Location';

  // Ensure payment options is an array
  const paymentOptions: string[] = listing.payment_options || ['cash'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 py-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center text-xs text-blue-400 mb-6">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2 text-gray-500">/</span>
          <Link href={`/category/${listing.category.toLowerCase()}`} className="hover:underline capitalize">{listing.category}</Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-500 dark:text-gray-400 truncate max-w-xs">{listing.title}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Images & Description & Details */}
          <div className="flex-1 w-full max-w-[700px] space-y-8">
            
            {/* Image Gallery */}
            <ListingCarousel title={listing.title} images={listing.images || []} />

            {/* Details Section */}
            <div className="grid grid-cols-[180px_1fr] gap-x-4 gap-y-8 text-sm">
              
              {/* Condition */}
              <div className="font-semibold text-gray-900 dark:text-white">Details</div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 mr-2">Condition:</span> 
                <span className="text-gray-700 dark:text-gray-300">{listing.condition}</span>
              </div>

              {/* Description */}
              <div className="font-semibold text-gray-900 dark:text-white">Description</div>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </div>

              {/* Shipping */}
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
                <a href="#" className="text-[#0073e6] hover:underline">Learn more about shipping & delivery options.</a>
              </div>

              {/* Payment */}
              <div className="font-semibold text-gray-900 dark:text-white">Payment Options</div>
              <div className="grid grid-cols-2 gap-4">
                {paymentOptions.includes('stripe') && (
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white text-lg tracking-tighter mb-2">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
                        alt="Stripe" 
                        className="h-6 w-auto object-contain" 
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Pay instantly and securely by credit or debit card.</p>
                  </div>
                )}
                
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">Other options</div>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 capitalize">
                    {paymentOptions.map((opt) => {
                      if (opt === 'stripe') return null;
                      if (opt === 'cash') return (
                        <li key={opt} className="flex items-center">
                          <span className="font-semibold text-green-600 mr-2">💵</span> Cash On Pick-Up
                        </li>
                      );
                      return <li key={opt}>{opt}</li>;
                    })}
                  </ul>
                </div>
              </div>

              {/* Q&A */}
              <div className="font-semibold text-gray-900 dark:text-white">
                Questions & Answers (0)
              </div>
              <div>
                <ContactSellerButton
                  listingId={listing.id}
                  sellerId={listing.seller_id}
                  sellerUsername={seller?.username || 'Seller'}
                  listingTitle={listing.title}
                  listingPrice={currentPrice}
                  listingImage={mainImage}
                  currentUserId={user?.id || null}
                  variant="qa"
                />
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Price, Actions, Seller */}
          <div className="w-full lg:w-[360px] flex-shrink-0 space-y-4">
            
            {/* Title */}
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

            <WatchlistButton listingId={listing.id} initialIsWatchlisted={isWatchlisted} />

            {/* Price Box */}
            <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-[#333] rounded-sm">
              <div className="p-6 text-center border-b border-gray-200 dark:border-[#333]">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {isAuction ? (highestBidAmount !== null ? 'Current bid' : 'Starting price') : 'Buy Now'}
                </div>
                <div className="text-[40px] font-bold text-gray-900 dark:text-white leading-none mb-6">
                  €{currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                
                {!isClosed ? (
                  isAuction ? (
                    <BiddingForm listingId={listing.id} minBid={minNextBid} />
                  ) : (
                    <CheckoutButton 
                      listingId={listing.id} 
                      isAuction={false} 
                      stripeEnabled={paymentOptions.includes('stripe')} 
                    />
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
              <div className="p-3 text-sm text-[#0073e6] flex items-center bg-white dark:bg-[#242424]">
                <Info className="w-4 h-4 mr-2" /> Service Fee may apply
              </div>
            </div>

            {/* Contact Seller Action */}
            <ContactSellerButton
              listingId={listing.id}
              sellerId={listing.seller_id}
              sellerUsername={seller?.username || 'Seller'}
              listingTitle={listing.title}
              listingPrice={currentPrice}
              listingImage={mainImage}
              currentUserId={user?.id || null}
              variant="primary"
            />

            {/* Buyer Protection */}
            <div className="border border-gray-200 dark:border-[#333] rounded-sm p-4 bg-white dark:bg-[#242424] flex gap-4">
              <ShieldCheck className="w-8 h-8 text-[#0073e6] flex-shrink-0" />
              <div>
                <div className="font-bold text-gray-900 dark:text-white text-sm mb-1">Am I covered by Buyer Protection?</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-1">
                  When you make a purchase using secure card payments, we are able to protect your trade under our Buyer Protection policy, up to €5,000.
                </div>
                <a href="#" className="text-xs text-[#0073e6] hover:underline">Learn more about our Buyer Protection.</a>
              </div>
            </div>

            {/* Seller Mini Profile */}
            <div className="border border-gray-200 dark:border-[#333] rounded-sm p-4 bg-white dark:bg-[#242424] space-y-3">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#4a3b3b] rounded-full flex items-center justify-center text-xl font-bold text-gray-900 dark:text-white mr-4">
                  {seller?.username ? seller.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="font-bold text-[#0073e6] hover:underline cursor-pointer">{seller?.username || 'Unknown'}</div>
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    {totalReviews > 0 ? `${feedbackPercentage}% positive feedback` : 'No feedback yet'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Seller located in {itemLocation}
                  </div>
                </div>
              </div>
              <ContactSellerButton
                listingId={listing.id}
                sellerId={listing.seller_id}
                sellerUsername={seller?.username || 'Seller'}
                listingTitle={listing.title}
                listingPrice={currentPrice}
                listingImage={mainImage}
                currentUserId={user?.id || null}
                variant="secondary"
              />
            </div>

          </div>

        </div>

        {/* BOTTOM SECTION: Full Seller Profile */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-[#333] flex flex-col items-center pb-20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white w-full max-w-[600px] mb-6">About the seller</h2>
          
          <div className="w-full max-w-[600px]">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-[#4a3b3b] rounded-full flex items-center justify-center text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {seller?.username ? seller.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">{seller?.username || 'Unknown'}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {totalReviews > 0 ? (
                  <>{feedbackPercentage}% positive feedback <span className="text-[#e35205]">({totalReviews}⭐)</span></>
                ) : (
                  'No feedback yet'
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-[#333] pt-4 pb-4">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-500 dark:text-gray-400">Location</span>
                <span className="text-gray-700 dark:text-gray-300">{itemLocation}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Member since</span>
                <span className="text-gray-700 dark:text-gray-300">{seller?.created_at ? format(new Date(seller.created_at), 'EEEE, d MMMM yyyy') : 'Unknown'}</span>
              </div>
            </div>

            <Link href="#" className="border-t border-gray-200 dark:border-[#333] py-4 flex justify-between items-center text-[#0073e6] hover:underline text-sm font-medium">
              View seller's other listings
              <ChevronRight className="w-5 h-5" />
            </Link>

            <FavouriteSellerButton sellerId={listing.seller_id} initialIsFavourite={isSellerFavourited} />
            
            <div className="text-center mt-4">
              <a href="#" className="text-[#0073e6] text-sm hover:underline">Read our safe buying advice</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
