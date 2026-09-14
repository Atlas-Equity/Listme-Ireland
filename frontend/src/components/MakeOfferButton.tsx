'use client';

import React, { useState } from 'react';
import { Tag } from 'lucide-react';
import MakeOfferModal from './MakeOfferModal';

interface MakeOfferButtonProps {
  listingId: string;
  sellerId: string;
  listingTitle: string;
  askingPrice: number;
  className?: string;
  isAuction?: boolean;
}

export default function MakeOfferButton({
  listingId,
  sellerId,
  listingTitle,
  askingPrice,
  className = '',
  isAuction = false,
}: MakeOfferButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className || "w-full py-3 px-4 rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-[#222222] hover:bg-gray-200 dark:hover:bg-[#2c2c2c] text-gray-900 dark:text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xs"}
      >
        <Tag className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        <span>Make an Offer</span>
      </button>

      <MakeOfferModal
        listingId={listingId}
        sellerId={sellerId}
        listingTitle={listingTitle}
        askingPrice={askingPrice}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isAuction={isAuction}
      />
    </>
  );
}
