-- ============================================================
-- MESSAGING SYSTEM: conversations + messages tables
-- ============================================================

-- 1. Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid REFERENCES public.listings NOT NULL,
  buyer_id uuid REFERENCES auth.users NOT NULL,
  seller_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(listing_id, buyer_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
    DROP POLICY IF EXISTS "Users can create conversations as buyer" ON public.conversations;
    DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Users can see conversations where they are buyer OR seller
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING ( auth.uid() = buyer_id OR auth.uid() = seller_id );

-- Only buyers create conversations
CREATE POLICY "Users can create conversations as buyer"
  ON conversations FOR INSERT
  WITH CHECK ( auth.uid() = buyer_id );

-- Both parties can update (for updated_at timestamp)
CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING ( auth.uid() = buyer_id OR auth.uid() = seller_id );

-- 2. Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
    DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;
    DROP POLICY IF EXISTS "Users can mark messages as read" ON public.messages;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Users can see messages in conversations they're part of
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- Users can send messages in conversations they're part of
CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- Users can mark messages as read (only recipient, not sender)
CREATE POLICY "Users can mark messages as read"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
    AND sender_id != auth.uid()
  );

-- 3. Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
