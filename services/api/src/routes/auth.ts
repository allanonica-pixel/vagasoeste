import { Hono, type Context } from 'hono';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../lib/db.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { candidates, companies, adminUsers } from '../schema/index.js';
import { eq } from 'drizzle-orm';
import { logger } from '../lib/logger.js';

export const authRouter = new Hono();

// ────────────────────────────────────────────────────────────────────────────
// Rate limiter in-memory — protege /forgot-password contra bots e enumeração
// ────────────────────────────────────────────────────────────────────────────

interface RateBucket {
  attempts: number;
  windowStart: number; // timestamp do início da janela atual
  blockedUntil: number; // 0 = não bloqueado
}

const ipBuckets    = new Map<string, RateBucket>();
const emailBuckets = new Map<string, RateBucket>();

const WINDOW_MS       = 15 * 60 * 1000; // janela de 15 minutos
const IP_MAX          = 10;             // 10 tentativas por IP por janela (tolerante a NAT/VPN compartilhado)
const EMAIL_MAX       = 3;              // 3 tentativas por email por janela (mais restritivo)
const BLOCK_MS        = 15 * 60 * 1000; // bloqueio de 15 min ao esgotar a cota

/** Limpa entradas expiradas a cada 30 min para evitar leak de memória */
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of ipBuckets) {
    if (now > Math.max(v.windowStart + WINDOW_MS, v.blockedUntil)) ipBuckets.delete(k);
  }
  for (const [k, v] of emailBuckets) {
    if (now > Math.max(v.windowStart + WINDOW_MS, v.blockedUntil)) emailBuckets.delete(k);
  }
}, 30 * 60 * 1000);

function checkBucket(
  map: Map<string, RateBucket>,
  key: string,
  max: number,
): { ok: boolean; retryAfter?: number; remaining?: number } {
  const now = Date.now();
  const existing = map.get(key);

  // Sem bucket ou janela expirada (e fora do bloqueio)
  if (!existing || (now - existing.windowStart > WINDOW_MS && now > existing.blockedUntil)) {
    map.set(key, { attempts: 1, windowStart: now, blockedUntil: 0 });
    return { ok: true, remaining: max - 1 };
  }

  // Bloqueado
  if (existing.blockedUntil > now) {
    return { ok: false, retryAfter: Math.ceil((existing.blockedUntil - now) / 1000) };
  }

  // Dentro da janela — incrementa
  existing.attempts += 1;

  if (existing.attempts > max) {
    existing.blockedUntil = now + BLOCK_MS;
    logger.warn({ key, attempts: existing.attempts }, '🚫 Rate limit atingido em /forgot-password');
    return { ok: false, retryAfter: Math.ceil(BLOCK_MS / 1000) };
  }

  return { ok: true, remaining: max - existing.attempts };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getClientIP(c: Context<any>): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
    c.req.header('x-real-ip') ??
    'unknown'
  );
}

// ────────────────────────────────────────────────────────────────────────────
// GET /v1/auth/check-email?email=...
// Verifica se um e-mail já está cadastrado na base de candidatos.
// Público — usado no formulário de cadastro (onBlur do campo email).
// ────────────────────────────────────────────────────────────────────────────
authRouter.get('/check-email', async (c) => {
  const email = c.req.query('email')?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: 'INVALID_EMAIL' }, 400);
  }

  const existing = await db.query.candidates.findFirst({
    where: eq(candidates.email, email),
    columns: { id: true },
  });

  return c.json({ exists: !!existing });
});

