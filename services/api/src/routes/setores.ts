/**
 * Endpoints de Setores de Atuação.
 *
 * Público: GET /v1/setores  → lista setores ativos (pra forms públicos)
 * Admin:   GET/POST/PATCH/DELETE /v1/admin/setores
 */

import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { setores } from '../schema/index.js';
import { asc, eq } from 'drizzle-orm';
import { logger } from '../lib/logger.js';

export const setoresPublicRouter = new Hono();
export const setoresAdminRouter  = new Hono();

// Helper: gera slug a partir do nome
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

// ── PÚBLICO: GET /v1/setores ─────────────────────────────────────────────────
setoresPublicRouter.get('/', async (c) => {
  const rows = await db.query.setores.findMany({
    where:   eq(setores.ativo, true),
    orderBy: [asc(setores.ordem), asc(setores.nome)],
  });
  return c.json({ setores: rows });
});

// ── ADMIN: GET /v1/admin/setores ─────────────────────────────────────────────
setoresAdminRouter.get('/', async (c) => {
  const rows = await db.query.setores.findMany({
    orderBy: [asc(setores.ordem), asc(setores.nome)],
  });
  return c.json({ setores: rows });
});

// ── ADMIN: POST /v1/admin/setores ────────────────────────────────────────────
setoresAdminRouter.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const nome = typeof body?.nome === 'string' ? body.nome.trim() : '';
  if (!nome || nome.length < 2) {
    return c.json({ error: 'INVALID_NOME', message: 'Informe um nome de setor com 2+ caracteres.' }, 400);
  }
  const ordem = typeof body?.ordem === 'number' ? body.ordem : 0;

  try {
    const [created] = await db.insert(setores).values({
      nome,
      slug: slugify(nome),
      ordem,
      ativo: true,
    }).returning();
    logger.info({ setorId: created.id, nome }, '[admin/setores] Setor criado');
    return c.json({ setor: created });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return c.json({ error: 'DUPLICATE', message: 'Já existe setor com esse nome.' }, 409);
    }
    logger.error({ err: msg, nome }, '[admin/setores] Erro ao criar setor');
    return c.json({ error: 'INTERNAL', message: 'Erro ao criar setor.' }, 500);
  }
});

// ── ADMIN: PATCH /v1/admin/setores/:id ───────────────────────────────────────
setoresAdminRouter.patch('/:id', async (c) => {
  const id   = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const updates: Partial<typeof setores.$inferInsert> = { updatedAt: new Date() };

  if (typeof body?.nome === 'string') {
    const nome = body.nome.trim();
    if (nome.length < 2) return c.json({ error: 'INVALID_NOME', message: 'Nome muito curto.' }, 400);
    updates.nome = nome;
    updates.slug = slugify(nome);
  }
  if (typeof body?.ordem === 'number') updates.ordem = body.ordem;
  if (typeof body?.ativo === 'boolean') updates.ativo = body.ativo;

  try {
    const [updated] = await db.update(setores).set(updates).where(eq(setores.id, id)).returning();
    if (!updated) return c.json({ error: 'NOT_FOUND', message: 'Setor não encontrado.' }, 404);
    return c.json({ setor: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return c.json({ error: 'DUPLICATE', message: 'Já existe setor com esse nome.' }, 409);
    }
    logger.error({ err: msg, id }, '[admin/setores] Erro ao atualizar setor');
    return c.json({ error: 'INTERNAL', message: 'Erro ao atualizar setor.' }, 500);
  }
});

// ── ADMIN: DELETE /v1/admin/setores/:id ──────────────────────────────────────
// Soft delete via ativo=false. Hard delete não é oferecido pra preservar referências
// históricas em empresas/vagas (que armazenam o nome do setor como texto).
setoresAdminRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const [updated] = await db.update(setores).set({ ativo: false, updatedAt: new Date() }).where(eq(setores.id, id)).returning();
  if (!updated) return c.json({ error: 'NOT_FOUND', message: 'Setor não encontrado.' }, 404);
  return c.json({ setor: updated });
});
