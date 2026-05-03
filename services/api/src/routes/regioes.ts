/**
 * Endpoints de Regiões Atendidas (Estados / Cidades / Bairros).
 *
 * Público: GET /v1/regioes/cobertas → estrutura hierárquica de regiões ativas
 *          (consumido pelos dropdowns do /interesse-empresa)
 * Admin:   GET/POST/PATCH/DELETE /v1/admin/regioes/...
 */

import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { estados, cidades, bairros } from '../schema/index.js';
import { asc, eq } from 'drizzle-orm';
import { logger } from '../lib/logger.js';

export const regioesPublicRouter = new Hono();
export const regioesAdminRouter  = new Hono();

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ────────────────────────────────────────────────────────────────────────────
// PÚBLICO
// ────────────────────────────────────────────────────────────────────────────

// GET /v1/regioes/cobertas — hierarquia ativos (estado → cidades → bairros)
regioesPublicRouter.get('/cobertas', async (c) => {
  const ativosEstados = await db.query.estados.findMany({
    where:   eq(estados.ativo, true),
    orderBy: [asc(estados.nome)],
  });
  const ativasCidades = await db.query.cidades.findMany({
    where:   eq(cidades.ativo, true),
    orderBy: [asc(cidades.nome)],
  });
  const ativosBairros = await db.query.bairros.findMany({
    where:   eq(bairros.ativo, true),
    orderBy: [asc(bairros.nome)],
  });

  const tree = ativosEstados.map((est) => ({
    ...est,
    cidades: ativasCidades
      .filter((cid) => cid.estadoId === est.id)
      .map((cid) => ({
        ...cid,
        bairros: ativosBairros.filter((bai) => bai.cidadeId === cid.id),
      })),
  }));

  return c.json({ regioes: tree });
});

// ────────────────────────────────────────────────────────────────────────────
// ADMIN — Estados
// ────────────────────────────────────────────────────────────────────────────

regioesAdminRouter.get('/estados', async (c) => {
  const rows = await db.query.estados.findMany({ orderBy: [asc(estados.nome)] });
  return c.json({ estados: rows });
});

regioesAdminRouter.post('/estados', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const uf   = typeof body?.uf === 'string'   ? body.uf.trim().toUpperCase() : '';
  const nome = typeof body?.nome === 'string' ? body.nome.trim() : '';

  if (uf.length !== 2)            return c.json({ error: 'INVALID_UF',   message: 'UF deve ter 2 letras.' }, 400);
  if (nome.length < 3)            return c.json({ error: 'INVALID_NOME', message: 'Nome do estado muito curto.' }, 400);

  try {
    const [created] = await db.insert(estados).values({ uf, nome, ativo: true }).returning();
    return c.json({ estado: created });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return c.json({ error: 'DUPLICATE', message: 'Estado com essa UF já cadastrado.' }, 409);
    }
    logger.error({ err: msg, uf }, '[admin/regioes] Erro ao criar estado');
    return c.json({ error: 'INTERNAL', message: 'Erro ao criar estado.' }, 500);
  }
});

regioesAdminRouter.patch('/estados/:id', async (c) => {
  const id   = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const updates: Partial<typeof estados.$inferInsert> = { updatedAt: new Date() };
  if (typeof body?.nome === 'string')  updates.nome  = body.nome.trim();
  if (typeof body?.ativo === 'boolean') updates.ativo = body.ativo;

  const [updated] = await db.update(estados).set(updates).where(eq(estados.id, id)).returning();
  if (!updated) return c.json({ error: 'NOT_FOUND', message: 'Estado não encontrado.' }, 404);
  return c.json({ estado: updated });
});

// ────────────────────────────────────────────────────────────────────────────
// ADMIN — Cidades
// ────────────────────────────────────────────────────────────────────────────

regioesAdminRouter.get('/cidades', async (c) => {
  const estadoId = c.req.query('estado_id');
  const rows = estadoId
    ? await db.query.cidades.findMany({ where: eq(cidades.estadoId, estadoId), orderBy: [asc(cidades.nome)] })
    : await db.query.cidades.findMany({ orderBy: [asc(cidades.nome)] });
  return c.json({ cidades: rows });
});

