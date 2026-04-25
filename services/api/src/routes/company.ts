/**
 * Rotas da empresa — VagasOeste API
 *
 * Todas as rotas exigem: requireAuth() + requireRole('empresa') + requireMfa()
 *
 * Sub-usuários:
 * - Usuário principal: identificado por companies.auth_user_id = user.id
 * - Sub-usuário (convidado): identificado por app_metadata.company_id = company.id
 * - resolveCompany() abstrai os dois casos para todas as rotas
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { jobs, applications, companies } from '../schema/index.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { requireAuth, requireRole, requireMfa, type AuthUser } from '../middleware/auth.js';
import { rateLimit } from '../middleware/ratelimit.js';
import { logger } from '../lib/logger.js';

export const companyRouter = new Hono();

// Todas as rotas exigem: autenticado + papel empresa + MFA verificado
companyRouter.use('*', requireAuth(), requireRole('empresa'), requireMfa());

// ============================================================
// HELPER — resolve a empresa pelo contexto do usuário
// ============================================================

/**
 * Usuário principal → busca por companies.auth_user_id = user.id
 * Sub-usuário convidado → busca por companies.id = user.companyId (app_metadata)
 *
 * O companyId já vem validado pelo JWT (app_metadata, server-side).
 * Nunca confiar em body param para identificar a empresa.
 */
async function resolveCompany(user: AuthUser) {
  if (user.companyId) {
    return db.query.companies.findFirst({
      where: eq(companies.id, user.companyId),
    });
  }
  return db.query.companies.findFirst({
    where: eq(companies.authUserId, user.id),
  });
}

// ============================================================
// VAGAS DA EMPRESA
// ============================================================

/**
 * GET /v1/company/jobs
 * Lista todas as vagas da empresa (principal ou sub-usuário).
 */
companyRouter.get('/jobs', async (c) => {
  const user = c.get('user');
  const company = await resolveCompany(user);
  if (!company) return c.json({ error: 'COMPANY_NOT_FOUND' }, 404);

  const rows = await db.query.jobs.findMany({
    where: eq(jobs.companyId, company.id),
    columns: {
      id: true, title: true, area: true, contractType: true,
      status: true, applicantsCount: true, publishedAt: true, expiresAt: true,
    },
    orderBy: [desc(jobs.createdAt)],
  });

  return c.json({ data: rows });
});

const createJobSchema = z.object({
  title:          z.string().min(5).max(255),
  area:           z.string().max(100).optional(),
  sector:         z.string().max(100).optional(),
  contractType:   z.enum(['CLT', 'PJ', 'Temporário', 'Freelance', 'Estágio']),
  workMode:       z.enum(['Presencial', 'Híbrido', 'Remoto']).default('Presencial'),
  neighborhood:   z.string().max(100).optional(),
  description:    z.string().min(50),
  requirements:   z.string().optional(),
  benefits:       z.string().optional(),
  salaryRange:    z.string().max(100).optional(),
  vacancies:      z.coerce.number().int().min(1).default(1),
  educationLevel: z.string().optional(),
  schedule:       z.string().max(100).optional(),
  tags:           z.array(z.string()).default([]),
});

/**
 * POST /v1/company/jobs
 * Cria uma nova vaga (status inicial: pendente, aguarda aprovação admin).
 */
companyRouter.post('/jobs', zValidator('json', createJobSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  const company = await resolveCompany(user);
  if (!company) return c.json({ error: 'COMPANY_NOT_FOUND' }, 404);

  if (company.status !== 'ativo') {
    return c.json(
      { error: 'COMPANY_INACTIVE', message: 'Empresa aguardando validação ou suspensa.' },
      403
    );
  }

  const [newJob] = await db.insert(jobs).values({
    companyId:      company.id,
    title:          body.title,
    area:           body.area,
    sector:         body.sector,
    contractType:   body.contractType as any,
    workMode:       body.workMode as any,
    neighborhood:   body.neighborhood,
    city:           'Santarém',
    state:          'PA',
    description:    body.description,
    requirements:   body.requirements,
    benefits:       body.benefits,
    salaryRange:    body.salaryRange,
    vacancies:      body.vacancies,
    educationLevel: body.educationLevel as any,
    schedule:       body.schedule,
    tags:           body.tags,
    status:         'pendente',
  }).returning({ id: jobs.id });

  logger.info({ userId: user.id, companyId: company.id, jobId: newJob.id }, 'company: vaga criada');

  return c.json({ data: { jobId: newJob.id } }, 201);
});

