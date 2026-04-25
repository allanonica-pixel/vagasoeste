# VagasOeste — Guia de Ambientes (DEV / PROD)

> Versão: 1.0 | Data: 2026-04-25

---

## Visão geral dos ambientes

| Camada | DEV (local) | PRODUÇÃO |
|--------|-------------|----------|
| Supabase | `vagasoeste-dev` (org gratuita) | `vagasoeste` (OnicaSistemasPro PRO) |
| Supabase URL | `nlqdjoxawzoegfxihief.supabase.co` | `jfyeheapyimdlickjozw.supabase.co` |
| API | `localhost:3000` | `api.santarem.app` (Fly.io GRU) |
| Site | `localhost:4321` | `santarem.app` (Vercel) |
| Platform | `localhost:5173` | `app.santarem.app` (Vercel) |
| Branch | qualquer branch local | `main` |

---

## Configuração inicial do DEV (fazer uma vez)

### 1. Aplicar schema no Supabase DEV

No SQL Editor do projeto `vagasoeste-dev` (`nlqdjoxawzoegfxihief`), execute em ordem:

```
1. supabase-schema.sql                         (schema principal)
2. services/api/migrations/0001_audit_media_functions.sql
3. services/api/migrations/0002_cron_jobs.sql  (requer pg_cron ativo)
4. services/api/migrations/0003_admin_user.sql
5. services/api/migrations/0004_security_hardening.sql
```

### 2. Configurar .env locais

**apps/platform/.env**
```env
VITE_SUPABASE_URL=https://nlqdjoxawzoegfxihief.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scWRqb3hhd3pvZWdmeGloaWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNzI5OTYsImV4cCI6MjA5MjY0ODk5Nn0.S5XVCa2KjzK8yIU_iJDEZfJOSu7qRhaFWX3A2r1efVw
VITE_API_URL=http://localhost:3000
VITE_PUBLIC_SITE_URL=http://localhost:4321
```

**apps/site/.env**
```env
PUBLIC_SUPABASE_URL=https://nlqdjoxawzoegfxihief.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scWRqb3hhd3pvZWdmeGloaWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNzI5OTYsImV4cCI6MjA5MjY0ODk5Nn0.S5XVCa2KjzK8yIU_iJDEZfJOSu7qRhaFWX3A2r1efVw
PUBLIC_SITE_URL=http://localhost:4321
PUBLIC_APP_URL=http://localhost:5173
```

**services/api/.env**
```env
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://nlqdjoxawzoegfxihief.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scWRqb3hhd3pvZWdmeGloaWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNzI5OTYsImV4cCI6MjA5MjY0ODk5Nn0.S5XVCa2KjzK8yIU_iJDEZfJOSu7qRhaFWX3A2r1efVw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scWRqb3hhd3pvZWdmeGloaWVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzA3Mjk5NiwiZXhwIjoyMDkyNjQ4OTk2fQ.HfUVAq_TycYE_vDLlfZ0f-7D6tNF_54tljsHi-6TmCY
DATABASE_URL=postgresql://postgres.nlqdjoxawzoegfxihief:DXs82Shj43S1brrI@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
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
1. Desenvolve localmente → Supabase DEV (nlqdjoxawzoegfxihief)
2. Commit na branch de feature
3. Abre PR → Vercel gera Preview automático
4. Preview usa variáveis DEV (configurar em Vercel → Settings → Environment Variables)
5. Merge em main → deploy automático em PRODUÇÃO
```

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

VITE_SUPABASE_URL     = https://nlqdjoxawzoegfxihief.supabase.co  [Preview]
VITE_SUPABASE_ANON_KEY = eyJ... (anon dev)                         [Preview]
VITE_API_URL          = https://vagasoeste-api-staging.fly.dev      [Preview]
VITE_PUBLIC_SITE_URL  = https://santarem.app                        [Preview]
```

**santarem.app (site):**
```
Settings → Environment Variables → Add

PUBLIC_SUPABASE_URL     = https://nlqdjoxawzoegfxihief.supabase.co  [Preview]
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
  SUPABASE_URL="https://nlqdjoxawzoegfxihief.supabase.co" \
  SUPABASE_ANON_KEY="eyJ... (anon dev)" \
  SUPABASE_SERVICE_ROLE_KEY="eyJ... (service_role dev)" \
  DATABASE_URL="postgresql://postgres.nlqdjoxawzoegfxihief:DXs82Shj43S1brrI@aws-1-sa-east-1.pooler.supabase.com:6543/postgres" \
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
| Supabase Project ID | `nlqdjoxawzoegfxihief` | `jfyeheapyimdlickjozw` |
| Fly.io app | `vagasoeste-api-staging` | `vagasoeste-api` |
| Vercel (platform) | Preview automático | `app.santarem.app` |
| Vercel (site) | Preview automático | `santarem.app` |
