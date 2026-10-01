'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Tag, Plus, Clock } from 'lucide-react';
import { ListingCard } from '@/components/ListingCard';
import { COUNTIES } from '@/utils/irelandLocations';
import CustomSelect from '@/components/CustomSelect';
import { MARKETPLACE_CATEGORIES, CATEGORY_NAMES } from '@/constants/marketplaceCategories';

interface MarketplaceClientProps {
  initialStores?: any[];
  initialListings: any[];
  defaultFormat?: string;
}

function MarketplaceClientContent({
  initialListings,
  defaultFormat,
}: MarketplaceClientProps) {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCounty, setSelectedCounty] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [buyingFormat, setBuyingFormat] = useState(defaultFormat || 'All');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const subcategoryOptions = useMemo(() => {
    if (selectedCategory === 'All' || !MARKETPLACE_CATEGORIES[selectedCategory]) {
      return [{ value: 'All', label: 'All Subcategories' }];
    }
    return [
      { value: 'All', label: 'All Subcategories' },
      ...MARKETPLACE_CATEGORIES[selectedCategory].map((sub) => ({ value: sub, label: sub })),
    ];
  }, [selectedCategory]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSubcategory('All');
  };

  const closingSoonListings = useMemo(() => {
    const nowMs = Date.now();
    return initialListings.filter((item) => {
      const end = item.expires_at || item.ends_at;
      if (!end) return false;
      const diff = new Date(end).getTime() - nowMs;
      return diff > 0 && diff <= 24 * 60 * 60 * 1000;
    });
  }, [initialListings]);

  const filteredListings = useMemo(() => {
    const nowMs = Date.now();
    return initialListings.filter((item) => {
      const matchesCounty = selectedCounty === 'All' || item.location?.toLowerCase().includes(selectedCounty.toLowerCase());
      
      const end = item.expires_at || item.ends_at;
      const isClosingSoon = Boolean(end) && (new Date(end).getTime() - nowMs > 0) &&
        (new Date(end).getTime() - nowMs <= 24 * 60 * 60 * 1000);

      const matchesFormat = buyingFormat === 'All' || 
        (buyingFormat === 'Auction' && item.price_type?.toLowerCase() === 'auction') ||
        (buyingFormat === 'Buy Now' && item.price_type?.toLowerCase() !== 'auction') ||
        (buyingFormat === 'Closing Soon' && isClosingSoon);

      const matchesCategory = selectedCategory === 'All' ||
        item.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        item.description?.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchesSubcategory = selectedSubcategory === 'All' ||
        item.description?.toLowerCase().includes(`[subcategory: ${selectedSubcategory.toLowerCase()}]`) ||
        item.description?.toLowerCase().includes(selectedSubcategory.toLowerCase()) ||
        (item as any).subcategory?.toLowerCase() === selectedSubcategory.toLowerCase() ||
        item.title?.toLowerCase().includes(selectedSubcategory.toLowerCase());

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);

      return matchesCounty && matchesFormat && matchesCategory && matchesSubcategory && matchesSearch;
    });
  }, [initialListings, searchQuery, selectedCounty, buyingFormat, selectedCategory, selectedSubcategory]);

  const [visibleListingsCount, setVisibleListingsCount] = useState(40);
  const displayedListings = filteredListings.slice(0, visibleListingsCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Marketplace
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Buy and sell new and used items, electronics, collectibles, and more across Ireland.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-green-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Sell an Item</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 bg-[#f8fafc] dark:bg-[#181818] p-3 rounded-2xl border border-gray-200/90 dark:border-zinc-800 shadow-xs">
          <div className="sm:col-span-2 lg:col-span-2 relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search marketplace items..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-900/70 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <CustomSelect
              value={selectedCategory}
              onChange={handleCategoryChange}
              options={[{ value: 'All', label: 'All Categories' }, ...CATEGORY_NAMES.map((c) => ({ value: c, label: c }))]}
            />
          </div>

          <div>
            <CustomSelect
              value={selectedSubcategory}
              onChange={setSelectedSubcategory}
              disabled={selectedCategory === 'All'}
              options={subcategoryOptions}
            />
          </div>

          <div>
            <CustomSelect
              value={selectedCounty}
              onChange={setSelectedCounty}
              options={[{ value: 'All', label: 'All Counties' }, ...COUNTIES.map((c) => ({ value: c, label: c }))]}
            />
          </div>

          <div>
            <CustomSelect
              value={buyingFormat}
              onChange={setBuyingFormat}
              options={[
                { value: 'All', label: 'All Formats' },
                { value: 'Buy Now', label: 'Buy Now / Fixed Price' },
                { value: 'Auction', label: 'Live Auctions' },
                { value: 'Closing Soon', label: 'Closing Soon (1 Day or Less)' },
              ]}
            />
          </div>
        </div>
      </div>

      {closingSoonListings.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span>Closing Soon (1 Day or Less)</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last chance items and auctions ending within 24 hours.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              {closingSoonListings.length} {closingSoonListings.length === 1 ? 'item' : 'items'} closing soon
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {closingSoonListings.map((item) => (
              <ListingCard
                key={`closing-${item.id}`}
                id={item.id}
                title={item.title}
                price={Number(item.price)}
                priceType={item.price_type}
                condition={item.condition}
                images={item.images || []}
                createdAt={item.created_at}
                location={item.location}
                closesAt={item.expires_at || item.ends_at}
                sellerName={item.seller_name}
                sellerVerified={item.seller_verified}
                sellerId={item.seller_id}
                businessPageSlug={item.business_page_slug}
                businessPageName={item.business_page_name}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              <span>Active Marketplace Listings</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Verified listings from sellers across all 32 counties.
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
            {filteredListings.length} {filteredListings.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {filteredListings.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
              {displayedListings.map((item) => (
                <ListingCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={Number(item.price)}
                  priceType={item.price_type || 'Buy Now'}
                  condition={item.condition || 'Used'}
                  images={item.images || []}
                  createdAt={item.created_at}
                  location={item.location}
                  closesAt={item.expires_at || item.ends_at}
                  sellerName={item.seller_name}
                  sellerVerified={item.seller_verified}
                  sellerId={item.seller_id}
                  businessPageSlug={item.business_page_slug}
                  businessPageName={item.business_page_name}
                />
              ))}
            </div>

            {filteredListings.length > visibleListingsCount && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleListingsCount((prev) => prev + 40)}
                  className="px-6 py-3 rounded-2xl bg-primary hover:bg-green-700 text-white text-xs sm:text-sm font-extrabold transition-all shadow-md cursor-pointer active:scale-95"
                >
                  View More Listings ({filteredListings.length - visibleListingsCount} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 text-center">
            <Tag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
              No marketplace items currently active.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Be the first to list an item for sale in Ireland.
            </p>
            <Link
              href="/sell"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create a Listing</span>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

export default function MarketplaceClient(props: MarketplaceClientProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded-xl w-48 mb-6"></div>
          <div className="h-16 bg-gray-100 dark:bg-zinc-900 rounded-2xl mb-8"></div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-gray-100 dark:bg-zinc-900 rounded-2xl"></div>
            ))}
          </div>
        </div>
      }
    >
      <MarketplaceClientContent {...props} />
    </Suspense>
  );
}
