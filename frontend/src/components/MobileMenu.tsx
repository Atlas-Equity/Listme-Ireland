'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Menu,
  X,
  Heart,
  LayoutGrid,
  ShoppingBag,
  Briefcase,
  Wrench,
  Users,
  Edit3,
  User,
  LogIn,
  LogOut,
  MessageSquare,
  Settings,
  Package,
  Bell,
  HelpCircle,
} from 'lucide-react';
import HeaderMessagesBadge from './HeaderMessagesBadge';
import HeaderNotificationsBadge from './HeaderNotificationsBadge';
import { ThemeToggle } from './ThemeToggle';
import VerifiedBadge from './VerifiedBadge';

interface MobileMenuProps {
  user: {
    id?: string;
    email?: string;
    user_metadata?: {
      username?: string;
      full_name?: string;
      avatar_url?: string;
    };
  } | null;
  isBusiness: boolean;
  avatarUrl?: string;
  isVerified?: boolean;
}

export function MobileMenu({ user, isBusiness, avatarUrl: propAvatarUrl, isVerified }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const displayName =
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'User';

  const avatarUrl = propAvatarUrl || user?.user_metadata?.avatar_url;
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="lg:hidden">
      {/* Hamburger Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 -ml-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors relative z-10 cursor-pointer"
        aria-label="Open Navigation Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop & Drawer Animated with Framer Motion */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative w-full max-w-xs bg-white dark:bg-[#181818] border-r border-gray-200 dark:border-zinc-800 h-full overflow-y-auto flex flex-col justify-between z-10 shadow-2xl pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                {/* Drawer Top Header */}
                <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2"
                >
                  <span className="font-extrabold text-2xl tracking-tight text-primary">
                    List<span className="text-black dark:text-white">me</span>
                  </span>
                  <Image
                    src="/clover-logo.png"
                    alt="Logo"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </Link>

                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* User Profile Summary */}
              <div className="p-4 bg-gray-50 dark:bg-zinc-900/60 border-b border-gray-200 dark:border-zinc-800">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full overflow-hidden relative border border-primary/30 bg-gray-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt={displayName}
                            fill
                            sizes="44px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="text-base font-bold text-primary dark:text-green-400">
                            {initials}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                            {displayName}
                          </p>
                          {isVerified && <VerifiedBadge size="sm" />}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href="/my-listme"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 shadow-sm transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        Account
                      </Link>
                      <Link
                        href="/my-listme?tab=settings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 shadow-sm transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Settings
                      </Link>
                    </div>

                    {isBusiness && (
                      <Link
                        href="/sell"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold rounded-lg bg-primary hover:bg-green-700 text-white shadow-sm transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Sell an Item
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Sign in to manage your auctions, messages, and watchlist.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 shadow-sm"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Log in
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-primary hover:bg-green-700 text-white shadow-sm"
                      >
                        <User className="w-3.5 h-3.5" />
                        Sign up
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Navigation Links */}
              <div className="p-3 border-b border-gray-200 dark:border-zinc-800">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Navigation
                </p>
                <nav className="space-y-1">
                  <Link
                    href="/my-listme?tab=notifications"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-primary" />
                      Notifications
                    </span>
                    {user && <HeaderNotificationsBadge currentUserId={user.id} inline />}
                  </Link>
                  <Link
                    href="/my-listme?tab=watchlist"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-primary" />
                    My Watchlist
                  </Link>
                  <Link
                    href="/my-listme?tab=favourite-sellers"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-primary" />
                    Favourite Sellers
                  </Link>
                  <Link
                    href="/messages"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Messages
                    </span>
                    {user && <HeaderMessagesBadge currentUserId={user.id} inline />}
                  </Link>
                  {user && (
                    <Link
                      href="/my-listme?tab=listings"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Package className="w-4 h-4 text-primary" />
                      My Listings
                    </Link>
                  )}
                </nav>
              </div>

              {/* Browse & Community */}
              <div className="p-3">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Explore &amp; Community
                </p>
                <nav className="space-y-1">
                  <Link
                    href="/category/marketplace"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                    Marketplace
                  </Link>
                  <Link
                    href="/community"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Users className="w-4 h-4 text-gray-400" />
                    Community Hub
                  </Link>
                  <Link
                    href="/help"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                    Help Centre &amp; Support
                  </Link>
                </nav>
              </div>
            </div>

            {/* Logout footer */}
            {user && (
              <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
                <form action="/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </div>
  );
}
