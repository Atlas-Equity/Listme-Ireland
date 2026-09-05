'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Package, Camera, CheckCircle2, ChevronRight, ChevronLeft, UploadCloud, X, Loader2, AlertCircle, Banknote } from 'lucide-react';
import { uploadListingImage } from '@/utils/supabase/storage';
import { createListing } from './actions';
import { IRELAND_LOCATIONS, COUNTIES } from '@/utils/irelandLocations';
import Image from 'next/image';

const CATEGORIES = ['Marketplace', 'Jobs', 'Services'];
const CONDITIONS = ['New', 'Fairly New', 'Used', 'Partially Used', 'Very Used'];

export default function SellPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isBusiness, setIsBusiness] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wizard State
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [county, setCounty] = useState('Dublin');
  const [area, setArea] = useState(IRELAND_LOCATIONS['Dublin'][0] || '');
  const [customArea, setCustomArea] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('7');
  const [priceType, setPriceType] = useState('Fixed Price');
  const [price, setPrice] = useState('');
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [paymentOptions, setPaymentOptions] = useState<string[]>(['cash', 'stripe', 'revolut']);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('account_type, stripe_onboarding_complete')
        .eq('id', user.id)
        .single();

      if (profile?.account_type !== 'business') {
        setIsBusiness(false);
        setLoading(false);
        return;
      } 
      
      // If business account but hasn't completed Stripe onboarding, redirect
      if (!profile?.stripe_onboarding_complete) {
        router.push('/stripe-setup');
        return;
      }

      setIsBusiness(true);
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

  if (!isBusiness) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-black px-4">
        <div className="max-w-md w-full bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Selling is for Business Accounts
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Currently, only registered business accounts can list items for sale. You are logged in with a Personal account.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="w-full py-3 px-4 bg-[#0073e6] hover:bg-[#005bb5] text-white font-bold rounded-lg transition-colors"
          >
            Back to Home
          </button>
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

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

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
      setImageUrls(uploadedUrls);
      setUploadingImages(false);

      // 2. Save Listing
      const fullLocation = customArea.trim() ? `${county}, ${customArea.trim()}` : `${county}, ${area}`;

      const result = await createListing({
        title,
        description,
        location: fullLocation,
        category,
        condition,
        priceType,
        price: parseFloat(price),
        buyNowPrice: priceType === 'Auction' && buyNowPrice ? parseFloat(buyNowPrice) : undefined,
        durationDays: parseInt(duration),
        paymentOptions,
        images: uploadedUrls
      });

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else {
        // Success!
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            Start a Listing
          </h1>
          
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
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  step >= s 
                    ? 'bg-primary border-primary text-white' 
                    : 'bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700 text-gray-400'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium text-gray-500">
            <span>Basics</span>
            <span>Photos</span>
            <span>Pricing</span>
            <span>Review</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
          
          {/* STEP 1: BASICS */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Listing Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., iPhone 14 Pro Max - 256GB"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    {CONDITIONS.map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Item Location (Ireland)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block font-medium">County / Major Area</span>
                    <select
                      value={county}
                      onChange={(e) => {
                        const newCounty = e.target.value;
                        setCounty(newCounty);
                        setArea(IRELAND_LOCATIONS[newCounty]?.[0] || '');
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    >
                      {COUNTIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block font-medium">Specific Town / Area</span>
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    >
                      {(IRELAND_LOCATIONS[county] || []).map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                    placeholder="Optional: Enter a specific neighborhood or landmark..."
                    className="w-full px-4 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-md bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Describe your item in detail. Mention any flaws or specific features to build trust with buyers."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* STEP 2: PHOTOS */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Photos</h3>
                <p className="text-sm text-gray-500 mb-2">A MINIMUM of 1 photo is required to publish a listing.</p>
                {images.length === 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-4 border border-amber-200 dark:border-amber-800/40">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Please select at least 1 photo to proceed
                  </div>
                )}
                <div className="block mt-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg transition-colors font-medium">
                    <UploadCloud className="w-5 h-5" />
                    Select Images
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelect} />
                  </label>
                </div>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
                  {images.map((file, index) => (
                    <div key={index} className="relative aspect-square rounded-lg border border-gray-200 dark:border-zinc-700 overflow-hidden group">
                      <Image 
                        src={URL.createObjectURL(file)} 
                        alt="Preview" 
                        fill
                        className="object-cover"
                      />
                      <button 
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PRICING */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Listing Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPriceType('Fixed Price')}
                    className={`p-4 rounded-xl border-2 text-center transition-colors ${
                      priceType === 'Fixed Price'
                        ? 'border-primary bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-bold'
                        : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-primary/50'
                    }`}
                  >
                    <span className="block font-bold text-lg mb-1">Buy Now</span>
                    <span className="text-xs">Sell at a fixed price</span>
                  </button>
                  <button
                    onClick={() => setPriceType('Auction')}
                    className={`p-4 rounded-xl border-2 text-center transition-colors ${
                      priceType === 'Auction'
                        ? 'border-primary bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-bold'
                        : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-primary/50'
                    }`}
                  >
                    <span className="block font-bold text-lg mb-1">Auction</span>
                    <span className="text-xs">Let buyers bid</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {priceType === 'Auction' ? 'Starting Price' : 'Asking Price'}
                </label>
                <div className="relative max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="h-5 w-5 text-gray-400 text-lg font-semibold">€</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="block w-full pl-11 pr-4 py-3 text-lg font-medium border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Optional Buy It Now Price for Auctions */}
              {priceType === 'Auction' && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 space-y-2">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                    Buy It Now Price (€) <span className="text-xs font-normal text-gray-500">(Optional)</span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Want to allow buyers to bypass the auction and buy immediately at a fixed price? Set an optional Buy It Now price below.
                  </p>
                  <div className="relative max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="h-5 w-5 text-gray-400 text-lg font-semibold">€</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={buyNowPrice}
                      onChange={(e) => setBuyNowPrice(e.target.value)}
                      placeholder="Optional Buy Now Price"
                      className="block w-full pl-11 pr-4 py-2.5 text-base font-medium border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Listing Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full max-w-xs px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="3">3 days</option>
                  <option value="5">5 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Accepted Payment Methods</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Select all the payment methods you accept from buyers.</p>
                <div className="space-y-3">
                  {[
                    { id: 'cash', name: 'Euro in Hand / Cash on Collection' },
                    { id: 'revolut', name: 'Revolut' },
                    { id: 'stripe', name: 'Stripe (Credit / Debit Card)' },
                  ].map(({ id: method, name }) => (
                    <label key={method} className="flex items-center gap-3 cursor-pointer p-3.5 border border-gray-200 dark:border-zinc-700 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/80 transition-colors">
                      <input
                        type="checkbox"
                        checked={paymentOptions.includes(method)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPaymentOptions([...paymentOptions, method]);
                          } else {
                            // Require at least one
                            if (paymentOptions.length > 1) {
                              setPaymentOptions(paymentOptions.filter(m => m !== method));
                            }
                          }
                        }}
                        className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                      <span className="font-medium flex items-center text-gray-900 dark:text-white">
                        {method === 'cash' && (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                            <Banknote className="w-5 h-5" />
                            <span>{name}</span>
                          </span>
                        )}
                        {method === 'revolut' && (
                          <span className="flex items-center gap-2">
                            <span className="font-black text-black dark:text-white bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 px-2 py-0.5 rounded text-xs tracking-wider">
                              R
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">Revolut</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">(In-App Transfer / Tag)</span>
                          </span>
                        )}
                        {method === 'stripe' && (
                          <span className="flex items-center gap-2">
                            <img 
                              src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
                              alt="Stripe" 
                              className="h-5 w-auto object-contain mr-1" 
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">(Card Payments)</span>
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-xl p-6 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title || 'Untitled Listing'}</h3>
                
                <div className="grid grid-cols-2 gap-y-4 text-sm mb-6">
                  <div>
                    <span className="text-gray-500 block">Category</span>
                    <span className="font-medium text-gray-900 dark:text-white">{category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Condition</span>
                    <span className="font-medium text-gray-900 dark:text-white">{condition}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Location</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {customArea.trim() ? `${county}, ${customArea.trim()}` : `${county}, ${area}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Listing Type</span>
                    <span className="font-medium text-gray-900 dark:text-white">{priceType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Duration</span>
                    <span className="font-medium text-gray-900 dark:text-white">{duration} days</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Price</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      €{price || '0.00'}
                      {priceType === 'Auction' && buyNowPrice && (
                        <span className="text-xs text-gray-500 ml-1.5">(Buy Now: €{buyNowPrice})</span>
                      )}
                    </span>
                  </div>
                  <div className="col-span-2 mt-2">
                    <span className="text-gray-500 block">Payment Methods</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {paymentOptions.map(p => p === 'cash' ? 'Euro in Hand' : p).join(', ')}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 block text-sm mb-1">Images Attached</span>
                  <span className="font-medium text-gray-900 dark:text-white">{images.length} photo{images.length === 1 ? '' : 's'} ready to upload</span>
                </div>
              </div>
              
              {uploadingImages && (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Uploading your images to secure storage...</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={step === 1 || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            
            {step < 4 ? (
              <button
                onClick={nextStep}
                disabled={
                  (step === 1 && !title.trim()) ||
                  (step === 2 && images.length === 0) ||
                  (step === 3 && (!price || parseFloat(price) <= 0))
                }
                className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors disabled:opacity-50"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || images.length === 0}
                className="flex items-center gap-2 px-8 py-2 bg-primary hover:bg-green-700 text-white font-bold rounded-md shadow-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
                ) : (
                  'Publish Listing'
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
