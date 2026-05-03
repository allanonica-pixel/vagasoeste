-- ── Migration 0019 — Adiciona estado/cidade de operação em pre_cadastros ────
-- Empresa escolhe a UF e cidade da OPERAÇÃO (não a do CNPJ matriz).
-- A cidade precisa estar ativa em `cidades` no momento do submit (validado no backend).
--
-- Idempotente: ADD COLUMN IF NOT EXISTS.

ALTER TABLE empresa_pre_cadastros
  ADD COLUMN IF NOT EXISTS estado_uf  varchar(2),    -- 'PA', 'SP', etc.
  ADD COLUMN IF NOT EXISTS cidade     varchar(120),  -- nome da cidade selecionada (snapshot — sem FK rígida)
  ADD COLUMN IF NOT EXISTS cidade_id  uuid;          -- FK opcional pra cidades.id, pra rastreabilidade

CREATE INDEX IF NOT EXISTS idx_pre_cad_estado_cidade ON empresa_pre_cadastros(estado_uf, cidade);
CREATE INDEX IF NOT EXISTS idx_pre_cad_cidade_id    ON empresa_pre_cadastros(cidade_id);
