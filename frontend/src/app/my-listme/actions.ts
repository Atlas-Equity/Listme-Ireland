'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { validatePhoneNumber } from '@/utils/phoneValidation';
import { calculateServiceFee } from '@/utils/serviceFee';
import Stripe from 'stripe';

export async function updateAccountType(newType: 'personal' | 'business') {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  if (newType === 'business') {
    const userPhone = user.user_metadata?.phone || user.phone;
    if (!userPhone || !userPhone.trim()) {
      return { 
        error: 'A phone number is required before switching to a Business account.',
        requiresPhone: true 
      };
    }
    const phoneVal = validatePhoneNumber(userPhone);
    if (!phoneVal.isValid) {
      return {
        error: 'A valid phone number format is required before switching to a Business account.',
        requiresPhone: true
      };
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ account_type: newType })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  // Revalidate the profile page so it shows the new data
  revalidatePath('/my-listme');
  return { success: true };
}

export async function upgradeToBusinessWithPhone(phone: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const phoneValidation = validatePhoneNumber(phone);
  if (!phoneValidation.isValid) {
    return { error: phoneValidation.error || 'Please enter a valid phone number format.' };
  }

  const normalizedPhone = phoneValidation.e164 || phone.trim();

  // 1. Update user_metadata with the phone number
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      phone: normalizedPhone,
    }
  });

  if (authError) {
    return { error: authError.message };
  }

  // 2. Upgrade account_type to 'business'
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      account_type: 'business',
      updated_at: new Date().toISOString() 
    })
    .eq('id', user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath('/my-listme');
  revalidatePath('/my-listme', 'layout');
  revalidatePath('/', 'layout');

  return { success: true };
}

export interface ProfileData {
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  location?: string;
}

export async function updateProfileSettings(data: ProfileData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const trimmedUsername = data.username?.trim();
  const trimmedFullName = data.fullName?.trim();
  const trimmedPhone = data.phone?.trim();
  const trimmedLocation = data.location?.trim();
  const avatarUrl = data.avatarUrl?.trim() || '';

  // Validate phone format if provided
  let normalizedPhoneToSave = trimmedPhone;
  if (trimmedPhone) {
    const phoneValidation = validatePhoneNumber(trimmedPhone);
    if (!phoneValidation.isValid) {
      return { error: phoneValidation.error || 'Please enter a valid phone number format.' };
    }
    normalizedPhoneToSave = phoneValidation.e164 || trimmedPhone;
  }

  // Check if current user is a business account
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('id, account_type')
    .eq('id', user.id)
    .maybeSingle();

  if (currentProfile?.account_type === 'business') {
    const existingPhone = user.user_metadata?.phone || user.phone;
    const finalPhone = normalizedPhoneToSave !== undefined ? normalizedPhoneToSave : existingPhone;
    if (!finalPhone) {
      return { error: 'A valid phone number is required for business accounts and cannot be removed.' };
    }
    const phoneValidation = validatePhoneNumber(finalPhone);
    if (!phoneValidation.isValid) {
      return { error: 'A valid phone number format is required for business accounts.' };
    }
  }

  // 1. If username is being changed, verify it is unique
  if (trimmedUsername) {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', trimmedUsername)
      .neq('id', user.id)
      .maybeSingle();

    if (existingProfile) {
      return { error: 'This username is already taken. Please choose another one.' };
    }
  }

  // 2. Update user_metadata in Supabase Auth
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      username: trimmedUsername || undefined,
      full_name: trimmedFullName || undefined,
      avatar_url: avatarUrl || undefined,
      phone: normalizedPhoneToSave !== undefined ? normalizedPhoneToSave : undefined,
      location: trimmedLocation !== undefined ? trimmedLocation : undefined,
    }
  });

  if (authError) {
    console.error('Error updating auth user metadata:', authError);
    return { error: authError.message };
  }

  // 3. Synchronize username and avatar_url with public.profiles
  const profileUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };
  if (trimmedUsername) {
    profileUpdates.username = trimmedUsername;
  }
  // Persist avatar_url directly in database table so it appears across all devices
  profileUpdates.avatar_url = avatarUrl || null;

  const { error: profileError } = await supabase
    .from('profiles')
    .update(profileUpdates)
    .eq('id', user.id);

  if (profileError) {
    console.error('Error updating profiles table:', profileError);
    // If avatar_url column does not exist yet in Supabase schema, fall back gracefully
    if (profileError.message?.includes('avatar_url') || profileError.message?.includes('schema cache')) {
      delete profileUpdates.avatar_url;
      if (Object.keys(profileUpdates).length > 0) {
        await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', user.id);
      }
    }
  }

  revalidatePath('/my-listme');
  revalidatePath('/my-listme', 'layout');
  revalidatePath('/', 'layout');

  return { success: true };
}

