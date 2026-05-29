-- Pause blog generator: unschedule any cron jobs that invoke generate-blog-post
DO $$
DECLARE
  j record;
BEGIN
  FOR j IN
    SELECT jobid, jobname FROM cron.job
    WHERE command ILIKE '%generate-blog-post%'
       OR jobname ILIKE '%blog%'
  LOOP
    PERFORM cron.unschedule(j.jobid);
  END LOOP;
END $$;

-- Remove posts from the specified dates
DELETE FROM public.blog_posts
WHERE published_at::date IN ('2026-04-25','2026-05-04','2026-05-23');