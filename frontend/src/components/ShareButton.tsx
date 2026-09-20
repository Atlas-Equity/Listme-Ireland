'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  url?: string;
  title?: string;
  text?: string;
  label?: string;
  className?: string;
}

export default function ShareButton({
  url,
  title,
  text,
  label,
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'ListMe Ireland',
          text: text || 'Check this out on ListMe Ireland:',
          url: targetUrl,
        });
        return;
      } catch {}
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(targetUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {}
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      title="Share link"
      className={className || "inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span>{label ? 'Copied!' : 'Copied'}</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5" />
          <span>{label || 'Share'}</span>
        </>
      )}
    </button>
  );
}
