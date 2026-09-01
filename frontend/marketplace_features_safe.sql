-- 1. Add ends_at to listings
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS ends_at timestamp with time zone;

-- 2. Create wishlists table
CREATE TABLE IF NOT EXISTS public.wishlists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  listing_id uuid REFERENCES public.listings NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, listing_id) -- A user can only wishlist a listing once
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Note: Policies might already exist, so we drop them first to ensure clean recreation if run multiple times
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own wishlists" ON public.wishlists;
    DROP POLICY IF EXISTS "Users can insert into their own wishlists" ON public.wishlists;
    DROP POLICY IF EXISTS "Users can delete their own wishlists" ON public.wishlists;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Users can view their own wishlists"
  ON wishlists FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert into their own wishlists"
  ON wishlists FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own wishlists"
  ON wishlists FOR DELETE
  USING ( auth.uid() = user_id );

-- 3. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid REFERENCES public.listings NOT NULL,
  reviewer_id uuid REFERENCES auth.users NOT NULL,
  reviewee_id uuid REFERENCES auth.users NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(listing_id, reviewer_id) -- A user can only review a listing transaction once
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
    DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Reviews are public
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own reviews"
  ON reviews FOR INSERT
  WITH CHECK ( auth.uid() = reviewer_id );

-- 4. Create bids table
CREATE TABLE IF NOT EXISTS public.bids (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid REFERENCES public.listings NOT NULL,
  bidder_id uuid REFERENCES auth.users NOT NULL,
  amount numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Bids are viewable by everyone" ON public.bids;
    DROP POLICY IF EXISTS "Users can place bids" ON public.bids;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Bids are public (so everyone can see the current highest bid)
CREATE POLICY "Bids are viewable by everyone"
  ON bids FOR SELECT
  USING ( true );

CREATE POLICY "Users can place bids"
  ON bids FOR INSERT
  WITH CHECK ( auth.uid() = bidder_id );
