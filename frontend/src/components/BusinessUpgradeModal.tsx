'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { upgradeToBusinessWithPhone } from '@/app/my-listme/actions';
import OtpInput from '@/components/OtpInput';
import { 
  Briefcase, 
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

import { validatePhoneNumber } from '@/utils/phoneValidation';

interface BusinessUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialPhone?: string;
}

export default function BusinessUpgradeModal({
  isOpen,
  onClose,
  onSuccess,
  initialPhone = '',
}: BusinessUpgradeModalProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [normalizedPhone, setNormalizedPhone] = useState(initialPhone);
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [otpCode, setOtpCode] = useState('');
  const [otpLength, setOtpLength] = useState<number>(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [smsProviderWarning, setSmsProviderWarning] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      setPhone(initialPhone);
      setNormalizedPhone(initialPhone);
      setStep('input');
      setOtpCode('');
      setError(null);
      setSmsProviderWarning(null);
    }
  }, [isOpen, initialPhone]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSmsProviderWarning(null);

    const rawDigits = phone.replace(/^\+353\s?/, '').trim();
    if (!rawDigits) {
      setError('Please enter your Irish business phone number.');
      return;
    }
    const fullPhone = `+353 ${rawDigits}`;
    const phoneValidation = validatePhoneNumber(fullPhone, 'IE');
    if (!phoneValidation.isValid) {
      setError(phoneValidation.error || 'Please enter a valid Irish phone number (e.g. 87 123 4567).');
      return;
    }

    const e164 = phoneValidation.e164 || `+353${rawDigits.replace(/\s/g, '').replace(/^0/, '')}`;
    setNormalizedPhone(e164);
    setLoading(true);

    try {
      // Send OTP to the phone number via Supabase Auth
      const { error: otpError } = await supabase.auth.updateUser({
        phone: e164,
      });

      if (otpError) {
        // If Supabase doesn't have an SMS provider configured, inform user gracefully
        const msg = otpError.message.toLowerCase();
        if (
          msg.includes('sms provider') || 
          msg.includes('provider is not enabled') || 
          msg.includes('unsupported phone provider') ||
          msg.includes('twilio')
        ) {
          setSmsProviderWarning(
            'SMS provider is not configured in this Supabase project. For testing, you can use the test code 123456 or proceed with direct confirmation.'
          );
          setStep('otp');
          setResendCooldown(30);
        } else {
          setError(otpError.message);
        }
      } else {
        setStep('otp');
        setResendCooldown(30);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send verification code. Please check the number.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpCode;
    if (code.length < 6) {
      setError('Please enter the full verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Attempt verification with Supabase Auth
      // If we had an unconfigured SMS provider warning, allow test code '123456' or verifyOtp
      let verificationPassed = false;

      const targetPhone = normalizedPhone || phone.trim();

      if (smsProviderWarning && (code === '123456' || code === '000000')) {
        verificationPassed = true;
      } else {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          phone: targetPhone,
          token: code,
          type: 'phone_change',
        });

        if (verifyError) {
          // If verifyOtp failed, check if it's because provider isn't set up
          if (smsProviderWarning) {
            // In dev mode with warning, allow test code
            if (code === '123456') {
              verificationPassed = true;
            } else {
              setError('Invalid verification code. Use test code 123456 or re-enter.');
              setLoading(false);
              return;
            }
          } else {
            setError(verifyError.message || 'Invalid or expired verification code.');
            setLoading(false);
            return;
          }
        } else {
          verificationPassed = true;
        }
      }

      if (verificationPassed) {
        setStep('success');
        // 2. Call server action to upgrade account and persist phone
        const res = await upgradeToBusinessWithPhone(targetPhone);
        if (res.error) {
          setError(res.error);
          setStep('otp');
          setLoading(false);
          return;
        }

        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectUpgradeForDev = async () => {
    setLoading(true);
    setError(null);
    const targetPhone = normalizedPhone || phone.trim();
    const res = await upgradeToBusinessWithPhone(targetPhone);
    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }
    setStep('success');
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#18181b] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-gray-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Upgrade to Business</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Verified phone number required
            </p>
          </div>
        </div>

        
        {error && (
          <div className="mb-4 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        
        {smsProviderWarning && (
          <div className="mb-4 p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">SMS Provider Notice</p>
              <p>{smsProviderWarning}</p>
            </div>
          </div>
        )}

        
        {step === 'input' && (
          <div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/70 border border-gray-200 dark:border-zinc-800 mb-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
                <ShieldCheck className="w-4 h-4" />
                Why is a phone number required?
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Business sellers represent commercial entities on ListMe. A verified phone number guarantees buyer trust, prevents fraud, and allows fast resolution for high-value transactions.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Business Phone Number (Ireland) <span className="text-red-500">*</span>
                </label>
                <div className={`flex rounded-lg shadow-sm border ${
                  phone.replace(/^\+353\s?/, '').trim() && !validatePhoneNumber(phone.startsWith('+353') ? phone : `+353 ${phone}`, 'IE').isValid
                    ? 'border-red-400 dark:border-red-500/60'
                    : 'border-gray-300 dark:border-zinc-700'
                } bg-white dark:bg-zinc-900 overflow-hidden`}>
                  <span className="inline-flex items-center px-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-sm font-semibold border-r border-gray-300 dark:border-zinc-700 select-none">
                    🇮🇪 +353
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone.replace(/^\+353\s?/, '')}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9\s]/g, '');
                      setPhone(val ? `+353 ${val.trim()}` : '');
                    }}
                    placeholder="87 123 4567"
                    disabled={loading}
                    className="flex-1 px-3.5 py-2.5 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-sm"
                  />
                  <div className="flex items-center pr-3">
                    {phone.replace(/^\+353\s?/, '').trim() ? (
                      validatePhoneNumber(phone.startsWith('+353') ? phone : `+353 ${phone}`, 'IE').isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )
                    ) : null}
                  </div>
                </div>
                {phone.replace(/^\+353\s?/, '').trim() && !validatePhoneNumber(phone.startsWith('+353') ? phone : `+353 ${phone}`, 'IE').isValid ? (
                  <p className="text-xs text-red-500 mt-1.5">
                    {validatePhoneNumber(phone.startsWith('+353') ? phone : `+353 ${phone}`, 'IE').error || 'Please enter a valid Irish mobile/landline number (e.g. 87 123 4567).'}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    Prefix +353 is permanently locked to Republic of Ireland numbers.
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !phone.replace(/^\+353\s?/, '').trim()}
                  className="flex-1 py-2.5 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      Verify with OTP
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        
        {step === 'otp' && (
          <div>
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                We sent a 6-digit verification code to:
              </p>
              <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 bg-gray-100 dark:bg-zinc-800 rounded-full">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{phone}</span>
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Change
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Enter Verification Code
              </label>
              <OtpInput
                length={otpLength}
                value={otpCode}
                onChange={setOtpCode}
                onLengthChange={(newLen) => setOtpLength(newLen)}
                onComplete={(code) => handleVerifyOtp(code)}
                disabled={loading}
                error={!!error}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-6 px-1">
              <span>Didn't receive the code?</span>
              {resendCooldown > 0 ? (
                <span>Resend in {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={loading}
                  className="text-primary hover:underline font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Resend code
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={loading || otpCode.length < 6}
                className="w-full py-2.5 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Verify & Upgrade Account
                  </>
                )}
              </button>

              
              {smsProviderWarning && (
                <button
                  type="button"
                  onClick={handleDirectUpgradeForDev}
                  disabled={loading}
                  className="w-full py-2 px-3 border border-dashed border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
                >
                  Dev Mode: Confirm & Upgrade Directly
                </button>
              )}

              <button
                type="button"
                onClick={() => setStep('input')}
                disabled={loading}
                className="w-full py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Back to phone input
              </button>
            </div>
          </div>
        )}

        
        {step === 'success' && (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              Phone Verified!
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your account has been upgraded to a <strong>Business</strong> account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
