
CREATE TYPE public.game_room_type AS ENUM ('animals', 'invertidos', 'sequences');

CREATE TABLE public.game_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type game_room_type NOT NULL UNIQUE,
  is_open boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view game_rooms" ON public.game_rooms FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can update game_rooms" ON public.game_rooms FOR UPDATE TO public USING (true);

CREATE TABLE public.game_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view game_players" ON public.game_players FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert game_players" ON public.game_players FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update game_players" ON public.game_players FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete game_players" ON public.game_players FOR DELETE TO public USING (true);

CREATE TABLE public.game_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.game_players(id) ON DELETE CASCADE,
  pick_value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.game_picks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view game_picks" ON public.game_picks FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert game_picks" ON public.game_picks FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can delete game_picks" ON public.game_picks FOR DELETE TO public USING (true);

INSERT INTO public.game_rooms (game_type) VALUES 
  ('animals'::game_room_type), 
  ('invertidos'::game_room_type), 
  ('sequences'::game_room_type);

ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_picks;
