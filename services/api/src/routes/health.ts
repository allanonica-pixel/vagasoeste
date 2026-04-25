/**
 * Health check — consumido pelo Fly.io e UptimeRobot.
 *
 * SEGURANÇA:
 * - Não expõe NODE_ENV nem mensagem de erro do banco em produção
 * - Retorna apenas status + latência (sem topologia interna)
 * - Erros do banco logados internamente, nunca propagados para o cliente
 */

import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { logger } from '../lib/logger.js';
import { sql } from 'drizzle-orm';

export const healthRouter = new Hono();

healthRouter.get('/', async (c) => {
  const start = Date.now();

  try {
    // Ping no banco para confirmar conectividade
    await db.execute(sql`SELECT 1`);
    const latencyMs = Date.now() - start;

    return c.json({
      status: 'ok',
      db: { status: 'ok', latencyMs },
      uptime: Math.floor(process.uptime()),
    });
  } catch (err: any) {
    // Loga internamente — nunca expõe mensagem de erro ao cliente
    logger.error({ err }, 'health: falha na conexão com banco');

    return c.json({
      status: 'degraded',
      db: { status: 'error' },
    }, 503);
  }
});
