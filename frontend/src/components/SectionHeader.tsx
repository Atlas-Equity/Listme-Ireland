import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  viewAllLink?: string;
  viewAllText?: string;
}

export default function SectionHeader({ title, viewAllLink, viewAllText = "View all" }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between border-b border-gray-200 dark:border-zinc-800 pb-2 mb-4 mt-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none">
        {title}
      </h2>
      {viewAllLink && (
        <Link href={viewAllLink} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center">
          {viewAllText} <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      )}
    </div>
  );
}
