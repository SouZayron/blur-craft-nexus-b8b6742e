
-- Users
CREATE TABLE public.machine_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  password text NOT NULL,
  coins int NOT NULL DEFAULT 0,
  spins_today int NOT NULL DEFAULT 0,
  last_spin_day date,
  streak int NOT NULL DEFAULT 0,
  last_play_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX machine_users_lname ON public.machine_users(lower(name));
GRANT SELECT ON public.machine_users TO anon, authenticated;
GRANT ALL ON public.machine_users TO service_role;
ALTER TABLE public.machine_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read all users" ON public.machine_users FOR SELECT USING (true);

-- Plays
CREATE TABLE public.machine_plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.machine_users(id) ON DELETE CASCADE,
  name text NOT NULL,
  symbols jsonb NOT NULL,
  prize int NOT NULL DEFAULT 0,
  is_trinca boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX machine_plays_created ON public.machine_plays(created_at DESC);
GRANT SELECT ON public.machine_plays TO anon, authenticated;
GRANT ALL ON public.machine_plays TO service_role;
ALTER TABLE public.machine_plays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read all plays" ON public.machine_plays FOR SELECT USING (true);

-- Settings
CREATE TABLE public.machine_settings (
  id int PRIMARY KEY DEFAULT 1,
  is_open boolean NOT NULL DEFAULT true,
  signups_locked boolean NOT NULL DEFAULT false,
  max_spins_per_day int NOT NULL DEFAULT 3,
  mix_prize int NOT NULL DEFAULT 5,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT machine_settings_singleton CHECK (id = 1)
);
INSERT INTO public.machine_settings(id) VALUES (1) ON CONFLICT DO NOTHING;
GRANT SELECT ON public.machine_settings TO anon, authenticated;
GRANT ALL ON public.machine_settings TO service_role;
ALTER TABLE public.machine_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read settings" ON public.machine_settings FOR SELECT USING (true);

-- Symbols
CREATE TABLE public.machine_symbols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_id text NOT NULL UNIQUE,
  name text NOT NULL,
  img text NOT NULL,
  value int NOT NULL DEFAULT 5,
  weight int NOT NULL DEFAULT 1,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.machine_symbols TO anon, authenticated;
GRANT ALL ON public.machine_symbols TO service_role;
ALTER TABLE public.machine_symbols ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read symbols" ON public.machine_symbols FOR SELECT USING (true);

INSERT INTO public.machine_symbols(symbol_id,name,img,value,weight,position) VALUES
  ('lum','Ameixa','https://gs.xat.com/a_(plum2)_40',10,37,1),
  ('laranja','Laranja','https://gs.xat.com/a_(orange2)_40',15,30,2),
  ('cereja','Cereja','https://gs.xat.com/a_(cherries)_40',20,22,3),
  ('sino','Sino','https://gs.xat.com/a_(slotbar)_40',40,7,4),
  ('seven','Seven','https://gs.xat.com/a_(seven)_40',75,3,5),
  ('ruby','Ruby','https://gs.xat.com/a_(ruby)_40',150,1,6);

-- Login/signup
CREATE OR REPLACE FUNCTION public.machine_login(p_name text, p_password text)
RETURNS public.machine_users
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  u public.machine_users;
  cleaned text;
  locked boolean;
BEGIN
  cleaned := trim(p_name);
  IF cleaned IS NULL OR length(cleaned) = 0 THEN RAISE EXCEPTION 'invalid_name'; END IF;
  IF p_password IS NULL OR p_password !~ '^[0-9]{4}$' THEN RAISE EXCEPTION 'invalid_password'; END IF;

  SELECT * INTO u FROM public.machine_users WHERE lower(name) = lower(cleaned) LIMIT 1;
  IF NOT FOUND THEN
    SELECT signups_locked INTO locked FROM public.machine_settings WHERE id = 1;
    IF COALESCE(locked, false) THEN RAISE EXCEPTION 'signups_locked'; END IF;
    INSERT INTO public.machine_users(name, password) VALUES (cleaned, p_password) RETURNING * INTO u;
  ELSE
    IF u.password <> p_password THEN RAISE EXCEPTION 'wrong_password'; END IF;
  END IF;
  RETURN u;
