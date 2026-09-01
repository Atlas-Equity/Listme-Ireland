import React from 'react';
import Link from 'next/link';
import { Tag, Car, Smartphone } from 'lucide-react';

export default function PromoBanners() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
      
      {/* Banner 1: Success Fees */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#ffd500] to-[#ffeb3b] p-6 flex flex-col justify-between min-h-[220px] group shadow-sm hover:shadow-md transition-shadow">
        <div className="relative z-10 w-2/3">
          <p className="text-[#0558b4] font-bold text-sm mb-1">Goodbye things.</p>
          <h2 className="text-[#0558b4] font-black text-2xl leading-tight mb-4">
            Success Fees?<br/>Gone. Profit?<br/>Yours.
          </h2>
          <Link href="#" className="inline-block bg-[#2f55db] hover:bg-[#2040b0] text-white font-bold py-2 px-5 rounded text-sm transition-colors shadow-sm">
            List now
          </Link>
        </div>
        <div className="absolute right-0 bottom-0 w-32 h-32 opacity-20 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-500">
          <Tag className="w-full h-full text-[#0558b4]" />
        </div>
      </div>

      {/* Banner 2: Motors Valuation */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#405df6] to-[#5b73f8] p-6 flex flex-col justify-between min-h-[220px] group shadow-sm hover:shadow-md transition-shadow">
        <div className="relative z-10 w-3/4">
          <p className="text-white font-bold text-sm mb-1">Motors</p>
          <h2 className="text-white font-black text-2xl leading-tight mb-4">
            Get a free car valuation now!
          </h2>
          <Link href="#" className="inline-block bg-white hover:bg-gray-100 text-[#405df6] font-bold py-2 px-5 rounded text-sm transition-colors shadow-sm mt-4">
            Learn more
          </Link>
        </div>
        <div className="absolute right-0 bottom-0 w-32 h-32 opacity-20 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-500">
          <Car className="w-full h-full text-white" />
        </div>
      </div>

      {/* Banner 3: Shared Watchlists */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#ffe500] to-[#fff34d] p-6 flex flex-col justify-between min-h-[220px] group shadow-sm hover:shadow-md transition-shadow">
        <div className="relative z-10 w-2/3">
          <p className="text-[#0558b4] font-bold text-sm mb-1">New feature</p>
          <h2 className="text-[#0558b4] font-black text-2xl leading-tight mb-4">
            Introducing Shared Watchlists!
          </h2>
          <Link href="#" className="inline-block bg-[#2f55db] hover:bg-[#2040b0] text-white font-bold py-2 px-5 rounded text-sm transition-colors shadow-sm">
            Try it now
          </Link>
        </div>
        <div className="absolute right-0 bottom-0 w-32 h-32 opacity-20 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-500">
          <Smartphone className="w-full h-full text-[#0558b4]" />
        </div>
      </div>

    </div>
  );
}
