/**
 * Middleware de autenticação — VagasOeste API
 *
 * Valida o JWT emitido pelo Supabase Auth e injeta o usuário
 * no contexto do Hono. Toda rota protegida chama este middleware.
 *
 * O frontend envia: Authorization: Bearer <supabase_access_token>
 */

import type { Context, Next } from 'hono';
import { createMiddleware } from 'hono/factory';
import { supabaseAdmin } from '../lib/supabase.js';
import { db } from '../lib/db.js';
import { companies } from '../schema/index.js';
import { eq } from 'drizzle-orm';
import { logger } from '../lib/logger.js';

export type UserRole = 'candidato' | 'empresa' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  companyId?: string;   // preenchido se role === 'empresa'
  mfaVerified: boolean;
}

// Variável de contexto tipada
declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

/**
 * requireAuth — exige JWT válido.
 * Uso: app.use('/v1/applications/*', requireAuth())
 */
export const requireAuth = () =>
  createMiddleware(async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'UNAUTHORIZED', message: 'Token não fornecido.' }, 401);
    }

    const token = authHeader.slice(7);

    // Valida o JWT com Supabase Auth
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      logger.warn({ err: error?.message }, 'auth: token inválido');
      return c.json({ error: 'UNAUTHORIZED', message: 'Token inválido ou expirado.' }, 401);
    }

    const supabaseUser = data.user;

    // Extrai claims customizados do JWT (injetados pelo Auth Hook)
    // Fallback para metadata se hook ainda não configurado
    const meta      = supabaseUser.user_metadata ?? {};
    const appMeta   = supabaseUser.app_metadata  ?? {};
    const role      = (appMeta.role ?? meta.role ?? 'candidato') as UserRole;
    const companyId = appMeta.company_id as string | undefined;

    // Verifica se MFA foi satisfeito (claim injetado pelo Auth Hook)
    const mfaVerified = appMeta.mfa_verified === true;

    c.set('user', {
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      role,
      companyId,
      mfaVerified,
    });

    await next();
  });

/**
 * requireRole — exige papel específico após requireAuth.
 * Para o papel 'empresa', verifica adicionalmente se a empresa não está inativa/excluída.
 */
export const requireRole = (...roles: UserRole[]) =>
  createMiddleware(async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!roles.includes(user.role)) {
      logger.warn({ userId: user.id, role: user.role, required: roles }, 'auth: papel insuficiente');
      return c.json({ error: 'FORBIDDEN', message: 'Acesso não permitido para este perfil.' }, 403);
    }

    // Bloqueia empresa inativa ou excluída
    if (user.role === 'empresa' && user.companyId) {
      const company = await db.query.companies
        .findFirst({
          columns: { status: true },
          where: eq(companies.id, user.companyId),
        })
        .catch(() => null);

      if (company?.status === 'inativo') {
        return c.json({
          error:   'COMPANY_INACTIVE',
          message: 'Sua empresa está inativa. Entre em contato com o suporte ou redefina sua senha para reativar o acesso.',
        }, 403);
      }

      if (company?.status === 'excluido') {
        return c.json({
          error:   'COMPANY_DELETED',
          message: 'Esta empresa foi removida da plataforma.',
        }, 403);
      }
    }

    await next();
  });

/**
 * requireMfa — exige que empresa tenha passado pelo MFA.
 * Aplicado automaticamente em todas as rotas de empresa.
 */
export const requireMfa = () =>
  createMiddleware(async (c: Context, next: Next) => {
    const user = c.get('user');

    if (user.role === 'empresa' && !user.mfaVerified) {
      return c.json(
        { error: 'MFA_REQUIRED', message: 'Autenticação em dois fatores obrigatória para empresas.' },
        403
      );
    }

    await next();
  });
