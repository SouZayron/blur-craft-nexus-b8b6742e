-- Create enum for game types
CREATE TYPE public.bingo_game_type AS ENUM ('pairs', 'sequences');

-- Create table for game sessions
CREATE TABLE public.bingo_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type bingo_game_type NOT NULL DEFAULT 'pairs',
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for game players
CREATE TABLE public.bingo_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for block selections
CREATE TABLE public.bingo_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.bingo_games(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.bingo_players(id) ON DELETE CASCADE NOT NULL,
  block_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_id, block_index)
);

-- Create admin user table
CREATE TABLE public.bingo_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default admin
INSERT INTO public.bingo_admins (username, password) VALUES ('Zayron', '784512');

-- Insert default game session
INSERT INTO public.bingo_games (game_type, is_open) VALUES ('pairs', true);

-- Enable RLS
ALTER TABLE public.bingo_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bingo_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bingo_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bingo_admins ENABLE ROW LEVEL SECURITY;

-- Policies for bingo_games (public read, admin write)
CREATE POLICY "Anyone can view games" ON public.bingo_games FOR SELECT USING (true);
CREATE POLICY "Anyone can update games" ON public.bingo_games FOR UPDATE USING (true);

-- Policies for bingo_players
CREATE POLICY "Anyone can view players" ON public.bingo_players FOR SELECT USING (true);
CREATE POLICY "Anyone can register" ON public.bingo_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete players" ON public.bingo_players FOR DELETE USING (true);

-- Policies for bingo_selections
CREATE POLICY "Anyone can view selections" ON public.bingo_selections FOR SELECT USING (true);
CREATE POLICY "Anyone can create selections" ON public.bingo_selections FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete selections" ON public.bingo_selections FOR DELETE USING (true);

-- Policies for bingo_admins (only for login verification)
CREATE POLICY "Anyone can view admins for login" ON public.bingo_admins FOR SELECT USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.bingo_games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bingo_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bingo_selections;