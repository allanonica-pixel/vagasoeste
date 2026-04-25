import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { applications, candidates } from '../schema/index.js';
import { eq, and, desc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { rateLimit } from '../middleware/ratelimit.js';
import { logger } from '../lib/logger.js';

export const applicationsRouter = new Hono();

// Todas as rotas exigem candidato autenticado
applicationsRouter.use('*', requireAuth(), requireRole('candidato'));

const applySchema = z.object({
  jobId: z.string().uuid('ID da vaga inválido.'),
});

/**
 * POST /v1/applications
 * Candidatar-se a uma vaga.
 * Toda a lógica de validação acontece na função SQL apply_to_job()
 * — não confie em nada que veio do frontend.
 */
applicationsRouter.post(
  '/',
  rateLimit({ bucket: 'apply', limit: 5, windowSeconds: 60 }),
  zValidator('json', applySchema),
  async (c) => {
    const user  = c.get('user');
    const { jobId } = c.req.valid('json');

    // Busca o ID interno do candidato a partir do auth_user_id
    const candidate = await db.query.candidates.findFirst({
      where: eq(candidates.authUserId, user.id),
      columns: { id: true },
    });

    if (!candidate) {
      return c.json(
        { error: 'PROFILE_INCOMPLETE', message: 'Complete seu perfil antes de se candidatar.' },
        422
      );
    }

    const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown';
    const ua = c.req.header('User-Agent') ?? '';

    try {
      // Toda a lógica vive na função SQL (transação atômica):
      // - valida se vaga está ativa e não expirada
      // - impede candidatura duplicada (UNIQUE constraint)
      // - incrementa applicants_count atomicamente
      // - grava em audit.event_log
      const result = await db.execute(sql`
        SELECT public.apply_to_job(
          ${candidate.id}::uuid,
          ${jobId}::uuid,
          ${ip}::inet,
          ${ua}
        ) AS application_id
      `);

      const applicationId = (result[0] as { application_id: string }).application_id;

      logger.info({ userId: user.id, jobId, applicationId }, 'application: candidatura registrada');

      return c.json({ data: { applicationId } }, 201);

    } catch (err: any) {
      // Mapeamento de erros do Postgres para respostas HTTP semânticas
      const msg = err?.message ?? '';

      if (msg.includes('JOB_NOT_FOUND'))       return c.json({ error: 'NOT_FOUND',    message: 'Vaga não encontrada.' }, 404);
      if (msg.includes('JOB_NOT_APPLICABLE'))   return c.json({ error: 'CONFLICT',     message: 'Esta vaga não está mais aceitando candidaturas.' }, 409);
      if (msg.includes('unique') || msg.includes('duplicate')) {
        return c.json({ error: 'ALREADY_APPLIED', message: 'Você já se candidatou a esta vaga.' }, 409);
      }

      logger.error({ err, userId: user.id, jobId }, 'application: erro inesperado');
      return c.json({ error: 'INTERNAL_ERROR' }, 500);
    }
  }
);

/**
 * GET /v1/applications
 * Lista candidaturas do candidato logado (histórico pessoal).
 */
applicationsRouter.get('/', async (c) => {
  const user = c.get('user');

  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.authUserId, user.id),
    columns: { id: true },
  });

  if (!candidate) return c.json({ data: [] });

  const rows = await db.query.applications.findMany({
    where: eq(applications.candidateId, candidate.id),
    orderBy: [desc(applications.createdAt)],
    with: {
      job: {
        columns: {
          id: true, title: true, area: true,
          contractType: true, neighborhood: true, city: true,
          status: true,
        },
      },
    },
  });

  return c.json({ data: rows });
});

/**
 * DELETE /v1/applications/:id
 * Candidato retira sua candidatura (status → 'withdrawn').
 */
applicationsRouter.delete('/:id', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  const candidate = await db.query.candidates.findFirst({
    where: eq(candidates.authUserId, user.id),
    columns: { id: true },
  });

  if (!candidate) return c.json({ error: 'PROFILE_INCOMPLETE' }, 422);

  const application = await db.query.applications.findFirst({
    where: and(
      eq(applications.id, id),
      eq(applications.candidateId, candidate.id)
    ),
    columns: { id: true, status: true },
  });

  if (!application) return c.json({ error: 'NOT_FOUND' }, 404);

  if (!['pendente', 'em_analise'].includes(application.status ?? '')) {
    return c.json(
      { error: 'INVALID_STATE', message: 'Não é possível retirar candidatura neste estágio.' },
      409
    );
  }

  await db
    .update(applications)
    .set({ status: 'reprovado', updatedAt: new Date() })
    .where(eq(applications.id, id));

  logger.info({ userId: user.id, applicationId: id }, 'application: candidatura retirada');

  return c.json({ data: { success: true } });
});
