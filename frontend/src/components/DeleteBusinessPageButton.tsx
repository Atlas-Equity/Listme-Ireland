'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react';
import { deleteBusinessPage } from '@/app/actions/businessPages';

interface DeleteBusinessPageButtonProps {
  slug: string;
  pageName: string;
  redirectTo?: string;
  className?: string;
  variant?: 'button' | 'icon';
}

export default function DeleteBusinessPageButton({
  slug,
  pageName,
  redirectTo = '/my-listme?tab=pages',
  className = '',
  variant = 'button',
}: DeleteBusinessPageButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await deleteBusinessPage(slug);
      if (res.error) {
        setError(res.error);
        setIsDeleting(false);
      } else {
        setIsOpen(false);
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.refresh();
        }
      }
    } catch {
      setError('Failed to delete page.');
      setIsDeleting(false);
    }
  };

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`p-2 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-400 hover:text-red-500 hover:border-red-300 dark:hover:border-red-900 transition-colors cursor-pointer ${className}`}
          title="Delete Business Page"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${className}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Page</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-950/50">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Delete Business Page?
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              Are you sure you want to delete <strong className="text-gray-900 dark:text-white">&ldquo;{pageName}&rdquo;</strong>? This will permanently remove the public page URL <span className="font-mono text-xs">/page/{slug}</span>.
            </p>

            {error && (
              <p className="text-xs text-red-500 font-medium mb-4">{error}</p>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
