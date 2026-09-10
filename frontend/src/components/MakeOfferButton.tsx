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
}

export default function MakeOfferButton({
  listingId,
  sellerId,
  listingTitle,
  askingPrice,
  className = '',
}: MakeOfferButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className || "w-full py-3 px-4 rounded-sm border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2"}
      >
        <Tag className="w-4 h-4" />
        Make an Offer
      </button>

      <MakeOfferModal
        listingId={listingId}
        sellerId={sellerId}
        listingTitle={listingTitle}
        askingPrice={askingPrice}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
