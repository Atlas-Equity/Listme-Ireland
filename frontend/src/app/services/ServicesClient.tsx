'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Building2, ExternalLink, Briefcase, Plus } from 'lucide-react';
import { ListingCard } from '@/components/ListingCard';
import { BusinessPageData } from '@/app/actions/businessPages';
import { COUNTIES } from '@/utils/irelandLocations';

interface ServicesClientProps {
  initialBusinessPages: BusinessPageData[];
  initialListings: any[];
}

export default function ServicesClient({
  initialBusinessPages,
  initialListings,
}: ServicesClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('All');

  // Filter service businesses (business_type === 'service' or all pages if search query matches)
  const servicePages = useMemo(() => {
    return initialBusinessPages.filter((page) => {
      const isService = page.business_type === 'service' || page.category?.toLowerCase().includes('service');
      const matchesCounty = selectedCounty === 'All' || page.county?.toLowerCase() === selectedCounty.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        page.name.toLowerCase().includes(q) ||
        (page.tagline && page.tagline.toLowerCase().includes(q)) ||
        (page.category && page.category.toLowerCase().includes(q)) ||
        (page.announcement && page.announcement.toLowerCase().includes(q));

      return isService && matchesCounty && matchesSearch;
    });
  }, [initialBusinessPages, searchQuery, selectedCounty]);

  // Filter service listings
  const serviceListings = useMemo(() => {
    return initialListings.filter((item) => {
      const matchesCounty = selectedCounty === 'All' || item.location?.toLowerCase().includes(selectedCounty.toLowerCase());
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q);

      return matchesCounty && matchesSearch;
    });
  }, [initialListings, searchQuery, selectedCounty]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header & Search */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Services & Trades
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Hire trusted Irish trades, local contractors, and verified service businesses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-green-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>List a Service</span>
            </Link>
          </div>
        </div>

        {/* Search Bar & County Filter */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-[#181818] p-3 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
          <div className="md:col-span-3 relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for plumbing, electrical, cleaning, landscaping, IT services..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-900/70 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-zinc-900/70 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="All">All Counties (Ireland)</option>
              {COUNTIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 1: Registered Service Businesses ("Pages") */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span>Registered Service Businesses</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Verified business storefronts providing professional services across Ireland.
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
            {servicePages.length} {servicePages.length === 1 ? 'business' : 'businesses'}
          </span>
        </div>

        {servicePages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {servicePages.map((page) => (
              <Link
                key={page.slug}
                href={`/page/${page.slug}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 hover:border-primary/50 transition-all group shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 overflow-hidden relative shrink-0 flex items-center justify-center">
                      {page.avatarUrl ? (
                        <Image
                          src={page.avatarUrl}
                          alt={page.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
                          {page.name}
                        </h3>
                        <span className="text-[11px] text-primary font-semibold">
                          Verified Pro
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {page.category || 'Professional Services'}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-4">
                    {page.announcement || page.tagline || 'Official service provider on ListMe Ireland.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{page.county || 'Ireland'}</span>
                  </span>
                  <span className="font-bold text-primary flex items-center gap-1 group-hover:underline">
                    View Business <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 text-center">
            <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
              No service businesses registered yet{selectedCounty !== 'All' ? ` in ${selectedCounty}` : ''}.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Are you a tradesperson or local service provider? Create your official business storefront today.
            </p>
            <Link
              href="/my-listme?tab=business"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Service Business Page</span>
            </Link>
          </div>
        )}
      </section>

      {/* SECTION 2: Individual Service Listings */}
      <section>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <span>Service Listings</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Direct service quotes, callout offers, and contractor posts.
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
            {serviceListings.length} {serviceListings.length === 1 ? 'listing' : 'listings'}
          </span>
        </div>

        {serviceListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {serviceListings.map((item) => (
              <ListingCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={Number(item.price)}
                priceType={item.price_type || 'Quote / Fixed'}
                condition={item.condition || 'Service'}
                images={item.images || []}
                createdAt={item.created_at}
                location={item.location}
                closesAt={item.expires_at || item.ends_at}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 text-center">
            <Briefcase className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
              No active service listings found.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Offer your professional or trade services to thousands of buyers across Ireland.
            </p>
            <Link
              href="/sell"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post a Service Listing</span>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
