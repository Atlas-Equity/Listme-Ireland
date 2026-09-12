import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Briefcase, Wrench, Users } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-[#202020] border-t border-gray-200 dark:border-[#333333] text-gray-600 dark:text-gray-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Main Footer Links - 4 Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          {/* Marketplace */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-4 flex items-center">
              <ShoppingBag className="w-4 h-4 mr-2 text-primary" /> Marketplace
            </h3>
            <ul className="space-y-3">
              <li><Link href="/category/marketplace" className="hover:text-gray-900 dark:hover:text-white transition-colors">Stores</Link></li>
              <li><Link href="/browse" className="hover:text-gray-900 dark:hover:text-white transition-colors">Closing soon</Link></li>
              <li><Link href="/fees" className="hover:text-gray-900 dark:hover:text-white transition-colors">Marketplace fees</Link></li>
            </ul>
          </div>

          {/* Jobs */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-4 flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-primary" /> Jobs
            </h3>
            <ul className="space-y-3">
              <li><Link href="/category/jobs" className="hover:text-gray-900 dark:hover:text-white transition-colors">Browse job categories</Link></li>
              <li><Link href="/sell" className="hover:text-gray-900 dark:hover:text-white transition-colors">Advertisers advice</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-4 flex items-center">
              <Wrench className="w-4 h-4 mr-2 text-primary" /> Services
            </h3>
            <ul className="space-y-3">
              <li><Link href="/category/services" className="hover:text-gray-900 dark:hover:text-white transition-colors">Trades</Link></li>
              <li><Link href="/sell" className="hover:text-gray-900 dark:hover:text-white transition-colors">List my services</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-4 flex items-center">
              <Users className="w-4 h-4 mr-2 text-primary" /> Community
            </h3>
            <ul className="space-y-3">
              <li><Link href="/help" className="hover:text-gray-900 dark:hover:text-white transition-colors">Help</Link></li>
              <li><Link href="/buyer-protection" className="hover:text-gray-900 dark:hover:text-white transition-colors">Buyer Protection</Link></li>
              <li><Link href="/community" className="hover:text-gray-900 dark:hover:text-white transition-colors">Community Hub</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-200 dark:border-[#333333] text-xs gap-4">
          <div className="text-gray-500">
            © 2026 ListMe Limited
          </div>

          {/* Social Channels */}
          <div className="flex items-center gap-6">
            <a
              href="https://facebook.com/listmeie"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-500 hover:text-primary dark:hover:text-white transition-colors font-medium"
              title="ListMe on Facebook"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </a>

            <Link
              href="/page/listme"
              className="flex items-center gap-1 text-gray-500 hover:text-primary dark:hover:text-white transition-colors font-medium"
              title="Official ListMe Storefront Page"
            >
              <span className="text-primary font-bold text-sm">☘</span>
              <span>Listme</span>
            </Link>

            <a
              href="https://instagram.com/listme.ie"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-500 hover:text-primary dark:hover:text-white transition-colors font-medium"
              title="ListMe on Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Instagram</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy policy</Link>
            <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms & conditions</Link>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
