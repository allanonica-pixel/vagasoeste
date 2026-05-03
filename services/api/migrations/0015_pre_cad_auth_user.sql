-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0015 — supabase_auth_user_id no pré-cadastro
--
-- Armazena o UUID do usuário Supabase Auth criado no momento do envio do
-- e-mail de ativação (via generateLink). Permite que GET /interesse/ativar
-- encontre o usuário sem necessidade de lookup adicional.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE empresa_pre_cadastros
  ADD COLUMN IF NOT EXISTS supabase_auth_user_id uuid;

CREATE INDEX IF NOT EXISTS idx_pre_cad_supabase_auth_user_id
  ON empresa_pre_cadastros (supabase_auth_user_id)
  WHERE supabase_auth_user_id IS NOT NULL;
