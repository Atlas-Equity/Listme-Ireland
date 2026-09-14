import { createClient } from '@supabase/supabase-js';

const INACTIVITY_DAYS = 3;

/**
 * Permanently deletes all conversations, messages, and call logs
 * that have been inactive for more than 3 days.
 * 
 * Inactivity is defined as:
 * - last_message_at < (now - 3 days), OR
 * - (last_message_at IS NULL AND created_at < (now - 3 days))
 * 
 * Only affects chats (conversations and messages). Does not touch listings,
 * reviews, profiles, or bids.
 */
export async function purgeInactiveChats(): Promise<{
  deletedConversations: number;
  deletedMessages: number;
  cutoff: string;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const cutoff = new Date(Date.now() - INACTIVITY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  if (!supabaseUrl || !serviceKey) {
    console.warn('Supabase service credentials not available for chat cleanup.');
    return { deletedConversations: 0, deletedMessages: 0, cutoff };
  }

  try {
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1. Fetch conversations inactive for >= 3 days
    const { data: inactiveConversations, error: fetchErr } = await adminClient
      .from('conversations')
      .select('id, last_message_at, created_at')
      .or(`last_message_at.lt.${cutoff},and(last_message_at.is.null,created_at.lt.${cutoff})`);

    if (fetchErr) {
      console.error('Error finding inactive conversations:', fetchErr);
      return { deletedConversations: 0, deletedMessages: 0, cutoff };
    }

    if (!inactiveConversations || inactiveConversations.length === 0) {
      return { deletedConversations: 0, deletedMessages: 0, cutoff };
    }

    // Check if any of these inactive conversations contain public listing questions
    const { data: qMsgs } = await adminClient
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', inactiveConversations.map((c) => c.id))
      .like('content', 'QUESTION:%');

    const preservedConvIds = new Set((qMsgs || []).map((m) => m.conversation_id));
    const inactiveIds = inactiveConversations
      .map((c) => c.id)
      .filter((id) => !preservedConvIds.has(id));

    if (inactiveIds.length === 0) {
      return { deletedConversations: 0, deletedMessages: 0, cutoff };
    }

    // 2. Delete all messages & call logs belonging to these inactive conversations
    const { count: msgCount, error: msgErr } = await adminClient
      .from('messages')
      .delete({ count: 'exact' })
      .in('conversation_id', inactiveIds);

    if (msgErr) {
      console.error('Error deleting inactive chat messages:', msgErr);
    }

    // 3. Delete the inactive conversations themselves
    const { count: convCount, error: convErr } = await adminClient
      .from('conversations')
      .delete({ count: 'exact' })
      .in('id', inactiveIds);

    if (convErr) {
      console.error('Error deleting inactive conversations:', convErr);
    }

    return {
      deletedConversations: convCount ?? inactiveIds.length,
      deletedMessages: msgCount ?? 0,
      cutoff,
    };
  } catch (err) {
    console.error('Unexpected error during chat cleanup:', err);
    return { deletedConversations: 0, deletedMessages: 0, cutoff };
  }
}
