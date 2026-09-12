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
      {/* Exclusive Twitter / Facebook-Style Scalloped Verified Seal */}
      <svg
        className={`${iconSize} drop-shadow-xs transition-transform duration-150 group-hover:scale-110`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Scalloped rosette seal */}
        <path
          d="M10.29 2.308a2.5 2.5 0 0 1 3.42 0l.966.86a2.5 2.5 0 0 0 2.228.618l1.272-.25a2.5 2.5 0 0 1 2.87 1.86l.326 1.255a2.5 2.5 0 0 0 1.547 1.74l1.208.455a2.5 2.5 0 0 1 1.487 3.09l-.427 1.226a2.5 2.5 0 0 0 .34 2.302l.808 1.01a2.5 2.5 0 0 1-.58 3.425l-1.037.773a2.5 2.5 0 0 0-1.026 2.083l.036 1.296a2.5 2.5 0 0 1-2.28 2.55l-1.293.107a2.5 2.5 0 0 0-1.92 1.309l-.658 1.118a2.5 2.5 0 0 1-3.238 1.05l-1.196-.505a2.5 2.5 0 0 0-2.316 0l-1.196.505a2.5 2.5 0 0 1-3.238-1.05l-.658-1.118a2.5 2.5 0 0 0-1.92-1.309l-1.293-.107a2.5 2.5 0 0 1-2.28-2.55l.036-1.296a2.5 2.5 0 0 0-1.026-2.083l-1.037-.773a2.5 2.5 0 0 1-.58-3.425l.808-1.01a2.5 2.5 0 0 0 .34-2.302l-.427-1.226a2.5 2.5 0 0 1 1.487-3.09l1.208-.455a2.5 2.5 0 0 0 1.547-1.74l.326-1.255a2.5 2.5 0 0 1 2.87-1.86l1.272.25a2.5 2.5 0 0 0 2.228-.618l.966-.86z"
          className="fill-emerald-500 dark:fill-emerald-400"
        />
        {/* Crisp checkmark */}
        <path
          d="M8.5 12.2l2.3 2.3 5.2-5.5"
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