/**
 * POST /v1/company/jobs/:id/publish
 * Publica uma vaga via função SQL atômica com validação de plano.
 */
companyRouter.post('/jobs/:id/publish', async (c) => {
  const user = c.get('user');
  const { id: jobId } = c.req.param();

  const company = await resolveCompany(user);
  if (!company) return c.json({ error: 'COMPANY_NOT_FOUND' }, 404);

  try {
    await db.execute(sql`
      SELECT company.publish_job(${company.id}::uuid, ${jobId}::uuid)
    `);

    logger.info({ userId: user.id, jobId }, 'company: vaga publicada');
    return c.json({ data: { success: true } });

  } catch (err: any) {
    const msg = err?.message ?? '';
    if (msg.includes('FORBIDDEN'))          return c.json({ error: 'FORBIDDEN' }, 403);
    if (msg.includes('PLAN_LIMIT_REACHED')) return c.json({ error: 'PLAN_LIMIT_REACHED', message: 'Limite de vagas ativas do seu plano atingido.' }, 402);
    if (msg.includes('NOT_FOUND'))          return c.json({ error: 'NOT_FOUND' }, 404);

    logger.error({ err, userId: user.id, jobId }, 'company: erro ao publicar vaga');
    return c.json({ error: 'INTERNAL_ERROR' }, 500);
  }
});

// ============================================================
// CANDIDATURAS RECEBIDAS
// ============================================================

/**
 * GET /v1/company/jobs/:jobId/applications
 * Lista candidaturas de uma vaga com mascaramento progressivo de PII.
 */
companyRouter.get('/jobs/:jobId/applications', async (c) => {
  const user = c.get('user');
  const { jobId } = c.req.param();

  const company = await resolveCompany(user);
  if (!company) return c.json({ error: 'COMPANY_NOT_FOUND' }, 404);

  // Garante que a vaga pertence à empresa antes de listar candidaturas
  const job = await db.query.jobs.findFirst({
    where: and(eq(jobs.id, jobId), eq(jobs.companyId, company.id)),
    columns: { id: true, title: true },
  });
  if (!job) return c.json({ error: 'NOT_FOUND' }, 404);

  const rows = await db.query.applications.findMany({
    where: and(
      eq(applications.jobId, jobId),
      eq(applications.companyId, company.id)
    ),
    orderBy: [desc(applications.createdAt)],
    with: {
      candidate: {
        columns: {
          id: true,
          nomeCompleto: true,
          headline: true,
          cidade: true,
          estado: true,
          // email e telefone omitidos — só revelados via status avançado
        },
      },
    },
  });

  // Mascaramento progressivo: nome completo só após pré-entrevista+
  const masked = rows.map((app) => {
    const revealed = ['pre_entrevista', 'entrevista', 'aprovado', 'contratado'].includes(app.status ?? '');
    return {
      id:        app.id,
      status:    app.status,
      createdAt: app.createdAt,
      candidate: {
        id:       app.candidate?.id,
        headline: app.candidate?.headline,
        cidade:   app.candidate?.cidade,
        estado:   app.candidate?.estado,
        nome: revealed
          ? app.candidate?.nomeCompleto
          : maskName(app.candidate?.nomeCompleto ?? ''),
      },
    };
  });

  return c.json({ data: masked, job: { id: job.id, title: job.title } });
});

