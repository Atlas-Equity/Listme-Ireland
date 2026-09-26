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
  UserPlus, 
  ShieldCheck, 
  RotateCcw, 
  ArrowLeft, 
  Loader2 
} from 'lucide-react';

export default function RegisterPage() {
  const [step, setStep] = useState<'form' | 'verify'>('form');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<'personal' | 'business'>('personal');
  const [notifyTosUpdates, setNotifyTosUpdates] = useState(true);

  const [otpCode, setOtpCode] = useState('');
  const [otpLength, setOtpLength] = useState<number>(8);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      setLoading(false);
      return;
    }

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          account_type: accountType,
          tos_updates_notify: notifyTosUpdates,
          has_password: true,
        }
      }
    });

    if (error) {
      if (error.message.includes('unique constraint')) {
        setError("That username is already taken. Please choose another.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      if (data.session) {
        router.push('/');
        router.refresh();
      } else {
        setStep('verify');
        setOtpCode('');
        setResendCooldown(30);
        setSuccess('Registration successful! Please check your email to confirm your account.');
        setLoading(false);
      }
    }
  };

  const handleVerifySignup = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpCode).trim();
    if (code.length < 6) {
      setError('Please enter the complete verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let verifyRes = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: 'signup',
      });

      if (verifyRes.error) {
        verifyRes = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: code,
          type: 'email',
        });
      }

      if (verifyRes.error) {
        setError(verifyRes.error.message || 'Invalid or expired verification code.');
        setLoading(false);
        return;
      }

      if (verifyRes.data?.session) {
        router.push('/');
        router.refresh();
        return;
      }

      if (password) {
        const signInRes = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (signInRes.data?.session) {
          router.push('/');
          router.refresh();
          return;
        }
      }

      router.push('/login?verified=true');
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please try again.');
      setLoading(false);
    }
  };

  const handleResendSignup = async () => {
    setLoading(true);
    setError(null);

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    });

    if (resendError) {
      setError(resendError.message);
      setLoading(false);
    } else {
      setResendCooldown(30);
      setSuccess('A new verification code has been sent to your email.');
      setLoading(false);
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
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#1a1a1a] p-8 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
        
        {step === 'form' && (
          <>
            <div className="text-center">
              <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                Create an account
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary hover:text-green-700 transition-colors">
                  Log in
                </Link>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4 rounded-md flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-4 rounded-md flex items-start">
                <UserPlus className="w-5 h-5 text-green-500 mr-2 shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
              </div>
            )}

            <div className="mt-8 space-y-6">
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
                Sign up with Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-zinc-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400">
                    Or sign up with email
                  </span>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Type
                  </label>
                  <div className="flex rounded-md shadow-sm" role="group">
                    <button
                      type="button"
                      onClick={() => setAccountType('personal')}
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-lg border ${
                        accountType === 'personal'
                          ? 'bg-primary text-white border-primary z-10'
                          : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'
                      } transition-colors cursor-pointer`}
                    >
                      Personal
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('business')}
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-lg border-t border-b border-r ${
                        accountType === 'business'
                          ? 'bg-primary text-white border-primary z-10'
                          : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'
                      } transition-colors cursor-pointer`}
                    >
                      Business
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="username">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserPlus className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                      placeholder="cooluser123"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="password">
                    Password
                  </label>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-2.5">
                    <input
                      id="notify-tos"
                      type="checkbox"
                      checked={notifyTosUpdates}
                      onChange={(e) => setNotifyTosUpdates(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-zinc-700 text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                    <label htmlFor="notify-tos" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none leading-normal">
                      Receive notifications about Terms of Service and Privacy Policy updates in your ListMe inbox
                    </label>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-center sm:text-left">
                    By signing up you agree to our{' '}
                    <Link href="/terms" className="font-semibold text-primary hover:underline">
                      Terms of Service
                    </Link>
                    ,{' '}
                    <Link href="/privacy" className="font-semibold text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    , and{' '}
                    <Link href="/buyer-protection" className="font-semibold text-primary hover:underline">
                      Buyer Protection
                    </Link>
                    .
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>
            </div>
          </>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                Verify your email
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary hover:text-green-700 transition-colors">
                  Log in
                </Link>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-md flex items-start">
                <UserPlus className="w-5 h-5 text-green-500 mr-2 shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
              </div>
            )}

            <div className="text-center space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Enter the code sent to
              </p>
              <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 bg-gray-100 dark:bg-zinc-800 rounded-full">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{email}</span>
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setOtpCode('');
                    setError(null);
                  }}
                  className="text-xs text-primary hover:underline font-medium cursor-pointer"
                >
                  Change
                </button>
              </div>
            </div>

            <div>
              <OtpInput
                length={otpLength}
                value={otpCode}
                onChange={setOtpCode}
                onLengthChange={setOtpLength}
                onComplete={(code) => handleVerifySignup(code)}
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
                  onClick={handleResendSignup}
                  disabled={loading}
                  className="text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Resend code
                </button>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => handleVerifySignup()}
                disabled={loading || otpCode.length < 6}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying code...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Verify & Create Account
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setOtpCode('');
                  setError(null);
                }}
                disabled={loading}
                className="w-full py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to registration details
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
