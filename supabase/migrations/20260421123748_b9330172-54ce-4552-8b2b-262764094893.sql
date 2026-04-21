-- Enable extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Blog category enum
CREATE TYPE public.blog_category AS ENUM ('tech', 'curiosidades', 'comunicacao');

-- Blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content_html TEXT NOT NULL,
  category public.blog_category NOT NULL,
  cover_image_url TEXT,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  reading_time_minutes INTEGER NOT NULL DEFAULT 5,
  views INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts (published_at DESC) WHERE is_published = true;
CREATE INDEX idx_blog_posts_category ON public.blog_posts (category) WHERE is_published = true;
CREATE INDEX idx_blog_posts_slug ON public.blog_posts (slug);

-- RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts only
CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts
FOR SELECT
USING (is_published = true);

-- Public can increment views (for the views counter)
CREATE POLICY "Anyone can update views"
ON public.blog_posts
FOR UPDATE
USING (true)
WITH CHECK (true);

-- updated_at trigger function (reusable)
CREATE OR REPLACE FUNCTION public.update_blog_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_updated_at();