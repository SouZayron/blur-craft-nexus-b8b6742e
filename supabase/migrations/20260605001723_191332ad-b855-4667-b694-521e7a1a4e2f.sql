
ALTER TABLE public.altavibe_users ADD COLUMN IF NOT EXISTS password text;

DROP FUNCTION IF EXISTS public.altavibe_login(text);

CREATE OR REPLACE FUNCTION public.altavibe_login(p_name text, p_password text)
RETURNS public.altavibe_users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u public.altavibe_users;
  cleaned text;
BEGIN
  cleaned := trim(p_name);
  IF cleaned IS NULL OR length(cleaned) = 0 THEN RAISE EXCEPTION 'invalid_name'; END IF;
  IF p_password IS NULL OR p_password !~ '^[0-9]{4}$' THEN RAISE EXCEPTION 'invalid_password'; END IF;

  SELECT * INTO u FROM public.altavibe_users WHERE lower(name) = lower(cleaned) LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.altavibe_users(name, password, coins, streak)
    VALUES (cleaned, p_password, 0, 0)
    RETURNING * INTO u;
  ELSE
    IF u.password IS NULL OR u.password = '' THEN
      UPDATE public.altavibe_users SET password = p_password WHERE id = u.id RETURNING * INTO u;
    ELSIF u.password <> p_password THEN
      RAISE EXCEPTION 'wrong_password';
    END IF;
  END IF;
  RETURN u;
END;
$$;

CREATE OR REPLACE FUNCTION public.altavibe_spin(p_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u public.altavibe_users;
  s_open boolean;
  today date := (now() AT TIME ZONE 'UTC')::date;
  r numeric;
  win_index int;
  prize int := 0;
  is_boost boolean := false;
  bonus int := 0;
  total int := 0;
  new_streak int;
BEGIN
  SELECT is_open INTO s_open FROM public.altavibe_settings WHERE id = 1;
  IF NOT COALESCE(s_open, true) THEN RAISE EXCEPTION 'game_closed'; END IF;

  SELECT * INTO u FROM public.altavibe_users WHERE lower(name) = lower(trim(p_name)) LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'no_user'; END IF;
  IF u.last_spin = today THEN RAISE EXCEPTION 'already_spun_today'; END IF;

  -- Weighted random over total 79.5
  -- Order matches client wheel: [5, 10, 20, 30, 40, 50, BOOST]
  r := random() * 79.5;
  IF r < 40 THEN win_index := 0; prize := 5;
  ELSIF r < 60 THEN win_index := 1; prize := 10;
  ELSIF r < 70 THEN win_index := 2; prize := 20;
  ELSIF r < 75 THEN win_index := 3; prize := 30;
  ELSIF r < 78 THEN win_index := 4; prize := 40;
  ELSIF r < 79 THEN win_index := 5; prize := 50;
  ELSE win_index := 6; is_boost := true;
  END IF;

  IF is_boost THEN
    -- Extra spin: do not consume today's spin, no coins gained
    RETURN jsonb_build_object(
      'win_index', win_index, 'prize', 0, 'bonus', 0, 'total', 0,
      'is_boost', true,
      'streak', u.streak, 'coins', u.coins, 'last_spin', u.last_spin
    );
  END IF;

  IF u.last_spin = today - 1 THEN new_streak := COALESCE(u.streak, 0) + 1;
  ELSE new_streak := 1; END IF;

  IF new_streak >= 7 THEN bonus := (prize * 0.5)::int;
  ELSIF new_streak >= 3 THEN bonus := (prize * 0.2)::int;
  END IF;
  total := prize + bonus;

  UPDATE public.altavibe_users
  SET coins = COALESCE(coins,0) + total, streak = new_streak, last_spin = today
  WHERE id = u.id
  RETURNING * INTO u;

  RETURN jsonb_build_object(
    'win_index', win_index, 'prize', prize, 'bonus', bonus, 'total', total,
    'is_boost', false,
    'streak', u.streak, 'coins', u.coins, 'last_spin', u.last_spin
  );
END;
$$;