export async function uploadAvatarAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const file = formData.get('avatar') as File | null;
  if (!file) {
    return { error: 'No file provided' };
  }

  const isImageMime = file.type?.startsWith('image/');
  const isImageExt = file.name?.match(/\.(jpg|jpeg|png|webp|gif|heic|heif|jfif|bmp)$/i);
  if (!isImageMime && !isImageExt) {
    return { error: 'Uploaded file must be an image' };
  }

  // Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    return { error: 'Image file size must be under 10MB' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `avatars/${user.id}-${Date.now()}.${ext}`;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminClient = serviceRoleKey
    ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
    : supabase;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await adminClient.storage
    .from('listing-images')
    .upload(filePath, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    return { error: uploadError.message };
  }

  const { data: { publicUrl } } = adminClient.storage
    .from('listing-images')
    .getPublicUrl(filePath);

  return { success: true, publicUrl };
}

export interface LinkedCardData {
  id?: string;
  cardholderName: string;
  cardNickname: string;
  cardNumberBlocks: string[];
  expiry?: string;
  cvv?: string;
  cvvMasked?: string;
  brand?: string;
  stripePaymentMethodId?: string;
  isStripeVaulted?: boolean;
  pin?: string;
  isDefault?: boolean;
  cardType?: 'credit' | 'debit';
  funding?: string;
  updatedAt?: string;
}

