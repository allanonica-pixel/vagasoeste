# VagasOeste — Documento de Segurança

> Versão: 1.0 | Data: 2026-04-25
> Responsável técnico: VagasOeste Engineering
> Contato: allanstm@gmail.com

---

## Índice

1. [Modelo de ameaça](#1-modelo-de-ameaça)
2. [Controles em camadas](#2-controles-em-camadas)
3. [Autenticação e autorização](#3-autenticação-e-autorização)
4. [Rate limiting](#4-rate-limiting)
5. [Headers de segurança HTTP](#5-headers-de-segurança-http)
6. [Proteção do banco de dados](#6-proteção-do-banco-de-dados)
7. [Segredos e variáveis de ambiente](#7-segredos-e-variáveis-de-ambiente)
8. [Proteção de PII](#8-proteção-de-pii)
9. [Auditoria e logging](#9-auditoria-e-logging)
10. [Vulnerabilidades conhecidas e mitigações](#10-vulnerabilidades-conhecidas-e-mitigações)
11. [Procedimento de resposta a incidentes](#11-procedimento-de-resposta-a-incidentes)
12. [Checklist de segurança por deploy](#12-checklist-de-segurança-por-deploy)

---

## 1. Modelo de ameaça

### Ativos críticos

| Ativo | Classificação | Impacto de vazamento |
|-------|--------------|----------------------|
| Dados pessoais de candidatos (CPF, telefone, email) | Confidencial | LGPD — multa + dano reputacional |
| Dados de empresas (CNPJ, email, senha) | Confidencial | Concorrência + LGPD |
| `SUPABASE_SERVICE_ROLE_KEY` | Secreto | Acesso total ao banco — catastrófico |
| `DATABASE_URL` | Secreto | Acesso direto ao Postgres |
| JWT dos usuários (access_token) | Sensível | Personificação de sessão |
| MFA secrets (TOTP) | Confidencial | Bypass do segundo fator |

### Vetores de ataque considerados

| Vetor | Probabilidade | Controles implementados |
|-------|--------------|------------------------|
| Brute force login | Alta | Rate limit client-side (5 tent./30s) + anti-timing jitter + Supabase rate limit nativo |
| Scraping de vagas | Média | Rate limit API (30 req/60s por IP via `jobs_list` bucket) |
| Candidatura em massa (bot) | Média | Rate limit API (5 req/60s via `apply` bucket) + JWT obrigatório |
| SQL injection | Baixa | Drizzle ORM com queries parametrizadas + Zod validation |
| XSS | Baixa | CSP em todos os apps + `X-XSS-Protection` |
| CSRF | Muito baixa | Bearer token (não cookie) — CSRF não se aplica |
| Enumeração de endpoints | Média | `/admin` → 404 (decoy); `/vo-painel` não linkado |
| Acesso não autorizado ao painel empresa | Baixa | MFA TOTP obrigatório (AAL2) + PrivateRoute |
| Vazamento de PII via API empresa | Média | Mascaramento progressivo de nome + ausência de email/telefone nas queries |
| Injeção de role via signUp | Baixa | `app_metadata.role` só modificável via `service_role` (admin) |
| Spoofing de IP no rate limit | Média | CF-Connecting-IP tem prioridade; X-Forwarded-For usa apenas primeiro IP |

---

## 2. Controles em camadas

```
Internet
  │
  ▼
Cloudflare Free (DNS proxied)
  ├── DDoS L3/L4 mitigation (incluído no Free)
  ├── SSL/TLS terminação (modo "Full Strict")
  └── CF-Connecting-IP → IP real do cliente para rate limiting

  ├─── santarem.app → Vercel (Astro SSG)
  │      ├── Security headers (vercel.json): CSP, HSTS, X-Frame-Options
  │      └── Conteúdo estático — sem auth, sem DB direto
  │
  ├─── app.santarem.app → Vercel (React SPA)
  │      ├── Security headers (vercel.json): CSP, HSTS, X-Frame-Options
  │      ├── PrivateRoute por role (candidato/empresa/admin)
  │      ├── PrivateRoute requireMfa (AAL2 para empresa/admin)
  │      └── Supabase Auth (anon key — apenas Auth flows)
  │
  └─── api.santarem.app → Fly.io GRU (Hono)
         ├── force_https = true
         ├── HSTS: max-age=31536000; includeSubDomains; preload
         ├── secureHeaders() middleware (Hono built-in)
         ├── CORS whitelist (ALLOWED_ORIGINS)
         ├── JWT validation via supabaseAdmin.auth.getUser()
         ├── requireAuth() → requireRole() → requireMfa()
         ├── rateLimit() por bucket/IP — fail-closed
         ├── Zod validation em toda entrada
         └── Supabase Pro (Postgres + RLS default-deny)
```

---

## 3. Autenticação e autorização

### Fluxo de autenticação

```
Cliente → POST /auth/v1/token (Supabase Auth)
  ↓ access_token (JWT, 1h TTL) + refresh_token (7d)
Cliente → GET /v1/... Authorization: Bearer <token>
  ↓ API valida via supabaseAdmin.auth.getUser(token)
  ↓ Extrai role de app_metadata (server-side, imune a bypass)
  ↓ Injeta AuthUser no contexto Hono
```

### Roles e claims

| Role | Origem do claim | Quem pode modificar |
|------|----------------|---------------------|
| `candidato` | `user_metadata.role` no signUp | Usuário (mas API valida) |
| `empresa` | `app_metadata.role` | Somente admin via `service_role` |
| `admin` | `app_metadata.role` | Somente via SQL no Supabase |

> **Importante:** `app_metadata` só pode ser escrito via `service_role` (API server-side ou SQL Editor). O cliente nunca pode elevar sua própria role.

### MFA (TOTP)

| Usuário | MFA | Verificação |
|---------|-----|-------------|
| Empresa | **Obrigatório** | AAL2 verificado no PrivateRoute + `requireMfa()` na API |
| Admin | **Obrigatório** | AAL2 verificado no PrivateRoute (redirectTo="/acesso-restrito") |
| Candidato | Opcional | Se ativo, login cobra verify-mfa antes do redirect |

URI customizada do TOTP:
- Empresa: `otpauth://totp/VagasOeste%3AEmpresas?secret=X&issuer=VagasOeste`
- Candidato: `otpauth://totp/VagasOeste%3ACandidato?secret=X&issuer=VagasOeste`

### Middleware chain (API)

```typescript
// Ordem de execução garantida:
requireAuth()   // 1. Valida JWT — 401 se inválido
requireRole()   // 2. Verifica role — 403 se insuficiente
requireMfa()    // 3. Verifica MFA para empresa — 403 se não verificado
rateLimit()     // 4. Conta requisições — 429 se excedido
zValidator()    // 5. Valida schema de entrada — 400 se inválido
```

### Proteção de rotas (frontend)

```typescript
// PrivateRoute — verificação client-side + redirect
<PrivateRoute allowedRoles={["empresa"]} requireMfa>
  <EmpresaPage />
</PrivateRoute>

// A API repete a verificação server-side — defense in depth
```

> O frontend é apenas UX — toda segurança real está na API e no banco.

---

## 4. Rate limiting

Implementação via tabela `ops.rate_limit` (Postgres). Ver [RATE-LIMITING.md](RATE-LIMITING.md).

### Configuração atual por endpoint

| Endpoint | Bucket | Limite | Janela | Chave |
|----------|--------|--------|--------|-------|
| `POST /v1/applications` | `apply` | 5 req | 60s | userId |
| `GET /v1/jobs` | `jobs_list` | 30 req | 60s | IP |
| Login (client-side) | — | 5 tent. | 30s bloqueio | Local |

### Comportamento em falha

**Fail-closed:** se a tabela `ops.rate_limit` não responder por qualquer motivo, o middleware retorna HTTP 503 em vez de deixar passar. Isso impede que um atacante cause falhas no banco para bypassar o limite.

### Extração de IP

```typescript
// Prioridade:
// 1. CF-Connecting-IP → injetado pelo Cloudflare, imune a spoofing
// 2. X-Forwarded-For  → primeiro IP da lista (mais próximo do cliente)
// 3. 'unknown'        → fallback seguro
```

---

## 5. Headers de segurança HTTP

### API (Hono — api.santarem.app)

| Header | Valor | Função |
|--------|-------|--------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Força HTTPS por 1 ano |
| `X-Content-Type-Options` | `nosniff` | Impede MIME sniffing |
| `X-Frame-Options` | `DENY` | Impede clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Proteção XSS legado |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limita headers Referer |
| Outros (via `secureHeaders()`) | `Cross-Origin-*`, `Permissions-Policy` | Controles de isolamento |

### Site (santarem.app) e Platform (app.santarem.app)

| Header | Valor |
|--------|-------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Content-Security-Policy` | Ver vercel.json de cada app |

### CSP (Content-Security-Policy) — Platform

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https:;
connect-src 'self' https://api.santarem.app https://*.supabase.co wss://*.supabase.co;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

> **Nota sobre `unsafe-inline`:** necessário para Vite/React em produção (inline styles). Mitigado por `frame-ancestors 'none'` e ausência de `unsafe-eval`.

---

## 6. Proteção do banco de dados

### Conexão

- SSL obrigatório: `ssl: 'require'` no postgres.js
- Pool máximo: 10 conexões simultâneas
- `DATABASE_URL` como secret Fly.io (nunca em texto no fly.toml)
- Supabase Pro: PITR 7 dias, backups automáticos

### Row Level Security (RLS)

- **Default-deny:** toda tabela tem RLS habilitado
- Policies explícitas por operação (SELECT/INSERT/UPDATE/DELETE)
- `anon` role: acesso somente às views públicas (`public_jobs`, `blog_posts` publicados, `neighborhoods`)
- `authenticated` role: acesso apenas aos próprios dados
- `service_role`: bypass de RLS — **somente no servidor** (API Hono, nunca frontend)

Ver [RLS-POLICIES.md](RLS-POLICIES.md) para mapeamento completo.

### Funções SQL críticas

| Função | Schema | SECURITY | Propósito |
|--------|--------|----------|-----------|
| `is_admin()` | `public` | **DEFINER** | Verifica se o usuário atual é admin — usada em todas as policies admin |
| `apply_to_job()` | `public` | DEFINER | Candidatura atômica com lock |
| `publish_job()` | `company` | DEFINER | Publicar vaga com validação de plano |
| `purge_expired()` | `media` | DEFINER | Limpar assets expirados |
| `cleanup_rate_limit()` | `ops` | — | Limpar entradas antigas do rate limit |

> **`is_admin()` é crítica para a segurança do RLS:** sem ela, qualquer query de `anon` que aciona uma policy admin causava `permission denied for table admin_users`, derrubando até queries de leitura pública de vagas. Ver `docs/RLS-POLICIES.md` para detalhes.

> SECURITY DEFINER executa com os privilégios do owner da função, não do chamador. Isso garante que operações sensíveis passem por validações internas do SQL antes de qualquer escrita.

### pg_cron jobs

| Job | Frequência | Função |
|-----|-----------|--------|
| `media-purge` | A cada 15min | `media.purge_expired(100)` |
| `rate-limit-cleanup` | A cada 1h | `ops.cleanup_rate_limit()` |
| `expire-jobs` | Diariamente 00h | Expirar vagas com `expires_at < now()` |

---

## 7. Segredos e variáveis de ambiente

### Onde cada segredo vive

| Segredo | Onde armazenado | Acessado por |
|---------|----------------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Fly.io secrets | API Hono (server-side) |
| `DATABASE_URL` | Fly.io secrets | API Hono (Drizzle) |
| `SUPABASE_ANON_KEY` | Fly.io secrets + Vercel env | API + frontend (público) |
| `SUPABASE_URL` | Fly.io secrets + Vercel env | API + frontend (público) |
| `VITE_SUPABASE_ANON_KEY` | Vercel env (platform) | React SPA (build-time) |
| `PUBLIC_SUPABASE_ANON_KEY` | Vercel env (site) | Astro islands (build-time) |
| `API_SECRET` | Fly.io secrets | Futuro: tokens internos |

### Regras invioláveis

1. **`SUPABASE_SERVICE_ROLE_KEY` NUNCA no frontend** — qualquer key que começa com `service_role` nomeada em variável pública é uma brecha catastrófica
2. **.env nunca commitado** — `.gitignore` protege; `.env.example` é o único arquivo de template no repo
3. **Rotação imediata** se qualquer segredo for exposto — via Fly.io secrets e Supabase Dashboard
4. **Vercel envs** não aparecem no bundle (`VITE_` para React, `PUBLIC_` para Astro)

### Comandos de auditoria

```bash
# Verificar se .env está no git (não deve aparecer)
git ls-files | grep -E "\.env$"

# Verificar secrets no Fly.io
fly secrets list -a vagasoeste-api

# Verificar se service_role está exposto no bundle
grep -r "service_role" apps/platform/out/ 2>/dev/null
grep -r "service_role" apps/site/dist/  2>/dev/null
```

---

## 8. Proteção de PII

### Dados do candidato

| Dado | Empresa vê? | Quando revela? |
|------|------------|---------------|
| Nome completo | Mascarado (`João S***`) | Após status `pre_entrevista`+ |
| Email | Nunca via API empresa | Apenas admin e VagasOeste |
| Telefone | Nunca via API empresa | Apenas admin e VagasOeste |
| CPF | Nunca | Apenas admin direto no banco |
| Headline/cidade | Sempre | Dado profissional público |

**Mascaramento de nome** (função `maskName()` em `company.ts`):
```typescript
"João Silva Santos" → "João S*** S***"
```

### Logging

O `pino` com `redact` remove automaticamente:
- `req.headers.authorization` → `[REDACTED]`
- `body.password` → `[REDACTED]`
- `body.cpf` → `[REDACTED]`
- `body.cnpj` → `[REDACTED]`

### LGPD

- Direito ao esquecimento: endpoint `DELETE /v1/me` **pendente de implementação** (Fase 13)
- Dados têm TTL implícito via `expires_at` na tabela `media.asset`
- CPF e telefone armazenados apenas em `candidates` — não trafegam na API empresa

---

## 9. Auditoria e logging

### O que é logado

| Evento | Nível | Destino |
|--------|-------|---------|
| Token inválido | `warn` | Pino (stdout → Axiom) |
| Role insuficiente | `warn` | Pino |
| Rate limit excedido | `warn` | Pino |
| Candidatura registrada | `info` | Pino + `audit.event_log` |
| Vaga publicada | `info` | Pino + `audit.event_log` |
| Status atualizado | `info` | Pino |
| Erros não tratados | `error` | Pino (→ Sentry, pendente) |

### Tabela `audit.event_log`

```sql
-- Campos
occurred_at TIMESTAMPTZ
actor_id    UUID         -- auth user id
actor_role  TEXT         -- candidato / empresa / admin
action      TEXT         -- apply_to_job, publish_job, etc.
target      TEXT         -- tabela / recurso afetado
target_id   UUID
payload     JSONB        -- dados relevantes (sem PII)
ip          INET
user_agent  TEXT
```

> Append-only por design — nunca é feito DELETE nessa tabela.

---

## 10. Vulnerabilidades conhecidas e mitigações

### Corrigidas em 2026-04-26

| CVE/Categoria | Severidade | Status | Correção |
|---------------|-----------|--------|---------|
| **`permission denied for table admin_users`** — RLS policies admin referenciam `admin_users` diretamente; role `anon` não tem SELECT, derrubando até queries públicas | 🔴 Crítico | ✅ Corrigido | **Migration 0006**: função `is_admin()` SECURITY DEFINER; 6 policies admin recriadas usando `is_admin()` |

### Corrigidas em 2026-04-25

| CVE/Categoria | Severidade | Status | Correção |
|---------------|-----------|--------|---------|
| Rate limit fail-open | 🔴 Crítico | ✅ Corrigido | `ratelimit.ts` → fail-closed (HTTP 503) |
| GET /v1/jobs sem rate limit | 🟠 Alto | ✅ Corrigido | Bucket `jobs_list`: 30 req/60s |
| /health expõe env e erro DB | 🟠 Alto | ✅ Corrigido | Remove `env`, loga erro internamente |
| Platform sem security headers | 🟠 Alto | ✅ Corrigido | `platform/vercel.json` com CSP+HSTS |
| X-Forwarded-For spoofável | 🟡 Médio | ✅ Corrigido | CF-Connecting-IP preferencial; XFF pega só 1º IP |
| HSTS não explícito na API | 🟡 Médio | ✅ Corrigido | Middleware HSTS em `index.ts` |
| `companies_public_insert` irrestrito | 🟡 Médio | ✅ Corrigido | Migration 0004: WITH CHECK status='pendente' + campos obrigatórios |
| `ops.rate_limit` sem índice de cleanup | 🟢 Baixo | ✅ Corrigido | Migration 0004: `idx_rate_limit_window_start` |

### Pendentes (backlog)

| Categoria | Severidade | Fase prevista |
|-----------|-----------|--------------|
| `DELETE /v1/me` (direito ao esquecimento LGPD) | 🟠 Alto | Fase 13 |
| Sentry para captura de erros críticos | 🟡 Médio | Fase 12 |
| Axiom para logs estruturados | 🟡 Médio | Fase 12 |
| Rate limit na API via Upstash Redis (substitui Postgres) | 🟡 Médio | Mês 6 |
| WAF rules no Cloudflare (requer Pro plan) | 🟢 Baixo | Quando MRR justificar |
| `unsafe-inline` removido do CSP (requer nonce) | 🟢 Baixo | Refactor futuro |

---

## 11. Procedimento de resposta a incidentes

### Classificação de severidade

| Nível | Definição | Tempo de resposta |
|-------|----------|------------------|
| P0 | `service_role_key` exposta / banco comprometido | < 15 min |
| P1 | Dados de candidatos/empresas acessados sem autorização | < 1h |
| P2 | Rate limit bypassado / brute force detectado | < 4h |
| P3 | Bug de segurança sem exploração ativa | < 48h |

### Passos de resposta (P0/P1)

```
1. REVOGAR — Rotacionar todas as chaves expostas imediatamente
   fly secrets set SUPABASE_SERVICE_ROLE_KEY=nova_chave -a vagasoeste-api
   → Supabase Dashboard: Settings > API > Regenerate

2. BLOQUEAR — Se necessário, colocar o app em manutenção
   vercel env add MAINTENANCE_MODE true

3. AUDITAR — Consultar audit.event_log para ver o que foi acessado
   SELECT * FROM audit.event_log
   WHERE occurred_at > now() - interval '24 hours'
   ORDER BY occurred_at DESC;

4. NOTIFICAR — Usuários afetados conforme LGPD (72h para autoridade)

5. CORRIGIR e REDEPLOY

6. POST-MORTEM — Documentar causa raiz e controles adicionados
```

### Contatos de emergência

- Supabase Support: support@supabase.io
- Fly.io Support: https://fly.io/docs/support/
- Vercel Support: https://vercel.com/support

---

## 12. Checklist de segurança por deploy

Executar antes de cada deploy em produção:

```bash
# 1. Verificar se .env não foi commitado
git ls-files | grep -E "\.env$" && echo "ALERTA: .env no git!" || echo "OK"

# 2. Verificar se service_role não está no bundle
npm run build -w apps/platform
grep -r "service_role" apps/platform/out/ && echo "ALERTA: chave exposta!" || echo "OK"

# 3. Verificar headers de segurança em produção
curl -I https://api.santarem.app/health | grep -E "Strict|X-Frame|CSP|X-Content"

# 4. Verificar que /admin retorna 404
curl -s -o /dev/null -w "%{http_code}" https://app.santarem.app/admin

# 5. Verificar rate limit funcionando
for i in {1..35}; do curl -s -o /dev/null -w "%{http_code}\n" https://api.santarem.app/v1/jobs; done | sort | uniq -c

# 6. Verificar que /health não expõe env
curl -s https://api.santarem.app/health | grep -E "NODE_ENV|error|message" && echo "ALERTA!" || echo "OK"
```
