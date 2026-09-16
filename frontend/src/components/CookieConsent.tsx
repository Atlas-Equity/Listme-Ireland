'use client';

import React, { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie_consent', 'all');
    setShowConsent(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem('cookie_consent', 'necessary');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-zinc-800 shadow-lg transform transition-transform">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm text-gray-700 dark:text-gray-300">
          <p className="font-semibold mb-1 text-gray-900 dark:text-white">We value your privacy</p>
          <p>
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Yes", you consent to our use of cookies.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={acceptNecessary}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-md transition-colors"
          >
            Only accept necessary cookies
          </button>
          <button
            onClick={acceptAll}
            className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-green-700 rounded-md shadow-sm transition-colors"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
