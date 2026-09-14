import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, LogIn } from 'lucide-react';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-black px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-[#181818] p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Authentication Link Expired or Invalid
        </h1>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          The login link or one-time verification code has expired, has already been used, or was opened in an incompatible browser window.
        </p>

        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-green-700 text-white font-bold text-sm transition-colors shadow-xs"
          >
            <LogIn className="w-4 h-4" />
            <span>Return to Log In</span>
          </Link>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-colors"
          >
            <span>Back to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
