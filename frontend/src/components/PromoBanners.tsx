import React from 'react';
import Link from 'next/link';
import { Tag, ShieldCheck, Heart } from 'lucide-react';

export default function PromoBanners() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 sm:my-8">
      
      
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 p-6 flex flex-col justify-between min-h-[200px] sm:min-h-[220px] group shadow-xs hover:shadow-md transition-shadow">
        <div className="relative z-10 w-full sm:w-3/4">
          <p className="text-primary font-bold text-xs uppercase tracking-wider mb-1">Selling on ListMe</p>
          <h2 className="text-gray-900 dark:text-white font-black text-xl sm:text-2xl leading-tight mb-4">
            Sell Local.<br/>Fast Payouts.<br/>Real Buyers.
          </h2>
          <Link
            href="/sell"
            prefetch={true}
            className="inline-block bg-primary hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg text-sm transition-colors shadow-xs"
          >
            List now
          </Link>
        </div>
        <div className="absolute right-0 bottom-0 w-28 h-28 sm:w-32 sm:h-32 text-gray-200 dark:text-zinc-800/60 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
          <Tag className="w-full h-full" />
        </div>
      </div>

      
      <div className="relative overflow-hidden rounded-2xl bg-[#064e3b] dark:bg-[#064e3b] border border-emerald-600/30 p-6 flex flex-col justify-between min-h-[200px] sm:min-h-[220px] group shadow-xs hover:shadow-md transition-shadow">
        <div className="relative z-10 w-full sm:w-3/4">
          <p className="text-emerald-200 font-bold text-xs uppercase tracking-wider mb-1">Safe Trading</p>
          <h2 className="text-white font-black text-xl sm:text-2xl leading-tight mb-4">
            Protected with Buyer Protection up to €5,000!
          </h2>
          <Link
            href="/buyer-protection"
            prefetch={true}
            className="inline-block bg-white hover:bg-emerald-50 text-[#064e3b] font-bold py-2 px-5 rounded-lg text-sm transition-colors shadow-xs"
          >
            Buyer Protection
          </Link>
        </div>
        <div className="absolute right-0 bottom-0 w-28 h-28 sm:w-32 sm:h-32 text-emerald-500/20 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
          <ShieldCheck className="w-full h-full" />
        </div>
      </div>

      
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 p-6 flex flex-col justify-between min-h-[200px] sm:min-h-[220px] group shadow-xs hover:shadow-md transition-shadow">
        <div className="relative z-10 w-full sm:w-3/4">
          <p className="text-primary font-bold text-xs uppercase tracking-wider mb-1">Marketplace Feature</p>
          <h2 className="text-gray-900 dark:text-white font-black text-xl sm:text-2xl leading-tight mb-4">
            Track Auctions &amp; Save Items!
          </h2>
          <Link
            href="/watchlist"
            prefetch={true}
            className="inline-block bg-primary hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg text-sm transition-colors shadow-xs"
          >
            My Watchlist
          </Link>
        </div>
        <div className="absolute right-0 bottom-0 w-28 h-28 sm:w-32 sm:h-32 text-gray-200 dark:text-zinc-800/60 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
          <Heart className="w-full h-full" />
        </div>
      </div>

    </div>
  );
}
