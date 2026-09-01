import React from 'react';
import PageLayout from '@/components/PageLayout';
import { mockJobs } from '@/lib/mockData';

const jobsFilters = [
  {
    title: 'Industry',
    options: [
      { label: 'IT & Software', value: 'it' },
      { label: 'Construction & Architecture', value: 'construction' },
      { label: 'Healthcare & Medical', value: 'healthcare' },
      { label: 'Retail & FMCG', value: 'retail' },
      { label: 'Hospitality & Tourism', value: 'hospitality' },
      { label: 'Accounting & Finance', value: 'accounting' },
      { label: 'Education & Training', value: 'education' },
    ]
  },
  {
    title: 'Work Type',
    options: [
      { label: 'Full time', value: 'full_time' },
      { label: 'Part time', value: 'part_time' },
      { label: 'Contract/Temp', value: 'contract' },
      { label: 'Casual', value: 'casual' },
    ]
  },
  {
    title: 'Salary Range',
    options: [
      { label: '€30k - €50k', value: '30_50' },
      { label: '€50k - €80k', value: '50_80' },
      { label: '€80k - €120k', value: '80_120' },
      { label: '€120k+', value: '120_plus' },
    ]
  }
];

export default function JobsPage() {
  return (
    <PageLayout
      title="Jobs"
      description="Find your next career move with thousands of jobs available."
      filterGroups={jobsFilters}
      listings={mockJobs}
    />
  );
}
