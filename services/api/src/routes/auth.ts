import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../lib/db.js';
import { candidates, companies, adminUsers } from '../schema/index.js';
import { eq } from 'drizzle-orm';

export const authRouter = new Hono();

/**
 * GET /v1/auth/me
 * Retorna o perfil do usuário autenticado de acordo com seu papel.
 * O frontend usa este endpoint para hidratar o estado de sessão.
 */
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
