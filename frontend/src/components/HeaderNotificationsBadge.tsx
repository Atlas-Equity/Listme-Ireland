'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface HeaderNotificationsBadgeProps {
  currentUserId?: string;
  inline?: boolean;
}

export default function HeaderNotificationsBadge({
  currentUserId,
  inline = false,
}: HeaderNotificationsBadgeProps) {
  const [notificationsCount, setNotificationsCount] = useState<number>(0);
  const pathname = usePathname();

  const fetchCount = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch('/api/messages/unread-count');
      if (res.ok) {
        const data = await res.json();
        const count = typeof data.totalNotifications === 'number'
          ? data.totalNotifications
          : (data.unreadQuestions || 0) + (data.unreadInvites || 0);
        setNotificationsCount(count);
      }
    } catch {}
  }, [currentUserId]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount, pathname]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchCount();
    };
    window.addEventListener('messages_read', handleRefresh);
    window.addEventListener('new_message_received', handleRefresh);
    window.addEventListener('business_invite_updated', handleRefresh);
    return () => {
      window.removeEventListener('messages_read', handleRefresh);
      window.removeEventListener('new_message_received', handleRefresh);
      window.removeEventListener('business_invite_updated', handleRefresh);
    };
  }, [fetchCount]);

  if (notificationsCount <= 0) return null;

  if (inline) {
    return (
      <span className="ml-auto px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black min-w-[18px] text-center leading-tight shadow-xs">
        {notificationsCount > 99 ? '99+' : notificationsCount}
      </span>
    );
  }

  return (
    <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs leading-none pointer-events-none animate-in zoom-in">
      {notificationsCount > 99 ? '99+' : notificationsCount}
    </span>
  );
}