END;
$$;

-- Spin
CREATE OR REPLACE FUNCTION public.machine_spin(p_name text, p_tz text DEFAULT 'America/Sao_Paulo')
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  u public.machine_users;
  s public.machine_settings;
  tz text := COALESCE(NULLIF(trim(p_tz),''),'America/Sao_Paulo');
  now_local timestamp;
  today date;
  open_at timestamp := '2026-07-01 00:00:00';
  close_at timestamp := '2026-07-16 00:00:00';
  total_w int := 0;
  r numeric;
  cum numeric;
  sym record;
  picked jsonb[] := ARRAY[]::jsonb[];
  ids text[] := ARRAY[]::text[];
  values_arr int[] := ARRAY[]::int[];
  i int;
  prize int := 0;
  is_trinca boolean := false;
  new_spins int;
  new_streak int;
BEGIN
  BEGIN now_local := (now() AT TIME ZONE tz);
  EXCEPTION WHEN OTHERS THEN tz := 'America/Sao_Paulo'; now_local := (now() AT TIME ZONE tz);
  END;
  today := now_local::date;

  IF now_local < open_at THEN RAISE EXCEPTION 'game_not_started'; END IF;
  IF now_local >= close_at THEN RAISE EXCEPTION 'game_ended'; END IF;

  SELECT * INTO s FROM public.machine_settings WHERE id = 1;
  IF NOT COALESCE(s.is_open,true) THEN RAISE EXCEPTION 'game_closed'; END IF;

  SELECT * INTO u FROM public.machine_users WHERE lower(name) = lower(trim(p_name)) LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'no_user'; END IF;

  -- reset spins on new day
  IF u.last_spin_day IS DISTINCT FROM today THEN
    u.spins_today := 0;
    u.last_spin_day := today;
  END IF;

  IF u.spins_today >= s.max_spins_per_day THEN RAISE EXCEPTION 'no_spins_left'; END IF;

  SELECT COALESCE(sum(weight),0) INTO total_w FROM public.machine_symbols WHERE weight > 0;
  IF total_w <= 0 THEN RAISE EXCEPTION 'no_symbols'; END IF;

  FOR i IN 1..3 LOOP
    r := random() * total_w;
    cum := 0;
    FOR sym IN SELECT symbol_id, name, img, value, weight FROM public.machine_symbols WHERE weight > 0 ORDER BY position, symbol_id LOOP
      cum := cum + sym.weight;
      IF r < cum THEN
        picked := picked || jsonb_build_object('id',sym.symbol_id,'name',sym.name,'img',sym.img,'value',sym.value);
        ids := ids || sym.symbol_id;
        values_arr := values_arr || sym.value;
        EXIT;
      END IF;
    END LOOP;
  END LOOP;

  IF ids[1] = ids[2] AND ids[2] = ids[3] THEN
    is_trinca := true;
    prize := values_arr[1];
  ELSE
    prize := s.mix_prize;
  END IF;

  -- streak
  IF u.last_play_date = today - 1 THEN new_streak := COALESCE(u.streak,0) + 1;
  ELSIF u.last_play_date = today THEN new_streak := COALESCE(u.streak,1);
  ELSE new_streak := 1; END IF;

  new_spins := u.spins_today + 1;

  UPDATE public.machine_users
  SET coins = COALESCE(coins,0) + prize,
      spins_today = new_spins,
      last_spin_day = today,
      streak = new_streak,
      last_play_date = today,
      updated_at = now()
  WHERE id = u.id
  RETURNING * INTO u;

  INSERT INTO public.machine_plays(user_id, name, symbols, prize, is_trinca)
  VALUES (u.id, u.name, to_jsonb(picked), prize, is_trinca);

  RETURN jsonb_build_object(
    'symbols', to_jsonb(picked),
    'prize', prize,
    'is_trinca', is_trinca,
    'coins', u.coins,
    'spins_today', u.spins_today,
    'spins_left', s.max_spins_per_day - u.spins_today,
    'streak', u.streak
  );
END;
$$;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.machine_users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.machine_plays;
ALTER PUBLICATION supabase_realtime ADD TABLE public.machine_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.machine_symbols;
