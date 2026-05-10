-- Enterprise Update: Step 1 - Cognitive Layer Enhancements
-- Adds sentiment analysis and categorization fields to reviews_history

-- 1. Update reviews_history table
ALTER TABLE public.reviews_history 
ADD COLUMN IF NOT EXISTS sentiment FLOAT,
ADD COLUMN IF NOT EXISTS issue_category TEXT;

-- 2. Add global_stats if not exists (referenced in Dashboard)
CREATE TABLE IF NOT EXISTS public.global_stats (
    id SERIAL PRIMARY KEY,
    total_replies INTEGER DEFAULT 0
);

-- Seed global_stats if empty
INSERT INTO public.global_stats (id, total_replies)
SELECT 1, 0
WHERE NOT EXISTS (SELECT 1 FROM public.global_stats WHERE id = 1);

-- 3. Enable RLS and Policies for stats
ALTER TABLE public.global_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on global_stats" 
ON public.global_stats FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated update on global_stats" 
ON public.global_stats FOR UPDATE 
USING (auth.role() = 'authenticated');
