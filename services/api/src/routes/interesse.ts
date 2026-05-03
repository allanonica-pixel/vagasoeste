/**
 * VagasOeste — Pré-cadastro de empresas (interesse)
 *
 * Fluxo:
 *  1. POST /v1/interesse/send-code        → gera OTP via WhatsApp (stub)
 *  2. POST /v1/interesse/verify-code      → valida OTP → sessionId
 *  3. POST /v1/interesse/submit           → salva pré-cadastro + dispara e-mail de ativação via Supabase
 *  4. GET  /v1/interesse/ativar?token=X   → confirma ativação → cria empresa (status parcial)
 *
 *  Auxiliares:
 *  GET  /v1/interesse/check-cnpj?cnpj=X
 *  POST /v1/interesse/invalidate-session
 */

import { Hono } from 'hono';
import { supabaseAdmin } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';
import { db } from '../lib/db.js';
import { companies } from '../schema/index.js';
import { eq } from 'drizzle-orm';
import { sendTransactional } from '../lib/email.js';
import { buildCompanyActivationEmail } from '../templates/company-emails.js';

export const interesseRouter = new Hono();

// ── Utilitários ────────────────────────────────────────────────────────────────

function gerarOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function mascaraTelefone(digits: string): string {
  if (digits.length === 11)
    return `(${digits.slice(0,2)}) ${digits[2]} ${digits.slice(3,7)}-${digits.slice(7)}`;
  if (digits.length === 10)
    return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  return digits;
}

function formatarCNPJ(digits: string): string {
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

async function enviarWhatsApp(phone: string, codigo: string): Promise<void> {
  const mensagem = `VagasOeste — Seu código de verificação é: *${codigo}*\n\nVálido por 10 minutos. Não compartilhe com ninguém.`;
  if (process.env.NODE_ENV !== 'production') {
    logger.info({ phone, codigo, mensagem }, '📱 [WhatsApp STUB]');
    return;
  }
  // TODO: integrar Evolution API / Z-API / Twilio
}

/**
 * Cria/recupera o usuário no auth.users e envia e-mail de ativação do pré-cadastro
 * usando SMTP transacional próprio (template HTML em pt-BR, paleta VagasOeste).
 *
 * Substitui o fluxo anterior que dependia do template "Invite user" default
 * do Supabase Auth (em inglês). Agora o e-mail é totalmente sob nosso controle.
 *
 * Estratégia:
 *  1. `createUser` (admin) — cria usuário com senha + e-mail confirmado=false.
 *     Se já existir, busca pelo e-mail e atualiza a senha (`updateUserById`).
 *  2. Monta link de ativação interno (`/ativar-empresa?token=...`) — não usa
 *     magiclink do Supabase; nosso backend valida o token de 48h em
 *     `empresa_pre_cadastros.activation_token`.
 *  3. Envia e-mail via `sendTransactional` com template `buildCompanyActivationEmail`.
 *
 * Retorna o supabase_auth_user_id criado/encontrado (null em caso de falha total).
 *
 * @param contactName Nome do contato responsável (para personalizar o e-mail)
 * @param cnpj        CNPJ formatado da empresa (para o e-mail)
 */
export async function gerarEEnviarLinkAtivacao(
  email:       string,
  senha:       string,
  companyName: string,
  token:       string,
  contactName = 'responsável',
  cnpj        = '',
): Promise<{ supabaseUserId: string | null }> {
  const siteUrl       = process.env.SITE_URL ?? 'http://localhost:4321';
  const activationUrl = `${siteUrl}/ativar-empresa?token=${token}`;

  let userId: string | null = null;

  // ── 1. Cria o usuário em auth.users (ou recupera existente) ────────────────
  const { data: createData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password:      senha,
    email_confirm: false, // confirmação ocorre quando empresa clica no link
    user_metadata: { role: 'empresa', company_name: companyName },
  });

  if (!createErr && createData?.user?.id) {
    userId = createData.user.id;
  } else {
    // Usuário já existe — busca e atualiza senha
    const { data: usersPage } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 5000 });
    const existing = usersPage?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (existing) {
      userId = existing.id;
      if (senha) {
        const { error: pwErr } = await supabaseAdmin.auth.admin
          .updateUserById(userId, { password: senha });
        if (pwErr) logger.warn({ pwErr, userId }, '[gerarLink] Falha ao atualizar senha em user existente');
      }
    } else {
      logger.error({ createErr, email }, '[gerarLink] Falha ao criar/localizar usuário');
      return { supabaseUserId: null };
    }
  }

  // ── 2. Envia e-mail via SMTP transacional próprio ──────────────────────────
  const emailContent = buildCompanyActivationEmail({
    contactName,
    companyName,
    cnpj,
    activationUrl,
    validityHours: 48,
  });

  const sendResult = await sendTransactional({
    to:      email,
    subject: emailContent.subject,
    html:    emailContent.html,
  });

  if (!sendResult.sent) {
    logger.error(
      { email, reason: sendResult.reason, error: sendResult.error },
      '[gerarLink] Falha ao enviar e-mail transacional de ativação',
    );
  } else {
    logger.info(
      { email, companyName, userId, messageId: sendResult.messageId },
      '✉️ [gerarLink] E-mail de ativação enviado via SMTP transacional',
    );
  }

  return { supabaseUserId: userId };
}

