import React from 'react';
import PageLayout from '@/components/PageLayout';
import { mockServices } from '@/lib/mockData';

export const dynamic = 'force-static';

const servicesFilters = [
  {
    title: 'Category',
    options: [
      { label: 'Building & Trades', value: 'trades' },
      { label: 'Cleaning', value: 'cleaning' },
      { label: 'Landscaping & Gardening', value: 'landscaping' },
      { label: 'Automotive Services', value: 'automotive' },
      { label: 'Health & Beauty', value: 'health' },
      { label: 'Events & Catering', value: 'events' },
      { label: 'Moving & Storage', value: 'moving' },
    ]
  },
  {
    title: 'Rating',
    options: [
      { label: 'Score 4 & Up', value: '4_plus' },
      { label: 'Score 3 & Up', value: '3_plus' },
      { label: 'Unrated (New)', value: 'new' },
    ]
  },
  {
    title: 'Availability',
    options: [
      { label: 'Available Now', value: 'now' },
      { label: 'Available This Week', value: 'this_week' },
      { label: 'Emergency Callout 24/7', value: 'emergency' },
    ]
  }
];

export default function ServicesPage() {
  return (
    <PageLayout
      title="Services"
      description="Hire trusted local professionals for any job."
      filterGroups={servicesFilters}
      listings={mockServices}
    />
  );
}
