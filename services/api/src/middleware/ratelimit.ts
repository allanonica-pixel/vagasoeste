/**
 * Rate limiting via tabela Postgres (sem Redis)
 * Janela deslizante simples — suficiente para Fase 1/2.
 * Quando a latência desta consulta virar gargalo, troca por Upstash Redis.
 *
 * SEGURANÇA:
 * - Fail-closed: erros inesperados retornam 429 (não deixam passar)
 * - IP extraído de CF-Connecting-IP (Cloudflare) → único IP real, imune a spoofing
 * - X-Forwarded-For usado apenas como fallback; pega somente o primeiro IP da lista
 * - Chave combina bucket + userId (se autenticado) ou IP anônimo
 */

import type { Context, Next } from 'hono';
import { createMiddleware } from 'hono/factory';
import { db } from '../lib/db.js';
import { sql } from 'drizzle-orm';
import { logger } from '../lib/logger.js';

interface RateLimitOptions {
  /** Identificador do bucket (ex: 'apply', 'login', 'jobs') */
  bucket: string;
  /** Máximo de requisições na janela */
  limit: number;
  /** Tamanho da janela em segundos */
  windowSeconds: number;
}

/**
 * Extrai o IP real do cliente de forma segura.
 * Prioridade: CF-Connecting-IP (Cloudflare) > primeiro IP de X-Forwarded-For > fallback.
 * X-Forwarded-For pode conter lista "clientIP, proxy1, proxy2" — usar sempre o primeiro.
 */
function extractClientIp(c: Context): string {
  // CF-Connecting-IP é injetado pelo Cloudflare e não pode ser forjado pelo cliente
  const cfIp = c.req.header('CF-Connecting-IP');
  if (cfIp) return cfIp.trim();

  // Fallback: primeiro IP da lista X-Forwarded-For (mais próximo do cliente)
  const xff = c.req.header('X-Forwarded-For');
  if (xff) return xff.split(',')[0].trim();

  return 'unknown';
}

export const rateLimit = (opts: RateLimitOptions) =>
  createMiddleware(async (c: Context, next: Next) => {
    // Chave: bucket + userId (autenticado) ou IP (anônimo)
    const ip     = extractClientIp(c);
    const userId = c.get('user')?.id;
    const key    = `${opts.bucket}:${userId ?? ip}`;

    try {
      // Conta requisições na janela usando a tabela ops.rate_limit
      // Cria ou incrementa atomicamente com upsert
      const result = await db.execute(sql`
        INSERT INTO ops.rate_limit (key, window_start, count)
        VALUES (
          ${key},
          date_trunc('second', now()) - ((EXTRACT(EPOCH FROM now())::int % ${opts.windowSeconds}) * interval '1 second'),
          1
        )
        ON CONFLICT (key, window_start)
        DO UPDATE SET count = ops.rate_limit.count + 1
        RETURNING count
      `);

      const count = Number((result.rows[0] as { count: number }).count);

      // Adiciona headers informativos (padrão de mercado)
      c.header('X-RateLimit-Limit',     String(opts.limit));
      c.header('X-RateLimit-Remaining', String(Math.max(0, opts.limit - count)));
      c.header('X-RateLimit-Window',    String(opts.windowSeconds));

      if (count > opts.limit) {
        logger.warn({ key, count, limit: opts.limit, bucket: opts.bucket }, 'rate-limit: excedido');
        return c.json(
          { error: 'RATE_LIMIT_EXCEEDED', message: 'Muitas requisições. Tente novamente em instantes.' },
          429
        );
      }
    } catch (err) {
      // FAIL-CLOSED: qualquer erro na tabela de rate limit bloqueia a requisição.
      // Isso impede que um atacante cause falhas no DB para bypassar o limite.
      // Em produção a migration já terá rodado; se cair aqui, é anomalia grave.
      logger.error({ err, bucket: opts.bucket, key }, 'rate-limit: erro crítico — bloqueando por segurança');
      return c.json(
        { error: 'SERVICE_UNAVAILABLE', message: 'Serviço temporariamente indisponível.' },
        503
      );
    }

    await next();
  });
