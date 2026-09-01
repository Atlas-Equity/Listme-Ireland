import React from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; listing_id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const listingId = resolvedParams.listing_id;

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#1a1a1a] text-white p-4">
      <div className="max-w-md w-full bg-[#242424] border border-[#333] rounded-lg p-8 text-center shadow-xl">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Your order has been confirmed. The seller will be notified shortly to arrange delivery or pick-up.
        </p>

        <div className="space-y-4">
          {listingId && (
            <>
              <Link 
                href={`/leave-review/${listingId}`}
                className="w-full flex items-center justify-center py-3 px-4 bg-[#ffb703] hover:bg-[#c68d00] text-black font-bold rounded-sm transition-colors"
              >
                Leave a Review for Seller
              </Link>
              <Link 
                href={`/listing/${listingId}`}
                className="w-full flex items-center justify-center py-3 px-4 bg-[#333] hover:bg-[#444] text-white font-medium rounded-sm transition-colors"
              >
                Return to Listing
              </Link>
            </>
          )}
          
          <Link 
            href="/"
            className="w-full flex items-center justify-center py-3 px-4 bg-[#0073e6] hover:bg-[#005bb5] text-white font-medium rounded-sm transition-colors"
          >
            Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
