'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Trash2, CheckCircle2, AlertCircle, Loader2, User, MapPin, Phone, Mail, ShieldAlert } from 'lucide-react';
import { updateProfileSettings, uploadAvatarAction, ProfileData } from './actions';
import { useRouter } from 'next/navigation';
import PhoneVerificationModal from '@/components/PhoneVerificationModal';
import { validatePhoneNumber } from '@/utils/phoneValidation';
import { COUNTIES, getCoreLocation } from '@/utils/irelandLocations';

interface ProfileSettingsFormProps {
  initialData: {
    username: string;
    fullName: string;
    avatarUrl: string;
    phone: string;
    location: string;
    email: string;
  };
  accountType?: 'personal' | 'business';
}

export default function ProfileSettingsForm({ initialData, accountType = 'personal' }: ProfileSettingsFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(initialData.username);
  const [fullName, setFullName] = useState(initialData.fullName);
  const [location, setLocation] = useState(getCoreLocation(initialData.location) || 'Dublin');
  const initialPhoneFormatted = initialData.phone
    ? (initialData.phone.startsWith('+353 ')
        ? initialData.phone
        : initialData.phone.startsWith('+353')
        ? `+353 ${initialData.phone.replace(/^\+353/, '').trim()}`
        : `+353 ${initialData.phone.replace(/^\+?\d{1,3}\s?/, '').trim()}`)
    : '+353 ';
  const [phone, setPhone] = useState(initialPhoneFormatted);

  const handlePhoneDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/[^0-9\s]/g, '');
    if (digits.startsWith('0')) digits = digits.slice(1);
    setPhone(digits ? `+353 ${digits}` : '+353 ');
  };
  
  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData.avatarUrl || null);
  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);

  // Status and verification state
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compress & standardize avatar on client to max 512x512 JPEG (<100KB)
  // This guarantees full compatibility across all mobile devices, iOS Safari, and Android.
  const compressAvatarImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.Image) {
        return resolve(file);
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new (window.Image as any)();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 512;
            let { width, height } = img;

            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(file);

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (!blob) return resolve(file);
                const compressedFile = new File(
                  [blob],
                  `${file.name.replace(/\.[^/.]+$/, '')}.jpg`,
                  { type: 'image/jpeg', lastModified: Date.now() }
                );
                resolve(compressedFile);
              },
              'image/jpeg',
              0.85
            );
          } catch (err) {
            console.warn('Canvas compression error, using original file:', err);
            resolve(file);
          }
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setErrorMessage(null);

    // Validate mime or file extension
    const isImage = rawFile.type.startsWith('image/') || 
                    rawFile.name.match(/\.(jpg|jpeg|png|webp|gif|heic|heif|jfif|bmp)$/i);
    if (!isImage) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WEBP, HEIC).');
      return;
    }

    try {
      // Compress and standardize image on the device
      const compressed = await compressAvatarImage(rawFile);
      setSelectedFile(compressed);
      setIsAvatarRemoved(false);
      setPreviewUrl(URL.createObjectURL(compressed));
    } catch {
      setSelectedFile(rawFile);
      setIsAvatarRemoved(false);
      setPreviewUrl(URL.createObjectURL(rawFile));
    }
  };

  const handleRemoveAvatar = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAvatarUrl('');
    setIsAvatarRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const executeSave = async (phoneToSave: string, finalAvatarUrlParam?: string) => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let finalAvatarUrl = finalAvatarUrlParam !== undefined ? finalAvatarUrlParam : avatarUrl;

      // 1. If user selected a new file and it has not been uploaded yet
      if (selectedFile && finalAvatarUrlParam === undefined) {
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        const uploadRes = await uploadAvatarAction(formData);

        if (uploadRes.error || !uploadRes.publicUrl) {
          setErrorMessage(uploadRes.error || 'Failed to upload image. Please try again.');
          setIsSaving(false);
          return;
        }

        finalAvatarUrl = uploadRes.publicUrl;
        setAvatarUrl(finalAvatarUrl);
      } else if (isAvatarRemoved && finalAvatarUrlParam === undefined) {
        finalAvatarUrl = '';
      }

      // 2. Save profile settings
      const payload: ProfileData = {
        username,
        fullName,
        avatarUrl: finalAvatarUrl,
        phone: phoneToSave,
        location,
      };

      const res = await updateProfileSettings(payload);

      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage('Your profile has been updated successfully!');
        setSelectedFile(null);
        setIsAvatarRemoved(false);
        router.refresh();
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setErrorMessage(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const rawDigits = phone.replace(/^\+353\s?/, '').trim();
    const trimmedPhone = rawDigits ? `+353 ${rawDigits}` : '';
    const initialRawDigits = (initialData.phone || '').replace(/^\+353\s?/, '').trim();
    const initialTrimmedPhone = initialRawDigits ? `+353 ${initialRawDigits}` : '';

    // If account is business, phone number is mandatory
    if (accountType === 'business' && !trimmedPhone) {
      setErrorMessage('A valid contact phone number is required for business accounts (locked to Ireland +353).');
      return;
    }

    // If a phone number is entered, strictly validate format
    if (trimmedPhone) {
      const val = validatePhoneNumber(trimmedPhone, 'IE');
      if (!val.isValid) {
        setErrorMessage(val.error || 'Please enter a valid Irish phone number (e.g. +353 87 123 4567).');
        return;
      }
    }

    // Check if phone was changed
    const isPhoneChanged = trimmedPhone !== initialTrimmedPhone;

    if (isPhoneChanged && trimmedPhone) {
      // Require phone OTP verification before saving
      setIsVerifyingPhone(true);
      return;
    }

    // Phone unchanged or cleared (for personal accounts) -> proceed to save directly
    await executeSave(trimmedPhone);
  };

  const handlePhoneVerified = async (verifiedPhoneE164: string) => {
    setIsVerifyingPhone(false);
    setPhone(verifiedPhoneE164);
    await executeSave(verifiedPhoneE164);
  };

  const displayName = fullName || username || initialData.email.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Feedback Messages */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 transition-all animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600 dark:text-green-400" />
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 transition-all animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Avatar Card */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profile Picture</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          This image appears on your listings, messages, and public profile across ListMe.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar circle */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shadow-inner relative">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Profile Avatar"
                  fill
                  sizes="112px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-3xl sm:text-4xl font-bold text-primary dark:text-green-400">
                  {initials}
                </span>
              )}
            </div>

            {/* Camera Overlay Icon */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity cursor-pointer"
              title="Change profile picture"
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs font-medium">Change</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Action buttons & info */}
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary hover:bg-green-700 text-white transition-colors shadow-sm flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Upload New Photo
              </button>

              {(previewUrl || selectedFile) && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-zinc-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Supported formats: JPG, PNG, WEBP. Max file size: 5MB. Square aspect ratio recommended.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Info Card */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Personal Information</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update your public profile details and contact information.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name / Display Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Murphy"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-semibold text-sm">
                @
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                placeholder="username"
                className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Only letters, numbers, hyphens, and underscores allowed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location / County
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <MapPin className="w-4 h-4" />
              </div>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                {COUNTIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Locked strictly to Ireland core counties.
            </p>
          </div>

          {/* Phone */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contact Phone {accountType === 'business' ? <span className="text-red-500">*</span> : '(Optional)'}
              </label>
              {accountType === 'business' ? (
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Required for Business
                </span>
              ) : (
                phone.trim() && phone.trim() !== (initialData.phone || '').trim() && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Verification required
                  </span>
                )
              )}
            </div>
            <div className="flex rounded-lg shadow-xs overflow-hidden border border-gray-300 dark:border-zinc-700 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
              <span className="inline-flex items-center px-3.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-sm border-r border-gray-300 dark:border-zinc-700 select-none shrink-0">
                🇮🇪 +353
              </span>
              <div className="relative flex-1">
                <input
                  type="tel"
                  required={accountType === 'business'}
                  value={phone.replace(/^\+353\s?/, '')}
                  onChange={handlePhoneDigitsChange}
                  placeholder="87 123 4567"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white font-mono placeholder-gray-400 focus:outline-none text-sm"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {phone.replace(/^\+353\s?/, '').trim() ? (
                    validatePhoneNumber(phone, 'IE').isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )
                  ) : null}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Prefix +353 is permanently locked to Republic of Ireland numbers.
            </p>
            {phone.replace(/^\+353\s?/, '').trim() && !validatePhoneNumber(phone, 'IE').isValid && (
              <p className="text-xs text-red-500 mt-1">
                {validatePhoneNumber(phone, 'IE').error || 'Please enter a valid Irish phone number (e.g. 87 123 4567).'}
              </p>
            )}
            {phone.replace(/^\+353\s?/, '').trim() && validatePhoneNumber(phone, 'IE').isValid && phone.trim() !== (initialData.phone || '').trim() && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Updating your phone number requires 6-digit SMS verification on save.
              </p>
            )}
          </div>
        </div>

        {/* Email Address (Read-only) */}
        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/80">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Registered Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              readOnly
              disabled
              value={initialData.email}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm"
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Email is associated with your Supabase login account and cannot be modified here.
          </p>
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 bg-primary hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Profile...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      {/* Phone OTP Verification Modal */}
      <PhoneVerificationModal
        isOpen={isVerifyingPhone}
        onClose={() => setIsVerifyingPhone(false)}
        onVerified={handlePhoneVerified}
        phone={phone}
      />
    </form>
  );
}
