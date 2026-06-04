
CREATE POLICY "Public can delete altavibe users"
ON public.altavibe_users FOR DELETE
USING (true);

CREATE POLICY "Public can update altavibe settings"
ON public.altavibe_settings FOR UPDATE
USING (true) WITH CHECK (true);
