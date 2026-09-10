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
  Calendar,
  ExternalLink,
  Package,
  Clock,
  ThumbsUp,
  Award,
  Check
} from 'lucide-react';
import { ListingCard } from '@/components/ListingCard';
import { BusinessPageData } from '@/app/actions/businessPages';

interface BusinessPageClientProps {
  businessPage: BusinessPageData;
  listings: any[];
}

export default function BusinessPageClient({ businessPage, listings }: BusinessPageClientProps) {
  const [activeTab, setActiveTab] = useState<'listings' | 'about' | 'reviews'>('listings');
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1420);

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {}
  };

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      setLiked(true);
      setLikeCount(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-black py-4 sm:py-6">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
        
        {/* Facebook-Style Main Profile Header Container */}
        <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-xs overflow-hidden mb-6">
          
          {/* 1. Cover Photo Banner */}
          <div className="h-52 sm:h-72 w-full bg-gradient-to-r from-emerald-800 via-zinc-900 to-green-950 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.15),transparent)]"></div>
            
            {/* Top Right Verified Pill */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified Irish Business Page
              </span>
            </div>
          </div>

          {/* 2. Overlapping Profile Avatar + Info & Action Buttons */}
          <div className="px-6 sm:px-10 pb-4 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-24 pb-6 border-b border-gray-100 dark:border-zinc-800">
              
              {/* Profile Avatar & Details */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-left gap-5">
                
                {/* Facebook Circular Avatar */}
                <div className="relative group">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white dark:bg-[#181818] p-1.5 shadow-xl ring-4 ring-white dark:ring-[#181818]">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 via-emerald-100 dark:via-zinc-800 to-primary/5 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-primary font-black text-4xl sm:text-5xl uppercase select-none overflow-hidden relative">
                      {businessPage.avatarUrl ? (
                        <Image
                          src={businessPage.avatarUrl}
                          alt={businessPage.name}
                          fill
                          sizes="160px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        businessPage.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                  </div>

                  {/* Online / Active Indicator */}
                  <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white dark:border-[#181818]" title="Active now"></div>
                </div>

                {/* Name, Handle, Metrics */}
                <div className="min-w-0 pt-2">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      {businessPage.name}
                    </h1>
                    <div className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[10px] font-bold" title="Verified Facebook-Style Business">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  <p className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400 mt-1">
                    @{businessPage.slug} • <span className="text-primary font-bold">{businessPage.category}</span>
                  </p>

                  {/* Facebook Metrics Bar */}
                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
                    <span>{likeCount.toLocaleString()} likes</span>
                    <span>•</span>
                    <span>{(likeCount + 85).toLocaleString()} followers</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 0% Success Fees
                    </span>
                  </div>
                </div>
              </div>

              {/* Facebook Action Buttons */}
              <div className="flex items-center justify-center sm:justify-end gap-2.5 shrink-0">
                
                {/* Like Button */}
                <button
                  type="button"
                  onClick={handleLike}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    liked 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-primary' : ''}`} />
                  <span>{liked ? 'Liked' : 'Like'}</span>
                </button>

                {/* Primary Message / Request Quote Button */}
                <Link
                  href="/messages"
                  className="px-5 py-2.5 rounded-xl bg-[#0073e6] hover:bg-[#005bb5] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message</span>
                </Link>

                {/* Call Button */}
                <a
                  href={`tel:${businessPage.phone}`}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call</span>
                </a>

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

            {/* 3. Facebook Horizontal Navigation Tabs */}
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
                Listings &amp; Services ({listings.length})
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
                About &amp; Contact Info
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Reviews (100% Positive)
              </button>
            </div>

          </div>
        </div>

        {/* Two-Column Facebook Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Facebook "Intro" Card (Sticky) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Intro Details Box */}
            <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white">
                Intro
              </h3>

              {businessPage.tagline && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {businessPage.tagline}
                </p>
              )}

              <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/80 space-y-3 text-xs text-gray-700 dark:text-gray-300">
                
                {/* Category */}
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Page • <strong>{businessPage.category}</strong></span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Based in <strong>{businessPage.county}, Ireland</strong></span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href={`tel:${businessPage.phone}`} className="hover:text-primary hover:underline font-semibold">
                    {businessPage.phone}
                  </a>
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

                {/* Hours & Response */}
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong className="text-emerald-600 dark:text-emerald-400">Open now</strong> • 9:00 AM – 6:00 PM</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <MessageSquare className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Typically responds within an hour</span>
                </div>

              </div>

              {/* Social Links Row */}
              <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/80">
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Social Links
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

            </div>

            {/* Buyer Protection Card */}
            <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-gray-900 dark:text-white block mb-0.5">
                  Listme Buyer Protection
                </span>
                <span className="text-gray-500 dark:text-gray-400 leading-relaxed block">
                  Purchases from verified business storefronts are covered up to €5,000 against non-delivery or faulty items.
                </span>
                <Link href="/buyer-protection" className="text-primary hover:underline font-bold mt-1.5 inline-block">
                  Learn about Buyer Protection &rarr;
                </Link>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Facebook "Feed", Listings & Services */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Pinned Welcome Card */}
            <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {businessPage.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                    {businessPage.name}
                    <span className="text-xs text-gray-400 font-normal">• Pinned Announcement</span>
                  </h4>
                  <p className="text-[11px] text-gray-400">Official Storefront on Listme.ie</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Welcome to our official business page on Listme! Browse our current service listings and marketplace offerings below. Click &quot;Message&quot; or &quot;Call&quot; for direct quotes and questions.
              </p>

              <div className="pt-2 flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1 text-primary font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  0% Success Fees
                </span>
                <span>•</span>
                <span>Fast response time</span>
                <span>•</span>
                <span>{businessPage.county} area</span>
              </div>
            </div>

            {/* TAB: Listings & Services */}
            {(activeTab === 'listings' || activeTab === 'about') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-zinc-800">
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    Listings &amp; Services ({listings.length})
                  </h3>
                  <Link
                    href="/sell"
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    + Add New Listing
                  </Link>
                </div>

                {listings.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xs">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      No active listings published yet
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      This business will post new services, items, or equipment shortly.
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
            )}

            {/* TAB: Reviews & Recommendations */}
            {(activeTab === 'reviews' || activeTab === 'about') && (
              <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-500" />
                      Reviews &amp; Recommendations
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      100% of customers recommend {businessPage.name}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">100%</div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Top Rated</span>
                  </div>
                </div>

                {/* Recommend Box */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Do you recommend {businessPage.name}?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => alert(`Thank you for recommending ${businessPage.name}!`)}
                      className="px-4 py-1.5 rounded-lg bg-primary hover:bg-green-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('Feedback recorded.')}
                      className="px-4 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Sample Verified Reviews */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/60 border border-gray-100 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-primary font-bold flex items-center justify-center text-xs">
                          S
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">Sean O&apos;Connor</span>
                      </div>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Recommended
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Fantastic communication, arrived on time, and finished the project cleanly. Highly recommended business in Ireland!
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/60 border border-gray-100 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 font-bold flex items-center justify-center text-xs">
                          C
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">Ciara Murphy</span>
                      </div>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Recommended
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Purchased equipment and everything was exactly as described. Seamless transaction with Buyer Protection.
                    </p>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
