CREATE OR REPLACE FUNCTION public.altavibe_spin_v2(p_name text, p_tz text DEFAULT 'America/Sao_Paulo'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  u public.altavibe_users;
  s public.altavibe_settings;
  tz text := COALESCE(NULLIF(trim(p_tz), ''), 'America/Sao_Paulo');
  now_local timestamp;
  today date;
  total_w numeric := 0;
  r numeric;
  cum numeric := 0;
  seg record;
  chosen public.altavibe_segments;
  idx int := 0;
  win_index int := 0;
  base_points int := 0;
  bonus int := 0;
  total int := 0;
  new_streak int;
  pct numeric := 0;
  max_spins int;
  used int;
  first_of_day boolean := false;
  no_negatives boolean := false;
BEGIN
  BEGIN now_local := (now() AT TIME ZONE tz);
  EXCEPTION WHEN OTHERS THEN tz := 'America/Sao_Paulo'; now_local := (now() AT TIME ZONE tz);
  END;
  today := now_local::date;

  SELECT * INTO s FROM public.altavibe_settings WHERE id = 1;
  IF NOT COALESCE(s.is_open, true) THEN RAISE EXCEPTION 'game_closed'; END IF;
  IF today < s.start_date THEN RAISE EXCEPTION 'game_not_started'; END IF;
  IF today > s.end_date THEN RAISE EXCEPTION 'game_ended'; END IF;

  no_negatives := today < s.start_date + 3;

  max_spins := GREATEST(COALESCE(s.max_spins_per_day, 3), 1);

  SELECT * INTO u FROM public.altavibe_users WHERE lower(name) = lower(trim(p_name)) LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'no_user'; END IF;

  IF u.last_spin IS DISTINCT FROM today THEN
    used := 0;
    first_of_day := true;
  ELSE
    used := COALESCE(u.spins_today, 0);
  END IF;

  IF used >= max_spins THEN RAISE EXCEPTION 'already_spun_today'; END IF;

  SELECT COALESCE(sum(weight), 0) INTO total_w
  FROM public.altavibe_segments
  WHERE weight > 0 AND NOT (id = ANY(u.blocked_segments))
    AND (NOT no_negatives OR points >= 0);
  IF total_w <= 0 THEN RAISE EXCEPTION 'no_segments'; END IF;

  r := random() * total_w;
  FOR seg IN SELECT * FROM public.altavibe_segments ORDER BY position, created_at LOOP
    IF seg.weight <= 0 OR seg.id = ANY(u.blocked_segments) OR (no_negatives AND seg.points < 0) THEN
      idx := idx + 1; CONTINUE;
    END IF;
    cum := cum + seg.weight;
    IF r < cum THEN
      chosen := seg; win_index := idx; EXIT;
    END IF;
    idx := idx + 1;
  END LOOP;

  IF chosen.id IS NULL THEN
    SELECT * INTO chosen FROM public.altavibe_segments WHERE weight > 0 AND (NOT no_negatives OR points >= 0) ORDER BY position LIMIT 1;
    win_index := 0;
  END IF;

  base_points := chosen.points;

  IF first_of_day THEN
    IF u.last_spin = today - 1 THEN new_streak := COALESCE(u.streak, 0) + 1;
    ELSE new_streak := 1; END IF;
  ELSE
    new_streak := COALESCE(u.streak, 1);
  END IF;

  IF base_points > 0 THEN
    SELECT COALESCE(max(bonus_pct), 0) INTO pct
    FROM public.altavibe_streak_rules WHERE days <= new_streak;
    bonus := round(base_points * pct / 100.0);
  ELSE
    bonus := 0;
  END IF;

  total := base_points + bonus;

  UPDATE public.altavibe_users
  SET coins = COALESCE(coins, 0) + total,
      streak = new_streak,
      last_spin = today,
      spins_today = used + 1,
      updated_at = now()
  WHERE id = u.id
  RETURNING * INTO u;

  INSERT INTO public.altavibe_logs(user_id, name, prize, bonus, total, is_boost)
  VALUES (u.id, u.name, base_points, bonus, total, false);

  RETURN jsonb_build_object(
    'win_index', win_index,
    'label', chosen.label,
    'prize', base_points,
    'bonus', bonus,
    'total', total,
    'streak', u.streak,
    'coins', u.coins,
    'last_spin', u.last_spin,
    'spins_today', u.spins_today,
    'spins_left', max_spins - u.spins_today
  );
END;
$function$;