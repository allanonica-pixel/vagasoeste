-- =============================================================================
-- Migration 0013: Auditoria de empresas — inativação, exclusão e motivos
--
-- 1. Adiciona 'inativo' e 'excluido' ao enum company_status
-- 2. Adiciona colunas de rastreamento à tabela companies
-- 3. Cria tabela company_action_reasons (motivos reutilizáveis)
-- 4. Cria tabela company_audit_log (trilha de auditoria)
--
-- Rodar no Supabase SQL Editor (DEV e PROD)
-- =============================================================================

-- ── 1. Novos valores no enum company_status ───────────────────────────────────
ALTER TYPE company_status ADD VALUE IF NOT EXISTS 'inativo';
ALTER TYPE company_status ADD VALUE IF NOT EXISTS 'excluido';

-- ── 2. Colunas de rastreamento em companies ───────────────────────────────────
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS inativado_em  timestamptz,
  ADD COLUMN IF NOT EXISTS inativado_por text,      -- nome do usuário que inativou
  ADD COLUMN IF NOT EXISTS excluido_em   timestamptz,
  ADD COLUMN IF NOT EXISTS excluido_por  text;      -- nome do usuário que excluiu

-- ── 3. Tabela de motivos reutilizáveis ────────────────────────────────────────
-- action_type: 'inativacao' | 'exclusao' | 'ambos'
CREATE TABLE IF NOT EXISTS company_action_reasons (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reason       text        NOT NULL UNIQUE,
  action_type  text        NOT NULL DEFAULT 'ambos',
  created_by   text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE company_action_reasons DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_action_reasons_type
  ON company_action_reasons (action_type);

-- ── 4. Tabela de auditoria ────────────────────────────────────────────────────
-- action: 'inativacao' | 'reativacao' | 'exclusao'
-- performed_by_role: 'admin' | 'empresa'
CREATE TABLE IF NOT EXISTS company_audit_log (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_cadastro_id      text,                         -- id em empresa_pre_cadastros
  company_id           text,                         -- id em companies (se já aprovada)
  company_name         text        NOT NULL,
  company_cnpj         text,
  action               text        NOT NULL,
  reason_id            uuid        REFERENCES company_action_reasons(id) ON DELETE SET NULL,
  reason_text          text,
  performed_by_user_id text,
  performed_by_name    text        NOT NULL DEFAULT 'Sistema',
  performed_by_role    text        NOT NULL DEFAULT 'admin',
  performed_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE company_audit_log DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_audit_log_company
  ON company_audit_log (company_id, performed_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_pre_cadastro
  ON company_audit_log (pre_cadastro_id, performed_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_action
  ON company_audit_log (action, performed_at DESC);

-- ── 5. Motivos padrão ─────────────────────────────────────────────────────────
INSERT INTO company_action_reasons (reason, action_type) VALUES
  ('Solicitação da própria empresa',      'ambos'),
  ('Inadimplência no plano',              'inativacao'),
  ('Violação dos termos de uso',          'ambos'),
  ('Dados cadastrais inválidos',          'ambos'),
  ('Empresa encerrou as atividades',      'ambos'),
  ('Duplicidade de cadastro',             'exclusao'),
  ('Solicitação administrativa',          'ambos')
ON CONFLICT (reason) DO NOTHING;
