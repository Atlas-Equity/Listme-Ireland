'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { setupAccountAction, checkUsernameAvailability } from './actions';
import { AtSign, CheckCircle2, AlertCircle, Loader2, Shield, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';

interface SetupUsernameFormProps {
  initialEmail?: string;
  suggestedUsername?: string;
  avatarUrl?: string;
  fullName?: string;
  existingUsername?: string;
}

export default function SetupUsernameForm({
  initialEmail,
  suggestedUsername = '',
  avatarUrl,
  fullName,
  existingUsername = '',
}: SetupUsernameFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/';

  const [username, setUsernameInput] = useState(existingUsername || suggestedUsername);
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(existingUsername ? true : null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const trimmed = username.trim();
    if (!trimmed) {
      setIsAvailable(null);
      setValidationError(null);
      return;
    }

    if (existingUsername && trimmed.toLowerCase() === existingUsername.toLowerCase()) {
      setIsAvailable(true);
      setValidationError(null);
      return;
    }

    if (trimmed.length < 3) {
      setIsAvailable(false);
      setValidationError('Username must be at least 3 characters.');
      return;
    }

    if (trimmed.length > 20) {
      setIsAvailable(false);
      setValidationError('Username cannot exceed 20 characters.');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setIsAvailable(false);
      setValidationError('Only letters, numbers, and underscores are allowed.');
      return;
    }

    setValidationError(null);
    setChecking(true);

    const timer = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailability(trimmed);
        if (res.available) {
          setIsAvailable(true);
          setValidationError(null);
        } else {
          setIsAvailable(false);
          setValidationError(res.error || 'This username is unavailable.');
        }
      } catch {
        setIsAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, existingUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setPasswordError(null);

    const trimmed = username.trim();
    if (!trimmed) {
      setValidationError('Please enter a username.');
      return;
    }

    if (validationError || isAvailable === false) {
      return;
    }

    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await setupAccountAction({
        rawUsername: trimmed,
        password,
        confirmPassword,
      });

      if (res.error) {
        setSubmitError(res.error);
        setSubmitting(false);
      } else {
        router.push(nextUrl);
        router.refresh();
      }
    } catch {
      setSubmitError('An unexpected error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
      
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center gap-2 mb-1">
          <span className="font-extrabold text-3xl tracking-tight text-primary">
            List<span className="text-black dark:text-white">me</span>
          </span>
          <Image
            src="/clover-logo.png"
            alt="ListMe Logo"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold border border-zinc-200 dark:border-zinc-700">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Final Step: Username &amp; Password</span>
        </div>

        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight pt-1">
          Complete your account
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
          Set your username and create a password so you can sign in with either Google or your username and email.
        </p>
      </div>

      
      {(fullName || initialEmail) && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-100 dark:border-zinc-800">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 relative border border-gray-200 dark:border-zinc-600">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={fullName || 'Avatar'}
                fill
                sizes="40px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="font-bold text-sm text-gray-600 dark:text-gray-300">
                {(fullName || initialEmail || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {fullName && (
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {fullName}
              </p>
            )}
            {initialEmail && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {initialEmail}
              </p>
            )}
          </div>
          <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
        </div>
      )}

      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
          <label
            htmlFor="username-input"
            className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider"
          >
            Choose Username
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 font-bold text-sm">
              <AtSign className="w-4 h-4" />
            </div>
            <input
              id="username-input"
              type="text"
              autoFocus={!existingUsername}
              value={username}
              onChange={(e) => setUsernameInput(e.target.value.replace(/\s+/g, ''))}
              placeholder="irish_seller"
              maxLength={20}
              required
              className={`block w-full pl-9 pr-10 py-3 text-sm rounded-xl border transition-colors bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 ${
                validationError
                  ? 'border-red-500 focus:ring-red-500/20'
                  : isAvailable
                  ? 'border-emerald-500 focus:ring-emerald-500/20'
                  : 'border-gray-300 dark:border-zinc-700 focus:ring-primary/20 focus:border-primary'
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {checking && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
              {!checking && isAvailable === true && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
              {!checking && isAvailable === false && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>

          <div className="mt-1.5 flex items-center justify-between text-xs">
            {validationError ? (
              <span className="text-red-500 font-medium">{validationError}</span>
            ) : isAvailable ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                @{username.trim()} is available
              </span>
            ) : (
              <span className="text-gray-400 dark:text-zinc-500">
                3–20 chars • letters, numbers, and underscores
              </span>
            )}
            <span className="text-gray-400 font-mono text-[11px] shrink-0 ml-2">
              {username.trim().length}/20
            </span>
          </div>
        </div>

        
        <div>
          <label
            htmlFor="password-input"
            className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider"
          >
            Create Password
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              autoFocus={Boolean(existingUsername)}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(null);
              }}
              placeholder="At least 6 characters"
              minLength={6}
              required
              className="block w-full pl-9 pr-10 py-3 text-sm rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        
        <div>
          <label
            htmlFor="confirm-password-input"
            className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider"
          >
            Confirm Password
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="confirm-password-input"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError(null);
              }}
              placeholder="Re-enter your password"
              minLength={6}
              required
              className="block w-full pl-9 pr-10 py-3 text-sm rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
          )}
          {password && confirmPassword && password === confirmPassword && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
            </p>
          )}
        </div>

        
        <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
          <strong>Tip:</strong> This password allows you to log in with your email or username at any time, even without Google.
        </div>

        
        {passwordError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{passwordError}</span>
          </div>
        )}

        {submitError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || checking || !username.trim() || isAvailable === false || !password || password.length < 6 || password !== confirmPassword}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-primary hover:bg-green-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving password and setting up...</span>
            </>
          ) : (
            <span>Complete Setup &amp; Sign In &rarr;</span>
          )}
        </button>
      </form>

      <p className="text-[11px] text-center text-gray-400 dark:text-zinc-500">
        Your password is encrypted securely via Supabase Auth.
      </p>
    </div>
  );
}
