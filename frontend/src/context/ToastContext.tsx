'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'error' | 'success' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  error: (message: string) => void;
  success: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// Global helper for calling outside React context if needed
export function emitToast(message: string, type: ToastType = 'error') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('listme-toast', { detail: { message, type } }));
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  // Listen to window custom events
  useEffect(() => {
    const handleEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type?: ToastType }>;
      if (customEvent.detail?.message) {
        showToast(customEvent.detail.message, customEvent.detail.type || 'error');
      }
    };

    window.addEventListener('listme-toast', handleEvent);
    return () => window.removeEventListener('listme-toast', handleEvent);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, error, success, info }}>
      {children}

      {/* Floating Bottom Toast Container */}
      <div 
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 ${
              t.type === 'error'
                ? 'bg-red-950/90 text-red-100 border-red-800 shadow-red-950/40'
                : t.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-800 shadow-emerald-950/40'
                : 'bg-zinc-900/90 text-zinc-100 border-zinc-700 shadow-black/50'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {t.type === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              {t.type === 'success' && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              {t.type === 'info' && (
                <Info className="w-5 h-5 text-primary shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-medium leading-snug break-words">
                {t.message}
              </span>
            </div>

            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors shrink-0 cursor-pointer"
              aria-label="Dismiss message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: emitToast,
      error: (msg: string) => emitToast(msg, 'error'),
      success: (msg: string) => emitToast(msg, 'success'),
      info: (msg: string) => emitToast(msg, 'info'),
    };
  }
  return context;
}
