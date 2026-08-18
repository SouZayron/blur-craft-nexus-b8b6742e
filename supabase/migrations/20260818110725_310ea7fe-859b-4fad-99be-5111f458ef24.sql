INSERT INTO public.game_rooms (game_type, is_open)
SELECT t::public.game_room_type, false
FROM unnest(ARRAY['foods','snacks','singers']) AS t
WHERE NOT EXISTS (SELECT 1 FROM public.game_rooms r WHERE r.game_type::text = t);