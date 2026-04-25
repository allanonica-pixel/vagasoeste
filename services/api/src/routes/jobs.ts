import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { jobs } from '../schema/index.js';
import { eq, and, ilike, sql, desc } from 'drizzle-orm';
import { logger } from '../lib/logger.js';
import { rateLimit } from '../middleware/ratelimit.js';

export const jobsRouter = new Hono();

const listQuerySchema = z.object({
  q:            z.string().optional(),
  contractType: z.string().optional(),
  workMode:     z.string().optional(),
  neighborhood: z.string().optional(),
  city:         z.string().optional(),
  state:        z.string().optional(),
  page:         z.coerce.number().int().min(1).default(1),
  limit:        z.coerce.number().int().min(1).max(50).default(20),
});

/**
 * GET /v1/jobs
 * Listagem pública de vagas ativas com filtros e paginação.
 * Não requer autenticação.
 * Rate limit: 30 req / 60s por IP — protege o full-text search contra DDoS/scraping.
 */
jobsRouter.get(
  '/',
  rateLimit({ bucket: 'jobs_list', limit: 30, windowSeconds: 60 }),
  zValidator('query', listQuerySchema),
  async (c) => {
  const { q, contractType, workMode, neighborhood, city, state, page, limit } = c.req.valid('query');
  const offset = (page - 1) * limit;

  try {
    // Monta filtros dinamicamente
    const filters = [eq(jobs.status, 'ativo')];

    if (contractType) filters.push(eq(jobs.contractType, contractType as any));
    if (workMode)     filters.push(eq(jobs.workMode, workMode as any));
    if (neighborhood) filters.push(ilike(jobs.neighborhood, `%${neighborhood}%`));
    if (city)         filters.push(ilike(jobs.city, `%${city}%`));
    if (state)        filters.push(eq(jobs.state, state.toUpperCase()));

    if (q) {
      // Full-text search usando tsvector do Postgres
      filters.push(
        sql`to_tsvector('portuguese', coalesce(${jobs.title},'') || ' ' || coalesce(${jobs.area},'') || ' ' || coalesce(${jobs.description},''))
            @@ plainto_tsquery('portuguese', ${q})`
      );
    }

    const where = and(...filters);

    const [rows, countResult] = await Promise.all([
      db.select({
        id:             jobs.id,
        slug:           jobs.slug,
        title:          jobs.title,
        area:           jobs.area,
        contractType:   jobs.contractType,
        workMode:       jobs.workMode,
        neighborhood:   jobs.neighborhood,
        city:           jobs.city,
        state:          jobs.state,
        salaryRange:    jobs.salaryRange,
        vacancies:      jobs.vacancies,
        publishedAt:    jobs.publishedAt,
        applicantsCount:jobs.applicantsCount,
      })
        .from(jobs)
        .where(where)
        .orderBy(desc(jobs.publishedAt))
        .limit(limit)
        .offset(offset),

      db.select({ total: sql<number>`count(*)::int` })
        .from(jobs)
        .where(where),
    ]);

    const total = countResult[0]?.total ?? 0;

    return c.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
      },
    });
  } catch (err) {
    logger.error({ err }, 'jobs: erro ao listar vagas');
    return c.json({ error: 'INTERNAL_ERROR' }, 500);
  }
});

/**
 * GET /v1/jobs/:id
 * Detalhe de uma vaga pública (qualquer usuário, inclusive não autenticado).
 * Incrementa views_count atomicamente.
 */
jobsRouter.get('/:id', async (c) => {
  const { id } = c.req.param();

  try {
    // Busca por ID ou por slug
    const isUuid = /^[0-9a-f-]{36}$/i.test(id);
    const condition = isUuid
      ? and(eq(jobs.id, id), eq(jobs.status, 'ativo'))
      : and(eq(jobs.slug, id), eq(jobs.status, 'ativo'));

    const job = await db.query.jobs.findFirst({
      where: condition,
      columns: {
        id: true,
        slug: true,
        title: true,
        area: true,
        sector: true,
        contractType: true,
        workMode: true,
        neighborhood: true,
        city: true,
        state: true,
        salaryRange: true,
        description: true,
        requirements: true,
        benefits: true,
        educationLevel: true,
        schedule: true,
        vacancies: true,
        tags: true,
        viewsCount: true,
        applicantsCount: true,
        publishedAt: true,
        expiresAt: true,
        metaTitle: true,
        metaDescription: true,
      },
    });

    if (!job) {
      return c.json({ error: 'NOT_FOUND', message: 'Vaga não encontrada.' }, 404);
    }

    // Incrementa views de forma fire-and-forget (não bloqueia resposta)
    db.execute(sql`UPDATE jobs SET views_count = views_count + 1 WHERE id = ${job.id}`)
      .catch((err) => logger.warn({ err, jobId: job.id }, 'jobs: falha ao incrementar views'));

    return c.json({ data: job });
  } catch (err) {
    logger.error({ err, id }, 'jobs: erro ao buscar vaga');
    return c.json({ error: 'INTERNAL_ERROR' }, 500);
  }
});
