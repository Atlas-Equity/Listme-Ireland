'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface HeaderMessagesBadgeProps {
  currentUserId?: string;
  inline?: boolean;
}

export default function HeaderMessagesBadge({
  currentUserId,
  inline = false,
}: HeaderMessagesBadgeProps) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const pathname = usePathname();
  const supabase = createClient();

  const fetchUnread = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch('/api/messages/unread-count');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Graceful fallback
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread, pathname]);

  useEffect(() => {
    if (!currentUserId) return;

    // Listen for custom app events (e.g. from chat view or CallProvider)
    const handleLocalRead = () => {
      fetchUnread();
    };

    const handleLocalNewMessage = () => {
      setUnreadCount(prev => prev + 1);
    };

    window.addEventListener('messages_read', handleLocalRead);
    window.addEventListener('new_message_received', handleLocalNewMessage);

    // Subscribe to personal realtime channel for instant badge update
    const channel = supabase
      .channel(`badge_signals_${currentUserId}`)
      .on('broadcast', { event: 'new_message' }, () => {
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      window.removeEventListener('messages_read', handleLocalRead);
      window.removeEventListener('new_message_received', handleLocalNewMessage);
      supabase.removeChannel(channel);
    };
  }, [currentUserId, fetchUnread, supabase]);

  if (unreadCount <= 0) return null;

  if (inline) {
    return (
      <span className="ml-auto px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold min-w-[18px] text-center leading-tight shadow-xs">
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    );
  }

  return (
    <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs leading-none pointer-events-none animate-in zoom-in">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}
