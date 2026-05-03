-- Migration 0011: Adiciona coluna curriculo_data (JSONB) à tabela candidates
-- Armazena o currículo completo como snapshot JSON independente do perfil.
-- Permite que o candidato customize o currículo sem alterar os dados do perfil.

ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS curriculo_data JSONB;

COMMENT ON COLUMN candidates.curriculo_data IS
  'Snapshot JSON do currículo do candidato (objetivo, habilidades, idiomas, instituição, etc.). '
  'Alimenta tanto /plataforma aba Meu Currículo quanto /curriculo-avulso para candidatos autenticados.';
