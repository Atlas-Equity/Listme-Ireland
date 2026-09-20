'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Building2, 
  Check, 
  X, 
  Loader2, 
  ArrowRight, 
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  Tag
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { respondToBusinessInvitationAction } from '@/app/actions/businessPages';
import { relistListingAction, dismissNotificationAction } from '@/app/actions/relist';

interface HeaderNotificationsDropdownProps {
  currentUserId?: string;
}

export default function HeaderNotificationsDropdown({
  currentUserId,
}: HeaderNotificationsDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState<number>(0);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [questionAlerts, setQuestionAlerts] = useState<any[]>([]);
  const [closedListings, setClosedListings] = useState<any[]>([]);
  const [hasWelcomeGuide, setHasWelcomeGuide] = useState<boolean>(false);
  const [loadingInviteId, setLoadingInviteId] = useState<string | null>(null);
  const [resolvedInviteIds, setResolvedInviteIds] = useState<Record<string, 'accepted' | 'declined'>>({});
  const [relistingId, setRelistingId] = useState<string | null>(null);
  const [relistedIds, setRelistedIds] = useState<Record<string, boolean>>({});
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch('/api/messages/unread-count');
      if (res.ok) {
        const data = await res.json();
        const total = typeof data.totalNotifications === 'number'
          ? data.totalNotifications
          : (data.unreadQuestions || 0) + (data.unreadInvites || 0) + ((data.closedListings || []).length);
        setNotificationsCount(total);
        if (Array.isArray(data.pendingInvites)) {
          setPendingInvites(data.pendingInvites);
        }
        if (Array.isArray(data.questionAlerts)) {
          setQuestionAlerts(data.questionAlerts);
        }
        if (Array.isArray(data.closedListings)) {
          setClosedListings(data.closedListings);
        }
        if (typeof data.hasWelcomeGuide === 'boolean') {
          setHasWelcomeGuide(data.hasWelcomeGuide);
        }
      }
    } catch {}
  }, [currentUserId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchNotifications();
    };
    window.addEventListener('messages_read', handleRefresh);
    window.addEventListener('new_message_received', handleRefresh);
    window.addEventListener('business_invite_updated', handleRefresh);
    window.addEventListener('listing_relisted', handleRefresh);
    window.addEventListener('relist_updated', handleRefresh);
    window.addEventListener('welcome_guide_updated', handleRefresh);
    return () => {
      window.removeEventListener('messages_read', handleRefresh);
      window.removeEventListener('new_message_received', handleRefresh);
      window.removeEventListener('business_invite_updated', handleRefresh);
      window.removeEventListener('listing_relisted', handleRefresh);
      window.removeEventListener('relist_updated', handleRefresh);
      window.removeEventListener('welcome_guide_updated', handleRefresh);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleRespondInvite = async (inviteId: string, accept: boolean) => {
    setLoadingInviteId(inviteId);
    try {
      const res = await respondToBusinessInvitationAction(inviteId, accept);
      if (!res.error) {
        setResolvedInviteIds((prev) => ({ ...prev, [inviteId]: accept ? 'accepted' : 'declined' }));
        setNotificationsCount((prev) => Math.max(0, prev - 1));
        window.dispatchEvent(new Event('business_invite_updated'));
        setTimeout(() => {
          setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
          router.refresh();
        }, 1200);
      }
    } catch {}
    setLoadingInviteId(null);
  };

  const handleRelist = async (listingId: string) => {
    setRelistingId(listingId);
    try {
      const res = await relistListingAction(listingId);
      if (!res.error) {
        setRelistedIds((prev) => ({ ...prev, [listingId]: true }));
        setNotificationsCount((prev) => Math.max(0, prev - 1));
        window.dispatchEvent(new Event('listing_relisted'));
        setTimeout(() => {
          setClosedListings((prev) => prev.filter((l) => l.id !== listingId));
          router.refresh();
        }, 1200);
      }
    } catch {}
    setRelistingId(null);
  };

  const handleDismiss = async (listingId: string) => {
    setDismissingId(listingId);
    try {
      const res = await dismissNotificationAction(listingId);
      if (!res.error) {
        setClosedListings((prev) => prev.filter((l) => l.id !== listingId));
        setNotificationsCount((prev) => Math.max(0, prev - 1));
        window.dispatchEvent(new Event('listing_relisted'));
        router.refresh();
      }
    } catch {}
    setDismissingId(null);
  };

  if (!currentUserId) {
    return (
      <Link href="/login" className="flex flex-col items-center hover:text-primary dark:hover:text-white transition-colors group relative">
        <div className="relative">
          <Bell className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" />
        </div>
        <span>Notifications</span>
      </Link>
    );
  }

  const activeInvites = pendingInvites.filter((i) => !resolvedInviteIds[i.id]);
  const activeClosed = closedListings.filter((l) => !relistedIds[l.id]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex flex-col items-center hover:text-primary dark:hover:text-white transition-colors group relative cursor-pointer outline-none select-none text-sm font-medium text-gray-600 dark:text-gray-300"
      >
        <div className="relative">
          <Bell className={`w-5 h-5 mb-1 transition-colors ${isOpen ? 'text-primary' : 'group-hover:text-primary'}`} />
          {notificationsCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs leading-none pointer-events-none animate-in zoom-in">
              {notificationsCount > 99 ? '99+' : notificationsCount}
            </span>
          )}
        </div>
        <span className={isOpen ? 'text-primary dark:text-white font-bold' : ''}>Notifications</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -right-12 sm:right-0 top-[calc(100%+8px)] z-50 w-80 sm:w-96 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818] p-0 shadow-2xl backdrop-blur-md overflow-hidden text-left"
          >
            <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-900 dark:text-white">
                  Notifications
                </h3>
                {notificationsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white leading-none">
                    {notificationsCount} Active
                  </span>
                )}
              </div>
              <Link
                href="/my-listme?tab=notifications"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="max-h-[380px] overflow-y-auto p-3 space-y-3">
              {hasWelcomeGuide && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Image 
                        src="/clover-logo.png" 
                        alt="ListMe" 
                        width={20} 
                        height={20} 
                        className="object-contain" 
                      />
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                          Welcome to ListMe.ie
                        </h4>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">Community Guide</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        setHasWelcomeGuide(false);
                        setNotificationsCount((prev) => Math.max(0, prev - 1));
                        await dismissNotificationAction('welcome_guide');
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('welcome_guide_updated'));
                        }
                      }}
                      className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2 leading-snug">
                    Ireland&apos;s trusted marketplace, built by Irish people, for Irish people. Discover buyer protection, storefronts, and fee discounts.
                  </p>
                  <div className="pt-1 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <Link
                      href="/my-listme?tab=notifications"
                      onClick={() => setIsOpen(false)}
                      className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}

              {activeClosed.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Closed Listings ({activeClosed.length})</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Relist within 24h</span>
                  </div>

                  {activeClosed.map((item) => {
                    const isRelisted = relistedIds[item.id];
                    const isRelisting = relistingId === item.id;
                    const isDismissing = dismissingId === item.id;

                    if (isRelisted) {
                      return (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2 text-emerald-700 dark:text-emerald-300"
                        >
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>Listing relisted for 7 days!</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-all space-y-2"
                      >
                        <div className="flex items-start gap-2.5">
                          {item.images?.[0] ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-gray-100 dark:bg-zinc-800 shrink-0 border border-gray-200 dark:border-zinc-700">
                              <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-400 flex items-center justify-center shrink-0">
                              <Tag className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                              Closed with no bids. Relist or dismiss.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100 dark:border-zinc-800/80">
                          <button
                            type="button"
                            onClick={() => handleDismiss(item.id)}
                            disabled={isDismissing || isRelisting}
                            className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {isDismissing ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                            <span>Dismiss</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRelist(item.id)}
                            disabled={isRelisting || isDismissing}
                            className="px-3 py-1 rounded-lg bg-primary hover:bg-green-700 text-white text-[11px] font-bold transition-colors shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {isRelisting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                            <span>Relist 1-Click</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeInvites.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    <span>Business Team Invitations ({activeInvites.length})</span>
                  </div>

                  {activeInvites.map((invite) => {
                    const resolved = resolvedInviteIds[invite.id];
                    const isLoading = loadingInviteId === invite.id;

                    if (resolved) {
                      return (
                        <div
                          key={invite.id}
                          className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs flex items-center gap-2 text-gray-700 dark:text-gray-300"
                        >
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>{resolved === 'accepted' ? 'Invitation accepted!' : 'Invitation declined.'}</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={invite.id}
                        className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-all space-y-2.5"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                Team Invite
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                /page/{invite.page_slug}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate mt-0.5">
                              @{invite.inviter_username} invited you to join &quot;{invite.page_name}&quot;
                            </h4>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug mt-0.5">
                              Join as a team member to manage listings, inquiries, and orders.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100 dark:border-zinc-800/80">
                          <button
                            type="button"
                            onClick={() => handleRespondInvite(invite.id, false)}
                            disabled={isLoading}
                            className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                            <span>Decline</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRespondInvite(invite.id, true)}
                            disabled={isLoading}
                            className="px-3 py-1 rounded-lg bg-primary hover:bg-green-700 text-white text-[11px] font-bold transition-colors shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            <span>Accept</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {questionAlerts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    <span>Listing Questions ({questionAlerts.length})</span>
                  </div>

                  {questionAlerts.map((q) => (
                    <Link
                      key={q.id}
                      href={`/listing/${q.listingId}#questions-and-answers`}
                      onClick={() => setIsOpen(false)}
                      className="block p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] font-bold text-gray-900 dark:text-white truncate">
                          @{q.buyerUsername}
                        </span>
                        <span className="text-[10px] text-gray-400">•</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                          on {q.listingTitle}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">
                        &ldquo;{q.question}&rdquo;
                      </p>
                      <span className="text-[10px] font-bold text-primary mt-1.5 inline-block">
                        Answer question &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {activeInvites.length === 0 && activeClosed.length === 0 && questionAlerts.length === 0 && !hasWelcomeGuide && (
                <div className="py-8 px-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-zinc-400" />
                  </div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    You&apos;re all caught up!
                  </p>
                  <p className="text-[11px] text-gray-400 max-w-[240px] mx-auto">
                    No active closed listings, team invitations, or question alerts.
                  </p>
                </div>
              )}
            </div>

            <div className="p-2.5 bg-gray-50 dark:bg-zinc-900/60 border-t border-gray-100 dark:border-zinc-800 text-center">
              <Link
                href="/my-listme?tab=notifications"
                onClick={() => setIsOpen(false)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors"
              >
                <span>View Full Notifications Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
