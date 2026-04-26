# VagasOeste — Workflow DEV → PRODUÇÃO

> Versão: 1.0 | Data: 2026-04-25

---

## Visão rápida dos ambientes

| | DEV / Teste | PRODUÇÃO |
|---|---|---|
| **Supabase** | `nlqdjoxawzoegfxihief.supabase.co` | `jfyeheapyimdlickjozw.supabase.co` |
| **API** | `vagasoeste-api-staging.fly.dev` | `api.santarem.app` |
| **Platform** | `localhost:5173` ou Preview Vercel | `app.santarem.app` |
| **Site** | `localhost:4321` ou Preview Vercel | `santarem.app` |
| **Branch** | qualquer branch local / feature | `master` |

---

## PARTE 1 — Desenvolvimento e Testes (DEV)

### Pré-requisito (fazer uma vez)

Verifique que os `.env` locais apontam para DEV:

**`services/api/.env`**
```
NODE_ENV=development
PORT=3000
LOG_LABEL=api-dev
SUPABASE_URL=https://nlqdjoxawzoegfxihief.supabase.co
APP_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:4321,http://localhost:5173
API_SECRET=dev-secret-local-nao-usar-em-prod
```

**`apps/platform/.env`**
```
VITE_SUPABASE_URL=https://nlqdjoxawzoegfxihief.supabase.co
VITE_API_URL=http://localhost:3000
VITE_PUBLIC_SITE_URL=http://localhost:4321
VITE_PUBLIC_APP_URL=http://localhost:5173
```

**`apps/site/.env`**
```
PUBLIC_SUPABASE_URL=https://nlqdjoxawzoegfxihief.supabase.co
PUBLIC_SITE_URL=http://localhost:4321
PUBLIC_APP_URL=http://localhost:5173
PUBLIC_API_URL=http://localhost:3000
```

---

### Passo a passo — desenvolvimento local

**Terminal 1 — API**
```bash
cd services/api
npm run dev
```
Acesso: http://localhost:3000
Health check: http://localhost:3000/health

**Terminal 2 — Platform (painel da empresa/candidato)**
```bash
cd apps/platform
npm run dev
```
Acesso: http://localhost:5173

**Terminal 3 — Site (vitrine pública)**
```bash
cd apps/site
npm run dev
```
Acesso: http://localhost:4321

---

### Links úteis durante o desenvolvimento

| O que | URL |
|---|---|
| Painel local (empresa/candidato) | http://localhost:5173 |
| Site público local | http://localhost:4321 |
| API local | http://localhost:3000 |
| Health da API local | http://localhost:3000/health |
| Supabase DEV — Dashboard | https://supabase.com/dashboard/project/nlqdjoxawzoegfxihief |
| Supabase DEV — SQL Editor | https://supabase.com/dashboard/project/nlqdjoxawzoegfxihief/sql/new |
| Supabase DEV — Auth Users | https://supabase.com/dashboard/project/nlqdjoxawzoegfxihief/auth/users |
| Supabase DEV — Tabelas | https://supabase.com/dashboard/project/nlqdjoxawzoegfxihief/editor |
| API Staging (Fly.io) | https://vagasoeste-api-staging.fly.dev |
| Health da API Staging | https://vagasoeste-api-staging.fly.dev/health |
| Fly.io Dashboard Staging | https://fly.io/apps/vagasoeste-api-staging |

---

### Testando no ambiente de Preview (Vercel + Staging)

Após fazer commit e push de qualquer branch, a Vercel gera uma URL de Preview automaticamente que já usa o Supabase DEV e a API de Staging.

```bash
# 1. Faça suas alterações e commite
git add .
git commit -m "feat: descrição da feature"

# 2. Push para o GitHub
git push

# 3. A Vercel gera automaticamente dois links de Preview:
#    - platform: https://vagasoeste-platform-<hash>.vercel.app
#    - site:     https://vagasoeste-site-<hash>.vercel.app
#
# Veja os links em:
# https://vercel.com/dashboard → projeto → aba Deployments
```

Se precisar atualizar a API de Staging também:
```bash
cd services/api
fly deploy --config fly.staging.toml
```

Health check pós-deploy:
```bash
curl https://vagasoeste-api-staging.fly.dev/health
# Esperado: {"status":"ok","db":{"status":"ok","latencyMs":...}}
```

