import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Home, Car, Briefcase, Wrench, Users } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-[#202020] border-t border-gray-200 dark:border-[#333333] text-gray-600 dark:text-gray-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          
          {/* Marketplace */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-4 flex items-center">
              <ShoppingBag className="w-4 h-4 mr-2" /> Marketplace
            </h3>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Latest deals</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Stores</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Closing soon</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">€1 reserve</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Home & Living</Link></li>
            </ul>
          </div>

          {/* Property */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-4 flex items-center">
              <Home className="w-4 h-4 mr-2" /> Property
            </h3>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Property news & guides</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Sold Properties</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Open Homes</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">OneHub for agents</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Find a Real Estate Agent</Link></li>
            </ul>
          </div>

          {/* Motors */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-4 flex items-center">
              <Car className="w-4 h-4 mr-2" /> Motors
            </h3>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Cars for sale</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Motorbikes for sale</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Buying & selling advice</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Dealer news & info</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Sell my car</Link></li>
            </ul>
          </div>

          {/* Jobs */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-4 flex items-center">
              <Briefcase className="w-4 h-4 mr-2" /> Jobs
            </h3>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Browse job categories</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Careers advice</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">JobSmart</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Advertisers advice</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Salary guide</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-4 flex items-center">
              <Wrench className="w-4 h-4 mr-2" /> Services
            </h3>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Trades</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Domestic services</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Events & entertainment</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Health & wellbeing</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">List my services</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-4 flex items-center">
              <Users className="w-4 h-4 mr-2" /> Community
            </h3>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Help</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Announcements</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Trust & safety</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">3rd Party Licenses</Link></li>
              <li><Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Seller information</Link></li>
            </ul>
          </div>
        </div>

        {/* Brand Banner */}
        <div className="flex flex-wrap justify-between items-center py-6 border-t border-gray-200 dark:border-[#333333] text-gray-500 dark:text-gray-400">
          <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">ListMe Insurance</Link>
          <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">homes</Link>
          <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">MotorWeb</Link>
          <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">CarExpert</Link>
          <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Holiday Houses</Link>
          <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">FindSomeone</Link>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-200 dark:border-[#333333] text-xs">
          <div className="mb-4 md:mb-0">
            © 2026 ListMe Limited
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Desktop site</Link>
            <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">About Us</Link>
            <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Careers</Link>
            <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">News</Link>
            <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Advertise</Link>
            <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy policy</Link>
            <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms & conditions</Link>
            <Link href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact Us</Link>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
