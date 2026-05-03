/**
 * VagasOeste — Rotas administrativas
 *
 * Exigem: requireAuth() + requireRole('admin')
 *
 * Endpoints:
 *  GET  /v1/admin/action-reasons                        → lista motivos de inativação/exclusão
 *  POST /v1/admin/action-reasons                        → cadastra novo motivo
 *  POST /v1/admin/companies/:id/inativar                → inativa empresa (cascata vagas)
 *  POST /v1/admin/companies/:id/excluir                 → exclusão lógica (cascata vagas)
 *  POST /v1/admin/companies/:id/reativar                → reativa empresa inativa
 *  POST /v1/admin/companies/:id/reenviar-ativacao       → reenvia e-mail de ativação
 *  POST /v1/admin/companies/:id/aprovar                 → aprova empresa ativada (etapa 2)
 *  POST /v1/admin/companies/:id/rejeitar                → rejeita pré-cadastro
 *  GET  /v1/admin/audit                                 → trilha de auditoria
 */

import { Hono } from 'hono';
import { supabaseAdmin } from '../lib/supabase.js';
import { db } from '../lib/db.js';
import { companies, jobs } from '../schema/index.js';
import { eq, inArray, and } from 'drizzle-orm';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';
import { gerarEEnviarLinkAtivacao } from './interesse.js';
import { sendTransactional } from '../lib/email.js';
import { buildCompanyApprovedEmail, buildCompanyRejectedEmail } from '../templates/company-emails.js';

export const adminRouter = new Hono();

// Todas as rotas exigem admin autenticado
adminRouter.use('*', requireAuth(), requireRole('admin'));

// ── GET /v1/admin/action-reasons ──────────────────────────────────────────────
adminRouter.get('/action-reasons', async (c) => {
  const actionType = c.req.query('action_type'); // optional filter

  let query = supabaseAdmin
    .from('company_action_reasons')
    .select('*')
    .order('reason', { ascending: true });

  if (actionType && actionType !== 'ambos') {
    query = supabaseAdmin
      .from('company_action_reasons')
      .select('*')
      .or(`action_type.eq.${actionType},action_type.eq.ambos`)
      .order('reason', { ascending: true });
  }

  const { data, error } = await query;
  if (error) {
    logger.error({ error }, '[admin] Erro ao listar motivos');
    return c.json({ error: 'Erro ao buscar motivos.' }, 500);
  }

  return c.json({ reasons: data });
});

// ── POST /v1/admin/action-reasons ─────────────────────────────────────────────
adminRouter.post('/action-reasons', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{ reason: string; action_type?: string }>().catch(() => null);

  if (!body?.reason?.trim()) {
    return c.json({ error: 'Motivo é obrigatório.' }, 400);
  }

  const { data, error } = await supabaseAdmin
    .from('company_action_reasons')
    .insert({
      reason:      body.reason.trim(),
      action_type: body.action_type ?? 'ambos',
      created_by:  user.email,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      return c.json({ error: 'Esse motivo já está cadastrado.' }, 409);
    }
    logger.error({ error }, '[admin] Erro ao criar motivo');
    return c.json({ error: 'Erro ao salvar motivo.' }, 500);
  }

  return c.json({ reason: data }, 201);
});

