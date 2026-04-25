-- ============================================================
-- Migration 0002 — VagasOeste
-- Jobs agendados com pg_cron.
-- Rodar APÓS habilitar pg_cron em Database → Extensions.
-- ============================================================

-- Purge de mídia expirada a cada 15 min
SELECT cron.schedule(
  'media-purge',
  '*/15 * * * *',
  $$ SELECT media.purge_expired(100) $$
);

-- Limpeza do rate_limit antigo, 1x por hora
SELECT cron.schedule(
  'rate-limit-cleanup',
  '0 * * * *',
  $$ SELECT ops.cleanup_rate_limit() $$
);

-- Expira vagas sem renovação, 1x por dia à meia-noite
SELECT cron.schedule(
  'expire-jobs',
  '0 0 * * *',
  $$
    UPDATE public.jobs
       SET status = 'encerrado', updated_at = now()
     WHERE status = 'ativo'
       AND expires_at < now()
  $$
);
