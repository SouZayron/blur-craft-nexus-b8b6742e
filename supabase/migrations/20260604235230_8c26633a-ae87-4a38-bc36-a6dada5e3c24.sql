
CREATE TABLE IF NOT EXISTS public.altavibe_settings (
  id int PRIMARY KEY DEFAULT 1,
  is_open boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT altavibe_settings_singleton CHECK (id = 1)
);

GRANT SELECT ON public.altavibe_settings TO anon, authenticated;
GRANT ALL ON public.altavibe_settings TO service_role;

ALTER TABLE public.altavibe_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read altavibe settings"
ON public.altavibe_settings FOR SELECT
USING (true);

INSERT INTO public.altavibe_settings (id, is_open) VALUES (1, true)
ON CONFLICT (id) DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.altavibe_settings;

CREATE OR REPLACE FUNCTION public.altavibe_spin(p_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user public.altavibe_users;
  v_today date := (now() AT TIME ZONE 'UTC')::date;
  v_yesterday date := v_today - 1;
  v_prizes int[] := ARRAY[5,10,15,20,25,30,50,10];
  v_idx int;
  v_prize int;
  v_streak int;
  v_bonus int := 0;
  v_total int;
  v_name text;
  v_open boolean;
BEGIN
  SELECT is_open INTO v_open FROM public.altavibe_settings WHERE id = 1;
  IF NOT coalesce(v_open, true) THEN
    RAISE EXCEPTION 'game_closed';
  END IF;

  v_name := btrim(coalesce(p_name,''));
  IF length(v_name) = 0 OR length(v_name) > 20 THEN
    RAISE EXCEPTION 'invalid_name';
  END IF;

  SELECT * INTO v_user FROM public.altavibe_users WHERE name = v_name;
  IF NOT FOUND THEN
    INSERT INTO public.altavibe_users(name, coins, streak, last_spin)
    VALUES (v_name, 0, 0, NULL)
    RETURNING * INTO v_user;
  END IF;

  IF v_user.last_spin = v_today THEN
    RAISE EXCEPTION 'already_spun_today';
  END IF;

  v_idx := floor(random() * array_length(v_prizes,1))::int;
  v_prize := v_prizes[v_idx + 1];

  IF v_user.last_spin = v_yesterday THEN
    v_streak := coalesce(v_user.streak,0) + 1;
  ELSE
    v_streak := 1;
  END IF;

  IF v_streak >= 7 THEN
    v_bonus := round(v_prize * 0.5);
  ELSIF v_streak >= 3 THEN
    v_bonus := round(v_prize * 0.2);
  END IF;

  v_total := v_prize + v_bonus;

  UPDATE public.altavibe_users
  SET coins = coalesce(coins,0) + v_total,
      streak = v_streak,
      last_spin = v_today
  WHERE id = v_user.id
  RETURNING * INTO v_user;

  RETURN jsonb_build_object(
    'win_index', v_idx,
    'prize', v_prize,
    'bonus', v_bonus,
    'total', v_total,
    'streak', v_streak,
    'coins', v_user.coins,
    'last_spin', v_user.last_spin
  );
END;
$function$;
