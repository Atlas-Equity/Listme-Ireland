import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Heart, Search, Edit3, User, LogIn, LayoutGrid, ShoppingBag, Home, Car, Briefcase, Wrench, Users, LogOut, MessageSquare } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { createClient } from '@/utils/supabase/server';

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isBusiness = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', user.id)
      .single();
    isBusiness = profile?.account_type === 'business';
  }

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col">
      {/* Primary Header */}
      <div className="w-full bg-white dark:bg-[#202020] text-gray-800 dark:text-white border-b border-gray-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[72px]">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <button className="lg:hidden p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white rounded-md">
                <Menu className="w-6 h-6" />
              </button>
              <Link href="/" className="relative flex items-center ml-2 lg:ml-0 gap-2">
                <span className="font-extrabold text-4xl tracking-tight text-primary">
                  List<span className="text-black dark:text-white transition-colors">me</span>
                </span>
                <Image src="/clover-logo.png" alt="ListMe Logo" width={40} height={40} className="object-contain" />
              </Link>
            </div>

            {/* Right Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-gray-600 dark:text-gray-300">
              <Link href="/browse" className="flex flex-col items-center hover:text-primary dark:hover:text-white transition-colors group">
                <LayoutGrid className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" />
                <span>Categories</span>
              </Link>
              <Link href="/watchlist" className="flex flex-col items-center hover:text-primary dark:hover:text-white transition-colors group">
                <Search className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" />
                <span>Watchlist</span>
              </Link>
              <Link href="/favourite-sellers" className="flex flex-col items-center hover:text-primary dark:hover:text-white transition-colors group">
                <Heart className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" />
                <span>Favourites</span>
              </Link>
              <Link href="/messages" className="flex flex-col items-center hover:text-primary dark:hover:text-white transition-colors group">
                <MessageSquare className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" />
                <span>Messages</span>
              </Link>
              
              {user ? (
                <>
                  {isBusiness && (
                    <Link href="/sell" className="flex flex-col items-center hover:text-primary dark:hover:text-white transition-colors group">
                      <Edit3 className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" />
                      <span>Sell</span>
                    </Link>
                  )}
                  <Link href="/my-listme" className="flex flex-col items-center hover:text-primary dark:hover:text-white transition-colors group">
                    <User className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" />
                    <span className="max-w-[80px] truncate">Hi, {user.user_metadata?.username || user.email?.split('@')[0]}</span>
                  </Link>
                  <form action="/auth/signout" method="POST" className="flex flex-col items-center">
                    <button type="submit" className="flex flex-col items-center hover:text-primary dark:hover:text-white transition-colors group">
                      <LogOut className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" />
                      <span>Sign out</span>
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/register" className="flex flex-col items-center hover:text-primary dark:hover:text-white transition-colors group">
                    <User className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" />
                    <span>Sign up</span>
                  </Link>
                  <Link href="/login" className="flex flex-col items-center hover:text-primary dark:hover:text-white transition-colors group">
                    <LogIn className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" />
                    <span>Log in</span>
                  </Link>
                </>
              )}
              <div className="pl-4 border-l border-gray-200 dark:border-zinc-700">
                <ThemeToggle />
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Secondary Navigation (Categories) */}
      <div className="w-full bg-[#1a1a1a] text-gray-300 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-8 h-12 text-sm font-medium">
            <Link href="/category/marketplace" className="flex items-center hover:text-white transition-colors">
              <ShoppingBag className="w-4 h-4 mr-2 text-gray-400" /> Marketplace
            </Link>
            <Link href="/category/property" className="flex items-center hover:text-white transition-colors">
              <Home className="w-4 h-4 mr-2 text-gray-400" /> Property
            </Link>
            <Link href="/category/motors" className="flex items-center hover:text-white transition-colors">
              <Car className="w-4 h-4 mr-2 text-gray-400" /> Motors
            </Link>
            <Link href="/category/jobs" className="flex items-center hover:text-white transition-colors">
              <Briefcase className="w-4 h-4 mr-2 text-gray-400" /> Jobs
            </Link>
            <Link href="/category/services" className="flex items-center hover:text-white transition-colors">
              <Wrench className="w-4 h-4 mr-2 text-gray-400" /> Services
            </Link>
            <Link href="/community" className="flex items-center hover:text-white transition-colors">
              <Users className="w-4 h-4 mr-2 text-gray-400" /> Community
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
