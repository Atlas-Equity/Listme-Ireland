'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Send, X, CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ContactSellerButtonProps {
  listingId: string;
  sellerId: string;
  sellerUsername?: string;
  listingTitle: string;
  listingPrice: number;
  listingImage?: string;
  currentUserId?: string | null;
  variant?: 'primary' | 'secondary' | 'qa';
}

export default function ContactSellerButton({
  listingId,
  sellerId,
  sellerUsername = 'Seller',
  listingTitle,
  listingPrice,
  listingImage,
  currentUserId,
  variant = 'primary',
}: ContactSellerButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [createdConvId, setCreatedConvId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isOwnListing = currentUserId === sellerId;

  const quickPrompts = [
    'Hi! Is this still available?',
    'What condition is the item in?',
    'Is the price negotiable?',
    'When would be a good time for pick-up?',
  ];

  const handleOpen = () => {
    if (!currentUserId) {
      router.push(`/login?next=/listing/${listingId}`);
      return;
    }
    if (isOwnListing) return;
    setIsOpen(true);
    setError(null);
    setSentSuccess(false);
  };

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          sellerId,
          content: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSentSuccess(true);
      setCreatedConvId(data.conversationId);
      setMessage('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong while sending message.');
    } finally {
      setSending(false);
    }
  };

  if (isOwnListing) {
    return (
      <div className="w-full py-2.5 px-4 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-xs text-center rounded-lg border border-gray-200 dark:border-zinc-700">
        You are the seller of this item
      </div>
    );
  }

  return (
    <>
      
      {variant === 'qa' ? (
        <div
          onClick={handleOpen}
          role="button"
          tabIndex={0}
          className="bg-white dark:bg-[#242424] rounded-sm p-4 text-center border border-gray-200 dark:border-[#333] flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all group"
        >
          <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-primary transition-colors">
            Ask the seller a question
          </span>
          <div className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 group-hover:bg-primary group-hover:text-white w-7 h-7 rounded-md flex items-center justify-center transition-all">
            <MessageSquare className="w-4 h-4" />
          </div>
        </div>
      ) : variant === 'secondary' ? (
        <button
          onClick={handleOpen}
          type="button"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 hover:border-primary dark:hover:border-primary text-gray-800 dark:text-gray-200 font-medium text-sm rounded-lg shadow-sm hover:shadow transition-all"
        >
          <MessageSquare className="w-4 h-4 text-primary" />
          <span>Contact {sellerUsername}</span>
        </button>
      ) : (
        <button
          onClick={handleOpen}
          type="button"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-green-700 active:scale-[0.99] text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Contact Seller</span>
        </button>
      )}

      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-lg">
                  {sellerUsername.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                    Chat with {sellerUsername}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Typically replies in a few hours
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-900/60 rounded-xl border border-gray-200/60 dark:border-zinc-800">
                {listingImage ? (
                  <div className="w-14 h-14 relative rounded-lg overflow-hidden bg-gray-200 dark:bg-zinc-800 shrink-0">
                    <Image
                      src={listingImage}
                      alt={listingTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-400 shrink-0">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {listingTitle}
                  </h4>
                  <p className="text-sm font-bold text-primary mt-0.5">
                    €{Number(listingPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {sentSuccess ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    Message Sent!
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                    Your inquiry has been sent to {sellerUsername}. You can view the full conversation and follow up in your inbox.
                  </p>
                  <div className="pt-3 flex gap-3 justify-center">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-zinc-700 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push(`/messages?conversationId=${createdConvId}`);
                      }}
                      className="px-5 py-2 bg-primary hover:bg-green-700 text-sm font-bold rounded-lg text-white shadow-sm"
                    >
                      View in Messages
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                      Suggested questions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {quickPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => setMessage(prompt)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 py-1.5 px-3 rounded-full border border-gray-200 dark:border-zinc-700 transition-colors text-left"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Your message
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Write a message to ${sellerUsername}...`}
                      className="w-full p-3 text-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 resize-none outline-none transition-all"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg border border-red-200 dark:border-red-900/40">
                      {error}
                    </div>
                  )}

                  
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={sending || !message.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-green-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg shadow-sm transition-all"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