/**
 * PATCH /v1/company/applications/:id/status
 * Avança o status de uma candidatura com histórico.
 */
const updateStatusSchema = z.object({
  status: z.enum(['em_analise', 'pre_entrevista', 'entrevista', 'aprovado', 'reprovado']),
  notes:  z.string().max(1000).optional(),
});

companyRouter.patch(
  '/applications/:id/status',
  zValidator('json', updateStatusSchema),
  async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();
    const { status, notes } = c.req.valid('json');

    const company = await resolveCompany(user);
    if (!company) return c.json({ error: 'COMPANY_NOT_FOUND' }, 404);

    const application = await db.query.applications.findFirst({
      where: and(eq(applications.id, id), eq(applications.companyId, company.id)),
      columns: { id: true, status: true, statusHistory: true },
    });
    if (!application) return c.json({ error: 'NOT_FOUND' }, 404);

    const history = Array.isArray(application.statusHistory) ? application.statusHistory : [];
    history.push({ status, date: new Date().toISOString(), note: notes ?? null });

    await db.update(applications)
      .set({ status: status as any, statusHistory: history, notes, updatedAt: new Date() })
      .where(eq(applications.id, id));

    logger.info({ userId: user.id, applicationId: id, status }, 'company: status de candidatura atualizado');

    return c.json({ data: { success: true, status } });
  }
);

// ============================================================
// GESTÃO DE SUB-USUÁRIOS
// ============================================================

const inviteUserSchema = z.object({
  email: z.string().email('Email inválido.'),
});

/**
 * POST /v1/empresa/invite-user
 * Convida um colaborador para acessar o painel da empresa.
 *
 * Fluxo:
 * 1. Supabase envia email de convite com link de acesso
 * 2. app_metadata.role = "empresa" e company_id são definidos server-side
 * 3. first_access = true força troca de senha + enroll MFA no primeiro login
 *
 * Segurança:
 * - Empresa identificada pelo JWT (nunca por body param)
 * - Rate limit: 3 convites por hora por empresa
 * - Sub-usuário não pode convidar outros sub-usuários
 */
companyRouter.post(
  '/invite-user',
  rateLimit({ bucket: 'invite_user', limit: 3, windowSeconds: 3600 }),
  zValidator('json', inviteUserSchema),
  async (c) => {
    const user = c.get('user');
    const { email } = c.req.valid('json');

    // Sub-usuário não pode convidar outros
    if (user.companyId) {
      return c.json(
        { error: 'FORBIDDEN', message: 'Apenas o usuário gestor pode convidar colaboradores.' },
        403
      );
    }

    const company = await resolveCompany(user);
    if (!company) return c.json({ error: 'COMPANY_NOT_FOUND' }, 404);

    if (company.status !== 'ativo') {
      return c.json(
        { error: 'COMPANY_INACTIVE', message: 'Empresa inativa ou suspensa.' },
        403
      );
    }

    const appUrl = process.env.APP_URL ?? 'https://app.santarem.app';

    // Envia email de convite — Supabase gera link de acesso temporário
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: `${appUrl}/login`,
        data: { first_access: true }, // user_metadata
      }
    );

    if (inviteError) {
      const msg = inviteError.message ?? '';
      if (msg.toLowerCase().includes('already been registered')) {
        return c.json({ error: 'USER_ALREADY_EXISTS', message: 'Este email já possui uma conta na plataforma.' }, 409);
      }
      logger.error({ err: inviteError, email }, 'empresa: erro ao enviar convite');
      return c.json({ error: 'INVITE_FAILED', message: 'Não foi possível enviar o convite.' }, 500);
    }

    // Define app_metadata server-side (não modificável pelo usuário convidado)
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      inviteData.user.id,
      {
        app_metadata: {
          role: 'empresa',
          company_id: company.id,
          first_access: true,
        },
      }
    );

    if (updateError) {
      // Reverter: deletar usuário criado para não deixar órfão sem role
      await supabaseAdmin.auth.admin.deleteUser(inviteData.user.id).catch(() => {});
      logger.error({ err: updateError, userId: inviteData.user.id }, 'empresa: erro ao definir app_metadata — usuário deletado');
      return c.json({ error: 'INVITE_FAILED', message: 'Erro ao configurar permissões do colaborador.' }, 500);
    }

    logger.info(
      { actorId: user.id, invitedEmail: email, companyId: company.id, invitedUserId: inviteData.user.id },
      'empresa: colaborador convidado'
    );

    return c.json({ data: { success: true, email } }, 201);
  }
);

