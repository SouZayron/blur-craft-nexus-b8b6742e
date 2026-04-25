CREATE OR REPLACE FUNCTION public.enforce_game_picks_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  room_type text;
  current_count int;
  max_allowed int;
BEGIN
  SELECT game_type::text INTO room_type FROM public.game_rooms WHERE id = NEW.room_id;
  IF room_type IN ('animals', 'rhythms') THEN
    max_allowed := 2;
  ELSE
    max_allowed := 1;
  END IF;

  SELECT count(*) INTO current_count
  FROM public.game_picks
  WHERE room_id = NEW.room_id AND player_id = NEW.player_id;

  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Limite de seleções atingido' USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$function$;