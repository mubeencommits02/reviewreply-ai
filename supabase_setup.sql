-- Supabase Setup Script: Multi-User SaaS & Profiles

-- 1. Create Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  business_name TEXT,
  manager_name TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING (auth.uid() = id);


-- 2. Update reviews_history (to link replies to specific users)
-- Note: Make sure your reviews_history table exists before running this.
DO $$ 
BEGIN
  IF NOT EXISTS(SELECT * FROM information_schema.columns 
                WHERE table_name='reviews_history' and column_name='user_id') THEN
    ALTER TABLE public.reviews_history ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on reviews_history
ALTER TABLE public.reviews_history ENABLE ROW LEVEL SECURITY;

-- Policies for reviews_history
CREATE POLICY "Users can insert their own history."
ON public.reviews_history FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL); -- Allow nulls for guest generations

CREATE POLICY "Users can view their own history."
ON public.reviews_history FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL); 

-- Note: The global count stat on the front page uses a SELECT * with count exact on this table.
-- If you want social proof to show all records, you can optionally create a public read policy:
-- CREATE POLICY "Global read for count" ON public.reviews_history FOR SELECT USING (true);
