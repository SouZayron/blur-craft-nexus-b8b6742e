
-- Users
CREATE TABLE public.bolao_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  pin text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.bolao_users TO anon, authenticated;
GRANT ALL ON public.bolao_users TO service_role;
ALTER TABLE public.bolao_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read bolao_users" ON public.bolao_users FOR SELECT USING (true);
CREATE POLICY "public insert bolao_users" ON public.bolao_users FOR INSERT WITH CHECK (true);

-- Bets
CREATE TABLE public.bolao_bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.bolao_users(id) ON DELETE CASCADE,
  username text NOT NULL,
  game_id int NOT NULL,
  score_home int NOT NULL,
  score_away int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, game_id)
);
GRANT SELECT, INSERT ON public.bolao_bets TO anon, authenticated;
GRANT ALL ON public.bolao_bets TO service_role;
ALTER TABLE public.bolao_bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read bolao_bets" ON public.bolao_bets FOR SELECT USING (true);
CREATE POLICY "public insert bolao_bets" ON public.bolao_bets FOR INSERT WITH CHECK (true);

-- Results
CREATE TABLE public.bolao_results (
  game_id int PRIMARY KEY,
  score_home int NOT NULL,
  score_away int NOT NULL,
  confirmed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bolao_results TO anon, authenticated;
GRANT ALL ON public.bolao_results TO service_role;
ALTER TABLE public.bolao_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read bolao_results" ON public.bolao_results FOR SELECT USING (true);
CREATE POLICY "public write bolao_results" ON public.bolao_results FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.bolao_bets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bolao_results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bolao_users;
