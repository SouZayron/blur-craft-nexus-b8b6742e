CREATE OR REPLACE FUNCTION public.altavibe_spin(p_name text, p_tz text DEFAULT 'UTC')
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  u public.altavibe_users;
  s_open boolean;
  tz text := COALESCE(NULLIF(trim(p_tz), ''), 'UTC');
  today date;
  r numeric;
  win_index int;
  prize int := 0;
  is_boost boolean := false;
  bonus int := 0;
  total int := 0;
  new_streak int;
BEGIN
  BEGIN
    today := (now() AT TIME ZONE tz)::date;
  EXCEPTION WHEN OTHERS THEN
    tz := 'UTC';
    today := (now() AT TIME ZONE 'UTC')::date;
  END;

  SELECT is_open INTO s_open FROM public.altavibe_settings WHERE id = 1;
  IF NOT COALESCE(s_open, true) THEN RAISE EXCEPTION 'game_closed'; END IF;

  SELECT * INTO u FROM public.altavibe_users WHERE lower(name) = lower(trim(p_name)) LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'no_user'; END IF;
  IF u.last_spin = today THEN RAISE EXCEPTION 'already_spun_today'; END IF;

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
    INSERT INTO public.altavibe_logs(user_id, name, prize, bonus, total, is_boost)
    VALUES (u.id, u.name, 0, 0, 0, true);
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

  INSERT INTO public.altavibe_logs(user_id, name, prize, bonus, total, is_boost)
  VALUES (u.id, u.name, prize, bonus, total, false);

  RETURN jsonb_build_object(
    'win_index', win_index, 'prize', prize, 'bonus', bonus, 'total', total,
    'is_boost', false,
    'streak', u.streak, 'coins', u.coins, 'last_spin', u.last_spin
  );
END;
$function$;