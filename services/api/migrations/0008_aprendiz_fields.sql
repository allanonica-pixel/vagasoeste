-- ============================================================
-- Migration 0008 — Menor Aprendiz / Jovem Aprendiz
-- ============================================================
-- Adds apprenticeship classification flags to candidates and
-- matching acceptance flags to jobs for filtering.
-- ============================================================

-- ── Tabela candidates ─────────────────────────────────────────────────────────

ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS is_menor_aprendiz boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_jovem_aprendiz  boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN candidates.is_menor_aprendiz
  IS 'Menor Aprendiz: 14 anos completos até 17 anos incompletos (classificado automaticamente)';
COMMENT ON COLUMN candidates.is_jovem_aprendiz
  IS 'Jovem Aprendiz: 17 anos completos até 24 anos incompletos. 17 anos = automático; 18-23 anos = opt-in pelo candidato';

CREATE INDEX IF NOT EXISTS idx_candidates_menor_aprendiz
  ON candidates (is_menor_aprendiz) WHERE is_menor_aprendiz = true;

CREATE INDEX IF NOT EXISTS idx_candidates_jovem_aprendiz
  ON candidates (is_jovem_aprendiz) WHERE is_jovem_aprendiz = true;

-- ── Tabela jobs ───────────────────────────────────────────────────────────────

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS aceita_menor_aprendiz boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS aceita_jovem_aprendiz  boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN jobs.aceita_menor_aprendiz
  IS 'Vaga disponível para Menor Aprendiz (14-17 anos)';
COMMENT ON COLUMN jobs.aceita_jovem_aprendiz
  IS 'Vaga disponível para Jovem Aprendiz (17-24 anos)';

CREATE INDEX IF NOT EXISTS idx_jobs_menor_aprendiz
  ON jobs (aceita_menor_aprendiz) WHERE aceita_menor_aprendiz = true;

CREATE INDEX IF NOT EXISTS idx_jobs_jovem_aprendiz
  ON jobs (aceita_jovem_aprendiz) WHERE aceita_jovem_aprendiz = true;
