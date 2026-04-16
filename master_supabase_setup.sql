-- ReviewReply AI Master Setup Script

-- 1. Create Profiles Table (for core user data)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Business Profiles Table (The Context Engine)
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  business_name TEXT,
  industry_type TEXT,
  business_description TEXT,
  preferred_tone TEXT DEFAULT 'Professional',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Business Profiles
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own business profile."
ON public.business_profiles FOR ALL
USING (auth.uid() = id);

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

-- 4. Social Proof Helper (Public read for count stats - Optional)
CREATE POLICY "Public read for total count"
ON public.reviews_history FOR SELECT
USING (true);
