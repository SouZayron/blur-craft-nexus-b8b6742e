CREATE TABLE public.bomba_state (
  id integer PRIMARY KEY DEFAULT 1,
  is_open boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'lobby',
  drawn integer[] NOT NULL DEFAULT '{}',
  last_drawn integer,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bomba_state_single CHECK (id = 1)
);

CREATE TABLE public.bomba_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.game_players(id) ON DELETE CASCADE,
  player_name text NOT NULL,
  numbers integer[] NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bomba_picks_unique_player UNIQUE (player_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bomba_state TO anon, authenticated;
GRANT ALL ON public.bomba_state TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bomba_picks TO anon, authenticated;
GRANT ALL ON public.bomba_picks TO service_role;

ALTER TABLE public.bomba_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bomba_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bomba_state_read" ON public.bomba_state FOR SELECT USING (true);
CREATE POLICY "bomba_state_update" ON public.bomba_state FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "bomba_picks_read" ON public.bomba_picks FOR SELECT USING (true);
CREATE POLICY "bomba_picks_insert" ON public.bomba_picks FOR INSERT WITH CHECK (true);
CREATE POLICY "bomba_picks_update" ON public.bomba_picks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "bomba_picks_delete" ON public.bomba_picks FOR DELETE USING (true);

INSERT INTO public.bomba_state (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.bomba_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bomba_picks;