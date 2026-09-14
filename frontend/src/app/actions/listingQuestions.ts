'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

export interface ListingQuestion {
  id: string;
  listingId: string;
  buyerId: string;
  buyerUsername: string;
  buyerAvatarUrl?: string;
  question: string;
  createdAt: string;
  conversationId?: string;
  answer?: {
    text: string;
    sellerId: string;
    sellerUsername: string;
    sellerAvatarUrl?: string;
    answeredAt: string;
  };
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'listing_questions.json');

function ensureDataFile(): ListingQuestion[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
      return [];
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.warn('Error reading listing_questions.json:', err);
    return [];
  }
}

function saveDataFile(questions: ListingQuestion[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(questions, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving listing_questions.json:', err);
  }
}

/**
 * Fetch all public questions and seller answers for a listing.
 */
export async function getListingQuestions(listingId: string): Promise<ListingQuestion[]> {
  try {
    const fileQuestions = ensureDataFile().filter(q => q.listingId === listingId);
    
    // Check Supabase messages
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return fileQuestions;
    }

    const admin = createAdminClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data: convs } = await admin
      .from('conversations')
      .select('id')
      .eq('listing_id', listingId);

    if (!convs || convs.length === 0) {
      return fileQuestions;
    }

    const convIds = convs.map(c => c.id);
    const { data: messages } = await admin
      .from('messages')
      .select('id, conversation_id, sender_id, content, created_at')
      .in('conversation_id', convIds)
      .or('content.like.QUESTION:%,content.like.ANSWER:%')
      .order('created_at', { ascending: true });

    if (!messages || messages.length === 0) {
      return fileQuestions;
    }

    const questionMap = new Map<string, ListingQuestion>();
    fileQuestions.forEach(q => questionMap.set(q.id, q));

    // First pass: collect questions
    for (const msg of messages) {
      if (msg.content.startsWith('QUESTION:')) {
        try {
          const payload: ListingQuestion = JSON.parse(msg.content.slice(9));
          if (payload && payload.id) {
            payload.conversationId = msg.conversation_id;
            questionMap.set(payload.id, payload);
          }
        } catch {
          // Skip malformed
        }
      }
    }

    // Second pass: attach answers from ANSWER: messages
    for (const msg of messages) {
      if (msg.content.startsWith('ANSWER:')) {
        try {
          const payload = JSON.parse(msg.content.slice(7));
          if (payload && payload.questionId && questionMap.has(payload.questionId)) {
            const target = questionMap.get(payload.questionId)!;
            if (!target.answer || new Date(payload.answeredAt).getTime() >= new Date(target.answer.answeredAt || 0).getTime()) {
              target.answer = {
                text: payload.text,
                sellerId: payload.sellerId,
                sellerUsername: payload.sellerUsername,
                sellerAvatarUrl: payload.sellerAvatarUrl,
                answeredAt: payload.answeredAt,
              };
            }
          }
        } catch {
          // Skip malformed
        }
      }
    }

    return Array.from(questionMap.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } catch (err) {
    console.error('getListingQuestions error:', err);
    return [];
  }
}

/**
 * Buyers ask 1 question on a listing.
 * TradeMe model: public to everyone, notified in chat.
 */
