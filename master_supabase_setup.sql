-- ReviewReply AI Master Setup Script (Prometheus E2E Standard)

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Business Profiles Table (The Context Engine)
-- Standardized for GATE 2.1 (Id-Null Gate)
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  industry TEXT,
  usps TEXT,
  preferred_tone TEXT DEFAULT 'Professional',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Business Profiles
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own business profile."
ON public.business_profiles FOR ALL
USING (auth.uid() = user_id);

-- 3. Create Reviews History Table
CREATE TABLE IF NOT EXISTS public.reviews_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  review_text TEXT,
  ai_reply TEXT,
  tone TEXT,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Reviews History
ALTER TABLE public.reviews_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own history."
ON public.reviews_history FOR ALL
USING (auth.uid() = user_id);

-- 4. Global Stats (Helper for landing page / dashboard)
CREATE TABLE IF NOT EXISTS public.global_stats (
  id INTEGER PRIMARY KEY,
  total_replies BIGINT DEFAULT 0
);

-- Seed global stats if not exists
INSERT INTO public.global_stats (id, total_replies) 
VALUES (1, 0) 
ON CONFLICT (id) DO NOTHING;
