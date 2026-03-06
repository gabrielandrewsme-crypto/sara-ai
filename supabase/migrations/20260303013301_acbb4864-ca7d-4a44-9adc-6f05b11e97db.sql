
-- Table to track audio usage per user per month
CREATE TABLE public.audio_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_year text NOT NULL, -- format: YYYY-MM
  seconds_used integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_year)
);

ALTER TABLE public.audio_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audio usage"
ON public.audio_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage audio usage"
ON public.audio_usage FOR ALL
USING (true)
WITH CHECK (true);

-- Only allow insert/update from edge functions (service role), not from anon
-- Revoke direct insert/update from anon to prevent abuse
CREATE POLICY "Anon cannot insert audio usage"
ON public.audio_usage FOR INSERT
WITH CHECK (false);

CREATE POLICY "Anon cannot update audio usage"
ON public.audio_usage FOR UPDATE
USING (false);
