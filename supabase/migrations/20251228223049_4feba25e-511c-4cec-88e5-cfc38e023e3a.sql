-- Add theme column to bingo_cards table
ALTER TABLE public.bingo_cards 
ADD COLUMN theme TEXT NOT NULL DEFAULT 'purple';