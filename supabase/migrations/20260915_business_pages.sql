-- 1. Create public.business_pages table
CREATE TABLE IF NOT EXISTS public.business_pages (
    id TEXT PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT,
    business_type TEXT DEFAULT 'marketplace',
    opening_hours TEXT DEFAULT 'Open 24 Hours / 7 Days',
    announcement TEXT,
    category TEXT DEFAULT 'Retail & Local Storefront',
    county TEXT DEFAULT 'Dublin',
    phone TEXT,
    email TEXT,
    website TEXT,
    facebook TEXT,
    linkedin TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    plan TEXT DEFAULT 'Commercial Storefront',
    is_verified BOOLEAN DEFAULT FALSE,
    is_hiring BOOLEAN DEFAULT FALSE,
    allow_direct_messaging BOOLEAN DEFAULT TRUE,
    team_members JSONB DEFAULT '[]'::jsonb,
    pending_invites JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_business_pages_slug ON public.business_pages (slug);
CREATE INDEX IF NOT EXISTS idx_business_pages_owner ON public.business_pages (owner_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.business_pages ENABLE ROW LEVEL SECURITY;

-- 4. RLS Security Policies
-- Anyone can read business pages
CREATE POLICY "Public read access for business pages"
ON public.business_pages
FOR SELECT
USING (true);

-- Authenticated users can insert their own pages
CREATE POLICY "Users can insert their own business pages"
ON public.business_pages
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own pages
CREATE POLICY "Owners can update their business pages"
ON public.business_pages
FOR UPDATE
USING (auth.uid() = owner_id);

-- Owners can delete their business pages
CREATE POLICY "Owners can delete their business pages"
ON public.business_pages
FOR DELETE
USING (auth.uid() = owner_id);
