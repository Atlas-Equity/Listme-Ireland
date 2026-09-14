'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
  Megaphone,
  Camera,
  Upload,
  Edit2
} from 'lucide-react';
import { COUNTIES } from '@/utils/irelandLocations';
import { createOrUpdateBusinessPage, BusinessPageData } from '@/app/actions/businessPages';
import { uploadAvatarAction } from '@/app/my-listme/actions';

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

  const [businessType, setBusinessType] = useState<'service' | 'marketplace'>(
    initialData?.business_type || 'marketplace'
  );
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [tagline, setTagline] = useState(initialData?.tagline || '');
  const [category, setCategory] = useState(initialData?.category || 'Retail & Local Storefront');
  const [county, setCounty] = useState(initialData?.county || 'Dublin');
  
  // Irish phone locking: ensure '+353 ' prefix
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
  const [announcement, setAnnouncement] = useState(initialData?.announcement || '');
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+353 ')) {
      val = '+353 ' + val.replace(/^\+?353\s?/, '');
    }
    setPhone(val);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);

    setIsUploadingImage(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await uploadAvatarAction(formData);
      if (res.error || !res.publicUrl) {
        setErrorMessage(res.error || 'Failed to upload image. Please try again.');
      } else {
        setAvatarUrl(res.publicUrl);
      }
    } catch {
      setErrorMessage('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]/g, '-'))) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter a business page name.');
      return;
    }

    const rawNumber = phone.replace('+353 ', '').trim();
    if (!isOfficialListMe && !rawNumber) {
      setErrorMessage('A contact phone number is required (Irish prefix +353).');
      return;
    }

    setIsSubmitting(true);
    try {
      const resolvedHours = isCustomHours && customHours.trim() ? customHours.trim() : openingHours;

      const payload: BusinessPageData = {
        id: initialData?.id,
        name,
        slug,
        tagline,
        business_type: businessType,
        opening_hours: resolvedHours,
        announcement: announcement.trim().slice(0, 250),
        avatarUrl: avatarUrl.trim(),
        category,
        county,
        phone: isOfficialListMe && !rawNumber ? '' : phone,
        email,
        website,
        facebook,
        linkedin,
        is_hiring: isHiring,
        allow_direct_messaging: allowDirectMessaging,
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
          <Edit2 className="w-3.5 h-3.5 text-primary" />
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
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
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

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}



              {/* Profile Picture / Logo */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/60 space-y-3">
                <label className="block text-xs font-bold text-gray-900 dark:text-white">
                  Page Profile Picture / Logo (PFP)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 flex items-center justify-center shrink-0 relative">
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
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-primary" />
                      )}
                      <span>{isUploadingImage ? 'Uploading Image...' : avatarUrl ? 'Change Image' : 'Upload Image'}</span>
                    </button>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Upload your business logo or photo. Direct upload (JPG, PNG, WebP).
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Business / Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Web Studios Dublin"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Custom URL Slug *
                  </label>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-400 px-2.5 py-2 bg-gray-100 dark:bg-zinc-800 border border-r-0 border-gray-300 dark:border-zinc-700 rounded-l-lg font-mono">
                      /page/
                    </span>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                      placeholder="web-studios"
                      className="w-full px-3 py-2 rounded-r-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Announcement (max 250 chars) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5 text-primary" />
                    <span>Business Announcement (Max 250 characters)</span>
                  </label>
                  <span className={`text-[11px] font-mono ${announcement.length > 250 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    {announcement.length} / 250
                  </span>
                </div>
                <textarea
                  value={announcement}
                  maxLength={250}
                  rows={2}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="e.g. Special spring sale: 10% off all website design packages this week! Open for urgent inquiries."
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Tagline / Business Pitch
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Modern web design, branding, and digital strategy for Irish brands."
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* Opening Hours */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>Opening Hours *</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={isCustomHours ? 'custom' : openingHours}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomHours(true);
                      } else {
                        setIsCustomHours(false);
                        setOpeningHours(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-primary outline-none"
                  >
                    {OPENING_HOURS_PRESETS.map((preset) => (
                      <option key={preset} value={preset}>
                        {preset}
                      </option>
                    ))}
                    <option value="custom">Custom Hours...</option>
                  </select>

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

              {/* County & Locked Phone (+353 ) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-zinc-800">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Contact Phone (Locked to Ireland +353) {isOfficialListMe ? <span className="text-gray-400 font-normal">(Optional for ListMe)</span> : '*'}
                  </label>
                  <input
                    type="tel"
                    required={!isOfficialListMe}
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder={isOfficialListMe ? 'Optional for ListMe official page' : '+353 87 123 4567'}
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-primary outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {isOfficialListMe ? 'Phone number is optional for our official platform page.' : 'Prefix +353 is permanently locked.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Primary County Location
                  </label>
                  <select
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-primary outline-none"
                  >
                    {COUNTIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Email & Website */}
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

              {/* Social Links */}
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



              {/* Direct Messaging Toggle */}
              <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowDirectMessaging}
                    onChange={(e) => setAllowDirectMessaging(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-primary border-gray-300 dark:border-zinc-700 focus:ring-primary cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                      Allow Direct Customer Messaging
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                      Enable a &quot;Message&quot; button on your business page. If unchecked, customers cannot direct message this page.
                    </p>
                  </div>
                </label>
              </div>

              {/* Submit Buttons */}
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
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isEditing ? 'Save Changes' : 'Publish Business Page'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}
