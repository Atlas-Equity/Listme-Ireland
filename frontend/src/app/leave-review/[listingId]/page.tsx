import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { submitReview } from '@/app/actions/reviews';

export default async function LeaveReviewPage({ params }: { params: Promise<{ listingId: string }> }) {
  const resolvedParams = await params;
  const listingId = resolvedParams.listingId;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: listing } = await supabase
    .from('listings')
    .select('title, seller_id')
    .eq('id', listingId)
    .single();

  if (!listing) {
    notFound();
  }

  const { data: seller } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', listing.seller_id)
    .single();

  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('listing_id', listingId)
    .eq('reviewer_id', user.id)
    .single();

  if (existingReview) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Review Submitted</h1>
        <p className="text-gray-400 mb-6">You have already reviewed this transaction. Thank you!</p>
        <Link href="/" className="px-6 py-2 bg-[#0073e6] text-white rounded-md">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white py-12 px-4 flex justify-center">
      <div className="w-full max-w-xl bg-[#242424] border border-[#333] rounded-lg p-8 shadow-xl">
        <h1 className="text-2xl font-bold mb-2">Leave a Review</h1>
        <p className="text-gray-400 mb-8">
          How was your experience buying <span className="text-white font-medium">{listing.title}</span> from <span className="text-[#0073e6]">{seller?.username}</span>?
        </p>

        <form action={submitReview as any} className="space-y-6">
          <input type="hidden" name="listingId" value={listingId} />
          <input type="hidden" name="revieweeId" value={listing.seller_id} />
          
          <div>
            <label className="block text-sm font-medium mb-3">Rate your experience</label>
            <div className="flex gap-2 flex-row-reverse justify-end peer group">
              {[5, 4, 3, 2, 1].map((star) => (
                <React.Fragment key={star}>
                  <input 
                    type="radio" 
                    id={`star${star}`} 
                    name="rating" 
                    value={star} 
                    className="peer hidden" 
                    required 
                  />
                  <label 
                    htmlFor={`star${star}`} 
                    className="cursor-pointer text-gray-500 peer-checked:text-[#ffb703] peer-hover:text-[#ffb703] hover:text-[#ffb703] transition-colors"
                  >
                    <Star className="w-10 h-10 fill-current" />
                  </label>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">Add a comment (Optional)</label>
            <textarea
              id="comment"
              name="comment"
              rows={4}
              placeholder="Tell others what you thought of this seller..."
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-md p-3 text-white focus:outline-none focus:border-[#0073e6]"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-[#0073e6] hover:bg-[#005bb5] text-white font-bold rounded-md transition-colors"
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}
