-- ── Migration 0016 — Setores de Atuação ──────────────────────────────────────
-- Cadastro mestre dos setores selecionáveis em /interesse-empresa e cadastro de vagas.
-- Substitui lista hardcoded no frontend. Admin gerencia via Painel-admin → Setores.
--
-- Empresas/vagas armazenam o setor como TEXTO (varchar) — sem FK rígida — pra preservar
-- registros existentes mesmo se setor for renomeado/removido.
-- A tabela setores é a fonte de verdade lida no momento do form.

CREATE TABLE IF NOT EXISTS setores (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        varchar(100) NOT NULL UNIQUE,
  slug        varchar(120) NOT NULL UNIQUE,
  ordem       integer     NOT NULL DEFAULT 0,
  ativo       boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_setores_ativo_ordem ON setores(ativo, ordem) WHERE ativo = true;

-- Trigger pra atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION setores_set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_setores_updated_at ON setores;
CREATE TRIGGER trg_setores_updated_at
  BEFORE UPDATE ON setores
  FOR EACH ROW EXECUTE FUNCTION setores_set_updated_at();

-- RLS: leitura pública (frontend público lista setores ativos), escrita só admin via service_role
ALTER TABLE setores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "setores_read_public_ativos" ON setores;
CREATE POLICY "setores_read_public_ativos" ON setores
  FOR SELECT USING (ativo = true);

-- Sem policy de INSERT/UPDATE/DELETE: só service_role manipula (admin endpoints).

GRANT SELECT ON setores TO anon, authenticated;
