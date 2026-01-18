-- Create table for Mix Hits selections
CREATE TABLE public.mixhits_selections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_name TEXT NOT NULL UNIQUE,
  user_name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mixhits_selections ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read selections (to see which are taken)
CREATE POLICY "Anyone can view selections" 
ON public.mixhits_selections 
FOR SELECT 
USING (true);

-- Allow anyone to insert (no auth required for this party feature)
CREATE POLICY "Anyone can insert selections" 
ON public.mixhits_selections 
FOR INSERT 
WITH CHECK (true);