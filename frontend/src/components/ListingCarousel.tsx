'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ListingCarousel({ title, images }: { title: string, images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const mainImage = images && images.length > 0 ? images[currentIndex] : null;

  return (
    <div className="bg-[#242424] overflow-hidden rounded-sm">
      <div className="relative aspect-[4/3] bg-black w-full flex items-center justify-center group">
        {mainImage ? (
          <>
            <Image 
              src={mainImage} 
              alt={title}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="text-gray-500 flex flex-col items-center">
            <AlertCircle className="w-12 h-12 mb-2" />
            <span>No image provided</span>
          </div>
        )}
      </div>
      
      {/* Thumbnail strip */}
      {images && images.length > 1 && (
        <div className="flex gap-2 p-2 overflow-x-auto bg-[#1a1a1a]">
          {images.map((img: string, idx: number) => (
            <div 
              key={idx} 
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-16 h-16 flex-shrink-0 cursor-pointer border-2 transition-all ${idx === currentIndex ? 'border-[#ffb703] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <Image src={img} alt={`Thumbnail ${idx+1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
