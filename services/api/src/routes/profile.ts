/**
 * VagasOeste — Profile notifications
 *
 * POST /v1/profile/notify-change
 *   Enviada após o candidato verificar o OTP e salvar alterações no perfil.
 *   Em dev: loga o email no console (stub).
 *   Em prod: envia via SMTP configurado (Resend / SES / SMTP).
 */

import { Hono } from 'hono';
import { logger } from '../lib/logger.js';

export const profileRouter = new Hono();

// ── Middleware: valida Content-Type ───────────────────────────────────────────
profileRouter.use('*', async (c, next) => {
  if (c.req.method !== 'GET' && !c.req.header('content-type')?.includes('application/json')) {
    return c.json({ error: 'Content-Type deve ser application/json' }, 415);
  }
  return next();
});

// ── POST /v1/profile/notify-change ───────────────────────────────────────────
profileRouter.post('/notify-change', async (c) => {
  let body: { email?: string; name?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'JSON inválido' }, 400);
  }

  const { email, name } = body;

  if (!email || !name) {
    return c.json({ error: 'email e name são obrigatórios' }, 400);
  }

  const firstName = name.trim().split(/\s+/)[0] ?? 'candidato';
  const platformUrl = process.env.PLATFORM_URL ?? 'https://app.santarem.app';

  const subject = 'Confirme a alteração do seu cadastro - VagasOeste';

  const htmlBody = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>${subject}</title></head>
<body style="font-family: sans-serif; background: #f9fafb; margin: 0; padding: 32px 0;">
  <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 40px 32px; border: 1px solid #e5e7eb;">
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 24px; font-weight: 800; color: #059669;">VagasOeste</span>
    </div>
    <p style="color: #374151; font-size: 15px; margin: 0 0 8px;">Olá, <strong>${firstName}</strong>!</p>
    <p style="color: #374151; font-size: 15px; margin: 0 0 24px;">
      Recebemos uma solicitação de alteração no seu cadastro.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${platformUrl}/plataforma/perfil"
         style="background: #059669; color: #fff; text-decoration: none; font-weight: 700;
                font-size: 15px; padding: 14px 32px; border-radius: 8px; display: inline-block;">
        👉  Confirmar alteração
      </a>
    </div>
    <p style="color: #6b7280; font-size: 13px; margin: 24px 0 0; text-align: center;">
      Se não foi você, ignore este e-mail ou
      <a href="${platformUrl}/redefinir-senha" style="color: #059669;">redefina sua senha</a>.
    </p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
      Equipe VagasOeste
    </p>
  </div>
</body>
</html>
  `.trim();

  // ── Stub de desenvolvimento ──────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    logger.info({ to: email, subject, firstName }, '📧 [Email STUB] Notificação de alteração de perfil');
    return c.json({ ok: true, stub: true });
  }

  // ── Integração real (Resend) ─────────────────────────────────────────────────
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) throw new Error('RESEND_API_KEY não configurada');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'VagasOeste <noreply@santarem.app>',
        to: [email],
        subject,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      logger.error({ email, err }, 'Falha ao enviar email via Resend');
      return c.json({ error: 'Falha ao enviar email' }, 500);
    }

    return c.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ email, msg }, 'Erro ao enviar email de notificação');
    return c.json({ error: 'Erro interno ao enviar email' }, 500);
  }
});
