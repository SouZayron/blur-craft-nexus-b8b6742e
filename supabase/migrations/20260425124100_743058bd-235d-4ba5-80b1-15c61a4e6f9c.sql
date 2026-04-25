-- Impede que dois jogadores selecionem o mesmo bloco/animal na mesma sala
ALTER TABLE public.game_picks
  ADD CONSTRAINT game_picks_room_value_unique UNIQUE (room_id, pick_value);

-- Limita picks por jogador via trigger (animals=2, demais=1)
CREATE OR REPLACE FUNCTION public.enforce_game_picks_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  room_type text;
  current_count int;
  max_allowed int;
BEGIN
  SELECT game_type::text INTO room_type FROM public.game_rooms WHERE id = NEW.room_id;
  IF room_type = 'animals' THEN
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
$$;

DROP TRIGGER IF EXISTS trg_enforce_game_picks_limit ON public.game_picks;
CREATE TRIGGER trg_enforce_game_picks_limit
BEFORE INSERT ON public.game_picks
FOR EACH ROW
EXECUTE FUNCTION public.enforce_game_picks_limit();