export async function askListingQuestionAction({
  listingId,
  questionText,
}: {
  listingId: string;
  questionText: string;
}): Promise<{ success: boolean; error?: string; question?: ListingQuestion }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: 'Please sign in to ask a question.' };
    }

    const trimmedQuestion = questionText.trim();
    if (!trimmedQuestion || trimmedQuestion.length < 5) {
      return { success: false, error: 'Please write a question with at least 5 characters.' };
    }

    if (trimmedQuestion.length > 500) {
      return { success: false, error: 'Question is too long (maximum 500 characters).' };
    }

    // 1. Fetch listing
    const { data: listing, error: listErr } = await supabase
      .from('listings')
      .select('id, title, seller_id')
      .eq('id', listingId)
      .single();

    if (listErr || !listing) {
      return { success: false, error: 'Listing not found.' };
    }

    if (listing.seller_id === user.id) {
      return { success: false, error: 'You cannot ask a question on your own listing.' };
    }

    // 2. Check if buyer already asked a question for this listing (TradeMe 1-question rule)
    const currentQuestions = ensureDataFile();
    const alreadyAsked = currentQuestions.some(
      q => q.listingId === listingId && q.buyerId === user.id
    );

    if (alreadyAsked) {
      return {
        success: false,
        error: 'You have already asked a question on this listing. Buyers are limited to 1 question per listing.',
      };
    }

    // 3. Get buyer's username/name and avatar
    const buyerUsername = user.user_metadata?.username || user.email?.split('@')[0] || 'Buyer';
    const buyerAvatarUrl = user.user_metadata?.avatar_url || '';

    const newQuestion: ListingQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      listingId,
      buyerId: user.id,
      buyerUsername,
      buyerAvatarUrl,
      question: trimmedQuestion,
      createdAt: new Date().toISOString(),
    };

    // 4. Save to conversation & chat in Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey) {
      const admin = createAdminClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false },
      });

      // Find or create conversation between buyer and seller
      const { data: existingConvs } = await admin
        .from('conversations')
        .select('id')
        .eq('listing_id', listingId)
        .or(`and(buyer_id.eq.${user.id},seller_id.eq.${listing.seller_id}),and(buyer_id.eq.${listing.seller_id},seller_id.eq.${user.id})`)
        .limit(1);

      let conversationId: string;
      const now = new Date().toISOString();
      const snippetText = `Listing Question: "${trimmedQuestion.slice(0, 50)}${trimmedQuestion.length > 50 ? '...' : ''}"`;

      if (existingConvs && existingConvs.length > 0) {
        conversationId = existingConvs[0].id;
        await admin
          .from('conversations')
          .update({
            last_message: snippetText,
            last_message_at: now,
            updated_at: now,
          })
          .eq('id', conversationId);
      } else {
        const { data: newConv } = await admin
          .from('conversations')
          .insert({
            listing_id: listingId,
            buyer_id: user.id,
            seller_id: listing.seller_id,
            last_message: snippetText,
            last_message_at: now,
            updated_at: now,
          })
          .select('id')
          .single();
        conversationId = newConv?.id || '';
      }

      newQuestion.conversationId = conversationId;

      if (conversationId) {
        // Insert message with QUESTION prefix
        await admin.from('messages').insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: `QUESTION:${JSON.stringify(newQuestion)}`,
          is_read: false,
        });

        // Realtime broadcast to seller so they are instantly notified
        try {
          await admin.channel(`user_call_signals_${listing.seller_id}`).send({
            type: 'broadcast',
            event: 'new_message',
            payload: {
              id: newQuestion.id,
              conversation_id: conversationId,
              sender_id: user.id,
              sender_name: buyerUsername,
              sender_avatar: buyerAvatarUrl,
              content: `QUESTION:${JSON.stringify(newQuestion)}`,
              listing_id: listingId,
              listing_title: listing.title,
            },
          });
        } catch (bErr) {
          console.error('Realtime broadcast error:', bErr);
        }
      }
    }

    // 5. Persist to local JSON file store
    currentQuestions.push(newQuestion);
    saveDataFile(currentQuestions);

    revalidatePath(`/listing/${listingId}`);
    revalidatePath('/messages');

    return { success: true, question: newQuestion };
  } catch (err: any) {
    console.error('askListingQuestionAction error:', err);
    return { success: false, error: err?.message || 'Failed to submit question.' };
  }
}

/**
 * Seller answers a public listing question.
 * Persists directly into Supabase database messages and updates conversation.
 */
