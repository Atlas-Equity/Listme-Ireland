'use client';

import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  onLengthChange?: (length: number) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  error?: boolean;
}

export default function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  onLengthChange,
  disabled = false,
  autoFocus = true,
  className = '',
  error = false,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus, disabled, length]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleaned = rawVal.replace(/\D/g, '');

    if (!cleaned) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      const nextVal = nextDigits.join('');
      onChange(nextVal);
      return;
    }

    if (cleaned.length > 1) {
      let targetLen = length;
      if (cleaned.length >= 8 && length !== 8 && onLengthChange) {
        targetLen = 8;
        onLengthChange(8);
      } else if (cleaned.length === 6 && length !== 6 && onLengthChange) {
        targetLen = 6;
        onLengthChange(6);
      }

      const pastedDigits = cleaned.slice(0, targetLen);
      onChange(pastedDigits);
      if (pastedDigits.length === targetLen && onComplete) {
        onComplete(pastedDigits);
      }
      const focusIndex = Math.min(pastedDigits.length, targetLen - 1);
      setTimeout(() => inputRefs.current[focusIndex]?.focus(), 10);
      return;
    }

    const single = cleaned[cleaned.length - 1];
    const nextDigits = [...digits];
    nextDigits[index] = single;
    const nextVal = nextDigits.join('');
    onChange(nextVal);

    if (nextVal.length === length && onComplete) {
      onComplete(nextVal);
    }

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const nextDigits = [...digits];
        nextDigits[index - 1] = '';
        onChange(nextDigits.join(''));
        e.preventDefault();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;

    let targetLen = length;
    if (pasted.length >= 8 && length !== 8 && onLengthChange) {
      targetLen = 8;
      onLengthChange(8);
    } else if (pasted.length === 6 && length !== 6 && onLengthChange) {
      targetLen = 6;
      onLengthChange(6);
    }

    const trimmed = pasted.slice(0, targetLen);
    onChange(trimmed);
    if (trimmed.length === targetLen && onComplete) {
      onComplete(trimmed);
    }
    const focusIndex = Math.min(trimmed.length, targetLen - 1);
    setTimeout(() => inputRefs.current[focusIndex]?.focus(), 10);
  };

  const isEight = length >= 8;

  return (
    <div className={`flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 ${className}`}>
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[idx]}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${idx + 1}`}
          className={`text-center font-bold rounded-lg border transition-all shadow-sm outline-none ${
            isEight
              ? 'w-8 h-11 sm:w-10 sm:h-13 md:w-11 md:h-14 text-lg sm:text-xl'
              : 'w-10 h-12 sm:w-12 sm:h-14 text-xl sm:text-2xl'
          } ${
            error
              ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
              : 'border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-zinc-800' : ''}`}
        />
      ))}
    </div>
  );
}
