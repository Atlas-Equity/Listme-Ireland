'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Camera, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  UploadCloud, 
  X, 
  Loader2, 
  AlertCircle, 
  ShoppingBag,
  Briefcase,
  Wrench,
  Store,
  Building2,
  Euro,
  FileText,
  AlertTriangle,
  User
} from 'lucide-react';
import { uploadListingImage } from '@/utils/supabase/storage';
import { createListing } from './actions';
import { IRELAND_LOCATIONS, COUNTIES } from '@/utils/irelandLocations';
import { BusinessPageData } from '@/app/actions/businessPages';
import Image from 'next/image';
import CustomSelect from '@/components/CustomSelect';
import { isUserQuinn } from '@/utils/admin';

type ListingBranch = 'item' | 'job' | 'service';

const ITEM_CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

import { MARKETPLACE_CATEGORIES, CATEGORY_NAMES } from '@/constants/marketplaceCategories';

const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Temporary',
  'Apprenticeship',
  'Casual / Freelance'
];

const SERVICE_CATEGORIES = [
  'Trades & Home Improvement',
  'Domestic & Cleaning Services',
  'IT, Web & Digital Services',
  'Health, Fitness & Wellbeing',
  'Tutoring & Education',
  'Events, Music & Photography',
  'Automotive & Transport',
  'Professional Business Services'
];

