import { parsePhoneNumberFromString } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';

export interface PhoneValidationResult {
  isValid: boolean;
  e164?: string;
  formatted?: string;
  country?: string;
  error?: string;
}

/**
 * Validates and normalizes a phone number using libphonenumber-js.
 * Supports Irish local numbers by default (e.g. '087 123 4567')
 * and any international standard number (e.g. '+44 7911 123456', '+1 415 555 2671').
 *
 * Prevents arbitrary strings of digits like '1234567' or '9999999999' from passing.
 */
export function validatePhoneNumber(
  input: string,
  defaultCountry: CountryCode = 'IE'
): PhoneValidationResult {
  const trimmed = (input || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Please enter a phone number.',
    };
  }

  // Reject clearly invalid patterns early (e.g., repeating identical digits, fewer than 6 digits)
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < 6) {
    return {
      isValid: false,
      error: 'Phone number is too short.',
    };
  }

  // If input starts with +, parse without forcing default country
  try {
    const phoneNumber = parsePhoneNumberFromString(
      trimmed,
      trimmed.startsWith('+') ? undefined : defaultCountry
    );

    if (!phoneNumber) {
      return {
        isValid: false,
        error: 'Please enter a valid phone number with country code (e.g. +353 87 123 4567 or 087 123 4567).',
      };
    }

    if (!phoneNumber.isValid()) {
      return {
        isValid: false,
        error: 'Invalid phone number format. Please check the area code and digits.',
      };
    }

    return {
      isValid: true,
      e164: phoneNumber.number, // standard E.164 format: +353871234567
      formatted: phoneNumber.formatInternational(), // readable: +353 87 123 4567
      country: phoneNumber.country,
    };
  } catch (err) {
    return {
      isValid: false,
      error: 'Invalid phone number format.',
    };
  }
}

/**
 * Formats a phone number for display if valid, or returns the original string if parsing fails.
 */
export function formatPhoneDisplay(input: string, defaultCountry: CountryCode = 'IE'): string {
  if (!input) return '';
  const parsed = parsePhoneNumberFromString(
    input.trim(),
    input.trim().startsWith('+') ? undefined : defaultCountry
  );
  return parsed && parsed.isValid() ? parsed.formatInternational() : input;
}