// ── Middleware: valida Content-Type ───────────────────────────────────────────
interesseRouter.use('*', async (c, next) => {
  if (c.req.method !== 'GET' && !c.req.header('content-type')?.includes('application/json')) {
    return c.json({ error: 'Content-Type deve ser application/json' }, 415);
  }
  await next();
});

// ── GET /v1/interesse/check-cnpj?cnpj=DIGITS ─────────────────────────────────
interesseRouter.get('/check-cnpj', async (c) => {
  const cnpjRaw = (c.req.query('cnpj') ?? '').replace(/\D/g, '');

  if (cnpjRaw.length !== 14) {
    return c.json({ error: 'CNPJ inválido.' }, 400);
  }

  const cnpjFmt = formatarCNPJ(cnpjRaw);

  const empresa =
    await db.query.companies.findFirst({ columns: { id: true, status: true }, where: eq(companies.cnpj, cnpjFmt) }).catch(() => null)
    ?? await db.query.companies.findFirst({ columns: { id: true, status: true }, where: eq(companies.cnpj, cnpjRaw) }).catch(() => null);

  if (empresa) {
    return c.json({ status: empresa.status === 'parcial' ? 'parcial' : 'ativo' });
  }

  const { data: preCad } = await supabaseAdmin
    .from('empresa_pre_cadastros')
    .select('id')
    .or(`cnpj.eq.${cnpjFmt},cnpj.eq.${cnpjRaw}`)
    .in('status', ['pendente', 'em_analise'])
    .is('ativado_em', null)
    .limit(1)
    .maybeSingle();

  if (preCad) return c.json({ status: 'pendente' });

  return c.json({ status: null });
});

// ── POST /v1/interesse/send-code ──────────────────────────────────────────────
interesseRouter.post('/send-code', async (c) => {
  let body: { phone?: string } = {};
  try { body = await c.req.json(); } catch { /**/ }
  const raw = (body.phone ?? '').replace(/\D/g, '');

  if (raw.length < 10 || raw.length > 11) {
    return c.json({ error: 'Número de WhatsApp inválido.' }, 400);
  }

  const codigo = gerarOTP();
  const expira = new Date(Date.now() + 10 * 60 * 1000);

  await supabaseAdmin.from('otp_codes').update({ used: true }).eq('phone', raw).eq('type', 'otp').eq('used', false);

  const { error } = await supabaseAdmin.from('otp_codes').insert({
    phone:      raw,
    code:       codigo,
    type:       'otp',
    expires_at: expira.toISOString(),
  });

  if (error) {
    logger.error({ error }, '[interesse] Erro ao salvar OTP');
    return c.json({ error: 'Erro interno. Tente novamente.' }, 500);
  }

  try { await enviarWhatsApp(raw, codigo); } catch (err) {
    logger.error({ err }, '[interesse] Falha WhatsApp');
  }

  return c.json({ success: true, maskedPhone: mascaraTelefone(raw) });
});

