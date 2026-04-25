-- Salas do torneio
CREATE TABLE public.torneio_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'lobby', -- lobby | playing | finished
  current_turn_player_id UUID,
  turn_number INT NOT NULL DEFAULT 0,
  last_dice INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.torneio_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "torneio_rooms select" ON public.torneio_rooms FOR SELECT USING (true);
CREATE POLICY "torneio_rooms insert" ON public.torneio_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "torneio_rooms update" ON public.torneio_rooms FOR UPDATE USING (true);
CREATE POLICY "torneio_rooms delete" ON public.torneio_rooms FOR DELETE USING (true);

-- Jogadores
CREATE TABLE public.torneio_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.torneio_rooms(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  color TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT 'mod',
  position INT NOT NULL DEFAULT 0,
  px INT NOT NULL DEFAULT 1500,
  turn_order INT NOT NULL DEFAULT 0,
  is_connected BOOLEAN NOT NULL DEFAULT true,
  is_eliminated BOOLEAN NOT NULL DEFAULT false,
  skip_turns INT NOT NULL DEFAULT 0,
  client_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.torneio_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "torneio_players select" ON public.torneio_players FOR SELECT USING (true);
CREATE POLICY "torneio_players insert" ON public.torneio_players FOR INSERT WITH CHECK (true);
CREATE POLICY "torneio_players update" ON public.torneio_players FOR UPDATE USING (true);
CREATE POLICY "torneio_players delete" ON public.torneio_players FOR DELETE USING (true);

-- Propriedades (chats comprados)
CREATE TABLE public.torneio_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.torneio_rooms(id) ON DELETE CASCADE,
  tile_index INT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.torneio_players(id) ON DELETE CASCADE,
  level INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, tile_index)
);

ALTER TABLE public.torneio_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "torneio_properties select" ON public.torneio_properties FOR SELECT USING (true);
CREATE POLICY "torneio_properties insert" ON public.torneio_properties FOR INSERT WITH CHECK (true);
CREATE POLICY "torneio_properties update" ON public.torneio_properties FOR UPDATE USING (true);
CREATE POLICY "torneio_properties delete" ON public.torneio_properties FOR DELETE USING (true);

-- Histórico de eventos (para sincronizar animações e log)
CREATE TABLE public.torneio_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.torneio_rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.torneio_players(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- dice | move | buy | rent | event_card | penalty | boost | teleport | eliminated | win
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.torneio_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "torneio_events select" ON public.torneio_events FOR SELECT USING (true);
CREATE POLICY "torneio_events insert" ON public.torneio_events FOR INSERT WITH CHECK (true);
CREATE POLICY "torneio_events delete" ON public.torneio_events FOR DELETE USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.torneio_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.torneio_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.torneio_properties;
ALTER PUBLICATION supabase_realtime ADD TABLE public.torneio_events;

ALTER TABLE public.torneio_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.torneio_players REPLICA IDENTITY FULL;
ALTER TABLE public.torneio_properties REPLICA IDENTITY FULL;
ALTER TABLE public.torneio_events REPLICA IDENTITY FULL;

-- Index
CREATE INDEX idx_torneio_players_room ON public.torneio_players(room_id);
CREATE INDEX idx_torneio_properties_room ON public.torneio_properties(room_id);
CREATE INDEX idx_torneio_events_room ON public.torneio_events(room_id, created_at DESC);