export async function answerListingQuestionAction({
  listingId,
  questionId,
  answerText,
}: {
  listingId: string;
  questionId: string;
  answerText: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: 'Please sign in to answer questions.' };
    }

    const trimmedAnswer = answerText.trim();
    if (!trimmedAnswer) {
      return { success: false, error: 'Please enter an answer.' };
    }

    // Verify user is seller of this listing
    const { data: listing } = await supabase
      .from('listings')
      .select('id, seller_id, title')
      .eq('id', listingId)
      .single();

    if (!listing || listing.seller_id !== user.id) {
      return { success: false, error: 'Only the seller of this listing can answer questions.' };
    }

    const sellerUsername = user.user_metadata?.username || user.email?.split('@')[0] || 'Seller';
    const sellerAvatarUrl = user.user_metadata?.avatar_url || '';

    const answerData = {
      text: trimmedAnswer,
      sellerId: user.id,
      sellerUsername,
      sellerAvatarUrl,
      answeredAt: new Date().toISOString(),
    };

    // Update in Supabase messages
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey) {
      const admin = createAdminClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false },
      });

      // Find conversations for this listing
      const { data: convs } = await admin
        .from('conversations')
        .select('id, buyer_id, seller_id')
        .eq('listing_id', listingId);

      const convIds = (convs || []).map(c => c.id);

      let targetMsg: any = null;
      let targetConvId: string | null = null;
      let buyerId: string | null = null;

      if (convIds.length > 0) {
        const { data: msgs } = await admin
          .from('messages')
          .select('id, conversation_id, content')
          .in('conversation_id', convIds)
          .like('content', 'QUESTION:%');

        if (msgs) {
          for (const m of msgs) {
            try {
              const parsed = JSON.parse(m.content.slice(9));
              if (parsed && parsed.id === questionId) {
                targetMsg = m;
                targetConvId = m.conversation_id;
                buyerId = parsed.buyerId;
                break;
              }
            } catch {}
          }
        }
      }

      if (targetMsg) {
        // 1. Permanently update original QUESTION message payload so it holds answer
        try {
          const parsed = JSON.parse(targetMsg.content.slice(9));
          parsed.answer = answerData;
          await admin
            .from('messages')
            .update({ content: `QUESTION:${JSON.stringify(parsed)}` })
            .eq('id', targetMsg.id);
        } catch (e) {
          console.error('Error updating question message:', e);
        }

        // 2. Insert public ANSWER message into the conversation thread
        await admin.from('messages').insert({
          conversation_id: targetConvId,
          sender_id: user.id,
          content: `ANSWER:${JSON.stringify({
            questionId,
            listingId,
            ...answerData,
          })}`,
          is_read: false,
        });

        // 3. Update conversation last message snippet
        await admin
          .from('conversations')
          .update({
            last_message: `Answer: "${trimmedAnswer.slice(0, 50)}${trimmedAnswer.length > 50 ? '...' : ''}"`,
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetConvId);

        // 4. Send Realtime broadcast to buyer
        if (buyerId) {
          try {
            await admin.channel(`user_call_signals_${buyerId}`).send({
              type: 'broadcast',
              event: 'new_message',
              payload: {
                id: `ans_${Date.now()}`,
                conversation_id: targetConvId,
                sender_id: user.id,
                sender_name: sellerUsername,
                sender_avatar: sellerAvatarUrl,
                content: `ANSWER:${JSON.stringify({
                  questionId,
                  listingId,
                  ...answerData,
                })}`,
                listing_id: listingId,
              },
            });
          } catch (bErr) {
            console.error('Broadcast to buyer error:', bErr);
          }
        }
      }
    }

    // 5. Update local JSON file store as fallback
    const currentQuestions = ensureDataFile();
    const targetQ = currentQuestions.find(q => q.id === questionId);
    if (targetQ) {
      targetQ.answer = answerData;
      saveDataFile(currentQuestions);
    }

    revalidatePath(`/listing/${listingId}`);
    revalidatePath('/messages');

    return { success: true };
  } catch (err: any) {
    console.error('answerListingQuestionAction error:', err);
    return { success: false, error: err?.message || 'Failed to submit answer.' };
  }
}
