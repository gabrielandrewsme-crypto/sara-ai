
-- Add unique constraint on user_id for upsert in subscriptions
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);

-- Allow service role inserts on subscriptions (webhook uses service role key, bypasses RLS)
-- No additional policy needed since service role bypasses RLS