export default function SellPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isBusiness, setIsBusiness] = useState(false);
  const [marketplacePages, setMarketplacePages] = useState<BusinessPageData[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string>('me');
  const [isQuinn, setIsQuinn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [listingBranch, setListingBranch] = useState<ListingBranch>('item');

  const [selectedBusinessSlug, setSelectedBusinessSlug] = useState<string>('');

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [county, setCounty] = useState('Dublin');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('7');
  const [images, setImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [mainCategory, setMainCategory] = useState<string>(CATEGORY_NAMES[0]);
  const [subCategory, setSubCategory] = useState<string>(MARKETPLACE_CATEGORIES[CATEGORY_NAMES[0]][0]);
  const [itemCondition, setItemCondition] = useState(ITEM_CONDITIONS[0]);
  const [priceType, setPriceType] = useState('Fixed Price');
  const [price, setPrice] = useState('');
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [hasReserve, setHasReserve] = useState(false);
  const [reservePrice, setReservePrice] = useState('');
  const [paymentOptions, setPaymentOptions] = useState<string[]>(['cash']);

  const [companyName, setCompanyName] = useState('');
  const [jobType, setJobType] = useState(JOB_TYPES[0]);
  const [salary, setSalary] = useState('€40,000 - €50,000 / year');
  const [applicationMethod, setApplicationMethod] = useState('ListMe Messages');

  const [serviceCategory, setServiceCategory] = useState(SERVICE_CATEGORIES[0]);
  const [pricingModel, setPricingModel] = useState('Hourly Rate');
  const [serviceRate, setServiceRate] = useState('€45 / hr');

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('account_type, full_name, username')
        .eq('id', user.id)
        .maybeSingle();

      const userMeta = user.user_metadata || {};
      const accountType = (profile?.account_type || userMeta.account_type || 'personal').toLowerCase();
      const isBiz = accountType === 'business';
      setIsBusiness(isBiz);

      const username = (profile?.username || userMeta.username || '').toLowerCase();
      const userIsQuinn = isUserQuinn(user, username);
      setIsQuinn(userIsQuinn);

      const userPages = (userMeta.business_pages || []) as BusinessPageData[];
      const assigned = (userMeta.assigned_business_pages || []) as any[];
      const combinedPages: BusinessPageData[] = [...userPages];
      for (const ap of assigned) {
        if (ap.slug && !combinedPages.some(p => p.slug === ap.slug)) {
          combinedPages.push({
            name: ap.name || ap.slug,
            slug: ap.slug,
            tagline: '',
            category: 'Storefront',
            county: 'Ireland',
            phone: '',
            email: '',
          });
        }
      }
      setMarketplacePages(combinedPages);

      const resolvedUsername = profile?.username || userMeta.username || user.email?.split('@')[0] || 'Member';
      setCurrentUsername(resolvedUsername);

      setCompanyName(profile?.full_name || profile?.username || userMeta.full_name || userMeta.username || '');

      setLoading(false);
    };
    checkAccess();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!title.trim()) {
        setError('Please enter a listing title.');
        return;
      }
      if (!description.trim()) {
        setError('Please enter a description.');
        return;
      }
      if (description.length > 1000) {
        setError('Description cannot exceed 1000 characters.');
        return;
      }
    }
    if (step === 2 && listingBranch === 'item' && images.length === 0) {
      setError('A minimum of 1 photo is required for marketplace item listings.');
      return;
    }
    if (step === 3 && listingBranch === 'item') {
      if (priceType === 'Auction') {
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice < 1.00) {
          setError('Starting bid for auctions must be at least €1.00.');
          return;
        }
        if (hasReserve) {
          const numReserve = parseFloat(reservePrice);
          if (isNaN(numReserve) || numReserve < numPrice) {
            setError('Reserve price must be greater than or equal to the starting bid.');
            return;
          }
        }
      } else {
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice < 0) {
          setError('Please enter a valid asking price.');
          return;
        }
      }
    }
    setError(null);
    setStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setError(null);
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      setUploadingImages(true);
      const uploadedUrls: string[] = [];
      for (const file of images) {
        const url = await uploadListingImage(file);
        if (url) uploadedUrls.push(url);
      }
      setUploadingImages(false);

      const chosenPage = marketplacePages.find(p => p.slug === selectedBusinessSlug);

      let categoryName = 'Marketplace';
      let numericPrice = 0;
      let finalCondition = 'New';

      if (listingBranch === 'item') {
        categoryName = `${mainCategory} - ${subCategory}`;
        numericPrice = parseFloat(price) || 0;
        finalCondition = itemCondition;
      } else if (listingBranch === 'job') {
        categoryName = 'Jobs';
        numericPrice = 0;
        finalCondition = 'Job Opening';
      } else if (listingBranch === 'service') {
        categoryName = 'Services';
        numericPrice = parseFloat(serviceRate.replace(/[^0-9.]/g, '')) || 0;
        finalCondition = 'Service';
      }

      let calculatedUploadFee = 0;
      if (duration === '14' || duration === '30') calculatedUploadFee += 0.10;
      if (listingBranch === 'item' && mainCategory === 'Other & Miscellaneous') calculatedUploadFee += 0.50;
      if (listingBranch === 'item' && priceType === 'Auction' && hasReserve) calculatedUploadFee += 0.25;

      const result = await createListing({
        title,
        description,
        location: county,
        category: categoryName,
        subcategory: listingBranch === 'item' ? subCategory : undefined,
        condition: finalCondition,
        priceType: listingBranch === 'item' ? priceType : 'Fixed Price',
        price: numericPrice,
        buyNowPrice: (listingBranch === 'item' && priceType === 'Auction' && buyNowPrice) ? parseFloat(buyNowPrice) : undefined,
        reservePrice: (listingBranch === 'item' && priceType === 'Auction' && hasReserve && reservePrice) ? parseFloat(reservePrice) : undefined,
        durationDays: duration === '5m' ? 0 : parseInt(duration),
        durationMinutes: duration === '5m' ? 5 : undefined,
        uploadFee: calculatedUploadFee > 0 ? calculatedUploadFee : undefined,
        paymentOptions: listingBranch === 'item' ? paymentOptions : ['cash'],
        images: uploadedUrls,
        listingType: listingBranch,
        businessPageSlug: selectedBusinessSlug || undefined,
        businessPageName: chosenPage?.name || undefined,
        jobDetails: listingBranch === 'job' ? {
          companyName: companyName.trim() || chosenPage?.name,
          jobType,
          salary,
          applicationMethod
        } : undefined,
        serviceDetails: listingBranch === 'service' ? {
          serviceCategory,
          pricingModel
        } : undefined,
      });

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else {
        if (selectedBusinessSlug) {
          router.push(`/page/${selectedBusinessSlug}`);
        } else {
          router.push('/marketplace');
        }
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while publishing.");
      setIsSubmitting(false);
    }
  };

  const selectedPageObj = marketplacePages.find(p => p.slug === selectedBusinessSlug);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <Package className="w-7 h-7 text-primary" />
              Start a Listing
            </h1>
            <span className="text-xs font-bold px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 rounded-full">
              Direct Payouts
            </span>
          </div>
          
          
          {marketplacePages.length > 0 && (
            <div className="mt-4 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818] space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-900 dark:text-white block">
                  Who is selling this item?
                </label>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Customise whether this listing is published under your personal name or on a business storefront.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <button
                  type="button"
                  onClick={() => setSelectedBusinessSlug('')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    !selectedBusinessSlug
                      ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                      : 'border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    !selectedBusinessSlug ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    {currentUsername.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block text-gray-900 dark:text-white">
                      Sell as Myself (@{currentUsername})
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                      Personal listing (does not show on store page)
                    </span>
                  </div>
                </button>

                
                <div className={`p-3 rounded-xl border transition-all ${
                  selectedBusinessSlug
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-700'
                }`}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedBusinessSlug && marketplacePages.length > 0) {
                        setSelectedBusinessSlug(marketplacePages[0].slug);
                      }
                    }}
                    className="w-full text-left flex items-center gap-3 cursor-pointer"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedBusinessSlug ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      <Store className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold block text-gray-900 dark:text-white">
                        Sell on Business Storefront
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                        Shows store branding &amp; appears in store catalog
                      </span>
                    </div>
                  </button>

                  {selectedBusinessSlug && marketplacePages.length > 1 && (
                    <div className="mt-2">
                      <CustomSelect
                        value={selectedBusinessSlug}
                        onChange={setSelectedBusinessSlug}
                        options={marketplacePages.map((page) => ({
                          value: page.slug,
                          label: `${page.name} (/page/${page.slug})`,
                        }))}
                      />
                    </div>
                  )}
                </div>
              </div>

              {selectedBusinessSlug && (
                <p className="text-[11px] text-primary font-medium flex items-center gap-1.5 pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Storefront Active: Buyers will see the <strong>{selectedPageObj?.name}</strong> storefront and location on this listing.
                  </span>
                </p>
              )}
            </div>
          )}

          
          <div className="mt-6 flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-zinc-800 rounded-full z-0"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-300"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
            
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  step >= s 
                    ? 'bg-primary border-primary text-white' 
                    : 'bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700 text-gray-400'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium text-gray-500">
            <span>1. Basics</span>
            <span>2. Photos</span>
            <span>3. Terms &amp; Pricing</span>
            <span>4. Review</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 border-l-4 border-red-500 p-4 mb-6 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
          
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
              
              
              {listingBranch === 'item' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Item Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., iPhone 15 Pro Max - 256GB Natural Titanium"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Category</label>
                      <CustomSelect
                        value={mainCategory}
                        onChange={(cat) => {
                          setMainCategory(cat);
                          if (MARKETPLACE_CATEGORIES[cat]?.length) {
                            setSubCategory(MARKETPLACE_CATEGORIES[cat][0]);
                          }
                        }}
                        options={CATEGORY_NAMES.map(cat => ({ value: cat, label: cat }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Subcategory</label>
                      <CustomSelect
                        value={subCategory}
                        onChange={setSubCategory}
                        options={(MARKETPLACE_CATEGORIES[mainCategory] || []).map(sub => ({ value: sub, label: sub }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Condition</label>
                    <CustomSelect
                      value={itemCondition}
                      onChange={setItemCondition}
                      options={ITEM_CONDITIONS.map(cond => ({ value: cond, label: cond }))}
                    />
                  </div>

                  {mainCategory === 'Other & Miscellaneous' && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>
                        <strong>Other &amp; Miscellaneous category:</strong> Listings placed in this catch-all category incur a <strong>€0.50 upload fee</strong>.
                      </span>
                    </div>
                  )}
                </>
              )}

              {listingBranch === 'job' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Job Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Senior Full Stack Engineer (React / Next.js)"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Company / Business Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g., Web Studios Ireland"
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Job Type</label>
                      <CustomSelect
                        value={jobType}
                        onChange={setJobType}
                        options={JOB_TYPES.map(type => ({ value: type, label: type }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Salary / Compensation</label>
                      <input
                        type="text"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        placeholder="e.g., €55,000 - €65,000 / year or €22/hr"
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Application Method</label>
                      <CustomSelect
                        value={applicationMethod}
                        onChange={setApplicationMethod}
                        options={[
                          { value: 'ListMe Messages', label: 'ListMe Direct Messaging (Recommended)' },
                          { value: 'Email / External CV', label: 'Email / External Submission' },
                        ]}
                      />
                    </div>
                  </div>
                </>
              )}

              {listingBranch === 'service' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Service Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Certified Electrician - Domestic & Commercial Services"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Service Category</label>
                      <CustomSelect
                        value={serviceCategory}
                        onChange={setServiceCategory}
                        options={SERVICE_CATEGORIES.map(sc => ({ value: sc, label: sc }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Pricing Model</label>
                      <CustomSelect
                        value={pricingModel}
                        onChange={setPricingModel}
                        options={[
                          { value: 'Hourly Rate', label: 'Hourly Rate' },
                          { value: 'Fixed Price Quote', label: 'Fixed Price Quote' },
                          { value: 'Free Consultation / Quote', label: 'Free Consultation / Free Quote' },
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Pricing / Rate Indication</label>
                    <input
                      type="text"
                      value={serviceRate}
                      onChange={(e) => setServiceRate(e.target.value)}
                      placeholder="e.g., €45 / hr or From €150 or Free Quote"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1.5">
                  Location (County)
                </label>
                <CustomSelect
                  value={county}
                  onChange={setCounty}
                  options={COUNTIES.map(c => ({ value: c, label: c }))}
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  All 32 Irish counties supported.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
                  {listingBranch === 'job' 
                    ? 'Job Description & Requirements' 
                    : listingBranch === 'service' 
                    ? 'Service Scope, Experience & Qualifications' 
                    : 'Item Description'}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  rows={5}
                  placeholder={
                    listingBranch === 'job'
                      ? 'Outline key responsibilities, qualifications, working hours, and benefits.'
                      : listingBranch === 'service'
                      ? 'Describe your service expertise, certifications, coverage area, and guarantees.'
                      : 'Describe your item in detail. Mention flaws, included accessories, and condition.'
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                />
                <div className="flex items-center justify-between text-xs mt-1.5">
                  <span className="text-gray-400 dark:text-gray-500">Maximum 1,000 characters per post</span>
                  <span className={description.length >= 1000 ? "text-red-500 font-bold" : "text-gray-500 font-medium"}>
                    {description.length} / 1000
                  </span>
                </div>
              </div>
            </div>
          )}

          
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {listingBranch === 'item' ? 'Add Item Photos' : listingBranch === 'job' ? 'Add Company Logo or Workplace Image' : 'Add Work Portfolio & Photos'}
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  {listingBranch === 'item' 
                    ? 'A MINIMUM of 1 photo is required to publish an item listing.' 
                    : 'Photos enhance visibility and credibility.'}
                </p>
                {listingBranch === 'item' && images.length === 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-4 border border-amber-200 dark:border-amber-800/40">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Please select at least 1 photo to proceed
                  </div>
                )}
                <div className="block mt-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl transition-colors font-bold text-xs">
                    <UploadCloud className="w-4 h-4 text-primary" />
                    Select Images
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelect} />
                  </label>
                </div>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                  {images.map((file, index) => (
                    <div key={index} className="relative aspect-square rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden group">
                      <Image 
                        src={URL.createObjectURL(file)} 
                        alt="Preview" 
                        fill
                        className="object-cover"
                      />
                      <button 
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
              
              
              {listingBranch === 'item' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">Price Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPriceType('Fixed Price')}
                        className={`p-4 rounded-xl border-2 text-center transition-colors cursor-pointer ${
                          priceType === 'Fixed Price'
                            ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary font-bold'
                            : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-primary/50'
                        }`}
                      >
                        <span className="block font-bold text-base mb-0.5">Fixed Price</span>
                        <span className="text-xs text-gray-500">Instant buy with fixed amount</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceType('Auction')}
                        className={`p-4 rounded-xl border-2 text-center transition-colors cursor-pointer ${
                          priceType === 'Auction'
                            ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary font-bold'
                            : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-primary/50'
                        }`}
                      >
                        <span className="block font-bold text-base mb-0.5">Auction</span>
                        <span className="text-xs text-gray-500">Allow bidding with reserves</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
                      {priceType === 'Auction' ? 'Starting Bid (€)' : 'Asking Price (€)'}
                    </label>
                    <div className="relative max-w-xs">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-sm font-bold">€</span>
                      </div>
                      <input
                        type="number"
                        min={priceType === 'Auction' ? "1.00" : "0.00"}
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder={priceType === 'Auction' ? "1.00" : "0.00"}
                        className="block w-full pl-9 pr-4 py-2.5 text-sm font-bold border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    {priceType === 'Auction' && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        Minimum starting bid for auctions is €1.00.
                      </p>
                    )}
                  </div>

                  {priceType === 'Auction' && (
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 space-y-2">
                      <label className="block text-xs font-bold text-gray-900 dark:text-white">
                        Buy It Now Price (€) <span className="text-[10px] font-normal text-gray-500">(Optional)</span>
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Allow buyers to bypass the auction and buy immediately.
                      </p>
                      <div className="relative max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-sm font-bold">€</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={buyNowPrice}
                          onChange={(e) => setBuyNowPrice(e.target.value)}
                          placeholder="Optional Buy Now Price"
                          className="block w-full pl-9 pr-4 py-2 text-sm font-medium border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                  )}

                  {priceType === 'Auction' && (
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                              Set Reserve Price
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                              +€0.25 reserve fee
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                            The item will not sell unless bidding reaches or exceeds your reserve price. If not met, the listing closes and no sale takes place.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={hasReserve}
                          onChange={(e) => {
                            setHasReserve(e.target.checked);
                            if (!e.target.checked) setReservePrice('');
                          }}
                          className="mt-0.5 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                        />
                      </div>

                      {hasReserve && (
                        <div className="pt-2 border-t border-gray-200 dark:border-zinc-800">
                          <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1">
                            Minimum Reserve Amount (€)
                          </label>
                          <div className="relative max-w-xs">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <span className="text-gray-400 text-sm font-bold">€</span>
                            </div>
                            <input
                              type="number"
                              min={price || "1.00"}
                              step="0.01"
                              value={reservePrice}
                              onChange={(e) => setReservePrice(e.target.value)}
                              placeholder="e.g. 25.00"
                              className="block w-full pl-9 pr-4 py-2 text-sm font-medium border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">
                            Must be equal to or higher than the starting bid (€{price || '1.00'}).
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-bold text-gray-900 dark:text-white">Accepted Payment Methods</label>
                      <span className="text-[11px] font-semibold text-gray-500">
                        {paymentOptions.includes('cash')
                          ? 'Euro in hand'
                          : 'Opted out (Direct buyer arrangement)'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      Select payment options accepted on this listing. Buyers and sellers arrange payment directly.
                    </p>
                    <div className="space-y-2.5">
                      {[
                        { id: 'cash', name: 'Euro in Hand / Cash on Collection', note: 'Buyer pays directly upon in-person collection' },
                      ].map(({ id: method, name, note }) => {
                        const isChecked = paymentOptions.includes(method);

                        return (
                          <label
                            key={method}
                            className={`flex items-start gap-3 p-3.5 border rounded-xl transition-colors cursor-pointer ${
                              isChecked
                                ? 'border-gray-300 dark:border-zinc-700 bg-gray-50/80 dark:bg-zinc-800/80'
                                : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPaymentOptions([...paymentOptions, method]);
                                } else {
                                  setPaymentOptions(paymentOptions.filter(m => m !== method));
                                }
                              }}
                              className="mt-0.5 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-gray-900 dark:text-white block">
                                {name}
                              </span>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                {note}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    {paymentOptions.length === 0 && (
                      <div className="mt-2 p-3 rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs text-gray-600 dark:text-gray-400">
                        <strong>Direct Arrangement Opt-Out:</strong> No integrated payment method selected. Buyers will contact you directly to agree on collection and payment.
                      </div>
                    )}
                  </div>
                </>
              )}

              
              {listingBranch === 'job' && (
                <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Free Business Job Posting</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    ListMe provides free job advertising across Ireland. Applicants can contact you directly via ListMe instant messages or your specified application channel.
                  </p>
                  <div className="pt-2 text-xs font-semibold text-gray-500">
                    Salary Indicator: <span className="text-gray-900 dark:text-white font-bold">{salary}</span>
                  </div>
                </div>
              )}

              
              {listingBranch === 'service' && (
                <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Direct Client Booking &amp; Quotes</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Clients can message you directly for quotes or bookings with direct client agreements.
                  </p>
                  <div className="pt-2 text-xs font-semibold text-gray-500">
                    Model: <span className="text-gray-900 dark:text-white font-bold">{pricingModel} ({serviceRate})</span>
                  </div>
                </div>
              )}

              
              <div className="max-w-md">
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Listing Duration</label>
                <CustomSelect
                  value={duration}
                  onChange={setDuration}
                  options={[
                    ...(isQuinn ? [{ value: '5m', label: '5 minutes (Quinn Only)' }] : []),
                    { value: '3', label: '3 days' },
                    { value: '5', label: '5 days' },
                    { value: '7', label: '7 days (Standard)' },
                    { value: '14', label: '14 days (€0.10 upload fee)' },
                    { value: '30', label: '30 days (€0.10 upload fee)' },
                  ]}
                />

                {(duration === '14' || duration === '30') && (
                  <div className="mt-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        Extended Visibility Option
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-200">
                        €0.10 upload fee
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300/90 mt-1.5 leading-snug">
                      The longer your post is up the more views and further it&apos;ll be pushed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                    {listingBranch.toUpperCase()}
                  </span>
                  {selectedBusinessSlug && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
                      Storefront: {selectedPageObj?.name}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {title || 'Untitled Listing'}
                </h3>
                
                <div className="grid grid-cols-2 gap-y-3 text-xs mb-4">
                  <div>
                    <span className="text-gray-500 block">Category</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {listingBranch === 'item' ? `${mainCategory} - ${subCategory}` : listingBranch === 'job' ? 'Jobs' : serviceCategory}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Location</span>
                    <span className="font-bold text-gray-900 dark:text-white">{county}</span>
                  </div>

                  {listingBranch === 'item' ? (
                    <>
                      <div>
                        <span className="text-gray-500 block">Condition</span>
                        <span className="font-bold text-gray-900 dark:text-white">{itemCondition}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Price</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          €{price ? parseFloat(price).toFixed(2) : '0.00'} ({priceType})
                        </span>
                      </div>
                      {priceType === 'Auction' && hasReserve && reservePrice && (
                        <div>
                          <span className="text-gray-500 block">Reserve Price</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            €{parseFloat(reservePrice).toFixed(2)} (+€0.25 fee)
                          </span>
                        </div>
                      )}
                    </>
                  ) : listingBranch === 'job' ? (
                    <>
                      <div>
                        <span className="text-gray-500 block">Job Type</span>
                        <span className="font-bold text-gray-900 dark:text-white">{jobType}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Compensation</span>
                        <span className="font-bold text-gray-900 dark:text-white">{salary}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-gray-500 block">Model</span>
                        <span className="font-bold text-gray-900 dark:text-white">{pricingModel}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Rate</span>
                        <span className="font-bold text-gray-900 dark:text-white">{serviceRate}</span>
                      </div>
                    </>
                  )}

                  <div>
                    <span className="text-gray-500 block">Duration</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {duration === '5m' ? '5 minutes' : `${duration} days`}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Publisher</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {selectedBusinessSlug ? `${selectedPageObj?.name} (Storefront)` : 'Personal Profile'}
                    </span>
                  </div>
                </div>

                {((duration === '14' || duration === '30') || (listingBranch === 'item' && mainCategory === 'Other & Miscellaneous') || (listingBranch === 'item' && priceType === 'Auction' && hasReserve)) && (() => {
                  const totalFee = (duration === '14' || duration === '30' ? 0.10 : 0) +
                    (listingBranch === 'item' && mainCategory === 'Other & Miscellaneous' ? 0.50 : 0) +
                    (listingBranch === 'item' && priceType === 'Auction' && hasReserve ? 0.25 : 0);
                  return (
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold block">
                          Fee Breakdown (Total: €{totalFee.toFixed(2)})
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 font-semibold text-emerald-900 dark:text-emerald-200 uppercase tracking-wide">
                          Listing Fee
                        </span>
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                        {(duration === '14' || duration === '30') && <li>Extended duration fee: €0.10</li>}
                        {listingBranch === 'item' && mainCategory === 'Other & Miscellaneous' && <li>Other &amp; Miscellaneous upload fee: €0.50</li>}
                        {listingBranch === 'item' && priceType === 'Auction' && hasReserve && <li>Reserve auction fee: €0.25</li>}
                      </ul>

                      <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60 text-[11px]">
                        <div className="text-emerald-700 dark:text-emerald-300">
                          Listings with a fee will be billed separately after publishing.
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="pt-3 border-t border-gray-200 dark:border-zinc-800 text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-bold text-gray-900 dark:text-white block mb-1">Description:</span>
                  <p className="line-clamp-3 whitespace-pre-line">{description}</p>
                </div>
              </div>
            </div>
          )}

          {error && step === 4 && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Publishing Unsuccessful</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="mt-8 pt-5 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2.5 bg-primary hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {uploadingImages
                    ? 'Uploading Photos...'
                    : (() => {
                        const totalFee = (duration === '14' || duration === '30' ? 0.10 : 0) +
                          (listingBranch === 'item' && mainCategory === 'Other & Miscellaneous' ? 0.50 : 0) +
                          (listingBranch === 'item' && priceType === 'Auction' && hasReserve ? 0.25 : 0);
                        return totalFee > 0 ? `Publish Listing (€${totalFee.toFixed(2)} fee)` : 'Publish Listing';
                      })()}
                </span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
