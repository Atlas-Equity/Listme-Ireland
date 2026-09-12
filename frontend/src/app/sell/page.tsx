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
  Banknote,
  ShoppingBag,
  Briefcase,
  Wrench,
  Store,
  Building2,
  Euro,
  FileText,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { uploadListingImage } from '@/utils/supabase/storage';
import { createListing } from './actions';
import { IRELAND_LOCATIONS, COUNTIES } from '@/utils/irelandLocations';
import { BusinessPageData } from '@/app/actions/businessPages';
import Image from 'next/image';

type ListingBranch = 'item' | 'job' | 'service';

const ITEM_CONDITIONS = ['New', 'Fairly New', 'Used', 'Partially Used', 'Very Used'];

const ITEM_SUBCATEGORIES = [
  'Marketplace - Electronics & Tech',
  'Marketplace - Home & Living',
  'Marketplace - Fashion & Accessories',
  'Marketplace - Motors & Automotive',
  'Marketplace - Sports & Outdoors',
  'Marketplace - Baby & Kids',
  'Marketplace - Books & Media',
  'Marketplace - General Goods'
];

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
  const [hasCreditCard, setHasCreditCard] = useState(false);
  const [marketplacePages, setMarketplacePages] = useState<BusinessPageData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // TradeMe Branch Selection ('item' | 'job' | 'service')
  const [listingBranch, setListingBranch] = useState<ListingBranch>('item');

  // Business Page Association (Must be an owned marketplace page)
  const [selectedBusinessSlug, setSelectedBusinessSlug] = useState<string>('');

  // Wizard Step (1: Basics, 2: Photos, 3: Pricing & Terms, 4: Review)
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common Form State
  const [title, setTitle] = useState('');
  const [county, setCounty] = useState('Dublin');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('7');
  const [images, setImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Item-specific State
  const [itemCategory, setItemCategory] = useState(ITEM_SUBCATEGORIES[0]);
  const [itemCondition, setItemCondition] = useState(ITEM_CONDITIONS[0]);
  const [priceType, setPriceType] = useState('Fixed Price');
  const [price, setPrice] = useState('');
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [paymentOptions, setPaymentOptions] = useState<string[]>(['cash', 'stripe', 'revolut']);

  // Job-specific State
  const [companyName, setCompanyName] = useState('');
  const [jobType, setJobType] = useState(JOB_TYPES[0]);
  const [salary, setSalary] = useState('€40,000 - €50,000 / year');
  const [applicationMethod, setApplicationMethod] = useState('ListMe Messages');

  // Service-specific State
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

      // Check linked credit card requirement across linked_cards array or legacy linked_card
      const linkedCards: any[] = Array.isArray(userMeta.linked_cards)
        ? userMeta.linked_cards
        : (userMeta.linked_card ? [userMeta.linked_card] : []);

      const cardValid = linkedCards.some(card => 
        card && 
        (card.funding === 'credit' || card.cardNickname?.toLowerCase().includes('credit') || !card.funding) &&
        Array.isArray(card.cardNumberBlocks) && 
        card.cardNumberBlocks.length === 4
      );
      setHasCreditCard(cardValid);

      // Check owned marketplace pages in metadata
      const userPages = (userMeta.business_pages || []) as BusinessPageData[];
      const mktPages = userPages.filter(p => p.business_type === 'marketplace');
      setMarketplacePages(mktPages);

      // Default company name if user has profile info
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

  if (!hasCreditCard) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-black px-4">
        <div className="max-w-md w-full bg-white dark:bg-[#181818] rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Verified Credit Card Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
            To prevent fraud, protect Irish buyers, and ensure scam chargeback security, all sellers must have a verified Credit Card linked before listing items, jobs, or services.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/my-listme?tab=account')}
              className="w-full py-3 px-4 bg-primary hover:bg-green-700 text-white font-bold rounded-xl transition-colors text-sm shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Link Credit Card in Account Details</span>
            </button>
            <button 
              onClick={() => router.push('/')}
              className="w-full py-2.5 px-4 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300 font-semibold rounded-xl transition-colors text-xs cursor-pointer"
            >
              Return to Homepage
            </button>
          </div>
        </div>
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
    }
    if (step === 2 && listingBranch === 'item' && images.length === 0) {
      setError('A minimum of 1 photo is required for marketplace item listings.');
      return;
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
      // 1. Upload Images
      setUploadingImages(true);
      const uploadedUrls: string[] = [];
      for (const file of images) {
        const url = await uploadListingImage(file);
        if (url) uploadedUrls.push(url);
      }
      setUploadingImages(false);

      // Find matching business page name if selected
      const chosenPage = marketplacePages.find(p => p.slug === selectedBusinessSlug);

      // 2. Prepare Payload according to TradeMe Branch
      let categoryName = 'Marketplace';
      let numericPrice = 0;
      let finalCondition = 'New';

      if (listingBranch === 'item') {
        categoryName = itemCategory;
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

      const result = await createListing({
        title,
        description,
        location: county,
        category: categoryName,
        condition: finalCondition,
        priceType: listingBranch === 'item' ? priceType : 'Fixed Price',
        price: numericPrice,
        buyNowPrice: (listingBranch === 'item' && priceType === 'Auction' && buyNowPrice) ? parseFloat(buyNowPrice) : undefined,
        durationDays: parseInt(duration),
        paymentOptions: listingBranch === 'item' ? paymentOptions : ['cash', 'stripe'],
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
        // Success!
        if (selectedBusinessSlug) {
          router.push(`/page/${selectedBusinessSlug}`);
        } else {
          router.push('/browse');
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
        
        {/* Top Header */}
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

          {/* TradeMe Listing Type Selector: Item vs Job vs Service */}
          <div className="mt-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Choose What You Are Listing
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setListingBranch('item');
                  setError(null);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  listingBranch === 'item'
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary ring-1 ring-primary'
                    : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818] text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-zinc-700'
                }`}
              >
                <ShoppingBag className={`w-5 h-5 mb-2 ${listingBranch === 'item' ? 'text-primary' : 'text-gray-400'}`} />
                <div>
                  <span className="block font-bold text-sm text-gray-900 dark:text-white">Item</span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">General goods &amp; products</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setListingBranch('job');
                  setError(null);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  listingBranch === 'job'
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary ring-1 ring-primary'
                    : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818] text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-zinc-700'
                }`}
              >
                <Briefcase className={`w-5 h-5 mb-2 ${listingBranch === 'job' ? 'text-primary' : 'text-gray-400'}`} />
                <div>
                  <span className="block font-bold text-sm text-gray-900 dark:text-white">Job</span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">Vacancies &amp; roles</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setListingBranch('service');
                  setError(null);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  listingBranch === 'service'
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary ring-1 ring-primary'
                    : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818] text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-zinc-700'
                }`}
              >
                <Wrench className={`w-5 h-5 mb-2 ${listingBranch === 'service' ? 'text-primary' : 'text-gray-400'}`} />
                <div>
                  <span className="block font-bold text-sm text-gray-900 dark:text-white">Service</span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">Trades &amp; contractors</span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Business Page Storefront Selector (IF Business Account AND has marketplace page) */}
          {isBusiness && marketplacePages.length > 0 && (
            <div className="mt-4 p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818]">
              <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-primary" />
                <span>List Under Business Storefront</span>
                <span className="text-[10px] font-normal text-gray-400">(Marketplace Business Pages)</span>
              </label>
              <select
                value={selectedBusinessSlug}
                onChange={(e) => setSelectedBusinessSlug(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">Personal Seller Profile (Default)</option>
                {marketplacePages.map(page => (
                  <option key={page.slug} value={page.slug}>
                    {page.name} — Storefront (/page/{page.slug})
                  </option>
                ))}
              </select>
              {selectedBusinessSlug && (
                <p className="text-[11px] text-primary mt-1.5 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  This listing will be featured directly in the storefront of {selectedPageObj?.name}.
                </p>
              )}
            </div>
          )}

          {/* Progress Bar */}
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
          
          {/* STEP 1: BASICS */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
              
              {/* Branch 1: ITEM Basics */}
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
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Subcategory</label>
                      <select
                        value={itemCategory}
                        onChange={(e) => setItemCategory(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                      >
                        {ITEM_SUBCATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Condition</label>
                      <select
                        value={itemCondition}
                        onChange={(e) => setItemCondition(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                      >
                        {ITEM_CONDITIONS.map(cond => (
                          <option key={cond} value={cond}>{cond}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Branch 2: JOB Basics */}
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
                      <select
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                      >
                        {JOB_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
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
                      <select
                        value={applicationMethod}
                        onChange={(e) => setApplicationMethod(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                      >
                        <option value="ListMe Messages">ListMe Direct Messaging (Recommended)</option>
                        <option value="Email / External CV">Email / External Submission</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Branch 3: SERVICE Basics */}
              {listingBranch === 'service' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Service Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Certified Electrician - Domestic &amp; Commercial Services"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Service Category</label>
                      <select
                        value={serviceCategory}
                        onChange={(e) => setServiceCategory(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                      >
                        {SERVICE_CATEGORIES.map(sc => (
                          <option key={sc} value={sc}>{sc}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Pricing Model</label>
                      <select
                        value={pricingModel}
                        onChange={(e) => setPricingModel(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                      >
                        <option value="Hourly Rate">Hourly Rate</option>
                        <option value="Fixed Price Quote">Fixed Price Quote</option>
                        <option value="Free Consultation / Quote">Free Consultation / Free Quote</option>
                      </select>
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

              {/* County Location (Common to all) */}
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1.5">
                  Location (County)
                </label>
                <select
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                >
                  {COUNTIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Listings are locked to Republic of Ireland core counties.
                </p>
              </div>

              {/* Description (Common to all) */}
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
              </div>
            </div>
          )}

          {/* STEP 2: PHOTOS */}
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

          {/* STEP 3: PRICING & TERMS */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
              
              {/* Branch 1: ITEM Pricing */}
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
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="block w-full pl-9 pr-4 py-2.5 text-sm font-bold border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
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

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Accepted Payment Methods</label>
                    <p className="text-xs text-gray-500 mb-2">Select payment options accepted on this listing.</p>
                    <div className="space-y-2.5">
                      {[
                        { id: 'cash', name: 'Euro in Hand / Cash on Collection' },
                        { id: 'revolut', name: 'Revolut In-App Transfer' },
                        { id: 'stripe', name: 'Stripe Escrow (Credit / Debit Card)' },
                      ].map(({ id: method, name }) => (
                        <label key={method} className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 dark:border-zinc-700 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/80 transition-colors">
                          <input
                            type="checkbox"
                            checked={paymentOptions.includes(method)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPaymentOptions([...paymentOptions, method]);
                              } else if (paymentOptions.length > 1) {
                                setPaymentOptions(paymentOptions.filter(m => m !== method));
                              }
                            }}
                            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                          />
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Branch 2: JOB Pricing / Terms */}
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

              {/* Branch 3: SERVICE Pricing */}
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

              {/* Duration (Common to all) */}
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Listing Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full max-w-xs px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                >
                  <option value="3">3 days</option>
                  <option value="5">5 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
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
                      {listingBranch === 'item' ? itemCategory : listingBranch === 'job' ? 'Jobs' : serviceCategory}
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
                          €{price || '0.00'} ({priceType})
                        </span>
                      </div>
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
                    <span className="font-bold text-gray-900 dark:text-white">{duration} days</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Publisher</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {selectedBusinessSlug ? `${selectedPageObj?.name} (Storefront)` : 'Personal Profile'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-zinc-800 text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-bold text-gray-900 dark:text-white block mb-1">Description:</span>
                  <p className="line-clamp-3 whitespace-pre-line">{description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
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
                <span>{uploadingImages ? 'Uploading Photos...' : 'Publish Listing'}</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
