# VagasOeste — Estratégia de Rate Limiting

> Versão: 1.0 | Data: 2026-04-25
> Parte do documento de segurança. Ver também: `SECURITY.md`

---

## Arquitetura em camadas

O rate limiting funciona em três camadas independentes. Uma requisição maliciosa precisa passar por todas:

```
[1] Cloudflare Free (L3/L4 DDoS)
      ↓
[2] Fly.io concurrency limit (hard_limit = 200 req simultâneas)
      ↓
[3] API Hono — ops.rate_limit (por bucket/IP, janela deslizante)
      ↓
[4] Supabase Auth (rate limit nativo no endpoint /auth/v1/token)
      ↓
[5] Client-side login (5 tentativas, bloqueio 30s) — camada UX
```

---

## Camada 3: API Hono (`ops.rate_limit`)

### Implementação

```typescript
// middleware/ratelimit.ts
export const rateLimit = (opts: RateLimitOptions) =>
  createMiddleware(async (c, next) => {
    const ip  = c.req.header('CF-Connecting-IP')
             ?? c.req.header('X-Forwarded-For')?.split(',')[0].trim()
             ?? 'unknown';
    const key = `${opts.bucket}:${userId ?? ip}`;
    // Upsert atômico na janela → bloqueia se count > limit
    // Fail-closed: erro no DB → HTTP 503 (não deixa passar)
  });
```

### Tabela `ops.rate_limit`

```sql
CREATE TABLE ops.rate_limit (
  key          TEXT        NOT NULL,  -- "bucket:userId" ou "bucket:ip"
  window_start TIMESTAMPTZ NOT NULL,  -- início da janela
  count        INT         NOT NULL DEFAULT 1,
  PRIMARY KEY  (key, window_start)
);
```

O upsert atômico garante que duas requisições simultâneas não ultrapassem o limite:
```sql
INSERT INTO ops.rate_limit (key, window_start, count)
VALUES (key, window_start, 1)
ON CONFLICT (key, window_start)
DO UPDATE SET count = ops.rate_limit.count + 1
RETURNING count;
```

### Buckets configurados

| Bucket | Endpoint | Limite | Janela | Chave | Motivo |
|--------|----------|--------|--------|-------|--------|
| `apply` | `POST /v1/applications` | 5 | 60s | userId | Impede candidaturas em massa por bot |
| `jobs_list` | `GET /v1/jobs` | 30 | 60s | IP | Protege FTS (full-text search) caro |

### Headers de resposta

Toda resposta inclui:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 28
X-RateLimit-Window: 60
```

Em caso de exceder:
```
HTTP 429 Too Many Requests
{ "error": "RATE_LIMIT_EXCEEDED", "message": "Muitas requisições..." }
```

### Comportamento em falha (fail-closed)

```
DB indisponível → HTTP 503 Service Unavailable
```

> **Por que fail-closed?** Um atacante poderia intencionalmente causar falhas no banco para bypassar o rate limit se o sistema fosse fail-open. Fail-closed é a postura segura padrão.

---

## Camada 4: Supabase Auth

O endpoint `/auth/v1/token` tem rate limiting nativo configurado no Dashboard:

| Configuração | Valor padrão Supabase |
|-------------|----------------------|
| Signup por hora | 30 por IP |
| OTP/Magic Link por hora | 30 por IP |
| Login por IP | Configurável (padrão: sem limite nativo explícito) |

> **Atenção:** O rate limit do Supabase Auth é por projeto, não por instância. Verificar no Dashboard: Authentication > Rate Limits.

---

## Camada 5: Client-side login

Implementado em `apps/platform/src/pages/login/page.tsx`:

```typescript
// 5 tentativas → bloqueio de 30 segundos
// Anti-timing jitter: 400 + random * 300ms de delay artificial
// Não revela se email existe (mesma mensagem de erro para credencial inválida)
```

> Esta é apenas uma camada de UX — a segurança real está nas camadas 3 e 4.

---

## Fly.io concurrency limits

```toml
# fly.toml
[http_service.concurrency]
  type       = "requests"
  hard_limit = 200   # Nega novas conexões acima de 200 simultâneas
  soft_limit = 150   # Começa a rejeitar acima de 150 (backpressure)
```

Quando `hard_limit` é atingido, o Fly.io retorna HTTP 429 automaticamente antes da requisição chegar ao Hono.

---

## Quando migrar para Upstash Redis

A implementação atual via Postgres é suficiente para ~500 usuários ativos simultâneos. Migrar para Upstash Redis quando:

- Latência do rate limit ultrapassar 50ms (monitorar via Axiom)
- Volume de req/s ultrapassar 200 consistentemente
- Bugs de janela deslizante no Postgres aparecerem sob carga

### Plano de migração (Fase Mês 6)

```typescript
// Trocar a implementação interna do middleware:
// ANTES: db.execute(sql`INSERT INTO ops.rate_limit ...`)
// DEPOIS: redis.pipeline().incr(key).expire(key, windowSeconds).exec()

// Interface pública do middleware não muda — nenhum código de rota precisa ser alterado
```

---

## Monitoramento

### Alertas a configurar (quando Axiom estiver ativo)

```
ALERTA: count('rate-limit: excedido') > 100 em 5min → possível ataque
ALERTA: count('rate-limit: erro crítico') > 5 em 5min → problema no banco
DASHBOARD: req/min por bucket (tendência de crescimento)
```

### Query de investigação no Supabase

```sql
-- Top IPs com mais entradas no rate limit (últimas 24h)
SELECT
  split_part(key, ':', 2) AS identifier,
  split_part(key, ':', 1) AS bucket,
  SUM(count) AS total_requests
FROM ops.rate_limit
WHERE window_start > now() - interval '24 hours'
GROUP BY 1, 2
ORDER BY total_requests DESC
LIMIT 20;
```