// ── POST /v1/admin/companies/:id/inativar ─────────────────────────────────────
// :id = empresa_pre_cadastros.id
adminRouter.post('/companies/:id/inativar', async (c) => {
  const user     = c.get('user');
  const preId    = c.req.param('id');
  const body     = await c.req.json<{
    reason_id?:   string;
    reason_text?: string;
    admin_name:   string;
  }>().catch(() => null);

  if (!body) return c.json({ error: 'Payload inválido.' }, 400);

  // 1. Busca o pré-cadastro
  const { data: preCad, error: preErr } = await supabaseAdmin
    .from('empresa_pre_cadastros')
    .select('*')
    .eq('id', preId)
    .single();

  if (preErr || !preCad) return c.json({ error: 'Empresa não encontrada.' }, 404);
  if (preCad.status === 'inativo') return c.json({ error: 'Empresa já está inativa.' }, 409);
  if (preCad.status === 'excluido') return c.json({ error: 'Empresa excluída não pode ser inativada.' }, 409);

  const now = new Date().toISOString();
  const adminName = body.admin_name || user.email;
  const cnpjRaw = String(preCad.cnpj ?? '').replace(/\D/g, '');

  // 2. Atualiza pré-cadastro
  await supabaseAdmin
    .from('empresa_pre_cadastros')
    .update({ status: 'inativo', updated_at: now })
    .eq('id', preId);

  // 3. Tenta inativar empresa na tabela companies (por CNPJ)
  let companyDbId: string | null = null;
  if (cnpjRaw) {
    const [companyFormatted, companyRaw] = await Promise.all([
      db.query.companies.findFirst({
        columns: { id: true },
        where: eq(companies.cnpj, String(preCad.cnpj)),
      }).catch(() => null),
      db.query.companies.findFirst({
        columns: { id: true },
        where: eq(companies.cnpj, cnpjRaw),
      }).catch(() => null),
    ]);

    const company = companyFormatted || companyRaw;
    if (company) {
      companyDbId = company.id;
      // Inativa a empresa e todas as vagas ativas
      await Promise.all([
        db.update(companies)
          .set({
            status:      'inativo' as const,
            inativadoEm: new Date(now),
            inativadoPor: adminName,
          })
          .where(eq(companies.id, company.id)),

        // Pausa todas as vagas ativas e pendentes
        db.update(jobs)
          .set({ status: 'pausado' as const, updatedAt: new Date(now) })
          .where(and(
            eq(jobs.companyId, company.id),
            inArray(jobs.status, ['ativo', 'pendente']),
          )),
      ]);
    }
  }

  // 4. Registra na auditoria
  await supabaseAdmin.from('company_audit_log').insert({
    pre_cadastro_id:      preId,
    company_id:           companyDbId,
    company_name:         String(preCad.company_name),
    company_cnpj:         String(preCad.cnpj ?? ''),
    action:               'inativacao',
    reason_id:            body.reason_id ?? null,
    reason_text:          body.reason_text ?? null,
    performed_by_user_id: user.id,
    performed_by_name:    adminName,
    performed_by_role:    'admin',
    performed_at:         now,
  });

  logger.info({ preId, company: preCad.company_name, admin: adminName }, '🔴 [admin] Empresa inativada');

  return c.json({ success: true });
});

// ── POST /v1/admin/companies/:id/excluir ──────────────────────────────────────
adminRouter.post('/companies/:id/excluir', async (c) => {
  const user  = c.get('user');
  const preId = c.req.param('id');
  const body  = await c.req.json<{
    reason_id?:   string;
    reason_text?: string;
    admin_name:   string;
  }>().catch(() => null);

  if (!body) return c.json({ error: 'Payload inválido.' }, 400);

  const { data: preCad, error: preErr } = await supabaseAdmin
    .from('empresa_pre_cadastros')
    .select('*')
    .eq('id', preId)
    .single();

  if (preErr || !preCad) return c.json({ error: 'Empresa não encontrada.' }, 404);
  if (preCad.status === 'excluido') return c.json({ error: 'Empresa já está excluída.' }, 409);

  const now = new Date().toISOString();
  const adminName = body.admin_name || user.email;
  const cnpjRaw = String(preCad.cnpj ?? '').replace(/\D/g, '');

  // 1. Marca pré-cadastro como excluído
  await supabaseAdmin
    .from('empresa_pre_cadastros')
    .update({ status: 'excluido', updated_at: now })
    .eq('id', preId);

  // 2. Tenta excluir logicamente na tabela companies
  let companyDbId: string | null = null;
  if (cnpjRaw) {
    const [c1, c2] = await Promise.all([
      db.query.companies.findFirst({ columns: { id: true }, where: eq(companies.cnpj, String(preCad.cnpj)) }).catch(() => null),
      db.query.companies.findFirst({ columns: { id: true }, where: eq(companies.cnpj, cnpjRaw) }).catch(() => null),
    ]);
    const company = c1 || c2;
    if (company) {
      companyDbId = company.id;
      await Promise.all([
        db.update(companies)
          .set({ status: 'excluido' as const, excluidoEm: new Date(now), excluidoPor: adminName })
          .where(eq(companies.id, company.id)),
        db.update(jobs)
          .set({ status: 'encerrado' as const, updatedAt: new Date(now) })
          .where(eq(jobs.companyId, company.id)),
      ]);
    }
  }

  // 3. Auditoria
  await supabaseAdmin.from('company_audit_log').insert({
    pre_cadastro_id:      preId,
    company_id:           companyDbId,
    company_name:         String(preCad.company_name),
    company_cnpj:         String(preCad.cnpj ?? ''),
    action:               'exclusao',
    reason_id:            body.reason_id ?? null,
    reason_text:          body.reason_text ?? null,
    performed_by_user_id: user.id,
    performed_by_name:    adminName,
    performed_by_role:    'admin',
    performed_at:         now,
  });

  logger.info({ preId, company: preCad.company_name, admin: adminName }, '🗑️ [admin] Empresa excluída');

  return c.json({ success: true });
});

