import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  priceType: string;
  condition: string;
  images: string[];
  createdAt: string;
}

export function ListingCard({ id, title, price, priceType, condition, images, createdAt }: ListingCardProps) {
  const mainImage = images && images.length > 0 ? images[0] : null;
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <Link 
      href={`/listing/${id}`} 
      prefetch={true}
      className="group block bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
    >
      <div className="relative aspect-square bg-gray-100 dark:bg-zinc-800 w-full overflow-hidden">
        {mainImage ? (
          <Image 
            src={mainImage} 
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600">
            <Package className="w-12 h-12 mb-2" />
            <span className="text-sm font-medium">No Image</span>
          </div>
        )}
        
        {priceType === 'Auction' && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
            AUCTION
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[3rem] mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <div className="flex items-end justify-between mt-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{condition}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              €{price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3 mr-1" />
          <span>Listed {timeAgo}</span>
        </div>
      </div>
    </Link>
  );
}