// ────────────────────────────────────────────────────────────────────────────
// POST /v1/auth/forgot-password
//
// Fluxo seguro de recuperação de senha:
//  1. Rate limit por IP  — bloqueia bots / flooding
//  2. Rate limit por email — bloqueia enumeração em massa
//  3. Verifica existência do email em candidates + companies + admin_users
//  4. Dispara resetPasswordForEmail via Supabase Auth
//
// Retornos:
//  200 { ok: true }                             — email enviado
//  400 { error: 'INVALID_EMAIL' }               — email malformado
//  404 { error: 'EMAIL_NOT_FOUND' }             — email não cadastrado
//  429 { error: 'TOO_MANY_REQUESTS', retryAfter: number } — rate limit atingido
//  500 { error: 'RESET_FAILED' }                — falha interna
// ────────────────────────────────────────────────────────────────────────────
authRouter.post('/forgot-password', async (c) => {
  const ip = getClientIP(c);

  // ── 1. Rate limit por IP ──────────────────────────────────────────────────
  const ipCheck = checkBucket(ipBuckets, ip, IP_MAX);
  if (!ipCheck.ok) {
    logger.warn({ ip, retryAfter: ipCheck.retryAfter }, '🚫 IP bloqueado em /forgot-password');
    return c.json(
      { error: 'TOO_MANY_REQUESTS', message: 'Muitas tentativas. Tente novamente mais tarde.', retryAfter: ipCheck.retryAfter },
      429,
    );
  }

  // ── 2. Valida body ────────────────────────────────────────────────────────
  const body = await c.req.json().catch(() => null);
  const rawEmail = typeof body?.email === 'string' ? body.email.trim() : '';
  const email = rawEmail.toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: 'INVALID_EMAIL', message: 'Informe um endereço de email válido.' }, 400);
  }

  // ── 3. Rate limit por email ────────────────────────────────────────────────
  const emailCheck = checkBucket(emailBuckets, email, EMAIL_MAX);
  if (!emailCheck.ok) {
    logger.warn({ email, retryAfter: emailCheck.retryAfter }, '🚫 Email bloqueado em /forgot-password');
    return c.json(
      { error: 'TOO_MANY_REQUESTS', message: 'Muitas solicitações para este email. Aguarde antes de tentar novamente.', retryAfter: emailCheck.retryAfter },
      429,
    );
  }

  // ── 4. Verifica existência via supabaseAdmin (bypass RLS, sem depender do Drizzle) ──
  // Inclui empresa_pre_cadastros.contact_email como fallback — empresas que ativaram
  // pré-cadastro mas ainda não foram aprovadas pelo admin estão lá.
  // Defesa em profundidade: cobre estado fantasma onde companies pode estar vazio.
  const [{ data: candRow }, { data: compRow }, { data: admRow }, { data: preCadRow }] = await Promise.all([
    supabaseAdmin.from('candidates').select('id').eq('email', email).maybeSingle(),
    supabaseAdmin.from('companies').select('id').eq('email', email).maybeSingle(),
    supabaseAdmin.from('admin_users').select('id').eq('email', email).maybeSingle(),
    supabaseAdmin.from('empresa_pre_cadastros').select('id, ativado_em').eq('contact_email', email).maybeSingle(),
  ]);

  // Pré-cadastro só conta como existente se já ativado (auth.users tem email_confirmed)
  // Sem isso, resetPasswordForEmail falha silenciosamente em users não confirmados.
  const preCadValid = preCadRow && (preCadRow as { ativado_em?: string | null }).ativado_em != null;

  const emailExists = !!(candRow ?? compRow ?? admRow ?? (preCadValid ? preCadRow : null));

  if (!emailExists) {
    logger.info({ email, ip }, '📧 Tentativa de recuperação para email não cadastrado');
    return c.json(
      { error: 'EMAIL_NOT_FOUND', message: 'Email não encontrado na plataforma.' },
      404,
    );
  }

  // ── 5. Dispara o reset pelo Supabase Auth ─────────────────────────────────
  const platformUrl = process.env.PLATFORM_URL ?? 'http://localhost:3001';
  const redirectTo  = `${platformUrl}/redefinir-senha`;

  // Usa supabaseAdmin — não depende do SUPABASE_ANON_KEY na API
  const { error: resetErr } = await supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo });

  if (resetErr) {
    logger.error({ resetErr, email }, '❌ Erro ao disparar resetPasswordForEmail');
    return c.json({ error: 'RESET_FAILED', message: 'Erro ao enviar email. Tente novamente.' }, 500);
  }

  logger.info({ email, ip }, '✅ Link de recuperação enviado');
  return c.json({ ok: true });
});

// ────────────────────────────────────────────────────────────────────────────
// GET /v1/auth/me
// Retorna o perfil do usuário autenticado de acordo com seu papel.
// ────────────────────────────────────────────────────────────────────────────
authRouter.get('/me', requireAuth(), async (c) => {
  const user = c.get('user');

  if (user.role === 'candidato') {
    const profile = await db.query.candidates.findFirst({
      where: eq(candidates.authUserId, user.id),
      columns: {
        id: true,
        nomeCompleto: true,
        email: true,
        headline: true,
        cidade: true,
        estado: true,
        profileComplete: true,
        status: true,
      },
    });

    return c.json({ role: 'candidato', profile: profile ?? null });
  }

  if (user.role === 'empresa') {
    const company = await db.query.companies.findFirst({
      where: eq(companies.authUserId, user.id),
      columns: {
        id: true,
        nomeFantasia: true,
        razaoSocial: true,
        email: true,
        status: true,
        plano: true,
        planoExpiraEm: true,
      },
    });

    return c.json({
      role: 'empresa',
      mfaVerified: user.mfaVerified,
      company: company ?? null,
    });
  }

  if (user.role === 'admin') {
    const admin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.authUserId, user.id),
      columns: { id: true, nome: true, email: true, role: true },
    });

    return c.json({ role: 'admin', admin: admin ?? null });
  }

  return c.json({ error: 'UNKNOWN_ROLE' }, 400);
});
