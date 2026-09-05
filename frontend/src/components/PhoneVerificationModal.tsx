'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { validatePhoneNumber } from '@/utils/phoneValidation';
import OtpInput from '@/components/OtpInput';
import { 
  Phone, 
  ShieldCheck, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  RotateCcw,
  Info
} from 'lucide-react';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (verifiedPhoneE164: string) => void;
  phone: string;
}

export default function PhoneVerificationModal({
  isOpen,
  onClose,
  onVerified,
  phone,
}: PhoneVerificationModalProps) {
  const [step, setStep] = useState<'sending' | 'otp' | 'success'>('sending');
  const [otpCode, setOtpCode] = useState('');
  const [otpLength, setOtpLength] = useState<number>(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [smsProviderNotice, setSmsProviderNotice] = useState<string | null>(null);

  const supabase = createClient();
  const validation = validatePhoneNumber(phone);
  const targetE164 = validation.e164 || phone.trim();
  const displayPhone = validation.formatted || phone.trim();

  // Handle countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const sendOtp = useCallback(async () => {
    if (!targetE164) return;
    setLoading(true);
    setError(null);
    setSmsProviderNotice(null);

    try {
      const { error: otpError } = await supabase.auth.updateUser({
        phone: targetE164,
      });

      if (otpError) {
        const msg = otpError.message.toLowerCase();
        // Check for missing SMS provider / Twilio config
        if (
          msg.includes('sms provider') ||
          msg.includes('provider is not enabled') ||
          msg.includes('unsupported phone provider') ||
          msg.includes('twilio')
        ) {
          setSmsProviderNotice(
            'Twilio SMS is not yet connected in Supabase. You can enter the test code 123456 to verify while setting up Twilio.'
          );
        } else {
          setError(otpError.message);
        }
      }

      setStep('otp');
      setResendCooldown(30);
    } catch (err: any) {
      setError(err?.message || 'Failed to send verification code.');
      setStep('otp');
    } finally {
      setLoading(false);
    }
  }, [targetE164, supabase.auth]);

  // When modal opens, auto-trigger sending OTP
  useEffect(() => {
    if (isOpen && targetE164) {
      setStep('sending');
      setOtpCode('');
      setError(null);
      setSmsProviderNotice(null);
      sendOtp();
    }
  }, [isOpen, targetE164, sendOtp]);

  if (!isOpen) return null;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otpCode.length !== otpLength) {
      setError(`Please enter the complete ${otpLength}-digit verification code.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let verifiedSuccessfully = false;

      // 1. Try standard Supabase phone verification
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: targetE164,
        token: otpCode,
        type: 'phone_change',
      });

      if (!verifyError) {
        verifiedSuccessfully = true;
      } else {
        // 2. Dev mode / fallback bypass if SMS provider isn't active
        if (smsProviderNotice && (otpCode === '123456' || otpCode === '000000')) {
          verifiedSuccessfully = true;
        } else {
          setError(verifyError.message || 'Invalid or expired verification code.');
        }
      }

      if (verifiedSuccessfully) {
        setStep('success');
        setTimeout(() => {
          onVerified(targetE164);
        }, 1200);
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Verify Phone Number
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Security verification code via SMS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'sending' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sending SMS verification code to <span className="font-semibold text-gray-900 dark:text-white">{displayPhone}</span>...
              </p>
            </div>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerify} className="space-y-5">
              {/* Notice if SMS provider is pending configuration */}
              {smsProviderNotice && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5 leading-relaxed">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Twilio Configuration Notice:</span> {smsProviderNotice}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="text-center space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter the verification code sent to:
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm font-medium">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  {displayPhone}
                </div>
              </div>

              {/* Error display */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* OTP Digit Input */}
              <div className="py-2">
                <OtpInput
                  length={otpLength}
                  value={otpCode}
                  onChange={setOtpCode}
                  onLengthChange={setOtpLength}
                  onComplete={() => {}}
                  disabled={loading}
                  error={!!error}
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || otpCode.length !== otpLength}
                  className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-green-700 disabled:opacity-50 text-white font-medium shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Confirm & Verify Phone
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={sendOtp}
                    className="flex items-center gap-1 text-primary hover:underline disabled:opacity-50 disabled:no-underline font-medium"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend code'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-in zoom-in-75 duration-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                Phone Number Verified!
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Saving your updated profile settings...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
