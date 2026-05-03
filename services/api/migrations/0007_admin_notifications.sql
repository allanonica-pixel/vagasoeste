-- ============================================================
-- Migration 0007 — admin_notifications
-- Log de notificações disparadas pelo painel admin
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_notifications (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  type              text        NOT NULL CHECK (type IN (
                      'new_candidate','pre_interview','contact_request',
                      'company_approved','company_rejected',
                      'job_approved','job_rejected','status_update'
                    )),
  recipient_type    text        NOT NULL CHECK (recipient_type IN ('empresa','candidato')),
  recipient_email   text        NOT NULL,
  recipient_whatsapp text,
  subject           text        NOT NULL,
  message           text        NOT NULL DEFAULT '',
  sent_at           timestamptz DEFAULT now(),
  status            text        NOT NULL DEFAULT 'enviado' CHECK (status IN ('enviado','pendente','falhou')),
  job_title         text,
  company_name      text,
  created_by        uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_admin_notifications_sent_at ON admin_notifications (sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_status  ON admin_notifications (status);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type    ON admin_notifications (type);

-- RLS
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver e criar notificações
DROP POLICY IF EXISTS "admin_notifications_admin_all" ON admin_notifications;
CREATE POLICY "admin_notifications_admin_all" ON admin_notifications
  FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

COMMENT ON TABLE admin_notifications IS
  'Log de notificações disparadas pelo painel admin VagasOeste (email + WhatsApp)';
