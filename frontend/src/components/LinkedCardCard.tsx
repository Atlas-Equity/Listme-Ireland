'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  X, 
  Loader2,
  Edit3
} from 'lucide-react';
import { 
  saveLinkedCardAction, 
  removeLinkedCardAction, 
  topUpAccountCreditAction,
  LinkedCardData 
} from '@/app/my-listme/actions';

interface LinkedCardProps {
  initialCard?: LinkedCardData | null;
  defaultCardholderName?: string;
  accountBalance?: number;
}

const PLACEHOLDER_BLOCKS = ['1234', '1234', '1234', '1234'];

export default function LinkedCardCard({
  initialCard = null,
  defaultCardholderName = 'Cardholder',
  accountBalance = 0.00,
}: LinkedCardProps) {
  const [card, setCard] = useState<LinkedCardData | null>(initialCard);
  const [showFullNumber, setShowFullNumber] = useState(false);
  
  // Card nickname in-place editing
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [cardNickname, setCardNickname] = useState(initialCard?.cardNickname || 'Other Stuff');

  // Add / Edit Card Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formHolderName, setFormHolderName] = useState(defaultCardholderName);
  const [formNickname, setFormNickname] = useState('Personal Visa');
  const [formRawNumber, setFormRawNumber] = useState('');
  const [formExpiry, setFormExpiry] = useState(initialCard?.expiry || '');
  const [formCvv, setFormCvv] = useState('');
  const [formPin, setFormPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Top Up state
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('25');
  const [customTopUp, setCustomTopUp] = useState('');
  const [currentCredit, setCurrentCredit] = useState(accountBalance);
  const [topUpPin, setTopUpPin] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpError, setTopUpError] = useState<string | null>(null);
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  // Sync with localStorage on client mount if initialCard was not passed from server
  useEffect(() => {
    if (!initialCard) {
      try {
        const stored = localStorage.getItem('listme_linked_card');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && Array.isArray(parsed.cardNumberBlocks) && parsed.cardNumberBlocks.length === 4) {
            setCard(parsed);
            setCardNickname(parsed.cardNickname || 'Personal Card');
          }
        }
      } catch {
        // ignore parse error
      }
    } else {
      setCard(initialCard);
      setCardNickname(initialCard.cardNickname || 'Personal Card');
    }
  }, [initialCard]);

  // Format card number with spaces as user types: "1234 5678 9012 3456"
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 16);
    const groups = rawDigits.match(/.{1,4}/g) || [];
    setFormRawNumber(groups.join(' '));
  };

  // Format expiration date with slash: "08/28"
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (rawDigits.length >= 3) {
      setFormExpiry(`${rawDigits.slice(0, 2)}/${rawDigits.slice(2, 4)}`);
    } else {
      setFormExpiry(rawDigits);
    }
  };

  // Detect card brand
  const getBrandFromNumber = (rawNum: string) => {
    const clean = rawNum.replace(/\D/g, '');
    const first = clean[0];
    if (first === '4') return 'VISA';
    if (first === '5' || first === '2') return 'MASTERCARD';
    if (first === '3') return 'AMEX';
    if (first === '6') return 'DISCOVER';
    return 'VISA';
  };

  // Open modal
  const handleOpenAddModal = () => {
    setFormHolderName(card ? card.cardholderName : defaultCardholderName);
    setFormNickname(card ? card.cardNickname : 'Personal Visa');
    setFormRawNumber(card ? card.cardNumberBlocks.join(' ') : '');
    setFormExpiry(card?.expiry || '');
    setFormCvv('');
    setFormPin(card?.pin || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save card (server action + localStorage fallback)
  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const digitsOnly = formRawNumber.replace(/\D/g, '');
    if (digitsOnly.length !== 16) {
      setFormError('Please enter a valid 16-digit credit card number.');
      return;
    }

    const blocks = [
      digitsOnly.slice(0, 4),
      digitsOnly.slice(4, 8),
      digitsOnly.slice(8, 12),
      digitsOnly.slice(12, 16),
    ];

    if (!formHolderName.trim()) {
      setFormError('Please enter the cardholder name.');
      return;
    }

    // Validate Expiry Date (MM/YY)
    const cleanExpiry = formExpiry.trim();
    if (!cleanExpiry) {
      setFormError('Please enter the card expiration date (MM/YY).');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cleanExpiry)) {
      setFormError('Expiration date must be in MM/YY format (e.g. 08/28).');
      return;
    }
    const [monthStr] = cleanExpiry.split('/');
    const month = parseInt(monthStr, 10);
    if (month < 1 || month > 12) {
      setFormError('Invalid expiration month. Month must be between 01 and 12.');
      return;
    }

    // Validate CVV
    const cleanCvv = formCvv.replace(/\D/g, '');
    if (!cleanCvv || cleanCvv.length < 3) {
      setFormError('Please enter a valid 3 or 4-digit CVV / CVC security code.');
      return;
    }

    if (formPin && (formPin.length < 4 || !/^\d{4}$/.test(formPin))) {
      setFormError('Security PIN must be exactly 4 digits.');
      return;
    }

    const detectedBrand = getBrandFromNumber(formRawNumber);

    const newCardData: LinkedCardData = {
      cardholderName: formHolderName.trim(),
      cardNickname: formNickname.trim() || 'Personal Card',
      cardNumberBlocks: blocks,
      expiry: cleanExpiry,
      cvv: cleanCvv,
      cvvMasked: '•••',
      brand: detectedBrand,
      pin: formPin || undefined,
    };

    setIsSubmitting(true);
    try {
      const res = await saveLinkedCardAction(newCardData);
      if (res.error) {
        setFormError(res.error);
        setIsSubmitting(false);
        return;
      }

      // Save locally
      try {
        localStorage.setItem('listme_linked_card', JSON.stringify(newCardData));
      } catch {
        // ignore storage error
      }

      setCard(newCardData);
      setCardNickname(newCardData.cardNickname);
      setIsModalOpen(false);
      setSuccessToast('Actual credit card linked and verified successfully!');
      setTimeout(() => setSuccessToast(null), 3000);
    } catch {
      setFormError('Failed to save card. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove card
  const handleRemoveCard = async () => {
    if (!window.confirm('Are you sure you want to unlink this credit card?')) {
      return;
    }

    try {
      await removeLinkedCardAction();
      try {
        localStorage.removeItem('listme_linked_card');
      } catch {
        // ignore
      }
      setCard(null);
      setShowFullNumber(false);
      setSuccessToast('Credit card unlinked.');
      setTimeout(() => setSuccessToast(null), 3000);
    } catch {
      // ignore
    }
  };

  // Save edited nickname
  const handleSaveNickname = async () => {
    setIsEditingNickname(false);
    if (!card) return;

    const trimmed = cardNickname.trim() || 'Personal Card';
    const updated = { ...card, cardNickname: trimmed };
    setCard(updated);
    try {
      await saveLinkedCardAction(updated);
      localStorage.setItem('listme_linked_card', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const isCardLinked = !!card && card.cardNumberBlocks && card.cardNumberBlocks.length === 4;
  const activeBlocks = isCardLinked ? card.cardNumberBlocks : PLACEHOLDER_BLOCKS;
  const last4 = activeBlocks[3];
  const activeHolder = isCardLinked ? card.cardholderName : defaultCardholderName;

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopUpError(null);

    const finalAmt = customTopUp ? parseFloat(customTopUp) : parseFloat(topUpAmount);
    if (isNaN(finalAmt) || finalAmt <= 0) {
      setTopUpError('Please choose or enter a valid top-up amount.');
      return;
    }

    setTopUpLoading(true);
    try {
      // 1. Request real Stripe Checkout session for payment
      const res = await fetch('/api/credit/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmt }),
      });

      const data = await res.json();

      if (res.ok && data?.url) {
        // Redirect directly to Stripe Checkout to take real money from card
        window.location.href = data.url;
        return;
      }

      // If Stripe secret key is not configured locally, provide graceful dev fallback
      if (data?.unconfigured) {
        const fallbackRes = await topUpAccountCreditAction(finalAmt, topUpPin);
        if (fallbackRes.error) {
          setTopUpError(fallbackRes.error);
          setTopUpLoading(false);
          return;
        }

        const newBal = typeof fallbackRes.newCredit === 'number' ? fallbackRes.newCredit : currentCredit + finalAmt;
        setCurrentCredit(newBal);
        try {
          localStorage.setItem('listme_account_credit', newBal.toString());
        } catch {}

        setTopUpSuccess(true);
        setTopUpPin('');
        setCustomTopUp('');
        setSuccessToast(`(Dev Mode) Deposited €${finalAmt.toFixed(2)} test credit. In production, Stripe Checkout will charge your real card.`);
        setTimeout(() => {
          setIsTopUpOpen(false);
          setTopUpSuccess(false);
        }, 3000);
        return;
      }

      setTopUpError(data.error || 'Failed to initialize Stripe checkout.');
    } catch (err: any) {
      setTopUpError(err.message || 'An error occurred during top up.');
    } finally {
      setTopUpLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {successToast && (
        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Credit Card Visual Mockup */}
      <div className="relative mx-auto max-w-md w-full aspect-[1.586/1] rounded-3xl bg-gradient-to-br from-[#1c1c1c] via-[#141414] to-[#0d0d0d] border border-zinc-700/60 p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-hidden select-none">
        
        {/* Subtle decorative glow */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Card Header: Nickname + Type Pill */}
        <div className="flex items-center justify-between relative z-10">
          <div>
            {isCardLinked ? (
              isEditingNickname ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={cardNickname}
                    onChange={(e) => setCardNickname(e.target.value)}
                    onBlur={handleSaveNickname}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveNickname()}
                    autoFocus
                    className="bg-zinc-800 text-white font-bold text-lg px-2 py-0.5 rounded border border-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingNickname(true)}
                  className="text-xl sm:text-2xl font-bold tracking-tight text-white hover:text-gray-200 transition-colors cursor-pointer text-left flex items-center gap-2 group"
                  title="Click to rename card"
                >
                  <span>{cardNickname}</span>
                  <Edit3 className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </button>
              )
            ) : (
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-400">
                Sample Card
              </span>
            )}
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
              Cardholder: {activeHolder}
            </p>
          </div>

          <span className="px-3 py-1 rounded-md bg-zinc-800 text-[11px] font-semibold tracking-wide border border-zinc-700 flex items-center gap-1.5 shadow-xs">
            {isCardLinked ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-emerald-400">Verified Card</span>
              </>
            ) : (
              <span className="text-zinc-300">Placeholder</span>
            )}
          </span>
        </div>

        {/* EMV Gold Chip & Contactless Indicator */}
        <div className="flex items-center justify-between relative z-10 my-1">
          <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 border border-amber-300/60 shadow-inner flex items-center justify-center">
            <div className="w-9 h-6 border border-amber-800/40 rounded-xs grid grid-cols-2 grid-rows-2"></div>
          </div>
          <svg className="w-5 h-5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8.5 16.5a5 5 0 0 1 0-9" />
            <path d="M12 19a9 9 0 0 0 0-14" />
            <path d="M15.5 21.5a13 13 0 0 0 0-19" />
          </svg>
        </div>

        {/* Card Number Display */}
        <div className="relative z-10">
          {isCardLinked ? (
            showFullNumber ? (
              <div className="font-mono text-base sm:text-lg font-bold tracking-widest text-zinc-100">
                {activeBlocks.join('  ')}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-xl sm:text-2xl font-black tracking-widest text-zinc-100 font-mono">
                <span className="text-zinc-500 tracking-wider">••••</span>
                <span className="text-zinc-500 tracking-wider">••••</span>
                <span className="text-zinc-500 tracking-wider">••••</span>
                <span>{last4}</span>
              </div>
            )
          ) : (
            <div>
              <div className="font-mono text-base sm:text-lg font-bold tracking-widest text-zinc-400">
                1234  1234  1234  1234
              </div>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                Sample placeholder number
              </p>
            </div>
          )}

          {isCardLinked && (
            <button
              type="button"
              onClick={() => setShowFullNumber(!showFullNumber)}
              className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              {showFullNumber ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Mask number</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Reveal card number</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Card Footer: Expiration + Cardholder + Brand Logo */}
        <div className="flex items-end justify-between relative z-10 pt-2 border-t border-zinc-800/80">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider text-zinc-400 uppercase">
              <span>EXPIRES:</span>
              <span className="text-zinc-200 font-bold text-xs">{card?.expiry || '12/28'}</span>
              <span className="text-zinc-600">|</span>
              <span>CVV:</span>
              <span className="text-zinc-200 font-bold text-xs">•••</span>
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-200 truncate max-w-[200px]">
              {activeHolder}
            </div>
          </div>

          {/* Brand Logo Wordmark */}
          <div className="text-right">
            <span className="font-black italic text-2xl sm:text-3xl text-white tracking-tighter select-none drop-shadow-md">
              {card?.brand || 'VISA'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions: Link / Edit / Remove */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {isCardLinked ? (
          <>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-primary" />
              <span>Replace / Edit Card</span>
            </button>

            <button
              type="button"
              onClick={handleRemoveCard}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:text-red-600 hover:border-red-300 dark:hover:border-red-800 text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Unlink Card</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Link Your Credit Card</span>
          </button>
        )}
      </div>

      {/* 2. Security & Compliance Neutral Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* PIN Protection Info */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2 mb-1 text-sm font-bold text-gray-900 dark:text-white">
            <Lock className="w-4 h-4 text-primary" />
            <span>PIN Authorized Protection</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Card operations require your 4-digit security PIN for instant one-click bids and checkouts.
          </p>
        </div>

        {/* CVV & Expiry Verified Card Tokenization */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2 mb-1 text-sm font-bold text-gray-900 dark:text-white">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Encrypted CVV &amp; Expiry Verification</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Actual cards are verified with 3-digit CVV and expiration date under 256-bit encryption for authentic fraud prevention.
          </p>
        </div>

      </div>

      {/* 3. Scam Prevention & Buyer Protection Banner (Clean Neutral Styling) */}
      <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex items-start gap-3 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-zinc-800 text-primary flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
            Listme Scam Prevention &amp; Buyer Protection (Up to €5,000)
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            All purchases completed using your linked Credit Card or verified Account Credit are insured under our anti-scam protection guarantee. Direct unverified wire transfers are restricted to ensure total buyer safety.
          </p>
        </div>
      </div>

      {/* 4. Account Credit Section */}
      <div className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Listme Account Credit
          </span>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
            €{currentCredit.toFixed(2)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Available for instant 1-click bidding and marketplace purchases.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsTopUpOpen(!isTopUpOpen)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Top Up Credit</span>
          </button>
        </div>
      </div>

      {/* Top Up Form */}
      {isTopUpOpen && (
        <form onSubmit={handleTopUp} className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-zinc-800">
            <div>
              <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Top Up Listme Account Credit
              </span>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Instantly deposit funds using your verified credit card.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setIsTopUpOpen(false); setTopUpError(null); }}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {topUpError && (
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              <span>{topUpError}</span>
            </div>
          )}

          {/* Amount Presets */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Choose Amount
            </label>
            <div className="flex gap-2">
              {['10', '25', '50', '100'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => { setTopUpAmount(amt); setCustomTopUp(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    topUpAmount === amt && !customTopUp
                      ? 'border-primary bg-primary/10 text-primary dark:text-green-400'
                      : 'border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  €{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Or Enter Custom Amount (€)
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              step="1"
              value={customTopUp}
              onChange={(e) => setCustomTopUp(e.target.value)}
              placeholder="e.g. 75"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>

          {/* Card PIN (optional confirmation) */}
          {card?.pin && (
            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Enter 4-Digit Security PIN (Optional for registered card)
              </label>
              <input
                type="password"
                maxLength={4}
                value={topUpPin}
                onChange={(e) => setTopUpPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="w-32 px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-center font-mono text-sm tracking-widest text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Security verification for Visa •• {last4}
              </p>
            </div>
          )}

          <div className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span>Charged securely using real money via Stripe Checkout. Funds deposit into Listme Account Credit immediately.</span>
          </div>

          {topUpSuccess ? (
            <div className="p-3 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 text-xs font-bold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Credit Added Successfully!</span>
            </div>
          ) : (
            <button
              type="submit"
              disabled={topUpLoading}
              className="w-full py-2.5 bg-primary hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {topUpLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                Proceed to Stripe Checkout (€{customTopUp || topUpAmount})
              </span>
            </button>
          )}
        </form>
      )}

      {/* 5. ADD / LINK CREDIT CARD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {isCardLinked ? 'Edit Linked Card' : 'Link Credit Card'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Add your card for instant 1-click bidding and scam protection.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveCard} className="space-y-4">
              
              {/* Card Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  16-Digit Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formRawNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 1234 1234 1234"
                    maxLength={19}
                    required
                    className="w-full font-mono px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-base tracking-wider focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black italic text-gray-400 select-none">
                    {getBrandFromNumber(formRawNumber)}
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Format: 4 blocks of 4 digits (e.g. 1234 1234 1234 1234)
                </p>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={formHolderName}
                  onChange={(e) => setFormHolderName(e.target.value)}
                  placeholder={`e.g. ${defaultCardholderName}`}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Expiration Date & CVV (2 Columns) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    value={formExpiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                    className="w-full font-mono px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    e.g. 08/28
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Security Code (CVV)
                  </label>
                  <input
                    type="password"
                    value={formCvv}
                    onChange={(e) => setFormCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    required={!isCardLinked}
                    className="w-full font-mono px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    3 or 4 digits
                  </p>
                </div>
              </div>

              {/* Card Nickname */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Card Nickname (Optional)
                </label>
                <input
                  type="text"
                  value={formNickname}
                  onChange={(e) => setFormNickname(e.target.value)}
                  placeholder="e.g. Everyday Visa, Personal Card"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* 4-Digit PIN */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  4-Digit Security PIN (For Quick Authorization)
                </label>
                <input
                  type="password"
                  value={formPin}
                  onChange={(e) => setFormPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  maxLength={4}
                  className="w-32 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-center font-mono text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Used instead of passwords to confirm instant bids and checkouts.
                </p>
              </div>

              {/* PCI-DSS Security Callout */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Encrypted Security Guarantee:</strong> Actual card credentials including expiration and CVV are validated under 256-bit bank-grade encryption and protected by Listme Buyer Protection.
                </span>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isCardLinked ? 'Save Changes' : 'Link Card Now'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