// ── POST /v1/interesse/verify-code ────────────────────────────────────────────
interesseRouter.post('/verify-code', async (c) => {
  let body: { phone?: string; code?: string } = {};
  try { body = await c.req.json(); } catch { /**/ }
  const raw  = (body.phone ?? '').replace(/\D/g, '');
  const code = (body.code ?? '').trim();

  if (!raw || !code) return c.json({ error: 'Dados incompletos.' }, 400);

  const { data, error } = await supabaseAdmin
    .from('otp_codes').select('id')
    .eq('phone', raw).eq('code', code).eq('type', 'otp').eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false }).limit(1).maybeSingle();

  if (error || !data) return c.json({ error: 'Código inválido ou expirado.' }, 400);

  await supabaseAdmin.from('otp_codes').update({ used: true }).eq('id', data.id);

  const expiraSessao = new Date(Date.now() + 30 * 60 * 1000);
  const { data: sessao, error: sessaoErr } = await supabaseAdmin
    .from('otp_codes')
    .insert({ phone: raw, code: crypto.randomUUID(), type: 'session', expires_at: expiraSessao.toISOString() })
    .select('id, code').single();

  if (sessaoErr || !sessao) {
    logger.error({ sessaoErr }, '[interesse] Erro ao criar sessão');
    return c.json({ error: 'Erro interno. Tente novamente.' }, 500);
  }

  return c.json({ success: true, sessionId: sessao.id });
});

// ── POST /v1/interesse/invalidate-session ─────────────────────────────────────
interesseRouter.post('/invalidate-session', async (c) => {
  let body: { sessionId?: string; phone?: string } = {};
  try { body = await c.req.json(); } catch { /**/ }
  const { sessionId, phone } = body;

  if (!sessionId && !phone) return c.json({ ok: true });
  const raw = (phone ?? '').replace(/\D/g, '');

  if (sessionId) {
    await supabaseAdmin.from('otp_codes').update({ used: true }).eq('id', sessionId).eq('type', 'session');
  } else if (raw) {
    await supabaseAdmin.from('otp_codes').update({ used: true }).eq('phone', raw).eq('type', 'session').eq('used', false);
  }

  return c.json({ ok: true });
});

