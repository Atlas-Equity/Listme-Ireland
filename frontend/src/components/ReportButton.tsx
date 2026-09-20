'use client';

import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import ReportModal from './ReportModal';

interface ReportButtonProps {
  targetType: 'user' | 'business';
  targetIdentifier: string;
  targetUrl: string;
  targetName?: string;
  label?: string;
  className?: string;
}

export default function ReportButton({
  targetType,
  targetIdentifier,
  targetUrl,
  targetName,
  label,
  className,
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title={`Report ${targetType === 'business' ? 'storefront' : 'member'}`}
        className={className || "inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30 hover:bg-red-100/70 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"}
      >
        <Flag className="w-3.5 h-3.5" />
        {label && <span>{label}</span>}
      </button>

      <ReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        targetType={targetType}
        targetIdentifier={targetIdentifier}
        targetUrl={targetUrl}
        targetName={targetName}
      />
    </>
  );
}
