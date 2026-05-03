/**
 * E-mail transacional via SMTP (Resend / qualquer SMTP-compatível).
 *
 * Configuração via env (services/api/.env):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL, SMTP_FROM_NAME
 *
 * Uso:
 *   import { sendTransactional } from './lib/email';
 *   await sendTransactional({ to, subject, html, replyTo? });
 *
 * Política de erro:
 *   - Falha NÃO derruba a operação chamadora (caller decide o que fazer).
 *   - Sempre loga sucesso/falha estruturado.
 *   - Se SMTP não configurado, loga warning e retorna { sent: false, reason: 'NOT_CONFIGURED' }.
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { logger } from './logger.js';

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

interface SendResult {
  sent: boolean;
  messageId?: string;
  reason?: 'NOT_CONFIGURED' | 'SEND_FAILED';
  error?: string;
}

let transporter: Transporter | null = null;
let initialized = false;
let configMissing = false;

function getTransporter(): Transporter | null {
  if (initialized) return transporter;
  initialized = true;

  const host     = process.env.SMTP_HOST;
  const port     = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : NaN;
  const user     = process.env.SMTP_USER;
  const pass     = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    configMissing = true;
    logger.warn(
      { hasHost: !!host, hasPort: !!port, hasUser: !!user, hasPass: !!pass },
      '[email] SMTP não configurado — envios serão pulados',
    );
    return null;
  }

  // Porta 465 = SSL implícito (secure: true). 587 = STARTTLS (secure: false).
  const secure = port === 465;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  logger.info({ host, port, secure, user }, '✉️ [email] SMTP transporter inicializado');
  return transporter;
}

export async function sendTransactional({ to, subject, html, replyTo }: SendArgs): Promise<SendResult> {
  const t = getTransporter();
  if (!t) {
    return { sent: false, reason: 'NOT_CONFIGURED' };
  }

  const fromEmail = process.env.SMTP_FROM_EMAIL ?? 'noreply@santarem.app';
  const fromName  = process.env.SMTP_FROM_NAME  ?? 'VagasOeste';
  const from      = `"${fromName}" <${fromEmail}>`;

  try {
    const info = await t.sendMail({
      from,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    logger.info({ to, subject, messageId: info.messageId }, '✅ [email] enviado');
    return { sent: true, messageId: info.messageId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ to, subject, err: msg }, '❌ [email] falha ao enviar');
    return { sent: false, reason: 'SEND_FAILED', error: msg };
  }
}

/** Permite que o /health verifique se o SMTP está minimamente configurado. */
export function emailStatus(): { status: 'ok' | 'not_configured'; missing?: string[] } {
  if (configMissing) {
    const missing = [
      !process.env.SMTP_HOST && 'SMTP_HOST',
      !process.env.SMTP_PORT && 'SMTP_PORT',
      !process.env.SMTP_USER && 'SMTP_USER',
      !process.env.SMTP_PASS && 'SMTP_PASS',
    ].filter(Boolean) as string[];
    return { status: 'not_configured', missing };
  }
  // Inicializa lazy se ainda não foi
  getTransporter();
  return configMissing ? { status: 'not_configured' } : { status: 'ok' };
}
