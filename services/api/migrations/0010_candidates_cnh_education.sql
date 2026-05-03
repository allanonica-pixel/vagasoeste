-- Migration 0010: Adiciona colunas CNH e situação de escolaridade à tabela candidates
-- Necessário para o perfil completo do candidato (redesign 5 abas)
--
-- Campos adicionados:
--   has_cnh             — Se possui CNH (default FALSE)
--   cnh_category        — Categoria da CNH: A, AB, C, D, E (nullable)
--   education_situation — Situação do grau de escolaridade: Completo, Incompleto, Cursando

ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS has_cnh BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cnh_category VARCHAR(10),
  ADD COLUMN IF NOT EXISTS education_situation VARCHAR(20);

COMMENT ON COLUMN candidates.has_cnh IS 'Se o candidato possui CNH';
COMMENT ON COLUMN candidates.cnh_category IS 'Categoria da CNH: A, AB, C, D, E';
COMMENT ON COLUMN candidates.education_situation IS 'Situação da escolaridade: Completo, Incompleto, Cursando';
