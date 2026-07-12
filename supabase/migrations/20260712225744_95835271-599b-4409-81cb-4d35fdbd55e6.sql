
ALTER TABLE public.machine_users ADD COLUMN IF NOT EXISTS block_top boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.machine_spin(p_name text, p_tz text DEFAULT 'America/Sao_Paulo'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  u public.machine_users;
  s public.machine_settings;
  tz text := COALESCE(NULLIF(trim(p_tz),''),'America/Sao_Paulo');
  now_local timestamp;
  today date;
  open_at timestamp := '2026-07-01 00:00:00';
  close_at timestamp := '2026-07-16 00:00:00';
  total_w numeric := 0;
  r numeric;
  cum numeric;
  sym record;
  eff_weight numeric;
  picked jsonb[] := ARRAY[]::jsonb[];
  ids text[] := ARRAY[]::text[];
  values_arr int[] := ARRAY[]::int[];
  i int;
  base_prize int := 0;
  bonus int := 0;
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

  IF u.last_spin_day IS DISTINCT FROM today THEN
    u.spins_today := 0;
    u.last_spin_day := today;
  END IF;

  IF u.spins_today >= s.max_spins_per_day THEN RAISE EXCEPTION 'no_spins_left'; END IF;

  -- total effective weight (zera ruby/seven se block_top)
  SELECT COALESCE(sum(
    CASE WHEN u.block_top AND symbol_id IN ('ruby','seven') THEN 0 ELSE weight END
  ),0) INTO total_w FROM public.machine_symbols WHERE weight > 0;
  IF total_w <= 0 THEN RAISE EXCEPTION 'no_symbols'; END IF;

  FOR i IN 1..3 LOOP
    r := random() * total_w;
    cum := 0;
    FOR sym IN SELECT symbol_id, name, img, value, weight FROM public.machine_symbols WHERE weight > 0 ORDER BY position, symbol_id LOOP
      eff_weight := CASE WHEN u.block_top AND sym.symbol_id IN ('ruby','seven') THEN 0 ELSE sym.weight END;
      IF eff_weight = 0 THEN CONTINUE; END IF;
      cum := cum + eff_weight;
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
    base_prize := values_arr[1];
  ELSE
    base_prize := s.mix_prize;
  END IF;

  IF u.last_play_date = today - 1 THEN new_streak := COALESCE(u.streak,0) + 1;
  ELSIF u.last_play_date = today THEN new_streak := COALESCE(u.streak,1);
  ELSE new_streak := 1; END IF;

  IF new_streak >= 7 THEN bonus := (base_prize * 0.4)::int;
  ELSIF new_streak >= 5 THEN bonus := (base_prize * 0.2)::int;
  ELSE bonus := 0;
  END IF;
  prize := base_prize + bonus;

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
    'base_prize', base_prize,
    'bonus', bonus,
    'is_trinca', is_trinca,
    'coins', u.coins,
    'spins_today', u.spins_today,
    'spins_left', s.max_spins_per_day - u.spins_today,
    'streak', u.streak
  );
END;
$function$;
