-- Create business_profiles table
CREATE TABLE IF NOT EXISTS public.business_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    business_name TEXT,
    industry_type TEXT,
    business_description TEXT,
    preferred_tone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for business_profiles
CREATE POLICY "Users can insert their own business profile."
ON public.business_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own business profile."
ON public.business_profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can view their own business profile."
ON public.business_profiles FOR SELECT
USING (auth.uid() = id);

-- Ensure reviews_history has user_id and RLS
CREATE TABLE IF NOT EXISTS public.reviews_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    review_text TEXT,
    ai_reply TEXT,
    tone TEXT,
    language TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own history."
ON public.reviews_history FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own history."
ON public.reviews_history FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);
