import Hero from "@/components/Hero";
import PromoBanners from "@/components/PromoBanners";
import TrendingCategories from "@/components/TrendingCategories";
import SectionHeader from "@/components/SectionHeader";
import { ListingCard } from "@/components/ListingCard";
import { createClient } from "@/utils/supabase/server";

// ISR: revalidate homepage in the background every 30 seconds for blazing fast instant loads
export const revalidate = 30;

export default async function Home() {
  const supabase = await createClient();

  // Fetch only necessary card columns concurrently
  const [latestResult, auctionResult] = await Promise.all([
    supabase
      .from('listings')
      .select('id, title, price, price_type, condition, images, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('listings')
      .select('id, title, price, price_type, condition, images, created_at')
      .eq('status', 'active')
      .ilike('price_type', 'Auction')
      .order('created_at', { ascending: false })
      .limit(4)
  ]);

  const latestListings = latestResult.data || [];
  const auctionListings = auctionResult.data || [];

  return (
    <div className="w-full bg-white dark:bg-black min-h-screen">
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PromoBanners />

        {/* Cool Auctions Section */}
        {auctionListings.length > 0 && (
          <>
            <SectionHeader title="Cool auctions" viewAllLink="/category/marketplace" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {auctionListings.map((listing) => (
                <ListingCard 
                  key={listing.id} 
                  id={listing.id}
                  title={listing.title}
                  price={listing.price}
                  priceType={listing.price_type}
                  condition={listing.condition}
                  images={listing.images}
                  createdAt={listing.created_at}
                />
              ))}
            </div>
          </>
        )}

        <TrendingCategories />

        {/* Latest Listings Section */}
        {latestListings.length > 0 && (
          <>
            <SectionHeader title="Latest listings" viewAllLink="/category/marketplace" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
              {latestListings.map((listing) => (
                <ListingCard 
                  key={listing.id} 
                  id={listing.id}
                  title={listing.title}
                  price={listing.price}
                  priceType={listing.price_type}
                  condition={listing.condition}
                  images={listing.images}
                  createdAt={listing.created_at}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Bottom spacer */}
      <div className="h-16 bg-white dark:bg-[#1a1a1a] border-t border-gray-100 dark:border-zinc-800">
      </div>
    </div>
  );
}
