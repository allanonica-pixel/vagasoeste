/**
 * VagasOeste API — Hono + Node 22
 * Ponto de entrada principal da aplicação.
 */

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { logger as honoLogger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import { logger } from './lib/logger.js';
import { healthRouter }       from './routes/health.js';
import { jobsRouter }         from './routes/jobs.js';
import { applicationsRouter } from './routes/applications.js';
import { authRouter }         from './routes/auth.js';
import { companyRouter }      from './routes/company.js';
import { interesseRouter }    from './routes/interesse.js';
import { profileRouter }      from './routes/profile.js';
import { adminRouter }        from './routes/admin.js';
import { setoresPublicRouter, setoresAdminRouter } from './routes/setores.js';
import { regioesPublicRouter, regioesAdminRouter } from './routes/regioes.js';
import { requireAuth, requireRole } from './middleware/auth.js';

// ============================================================
// App principal
// ============================================================
const app = new Hono();

// ---- Segurança ----
// secureHeaders() adiciona: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection,
// Referrer-Policy, Permissions-Policy e Cross-Origin-* headers.
app.use('*', secureHeaders());

// HSTS explícito — garante HTTPS mesmo quando secureHeaders() não o inclui por padrão
// max-age=31536000 (1 ano), includeSubDomains cobre todos os subdomínios de santarem.app
app.use('*', async (c, next) => {
  await next();
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
});

// ---- CORS ----
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use('*', cors({
  origin: (origin) => {
    // Em desenvolvimento aceita qualquer localhost
    if (process.env.NODE_ENV === 'development' && origin?.includes('localhost')) return origin;
    if (allowedOrigins.includes(origin ?? '')) return origin;
    return null;
  },
  allowHeaders:  ['Content-Type', 'Authorization'],
  allowMethods:  ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  maxAge:        86400,
  credentials:   true,
}));

// ---- Logging de requisições (dev) ----
if (process.env.NODE_ENV === 'development') {
  app.use('*', honoLogger());
  app.use('*', prettyJSON());
}

// ============================================================
// Rotas
// ============================================================
app.route('/health',             healthRouter);
app.route('/v1/auth',            authRouter);
app.route('/v1/jobs',            jobsRouter);
app.route('/v1/applications',    applicationsRouter);
app.route('/v1/company',         companyRouter);
app.route('/v1/interesse',       interesseRouter);
app.route('/v1/profile',         profileRouter);
app.route('/v1/admin',           adminRouter);

// Cadastros mestres — leitura pública pra forms, escrita só admin
app.route('/v1/setores',         setoresPublicRouter);
app.route('/v1/regioes',         regioesPublicRouter);

// Mounting admin sub-routers com auth + role check
const adminSetoresGuarded = new Hono();
adminSetoresGuarded.use('*', requireAuth(), requireRole('admin'));
adminSetoresGuarded.route('/', setoresAdminRouter);
app.route('/v1/admin/setores',   adminSetoresGuarded);

const adminRegioesGuarded = new Hono();
adminRegioesGuarded.use('*', requireAuth(), requireRole('admin'));
adminRegioesGuarded.route('/', regioesAdminRouter);
app.route('/v1/admin/regioes',   adminRegioesGuarded);

// ---- 404 global ----
app.notFound((c) => c.json({ error: 'NOT_FOUND', path: c.req.path }, 404));

// ---- Erros não tratados ----
app.onError((err, c) => {
  logger.error({ err, path: c.req.path, method: c.req.method }, 'unhandled error');
  return c.json({ error: 'INTERNAL_ERROR', message: 'Erro inesperado. Tente novamente.' }, 500);
});

// ============================================================
// Servidor
// ============================================================
const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, () => {
  logger.info(
    { port, env: process.env.NODE_ENV, label: process.env.LOG_LABEL },
    `🚀 VagasOeste API rodando na porta ${port}`
  );
});

export default app;