// ── POST /v1/interesse/submit ─────────────────────────────────────────────────
interesseRouter.post('/submit', async (c) => {
  const body = await c.req.json<{
    sessionId:         string;
    phone:             string;
    cnpj?:             string;
    razao_social?:     string;
    company_name:      string;
    setores:           string[];
    neighborhood:      string;
    cep?:              string;
    logradouro?:       string;
    numero?:           string;
    bairro_empresa?:   string;
    contact_name:      string;
    contact_role:      string;
    contact_email:     string;
    contact_whatsapp:  string;
    contact_password?: string;
    vacancies_qty:     string;
    message?:          string;
  }>().catch(() => null);

  if (!body) return c.json({ error: 'Payload inválido.' }, 400);

  const raw = body.phone.replace(/\D/g, '');

  // Valida sessão OTP
  const { data: sessao, error: sessaoErr } = await supabaseAdmin
    .from('otp_codes').select('id')
    .eq('id', body.sessionId).eq('phone', raw).eq('type', 'session').eq('used', false)
    .gte('expires_at', new Date().toISOString()).maybeSingle();

  if (sessaoErr || !sessao) return c.json({ error: 'Sessão expirada. Faça a verificação novamente.' }, 401);

  await supabaseAdmin.from('otp_codes').update({ used: true }).eq('id', sessao.id);

  // Token de ativação (one-time, 48h)
  const activationToken   = crypto.randomUUID();
  const activationExpires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const senha             = body.contact_password ?? '';

  // Dispara e-mail ANTES do insert para capturar supabase_auth_user_id
  const { supabaseUserId } = await gerarEEnviarLinkAtivacao(
    body.contact_email,
    senha,
    body.company_name,
    activationToken,
    body.contact_name ?? 'responsável',
    body.cnpj         ?? '',
  );

  // Salva pré-cadastro
  const { error: insertErr } = await supabaseAdmin.from('empresa_pre_cadastros').insert({
    cnpj:                         body.cnpj           || null,
    razao_social:                 body.razao_social   || null,
    company_name:                 body.company_name,
    setores:                      body.setores        ?? [],
    neighborhood:                 body.neighborhood   || null,
    cep:                          body.cep            || null,
    logradouro:                   body.logradouro     || null,
    numero:                       body.numero         || null,
    bairro_empresa:               body.bairro_empresa || null,
    contact_name:                 body.contact_name,
    contact_role:                 body.contact_role,
    contact_email:                body.contact_email,
    contact_whatsapp:             raw,
    contact_password:             senha               || null,
    vacancies_qty:                body.vacancies_qty  || null,
    message:                      body.message        || null,
    status:                       'pendente',
    activation_token:             activationToken,
    activation_token_expires_at:  activationExpires,
    supabase_auth_user_id:        supabaseUserId,
  });

  if (insertErr) {
    logger.error({ error: insertErr }, '[interesse] Erro ao salvar pré-cadastro');
    return c.json({ error: 'Erro ao salvar. Tente novamente.' }, 500);
  }

  logger.info(
    { company: body.company_name, email: body.contact_email },
    '✅ [interesse] Pré-cadastro salvo — e-mail de ativação enviado',
  );

  return c.json({ success: true, email: body.contact_email });
});

