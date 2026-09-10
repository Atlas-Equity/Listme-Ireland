import React from 'react';
import Link from 'next/link';
import { Tag, ShieldCheck, Heart } from 'lucide-react';

export default function PromoBanners() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 sm:my-8">
      
      {/* Banner 1: Success Fees */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#ffd500] to-[#ffeb3b] p-6 flex flex-col justify-between min-h-[200px] sm:min-h-[220px] group shadow-sm hover:shadow-md transition-shadow">
        <div className="relative z-10 w-full sm:w-2/3">
          <p className="text-[#0558b4] font-bold text-xs uppercase tracking-wider mb-1">Selling on ListMe</p>
          <h2 className="text-[#0558b4] font-black text-xl sm:text-2xl leading-tight mb-4">
            Success Fees?<br/>Gone. Profit?<br/>Yours.
          </h2>
          <Link
            href="/sell"
            prefetch={true}
            className="inline-block bg-[#2f55db] hover:bg-[#2040b0] text-white font-bold py-2 px-5 rounded-lg text-sm transition-colors shadow-sm"
          >
            List now
          </Link>
        </div>
        <div className="absolute right-0 bottom-0 w-28 h-28 sm:w-32 sm:h-32 opacity-20 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
          <Tag className="w-full h-full text-[#0558b4]" />
        </div>
      </div>

      {/* Banner 2: Buyer Protection */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#405df6] to-[#5b73f8] p-6 flex flex-col justify-between min-h-[200px] sm:min-h-[220px] group shadow-sm hover:shadow-md transition-shadow">
        <div className="relative z-10 w-full sm:w-3/4">
          <p className="text-white/80 font-bold text-xs uppercase tracking-wider mb-1">Safe Trading</p>
          <h2 className="text-white font-black text-xl sm:text-2xl leading-tight mb-4">
            Protected with Buyer Protection up to €5,000!
          </h2>
          <Link
            href="/category/marketplace"
            prefetch={true}
            className="inline-block bg-white hover:bg-gray-100 text-[#405df6] font-bold py-2 px-5 rounded-lg text-sm transition-colors shadow-sm"
          >
            Explore Marketplace
          </Link>
        </div>
        <div className="absolute right-0 bottom-0 w-28 h-28 sm:w-32 sm:h-32 opacity-20 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
          <ShieldCheck className="w-full h-full text-white" />
        </div>
      </div>

      {/* Banner 3: Watchlists */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#ffe500] to-[#fff34d] p-6 flex flex-col justify-between min-h-[200px] sm:min-h-[220px] group shadow-sm hover:shadow-md transition-shadow">
        <div className="relative z-10 w-full sm:w-2/3">
          <p className="text-[#0558b4] font-bold text-xs uppercase tracking-wider mb-1">New Feature</p>
          <h2 className="text-[#0558b4] font-black text-xl sm:text-2xl leading-tight mb-4">
            Track Auctions &amp; Save Items!
          </h2>
          <Link
            href="/my-listme?tab=watchlist"
            prefetch={true}
            className="inline-block bg-[#2f55db] hover:bg-[#2040b0] text-white font-bold py-2 px-5 rounded-lg text-sm transition-colors shadow-sm"
          >
            My Watchlist
          </Link>
        </div>
        <div className="absolute right-0 bottom-0 w-28 h-28 sm:w-32 sm:h-32 opacity-20 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
          <Heart className="w-full h-full text-[#0558b4]" />
        </div>
      </div>

    </div>
  );
}