// ── POST /v1/admin/companies/:id/reativar ─────────────────────────────────────
adminRouter.post('/companies/:id/reativar', async (c) => {
  const user  = c.get('user');
  const preId = c.req.param('id');
  const body  = await c.req.json<{ admin_name: string }>().catch(() => null);

  const { data: preCad, error: preErr } = await supabaseAdmin
    .from('empresa_pre_cadastros')
    .select('*')
    .eq('id', preId)
    .single();

  if (preErr || !preCad) return c.json({ error: 'Empresa não encontrada.' }, 404);
  if (preCad.status !== 'inativo') return c.json({ error: 'Apenas empresas inativas podem ser reativadas.' }, 409);

  const now = new Date().toISOString();
  const adminName = body?.admin_name || user.email;
  const cnpjRaw = String(preCad.cnpj ?? '').replace(/\D/g, '');

  // 1. Reativa pré-cadastro
  await supabaseAdmin
    .from('empresa_pre_cadastros')
    .update({ status: 'aprovado', updated_at: now })
    .eq('id', preId);

  // 2. Reativa na tabela companies
  if (cnpjRaw) {
    const [c1, c2] = await Promise.all([
      db.query.companies.findFirst({ columns: { id: true }, where: eq(companies.cnpj, String(preCad.cnpj)) }).catch(() => null),
      db.query.companies.findFirst({ columns: { id: true }, where: eq(companies.cnpj, cnpjRaw) }).catch(() => null),
    ]);
    const company = c1 || c2;
    if (company) {
      await db.update(companies)
        .set({ status: 'ativo' as const, inativadoEm: null, inativadoPor: null })
        .where(eq(companies.id, company.id));
    }
  }

  // 3. Auditoria
  await supabaseAdmin.from('company_audit_log').insert({
    pre_cadastro_id:      preId,
    company_name:         String(preCad.company_name),
    company_cnpj:         String(preCad.cnpj ?? ''),
    action:               'reativacao',
    performed_by_user_id: user.id,
    performed_by_name:    adminName,
    performed_by_role:    'admin',
    performed_at:         now,
  });

  logger.info({ preId, company: preCad.company_name }, '🟢 [admin] Empresa reativada');

  return c.json({ success: true });
});

