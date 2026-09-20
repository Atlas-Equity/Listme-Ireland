'use client';

import React from 'react';
import Script from 'next/script';

interface StripePricingTableProps {
  pricingTableId?: string;
  publishableKey?: string;
  clientReferenceId?: string;
  customerEmail?: string;
  className?: string;
}

export default function StripePricingTable({
  pricingTableId = process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || 'prctbl_1UFYqWQ4vWyFpILpWMsKMVmf',
  publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_live_51TlR2gQ4vWyFpILpKmPSa2iCMOGH5zCE0dracV3PaWTDk1uA4MGJtC0kcIPXIjgSUVNZ6s5WGPOKbqclUPxuwemA00UMLqRB6r',
  clientReferenceId,
  customerEmail,
  className = '',
}: StripePricingTableProps) {
  const elementProps: Record<string, string> = {
    'pricing-table-id': pricingTableId,
    'publishable-key': publishableKey,
  };

  if (clientReferenceId) {
    elementProps['client-reference-id'] = clientReferenceId;
  }

  if (customerEmail) {
    elementProps['customer-email'] = customerEmail;
  }

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <Script
        src="https://js.stripe.com/v3/pricing-table.js"
        strategy="afterInteractive"
      />
      {React.createElement('stripe-pricing-table', elementProps)}
    </div>
  );
}
