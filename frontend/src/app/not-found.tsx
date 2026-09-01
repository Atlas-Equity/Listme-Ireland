import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-8xl sm:text-9xl font-black text-primary mb-4 drop-shadow-sm">404</h1>
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Page Not Found
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        Oops! We can't seem to find the page you're looking for. It might have been removed, renamed, or doesn't exist.
      </p>
      <Link 
        href="/" 
        className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg shadow-sm"
      >
        Return Home
      </Link>
    </div>
  );
}
