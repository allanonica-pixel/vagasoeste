-- =============================================================================
-- Migration 0005: Pré-cadastro de empresas + OTP codes
-- Rodar no Supabase SQL Editor (DEV e PROD)
-- =============================================================================

-- ── Tabela de códigos OTP (WhatsApp) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_codes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       text        NOT NULL,
  code        text        NOT NULL,
  type        text        NOT NULL DEFAULT 'otp',   -- 'otp' | 'session'
  expires_at  timestamptz NOT NULL,
  used        boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_used
  ON otp_codes (phone, used, expires_at);

-- Limpar OTPs expirados automaticamente (RLS off — tabela interna)
ALTER TABLE otp_codes DISABLE ROW LEVEL SECURITY;

-- ── Tabela de pré-cadastros de empresa ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS empresa_pre_cadastros (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj             text,
  razao_social     text,
  company_name     text        NOT NULL,
  setores          text[]      NOT NULL DEFAULT '{}',
  neighborhood     text,
  cep              text,
  logradouro       text,
  numero           text,
  bairro_empresa   text,
  contact_name     text        NOT NULL,
  contact_role     text        NOT NULL,
  contact_email    text        NOT NULL,
  contact_whatsapp text        NOT NULL,
  vacancies_qty    text,
  message          text,
  status           text        NOT NULL DEFAULT 'pendente',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE empresa_pre_cadastros DISABLE ROW LEVEL SECURITY;

-- ── Função de limpeza automática de OTPs expirados ───────────────────────────
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM otp_codes
  WHERE expires_at < now() - interval '1 hour';
END;
$$;