// ── GET /v1/interesse/ativar?token=TOKEN ──────────────────────────────────────
// Chamado quando a empresa clica no link do e-mail (após Supabase confirmar o e-mail
// e redirecionar para /ativar-empresa?token=TOKEN).
// Cria o registro em companies (status 'parcial') e atualiza o app_metadata do usuário.
interesseRouter.get('/ativar', async (c) => {
  const token = (c.req.query('token') ?? '').trim();

  if (!token) return c.json({ error: 'TOKEN_MISSING', message: 'Token não informado.' }, 400);

  // Busca pré-cadastro pelo token
  const { data: preCad, error: findErr } = await supabaseAdmin
    .from('empresa_pre_cadastros').select('*').eq('activation_token', token).maybeSingle();

  if (findErr || !preCad) return c.json({ error: 'TOKEN_INVALID', message: 'Link inválido ou não encontrado.' }, 404);

  if (preCad.ativado_em) {
    return c.json({ error: 'ALREADY_ACTIVATED', message: 'Este link já foi utilizado.', company_name: preCad.company_name }, 409);
  }

  if (preCad.activation_token_expires_at && new Date(preCad.activation_token_expires_at) < new Date()) {
    return c.json({ error: 'TOKEN_EXPIRED', message: 'Link expirado. Solicite um novo pré-cadastro.' }, 410);
  }

  if (['rejeitado', 'inativo', 'excluido'].includes(preCad.status)) {
    return c.json({ error: 'PRECAD_UNAVAILABLE', message: 'Este pré-cadastro não está mais disponível.' }, 403);
  }

  const now     = new Date().toISOString();
  const email   = String(preCad.contact_email);
  const cnpjRaw = String(preCad.cnpj ?? '').replace(/\D/g, '');
  const cnpjFmt = cnpjRaw.length === 14 ? formatarCNPJ(cnpjRaw) : cnpjRaw;

  // ── 1. Resolve o supabase_auth_user_id ───────────────────────────────────
  // O ID pode já estar armazenado (salvo no submit ou no reenviar-ativacao).
  // Se não tiver, tenta via createUser (usuário nunca foi criado) ou via listUsers (fallback).
  let authUserId: string | null = preCad.supabase_auth_user_id ?? null;

  if (!authUserId) {
    const senha = String(preCad.contact_password ?? '');

    const { data: createData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password:      senha || crypto.randomUUID(),
      email_confirm: true,
      user_metadata: { role: 'empresa', company_name: preCad.company_name },
    });

    if (!createErr && createData?.user?.id) {
      authUserId = createData.user.id;
    } else {
      // Último recurso: localiza usuário existente por e-mail
      const { data: usersPage } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 5000 });
      authUserId = usersPage?.users?.find((u) => u.email === email)?.id ?? null;
    }
  }

  // ── 2. Cria ou localiza registro na tabela companies ─────────────────────
  let companyId: string | null = null;

  const compExisting =
    await db.query.companies.findFirst({ columns: { id: true }, where: eq(companies.cnpj, cnpjFmt) }).catch(() => null)
    ?? await db.query.companies.findFirst({ columns: { id: true }, where: eq(companies.cnpj, cnpjRaw) }).catch(() => null);

  if (compExisting) {
    companyId = compExisting.id;
    logger.warn({ companyId }, '[interesse/ativar] Empresa já existia — reutilizando registro');
  } else {
    try {
      const [created] = await db.insert(companies).values({
        cnpj:            cnpjFmt || cnpjRaw || `NOCNPJ-${preCad.id}`,
        razaoSocial:     String(preCad.razao_social || preCad.company_name),
        nomeFantasia:    String(preCad.company_name),
        sector:          Array.isArray(preCad.setores) && preCad.setores.length > 0 ? String(preCad.setores[0]) : null,
        bairro:          String(preCad.neighborhood || preCad.bairro_empresa || ''),
        endereco:        preCad.logradouro ? `${preCad.logradouro}, ${preCad.numero || 'S/N'}` : null,
        email,
        whatsapp:        String(preCad.contact_whatsapp ?? ''),
        responsavelNome:  String(preCad.contact_name  ?? ''),
        responsavelCargo: String(preCad.contact_role  ?? ''),
        authUserId:      authUserId,
        status:          'parcial',
      }).returning({ id: companies.id });
      companyId = created?.id ?? null;
    } catch (dbErr: any) {
      logger.error({ dbErr }, '[interesse/ativar] Erro ao criar empresa');
      // Tenta localizar por e-mail como último recurso
      const { data: byEmail } = await supabaseAdmin.from('companies').select('id').eq('email', email).maybeSingle();
      companyId = byEmail?.id ?? null;
    }
  }

  // ── 3. Atualiza app_metadata do usuário Supabase (injeta company_id no JWT) ──
  if (authUserId && companyId) {
    await supabaseAdmin.auth.admin
      .updateUserById(authUserId, {
        app_metadata: { role: 'empresa', company_id: companyId },
      })
      .catch((e) => logger.warn({ e }, '[interesse/ativar] Falha ao atualizar app_metadata'));

    // Garante que authUserId está na tabela companies
    await db.update(companies).set({ authUserId }).where(eq(companies.id, companyId)).catch(() => {});
  }

  // ── 4. Marca pré-cadastro como ativado (invalida token) ──────────────────
  await supabaseAdmin
    .from('empresa_pre_cadastros')
    .update({ ativado_em: now, activation_token: null, supabase_auth_user_id: authUserId })
    .eq('id', preCad.id);

  logger.info(
    { company: preCad.company_name, email, companyId, authUserId },
    '🟡 [interesse/ativar] Empresa ativada parcialmente — aguardando aprovação admin',
  );

  return c.json({ success: true, company_name: preCad.company_name, contact_email: email });
});
