'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  CheckCircle2, 
  ShieldCheck, 
  Share2, 
  MessageSquare, 
  Clock, 
  ExternalLink,
  Package,
  Check,
  Megaphone,
  Briefcase,
  Store,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { ListingCard } from '@/components/ListingCard';
import { BusinessPageData } from '@/app/actions/businessPages';
import CreateBusinessPageModal from '@/components/CreateBusinessPageModal';
import DeleteBusinessPageButton from '@/components/DeleteBusinessPageButton';

interface BusinessPageClientProps {
  businessPage: BusinessPageData;
  listings: any[];
  isOwner?: boolean;
}

export default function BusinessPageClient({
  businessPage,
  listings,
  isOwner = false,
}: BusinessPageClientProps) {
  const [activeTab, setActiveTab] = useState<'listings' | 'about'>('listings');
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {}
  };

  const isMarketplace = businessPage.business_type === 'marketplace';

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-black py-4 sm:py-6">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
        
        {/* Owner Management Banner (if owner is viewing their page) */}
        {isOwner && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  You are viewing this page as the Owner
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  You can edit opening hours, announcement, business model, or delete this page.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CreateBusinessPageModal initialData={businessPage} />
              <DeleteBusinessPageButton slug={businessPage.slug} pageName={businessPage.name} />
            </div>
          </div>
        )}

        {/* Facebook-Style Main Profile Header Container */}
        <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-xs overflow-hidden mb-6">
          
          {/* 1. Cover Photo Banner */}
          <div className="h-44 sm:h-64 w-full bg-gradient-to-r from-emerald-800 via-zinc-900 to-green-950 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12),transparent)]"></div>
            
            {/* Top Right Verified Pill & Business Model Declaration */}
            <div className="absolute top-4 right-4 flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 shadow-sm">
                {isMarketplace ? (
                  <>
                    <Store className="w-3.5 h-3.5 text-primary" />
                    <span>Marketplace Store</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-3.5 h-3.5 text-primary" />
                    <span>Service Business</span>
                  </>
                )}
              </span>

              <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Irish Business</span>
              </span>
            </div>
          </div>

          {/* 2. Overlapping Profile Avatar + Info & Action Buttons */}
          <div className="px-6 sm:px-10 pb-4 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20 pb-6 border-b border-gray-100 dark:border-zinc-800">
              
              {/* Profile Avatar & Details */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-left gap-5">
                
                {/* Circular Profile Avatar (Supports Custom PFP) */}
                <div className="relative group">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-white dark:bg-[#181818] p-1.5 shadow-xl ring-4 ring-white dark:ring-[#181818]">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 via-emerald-100 dark:via-zinc-800 to-primary/5 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-primary font-black text-4xl uppercase select-none overflow-hidden relative">
                      {businessPage.avatarUrl ? (
                        <Image
                          src={businessPage.avatarUrl}
                          alt={businessPage.name}
                          fill
                          sizes="144px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        businessPage.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                  </div>

                  {/* Online / Active Indicator */}
                  <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white dark:border-[#181818]" title="Verified & Active"></div>
                </div>

                {/* Name, Handle, Metrics */}
                <div className="min-w-0 pt-2">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      {businessPage.name}
                    </h1>
                    <div className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[10px] font-bold" title="Verified Business">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  <p className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400 mt-1">
                    @{businessPage.slug} • <span className="text-primary font-bold">{businessPage.category}</span>
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
                    <span className="inline-flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300">
                      {isMarketplace ? 'Commercial Storefront' : 'Direct Service Provider'}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 0% Success Fees
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Message and Share ONLY (Like and Call removed as requested) */}
              <div className="flex items-center justify-center sm:justify-end gap-2.5 shrink-0">
                {/* Message Button */}
                <Link
                  href="/messages"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message</span>
                </Link>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                  title="Share page"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>

            </div>

            {/* 3. Horizontal Navigation Tabs (Fake reviews removed) */}
            <div className="flex items-center gap-2 pt-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('listings')}
                className={`px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'listings'
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {isMarketplace ? 'Store Items' : 'Services & Listings'} ({listings.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className={`px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'about'
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                About &amp; Opening Hours
              </button>
            </div>

          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Intro Card & Opening Hours */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Intro Details Box */}
            <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  About
                </h3>
                <span className="text-[11px] font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">
                  {isMarketplace ? 'Marketplace' : 'Service'}
                </span>
              </div>

              {businessPage.tagline && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {businessPage.tagline}
                </p>
              )}

              <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/80 space-y-3.5 text-xs text-gray-700 dark:text-gray-300">
                
                {/* Business Type */}
                <div className="flex items-center gap-3">
                  {isMarketplace ? (
                    <Store className="w-4 h-4 text-gray-400 shrink-0" />
                  ) : (
                    <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                  <span>
                    Model: <strong>{isMarketplace ? 'Marketplace Store' : 'Service Business'}</strong>
                  </span>
                </div>

                {/* Opening Hours */}
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-semibold text-gray-900 dark:text-white">Opening Hours</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {businessPage.opening_hours || 'Mon - Fri: 9:00 AM - 6:00 PM'}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Based in <strong>{businessPage.county}, Ireland</strong></span>
                </div>

                {/* Phone (Locked to Irish +353) */}
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-mono font-semibold">{businessPage.phone}</span>
                </div>

                {/* Email */}
                {businessPage.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <a href={`mailto:${businessPage.email}`} className="hover:text-primary hover:underline truncate">
                      {businessPage.email}
                    </a>
                  </div>
                )}

                {/* Website */}
                {businessPage.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                    <a
                      href={businessPage.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 font-semibold truncate"
                    >
                      <span>{businessPage.website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

              </div>

              {/* Social Links Row */}
              {(businessPage.facebook || businessPage.instagram || businessPage.linkedin) && (
                <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/80">
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Social Channels
                  </span>
                  
                  <div className="flex flex-wrap gap-2">
                    {businessPage.facebook && (
                      <a
                        href={businessPage.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] text-xs font-semibold transition-colors"
                      >
                        <span className="font-black">f</span>
                        <span>Facebook</span>
                      </a>
                    )}

                    {businessPage.instagram && (
                      <a
                        href={businessPage.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E4405F]/10 hover:bg-[#E4405F]/20 text-[#E4405F] text-xs font-semibold transition-colors"
                      >
                        <span className="font-bold">IG</span>
                        <span>Instagram</span>
                      </a>
                    )}

                    {businessPage.linkedin && (
                      <a
                        href={businessPage.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] text-xs font-semibold transition-colors"
                      >
                        <span className="font-bold">in</span>
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Buyer Protection Card */}
            <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-gray-900 dark:text-white block mb-0.5">
                  Listme Buyer Protection
                </span>
                <span className="text-gray-500 dark:text-gray-400 leading-relaxed block">
                  Transactions with verified business sellers are covered up to €5,000 for your peace of mind.
                </span>
                <Link href="/buyer-protection" className="text-primary hover:underline font-bold mt-1.5 inline-block">
                  Buyer Protection info &rarr;
                </Link>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Announcement Banner & Listings Feed */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1 Announcement Banner (Max 250 characters, configurable by owner) */}
            {businessPage.announcement ? (
              <div className="bg-white dark:bg-[#181818] border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary"></div>
                <div className="flex items-start gap-3 pl-1">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        Official Announcement
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                      {businessPage.announcement}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Listings / Services Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-zinc-800">
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <span>{isMarketplace ? 'Store Inventory' : 'Services & Offerings'}</span>
                  <span className="text-xs font-medium text-gray-400">({listings.length})</span>
                </h3>
                {isOwner && (
                  <Link
                    href="/sell"
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    + Add New Item
                  </Link>
                )}
              </div>

              {listings.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xs">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    No listings published yet
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    {isOwner ? 'Click "+ Add New Item" to add products or services to your storefront.' : 'This business will post new listings shortly.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listings.map((listing: any) => (
                    <ListingCard
                      key={listing.id}
                      id={listing.id}
                      title={listing.title}
                      price={typeof listing.price === 'string' ? parseFloat(listing.price.replace(/[^0-9.]/g, '')) || 0 : listing.price}
                      priceType={listing.price_type === 'Auction' ? 'Auction' : 'Fixed Price'}
                      condition={listing.condition || 'New'}
                      images={listing.images || []}
                      createdAt={listing.created_at}
                      location={listing.location || businessPage.county}
                      closesAt={listing.expires_at || listing.ends_at}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
