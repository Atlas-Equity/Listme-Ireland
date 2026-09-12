import React from 'react';

interface VerifiedBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
  tooltipText?: string;
}

export default function VerifiedBadge({
  size = 'sm',
  className = '',
  showLabel = false,
  tooltipText = 'Verified Account • Safe to Trade With (Personally verified by ListMe)'
}: VerifiedBadgeProps) {
  const sizeMap = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const iconSize = sizeMap[size] || sizeMap.sm;

  return (
    <span
      className={`inline-flex items-center gap-1 shrink-0 select-none align-middle group relative cursor-help ${className}`}
      title={tooltipText}
    >
      {/* Twitter / Meta-Style Circular Verified Sphere */}
      <svg
        className={`${iconSize} drop-shadow-xs transition-transform duration-150 group-hover:scale-110 shrink-0`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Spherical circle background */}
        <circle
          cx="12"
          cy="12"
          r="10"
          className="fill-emerald-500 dark:fill-emerald-400"
        />
        {/* Crisp checkmark */}
        <path
          d="M8 12.2l2.6 2.6 5.4-5.6"
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showLabel && (
        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
          Verified
        </span>
      )}
    </span>
  );
}