regioesAdminRouter.post('/cidades', async (c) => {
  const body     = await c.req.json().catch(() => ({}));
  const estadoId = typeof body?.estado_id === 'string' ? body.estado_id : '';
  const nome     = typeof body?.nome      === 'string' ? body.nome.trim() : '';

  if (!estadoId)         return c.json({ error: 'INVALID_ESTADO', message: 'Informe estado_id.' }, 400);
  if (nome.length < 2)   return c.json({ error: 'INVALID_NOME',   message: 'Nome de cidade muito curto.' }, 400);

  // Confere que estado existe
  const estado = await db.query.estados.findFirst({ where: eq(estados.id, estadoId) });
  if (!estado) return c.json({ error: 'ESTADO_NOT_FOUND', message: 'Estado não encontrado.' }, 404);

  try {
    const [created] = await db.insert(cidades).values({
      estadoId,
      nome,
      slug: `${slugify(nome)}-${estado.uf.toLowerCase()}`,
      ativo: true,
    }).returning();
    return c.json({ cidade: created });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return c.json({ error: 'DUPLICATE', message: 'Cidade com esse nome já cadastrada nesse estado.' }, 409);
    }
    logger.error({ err: msg }, '[admin/regioes] Erro ao criar cidade');
    return c.json({ error: 'INTERNAL', message: 'Erro ao criar cidade.' }, 500);
  }
});

regioesAdminRouter.patch('/cidades/:id', async (c) => {
  const id   = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const updates: Partial<typeof cidades.$inferInsert> = { updatedAt: new Date() };
  if (typeof body?.nome === 'string') {
    const nome = body.nome.trim();
    if (nome.length < 2) return c.json({ error: 'INVALID_NOME', message: 'Nome muito curto.' }, 400);
    updates.nome = nome;
    updates.slug = slugify(nome);
  }
  if (typeof body?.ativo === 'boolean') updates.ativo = body.ativo;

  const [updated] = await db.update(cidades).set(updates).where(eq(cidades.id, id)).returning();
  if (!updated) return c.json({ error: 'NOT_FOUND', message: 'Cidade não encontrada.' }, 404);
  return c.json({ cidade: updated });
});

// ────────────────────────────────────────────────────────────────────────────
// ADMIN — Bairros
// ────────────────────────────────────────────────────────────────────────────

regioesAdminRouter.get('/bairros', async (c) => {
  const cidadeId = c.req.query('cidade_id');
  const rows = cidadeId
    ? await db.query.bairros.findMany({ where: eq(bairros.cidadeId, cidadeId), orderBy: [asc(bairros.nome)] })
    : await db.query.bairros.findMany({ orderBy: [asc(bairros.nome)] });
  return c.json({ bairros: rows });
});

regioesAdminRouter.post('/bairros', async (c) => {
  const body     = await c.req.json().catch(() => ({}));
  const cidadeId = typeof body?.cidade_id === 'string' ? body.cidade_id : '';
  const nome     = typeof body?.nome      === 'string' ? body.nome.trim() : '';

  if (!cidadeId)        return c.json({ error: 'INVALID_CIDADE', message: 'Informe cidade_id.' }, 400);
  if (nome.length < 2)  return c.json({ error: 'INVALID_NOME',   message: 'Nome de bairro muito curto.' }, 400);

  const cidade = await db.query.cidades.findFirst({ where: eq(cidades.id, cidadeId) });
  if (!cidade) return c.json({ error: 'CIDADE_NOT_FOUND', message: 'Cidade não encontrada.' }, 404);

  try {
    const [created] = await db.insert(bairros).values({
      cidadeId,
      nome,
      slug: slugify(nome),
      ativo: true,
    }).returning();
    return c.json({ bairro: created });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return c.json({ error: 'DUPLICATE', message: 'Bairro com esse nome já cadastrado nesta cidade.' }, 409);
    }
    logger.error({ err: msg }, '[admin/regioes] Erro ao criar bairro');
    return c.json({ error: 'INTERNAL', message: 'Erro ao criar bairro.' }, 500);
  }
});

regioesAdminRouter.patch('/bairros/:id', async (c) => {
  const id   = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const updates: Partial<typeof bairros.$inferInsert> = { updatedAt: new Date() };
  if (typeof body?.nome === 'string') {
    const nome = body.nome.trim();
    if (nome.length < 2) return c.json({ error: 'INVALID_NOME', message: 'Nome muito curto.' }, 400);
    updates.nome = nome;
    updates.slug = slugify(nome);
  }
  if (typeof body?.ativo === 'boolean') updates.ativo = body.ativo;

  const [updated] = await db.update(bairros).set(updates).where(eq(bairros.id, id)).returning();
  if (!updated) return c.json({ error: 'NOT_FOUND', message: 'Bairro não encontrado.' }, 404);
  return c.json({ bairro: updated });
});
