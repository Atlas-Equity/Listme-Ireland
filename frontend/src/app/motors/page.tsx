import React from 'react';
import PageLayout from '@/components/PageLayout';
import { mockMotors } from '@/lib/mockData';

const motorsFilters = [
  {
    title: 'Vehicle Type',
    options: [
      { label: 'Cars', value: 'cars' },
      { label: 'Motorbikes', value: 'motorbikes' },
      { label: 'Boats & Marine', value: 'boats' },
      { label: 'Caravans & Motorhomes', value: 'caravans' },
      { label: 'Trucks & Commercials', value: 'trucks' },
      { label: 'Trailers', value: 'trailers' },
      { label: 'Parts & Accessories', value: 'parts' },
    ]
  },
  {
    title: 'Make',
    options: [
      { label: 'Toyota', value: 'toyota' },
      { label: 'Ford', value: 'ford' },
      { label: 'Nissan', value: 'nissan' },
      { label: 'Honda', value: 'honda' },
      { label: 'Volkswagen', value: 'volkswagen' },
    ]
  },
  {
    title: 'Transmission',
    options: [
      { label: 'Automatic', value: 'automatic' },
      { label: 'Manual', value: 'manual' },
    ]
  }
];

export default function MotorsPage() {
  return (
    <PageLayout
      title="Motors"
      description="Find your next car, motorbike, boat, or parts."
      filterGroups={motorsFilters}
      listings={mockMotors}
    />
  );
}
