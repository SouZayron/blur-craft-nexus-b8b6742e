CREATE POLICY "public delete bolao_bets" ON public.bolao_bets FOR DELETE USING (true);
GRANT DELETE ON public.bolao_bets TO anon, authenticated;