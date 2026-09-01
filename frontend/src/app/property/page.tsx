import React from 'react';
import PageLayout from '@/components/PageLayout';
import { mockProperty } from '@/lib/mockData';

const propertyFilters = [
  {
    title: 'Category',
    options: [
      { label: 'Residential for Sale', value: 'residential_sale' },
      { label: 'Residential for Rent', value: 'residential_rent' },
      { label: 'Flatmates Wanted', value: 'flatmates' },
      { label: 'Commercial for Sale', value: 'commercial_sale' },
      { label: 'Commercial for Lease', value: 'commercial_lease' },
      { label: 'Rural Properties', value: 'rural' },
    ]
  },
  {
    title: 'Bedrooms',
    options: [
      { label: '1+', value: '1' },
      { label: '2+', value: '2' },
      { label: '3+', value: '3' },
      { label: '4+', value: '4' },
      { label: '5+', value: '5' },
    ]
  },
  {
    title: 'Property Type',
    options: [
      { label: 'House', value: 'house' },
      { label: 'Apartment', value: 'apartment' },
      { label: 'Townhouse', value: 'townhouse' },
      { label: 'Unit', value: 'unit' },
    ]
  }
];

export default function PropertyPage() {
  return (
    <PageLayout
      title="Property"
      description="Find your next home to buy or rent across Ireland."
      filterGroups={propertyFilters}
      listings={mockProperty}
    />
  );
}
