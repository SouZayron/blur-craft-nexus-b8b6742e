
ALTER TABLE public.altavibe_settings ADD COLUMN IF NOT EXISTS signups_locked boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.altavibe_login(p_name text, p_password text)
 RETURNS altavibe_users
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  u public.altavibe_users;
  cleaned text;
  locked boolean;
BEGIN
  cleaned := trim(p_name);
  IF cleaned IS NULL OR length(cleaned) = 0 THEN RAISE EXCEPTION 'invalid_name'; END IF;
  IF p_password IS NULL OR p_password !~ '^[0-9]{4}$' THEN RAISE EXCEPTION 'invalid_password'; END IF;

  SELECT * INTO u FROM public.altavibe_users WHERE lower(name) = lower(cleaned) LIMIT 1;
  IF NOT FOUND THEN
    SELECT signups_locked INTO locked FROM public.altavibe_settings WHERE id = 1;
    IF COALESCE(locked, false) THEN RAISE EXCEPTION 'signups_locked'; END IF;
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
$function$;
