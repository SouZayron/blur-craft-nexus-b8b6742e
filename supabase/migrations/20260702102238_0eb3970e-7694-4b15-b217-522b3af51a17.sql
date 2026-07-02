
-- ============ MACHINE: allow write access (game/admin use anon key) ============
DROP POLICY IF EXISTS "write machine_users" ON public.machine_users;
CREATE POLICY "write machine_users" ON public.machine_users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "write machine_plays" ON public.machine_plays;
CREATE POLICY "write machine_plays" ON public.machine_plays FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "write machine_symbols" ON public.machine_symbols;
CREATE POLICY "write machine_symbols" ON public.machine_symbols FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "write machine_settings" ON public.machine_settings;
CREATE POLICY "write machine_settings" ON public.machine_settings FOR ALL USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.machine_users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.machine_plays TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.machine_symbols TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.machine_settings TO anon, authenticated;

ALTER TABLE public.machine_users REPLICA IDENTITY FULL;
ALTER TABLE public.machine_plays REPLICA IDENTITY FULL;
ALTER TABLE public.machine_symbols REPLICA IDENTITY FULL;
ALTER TABLE public.machine_settings REPLICA IDENTITY FULL;

-- ============ BOLAO: matches + settings ============
CREATE TABLE IF NOT EXISTS public.bolao_matches (
  id SERIAL PRIMARY KEY,
  home TEXT NOT NULL,
  away TEXT NOT NULL,
  label TEXT NOT NULL,
  opens_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closes_at TIMESTAMPTZ NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bolao_matches TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.bolao_matches_id_seq TO anon, authenticated;
GRANT ALL ON public.bolao_matches TO service_role;
ALTER TABLE public.bolao_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read bolao_matches" ON public.bolao_matches FOR SELECT USING (true);
CREATE POLICY "public write bolao_matches" ON public.bolao_matches FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE public.bolao_matches REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bolao_matches;

CREATE TABLE IF NOT EXISTS public.bolao_settings (
  id INT PRIMARY KEY DEFAULT 1,
  prize_total INT NOT NULL DEFAULT 2000,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT bolao_settings_singleton CHECK (id = 1)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bolao_settings TO anon, authenticated;
GRANT ALL ON public.bolao_settings TO service_role;
ALTER TABLE public.bolao_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read bolao_settings" ON public.bolao_settings FOR SELECT USING (true);
CREATE POLICY "public write bolao_settings" ON public.bolao_settings FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE public.bolao_settings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bolao_settings;

INSERT INTO public.bolao_settings (id, prize_total) VALUES (1, 2000)
ON CONFLICT (id) DO UPDATE SET prize_total = EXCLUDED.prize_total, updated_at = now();

-- Seed existing games (Brasil x Marrocos, x Haiti, Escócia x Brasil, x Japão)
INSERT INTO public.bolao_matches (id, home, away, label, opens_at, closes_at, position) VALUES
  (1, 'Brasil', 'Marrocos', 'Brasil vs Marrocos — 13/06', '2026-06-01 00:00+00', '2026-06-13 17:00-03', 1),
  (2, 'Brasil', 'Haiti', 'Brasil vs Haiti — 19/06', '2026-06-14 00:00-03', '2026-06-19 17:00-03', 2),
  (3, 'Escócia', 'Brasil', 'Escócia vs Brasil — 24/06', '2026-06-20 00:00-03', '2026-06-24 17:00-03', 3),
  (4, 'Brasil', 'Japão', 'Brasil vs Japão — 29/06', '2026-06-22 00:00-03', '2026-06-28 19:00-03', 4)
ON CONFLICT (id) DO NOTHING;

SELECT setval('public.bolao_matches_id_seq', GREATEST((SELECT MAX(id) FROM public.bolao_matches), 1));
