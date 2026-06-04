
CREATE TABLE public.altavibe_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  coins INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_spin DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.altavibe_users TO anon, authenticated;
GRANT ALL ON public.altavibe_users TO service_role;
ALTER TABLE public.altavibe_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read altavibe" ON public.altavibe_users FOR SELECT USING (true);
CREATE POLICY "Public insert altavibe" ON public.altavibe_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update altavibe" ON public.altavibe_users FOR UPDATE USING (true) WITH CHECK (true);
CREATE OR REPLACE FUNCTION public.altavibe_touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER altavibe_users_updated BEFORE UPDATE ON public.altavibe_users
FOR EACH ROW EXECUTE FUNCTION public.altavibe_touch_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE public.altavibe_users;
