import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Heart, Search, Edit3, User, LogIn, LayoutGrid, ShoppingBag, Briefcase, Wrench, Users, LogOut, MessageSquare, Bell } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { MobileMenu } from './MobileMenu';
import CategoriesMegaMenu from './CategoriesMegaMenu';
import { createClient } from '@/utils/supabase/server';

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isBusiness = false;
  let avatarUrl: string | undefined = undefined;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type, avatar_url')
      .eq('id', user.id)
      .maybeSingle();
    isBusiness = profile?.account_type === 'business';
    avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  }

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col">
      {/* Primary Header */}
      <div className="w-full bg-white dark:bg-[#202020] text-gray-800 dark:text-white border-b border-gray-200 dark:border-zinc-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[72px]">
            
            {/* Logo, Mobile Menu & Categories Mega Menu */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <MobileMenu user={user} isBusiness={isBusiness} avatarUrl={avatarUrl} />
              <Link href="/" className="relative flex items-center ml-1 lg:ml-0 gap-2">
                <span className="font-extrabold text-4xl tracking-tight text-primary">
                  List<span className="text-black dark:text-white transition-colors">me</span>
                </span>
                <Image src="/clover-logo.png" alt="ListMe Logo" width={40} height={40} className="object-contain" />
              </Link>

              {/* Categories Flyout Mega-Menu */}
              <div className="hidden md:block ml-2">
                <CategoriesMegaMenu />
              </div>
            </div>

            {/* Right Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-gray-600 dark:text-gray-300">
              <Link href="/my-listme?tab=notifications" className="flex flex-col items-center hover:text-primary dark:hover:text-white transition-colors group relative">
                <div className="relative">
                  <Bell className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </div>
                <span>Notifications</span>
              </Link>
              <Link href="/my-listme?tab=watchlist" className="flex flex-col items-center hover:text-primary dark:hover:text-white transition-colors group">
                <Heart className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" />
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
                    {avatarUrl ? (
                      <div className="w-5 h-5 mb-1 rounded-full overflow-hidden relative border border-primary/40 shrink-0">
                        <Image
                          src={avatarUrl}
                          alt="Avatar"
                          fill
                          sizes="20px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <User className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" />
                    )}
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
      <div className="w-full bg-gray-50 dark:bg-[#151515] text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-zinc-800 hidden md:block transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-8 h-11 text-sm font-medium">
            <Link href="/category/marketplace" className="group flex items-center text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">
              <ShoppingBag className="w-4 h-4 mr-2 text-gray-400 group-hover:text-primary dark:group-hover:text-white transition-colors" /> Marketplace
            </Link>
            <Link href="/category/jobs" className="group flex items-center text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">
              <Briefcase className="w-4 h-4 mr-2 text-gray-400 group-hover:text-primary dark:group-hover:text-white transition-colors" /> Jobs
            </Link>
            <Link href="/category/services" className="group flex items-center text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">
              <Wrench className="w-4 h-4 mr-2 text-gray-400 group-hover:text-primary dark:group-hover:text-white transition-colors" /> Services
            </Link>
            <Link href="/community" className="group flex items-center text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">
              <Users className="w-4 h-4 mr-2 text-gray-400 group-hover:text-primary dark:group-hover:text-white transition-colors" /> Community
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
