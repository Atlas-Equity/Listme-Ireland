import React from 'react';

interface VerifiedBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLabel?: boolean;
  tooltipText?: string;
  color?: 'green' | 'emerald' | 'blue' | 'gold';
}

export default function VerifiedBadge({
  size = 'sm',
  className = '',
  showLabel = false,
  tooltipText = 'Verified Account • Safe to Trade With (Personally verified by ListMe)',
  color = 'green'
}: VerifiedBadgeProps) {
  const sizeMap = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-10 h-10',
  };

  const iconSize = sizeMap[size] || sizeMap.sm;

  const colorClass = {
    green: 'fill-emerald-500 dark:fill-emerald-400',
    emerald: 'fill-emerald-500 dark:fill-emerald-400',
    blue: 'fill-[#1D9BF0]',
    gold: 'fill-amber-400',
  }[color] || 'fill-emerald-500 dark:fill-emerald-400';

  return (
    <span
      className={`inline-flex items-center gap-1 shrink-0 select-none align-middle group relative cursor-help ${className}`}
      title={tooltipText}
    >
      <svg
        className={`${iconSize} drop-shadow-xs transition-transform duration-150 group-hover:scale-110 shrink-0`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"
          className={colorClass}
        />
        <path
          d="M10.54 16.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"
          fill="#ffffff"
        />
      </svg>

      {showLabel && (
        <span className={`text-[11px] font-bold ${color === 'blue' ? 'text-[#1D9BF0]' : 'text-emerald-600 dark:text-emerald-400'}`}>
          Verified
        </span>
      )}
    </span>
  );
}
