# VagasOeste — Guia de Ambientes (DEV / PROD)

> Versão: 2.0 | Data: 2026-04-26

---

## Visão geral dos ambientes

| Camada | DEV (local) | PRODUÇÃO |
|--------|-------------|----------|
| Supabase | `vagasoeste-dev` (org gratuita) | `vagasoeste` (OnicaSistemasPro PRO) |
| Supabase URL | `<PROJECT_REF_DEV_OLD>.supabase.co` | `<PROJECT_REF_PROD>.supabase.co` |
| API | `localhost:3000` | `api.santarem.app` (Fly.io GRU) |
| Site | `localhost:4321` | `santarem.app` (Vercel) |
| Platform | `localhost:3001` | `app.santarem.app` (Vercel) |

> **Por que 3001?** O `vite.config.ts` da plataforma configura `server.port = 3000`. Como a API ocupa a porta 3000 primeiro (quando rodando em paralelo), o Vite detecta o conflito e sobe automaticamente em 3001.
| Branch | qualquer branch local | `master` |

---

## Configuração inicial do DEV (fazer uma vez)

### 1. Aplicar schema no Supabase DEV

No SQL Editor do projeto `vagasoeste-dev` (`<PROJECT_REF_DEV_OLD>`), execute em ordem:

```
1. supabase-schema.sql                              (schema principal)
2. services/api/migrations/0001_audit_media_functions.sql
3. services/api/migrations/0002_cron_jobs.sql       (requer pg_cron ativo)
4. services/api/migrations/0003_admin_user.sql
5. services/api/migrations/0004_security_hardening.sql
6. services/api/migrations/0005_interesse_empresa.sql  (tabelas otp_codes + empresa_pre_cadastros)
7. services/api/migrations/0006_fix_rls_admin_permissions.sql  (função is_admin() SECURITY DEFINER)
```

> ⚠️ A migration 0006 já foi aplicada na produção (`<PROJECT_REF_PROD>`). Aplicar também no DEV para paridade.

### 2. Configurar .env locais

**apps/platform/.env**
```env
VITE_SUPABASE_URL=https://<PROJECT_REF_DEV_OLD>.supabase.co
VITE_SUPABASE_ANON_KEY=<sb_publishable_key>
VITE_API_URL=http://localhost:3000
VITE_PUBLIC_SITE_URL=http://localhost:4321
```

**apps/site/.env**
```env
PUBLIC_SUPABASE_URL=https://<PROJECT_REF_DEV_OLD>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<sb_publishable_key>
PUBLIC_SITE_URL=http://localhost:4321
PUBLIC_APP_URL=http://localhost:5173
```

**services/api/.env**
```env
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://<PROJECT_REF_DEV_OLD>.supabase.co
SUPABASE_ANON_KEY=<sb_publishable_key>
SUPABASE_SERVICE_ROLE_KEY=<sb_secret_key>
DATABASE_URL=postgresql://postgres.<PROJECT_REF_DEV_OLD>:<DB_PASSWORD>@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
ALLOWED_ORIGINS=http://localhost:4321,http://localhost:5173
APP_URL=http://localhost:5173
API_SECRET=dev-secret-local-nao-usar-em-prod
LOG_LABEL=api-dev
```

### 3. Subir o ambiente local

```bash
# Terminal 1 — API
cd services/api
npm run dev

# Terminal 2 — Platform
cd apps/platform
npm run dev

# Terminal 3 — Site (opcional)
cd apps/site
npm run dev
```

---

## Workflow de desenvolvimento

```
1. Desenvolve localmente → Supabase DEV (<PROJECT_REF_DEV_OLD>)
2. Commit na branch de feature ou diretamente em master
3. Push para origin → Vercel gera Preview automático
4. Preview usa variáveis DEV (configurar em Vercel → Settings → Environment Variables)
5. Merge em master + vercel --prod --yes (em cada app) → deploy em PRODUÇÃO
```

> ⚠️ A integração automática GitHub → Vercel PROD não está acionando builds confiáveis. Use sempre `vercel --prod --yes` dentro de cada app para promover para produção. Consultar `docs/DEPLOY-MANUAL.md`.

### Regra de ouro