/**
 * GET /v1/empresa/users
 * Lista todos os usuários com acesso ao painel da empresa.
 * Retorna: gestor principal + sub-usuários convidados.
 */
companyRouter.get('/users', async (c) => {
  const user = c.get('user');
  const company = await resolveCompany(user);
  if (!company) return c.json({ error: 'COMPANY_NOT_FOUND' }, 404);

  // Busca todos os usuários (paginado — max 1000 para pequeno volume)
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

  if (error) {
    logger.error({ err: error }, 'empresa: erro ao listar usuários');
    return c.json({ error: 'INTERNAL_ERROR' }, 500);
  }

  // Filtra: usuário principal (auth_user_id na tabela companies) + sub-usuários (app_metadata.company_id)
  const companyUsers = data.users
    .filter(u =>
      u.app_metadata?.company_id === company.id ||
      (u.id === user.id && !user.companyId)
    )
    .map(u => ({
      id:         u.id,
      email:      u.email ?? '',
      mfaEnabled: (u.factors?.length ?? 0) > 0,
      lastSignIn: u.last_sign_in_at ?? null,
      createdAt:  u.created_at,
      isMain:     !u.app_metadata?.company_id, // gestor principal não tem company_id no app_metadata
    }));

  return c.json({ data: companyUsers });
});

/**
 * DELETE /v1/empresa/users/:userId
 * Remove o acesso de um sub-usuário ao painel da empresa.
 *
 * Regras:
 * - Apenas o gestor principal pode remover colaboradores
 * - Não é possível remover a si mesmo
 * - Verifica que o usuário pertence à mesma empresa antes de revogar
 */
companyRouter.delete('/users/:userId', async (c) => {
  const user = c.get('user');
  const { userId } = c.req.param();

  // Apenas gestor principal pode remover (sub-usuário tem companyId no JWT)
  if (user.companyId) {
    return c.json(
      { error: 'FORBIDDEN', message: 'Apenas o gestor principal pode remover colaboradores.' },
      403
    );
  }

  if (userId === user.id) {
    return c.json(
      { error: 'FORBIDDEN', message: 'Não é possível remover o próprio acesso.' },
      403
    );
  }

  const company = await resolveCompany(user);
  if (!company) return c.json({ error: 'COMPANY_NOT_FOUND' }, 404);

  // Verifica que o usuário a remover pertence à mesma empresa
  const { data: { user: targetUser }, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (fetchError || !targetUser) {
    return c.json({ error: 'NOT_FOUND', message: 'Usuário não encontrado.' }, 404);
  }

  if (targetUser.app_metadata?.company_id !== company.id) {
    return c.json(
      { error: 'FORBIDDEN', message: 'Este usuário não pertence à sua empresa.' },
      403
    );
  }

  // Revoga acesso: remove role e company_id do app_metadata
  // Não deleta a conta — preserva histórico de auditoria
  await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { role: null, company_id: null, first_access: null },
  });

  logger.info(
    { actorId: user.id, removedUserId: userId, companyId: company.id },
    'empresa: acesso de colaborador revogado'
  );

  return c.json({ data: { success: true } });
});

// ============================================================
// HELPERS
// ============================================================

function maskName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '***';
  return parts[0] + (parts.length > 1 ? ' ' + parts.slice(1).map(p => p[0] + '***').join(' ') : '');
}
