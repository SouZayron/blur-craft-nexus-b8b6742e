-- Add expires_at column to bingo_cards with 30 days default
ALTER TABLE public.bingo_cards 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days');

-- Create index for faster expiration queries
CREATE INDEX idx_bingo_cards_expires_at ON public.bingo_cards (expires_at);

-- Create function to clean up expired cards (runs automatically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_bingo_cards()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.bingo_cards WHERE expires_at < now();
END;
$$;