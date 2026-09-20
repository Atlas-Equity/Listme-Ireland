'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { createClient } from '@/utils/supabase/client';

interface StripePricingTableProps {
  pricingTableId?: string;
  publishableKey?: string;
  clientReferenceId?: string;
  customerEmail?: string;
  className?: string;
}

export default function StripePricingTable({
  pricingTableId = process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || 'prctbl_1UHiSUQ4vWyFpILpF8sCjPPn',
  publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_live_51TlR2gQ4vWyFpILpKmPSa2iCMOGH5zCE0dracV3PaWTDk1uA4MGJtC0kcIPXIjgSUVNZ6s5WGPOKbqclUPxuwemA00UMLqRB6r',
  clientReferenceId,
  customerEmail,
  className = '',
}: StripePricingTableProps) {
  const [resolvedUserId, setResolvedUserId] = useState<string | undefined>(clientReferenceId);
  const [resolvedEmail, setResolvedEmail] = useState<string | undefined>(customerEmail);

  useEffect(() => {
    if (!clientReferenceId || !customerEmail) {
      try {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
          if (data?.user) {
            if (!clientReferenceId && data.user.id) setResolvedUserId(data.user.id);
            if (!customerEmail && data.user.email) setResolvedEmail(data.user.email);
          }
        }).catch(() => {});
      } catch {}
    }
  }, [clientReferenceId, customerEmail]);

  const elementProps: Record<string, string> = {
    'pricing-table-id': pricingTableId,
    'publishable-key': publishableKey,
  };

  const finalUserId = clientReferenceId || resolvedUserId;
  const finalEmail = customerEmail || resolvedEmail;

  if (finalUserId) {
    elementProps['client-reference-id'] = finalUserId;
  }

  if (finalEmail) {
    elementProps['customer-email'] = finalEmail;
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
