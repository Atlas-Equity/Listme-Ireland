'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageSquare, Send, Loader2, ArrowLeft, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  otherUser: string;
  otherUserId: string;
  listing: { title: string; image: string | null };
  lastMessage: { content: string; sender_id: string; created_at: string } | null;
  unreadCount: number;
  isBuyer: boolean;
  updated_at: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);
    };
    checkAuth();
  }, [supabase, router]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    const res = await fetch('/api/messages');
    const data = await res.json();
    if (data.conversations) {
      setConversations(data.conversations);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (userId) loadConversations();
  }, [userId, loadConversations]);

  // Auto-select conversation from URL param
  useEffect(() => {
    const convId = searchParams.get('conv');
    if (convId && conversations.length > 0) {
      setSelectedConv(convId);
      setMobileShowChat(true);
    }
  }, [searchParams, conversations]);

  // Load messages when conversation is selected
  const loadMessages = useCallback(async (convId: string) => {
    setLoadingMessages(true);
    const res = await fetch(`/api/messages/${convId}`);
    const data = await res.json();
    if (data.messages) {
      setMessages(data.messages);
      // Update unread count in conversations list
      setConversations(prev =>
        prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c)
      );
    }
    setLoadingMessages(false);
  }, []);

  useEffect(() => {
    if (selectedConv) loadMessages(selectedConv);
  }, [selectedConv, loadMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!selectedConv || !userId) return;

    const channel = supabase
      .channel(`messages-${selectedConv}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConv}`,
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        // Mark as read if it's from the other person
        if (newMsg.sender_id !== userId) {
          fetch(`/api/messages/${selectedConv}`, {
            method: 'GET', // This marks messages as read
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConv, userId, supabase]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConv || sending) return;
    
    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    // Optimistic update
    const optimisticMsg: Message = {
      id: 'temp-' + Date.now(),
      sender_id: userId!,
      content,
      read: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await fetch(`/api/messages/${selectedConv}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        setNewMessage(content);
      } else {
        // Update conversation list
        loadConversations();
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setNewMessage(content);
    }

    setSending(false);
  };

  const selectedConversation = conversations.find(c => c.id === selectedConv);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex h-[calc(100vh-80px)] border-x border-gray-200 dark:border-zinc-800">
          
          {/* LEFT: Conversation List */}
          <div className={`w-full md:w-[380px] border-r border-gray-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-[#111] ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#0073e6]" />
                Messages
              </h1>
            </div>

            {conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                <Inbox className="w-12 h-12 mb-4 text-gray-300 dark:text-zinc-600" />
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-xs mt-1">When you contact a seller, your conversations will appear here.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedConv(conv.id);
                      setMobileShowChat(true);
                    }}
                    className={`w-full flex items-start gap-3 p-4 border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors text-left ${
                      selectedConv === conv.id ? 'bg-blue-50 dark:bg-zinc-900 border-l-2 border-l-[#0073e6]' : ''
                    }`}
                  >
                    {/* Listing Thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-zinc-700 flex-shrink-0 overflow-hidden relative">
                      {conv.listing.image ? (
                        <Image src={conv.listing.image} alt="" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                          {conv.otherUser}
                        </span>
                        {conv.lastMessage && (
                          <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                            {formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {conv.listing.title}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-400 truncate">
                          {conv.lastMessage
                            ? (conv.lastMessage.sender_id === userId ? 'You: ' : '') + conv.lastMessage.content
                            : 'No messages yet'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-[#0073e6] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Chat Thread */}
          <div className={`flex-1 flex flex-col bg-white dark:bg-[#0a0a0a] ${mobileShowChat ? 'flex' : 'hidden md:flex'}`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-3">
                  <button
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  {selectedConversation.listing.image && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden relative flex-shrink-0">
                      <Image src={selectedConversation.listing.image} alt="" fill className="object-cover" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {selectedConversation.otherUser}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {selectedConversation.listing.title}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMessages ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine = msg.sender_id === userId;
                      return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                              isMine
                                ? 'bg-[#0073e6] text-white rounded-br-md'
                                : 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                      className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-zinc-600 rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#0073e6] focus:border-[#0073e6] resize-none text-sm"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sending}
                      className="p-2.5 bg-[#0073e6] hover:bg-[#005bb5] text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <MessageSquare className="w-16 h-16 mb-4 text-gray-200 dark:text-zinc-700" />
                <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Select a conversation</p>
                <p className="text-sm mt-1">Choose a conversation from the list to start chatting.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