| Ação | DEV | PRODUÇÃO |
|------|-----|----------|
| Testar features novas | ✅ | ❌ |
| Rodar migrations | ✅ Primeiro | ✅ Depois (se DEV OK) |
| Dados reais de usuários | ❌ | ✅ |
| Resetar banco | ✅ À vontade | ❌ Nunca |
| Criar empresa de teste | ✅ | ❌ |

---

## Configurar Vercel Preview com variáveis DEV

No dashboard Vercel de cada projeto:

**app.santarem.app (platform):**
```
Settings → Environment Variables → Add

VITE_SUPABASE_URL     = https://<PROJECT_REF_DEV_OLD>.supabase.co  [Preview]
VITE_SUPABASE_ANON_KEY = eyJ... (anon dev)                         [Preview]
VITE_API_URL          = https://vagasoeste-api-staging.fly.dev      [Preview]
VITE_PUBLIC_SITE_URL  = https://santarem.app                        [Preview]
```

**santarem.app (site):**
```
Settings → Environment Variables → Add

PUBLIC_SUPABASE_URL     = https://<PROJECT_REF_DEV_OLD>.supabase.co  [Preview]
PUBLIC_SUPABASE_ANON_KEY = eyJ... (anon dev)                         [Preview]
PUBLIC_SITE_URL         = https://santarem.app                        [Preview]
PUBLIC_APP_URL          = https://app.santarem.app                    [Preview]
```

> Selecionar apenas **Preview** (não Production) ao adicionar as variáveis DEV.

---

## Deploy da API Staging (Fly.io)

```bash
# 1. Configurar secrets DEV no app staging
fly secrets set \
  SUPABASE_URL="https://<PROJECT_REF_DEV_OLD>.supabase.co" \
  SUPABASE_ANON_KEY="eyJ... (anon dev)" \
  SUPABASE_SERVICE_ROLE_KEY="eyJ... (service_role dev)" \
  DATABASE_URL="postgresql://postgres.<PROJECT_REF_DEV_OLD>:<DB_PASSWORD>@aws-1-sa-east-1.pooler.supabase.com:6543/postgres" \
  ALLOWED_ORIGINS="https://santarem.app,https://app.santarem.app" \
  API_SECRET="gere-com-openssl-rand-base64-32" \
  -a vagasoeste-api-staging

# 2. Deploy
cd services/api
fly deploy --config fly.staging.toml

# 3. Verificar
curl https://vagasoeste-api-staging.fly.dev/health
```

---

## Migrations: sempre DEV primeiro

```
1. Escreva a migration em services/api/migrations/XXXX_nome.sql
2. Execute no Supabase DEV (SQL Editor) → teste
3. Se OK → execute no Supabase PROD
4. Commite o arquivo .sql no git
```

**Nunca execute uma migration em PRODUÇÃO sem antes testar em DEV.**

---

## Auth Redirect URLs (Supabase DEV)

No projeto `vagasoeste-dev` → Authentication → URL Configuration:

```
Site URL: http://localhost:4321

Redirect URLs permitidas:
http://localhost:5173/**
http://localhost:4321/**
https://santarem.app/**
https://app.santarem.app/**
```

---

## Referência rápida de IDs

| | DEV | PROD |
|-|-----|------|
| Supabase Project ID | `<PROJECT_REF_DEV_OLD>` | `<PROJECT_REF_PROD>` |
| Fly.io app | `vagasoeste-api-staging` | `vagasoeste-api` |
| Vercel (platform) | Preview automático | `app.santarem.app` |
| Vercel (site) | Preview automático | `santarem.app` |
| Porta API local | `3000` | — |
| Porta Platform local | `3001` (Vite conflito com API) | — |
| Porta Site local | `4321` | — |

---

## Migrations aplicadas por ambiente

| Migration | DEV | PROD |
|-----------|-----|------|
| `0001_audit_media_functions.sql` | Aplicar manualmente | ✅ Aplicada |
| `0002_cron_jobs.sql` | Aplicar manualmente (requer pg_cron) | ✅ Aplicada |
| `0003_admin_user.sql` | Aplicar manualmente | ✅ Aplicada |
| `0004_security_hardening.sql` | Aplicar manualmente | ✅ Aplicada |
| `0005_interesse_empresa.sql` | Aplicar manualmente | ✅ Aplicada |
| `0006_fix_rls_admin_permissions.sql` | **Pendente aplicar em DEV** | ✅ Aplicada (2026-04-26) |
