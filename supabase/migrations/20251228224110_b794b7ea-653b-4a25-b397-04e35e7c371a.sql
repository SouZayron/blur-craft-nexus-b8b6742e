-- Add password column to bingo_cards for simple user authentication
ALTER TABLE public.bingo_cards 
ADD COLUMN user_password TEXT;