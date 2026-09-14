'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { setUsername, checkUsernameAvailability } from './actions';
import { AtSign, CheckCircle2, AlertCircle, Loader2, Sparkles, Shield } from 'lucide-react';

interface SetupUsernameFormProps {
  initialEmail?: string;
  suggestedUsername?: string;
  avatarUrl?: string;
  fullName?: string;
}

export default function SetupUsernameForm({
  initialEmail,
  suggestedUsername = '',
  avatarUrl,
  fullName,
}: SetupUsernameFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/';

  const [username, setUsernameInput] = useState(suggestedUsername);
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Debounced check for availability
  useEffect(() => {
    const trimmed = username.trim();
    if (!trimmed) {
      setIsAvailable(null);
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
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const trimmed = username.trim();
    if (!trimmed) {
      setValidationError('Please enter a username.');
      return;
    }

    if (validationError) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await setUsername(trimmed);
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
    <div className="w-full max-w-md bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 space-y-6">
      {/* Brand & Welcoming Header */}
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

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-primary dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Almost done! One final step</span>
        </div>

        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight pt-1">
          Choose your username
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
          Your unique handle on ListMe for your public seller profile, feedback, and marketplace listings.
        </p>
      </div>

      {/* Account Info Pill */}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username-input"
            className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider"
          >
            Public Username
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 font-bold text-sm">
              <AtSign className="w-4 h-4" />
            </div>
            <input
              id="username-input"
              type="text"
              autoFocus
              value={username}
              onChange={(e) => setUsernameInput(e.target.value.replace(/\s+/g, ''))}
              placeholder="irish_seller"
              maxLength={20}
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

          {/* Inline Validation / Help */}
          <div className="mt-2 flex items-center justify-between text-xs">
            {validationError ? (
              <span className="text-red-500 font-medium flex items-center gap-1">
                {validationError}
              </span>
            ) : isAvailable ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                @{username.trim()} is available!
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

        {/* Global Submit Error */}
        {submitError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || checking || !username.trim() || isAvailable === false}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-green-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Setting up your account...</span>
            </>
          ) : (
            <span>Complete Setup &rarr;</span>
          )}
        </button>
      </form>

      <p className="text-[11px] text-center text-gray-400 dark:text-zinc-500">
        You can always update your display name and details later in your Account Settings.
      </p>
    </div>
  );
}