// ── POST /v1/admin/companies/:id/reenviar-ativacao ────────────────────────────
// Regenera o token de ativação e reenvia o e-mail via Supabase confirm_signup.
// Só é permitido para pré-cadastros que ainda não foram ativados (ativado_em IS NULL)
// e cujo status não seja excluido, inativo ou rejeitado.
adminRouter.post('/companies/:id/reenviar-ativacao', async (c) => {
  const preId = c.req.param('id');

  // 1. Busca o pré-cadastro
  const { data: preCad, error: preErr } = await supabaseAdmin
    .from('empresa_pre_cadastros')
    .select('*')
    .eq('id', preId)
    .single();

  if (preErr || !preCad) return c.json({ error: 'Pré-cadastro não encontrado.' }, 404);
  if (preCad.ativado_em)  return c.json({ error: 'ALREADY_ACTIVATED', message: 'Este pré-cadastro já foi ativado.' }, 409);
  if (['excluido', 'inativo', 'rejeitado'].includes(String(preCad.status))) {
    return c.json({ error: 'PRECAD_UNAVAILABLE', message: 'Este pré-cadastro não está disponível para reenvio.' }, 403);
  }

  // 2. Gera novo token + validade de 48h
  const newToken  = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  // 3. Dispara e-mail via SMTP transacional próprio
  const { supabaseUserId } = await gerarEEnviarLinkAtivacao(
    String(preCad.contact_email   ?? ''),
    String(preCad.contact_password ?? ''),
    String(preCad.company_name    ?? ''),
    newToken,
    String(preCad.contact_name    ?? 'responsável'),
    String(preCad.cnpj            ?? ''),
  );

  // 4. Persiste novo token (e, se obtivemos um user id novo, também o armazena)
  const updatePayload: Record<string, unknown> = {
    activation_token:            newToken,
    activation_token_expires_at: expiresAt,
    updated_at:                  new Date().toISOString(),
  };
  if (supabaseUserId) updatePayload.supabase_auth_user_id = supabaseUserId;

  const { error: updErr } = await supabaseAdmin
    .from('empresa_pre_cadastros')
    .update(updatePayload)
    .eq('id', preId);

  if (updErr) {
    logger.error({ updErr, preId }, '[admin] Erro ao persistir novo token de ativação');
    return c.json({ error: 'Erro ao salvar novo token. Tente novamente.' }, 500);
  }

  logger.info({ preId, company: preCad.company_name, email: preCad.contact_email }, '📧 [admin] E-mail de ativação reenviado');

  return c.json({ success: true, email: String(preCad.contact_email ?? '') });
});

