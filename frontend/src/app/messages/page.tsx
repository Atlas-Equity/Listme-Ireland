'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Search,
  ExternalLink,
  Check,
  CheckCheck,
  Loader2,
  Inbox,
  ShoppingBag,
  Tag,
  Phone,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { createClient as createBrowserSupabase } from '@/utils/supabase/client';
import { useCall } from '@/components/CallProvider';
import { playMessageChime } from '@/utils/callSounds';

interface Conversation {
  id: string;
  listingId: string | null;
  listing: {
    id: string;
    title: string;
    price: number;
    price_type?: string;
    images?: string[];
    status?: string;
  } | null;
  otherUser: {
    id: string;
    username: string;
  };
  isSeller: boolean;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialConvId = searchParams.get('conversationId');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(initialConvId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [newMessage, setNewMessage] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'buying' | 'selling'>('all');
  const [tableReady, setTableReady] = useState(true);

  const { startCall, callStatus } = useCall();

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Derived active conversation (no state sync needed)
  const activeConversation = conversations.find(c => c.id === selectedConvId) || null;

  // Scroll to bottom of chat container only (never the window)
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior,
      });
    }
  };

  // Fetch conversations list
  const fetchConversations = useCallback(async (silent = false) => {
    if (!silent) setLoadingList(true);
    try {
      const res = await fetch('/api/messages');
      if (res.status === 401) {
        router.push('/login?next=/messages');
        return;
      }
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
        setTableReady(data.tableReady !== false);

        // Auto-select first if none selected and on desktop
        setSelectedConvId(current => {
          if (!current && data.conversations.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
            return data.conversations[0].id;
          }
          return current;
        });
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      if (!silent) setLoadingList(false);
    }
  }, [router]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (convId: string, silent = false) => {
    if (!convId) return;
    if (!silent) setLoadingChat(true);

    try {
      const res = await fetch(`/api/messages/${convId}`);
      if (!res.ok) return;

      const data = await res.json();
      setMessages(data.messages || []);
      setCurrentUserId(data.currentUserId);

      // Mark unread as 0 locally only if there were unread messages (prevents unnecessary re-render loops)
      setConversations(prev => {
        const item = prev.find(c => c.id === convId);
        if (!item || item.unreadCount === 0) return prev;
        return prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c);
      });

      if (!silent) {
        setTimeout(() => scrollToBottom('auto'), 50);
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    } finally {
      if (!silent) setLoadingChat(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle selected conversation change
  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
    } else {
      setMessages([]);
    }
  }, [selectedConvId, fetchMessages]);

  // Real-time WebSocket subscription for instant message delivery (<50ms)
  useEffect(() => {
    if (!selectedConvId) return;

    const supabase = createBrowserSupabase();

    const channel = supabase
      .channel(`chat_messages_${selectedConvId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConvId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id !== currentUserId) {
            playMessageChime();
          }
          setMessages((prev) => {
            // If already present by id, skip
            if (prev.some((m) => m.id === newMsg.id)) return prev;

            // If we have an optimistic temp message matching this content, replace it
            const hasTemp = prev.some(
              (m) => m.id.startsWith('temp-') && m.content === newMsg.content && m.sender_id === newMsg.sender_id
            );
            if (hasTemp) {
              return prev.map((m) =>
                m.id.startsWith('temp-') && m.content === newMsg.content && m.sender_id === newMsg.sender_id
                  ? newMsg
                  : m
              );
            }

            return [...prev, newMsg];
          });

          // Update sidebar snippet immediately
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedConvId
                ? { ...c, lastMessage: newMsg.content, lastMessageAt: newMsg.created_at }
                : c
            )
          );

          setTimeout(() => scrollToBottom('smooth'), 50);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConvId}`,
        },
        (payload) => {
          const updatedMsg = payload.new as Message;
          setMessages((prev) => prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConvId]);

  // Real-time listener for conversation updates across all threads
  useEffect(() => {
    const supabase = createBrowserSupabase();

    const convChannel = supabase
      .channel('chat_conversations_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          fetchConversations(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(convChannel);
    };
  }, [fetchConversations]);

  // Gentle fallback idle polling (only as a backup if tab was suspended by browser)
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedConvId) {
        fetchMessages(selectedConvId, true);
      }
      fetchConversations(true);
    }, 20000);

    return () => clearInterval(interval);
  }, [selectedConvId, fetchMessages, fetchConversations]);

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedConvId || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: selectedConvId,
      sender_id: currentUserId || 'me',
      content: messageText,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setTimeout(() => scrollToBottom('smooth'), 50);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConvId,
          content: messageText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Replace optimistic message with actual data
      setMessages(prev => prev.map(m => m.id === tempId ? data.message : m));

      // Update conversations list snippet
      setConversations(prev => prev.map(c => 
        c.id === selectedConvId 
          ? { ...c, lastMessage: messageText, lastMessageAt: new Date().toISOString() } 
          : c
      ));

    } catch (err) {
      console.error(err);
      // Revert optimistic update on failure
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setNewMessage(messageText);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Filtered conversations list
  const filteredConversations = conversations.filter(c => {
    if (filterTab === 'buying' && c.isSeller) return false;
    if (filterTab === 'selling' && !c.isSeller) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchUser = c.otherUser.username.toLowerCase().includes(q);
      const matchTitle = c.listing?.title.toLowerCase().includes(q) || false;
      const matchMsg = c.lastMessage?.toLowerCase().includes(q) || false;
      return matchUser || matchTitle || matchMsg;
    }
    return true;
  });

  return (
    <div className="w-full bg-gray-50 dark:bg-black min-h-[calc(100vh-72px)] flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 px-2 sm:px-4 lg:px-8 py-4 sm:py-6 flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              Messages
            </h1>
            <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
              {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
            </span>
          </div>

          <Link
            href="/browse"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Browse marketplace
          </Link>
        </div>

        {/* Database setup alert if migration hasn't been run */}
        {!tableReady && (
          <div className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-sm flex items-start justify-between">
            <div>
              <p className="font-bold">Database Setup Notice</p>
              <p className="text-xs mt-0.5">
                The messaging tables need to be created in your Supabase database. Please execute the SQL in <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">messaging_migration.sql</code> in your Supabase SQL Editor.
              </p>
            </div>
          </div>
        )}

        {/* Chat Layout Box */}
        <div className="bg-white dark:bg-[#181818] rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 flex-1 flex overflow-hidden min-h-[550px] max-h-[calc(100vh-160px)]">
          
          {/* ================= LEFT SIDEBAR ================= */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-zinc-800 flex flex-col shrink-0 ${
            selectedConvId ? 'hidden md:flex' : 'flex'
          }`}>
            
            {/* Search Bar */}
            <div className="p-3 border-b border-gray-200 dark:border-zinc-800">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats or listings..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 mt-2.5">
                {(['all', 'buying', 'selling'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilterTab(tab)}
                    className={`flex-1 py-1 text-xs font-semibold rounded-md capitalize transition-colors ${
                      filterTab === tab
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800/60">
              {loadingList ? (
                <div className="p-8 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span>Loading conversations...</span>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">No conversations yet</p>
                    <p className="text-[11px] text-gray-500 mt-1 max-w-[200px] mx-auto">
                      When you contact a seller on a listing or a buyer messages you, it will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConvId === conv.id;
                  const hasImage = conv.listing?.images && conv.listing.images.length > 0;
                  const itemImg = hasImage ? conv.listing!.images![0] : null;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConvId(conv.id)}
                      className={`p-3 sm:p-4 cursor-pointer transition-colors flex items-start gap-3 relative ${
                        isSelected
                          ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-primary'
                          : 'hover:bg-gray-50 dark:hover:bg-zinc-900/60'
                      }`}
                    >
                      {/* Avatar / Listing Thumbnail */}
                      <div className="relative shrink-0">
                        {itemImg ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                            <Image
                              src={itemImg}
                              alt={conv.listing?.title || 'Listing'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-lg flex items-center justify-center border border-primary/20">
                            {conv.otherUser.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {conv.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Content Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                            {conv.otherUser.username}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {conv.lastMessageAt ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false }) : ''}
                          </span>
                        </div>

                        {conv.listing && (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate mb-1">
                            <Tag className="w-3 h-3 text-primary shrink-0" />
                            <span className="truncate">{conv.listing.title}</span>
                            <span className="text-primary font-bold ml-auto shrink-0">
                              €{Number(conv.listing.price).toLocaleString()}
                            </span>
                          </div>
                        )}

                        <p className={`text-xs truncate ${
                          conv.unreadCount > 0 
                            ? 'font-bold text-gray-900 dark:text-white' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ================= RIGHT CHAT WINDOW ================= */}
          <div className={`flex-1 flex flex-col bg-white dark:bg-[#181818] min-w-0 ${
            !selectedConvId ? 'hidden md:flex' : 'flex'
          }`}>
            
            {selectedConvId ? (
              <>
                {/* Chat Top Header */}
                <div className="p-3.5 sm:p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-[#181818] z-10 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile Back Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedConvId(null)}
                      className="md:hidden p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                      {activeConversation?.otherUser?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {activeConversation?.otherUser?.username || 'User'}
                      </h2>
                      <p className="text-[11px] text-green-600 dark:text-green-400 font-medium">
                        {activeConversation?.isSeller ? 'Seller of this listing' : 'Interested Buyer'}
                      </p>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* Call Option Button */}
                    <button
                      type="button"
                      disabled={callStatus !== 'idle'}
                      onClick={() => {
                        if (activeConversation) {
                          startCall(
                            activeConversation.otherUser.id,
                            activeConversation.otherUser.username,
                            undefined,
                            activeConversation.id
                          );
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      title={`Call ${activeConversation?.otherUser?.username || 'User'}`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </button>

                    {/* Listing Quick Link */}
                    {activeConversation?.listing && (
                      <Link
                        href={`/listing/${activeConversation.listing.id}`}
                        target="_blank"
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline bg-primary/5 dark:bg-primary/10 px-2.5 py-1.5 rounded-lg shrink-0"
                      >
                        <span>View item</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Attached Listing Banner */}
                {activeConversation?.listing && (
                  <div className="px-4 py-2.5 bg-gray-50 dark:bg-zinc-900/60 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {activeConversation.listing.images && activeConversation.listing.images.length > 0 && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-gray-200 dark:bg-zinc-800 shrink-0">
                          <Image
                            src={activeConversation.listing.images[0]}
                            alt={activeConversation.listing.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                          {activeConversation.listing.title}
                        </p>
                        <p className="text-xs font-bold text-primary">
                          €{Number(activeConversation.listing.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          {activeConversation.listing.price_type?.toLowerCase() === 'auction' && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal ml-1">
                              (Auction)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/listing/${activeConversation.listing.id}`}
                      className="text-xs text-primary font-medium hover:underline shrink-0"
                    >
                      Details &rarr;
                    </Link>
                  </div>
                )}

                {/* Messages Body */}
                <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingChat ? (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                      <MessageSquare className="w-10 h-10 mb-2 opacity-40 text-primary" />
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Start the conversation!
                      </p>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs">
                        Ask about condition, shipping, negotiation, or arrange pick-up.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === currentUserId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[80%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                              isMe
                                ? 'bg-primary text-white rounded-br-none'
                                : 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-bl-none border border-gray-200/50 dark:border-zinc-700/50'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 px-1">
                            <span>
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </span>
                            {isMe && (
                              msg.is_read ? (
                                <CheckCheck className="w-3.5 h-3.5 text-primary" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-gray-400" />
                              )
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input Area */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818] flex items-center gap-2 shrink-0"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${activeConversation?.otherUser?.username || ''}...`}
                    className="flex-1 py-2.5 px-4 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="p-2.5 bg-primary hover:bg-green-700 active:scale-95 disabled:opacity-40 text-white rounded-xl shadow-sm transition-all flex items-center justify-center shrink-0"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* No Conversation Selected Placeholder */
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Select a conversation
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                  Choose a chat from the left or contact any seller directly from an item or auction page to start messaging.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
