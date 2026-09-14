'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Edit3,
  Star,
  Check,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { 
  loadStripe, 
  Stripe, 
  StripeCardNumberElement, 
  StripeCardExpiryElement, 
  StripeCardCvcElement 
} from '@stripe/stripe-js';
import { 
  saveLinkedCardAction, 
  removeLinkedCardAction, 
  setDefaultLinkedCardAction,
  topUpAccountCreditAction,
  LinkedCardData 
} from '@/app/my-listme/actions';

const stripePromise = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface LinkedCardProps {
  initialCard?: LinkedCardData | null;
  initialCards?: LinkedCardData[];
  defaultCardholderName?: string;
  accountBalance?: number;
}

const PLACEHOLDER_BLOCKS = ['1234', '1234', '1234', '1234'];

export default function LinkedCardCard({
  initialCard = null,
  initialCards = [],
  defaultCardholderName = 'Cardholder',
  accountBalance = 0.00,
}: LinkedCardProps) {
  // Normalize initial cards list (max 2 cards)
  const initialCardsList: LinkedCardData[] = initialCards.length > 0 
    ? initialCards 
    : (initialCard ? [initialCard] : []);

  const isCardDebit = (c?: LinkedCardData | null) => {
    if (!c) return false;
    const last4 = c.cardNumberBlocks?.[3];
    if (last4 === '0953') return true;
    if (c.funding === 'debit' || c.cardType === 'debit') return true;
    return false;
  };

  const isCardCredit = (c?: LinkedCardData | null) => {
    if (!c) return false;
    if (isCardDebit(c)) return false;
    return c.funding === 'credit' || c.cardType === 'credit';
  };

  const [cards, setCards] = useState<LinkedCardData[]>(initialCardsList);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);
  
  // Card nickname in-place editing
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editNicknameValue, setEditNicknameValue] = useState('');

  // Add / Edit Card Modal & Stripe Elements
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingSecondCard, setIsAddingSecondCard] = useState(false);
  const [formHolderName, setFormHolderName] = useState(defaultCardholderName);
  const [formNickname, setFormNickname] = useState('Personal Credit Card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [stripeObj, setStripeObj] = useState<Stripe | null>(null);
  const [cardNumberElement, setCardNumberElement] = useState<StripeCardNumberElement | null>(null);
  const [cardExpiryElement, setCardExpiryElement] = useState<StripeCardExpiryElement | null>(null);
  const [cardCvcElement, setCardCvcElement] = useState<StripeCardCvcElement | null>(null);
  const cardNumberRef = useRef<HTMLDivElement | null>(null);
  const cardExpiryRef = useRef<HTMLDivElement | null>(null);
  const cardCvcRef = useRef<HTMLDivElement | null>(null);
  const [isStripeReady, setIsStripeReady] = useState(false);

  // Top Up state
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('50');
  const [customTopUp, setCustomTopUp] = useState('');
  const [currentCredit, setCurrentCredit] = useState(accountBalance);
  const [topUpMethod, setTopUpMethod] = useState<'saved_card' | 'stripe_checkout'>('saved_card');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpError, setTopUpError] = useState<string | null>(null);
  const [topUpSuccess, setTopUpSuccess] = useState(false);
  const [isVaulting, setIsVaulting] = useState(false);

  const handleVaultWithStripe = async () => {
    setIsVaulting(true);
    setFormError(null);
    try {
      const res = await fetch('/api/wallet/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: '/my-listme?tab=account' }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setFormError(data?.error || 'Failed to initialize Stripe Vault setup.');
    } catch (err: any) {
      setFormError(err.message || 'Failed to connect to Stripe Vault.');
    } finally {
      setIsVaulting(false);
    }
  };

  // Ensure cards are strictly scoped to the logged-in user from the server props
  useEffect(() => {
    try {
      localStorage.removeItem('listme_linked_cards');
      localStorage.removeItem('listme_linked_card');
    } catch {}
    setCards(initialCardsList);
  }, [initialCards, initialCard]);

  // Open modal to add card (either first or second card)
  const handleOpenAddModal = (asSecondCard = false) => {
    setIsAddingSecondCard(asSecondCard);
    setFormHolderName(defaultCardholderName);
    const hasCredit = cards.some(isCardCredit);
    const hasDebit = cards.some(isCardDebit);
    if (cards.length === 0) {
      setFormNickname('Personal Card');
    } else if (hasCredit) {
      setFormNickname('Secondary Debit Card');
    } else if (hasDebit) {
      setFormNickname('Personal Credit Card');
    } else {
      setFormNickname(asSecondCard ? 'Secondary Card' : 'Primary Credit Card');
    }
    setFormError(null);
    setIsStripeReady(false);
    setIsModalOpen(true);
  };

  // Mount official Stripe Split Elements (Card Number, Expiry, CVC) when modal opens
  useEffect(() => {
    if (!isModalOpen) {
      if (cardNumberElement) {
        try { cardNumberElement.destroy(); } catch {}
        setCardNumberElement(null);
      }
      if (cardExpiryElement) {
        try { cardExpiryElement.destroy(); } catch {}
        setCardExpiryElement(null);
      }
      if (cardCvcElement) {
        try { cardCvcElement.destroy(); } catch {}
        setCardCvcElement(null);
      }
      setIsStripeReady(false);
      return;
    }

    if (!stripePromise) return;

    let isMounted = true;
    stripePromise.then((s) => {
      if (!isMounted || !s) return;
      setStripeObj(s);

      setTimeout(() => {
        if (!isMounted || !cardNumberRef.current || !cardExpiryRef.current || !cardCvcRef.current) return;
        try {
          cardNumberRef.current.innerHTML = '';
          cardExpiryRef.current.innerHTML = '';
          cardCvcRef.current.innerHTML = '';

          const elements = s.elements();
          const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
          const elementStyle = {
            base: {
              color: isDark ? '#ffffff' : '#18181b',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '14px',
              '::placeholder': {
                color: isDark ? '#71717a' : '#a1a1aa',
              },
            },
            invalid: {
              color: '#ef4444',
              iconColor: '#ef4444',
            },
          };

          const numEl = elements.create('cardNumber', {
            style: elementStyle,
            showIcon: true,
            placeholder: '0800 9841 •••• 7461',
          });
          numEl.mount(cardNumberRef.current);
          setCardNumberElement(numEl);

          const expEl = elements.create('cardExpiry', {
            style: elementStyle,
            placeholder: 'MM / YY',
          });
          expEl.mount(cardExpiryRef.current);
          setCardExpiryElement(expEl);

          const cvcEl = elements.create('cardCvc', {
            style: elementStyle,
            placeholder: 'CVC',
          });
          cvcEl.mount(cardCvcRef.current);
          setCardCvcElement(cvcEl);

          setIsStripeReady(true);
        } catch (mountErr) {
          console.warn('Split card element mount note:', mountErr);
        }
      }, 120);
    });

    return () => {
      isMounted = false;
    };
  }, [isModalOpen]);

  // Save card via client-side Stripe tokenization
  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formHolderName.trim()) {
      setFormError('Please enter the cardholder name.');
      return;
    }

    setIsSubmitting(true);

    if (stripeObj && cardNumberElement) {
      try {
        const { paymentMethod, error: stripeErr } = await stripeObj.createPaymentMethod({
          type: 'card',
          card: cardNumberElement,
          billing_details: {
            name: formHolderName.trim(),
          },
        });

        if (stripeErr || !paymentMethod) {
          setFormError(stripeErr?.message || 'Failed to verify card with Stripe.');
          setIsSubmitting(false);
          return;
        }

        const cardData = paymentMethod.card;
        const funding = (cardData?.funding || 'credit').toLowerCase();
        const isDebitInput = funding === 'debit' || funding === 'prepaid';
        const isCreditInput = !isDebitInput;

        // Constraint: Maximum 1 Credit Card and 1 Debit Card in wallet
        const hasExistingCredit = cards.some(isCardCredit);
        const hasExistingDebit = cards.some(isCardDebit);

        if (hasExistingCredit && isCreditInput) {
          setFormError('You already have a Credit Card linked (maximum 1). Your second card must be a Debit Card.');
          setIsSubmitting(false);
          return;
        }

        if (hasExistingDebit && isDebitInput) {
          setFormError('You already have a Debit Card linked (maximum 1). Your second card must be a Credit Card.');
          setIsSubmitting(false);
          return;
        }

        const brand = (cardData?.brand || 'VISA').toUpperCase();
        const last4 = cardData?.last4 || '1234';
        const expMonth = String(cardData?.exp_month || 12).padStart(2, '0');
        const expYear = String(cardData?.exp_year || 28).slice(-2);
        const cardId = `card_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        const newCardData: LinkedCardData = {
          id: cardId,
          cardholderName: formHolderName.trim(),
          cardNickname: formNickname.trim() || `${brand} ${isDebitInput ? 'Debit' : 'Credit'} ending in ${last4}`,
          cardNumberBlocks: ['••••', '••••', '••••', last4],
          expiry: `${expMonth}/${expYear}`,
          cvvMasked: '•••',
          brand,
          stripePaymentMethodId: paymentMethod.id,
          isStripeVaulted: true,
          cardType: isDebitInput ? 'debit' : 'credit',
          funding: isDebitInput ? 'debit' : 'credit',
        };

        const res = await saveLinkedCardAction(newCardData, !isAddingSecondCard);
        if (res.error) {
          setFormError(res.error);
          setIsSubmitting(false);
          return;
        }

        const updatedCards = res.cards || (isAddingSecondCard ? [...cards, newCardData] : [newCardData, ...cards.slice(1)]);
        setCards(updatedCards);

        setIsModalOpen(false);
        setSuccessToast(`${isDebitInput ? 'Debit' : 'Credit'} Card (${brand} ending in ${last4}) securely linked to your wallet!`);
        setTimeout(() => setSuccessToast(null), 3000);
      } catch (err: any) {
        setFormError(err.message || 'Failed to link card with Stripe.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(false);
    setFormError('Stripe security module could not be initialized. Please try again.');
  };

  // Remove card by index or ID
  const handleRemoveCard = async (targetIndex: number) => {
    const targetCard = cards[targetIndex];
    if (!targetCard) return;

    const cardKind = isCardDebit(targetCard) ? 'Debit Card' : 'Credit Card';
    const last4 = targetCard.cardNumberBlocks?.[3] || '••••';
    if (!window.confirm(`Are you sure you want to unlink ${targetCard.cardNickname || cardKind} (ending in ${last4})?`)) {
      return;
    }

    try {
      const res = await removeLinkedCardAction(targetCard.id || targetIndex, last4);
      const remaining = res.cards || cards.filter((_, idx) => idx !== targetIndex);
      setCards(remaining);
      setSelectedCardIndex(0);

      setSuccessToast(`${cardKind} unlinked from wallet.`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err) {
      console.error('Error removing card:', err);
    }
  };

  // Set card as primary
  const handleSetPrimary = async (targetIndex: number) => {
    const targetCard = cards[targetIndex];
    if (!targetCard || targetIndex === 0) return;

    try {
      const res = await setDefaultLinkedCardAction(targetCard.id || targetIndex);
      if (res.cards) {
        setCards(res.cards);
        setSelectedCardIndex(0);
        setSuccessToast(`${targetCard.cardNickname} is now your primary card.`);
        setTimeout(() => setSuccessToast(null), 3000);
      }
    } catch (err) {
      console.error('Error setting primary card:', err);
    }
  };

  // Save edited nickname
  const handleSaveNickname = async (cardItem: LinkedCardData) => {
    setEditingCardId(null);
    const trimmed = editNicknameValue.trim() || cardItem.cardNickname || 'Credit Card';
    const updated = { ...cardItem, cardNickname: trimmed };
    const updatedList = cards.map(c => (c.id === cardItem.id || c.cardNumberBlocks?.[3] === cardItem.cardNumberBlocks?.[3] ? updated : c));
    setCards(updatedList);

    try {
      await saveLinkedCardAction(updated);
    } catch {}
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopUpError(null);

    const finalAmt = customTopUp ? parseFloat(customTopUp) : parseFloat(topUpAmount);
    if (isNaN(finalAmt) || finalAmt < 1) {
      setTopUpError('Minimum top-up amount is €1.00.');
      return;
    }

    if (finalAmt > 25000) {
      setTopUpError('Maximum top-up amount is €25,000.00.');
      return;
    }

    setTopUpLoading(true);
    try {
      const chosenCard = cards[selectedCardIndex] || cards[0];
      const useSavedCard = cards.length > 0 && topUpMethod === 'saved_card';

      const res = await fetch('/api/credit/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmt,
          useSavedCard,
          cardId: chosenCard?.id,
          paymentMethodId: chosenCard?.stripePaymentMethodId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.instant) {
          const newBal = typeof data.newCredit === 'number' ? data.newCredit : currentCredit + finalAmt;
          setCurrentCredit(newBal);
          try {
            localStorage.setItem('listme_account_credit', newBal.toString());
          } catch {}

          setTopUpSuccess(true);
          setCustomTopUp('');
          setSuccessToast(data.message || `Deposited €${finalAmt.toFixed(2)} to your ListMe account!`);
          setTimeout(() => {
            setIsTopUpOpen(false);
            setTopUpSuccess(false);
          }, 3000);
          return;
        }

        if (data.requiresAction && data.url) {
          window.location.href = data.url;
          return;
        }

        if (data.url) {
          if (data.message) {
            setSuccessToast(data.message);
          }
          window.location.href = data.url;
          return;
        }
      }

      if (data?.unconfigured) {
        const fallbackRes = await topUpAccountCreditAction(finalAmt, undefined, selectedCardIndex);
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
        setCustomTopUp('');
        setSuccessToast(`Deposited €${finalAmt.toFixed(2)} test credit.`);
        setTimeout(() => {
          setIsTopUpOpen(false);
          setTopUpSuccess(false);
        }, 3000);
        return;
      }

      setTopUpError(data.error || 'Failed to process top up.');
    } catch (err: any) {
      setTopUpError(err.message || 'An error occurred during top up.');
    } finally {
      setTopUpLoading(false);
    }
  };

  const hasCards = cards.length > 0;
  const canAddSecondCard = cards.length === 1;

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {successToast && (
        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818] text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-between shadow-xs">
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

      {/* Header Banner: 2-Card Capacity & 1 Credit + 1 Debit Policy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <CreditCard className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            Wallet Cards ({cards.length}/2 Linked)
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            • Max: 1 Credit Card &amp; 1 Debit Card
          </span>
          {cards.some(isCardCredit) && (
            <span className="text-[11px] text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-1">
              • <ShieldCheck className="w-3.5 h-3.5 inline" /> Credit Card (Seller Active)
            </span>
          )}
          {cards.some(isCardDebit) && (
            <span className="text-[11px] text-amber-500 dark:text-amber-400 font-semibold flex items-center gap-1">
              • <ShieldAlert className="w-3.5 h-3.5 inline" /> Debit Card (Top-Ups)
            </span>
          )}
        </div>

        {canAddSecondCard && (
          <button
            type="button"
            onClick={() => handleOpenAddModal(true)}
            className="text-xs font-bold text-primary hover:text-green-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {cards.some(isCardCredit) ? 'Add Debit Card' : 'Add Credit Card'}
            </span>
          </button>
        )}
      </div>

      {/* Cards Display Grid (Supports up to 2 cards side-by-side or placeholder) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1 (Primary or Placeholder) */}
        {cards[0] ? (
          <div className="relative w-full rounded-2xl bg-[#141414] border border-zinc-700/80 p-6 sm:p-7 flex flex-col justify-between shadow-lg text-white select-none">
            {/* Header: Nickname & Primary Badge */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {editingCardId === (cards[0].id || 'card_0') ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editNicknameValue}
                        onChange={(e) => setEditNicknameValue(e.target.value)}
                        onBlur={() => handleSaveNickname(cards[0])}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveNickname(cards[0])}
                        autoFocus
                        className="bg-zinc-800 text-white font-bold text-base px-2.5 py-1 rounded-lg border border-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setEditingCardId(cards[0].id || 'card_0'); setEditNicknameValue(cards[0].cardNickname); }}
                      className="text-base sm:text-lg font-bold text-white hover:text-gray-300 flex items-center gap-2 group cursor-pointer text-left"
                      title="Click to rename"
                    >
                      <span className="font-bold">{cards[0].cardNickname}</span>
                      <Edit3 className="w-3.5 h-3.5 shrink-0 text-zinc-500 group-hover:text-zinc-300" />
                    </button>
                  )}
                  <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                    {cards[0].cardholderName}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                  <span className="px-2.5 py-1 rounded-md bg-zinc-800/90 border border-zinc-700 text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 shadow-xs whitespace-nowrap">
                    <Star className="w-3 h-3 fill-emerald-400" /> Primary Card
                  </span>
                  {isCardDebit(cards[0]) ? (
                    <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 shadow-xs whitespace-nowrap">
                      Buying &amp; Top-Ups Only
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 shadow-xs whitespace-nowrap">
                      Seller Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* EMV Chip & Card Type Badge */}
            <div className="mt-6 mb-5 flex items-center justify-between">
              <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 border border-amber-200/50 flex items-center justify-center shadow-xs">
                <div className="w-8 h-5 border border-amber-900/30 rounded-xs grid grid-cols-2 grid-rows-2"></div>
              </div>
              {isCardDebit(cards[0]) ? (
                <span className="px-3 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5 shadow-xs">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Verified Debit Card
                </span>
              ) : (
                <span className="px-3 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Credit Card
                </span>
              )}
            </div>

            {/* Masked Card Number */}
            <div className="my-5 py-1 flex items-center gap-3 sm:gap-4 text-xl sm:text-2xl font-mono font-black tracking-widest text-zinc-100">
              <span className="text-zinc-500">••••</span>
              <span className="text-zinc-500">••••</span>
              <span className="text-zinc-500">••••</span>
              <span>{cards[0].cardNumberBlocks?.[3] || '1234'}</span>
            </div>

            {/* Expiry & Brand Footer */}
            <div className="flex items-end justify-between pt-4 pb-1 border-t border-zinc-800/80 text-xs">
              <div>
                <span className="block text-[10px] text-zinc-400 font-mono tracking-wider">EXPIRES</span>
                <span className="font-bold text-sm text-zinc-200 mt-0.5 block">{cards[0].expiry || '12/28'}</span>
              </div>
              <div className="text-right">
                <span className="font-black italic text-2xl text-white tracking-tight">
                  {cards[0].brand || 'VISA'}
                </span>
              </div>
            </div>

            {/* Debit Card Warning Banner if applicable */}
            {isCardDebit(cards[0]) && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-200/90 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="text-amber-300 font-semibold">Debit Card:</strong> Usable for account credit top-ups and marketplace purchases. Scam prevention policy strictly requires linking a <strong className="text-amber-300 font-semibold">Credit Card</strong> to publish seller listings.
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="mt-5 pt-3.5 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-xs text-zinc-400">Card 1 of {cards.length}</span>
              <button
                type="button"
                onClick={() => handleRemoveCard(0)}
                className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Unlink</span>
              </button>
            </div>
          </div>
        ) : (
          /* Empty Card 1 Placeholder */
          <div className="w-full rounded-2xl bg-[#141414] border border-dashed border-zinc-700 p-8 flex flex-col items-center justify-center text-center shadow-md min-h-[260px]">
            <CreditCard className="w-8 h-8 text-zinc-500 mb-3" />
            <h4 className="text-base font-bold text-white mb-1">No Cards Linked</h4>
            <p className="text-xs text-zinc-400 max-w-xs mb-4">
              Link a payment card to your wallet. You can connect up to 1 Credit Card and 1 Debit Card.
            </p>
            <button
              type="button"
              onClick={() => handleOpenAddModal(false)}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Link Payment Card</span>
            </button>
          </div>
        )}

        {/* CARD 2 (Secondary Card or Add Slot) */}
        {cards[1] ? (
          <div className="relative w-full rounded-2xl bg-[#141414] border border-zinc-700/80 p-6 sm:p-7 flex flex-col justify-between shadow-lg text-white select-none">
            {/* Header: Nickname & Actions */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {editingCardId === (cards[1].id || 'card_1') ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editNicknameValue}
                        onChange={(e) => setEditNicknameValue(e.target.value)}
                        onBlur={() => handleSaveNickname(cards[1])}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveNickname(cards[1])}
                        autoFocus
                        className="bg-zinc-800 text-white font-bold text-base px-2.5 py-1 rounded-lg border border-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setEditingCardId(cards[1].id || 'card_1'); setEditNicknameValue(cards[1].cardNickname); }}
                      className="text-base sm:text-lg font-bold text-white hover:text-gray-300 flex items-center gap-2 group cursor-pointer text-left"
                      title="Click to rename"
                    >
                      <span className="font-bold">{cards[1].cardNickname}</span>
                      <Edit3 className="w-3.5 h-3.5 shrink-0 text-zinc-500 group-hover:text-zinc-300" />
                    </button>
                  )}
                  <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                    {cards[1].cardholderName}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                  <span className="px-2.5 py-1 rounded-md bg-zinc-800/90 border border-zinc-700 text-[10px] font-bold text-zinc-300 shadow-xs whitespace-nowrap">
                    Secondary Card
                  </span>
                  {isCardDebit(cards[1]) ? (
                    <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 shadow-xs whitespace-nowrap">
                      Buying &amp; Top-Ups Only
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 shadow-xs whitespace-nowrap">
                      Seller Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* EMV Chip & Card Type Badge */}
            <div className="mt-6 mb-5 flex items-center justify-between">
              <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 border border-amber-200/50 flex items-center justify-center shadow-xs">
                <div className="w-8 h-5 border border-amber-900/30 rounded-xs grid grid-cols-2 grid-rows-2"></div>
              </div>
              {isCardDebit(cards[1]) ? (
                <span className="px-3 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5 shadow-xs">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Verified Debit Card
                </span>
              ) : (
                <span className="px-3 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Credit Card
                </span>
              )}
            </div>

            {/* Masked Card Number */}
            <div className="my-5 py-1 flex items-center gap-3 sm:gap-4 text-xl sm:text-2xl font-mono font-black tracking-widest text-zinc-100">
              <span className="text-zinc-500">••••</span>
              <span className="text-zinc-500">••••</span>
              <span className="text-zinc-500">••••</span>
              <span>{cards[1].cardNumberBlocks?.[3] || '5678'}</span>
            </div>

            {/* Expiry & Brand Footer */}
            <div className="flex items-end justify-between pt-4 pb-1 border-t border-zinc-800/80 text-xs">
              <div>
                <span className="block text-[10px] text-zinc-400 font-mono tracking-wider">EXPIRES</span>
                <span className="font-bold text-sm text-zinc-200 mt-0.5 block">{cards[1].expiry || '12/28'}</span>
              </div>
              <div className="text-right">
                <span className="font-black italic text-2xl text-white tracking-tight">
                  {cards[1].brand || 'MASTERCARD'}
                </span>
              </div>
            </div>

            {/* Debit Card Warning Banner if applicable */}
            {isCardDebit(cards[1]) && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-200/90 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="text-amber-300 font-semibold">Debit Card:</strong> Usable for account credit top-ups and marketplace purchases. Scam prevention policy strictly requires linking a <strong className="text-amber-300 font-semibold">Credit Card</strong> to publish seller listings.
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="mt-5 pt-3.5 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => handleSetPrimary(1)}
                className="text-primary hover:text-green-400 font-bold flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <Star className="w-3.5 h-3.5" />
                <span>Set as Primary</span>
              </button>
              <button
                type="button"
                onClick={() => handleRemoveCard(1)}
                className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Unlink</span>
              </button>
            </div>
          </div>
        ) : (
          /* Add Second Card Slot (Max 2 cards: 1 Credit + 1 Debit) */
          <div className="w-full rounded-2xl bg-[#141414] border border-dashed border-zinc-700 p-8 flex flex-col items-center justify-center text-center shadow-md min-h-[260px]">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
              <Plus className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">
              {cards.length === 1 && isCardDebit(cards[0])
                ? 'Add Required Credit Card'
                : 'Add Debit Card'}
            </h4>
            <p className="text-xs text-zinc-400 max-w-xs mb-4">
              {cards.length === 1 && isCardDebit(cards[0])
                ? 'Link a verified Credit Card to unlock seller listing privileges (Wallet allows 1 Credit Card & 1 Debit Card).'
                : 'Link a Debit Card for top-ups and everyday marketplace bids (Wallet allows 1 Credit Card & 1 Debit Card).'}
            </p>
            <button
              type="button"
              disabled={cards.length === 0}
              onClick={() => handleOpenAddModal(true)}
              className="px-4 py-2 rounded-xl border border-zinc-600 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>
                {cards.length === 1 && isCardDebit(cards[0]) ? 'Link Credit Card to Sell' : 'Link Debit Card'}
              </span>
            </button>
          </div>
        )}

      </div>

      {/* Security Info Boxes (Flat neutral styling - NO gradients) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818]">
          <div className="flex items-center gap-2 mb-1 text-sm font-bold text-gray-900 dark:text-white">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Mandatory Seller Credit Card Policy</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            A valid Credit Card must be linked to sell any item, job, or service. This guarantees scam chargeback protection and prevents malicious fraudulent accounts.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818]">
          <div className="flex items-center gap-2 mb-1 text-sm font-bold text-gray-900 dark:text-white">
            <Lock className="w-4 h-4 text-primary" />
            <span>Stripe PCI Level 1 Encryption</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Card details are vaulted directly via Stripe. Unmasked card numbers never touch or get stored on ListMe servers.
          </p>
        </div>
      </div>

      {/* Account Credit & Top Up Section */}
      <div className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            ListMe Account Credit
          </span>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
            €{currentCredit.toFixed(2)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Usable for instant 1-click marketplace bids, listing upgrades, and purchases.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsTopUpOpen(!isTopUpOpen)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary hover:bg-green-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Top Up Credit</span>
        </button>
      </div>

      {/* Top Up Form (Supports Custom Amounts up to €25,000 and choice between 2 cards) */}
      {isTopUpOpen && (
        <form onSubmit={handleTopUp} className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#181818] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-zinc-800">
            <div>
              <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Top Up Account Credit
              </span>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Deposit funds directly using your verified card.
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
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-800 dark:text-red-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              <span>{topUpError}</span>
            </div>
          )}

          {/* Quick Amount Buttons */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Select Preset Amount
              </label>
              <span className="text-[11px] text-primary font-medium">
                0% fee on first €50.00
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {['1', '5', '10', '25', '50', '100'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => { setTopUpAmount(amt); setCustomTopUp(''); }}
                  className={`py-2 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    topUpAmount === amt && !customTopUp
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                  }`}
                >
                  €{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input Field (Up to €25,000) */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Or Enter Custom Amount (€)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm font-bold text-gray-400 pointer-events-none">
                €
              </span>
              <input
                type="number"
                min="1"
                max="25000"
                step="1"
                value={customTopUp}
                onChange={(e) => setCustomTopUp(e.target.value)}
                placeholder="Enter custom amount (e.g. €750, €2,500, up to €25,000)"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
          </div>

          {/* Card Selection (if user has 2 cards) */}
          {hasCards && (
            <div className="space-y-2 pt-2">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Select Card to Charge
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cards.map((c, idx) => (
                  <button
                    key={c.id || idx}
                    type="button"
                    onClick={() => { setSelectedCardIndex(idx); setTopUpMethod('saved_card'); }}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      topUpMethod === 'saved_card' && selectedCardIndex === idx
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        topUpMethod === 'saved_card' && selectedCardIndex === idx ? 'border-primary bg-primary' : 'border-gray-400 dark:border-zinc-600'
                      }`}>
                        {topUpMethod === 'saved_card' && selectedCardIndex === idx && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">
                          {c.cardNickname}
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {c.brand} •••• {c.cardNumberBlocks?.[3] || '••••'} {idx === 0 ? '(Primary)' : '(Secondary)'}
                        </p>
                      </div>
                    </div>
                    <CreditCard className="w-4 h-4 text-primary shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Top Up */}
          {topUpSuccess ? (
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 text-xs font-bold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Credit Added Successfully!</span>
            </div>
          ) : (
            <button
              type="submit"
              disabled={topUpLoading}
              className="w-full py-2.5 bg-primary hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {topUpLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {hasCards
                  ? `Top Up €${(customTopUp ? parseFloat(customTopUp) || 0 : parseFloat(topUpAmount) || 0).toFixed(2)} with ${cards[selectedCardIndex]?.cardNickname || 'Saved Card'}`
                  : `Proceed with Top Up (€${(customTopUp ? parseFloat(customTopUp) || 0 : parseFloat(topUpAmount) || 0).toFixed(2)})`}
              </span>
            </button>
          )}
        </form>
      )}

      {/* Link Card Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {cards.length === 0
                    ? 'Link Payment Card'
                    : cards.some(isCardCredit)
                    ? 'Link Debit Card'
                    : 'Link Credit Card'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {cards.length === 0
                    ? 'Wallet capacity: 1 Credit Card and 1 Debit Card allowed.'
                    : cards.some(isCardCredit)
                    ? 'You have 1 Credit Card linked. Your second card must be a Debit Card.'
                    : 'You have 1 Debit Card linked. Your second card must be a Credit Card for seller scam protection.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-800 dark:text-red-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCard} className="space-y-4">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Line 1: Card Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Card Number
                </label>
                <div className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 transition-all">
                  <div ref={cardNumberRef} id="stripe-card-number-element" />
                  {!isStripeReady && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 py-0.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span>Loading secure Stripe encryption...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Line 2: Expiry Date */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Expiry Date (MM / YY)
                </label>
                <div className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 transition-all">
                  <div ref={cardExpiryRef} id="stripe-card-expiry-element" />
                </div>
              </div>

              {/* Line 3: Security Code (CVC) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Security Code (CVC)
                </label>
                <div className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 transition-all">
                  <div ref={cardCvcRef} id="stripe-card-cvc-element" />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-primary shrink-0" />
                  <span>Encrypted by Stripe. ListMe wallet allows 1 Credit Card &amp; 1 Debit Card maximum.</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Card Nickname
                </label>
                <input
                  type="text"
                  value={formNickname}
                  onChange={(e) => setFormNickname(e.target.value)}
                  placeholder={
                    cards.length === 1 && cards.some(isCardCredit)
                      ? 'e.g. Everyday Debit Card'
                      : cards.length === 1 && cards.some(isCardDebit)
                      ? 'e.g. Primary Credit Card'
                      : 'e.g. Personal Card'
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

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
                  <span>
                    {cards.length === 0
                      ? 'Save Card'
                      : cards.some(isCardCredit)
                      ? 'Save Debit Card'
                      : 'Save Credit Card'}
                  </span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
