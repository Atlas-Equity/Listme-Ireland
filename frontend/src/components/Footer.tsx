import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Briefcase, Wrench, Users } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-[#202020] border-t border-gray-200 dark:border-[#333333] text-gray-600 dark:text-gray-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          
          
          <div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-4 flex items-center">
              <ShoppingBag className="w-4 h-4 mr-2 text-primary" /> Marketplace
            </h3>
            <ul className="space-y-3">
              <li><Link href="/marketplace" className="hover:text-gray-900 dark:hover:text-white transition-colors">Stores</Link></li>
              <li><Link href="/marketplace?format=closing-soon" className="hover:text-gray-900 dark:hover:text-white transition-colors">Closing soon</Link></li>
              <li><Link href="/fees" className="hover:text-gray-900 dark:hover:text-white transition-colors">Marketplace fees</Link></li>
              <li><Link href="/sell" className="hover:text-gray-900 dark:hover:text-white transition-colors">List an item</Link></li>
            </ul>
          </div>

          
          <div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-4 flex items-center">
              <Users className="w-4 h-4 mr-2 text-primary" /> Community
            </h3>
            <ul className="space-y-3">
              <li><Link href="/help" className="hover:text-gray-900 dark:hover:text-white transition-colors">Help</Link></li>
              <li><Link href="/shipping" className="hover:text-gray-900 dark:hover:text-white transition-colors">Shipping &amp; Delivery</Link></li>
              <li><Link href="/buyer-protection" className="hover:text-gray-900 dark:hover:text-white transition-colors">Buyer Protection</Link></li>
              <li><Link href="/safety" className="hover:text-gray-900 dark:hover:text-white transition-colors">Scam Prevention &amp; Advice</Link></li>
              <li><Link href="/community" className="hover:text-gray-900 dark:hover:text-white transition-colors">Community Hub</Link></li>
            </ul>
          </div>
        </div>

        
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-200 dark:border-[#333333] text-xs gap-4">
          <div className="text-gray-500">
            © 2026 ListMe Limited
          </div>

          
          <div className="flex items-center gap-6">
            <a
              href="https://www.facebook.com/profile.php?id=61594336620072"
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
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/shipping" className="hover:text-gray-900 dark:hover:text-white transition-colors">Shipping policy</Link>
            <Link href="/safety" className="hover:text-gray-900 dark:hover:text-white transition-colors">Scam prevention</Link>
            <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy policy</Link>
            <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms & conditions</Link>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
