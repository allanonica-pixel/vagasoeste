-- ============================================================
-- Migration 0001 — VagasOeste
-- Executar em 4 blocos no Supabase SQL Editor.
-- NOTA: PL/pgSQL com SELECT INTO causa erro no Supabase —
-- todas as funções foram reescritas em LANGUAGE sql com CTEs.
-- ============================================================

-- ============================================================
-- BLOCO 1 — Schemas e tabelas
-- ============================================================
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS media;
CREATE SCHEMA IF NOT EXISTS ops;
CREATE SCHEMA IF NOT EXISTS company;

CREATE TABLE IF NOT EXISTS audit.event_log (
  id          BIGSERIAL   PRIMARY KEY,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id    UUID,
  actor_role  TEXT,
  action      TEXT        NOT NULL,
  target      TEXT        NOT NULL,
  target_id   UUID,
  payload     JSONB,
  ip          INET,
  user_agent  TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_actor_id    ON audit.event_log (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_occurred_at ON audit.event_log (occurred_at DESC);

CREATE TABLE IF NOT EXISTS media.asset (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID        NOT NULL,
  kind        TEXT        NOT NULL CHECK (kind IN ('resume_photo','pitch_video','company_logo')),
  storage     TEXT        NOT NULL CHECK (storage IN ('supabase_storage','r2','cf_stream')),
  bucket      TEXT,
  path        TEXT,
  external_id TEXT,
  mime_type   TEXT        NOT NULL,
  size_bytes  BIGINT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL,
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_media_asset_expires ON media.asset (expires_at) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS ops.rate_limit (
  key          TEXT        NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count        INT         NOT NULL DEFAULT 1,
  PRIMARY KEY  (key, window_start)
);

-- ============================================================
-- BLOCO 2 — Função public.apply_to_job()
-- ============================================================
CREATE OR REPLACE FUNCTION public.apply_to_job(
  p_candidate_id UUID,
  p_job_id       UUID,
  p_ip           INET DEFAULT NULL,
  p_user_agent   TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH
  locked_job AS (
    SELECT id, company_id
      FROM public.jobs
     WHERE id = p_job_id
       AND status = 'ativo'
       AND (expires_at IS NULL OR expires_at > now())
     FOR UPDATE
  ),
  new_app AS (
    INSERT INTO public.applications (job_id, company_id, candidate_id)
    SELECT p_job_id, locked_job.company_id, p_candidate_id
      FROM locked_job
    RETURNING id, company_id
  ),
  bump_count AS (
    UPDATE public.jobs
       SET applicants_count = applicants_count + 1
     WHERE id = p_job_id
       AND EXISTS (SELECT 1 FROM locked_job)
    RETURNING id
  ),
  log_audit AS (
    INSERT INTO audit.event_log
      (actor_id, actor_role, action, target, target_id, payload, ip, user_agent)
    SELECT
      p_candidate_id, 'candidato', 'application.submitted',
      'jobs', p_job_id,
      jsonb_build_object('application_id', new_app.id, 'company_id', new_app.company_id),
      p_ip, p_user_agent
    FROM new_app
    RETURNING 1
  )
  SELECT id FROM new_app;
$$;

-- ============================================================
-- BLOCO 3 — Função company.publish_job()
-- ============================================================
CREATE OR REPLACE FUNCTION company.publish_job(
  p_company_id UUID,
  p_job_id     UUID
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH
  check_owner AS (
    SELECT id FROM public.jobs
     WHERE id = p_job_id
       AND company_id = p_company_id
     FOR UPDATE
  ),
  active_count AS (
    SELECT count(*)::int AS total
      FROM public.jobs
     WHERE company_id = p_company_id
       AND status = 'ativo'
  ),
  company_plan AS (
    SELECT plano FROM public.companies
     WHERE id = p_company_id
  ),
  do_publish AS (
    UPDATE public.jobs
       SET status       = 'ativo',
           published_at = now(),
           expires_at   = now() + INTERVAL '30 days',
           updated_at   = now()
     WHERE id = p_job_id
       AND EXISTS (SELECT 1 FROM check_owner)
       AND (
         (SELECT plano FROM company_plan) = 'basico'        AND (SELECT total FROM active_count) < 1  OR
         (SELECT plano FROM company_plan) = 'profissional'  AND (SELECT total FROM active_count) < 5  OR
         (SELECT plano FROM company_plan) = 'enterprise'    AND (SELECT total FROM active_count) < 50 OR
         (SELECT plano FROM company_plan) NOT IN ('basico','profissional','enterprise')
       )
    RETURNING id
  ),
  log_audit AS (
    INSERT INTO audit.event_log
      (actor_id, actor_role, action, target, target_id)
    SELECT p_company_id, 'empresa', 'job.published', 'jobs', p_job_id
      FROM do_publish
    RETURNING 1
  )
  SELECT 1 FROM do_publish;
$$;

-- ============================================================
-- BLOCO 4 — media.purge_expired + RLS + comentários
-- ============================================================
CREATE OR REPLACE FUNCTION media.purge_expired(p_limit INT DEFAULT 100)
RETURNS TABLE (id UUID, storage TEXT, bucket TEXT, path TEXT, external_id TEXT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH expired AS (
    SELECT a.id
      FROM media.asset a
     WHERE a.expires_at < now()
       AND a.deleted_at IS NULL
     ORDER BY a.expires_at
     LIMIT p_limit
     FOR UPDATE SKIP LOCKED
  )
  UPDATE media.asset
     SET deleted_at = now()
   FROM expired
  WHERE media.asset.id = expired.id
  RETURNING
    media.asset.id,
    media.asset.storage,
    media.asset.bucket,
    media.asset.path,
    media.asset.external_id;
$$;

ALTER TABLE audit.event_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_deny_all" ON audit.event_log FOR ALL USING (false);

ALTER TABLE media.asset ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media_owner_read"   ON media.asset FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "media_owner_insert" ON media.asset FOR INSERT WITH CHECK (owner_id = auth.uid());

ALTER TABLE ops.rate_limit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rate_limit_deny_all" ON ops.rate_limit FOR ALL USING (false);

REVOKE UPDATE, DELETE ON audit.event_log FROM PUBLIC;
REVOKE UPDATE, DELETE ON audit.event_log FROM anon;
REVOKE UPDATE, DELETE ON audit.event_log FROM authenticated;

CREATE OR REPLACE FUNCTION ops.cleanup_rate_limit()
RETURNS void
LANGUAGE sql AS $$
  DELETE FROM ops.rate_limit WHERE window_start < now() - interval '1 hour';
$$;

COMMENT ON TABLE audit.event_log IS 'Log append-only de ações sensíveis. Nunca atualizar ou deletar.';
COMMENT ON TABLE media.asset     IS 'Ciclo de vida de blobs (foto, vídeo). expires_at obrigatório.';
COMMENT ON TABLE ops.rate_limit  IS 'Rate limiting por janela deslizante em SQL.';
COMMENT ON FUNCTION public.apply_to_job IS 'Candidatura atômica: lock + validação + incremento + auditoria.';
COMMENT ON FUNCTION company.publish_job IS 'Publicação de vaga com validação de plano e auditoria.';
COMMENT ON FUNCTION media.purge_expired IS 'Marca assets vencidos para deleção pelo worker Node.';
