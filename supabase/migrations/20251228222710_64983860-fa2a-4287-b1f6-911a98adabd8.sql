-- Create table for bingo cards
CREATE TABLE public.bingo_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  card_number INTEGER NOT NULL,
  title TEXT NOT NULL DEFAULT 'Bingo xat',
  subtitle TEXT NOT NULL DEFAULT 'Boa sorte!',
  numbers INTEGER[] NOT NULL,
  marked_numbers INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint to prevent duplicate cards for same user/number
  UNIQUE (user_name, card_number)
);

-- Enable RLS
ALTER TABLE public.bingo_cards ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read cards (public access for sharing)
CREATE POLICY "Anyone can view bingo cards"
ON public.bingo_cards
FOR SELECT
USING (true);

-- Allow anyone to insert cards (no auth required)
CREATE POLICY "Anyone can create bingo cards"
ON public.bingo_cards
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update their marked numbers (for marking X)
CREATE POLICY "Anyone can update marked numbers"
ON public.bingo_cards
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_bingo_cards_user_card ON public.bingo_cards (user_name, card_number);