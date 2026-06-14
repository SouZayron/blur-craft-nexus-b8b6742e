
-- Users
CREATE TABLE public.plinko_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  password text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plinko_users TO anon, authenticated;
GRANT ALL ON public.plinko_users TO service_role;
ALTER TABLE public.plinko_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plinko_users_all" ON public.plinko_users FOR ALL USING (true) WITH CHECK (true);

-- Plays (1 per user per day)
CREATE TABLE public.plinko_plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.plinko_users(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  day int NOT NULL CHECK (day BETWEEN 1 AND 15),
  score int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, day)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plinko_plays TO anon, authenticated;
GRANT ALL ON public.plinko_plays TO service_role;
ALTER TABLE public.plinko_plays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plinko_plays_all" ON public.plinko_plays FOR ALL USING (true) WITH CHECK (true);

-- Settings (single row)
CREATE TABLE public.plinko_settings (
  id int PRIMARY KEY,
  is_open boolean NOT NULL DEFAULT true,
  start_date date NOT NULL DEFAULT (now()::date),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plinko_settings TO anon, authenticated;
GRANT ALL ON public.plinko_settings TO service_role;
ALTER TABLE public.plinko_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plinko_settings_all" ON public.plinko_settings FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.plinko_settings (id, is_open, start_date) VALUES (1, true, now()::date);

-- Login function
CREATE OR REPLACE FUNCTION public.plinko_login(p_name text, p_password text)
RETURNS public.plinko_users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u public.plinko_users;
  cleaned text;
  game_open boolean;
BEGIN
  cleaned := trim(p_name);
  IF cleaned IS NULL OR length(cleaned) = 0 THEN RAISE EXCEPTION 'invalid_name'; END IF;
  IF p_password IS NULL OR p_password !~ '^[0-9]{4}$' THEN RAISE EXCEPTION 'invalid_password'; END IF;

  SELECT * INTO u FROM public.plinko_users WHERE lower(name) = lower(cleaned) LIMIT 1;
  IF NOT FOUND THEN
    SELECT is_open INTO game_open FROM public.plinko_settings WHERE id = 1;
    IF NOT COALESCE(game_open, true) THEN RAISE EXCEPTION 'game_closed'; END IF;
    INSERT INTO public.plinko_users(name, password) VALUES (cleaned, p_password) RETURNING * INTO u;
  ELSE
    IF u.password <> p_password THEN RAISE EXCEPTION 'wrong_password'; END IF;
  END IF;
  RETURN u;
END;
$$;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.plinko_users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.plinko_plays;
ALTER PUBLICATION supabase_realtime ADD TABLE public.plinko_settings;
