import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';

const mockListings = [
  { id: 1, title: '[EXAMPLE TITLE]', price: '[EXAMPLE PAYMENT]', type: 'auction', bids: '[EXAMPLE BID]', timeRemaining: '[EXAMPLE TIME]', image: '[EXAMPLE IMAGE]' },
  { id: 2, title: '[EXAMPLE TITLE]', price: '[EXAMPLE PAYMENT]', type: 'service', rating: '[EXAMPLE RATING]', reviews: '[EXAMPLE REVIEWS]', image: '[EXAMPLE IMAGE]' },
  { id: 3, title: '[EXAMPLE TITLE]', price: '[EXAMPLE PAYMENT]', type: 'job', company: '[EXAMPLE COMPANY]', image: '[EXAMPLE IMAGE]' },
  { id: 4, title: '[EXAMPLE TITLE]', price: '[EXAMPLE PAYMENT]', type: 'buynow', location: '[EXAMPLE LOCATION]', image: '[EXAMPLE IMAGE]' },
];

export default function FeaturedCarousel() {
  return (
    <section className="py-12 bg-white dark:bg-black border-t border-gray-100 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Trending Right Now
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Top picks from across the marketplace
            </p>
          </div>
          <a href="#" className="hidden sm:flex items-center text-sm font-medium text-primary hover:text-primary-hover transition-colors">
            View all trending <ArrowRight className="w-4 h-4 ml-1" />
          </a>
        </div>

        {/* Carousel Container */}
        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 gap-6 snap-x hide-scrollbar">
          
          {mockListings.map((listing) => (
            <div 
              key={listing.id}
              className="flex-none w-64 sm:w-72 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden hover:shadow-md transition-shadow group snap-start cursor-pointer"
            >
              <div className="relative h-48 w-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500 font-bold tracking-widest text-sm">
                  {listing.image}
                </span>
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                    {listing.type.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                  {listing.title}
                </h3>
                
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {listing.price}
                </div>

                {/* Listing Specific Footer */}
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  {listing.type === 'auction' && (
                    <>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{listing.bids}</span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center text-orange-600 dark:text-orange-400 font-medium">
                        <Clock className="w-3 h-3 mr-1" /> {listing.timeRemaining}
                      </span>
                    </>
                  )}
                  {listing.type === 'service' && (
                    <>
                      <span className="font-medium text-amber-500">★ {listing.rating}</span>
                      <span className="ml-1 text-gray-400">({listing.reviews})</span>
                    </>
                  )}
                  {listing.type === 'job' && (
                    <span className="font-medium text-gray-700 dark:text-gray-300">{listing.company}</span>
                  )}
                  {listing.type === 'buynow' && (
                    <span className="font-medium text-gray-700 dark:text-gray-300">{listing.location}</span>
                  )}
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