export async function saveLinkedCardAction(card: LinkedCardData, makeDefault: boolean = false) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  if (!card.cardNumberBlocks || card.cardNumberBlocks.length !== 4) {
    return { error: 'Please provide a complete 16-digit card number.' };
  }

  const cleanBlocks = card.cardNumberBlocks.map(b => b.trim());
  const isMaskedOrVaulted = !!card.stripePaymentMethodId || !!card.isStripeVaulted || cleanBlocks[0].includes('•');
  
  if (!isMaskedOrVaulted) {
    if (cleanBlocks.some(b => b.length !== 4 || !/^\d{4}$/.test(b))) {
      return { error: 'Each card block must contain exactly 4 numeric digits.' };
    }
  }

  if (!card.cardholderName || !card.cardholderName.trim()) {
    return { error: 'Please enter the cardholder name.' };
  }

  // Validate expiration date (MM/YY)
  let cleanExpiry = card.expiry ? card.expiry.trim() : '12/28';
  if (card.expiry && card.expiry.trim()) {
    if (!/^\d{2}\/\d{2}$/.test(cleanExpiry)) {
      return { error: 'Expiration date must be in MM/YY format (e.g. 08/28).' };
    }
    const [monthStr] = cleanExpiry.split('/');
    const month = parseInt(monthStr, 10);
    if (month < 1 || month > 12) {
      return { error: 'Invalid expiration month. Month must be between 01 and 12.' };
    }
  }

  // Detect card brand automatically
  const firstDigit = cleanBlocks[0]?.[0];
  let detectedBrand = card.brand || 'VISA';
  if (firstDigit === '5' || firstDigit === '2') {
    detectedBrand = 'MASTERCARD';
  } else if (firstDigit === '3') {
    detectedBrand = 'AMEX';
  } else if (firstDigit === '6') {
    detectedBrand = 'DISCOVER';
  }

  // Look up / create customer and attach client-tokenized Stripe PaymentMethod
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  let stripeCustomerId = user.user_metadata?.stripe_customer_id;
  let stripePaymentMethodId = card.stripePaymentMethodId;

  if (stripeKey) {
    try {
      const stripe = new Stripe(stripeKey);

      // Verify that card funding is strictly 'credit' for scam prevention & chargeback guarantees
      if (stripePaymentMethodId) {
        try {
          const pm = await stripe.paymentMethods.retrieve(stripePaymentMethodId);
          if (pm.card && pm.card.funding && pm.card.funding !== 'credit') {
            return {
              error: `ListMe strictly requires a Credit Card for seller scam prevention and chargeback protection. The card you entered is a ${pm.card.funding} card.`
            };
          }
        } catch (checkErr: any) {
          console.warn('Stripe card funding check note:', checkErr.message);
        }
      }

      if (!stripeCustomerId && user.email) {
        const existingCustomers = await stripe.customers.list({ email: user.email, limit: 1 });
        if (existingCustomers.data && existingCustomers.data.length > 0) {
          stripeCustomerId = existingCustomers.data[0].id;
        } else {
          const newCust = await stripe.customers.create({
            email: user.email,
            name: card.cardholderName.trim(),
            metadata: { supabase_uid: user.id },
          });
          stripeCustomerId = newCust.id;
        }
      }

      // Attach client-side vaulted PaymentMethod to customer
      if (stripeCustomerId && stripePaymentMethodId) {
        try {
          await stripe.paymentMethods.attach(stripePaymentMethodId, { customer: stripeCustomerId });
          await stripe.customers.update(stripeCustomerId, {
            invoice_settings: { default_payment_method: stripePaymentMethodId },
          });
        } catch (pmErr: any) {
          console.log('Payment method attachment note:', pmErr.message);
        }
      }
    } catch (stripeErr: any) {
      console.warn('Stripe customer check warning:', stripeErr.message);
    }
  }

  const last4 = cleanBlocks[3]?.slice(-4) || '1234';
  const maskedBlocks = ['••••', '••••', '••••', last4];
  const cardId = card.id || `card_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const newCardObj: LinkedCardData = {
    id: cardId,
    cardholderName: card.cardholderName.trim(),
    cardNickname: card.cardNickname?.trim() || `${detectedBrand} ending in ${last4}`,
    cardNumberBlocks: maskedBlocks,
    expiry: cleanExpiry,
    cvvMasked: '•••',
    brand: detectedBrand,
    stripePaymentMethodId: stripePaymentMethodId || undefined,
    isStripeVaulted: !!stripePaymentMethodId,
    pin: card.pin ? card.pin.replace(/\D/g, '').slice(0, 4) : undefined,
    cardType: 'credit',
    funding: 'credit',
    updatedAt: new Date().toISOString(),
  };

  // Support up to TWO cards in user metadata
  const existingCards: LinkedCardData[] = Array.isArray(user.user_metadata?.linked_cards)
    ? [...user.user_metadata.linked_cards]
    : user.user_metadata?.linked_card
      ? [{ ...user.user_metadata.linked_card, id: user.user_metadata.linked_card.id || 'card_primary' }]
      : [];

  const existingIndex = existingCards.findIndex(c => (card.id && c.id === card.id) || (c.cardNumberBlocks?.[3] === last4 && c.brand === detectedBrand));

  let updatedCards: LinkedCardData[];
  if (existingIndex >= 0) {
    // Update existing card
    existingCards[existingIndex] = { ...existingCards[existingIndex], ...newCardObj };
    updatedCards = existingCards;
  } else {
    // Adding a new card
    if (existingCards.length >= 2) {
      return { error: 'Maximum 2 cards allowed in your ListMe wallet. Please remove one before adding another.' };
    }
    if (makeDefault || existingCards.length === 0) {
      updatedCards = [newCardObj, ...existingCards];
    } else {
      updatedCards = [...existingCards, newCardObj];
    }
  }

  // Ensure primary card is set to first card
  const primaryCard = updatedCards[0] || newCardObj;

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      stripe_customer_id: stripeCustomerId || undefined,
      linked_cards: updatedCards,
      linked_card: primaryCard,
    }
  });

  if (authError) {
    console.error('Error saving linked card:', authError);
    return { error: authError.message };
  }

  revalidatePath('/my-listme');
  return { success: true, card: newCardObj, cards: updatedCards };
}

export async function removeLinkedCardAction(cardIdentifier?: string | number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const existingCards: LinkedCardData[] = Array.isArray(user.user_metadata?.linked_cards)
    ? [...user.user_metadata.linked_cards]
    : user.user_metadata?.linked_card
      ? [user.user_metadata.linked_card]
      : [];

  let updatedCards: LinkedCardData[] = [];

  if (typeof cardIdentifier === 'number') {
    updatedCards = existingCards.filter((_, idx) => idx !== cardIdentifier);
  } else if (typeof cardIdentifier === 'string') {
    updatedCards = existingCards.filter(c => c.id !== cardIdentifier);
  } else {
    // Remove all cards
    updatedCards = [];
  }

  const primaryCard = updatedCards.length > 0 ? updatedCards[0] : null;

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      linked_cards: updatedCards,
      linked_card: primaryCard,
    }
  });

  if (authError) {
    console.error('Error removing linked card:', authError);
    return { error: authError.message };
  }

  revalidatePath('/my-listme');
  return { success: true, cards: updatedCards };
}

export async function setDefaultLinkedCardAction(cardIdentifier: string | number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const existingCards: LinkedCardData[] = Array.isArray(user.user_metadata?.linked_cards)
    ? [...user.user_metadata.linked_cards]
    : user.user_metadata?.linked_card
      ? [user.user_metadata.linked_card]
      : [];

  let targetIndex = -1;
  if (typeof cardIdentifier === 'number') {
    targetIndex = cardIdentifier;
  } else {
    targetIndex = existingCards.findIndex(c => c.id === cardIdentifier);
  }

  if (targetIndex < 0 || targetIndex >= existingCards.length) {
    return { error: 'Card not found.' };
  }

  const selectedCard = existingCards[targetIndex];
  const otherCards = existingCards.filter((_, idx) => idx !== targetIndex);
  const reorderedCards = [selectedCard, ...otherCards];

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      linked_cards: reorderedCards,
      linked_card: selectedCard,
    }
  });

  if (authError) {
    return { error: authError.message };
  }

  revalidatePath('/my-listme');
  return { success: true, cards: reorderedCards };
}

export async function topUpAccountCreditAction(amount: number, pin?: string, cardIndex: number = 0) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return { error: 'Please specify a valid top-up amount.' };
  }

  // Custom amount support up to €25,000 for large top ups
  if (amount > 25000) {
    return { error: 'Maximum top-up per transaction is €25,000.00.' };
  }

  const allCards: LinkedCardData[] = Array.isArray(user.user_metadata?.linked_cards) && user.user_metadata.linked_cards.length > 0
    ? user.user_metadata.linked_cards
    : user.user_metadata?.linked_card
      ? [user.user_metadata.linked_card]
      : [];

  const targetCard = allCards[cardIndex] || allCards[0];
  if (!targetCard || !targetCard.cardNumberBlocks || targetCard.cardNumberBlocks.length !== 4) {
    return { error: 'Please link a verified credit card before topping up your account credit.' };
  }

  if (targetCard.pin) {
    if (!pin) {
      return { error: 'Please enter your 4-digit PIN to authorize this top up.' };
    }
    if (pin.trim() !== targetCard.pin.trim()) {
      return { error: 'Incorrect security PIN. Please re-enter your 4-digit PIN.' };
    }
  }

  const currentCredit = typeof user.user_metadata?.account_credit === 'number'
    ? user.user_metadata.account_credit
    : 0;

  const newCredit = Math.round((currentCredit + amount) * 100) / 100;

  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      account_credit: newCredit,
    }
  });

  if (updateError) {
    console.error('Error updating account credit:', updateError);
    return { error: updateError.message };
  }

  revalidatePath('/my-listme');
  return { success: true, newCredit, addedAmount: amount };
}

export async function getUserPaymentStateAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { isLoggedIn: false, credit: 0, linkedCard: null, linkedCards: [], userId: null };
  }

  const cards: LinkedCardData[] = Array.isArray(user.user_metadata?.linked_cards) && user.user_metadata.linked_cards.length > 0
    ? user.user_metadata.linked_cards
    : user.user_metadata?.linked_card
      ? [user.user_metadata.linked_card]
      : [];

  return {
    isLoggedIn: true,
    userId: user.id,
    credit: typeof user.user_metadata?.account_credit === 'number' ? user.user_metadata.account_credit : 0,
    linkedCard: cards[0] || null,
    linkedCards: cards,
  };
}

export async function payForListingAction(
  listingId: string,
  paymentMethod: 'linked_card' | 'account_credit',
  pin?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Please log in to complete your purchase.' };
  }

  if (!listingId) {
    return { error: 'Listing ID is required.' };
  }

  // 1. Fetch listing
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, title, price, seller_id, status')
    .eq('id', listingId)
    .single();

  if (listingError || !listing) {
    return { error: 'Listing not found or no longer available.' };
  }

  if (listing.seller_id === user.id) {
    return { error: 'You cannot purchase your own listing.' };
  }

  if (listing.status === 'closed') {
    return { error: 'This listing has already closed or been sold.' };
  }

  const priceNum = typeof listing.price === 'string'
    ? parseFloat(listing.price.replace(/[^0-9.]/g, '')) || 0
    : (Number(listing.price) || 0);

  const feeCalc = calculateServiceFee(priceNum);
  const totalAmount = feeCalc.total;

  const linkedCard = user.user_metadata?.linked_card;
  const currentCredit = typeof user.user_metadata?.account_credit === 'number'
    ? user.user_metadata.account_credit
    : 0;

  // 2. Validate Payment Method
  if (paymentMethod === 'account_credit') {
    if (currentCredit < totalAmount) {
      return { 
        error: `Insufficient Listme Account Credit. Total is €${totalAmount.toFixed(2)}, but you have €${currentCredit.toFixed(2)}. Please top up or pay using your linked card.` 
      };
    }

    const newCredit = Math.round((currentCredit - totalAmount) * 100) / 100;
    const { error: deductError } = await supabase.auth.updateUser({
      data: {
        account_credit: newCredit,
      }
    });

    if (deductError) {
      return { error: 'Failed to deduct payment from account credit: ' + deductError.message };
    }
  } else if (paymentMethod === 'linked_card') {
    if (!linkedCard || !linkedCard.cardNumberBlocks || linkedCard.cardNumberBlocks.length !== 4) {
      return { error: 'No credit card linked to your account. Please link a card in My Listme first.' };
    }

    if (linkedCard.pin) {
      if (!pin) {
        return { error: 'Please enter your 4-digit security PIN to authorize this card payment.' };
      }
      if (pin.trim() !== linkedCard.pin.trim()) {
        return { error: 'Incorrect 4-digit PIN. Please re-enter your PIN.' };
      }
    }

    // Real card payment via Stripe in production
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const stripeCustomerId = user.user_metadata?.stripe_customer_id;
    let pmId = linkedCard.stripePaymentMethodId;

    if (stripeKey && stripeCustomerId) {
      try {
        const stripe = new Stripe(stripeKey);
        if (!pmId) {
          const cust = await stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer;
          const defaultPm = cust.invoice_settings?.default_payment_method;
          if (defaultPm) {
            pmId = typeof defaultPm === 'string' ? defaultPm : defaultPm.id;
          } else {
            const pms = await stripe.paymentMethods.list({ customer: stripeCustomerId, type: 'card', limit: 1 });
            if (pms.data && pms.data.length > 0) {
              pmId = pms.data[0].id;
            }
          }
        }

        if (pmId) {
          const pi = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100),
            currency: 'eur',
            customer: stripeCustomerId,
            payment_method: pmId,
            off_session: true,
            confirm: true,
            description: `Listme Purchase: ${listing.title}`,
            metadata: {
              listing_id: listing.id,
              buyer_id: user.id,
              seller_id: listing.seller_id,
              total_amount: totalAmount.toString(),
            },
          });

          if (pi.status !== 'succeeded') {
            return { error: 'Card authorization was not completed. Please try another card or payment method.' };
          }
        }
      } catch (stripePayErr: any) {
        return { error: `Card payment failed: ${stripePayErr.message}` };
      }
    }
  } else {
    return { error: 'Unsupported payment method.' };
  }

  // 3. Mark listing as closed (sold)
  await supabase
    .from('listings')
    .update({ status: 'closed' })
    .eq('id', listing.id);

  // 4. Create an automated confirmation message in the chat between buyer & seller
  try {
    const cardLast4 = linkedCard?.cardNumberBlocks?.[3] || '••••';
    const methodDescription = paymentMethod === 'account_credit'
      ? 'Listme Account Credit'
      : `Linked Credit Card (Visa •• ${cardLast4})`;

    const buyerName = user.user_metadata?.full_name || user.user_metadata?.username || 'Buyer';

    // Find or create conversation
    let convId: string | null = null;
    const { data: convs } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listing.id)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .limit(1);

    if (convs && convs.length > 0) {
      convId = convs[0].id;
    } else {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.seller_id,
          last_message: `Payment of €${totalAmount.toFixed(2)} completed!`,
        })
        .select('id')
        .single();
      if (newConv) convId = newConv.id;
    }

    if (convId) {
      const messageText = `Payment confirmed! ${buyerName} purchased "${listing.title}" for €${totalAmount.toFixed(2)} using ${methodDescription}. Covered by Listme Buyer Protection (Up to €5,000). You can now arrange delivery or collection.`;
      await supabase.from('messages').insert({
        conversation_id: convId,
        sender_id: user.id,
        content: messageText,
        is_read: false,
      });
    }
  } catch (msgErr) {
    console.error('Non-critical error logging purchase message:', msgErr);
  }

  revalidatePath(`/listing/${listing.id}`);
  revalidatePath('/my-listme');
  return { success: true, listingId: listing.id, total: totalAmount };
}

export async function purchaseVerificationAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const currentCredit = Number(user.user_metadata?.account_credit || 0);
  const VERIFY_FEE = 19.99;
  let newCredit = currentCredit;
  if (currentCredit >= VERIFY_FEE) {
    newCredit = Math.round((currentCredit - VERIFY_FEE) * 100) / 100;
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      is_verified: true,
      verified_at: new Date().toISOString(),
      verification_type: 'paid',
      account_credit: newCredit,
    }
  });

  if (authError) {
    return { error: authError.message };
  }

  try {
    await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', user.id);
  } catch {
    // metadata is source of truth
  }

  revalidatePath('/my-listme');
  revalidatePath(`/member/${user.id}`);
  return { success: true };
}
