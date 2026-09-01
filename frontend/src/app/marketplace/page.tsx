import React from 'react';
import PageLayout from '@/components/PageLayout';
import { mockMarketplace } from '@/lib/mockData';

const marketplaceFilters = [
  {
    title: 'Category',
    options: [
      { label: 'Antiques & Collectables', value: 'antiques' },
      { label: 'Art', value: 'art' },
      { label: 'Baby Gear', value: 'baby' },
      { label: 'Books', value: 'books' },
      { label: 'Building & Renovation', value: 'building' },
      { label: 'Clothing & Fashion', value: 'clothing' },
      { label: 'Computers', value: 'computers' },
      { label: 'Electronics', value: 'electronics' },
      { label: 'Home & Living', value: 'home' },
    ]
  },
  {
    title: 'Condition',
    options: [
      { label: 'New', value: 'new' },
      { label: 'Used', value: 'used' },
    ]
  },
  {
    title: 'Buying Format',
    options: [
      { label: 'Auction', value: 'auction' },
      { label: 'Buy Now', value: 'buynow' },
    ]
  }
];

export default function MarketplacePage() {
  return (
    <PageLayout
      title="Marketplace (Items)"
      description="Buy and sell new and used items across thousands of categories."
      filterGroups={marketplaceFilters}
      listings={mockMarketplace}
    />
  );
}
