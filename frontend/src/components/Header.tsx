import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Heart, Search, Edit3, User, LogIn, LayoutGrid, ShoppingBag, Briefcase, Wrench, Users, LogOut, MessageSquare, Bell } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { MobileMenu } from './MobileMenu';
import { cookies } from 'next/headers';
import VerifiedBadge from './VerifiedBadge';
import { createClient } from '@/utils/supabase/server';

import HeaderMessagesBadge from './HeaderMessagesBadge';
import HeaderNotificationsBadge from './HeaderNotificationsBadge';

export default async function Header() {
  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore.getAll().some(c => c.name.includes('-auth-token'));

  let user: any = null;
  let isBusiness = false;
  let avatarUrl: string | undefined = undefined;
  let isVerified = false;

  if (hasAuthCookie) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;

    if (user) {
      avatarUrl = user.user_metadata?.avatar_url;
      isBusiness = user.user_metadata?.account_type === 'business';
      isVerified = Boolean(user.user_metadata?.is_verified);

      // Check header cache first to avoid sequential DB query
      const headerCache = (globalThis as any).__headerUserCache ?? new Map<string, any>();
      (globalThis as any).__headerUserCache = headerCache;
      const cached = headerCache.get(user.id);

      if (cached && Date.now() < cached.expiresAt) {
        isBusiness = cached.isBusiness;
        avatarUrl = cached.avatarUrl;
        isVerified = cached.isVerified;
      } else if (!avatarUrl && !isBusiness) {
        // Only query profiles if user_metadata is missing required fields
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_type, avatar_url, updated_at')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          if (profile.account_type) isBusiness = profile.account_type === 'business';
          if (profile.avatar_url) avatarUrl = profile.avatar_url;
          const createdAt = user.created_at || profile.updated_at;
          const isOneYearOld = createdAt ? Date.now() - new Date(createdAt).getTime() >= 365 * 24 * 60 * 60 * 1000 : false;
          isVerified = Boolean(isOneYearOld || user.user_metadata?.is_verified);
        }

        headerCache.set(user.id, {
          isBusiness,
          avatarUrl,
          isVerified,
          expiresAt: Date.now() + 5 * 60 * 1000,
        });
      } else {
        // user_metadata already has the data; cache it for 5 minutes
        headerCache.set(user.id, {
          isBusiness,
          avatarUrl,
          isVerified,
          expiresAt: Date.now() + 5 * 60 * 1000,
        });
      }
    }
  }


  return (
    <header className="sticky top-0 z-50 w-full flex flex-col">
      {/* Primary Header */}
      <div className="w-full bg-white dark:bg-[#202020] text-gray-800 dark:text-white border-b border-gray-200 dark:border-zinc-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[72px]">
            
            {/* Logo & Mobile Menu */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <MobileMenu user={user} isBusiness={isBusiness} avatarUrl={avatarUrl} isVerified={isVerified} />
              <Link href="/" className="relative flex items-center ml-1 lg:ml-0 gap-2">
                <span className="font-extrabold text-4xl tracking-tight text-primary">
                  List<span className="text-black dark:text-white transition-colors">me</span>
                </span>
                <Image src="/clover-logo.png" alt="ListMe Logo" width={40} height={40} className="object-contain" />
              </Link>
            </div>

            {/* Right Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-gray-600 dark:text-gray-300">
              <Link href="/my-listme?tab=notifications" className="flex flex-col items-center hover:text-primary dark:hover:text-white transition-colors group relative">
                <div className="relative">
                  <Bell className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" />
                  {user && <HeaderNotificationsBadge currentUserId={user.id} />}
                </div>
                <span>Notifications</span>
              </Link>
              <Link href="/my-listme?tab=watchlist" className="flex flex-col items-center hover:text-primary dark:hover:text-white transition-colors group">
                <Heart className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" />
                <span>Watchlist</span>
              </Link>
              <Link href="/my-listme?tab=favourite-sellers" className="flex flex-col items-center hover:text-primary dark:hover:text-white transition-colors group">
                <Heart className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" />
                <span>Favourites</span>
              </Link>
              <Link href="/messages" className="flex flex-col items-center hover:text-primary dark:hover:text-white transition-colors group relative">
                <div className="relative">
                  <MessageSquare className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" />
                  {user && <HeaderMessagesBadge currentUserId={user.id} />}
                </div>
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
                    <span className="max-w-[100px] truncate flex items-center gap-1">
                      <span>Hi, {user.user_metadata?.username || user.email?.split('@')[0]}</span>
                      {isVerified && <VerifiedBadge size="xs" />}
                    </span>
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
            <Link href="/community" className="group flex items-center text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">
              <Users className="w-4 h-4 mr-2 text-gray-400 group-hover:text-primary dark:group-hover:text-white transition-colors" /> Community
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
