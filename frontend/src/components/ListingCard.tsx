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
      className="group flex flex-col bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
    >
      <div className="relative aspect-square bg-gray-100 dark:bg-zinc-800 w-full overflow-hidden">
        {mainImage ? (
          <Image 
            src={mainImage} 
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            loading="lazy"
            decoding="async"
            unoptimized={!mainImage.includes('supabase.co') && !mainImage.includes('unsplash.com')}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600">
            <Package className="w-10 h-10 mb-2" />
            <span className="text-xs font-medium">No Image</span>
          </div>
        )}
      </div>

      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] mb-1.5 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{condition}</p>
        </div>
        
        <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            €{price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center text-[11px] text-gray-400">
            <Clock className="w-3 h-3 mr-1" />
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
