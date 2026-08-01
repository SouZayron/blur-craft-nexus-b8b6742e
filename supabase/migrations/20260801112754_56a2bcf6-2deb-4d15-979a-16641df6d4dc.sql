
CREATE TABLE public.altavibe_segments (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  points integer not null default 0,
  weight numeric not null default 1,
  color text not null default '#8b3fbf',
  text_color text not null default '#ffffff',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.altavibe_segments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.altavibe_segments TO anon;
GRANT ALL ON public.altavibe_segments TO service_role;
ALTER TABLE public.altavibe_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "segments readable" ON public.altavibe_segments FOR SELECT USING (true);
CREATE POLICY "segments writable" ON public.altavibe_segments FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.altavibe_streak_rules (
  id uuid primary key default gen_random_uuid(),
  days integer not null,
  bonus_pct numeric not null default 0,
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.altavibe_streak_rules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.altavibe_streak_rules TO anon;
GRANT ALL ON public.altavibe_streak_rules TO service_role;
ALTER TABLE public.altavibe_streak_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "streaks readable" ON public.altavibe_streak_rules FOR SELECT USING (true);
CREATE POLICY "streaks writable" ON public.altavibe_streak_rules FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.altavibe_users ADD COLUMN IF NOT EXISTS blocked_segments uuid[] not null default '{}';
ALTER TABLE public.altavibe_settings ADD COLUMN IF NOT EXISTS start_date date not null default '2026-08-01';
ALTER TABLE public.altavibe_settings ADD COLUMN IF NOT EXISTS end_date date not null default '2026-08-31';
ALTER TABLE public.altavibe_settings ADD COLUMN IF NOT EXISTS inverted boolean not null default true;

INSERT INTO public.altavibe_segments (label, points, weight, color, text_color, position) VALUES
  ('10', 10, 40, '#b59ad6', '#1a0d2e', 0),
  ('25', 25, 20, '#7a4bcc', '#ffffff', 1),
  ('50', 50, 12, '#d99ee6', '#1a0d2e', 2),
  ('100', 100, 8, '#5a2e9e', '#ffffff', 3),
  ('200', 200, 5, '#c47ad9', '#1a0d2e', 4),
  ('500', 500, 3, '#8b3fbf', '#ffffff', 5),
  ('-50', -50, 8, '#2fbf7a', '#06210f', 6),
  ('-100', -100, 4, '#1e9e5f', '#ffffff', 7);

INSERT INTO public.altavibe_streak_rules (days, bonus_pct) VALUES (3, -20), (7, -50);

CREATE OR REPLACE FUNCTION public.altavibe_spin_v2(p_name text, p_tz text DEFAULT 'America/Sao_Paulo')
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
BEGIN
  BEGIN now_local := (now() AT TIME ZONE tz);
  EXCEPTION WHEN OTHERS THEN tz := 'America/Sao_Paulo'; now_local := (now() AT TIME ZONE tz);
  END;
  today := now_local::date;

  SELECT * INTO s FROM public.altavibe_settings WHERE id = 1;
  IF NOT COALESCE(s.is_open, true) THEN RAISE EXCEPTION 'game_closed'; END IF;
  IF today < s.start_date THEN RAISE EXCEPTION 'game_not_started'; END IF;
  IF today > s.end_date THEN RAISE EXCEPTION 'game_ended'; END IF;

  SELECT * INTO u FROM public.altavibe_users WHERE lower(name) = lower(trim(p_name)) LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'no_user'; END IF;
  IF u.last_spin = today THEN RAISE EXCEPTION 'already_spun_today'; END IF;

  SELECT COALESCE(sum(weight), 0) INTO total_w
  FROM public.altavibe_segments
  WHERE weight > 0 AND NOT (id = ANY(u.blocked_segments));
  IF total_w <= 0 THEN RAISE EXCEPTION 'no_segments'; END IF;

  r := random() * total_w;
  FOR seg IN SELECT * FROM public.altavibe_segments ORDER BY position, created_at LOOP
    IF seg.weight <= 0 OR seg.id = ANY(u.blocked_segments) THEN
      idx := idx + 1; CONTINUE;
    END IF;
    cum := cum + seg.weight;
    IF r < cum THEN
      chosen := seg; win_index := idx; EXIT;
    END IF;
    idx := idx + 1;
  END LOOP;

  IF chosen.id IS NULL THEN
    SELECT * INTO chosen FROM public.altavibe_segments WHERE weight > 0 ORDER BY position LIMIT 1;
    win_index := 0;
  END IF;

  base_points := chosen.points;

  IF u.last_spin = today - 1 THEN new_streak := COALESCE(u.streak, 0) + 1;
  ELSE new_streak := 1; END IF;

  SELECT COALESCE(max(bonus_pct), 0) INTO pct
  FROM public.altavibe_streak_rules WHERE days <= new_streak;

  bonus := round(base_points * pct / 100.0);
  total := base_points + bonus;

  UPDATE public.altavibe_users
  SET coins = COALESCE(coins, 0) + total, streak = new_streak, last_spin = today, updated_at = now()
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
    'last_spin', u.last_spin
  );
END;
$function$;
