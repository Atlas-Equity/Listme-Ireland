'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  AlertCircle,
  Plus,
  Shield,
  Edit2,
  Camera,
  Loader2
} from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';
import { ListingCard } from '@/components/ListingCard';
import { BusinessPageData, createOrUpdateBusinessPage } from '@/app/actions/businessPages';
import { uploadAvatarAction } from '@/app/my-listme/actions';
import CreateBusinessPageModal from '@/components/CreateBusinessPageModal';
import DeleteBusinessPageButton from '@/components/DeleteBusinessPageButton';
import BusinessTeamManagement from '@/components/BusinessTeamManagement';
import FavouriteBusinessButton from '@/components/FavouriteBusinessButton';

interface BusinessPageClientProps {
  businessPage: BusinessPageData;
  listings: any[];
  isOwner?: boolean;
  isTrueOwner?: boolean;
  isAdmin?: boolean;
  isTeamMember?: boolean;
  initialIsFavourite?: boolean;
}

export default function BusinessPageClient({
  businessPage,
  listings,
  isOwner = false,
  isTrueOwner = false,
  isAdmin = false,
  isTeamMember = false,
  initialIsFavourite = false,
}: BusinessPageClientProps) {
  const router = useRouter();
  const isListMeOfficial = businessPage.slug === 'listme';
  const [activeTab, setActiveTab] = useState<'listings' | 'about'>(isListMeOfficial ? 'about' : 'listings');
  const [copied, setCopied] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(businessPage.avatarUrl || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleDirectAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setCurrentAvatarUrl(preview);
    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      let publicUrl: string | null = null;

      try {
        const res = await fetch('/api/upload/avatar', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.publicUrl) {
          publicUrl = data.publicUrl;
        }
      } catch {}

      if (!publicUrl) {
        const actionRes = await uploadAvatarAction(formData);
        if (actionRes.publicUrl) {
          publicUrl = actionRes.publicUrl;
        }
      }

      if (publicUrl) {
        setCurrentAvatarUrl(publicUrl);
        await createOrUpdateBusinessPage({
          ...businessPage,
          avatarUrl: publicUrl,
        });
        router.refresh();
      } else {
        setCurrentAvatarUrl(businessPage.avatarUrl || '');
      }
    } catch {
      setCurrentAvatarUrl(businessPage.avatarUrl || '');
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

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
  const isVerifiedOrOfficial = Boolean(isListMeOfficial || businessPage.is_verified);
  const bannerImage = (isVerifiedOrOfficial && businessPage.coverUrl) 
    ? businessPage.coverUrl 
    : '/ListMeBanner.png';

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-black py-4 sm:py-6">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
        
        
        {(isOwner || isAdmin || isTeamMember) && (
          <div className="mb-4 p-4 rounded-xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {isListMeOfficial 
                    ? 'Admin Mode: Managing Official ListMe Storefront' 
                    : isTrueOwner
                    ? 'You are viewing this page as the Primary Owner'
                    : isOwner 
                    ? 'You are viewing this page as a Co-Owner' 
                    : 'You are viewing this page as an authorized Team Staff Member'}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {isListMeOfficial 
                    ? 'You have administrator privileges to edit announcements, platform details, and storefront info.' 
                    : isTrueOwner
                    ? 'You have full management authority including editing details, managing team roles, transferring ownership, and deleting this page.'
                    : isOwner 
                    ? 'You have full owner permissions to edit opening hours, announcement, profile picture, storefront details, and manage staff.' 
                    : 'You have staff editor permissions to update storefront details, opening hours, announcements, and profile picture.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(isOwner || isAdmin || isTeamMember) && <CreateBusinessPageModal initialData={businessPage} />}
              {isTrueOwner && !isListMeOfficial && (
                <DeleteBusinessPageButton slug={businessPage.slug} pageName={businessPage.name} />
              )}
            </div>
          </div>
        )}

        
        <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden mb-6">
          
          
          <div className="h-44 sm:h-60 w-full bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 relative overflow-hidden">
            <Image
              src={bannerImage}
              alt={businessPage.name}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover object-center"
            />
            
            
            <div className="absolute top-3 right-3 flex flex-wrap items-center gap-2 z-10">
              <span className="px-2.5 py-1 rounded-md bg-black/80 text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-zinc-300" />
                <span>{isListMeOfficial ? 'Official Platform' : 'Marketplace Store'}</span>
              </span>

              
              {(isListMeOfficial || businessPage.is_verified) ? (
                <span className="px-2.5 py-1 rounded-md bg-black/80 text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
                  <span>{isListMeOfficial ? 'Verified Platform' : 'Verified Storefront'}</span>
                </span>
              ) : isOwner ? (
                <Link
                  href="/verified"
                  className="px-2.5 py-1 rounded-md bg-black/70 hover:bg-black/90 text-zinc-200 text-xs font-semibold border border-white/20 flex items-center gap-1.5 transition-colors"
                  title="Subscribe to Business Verification for €14.99/mo"
                >
                  <span>Unverified Business • Get Verified (€14.99/mo)</span>
                </Link>
              ) : null}
            </div>
          </div>

          
          <div className="px-6 sm:px-8 pb-4 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-14 sm:-mt-18 pb-6 border-b border-gray-100 dark:border-zinc-800">
              
              
              <div className="flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-left gap-4">
                
                
                <div className="relative group">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white dark:bg-[#181818] p-1.5 shadow-md ring-4 ring-white dark:ring-[#181818]">
                    <div className="w-full h-full rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-800 dark:text-gray-200 font-bold text-3xl uppercase select-none overflow-hidden relative">
                      {currentAvatarUrl ? (
                        <Image
                          src={currentAvatarUrl}
                          alt={businessPage.name}
                          fill
                          sizes="128px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        businessPage.name.substring(0, 2).toUpperCase()
                      )}
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  {(isOwner || isAdmin || isTeamMember) && (
                    <>
                      <input
                        type="file"
                        ref={avatarInputRef}
                        accept="image/*"
                        onChange={handleDirectAvatarChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="absolute bottom-1 right-1 z-20 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-200 hover:text-primary dark:hover:text-primary shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        title="Change Profile Picture"
                        aria-label="Change Profile Picture"
                      >
                        {isUploadingAvatar ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </button>
                    </>
                  )}
                </div>

                
                <div className="min-w-0 pt-2">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      {businessPage.name}
                    </h1>
                    {(isListMeOfficial || businessPage.is_verified) && (
                      <VerifiedBadge size="sm" />
                    )}
                  </div>

                  <p className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400 mt-1">
                    @{businessPage.slug} • <span className="text-zinc-400 font-medium">{businessPage.category}</span>
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
                    <span className="inline-flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300">
                      {isListMeOfficial ? 'Official Marketplace Platform' : 'Commercial Storefront'}
                    </span>
                    <span>•</span>
                    <span className="text-gray-600 dark:text-zinc-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" /> Direct Stripe Payouts
                    </span>
                  </div>
                </div>
              </div>

              
              <div className="flex items-center justify-center sm:justify-end gap-2.5 shrink-0">
                {!isListMeOfficial && (
                  <FavouriteBusinessButton
                    businessSlug={businessPage.slug}
                    initialIsFavourite={initialIsFavourite}
                  />
                )}

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                  title="Share page"
                >
                  {copied ? <Check className="w-4 h-4 text-zinc-200" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>

            </div>

            
            <div className="flex items-center gap-2 pt-2 text-xs font-bold">
              {!isListMeOfficial && (
                <button
                  type="button"
                  onClick={() => setActiveTab('listings')}
                  className={`px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'listings'
                      ? 'text-primary border-b-2 border-primary bg-gray-100 dark:bg-zinc-800'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Store Items ({listings.length})
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className={`px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'about'
                    ? 'text-primary border-b-2 border-primary bg-gray-100 dark:bg-zinc-800'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {isListMeOfficial ? 'Official Platform Info & Safety' : 'About & Opening Hours'}
              </button>
            </div>

          </div>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          
          <div className="lg:col-span-4 space-y-6">
            
            
            <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  About
                </h3>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {businessPage.business_type === 'service' ? 'Services & Trades' : 'Marketplace Store'}
                </span>
              </div>

              {businessPage.tagline && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {businessPage.tagline}
                </p>
              )}

              <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/80 space-y-3.5 text-xs text-gray-700 dark:text-gray-300">
                
                
                <div className="flex items-center gap-3">
                  <Store className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>
                    Model: <strong>{businessPage.business_type === 'service' ? 'Services & Trades' : 'Marketplace Store'}</strong>
                  </span>
                </div>

                
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-semibold text-gray-900 dark:text-white">Opening Hours</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {businessPage.opening_hours || 'Mon - Fri: 9:00 AM - 6:00 PM'}
                    </span>
                  </div>
                </div>

                
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Based in <strong>{businessPage.county}, Ireland</strong></span>
                </div>

                
                {businessPage.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="font-mono font-semibold">{businessPage.phone}</span>
                  </div>
                )}

                
                {businessPage.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <a href={`mailto:${businessPage.email}`} className="hover:text-primary hover:underline truncate">
                      {businessPage.email}
                    </a>
                  </div>
                )}

                
                {businessPage.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                    <a
                      href={businessPage.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 font-semibold truncate"
                    >
                      <span>{isListMeOfficial ? 'listme.ie' : businessPage.website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

              </div>

              
              {(businessPage.facebook || businessPage.linkedin) && (
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <span className="font-black text-[#1877F2]">f</span>
                        <span>Facebook</span>
                      </a>
                    )}

                    {businessPage.linkedin && (
                      <a
                        href={businessPage.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <span className="font-bold text-[#0A66C2]">in</span>
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

            </div>

            
            <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-gray-900 dark:text-white block mb-0.5">
                  Listme Buyer Protection
                </span>
                <span className="text-gray-500 dark:text-gray-400 leading-relaxed block">
                  Transactions completed across ListMe are covered up to €5,000 against non-delivery and counterfeit goods.
                </span>
                <Link href="/buyer-protection" className="text-primary hover:underline font-bold mt-1.5 inline-block">
                  Buyer Protection info &rarr;
                </Link>
              </div>
            </div>

            
            {(isOwner || isAdmin || isTeamMember) && !isListMeOfficial && (
              <BusinessTeamManagement
                pageSlug={businessPage.slug}
                isOwner={isOwner}
                isTrueOwner={isTrueOwner}
                isAdmin={isAdmin}
                teamMembers={businessPage.team_members}
                pendingInvites={businessPage.pending_invites}
              />
            )}

          </div>

          
          <div className="lg:col-span-8 space-y-6">
            
            
            {businessPage.announcement && (
              <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 shrink-0 mt-0.5">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">
                      Announcement
                    </span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                      {businessPage.announcement}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isListMeOfficial ? (
              /* Official Platform Overview for /page/listme */
              <div className="space-y-4">
                <div className="p-6 bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                      Welcome to ListMe Ireland
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">
                      ListMe is Ireland's modern, transparent online marketplace dedicated to fair trade across all 32 counties. Our platform connects Irish buyers and sellers with guaranteed buyer protection, direct Stripe payouts, and verified identity standards.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                      <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-white mb-1">
                        <CheckCircle2 className="w-4 h-4 text-gray-400" />
                        <span>Direct Bank Payouts</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Sellers receive fast, automated Stripe Connect bank transfers with transparent, low marketplace rates.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                      <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-white mb-1">
                        <ShieldCheck className="w-4 h-4 text-gray-400" />
                        <span>Credit Card Seller Verification</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        To eliminate scam accounts, all sellers must verify a credit card before publishing any listings.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                      <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-white mb-1">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span>Direct Ticket Support</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Need assistance? Open an authenticated ticket in our Help Centre to talk directly with our support team.
                      </p>
                      <Link href="/help" className="text-xs font-bold text-primary hover:underline mt-2 inline-block">
                        Open Support Channel &rarr;
                      </Link>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                      <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-white mb-1">
                        <Store className="w-4 h-4 text-gray-400" />
                        <span>Business Storefronts</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Registered Irish businesses can establish branded marketplace pages with verified handles and custom catalogs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Regular Business Listings / Services Grid */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-zinc-800">
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span>Store Inventory</span>
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
                      {isOwner ? 'Click "+ Add New Item" to add products to your storefront.' : 'This business will post new listings shortly.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
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
                        sellerName={businessPage.name}
                        sellerVerified={Boolean(isListMeOfficial || businessPage.is_verified)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
