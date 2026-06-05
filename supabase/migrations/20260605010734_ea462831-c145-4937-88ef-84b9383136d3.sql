-- Remove possíveis duplicatas mantendo o registro mais antigo
DELETE FROM public.altavibe_users a
USING public.altavibe_users b
WHERE a.id <> b.id
  AND lower(a.name) = lower(b.name)
  AND a.created_at > b.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS altavibe_users_name_lower_unique
  ON public.altavibe_users (lower(name));