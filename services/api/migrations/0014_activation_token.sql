-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0014 — Token de ativação do pré-cadastro de empresa + status parcial
--
-- Propósito:
--   Após o pré-cadastro via WhatsApp OTP, a empresa recebe um e-mail com link
--   de ativação. Ao clicar, uma conta Supabase Auth é criada e o registro em
--   companies fica com status 'parcial' (pode publicar vagas, mas as vagas
--   não aparecem publicamente até aprovação pelo painel admin).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Colunas de token + ativação na tabela de pré-cadastros
ALTER TABLE empresa_pre_cadastros
  ADD COLUMN IF NOT EXISTS activation_token             text,
  ADD COLUMN IF NOT EXISTS activation_token_expires_at  timestamptz,
  ADD COLUMN IF NOT EXISTS ativado_em                   timestamptz;

-- 2. Novo status para empresa pré-ativa (email clicado, aguardando aprovação admin)
ALTER TYPE company_status ADD VALUE IF NOT EXISTS 'parcial';

-- 3. Índice para lookup rápido do token (único por uso — nullable)
CREATE INDEX IF NOT EXISTS idx_pre_cad_activation_token
  ON empresa_pre_cadastros (activation_token)
  WHERE activation_token IS NOT NULL;
