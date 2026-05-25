-- Rode no Supabase: SQL Editor → New query → Run
-- Adiciona coluna de capa dos artigos (idempotente)

ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "coverImage" TEXT;
