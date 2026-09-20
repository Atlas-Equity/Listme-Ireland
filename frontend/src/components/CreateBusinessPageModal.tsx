'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Building2, 
  Store,
  Briefcase,
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Plus, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Camera,
  Upload,
  Edit2,
  Lock
} from 'lucide-react';
import { COUNTIES } from '@/utils/irelandLocations';
import { createOrUpdateBusinessPage, BusinessPageData } from '@/app/actions/businessPages';
import { uploadAvatarAction } from '@/app/my-listme/actions';
import CustomSelect from '@/components/CustomSelect';

const BIZ_CATEGORIES = [
  'Services & Trades',
  'Automotive & Mechanics',
  'Building & Renovation',
  'Cleaning & Domestic',
  'IT, Tech & Web Design',
  'Legal, Financial & Consulting',
  'Health, Beauty & Wellbeing',
  'Events, Photography & Catering',
  'Retail & Local Storefront',
];

const OPENING_HOURS_PRESETS = [
  'Mon - Fri: 9:00 AM - 6:00 PM',
  'Mon - Sat: 9:00 AM - 6:00 PM',
  'Mon - Sun: 8:00 AM - 8:00 PM',
  'Open 24 Hours / 7 Days',
  'By Appointment Only',
];

interface CreateBusinessPageModalProps {
  initialData?: BusinessPageData;
  triggerButton?: React.ReactNode;
  onSuccess?: () => void;
}