// ── POST /v1/admin/companies/:id/aprovar ──────────────────────────────────────
// Aprova um pré-cadastro de empresa (etapa 2 do fluxo).
//
// Pré-condições:
//   1. empresa_pre_cadastros existe
//   2. ativado_em IS NOT NULL  → empresa já clicou no link de ativação (etapa 1)
//   3. existe row em companies vinculada (status = 'parcial')
//   4. status atual do pre_cadastro permite aprovação (pendente)
//
// Efeitos:
//   - empresa_pre_cadastros.status = 'aprovado'
//   - companies.status = 'ativo' + validadoEm = now
//   - Todas as jobs WHERE company_id = X AND status = 'pendente' viram 'ativo'
//   - (Plano B no e-mail) Loga aprovação e retorna email_pending: true
//     A integração com SMTP transacional está na Fase 2 — ver ADR 0002
adminRouter.post('/companies/:id/aprovar', async (c) => {
  const preId = c.req.param('id');
  const now   = new Date().toISOString();

  // 1. Busca o pré-cadastro
  const { data: preCad, error: preErr } = await supabaseAdmin
    .from('empresa_pre_cadastros')
    .select('*')
    .eq('id', preId)
    .single();

  if (preErr || !preCad) return c.json({ error: 'Pré-cadastro não encontrado.' }, 404);

  // 2. Valida que empresa ativou (etapa 1) — sem isso, não pode aprovar
  if (!preCad.ativado_em) {
    return c.json({
      error: 'NOT_ACTIVATED',
      message: 'Empresa ainda não ativou o pré-cadastro. Use "Reenviar e-mail de ativação".',
    }, 400);
  }

  // 3. Valida status atual permite aprovação
  if (preCad.status === 'aprovado') return c.json({ error: 'ALREADY_APPROVED', message: 'Empresa já está aprovada.' }, 409);
  if (['rejeitado', 'inativo', 'excluido'].includes(String(preCad.status))) {
    return c.json({ error: 'PRECAD_UNAVAILABLE', message: 'Pré-cadastro não está disponível para aprovação.' }, 403);
  }

  // 4. Localiza row em companies (linkada por contact_email — fallback por cnpj)
  const email = String(preCad.contact_email ?? '').toLowerCase();
  const cnpj  = String(preCad.cnpj ?? '');

  const company =
    await db.query.companies.findFirst({ where: eq(companies.email, email) }).catch(() => null)
    ?? (cnpj ? await db.query.companies.findFirst({ where: eq(companies.cnpj, cnpj) }).catch(() => null) : null);

  if (!company) {
    logger.error({ preId, email }, '[admin/aprovar] Estado inconsistente: pre_cadastro ativado mas sem row em companies');
    return c.json({
      error: 'COMPANY_MISSING',
      message: 'Estado inconsistente — empresa ativou mas registro principal não existe. Contate o desenvolvedor.',
    }, 500);
  }

  if (company.status === 'ativo') {
    logger.info({ preId, companyId: company.id }, '[admin/aprovar] Empresa já estava como ativo — só sincroniza pre_cadastro');
  }

  // 5. Atualiza companies → ativo
  await db.update(companies)
    .set({ status: 'ativo', validadoEm: new Date(now), updatedAt: new Date(now) })
    .where(eq(companies.id, company.id));

  // 6. Promove vagas pendentes da empresa para ativo
  const promotedJobs = await db.update(jobs)
    .set({ status: 'ativo', publishedAt: new Date(now), updatedAt: new Date(now) })
    .where(and(eq(jobs.companyId, company.id), eq(jobs.status, 'pendente')))
    .returning({ id: jobs.id });

  // 7. Atualiza pre_cadastro
  await supabaseAdmin
    .from('empresa_pre_cadastros')
    .update({ status: 'aprovado', updated_at: now })
    .eq('id', preId);

  logger.info({
    preId,
    companyId: company.id,
    company: preCad.company_name,
    email,
    promotedJobsCount: promotedJobs.length,
  }, '✅ [admin/aprovar] Empresa aprovada — vagas promovidas');

  // 8. Envia e-mail real de aprovação ao contact_email
  //    Falha de e-mail NÃO derruba a aprovação — banco já está consistente.
  const platformBase = process.env.APP_URL ?? 'http://localhost:3001';
  const approvedEmail = buildCompanyApprovedEmail({
    contactName:      String(preCad.contact_name ?? 'responsável'),
    companyName:      String(preCad.company_name ?? 'sua empresa'),
    cnpj:             String(preCad.cnpj ?? ''),
    promotedJobsCount: promotedJobs.length,
    loginUrl:         `${platformBase}/login`,
  });

  const sendResult = await sendTransactional({
    to:      email,
    subject: approvedEmail.subject,
    html:    approvedEmail.html,
  });

  return c.json({
    success: true,
    company_id: company.id,
    promoted_jobs_count: promotedJobs.length,
    email_sent: sendResult.sent,
    email_reason: sendResult.sent ? undefined : sendResult.reason,
    message: sendResult.sent
      ? 'Empresa aprovada e e-mail de notificação enviado.'
      : 'Empresa aprovada. E-mail de notificação NÃO foi enviado — verifique configuração SMTP.',
  });
});

