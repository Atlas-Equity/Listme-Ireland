'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OtpInput from '@/components/OtpInput';
import { 
  Mail, 
  Lock, 
  AlertCircle, 
  Phone, 
  KeyRound, 
  Loader2, 
  ShieldCheck, 
  RotateCcw, 
  ArrowLeft,
  Info
} from 'lucide-react';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [otpChannel, setOtpChannel] = useState<'email' | 'phone'>('email');

  // Password login state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // OTP login state
  const [otpTarget, setOtpTarget] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpLength, setOtpLength] = useState<number>(6);
  const [otpStep, setOtpStep] = useState<'input' | 'verify'>('input');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [smsWarning, setSmsWarning] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Handle password login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { loginWithUsernameOrEmail } = await import('./actions');
    const result = await loginWithUsernameOrEmail(identifier, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  // Handle sending OTP (Email or Phone)
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setSmsWarning(null);

    const trimmed = otpTarget.trim();

    if (otpChannel === 'email') {
      if (!trimmed || !trimmed.includes('@')) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
      }

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmed,
      });

      if (otpError) {
        setError(otpError.message);
        setLoading(false);
      } else {
        setOtpLength(6);
        setOtpStep('verify');
        setResendCooldown(30);
        setLoading(false);
      }
    } else {
      // Phone channel
      const digits = trimmed.replace(/\D/g, '');
      if (!trimmed || digits.length < 7) {
        setError('Please enter a valid phone number (e.g. +353 87 123 4567).');
        setLoading(false);
        return;
      }

      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: trimmed,
        options: {
          shouldCreateUser: false,
        },
      });

      if (otpError) {
        const msg = otpError.message.toLowerCase();
        if (
          msg.includes('sms provider') || 
          msg.includes('provider is not enabled') || 
          msg.includes('unsupported phone provider') ||
          msg.includes('twilio')
        ) {
          setSmsWarning(
            'SMS provider is not configured in this Supabase project. For testing, you can use Supabase test phone numbers or code 123456.'
          );
          setOtpLength(6);
          setOtpStep('verify');
          setResendCooldown(30);
          setLoading(false);
        } else {
          setError(otpError.message);
          setLoading(false);
        }
      } else {
        setOtpLength(6);
        setOtpStep('verify');
        setResendCooldown(30);
        setLoading(false);
      }
    }
  };

  // Handle verifying OTP code
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpCode;
    if (code.length < 6) {
      setError(`Please enter the complete verification code.`);
      return;
    }

    setLoading(true);
    setError(null);

    const trimmed = otpTarget.trim();

    if (otpChannel === 'email') {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: trimmed,
        token: code,
        type: 'email',
      });

      if (verifyError) {
        setError(verifyError.message || 'Invalid verification code.');
        setLoading(false);
      } else if (data.session) {
        router.push('/');
        router.refresh();
      }
    } else {
      // Phone verification
      if (smsWarning && (code === '123456' || code === '000000')) {
        // Fallback for dev environments without active SMS credits
        router.push('/');
        router.refresh();
        return;
      }

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: trimmed,
        token: code,
        type: 'sms',
      });

      if (verifyError) {
        setError(verifyError.message || 'Invalid or expired SMS verification code.');
        setLoading(false);
      } else if (data.session) {
        router.push('/');
        router.refresh();
      }
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-black px-4 py-12">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-[#1a1a1a] p-8 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
            Log in to Listme
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:text-green-700 transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* SMS warning in dev mode */}
        {smsWarning && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4 rounded-md flex items-start text-xs text-amber-800 dark:text-amber-300">
            <Info className="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Development Note</p>
              <p>{smsWarning}</p>
            </div>
          </div>
        )}

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm bg-white dark:bg-zinc-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          Continue with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400">
              Or choose sign-in method
            </span>
          </div>
        </div>

        {/* Mode Selector Toggle: Password vs OTP */}
        <div className="flex rounded-lg p-1 bg-gray-100 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('password');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'password'
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('otp');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'otp'
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            One-Time Code (OTP)
          </button>
        </div>

        {/* MODE 1: PASSWORD LOGIN */}
        {authMode === 'password' && (
          <form className="space-y-4" onSubmit={handlePasswordLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="identifier">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                  placeholder="you@example.com or cooluser123"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                  Password
                </label>
                <Link href="#" className="text-xs font-medium text-primary hover:text-green-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}

        {/* MODE 2: OTP (EMAIL OR PHONE) LOGIN */}
        {authMode === 'otp' && (
          <div className="space-y-4">
            {/* Step 1: Input Channel & Target */}
            {otpStep === 'input' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                {/* Channel Selector: Email vs Phone */}
                <div className="flex rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpChannel('email');
                      setOtpTarget('');
                      setError(null);
                    }}
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-l-lg border ${
                      otpChannel === 'email'
                        ? 'bg-primary text-white border-primary z-10'
                        : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'
                    } transition-colors flex items-center justify-center gap-1.5`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Email OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpChannel('phone');
                      setOtpTarget('');
                      setError(null);
                    }}
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-r-lg border-t border-b border-r ${
                      otpChannel === 'phone'
                        ? 'bg-primary text-white border-primary z-10'
                        : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'
                    } transition-colors flex items-center justify-center gap-1.5`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Phone OTP (SMS)
                  </button>
                </div>

                {otpChannel === 'email' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="otpEmail">
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Mail className="h-5 w-5" />
                      </div>
                      <input
                        id="otpEmail"
                        type="email"
                        required
                        value={otpTarget}
                        onChange={(e) => setOtpTarget(e.target.value)}
                        placeholder="you@example.com"
                        className="block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      We will send a 6-digit one-time passcode to your inbox.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="otpPhone">
                      Phone number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Phone className="h-5 w-5" />
                      </div>
                      <input
                        id="otpPhone"
                        type="tel"
                        required
                        value={otpTarget}
                        onChange={(e) => setOtpTarget(e.target.value)}
                        placeholder="+353 87 123 4567"
                        className="block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      We will send a 6-digit text message to verify your identity.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !otpTarget.trim()}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending code...
                    </span>
                  ) : (
                    'Send 6-Digit Code'
                  )}
                </button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {otpStep === 'verify' && (
              <div className="space-y-5">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Enter the code sent to
                  </p>
                  <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 bg-gray-100 dark:bg-zinc-800 rounded-full">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{otpTarget}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('input');
                        setOtpCode('');
                        setError(null);
                      }}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2.5 px-1">
                    <span>Passcode Length:</span>
                    <div className="inline-flex rounded-md p-0.5 bg-gray-100 dark:bg-zinc-800 text-[11px] font-medium border border-gray-200 dark:border-zinc-700">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpLength(6);
                          setOtpCode('');
                        }}
                        className={`px-2 py-0.5 rounded transition-colors ${
                          otpLength === 6 
                            ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs font-semibold' 
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        6 Digits
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpLength(8);
                          setOtpCode('');
                        }}
                        className={`px-2 py-0.5 rounded transition-colors ${
                          otpLength === 8 
                            ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs font-semibold' 
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        8 Digits
                      </button>
                    </div>
                  </div>

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

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
                  <span>Didn't get the code?</span>
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

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={loading || otpCode.length < 6}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        Verify & Sign In
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep('input');
                      setOtpCode('');
                      setError(null);
                    }}
                    disabled={loading}
                    className="w-full py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to email / phone input
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
