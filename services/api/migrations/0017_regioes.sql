-- ── Migration 0017 — Regiões Atendidas (Estados / Cidades / Bairros) ─────────
-- Hierarquia de cobertura geográfica. Validação no cadastro de empresa
-- bloqueia se cidade não estiver cadastrada como ativa.
--
-- Bairros são cadastro complementar (não bloqueia cadastro), úteis pra SEO,
-- filtros e relatórios.

-- ── Estados ──
CREATE TABLE IF NOT EXISTS estados (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  uf          char(2)      NOT NULL UNIQUE,    -- "PA", "SP", "MG"...
  nome        varchar(100) NOT NULL,           -- "Pará", "São Paulo"
  ativo       boolean      NOT NULL DEFAULT true,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  updated_at  timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_estados_ativo ON estados(ativo) WHERE ativo = true;

-- ── Cidades ──
CREATE TABLE IF NOT EXISTS cidades (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  estado_id   uuid         NOT NULL REFERENCES estados(id) ON DELETE RESTRICT,
  nome        varchar(120) NOT NULL,
  slug        varchar(140) NOT NULL,           -- "santarem-pa", único por (estado_id, slug)
  ativo       boolean      NOT NULL DEFAULT true,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  updated_at  timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (estado_id, nome),
  UNIQUE (estado_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_cidades_estado_id ON cidades(estado_id);
CREATE INDEX IF NOT EXISTS idx_cidades_ativo     ON cidades(ativo) WHERE ativo = true;

-- ── Bairros ──
CREATE TABLE IF NOT EXISTS bairros (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  cidade_id   uuid         NOT NULL REFERENCES cidades(id) ON DELETE CASCADE,
  nome        varchar(120) NOT NULL,
  slug        varchar(140) NOT NULL,
  ativo       boolean      NOT NULL DEFAULT true,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  updated_at  timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (cidade_id, nome),
  UNIQUE (cidade_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_bairros_cidade_id ON bairros(cidade_id);
CREATE INDEX IF NOT EXISTS idx_bairros_ativo     ON bairros(ativo) WHERE ativo = true;

-- ── Triggers de updated_at ──
CREATE OR REPLACE FUNCTION regioes_set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_estados_updated_at ON estados;
CREATE TRIGGER trg_estados_updated_at BEFORE UPDATE ON estados
  FOR EACH ROW EXECUTE FUNCTION regioes_set_updated_at();

DROP TRIGGER IF EXISTS trg_cidades_updated_at ON cidades;
CREATE TRIGGER trg_cidades_updated_at BEFORE UPDATE ON cidades
  FOR EACH ROW EXECUTE FUNCTION regioes_set_updated_at();

DROP TRIGGER IF EXISTS trg_bairros_updated_at ON bairros;
CREATE TRIGGER trg_bairros_updated_at BEFORE UPDATE ON bairros
  FOR EACH ROW EXECUTE FUNCTION regioes_set_updated_at();

-- ── RLS — leitura pública pra listagem em forms públicos ──
ALTER TABLE estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE cidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE bairros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "estados_read_ativos" ON estados;
CREATE POLICY "estados_read_ativos" ON estados FOR SELECT USING (ativo = true);

DROP POLICY IF EXISTS "cidades_read_ativos" ON cidades;
CREATE POLICY "cidades_read_ativos" ON cidades FOR SELECT USING (ativo = true);

DROP POLICY IF EXISTS "bairros_read_ativos" ON bairros;
CREATE POLICY "bairros_read_ativos" ON bairros FOR SELECT USING (ativo = true);

GRANT SELECT ON estados, cidades, bairros TO anon, authenticated;