// ── POST /v1/admin/companies/:id/rejeitar ─────────────────────────────────────
// Rejeita um pré-cadastro de empresa.
//
// Pré-condições:
//   1. empresa_pre_cadastros existe
//   2. status atual é 'pendente' (ou 'aprovado' caso queira reverter)
//
// Efeitos:
//   - empresa_pre_cadastros.status = 'rejeitado' + motivo_rejeicao
//   - Se houver row em companies, marca como inativo
//   - Vagas existentes da empresa viram 'encerrado'
//   - (Plano B no e-mail) email_pending: true (Fase 2 envia)
adminRouter.post('/companies/:id/rejeitar', async (c) => {
  const preId = c.req.param('id');
  const body  = await c.req.json().catch(() => ({}));
  const motivo = typeof body?.motivo === 'string' ? body.motivo.trim() : '';
  const now   = new Date().toISOString();

  if (!motivo) {
    return c.json({ error: 'MOTIVO_REQUIRED', message: 'Informe o motivo da rejeição.' }, 400);
  }

  const { data: preCad, error: preErr } = await supabaseAdmin
    .from('empresa_pre_cadastros')
    .select('*')
    .eq('id', preId)
    .single();

  if (preErr || !preCad) return c.json({ error: 'Pré-cadastro não encontrado.' }, 404);

  if (preCad.status === 'rejeitado') return c.json({ error: 'ALREADY_REJECTED', message: 'Pré-cadastro já está rejeitado.' }, 409);
  if (['inativo', 'excluido'].includes(String(preCad.status))) {
    return c.json({ error: 'PRECAD_UNAVAILABLE', message: 'Pré-cadastro não pode ser rejeitado neste estado.' }, 403);
  }

  // 1. Atualiza pre_cadastro com motivo
  await supabaseAdmin
    .from('empresa_pre_cadastros')
    .update({ status: 'rejeitado', motivo_rejeicao: motivo, updated_at: now })
    .eq('id', preId);

  // 2. Se já havia row em companies (empresa tinha ativado), marca como inativo + encerra vagas
  const email = String(preCad.contact_email ?? '').toLowerCase();
  const cnpj  = String(preCad.cnpj ?? '');

  const company =
    await db.query.companies.findFirst({ where: eq(companies.email, email) }).catch(() => null)
    ?? (cnpj ? await db.query.companies.findFirst({ where: eq(companies.cnpj, cnpj) }).catch(() => null) : null);

  let cancelledJobsCount = 0;
  if (company) {
    await db.update(companies)
      .set({ status: 'rejeitado', motivoRejeicao: motivo, updatedAt: new Date(now) })
      .where(eq(companies.id, company.id));

    const cancelled = await db.update(jobs)
      .set({ status: 'encerrado', updatedAt: new Date(now) })
      .where(and(eq(jobs.companyId, company.id), inArray(jobs.status, ['ativo', 'pendente', 'pausado'])))
      .returning({ id: jobs.id });

    cancelledJobsCount = cancelled.length;
  }

  logger.info({
    preId,
    companyId: company?.id,
    company: preCad.company_name,
    email,
    motivo,
    cancelledJobsCount,
  }, '🔴 [admin/rejeitar] Pré-cadastro rejeitado');

  // Envia e-mail real de rejeição com motivo
  const platformBase = process.env.APP_URL ?? 'http://localhost:3001';
  const rejectedEmail = buildCompanyRejectedEmail({
    contactName:        String(preCad.contact_name ?? 'responsável'),
    companyName:        String(preCad.company_name ?? 'sua empresa'),
    cnpj:               String(preCad.cnpj ?? ''),
    motivo,
    contactSupportUrl:  `${platformBase}/contato`,
  });

  const sendResult = await sendTransactional({
    to:      email,
    subject: rejectedEmail.subject,
    html:    rejectedEmail.html,
  });

  return c.json({
    success: true,
    company_id: company?.id ?? null,
    cancelled_jobs_count: cancelledJobsCount,
    email_sent: sendResult.sent,
    email_reason: sendResult.sent ? undefined : sendResult.reason,
    message: sendResult.sent
      ? 'Pré-cadastro rejeitado e e-mail de notificação enviado.'
      : 'Pré-cadastro rejeitado. E-mail de notificação NÃO foi enviado — verifique configuração SMTP.',
  });
});

// ── GET /v1/admin/audit ───────────────────────────────────────────────────────
adminRouter.get('/audit', async (c) => {
  const limit  = Math.min(Number(c.req.query('limit') ?? 50), 100);
  const offset = Number(c.req.query('offset') ?? 0);
  const action = c.req.query('action');
  const role   = c.req.query('role');

  let query = supabaseAdmin
    .from('company_audit_log')
    .select('*, company_action_reasons(reason, action_type)', { count: 'exact' })
    .order('performed_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (action) query = query.eq('action', action) as typeof query;
  if (role)   query = query.eq('performed_by_role', role) as typeof query;

  const { data, error, count } = await query;

  if (error) {
    logger.error({ error }, '[admin] Erro ao buscar auditoria');
    return c.json({ error: 'Erro ao buscar auditoria.' }, 500);
  }

  return c.json({ log: data, total: count ?? 0 });
});
