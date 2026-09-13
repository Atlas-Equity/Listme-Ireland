'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Briefcase, UserCheck, Building2, ExternalLink, Plus } from 'lucide-react';
import { ListingCard } from '@/components/ListingCard';
import { BusinessPageData } from '@/app/actions/businessPages';
import { COUNTIES } from '@/utils/irelandLocations';

interface JobCandidate {
  id: string;
  name: string;
  memberNumber?: string;
  bio?: string;
  skills?: string;
  location?: string;
  avatarUrl?: string;
  contactEmail?: string;
}

interface JobsClientProps {
  initialHiringBusinesses: BusinessPageData[];
  initialJobCandidates: JobCandidate[];
  initialJobListings: any[];
}

export default function JobsClient({
  initialHiringBusinesses,
  initialJobCandidates,
  initialJobListings,
}: JobsClientProps) {
  const [tab, setTab] = useState<'all' | 'hiring' | 'candidates'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('All');

  // Filter hiring businesses
  const filteredBusinesses = useMemo(() => {
    return initialHiringBusinesses.filter((b) => {
      const matchesCounty = selectedCounty === 'All' || b.county?.toLowerCase() === selectedCounty.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        b.name.toLowerCase().includes(q) ||
        (b.tagline && b.tagline.toLowerCase().includes(q)) ||
        (b.category && b.category.toLowerCase().includes(q)) ||
        (b.announcement && b.announcement.toLowerCase().includes(q));

      return matchesCounty && matchesSearch;
    });
  }, [initialHiringBusinesses, searchQuery, selectedCounty]);

  // Filter candidates looking for work
  const filteredCandidates = useMemo(() => {
    return initialJobCandidates.filter((c) => {
      const matchesCounty = selectedCounty === 'All' || c.location?.toLowerCase().includes(selectedCounty.toLowerCase());
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        (c.bio && c.bio.toLowerCase().includes(q)) ||
        (c.skills && c.skills.toLowerCase().includes(q));

      return matchesCounty && matchesSearch;
    });
  }, [initialJobCandidates, searchQuery, selectedCounty]);

  // Filter listings tagged with Jobs
  const filteredListings = useMemo(() => {
    return initialJobListings.filter((item) => {
      const matchesCounty = selectedCounty === 'All' || item.location?.toLowerCase().includes(selectedCounty.toLowerCase());
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);

      return matchesCounty && matchesSearch;
    });
  }, [initialJobListings, searchQuery, selectedCounty]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Jobs & Employment
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              A community mix of businesses actively hiring and verified members looking for work.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-green-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Post Job or Work Request</span>
            </Link>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-[#181818] p-3 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
            <div className="md:col-span-3 relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, skills (e.g. driver, carpentry, IT, barista), or companies..."
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
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* View Segment Switcher */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                tab === 'all'
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818] text-gray-700 dark:text-gray-300 hover:border-gray-300'
              }`}
            >
              All Opportunities
            </button>
            <button
              type="button"
              onClick={() => setTab('hiring')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                tab === 'hiring'
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818] text-gray-700 dark:text-gray-300 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Businesses Hiring ({filteredBusinesses.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('candidates')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                tab === 'candidates'
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818] text-gray-700 dark:text-gray-300 hover:border-gray-300'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Looking for Work ({filteredCandidates.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: Businesses Hiring (Service Businesses & Marketplaces) */}
      {(tab === 'all' || tab === 'hiring') && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <span>Businesses Actively Hiring</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Verified stores and service businesses hiring staff, contractors, and crew.
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
              {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'}
            </span>
          </div>

          {filteredBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBusinesses.map((b) => (
                <Link
                  key={b.slug}
                  href={`/page/${b.slug}`}
                  className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 hover:border-primary/50 transition-all group shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-3.5 mb-3.5">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 overflow-hidden relative shrink-0 flex items-center justify-center">
                        {b.avatarUrl ? (
                          <Image
                            src={b.avatarUrl}
                            alt={b.name}
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
                            {b.name}
                          </h3>
                          <span className="text-[11px] text-primary font-semibold">
                            Hiring
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {b.business_type === 'marketplace' ? 'Marketplace Storefront' : 'Service Business'} • {b.category || 'Trades & Commerce'}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-4">
                      {b.announcement || b.tagline || 'Open positions available. Apply directly via business profile.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{b.county || 'Ireland'}</span>
                    </span>
                    <span className="font-bold text-primary flex items-center gap-1 group-hover:underline">
                      View Openings <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 text-center">
              <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                No business pages currently posting hiring positions.
              </p>
            </div>
          )}
        </section>
      )}

      {/* SECTION 2: People Looking for Work */}
      {(tab === 'all' || tab === 'candidates') && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                <span>Members Looking for Work</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Registered community members available for contract work, shifts, or full-time roles.
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
              {filteredCandidates.length} {filteredCandidates.length === 1 ? 'member' : 'members'}
            </span>
          </div>

          {filteredCandidates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCandidates.map((c) => (
                <Link
                  key={c.id}
                  href={`/member/${c.memberNumber || c.id}`}
                  className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 hover:border-primary/50 transition-all group shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-3.5 mb-3.5">
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 overflow-hidden relative shrink-0 flex items-center justify-center font-bold text-gray-700 dark:text-gray-200">
                        {c.avatarUrl ? (
                          <Image
                            src={c.avatarUrl}
                            alt={c.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          c.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
                          {c.name}
                        </h3>
                        <p className="text-xs text-primary font-medium mt-0.5">
                          Available for Hire
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-4">
                      {c.bio || 'Experienced community member available for work across Ireland.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{c.location || 'Ireland'}</span>
                    </span>
                    <span className="font-bold text-primary flex items-center gap-1 group-hover:underline">
                      View Profile <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 text-center">
              <UserCheck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                No job seeker profiles currently registered.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                Looking for employment or freelance gigs? Update your profile bio to announce your availability.
              </p>
              <Link
                href="/my-listme"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-colors"
              >
                <span>Edit Profile Availability</span>
              </Link>
            </div>
          )}
        </section>
      )}

      {/* SECTION 3: Active Job Listings from Database */}
      {filteredListings.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <span>Job Postings</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Direct job advertisements and contract gigs.
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
              {filteredListings.length} {filteredListings.length === 1 ? 'post' : 'posts'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredListings.map((item) => (
              <ListingCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={Number(item.price)}
                priceType={item.price_type || 'Salary / Wage'}
                condition={item.condition || 'Job'}
                images={item.images || []}
                createdAt={item.created_at}
                location={item.location}
                closesAt={item.expires_at || item.ends_at}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
