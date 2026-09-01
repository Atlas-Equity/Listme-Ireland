'use client';

import React, { useState } from 'react';
import { MessageSquare, Loader2, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ContactSellerButtonProps {
  listingId: string;
  sellerId: string;
  currentUserId?: string;
  listingTitle: string;
}

export default function ContactSellerButton({ listingId, sellerId, currentUserId, listingTitle }: ContactSellerButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't show if user is the seller or not logged in
  if (!currentUserId || currentUserId === sellerId) return null;

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    setError(null);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, message: message.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Navigate to the conversation
      router.push(`/messages?conv=${data.conversationId}`);
    } catch (err: any) {
      setError(err.message);
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-[#0073e6] text-[#0073e6] hover:bg-[#0073e6] hover:text-white font-bold rounded-lg transition-colors mt-3"
      >
        <MessageSquare className="w-5 h-5" />
        Contact Seller
      </button>

      {/* Message Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !sending && setShowModal(false)}>
          <div
            className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-zinc-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contact Seller</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                About: <span className="font-medium text-gray-700 dark:text-gray-300">{listingTitle}</span>
              </p>
            </div>

            {/* Message Input */}
            <div className="p-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi, I'm interested in this item. Is it still available?"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#0073e6] focus:border-[#0073e6] resize-none"
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-zinc-700 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                disabled={sending}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-[#0073e6] hover:bg-[#005bb5] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {sending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Message</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
