import { parsePhoneNumberFromString } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';

export interface PhoneValidationResult {
  isValid: boolean;
  e164?: string;
  formatted?: string;
  country?: string;
  error?: string;
}

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

  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < 6) {
    return {
      isValid: false,
      error: 'Phone number is too short.',
    };
  }

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
      e164: phoneNumber.number,
      formatted: phoneNumber.formatInternational(),
      country: phoneNumber.country,
    };
  } catch (err) {
    return {
      isValid: false,
      error: 'Invalid phone number format.',
    };
  }
}

export function formatPhoneDisplay(input: string, defaultCountry: CountryCode = 'IE'): string {
  if (!input) return '';
  const parsed = parsePhoneNumberFromString(
    input.trim(),
    input.trim().startsWith('+') ? undefined : defaultCountry
  );
  return parsed && parsed.isValid() ? parsed.formatInternational() : input;
}
