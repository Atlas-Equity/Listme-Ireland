'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Mail, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { sendEmailVerificationCodeAction, verifyEmailCodeAction } from '@/app/actions/emailVerification';

interface UnverifiedEmailWarningProps {
  email?: string;
  variant?: 'nav' | 'banner';
}

export default function UnverifiedEmailWarning({ email = '', variant = 'nav' }: UnverifiedEmailWarningProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'prompt' | 'input' | 'success'>('prompt');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleSendCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendEmailVerificationCodeAction();
      if (!res.success) {
        setError(res.error || 'Failed to send verification code.');
      } else {
        setStep('input');
        setResendCooldown(30);
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.trim().length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await verifyEmailCodeAction(code.trim());
      if (!res.success) {
        setError(res.error || 'Failed to verify code.');
      } else {
        setStep('success');
        setTimeout(() => {
          setIsOpen(false);
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {variant === 'banner' ? (
        <div className="w-full bg-amber-500/10 border-b border-amber-500/30 text-amber-800 dark:text-amber-200 px-4 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Warning:</strong> Your email ({email}) is not verified.
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="ml-2 font-bold underline hover:text-amber-900 dark:hover:text-white cursor-pointer"
            >
              Click here to verify
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 transition-colors cursor-pointer"
          title="Email not verified. Click to verify."
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="hidden sm:inline">Verify Email</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {step === 'prompt' && (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Verify your email address
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    Your account email <strong>{email}</strong> is currently unverified. Verifying ensures you receive notifications, receipts, and can recover your account.
                  </p>
                </div>

                {error && (
                  <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg border border-red-200 dark:border-red-900/40 font-medium">
                    {error}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={loading}
                    className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl bg-primary hover:bg-green-700 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Code'}
                  </button>
                </div>
              </div>
            )}

            {step === 'input' && (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Enter verification code
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    We sent a 6-digit verification code to <strong>{email}</strong>. Enter it below to verify your email.
                  </p>
                </div>

                {error && (
                  <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg border border-red-200 dark:border-red-900/40 font-medium">
                    {error}
                  </p>
                )}

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="w-full text-center text-2xl tracking-[8px] font-mono py-3 px-4 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={loading || resendCooldown > 0}
                    className="text-primary hover:underline font-medium disabled:opacity-50 cursor-pointer"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('prompt')}
                    className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || code.trim().length < 6}
                    className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl bg-primary hover:bg-green-700 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                  </button>
                </div>
              </form>
            )}

            {step === 'success' && (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Email verified!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your email address has been successfully verified.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