export default function CreateBusinessPageModal({
  initialData,
  triggerButton,
  onSuccess,
}: CreateBusinessPageModalProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCheckingOutVerified, setIsCheckingOutVerified] = useState(false);
  const [verifiedCheckoutError, setVerifiedCheckoutError] = useState<string | null>(null);

  const handleBuyVerified = async () => {
    setIsCheckingOutVerified(true);
    setVerifiedCheckoutError(null);
    try {
      const res = await fetch('/api/verified/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'page' }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        if (res.status === 401) {
          router.push(`/login?redirect=/page/${slug || initialData?.slug || ''}`);
          return;
        }
        throw new Error(data.error || 'Failed to start verified checkout.');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned from server.');
      }
    } catch (err: any) {
      setVerifiedCheckoutError(err?.message || 'Failed to start verified checkout.');
      setIsCheckingOutVerified(false);
    }
  };

  const [businessType, setBusinessType] = useState<'service' | 'marketplace'>(
    initialData?.business_type || 'marketplace'
  );
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [tagline, setTagline] = useState(initialData?.tagline || '');
  const [category, setCategory] = useState(initialData?.category || 'Retail & Local Storefront');
  const [county, setCounty] = useState(initialData?.county || 'Dublin');
  
  const initialPhone = initialData?.phone 
    ? (initialData.phone.startsWith('+353 ') ? initialData.phone : `+353 ${initialData.phone.replace(/^\+?353\s?|^0/, '')}`)
    : '+353 ';
  const [phone, setPhone] = useState(initialPhone);

  const [email, setEmail] = useState(initialData?.email || '');
  const [openingHours, setOpeningHours] = useState(
    initialData?.opening_hours || OPENING_HOURS_PRESETS[0]
  );
  const [customHours, setCustomHours] = useState('');
  const [isCustomHours, setIsCustomHours] = useState(
    initialData?.opening_hours ? !OPENING_HOURS_PRESETS.includes(initialData.opening_hours) : false
  );
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl || '');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [website, setWebsite] = useState(initialData?.website || '');
  const OFFICIAL_FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61594336620072';
  const [facebook, setFacebook] = useState(initialData?.facebook || OFFICIAL_FACEBOOK_URL);
  const [linkedin, setLinkedin] = useState(initialData?.linkedin || '');
  const [isHiring, setIsHiring] = useState(Boolean(initialData?.is_hiring));
  const [allowDirectMessaging, setAllowDirectMessaging] = useState(Boolean(initialData?.allow_direct_messaging));

  const isOfficialListMe = (slug || '').trim().toLowerCase() === 'listme' || (initialData?.slug || '').trim().toLowerCase() === 'listme';

  useEffect(() => {
    if (initialData && isOpen) {
      setName(initialData.name || '');
      setSlug(initialData.slug || '');
      setTagline(initialData.tagline || '');
      setCategory(initialData.category || 'Retail & Local Storefront');
      setCounty(initialData.county || 'Dublin');
      const p = initialData.phone 
        ? (initialData.phone.startsWith('+353 ') ? initialData.phone : `+353 ${initialData.phone.replace(/^\+?353\s?|^0/, '')}`)
        : '+353 ';
      setPhone(p);
      setEmail(initialData.email || '');
      setOpeningHours(initialData.opening_hours || OPENING_HOURS_PRESETS[0]);
      setCustomHours(initialData.opening_hours && !OPENING_HOURS_PRESETS.includes(initialData.opening_hours) ? initialData.opening_hours : '');
      setIsCustomHours(initialData.opening_hours ? !OPENING_HOURS_PRESETS.includes(initialData.opening_hours) : false);
      setAvatarUrl(initialData.avatarUrl || '');
      setWebsite(initialData.website || '');
      setFacebook(initialData.facebook || OFFICIAL_FACEBOOK_URL);
      setLinkedin(initialData.linkedin || '');
      setIsHiring(Boolean(initialData.is_hiring));
      setAllowDirectMessaging(Boolean(initialData.allow_direct_messaging));
      setBusinessType(initialData.business_type || 'marketplace');
      setErrorMessage(null);
    }
  }, [initialData, isOpen]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+353 ')) {
      val = '+353 ' + val.replace(/^\+?353\s?/, '');
    }
    setPhone(val);
  };

  const compressAvatar = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            const maxDim = 800;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(file);
              return;
            }
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
                    type: 'image/webp',
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                } else {
                  resolve(file);
                }
              },
              'image/webp',
              0.88
            );
          } catch {
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

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    const previewUrl = URL.createObjectURL(rawFile);
    setAvatarUrl(previewUrl);

    setIsUploadingImage(true);
    setErrorMessage(null);
    try {
      let fileToUpload: File = rawFile;
      try {
        fileToUpload = await compressAvatar(rawFile);
      } catch {
        fileToUpload = rawFile;
      }
      const formData = new FormData();
      formData.append('avatar', fileToUpload);

      let publicUrl: string | null = null;
      let uploadErr: string | null = null;

      try {
        const res = await fetch('/api/upload/avatar', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.publicUrl) {
          publicUrl = data.publicUrl;
        } else if (data.error) {
          uploadErr = data.error;
        }
      } catch (fetchEx) {
        console.warn('API avatar upload note, trying server action fallback:', fetchEx);
      }

      if (!publicUrl) {
        const actionRes = await uploadAvatarAction(formData);
        if (actionRes.publicUrl) {
          publicUrl = actionRes.publicUrl;
        } else if (actionRes.error) {
          uploadErr = actionRes.error;
        }
      }

      if (publicUrl) {
        setAvatarUrl(publicUrl);
        setErrorMessage(null);
      } else {
        setAvatarUrl(initialData?.avatarUrl || '');
        setErrorMessage(uploadErr || 'Failed to upload image. Please try again.');
      }
    } catch (err: any) {
      setAvatarUrl(initialData?.avatarUrl || '');
      setErrorMessage(err?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleNameChange = (val: string) => {
    if (isEditing) return;
    setName(val);
    if (!isEditing && (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]/g, '-'))) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isUploadingImage) {
      setErrorMessage('Please wait for your business logo to finish uploading before saving.');
      return;
    }

    if (avatarUrl.startsWith('blob:')) {
      setErrorMessage('Your business logo is still uploading. Please wait a moment.');
      return;
    }

    if (!avatarUrl.trim()) {
      setErrorMessage('Please upload a business profile picture / logo.');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Please enter a business / store name.');
      return;
    }

    if (!tagline.trim()) {
      setErrorMessage('Please enter your business pitch / about this.');
      return;
    }

    const resolvedHours = isCustomHours && customHours.trim() ? customHours.trim() : openingHours;
    if (!resolvedHours.trim()) {
      setErrorMessage('Opening hours are required.');
      return;
    }

    const rawNumber = phone.replace('+353 ', '').trim();
    const formattedPhone = rawNumber ? phone : '';

    setIsSubmitting(true);
    try {
      const payload: BusinessPageData = {
        id: initialData?.id || (isEditing ? (initialData?.slug === 'listme' ? 'biz_listme_official' : undefined) : undefined),
        name: isEditing ? (initialData?.name || name) : name.trim(),
        slug: isEditing ? (initialData?.slug || slug) : slug.trim(),
        tagline: tagline.trim(),
        business_type: businessType,
        opening_hours: resolvedHours,
        announcement: '',
        avatarUrl: avatarUrl.trim(),
        category,
        county,
        phone: formattedPhone,
        email: email.trim(),
        website: website.trim(),
        facebook: facebook.trim(),
        linkedin: linkedin.trim(),
        is_hiring: isHiring,
        allow_direct_messaging: false,
        is_verified: isOfficialListMe ? true : Boolean(initialData?.is_verified),
      };

      const res = await createOrUpdateBusinessPage(payload);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setIsOpen(false);
        if (onSuccess) {
          onSuccess();
        }
        router.push(`/page/${res.slug}`);
        router.refresh();
      }
    } catch {
      setErrorMessage('Failed to save business page.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setIsOpen(true)}>{triggerButton}</div>
      ) : isEditing ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 font-bold text-xs transition-colors cursor-pointer shadow-xs"
        >
          <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
          <span>Edit Page</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-green-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Business Page</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            
            
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    {isEditing ? 'Edit Business Page' : 'Create a Business Page'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Declare your business model, opening hours, Irish phone number, and announcement.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {isEditing && (
                <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-900/60 p-4 space-y-3">
                  {initialData?.is_verified ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-900 dark:text-white block">
                            Verified Business Storefront Active
                          </span>
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                            Official Verified Badge active across search and category rankings
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                        Active
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-full rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800/80 bg-zinc-900 shadow-2xs">
                        <Image
                          src="/ListMeBusinessVerifiedPage.png"
                          alt="ListMe Business Verified Page Banner"
                          width={1020}
                          height={120}
                          className="w-full h-auto object-cover"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-gray-900 dark:text-white">
                              Upgrade to Verified Storefront
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold">
                              €14.99/mo
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                            Official badge on your Business Page, priority ranking in searches &amp; categories, and up to 3x higher customer trust.
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleBuyVerified}
                            disabled={isCheckingOutVerified}
                            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-green-700 text-white font-extrabold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isCheckingOutVerified ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                            <span>Get Verified for €14.99/mo</span>
                          </button>
                        </div>
                      </div>

                      {verifiedCheckoutError && (
                        <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                          {verifiedCheckoutError}
                        </p>
                      )}

                      <div className="pt-2 border-t border-gray-200/70 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                        <span className="text-gray-400 dark:text-gray-500">
                          Cancel anytime with one click in account settings
                        </span>
                        <Link
                          href="/verified"
                          target="_blank"
                          className="text-primary font-bold hover:underline"
                        >
                          View all plans &amp; benefits &rarr;
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              
              <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/60 space-y-3">
                <label className="block text-xs font-bold text-gray-900 dark:text-white">
                  Page Profile Picture / Logo (PFP) *
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-200 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 flex items-center justify-center shrink-0 relative">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Profile preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <Camera className="w-6 h-6 text-gray-400" />
                    )}
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-900 dark:text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      {isUploadingImage ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                      <span>{isUploadingImage ? 'Uploading Image...' : avatarUrl ? 'Change Image' : 'Upload Image'}</span>
                    </button>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Upload your business logo or photo (JPG, PNG, WebP). Required for business verification.
                    </p>
                  </div>
                </div>
              </div>

              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Business / Store Name *
                    </label>
                    {isEditing && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    readOnly={isEditing}
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Web Studios Dublin"
                    className={`w-full px-3.5 py-2 rounded-lg border text-xs outline-none transition-colors ${
                      isEditing
                        ? 'bg-gray-100 dark:bg-zinc-800/80 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-zinc-800 cursor-not-allowed select-none opacity-80'
                        : 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border-gray-300 dark:border-zinc-700 focus:ring-2 focus:ring-primary'
                    }`}
                  />
                  {isEditing && (
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                      Business name is permanent and cannot be edited.
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Custom URL Slug *
                    </label>
                    {isEditing && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className={`text-xs px-2.5 py-2 border border-r-0 rounded-l-lg font-mono transition-colors ${
                      isEditing
                        ? 'bg-gray-200/70 dark:bg-zinc-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-zinc-800 select-none'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 border-gray-300 dark:border-zinc-700'
                    }`}>
                      /page/
                    </span>
                    <input
                      type="text"
                      required
                      disabled={isEditing}
                      readOnly={isEditing}
                      value={slug}
                      onChange={(e) => !isEditing && setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                      placeholder="web-studios"
                      className={`w-full px-3 py-2 rounded-r-lg border text-xs font-mono outline-none transition-colors ${
                        isEditing
                          ? 'bg-gray-100 dark:bg-zinc-800/80 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-zinc-800 cursor-not-allowed select-none opacity-80'
                          : 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border-gray-300 dark:border-zinc-700 focus:ring-2 focus:ring-primary'
                      }`}
                    />
                  </div>
                  {isEditing && (
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                      URL handle cannot be changed to prevent broken links.
                    </p>
                  )}
                </div>
              </div>

              
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Business Pitch / About This *
                </label>
                <textarea
                  required
                  rows={3}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Modern web design, branding, and digital strategy for Irish brands. Tell customers what your business does and why to choose you."
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>Opening Hours *</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <CustomSelect
                    value={isCustomHours ? 'custom' : openingHours}
                    onChange={(val) => {
                      if (val === 'custom') {
                        setIsCustomHours(true);
                      } else {
                        setIsCustomHours(false);
                        setOpeningHours(val);
                      }
                    }}
                    options={[
                      ...OPENING_HOURS_PRESETS.map((preset) => ({ value: preset, label: preset })),
                      { value: 'custom', label: 'Custom Hours...' },
                    ]}
                  />

                  {isCustomHours && (
                    <input
                      type="text"
                      value={customHours}
                      onChange={(e) => setCustomHours(e.target.value)}
                      placeholder="e.g. Tue - Sat: 10:00 AM - 5:00 PM"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-primary outline-none"
                    />
                  )}
                </div>
              </div>

              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-zinc-800">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Contact Phone (Locked to Ireland +353) <span className="text-gray-400 font-normal">(Recommended)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+353 87 123 4567"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-primary outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Recommended for direct customer calls. Prefix +353 is locked.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Primary County Location
                  </label>
                  <CustomSelect
                    value={county}
                    onChange={setCounty}
                    options={COUNTIES.map((c) => ({ value: c, label: c }))}
                  />
                </div>
              </div>

              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Public Contact Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@business.ie"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.ie"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              
              <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 space-y-3">
                <span className="block text-xs font-bold text-gray-900 dark:text-white">
                  Social Links
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Facebook Page URL
                    </label>
                    <input
                      type="url"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      placeholder="https://www.facebook.com/..."
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/company/..."
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {(isSubmitting || isUploadingImage) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {isUploadingImage 
                      ? 'Uploading Logo...' 
                      : isSubmitting 
                      ? 'Saving...' 
                      : (isEditing ? 'Save Changes' : 'Publish Business Page')}
                  </span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}
