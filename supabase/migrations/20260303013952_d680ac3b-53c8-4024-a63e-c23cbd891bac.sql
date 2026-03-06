CREATE POLICY "Admins can view all audio usage"
ON public.audio_usage FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));