---

### Criando uma nova migration (DEV primeiro, sempre)

```bash
# 1. Crie o arquivo SQL
# services/api/migrations/0005_nome_da_migration.sql

# 2. Execute no Supabase DEV (SQL Editor):
# https://supabase.com/dashboard/project/nlqdjoxawzoegfxihief/sql/new

# 3. Teste tudo localmente

# 4. Só depois execute em PROD (ver Parte 2)

# 5. Commite o arquivo .sql
git add services/api/migrations/0005_nome_da_migration.sql
git commit -m "migration: descrição"
```

---

## PARTE 2 — Promover DEV para PRODUÇÃO

> ⚠️ Só execute quando tiver testado tudo no ambiente DEV e estiver satisfeito.

### Checklist antes de promover

- [ ] Testei a feature localmente (localhost)
- [ ] Testei no Preview da Vercel (Supabase DEV + API Staging)
- [ ] Se há nova migration: já executei em DEV e está funcionando
- [ ] Não há erros no TypeScript (`npx tsc --noEmit` sem output)
- [ ] O `git status` está limpo (tudo commitado)

---

### Passo 1 — Executar migrations em PRODUÇÃO (se houver)

Acesse o SQL Editor do Supabase PROD e execute as mesmas migrations que rodou no DEV:

**Supabase PROD — SQL Editor:**
https://supabase.com/dashboard/project/jfyeheapyimdlickjozw/sql/new

```
Execute na ordem:
1. Qualquer migration nova (services/api/migrations/XXXX_nome.sql)
```

> Se não há migration nova neste deploy, pule este passo.

---

### Passo 2 — Fazer merge para master

```bash
# Se estiver em uma branch de feature:
git checkout master
git merge nome-da-branch

# Se já estiver em master (desenvolvimento direto):
# Apenas confirme que está em master
git branch
```

---

### Passo 3 — Push para master

```bash
git push
```

A Vercel detecta o push em `master` e faz o deploy automático de produção nos dois projetos:

| Projeto | URL de produção | Acompanhar deploy |
|---|---|---|
| Platform | https://app.santarem.app | https://vercel.com/dashboard |
| Site | https://santarem.app | https://vercel.com/dashboard |

> O deploy da Vercel leva ~1-2 minutos. Aguarde antes de testar.

---

### Passo 4 — Deploy da API em PRODUÇÃO

```bash
cd services/api
fly deploy
```

Acompanhar o deploy:
https://fly.io/apps/vagasoeste-api

Health check pós-deploy:
```bash
curl https://api.santarem.app/health
# Esperado: {"status":"ok","db":{"status":"ok","latencyMs":...}}
```

---

### Passo 5 — Verificação final em produção

| O que testar | URL |
|---|---|
| Site público | https://santarem.app |
| Painel (login empresa) | https://app.santarem.app |
| Health da API | https://api.santarem.app/health |
| Supabase PROD — Auth Users | https://supabase.com/dashboard/project/jfyeheapyimdlickjozw/auth/users |
| Supabase PROD — Tabelas | https://supabase.com/dashboard/project/jfyeheapyimdlickjozw/editor |
| Fly.io — API PROD | https://fly.io/apps/vagasoeste-api |

---

## Resumo visual do fluxo completo

```
Desenvolve localmente
(localhost + Supabase DEV)
         │
         ▼
    git push (branch)
         │
         ▼
Vercel Preview gerado
(Supabase DEV + API Staging)
         │
         ▼
     Testa e aprova
         │
         ▼
  [Se migration nova]
  Executa no Supabase PROD
         │
         ▼
  git push (master)
         │
    ┌────┴─────────────┐
    ▼                  ▼
Vercel PROD        fly deploy
(automático)    (manual, services/api)
    │                  │
    ▼                  ▼
app.santarem.app  api.santarem.app
santarem.app
```

---

## Referência rápida de IDs

| | DEV | PROD |
|---|---|---|
| Supabase Project ID | `nlqdjoxawzoegfxihief` | `jfyeheapyimdlickjozw` |
| Fly.io app | `vagasoeste-api-staging` | `vagasoeste-api` |
| Vercel platform | Preview automático | `app.santarem.app` |
| Vercel site | Preview automático | `santarem.app` |
