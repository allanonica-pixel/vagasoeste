# VagasOeste — Manual Operacional de Deploy

> Versão: 1.0 | Data: 2026-04-26
> **Este documento é o guia definitivo para executar deploys com segurança.**
> Deve ser consultado integralmente antes de qualquer push ou deploy para produção.

---

## ÍNDICE

1. [Mapa completo de ambientes e IDs](#1-mapa-completo-de-ambientes-e-ids)
2. [Autenticações e credenciais necessárias](#2-autenticações-e-credenciais-necessárias)
3. [Estrutura do repositório](#3-estrutura-do-repositório)
4. [PARTE A — Deploy de desenvolvimento (DEV)](#parte-a--deploy-de-desenvolvimento-dev)
5. [PARTE B — Deploy de produção (PROD)](#parte-b--deploy-de-produção-prod)
6. [Checklist pré-deploy obrigatório](#checklist-pré-deploy-obrigatório)
7. [Verificação pós-deploy](#verificação-pós-deploy)
8. [Comandos de diagnóstico rápido](#comandos-de-diagnóstico-rápido)
9. [Regras de segurança invioláveis](#regras-de-segurança-invioláveis)
10. [Histórico de deploys recentes](#histórico-de-deploys-recentes)

---

## 1. Mapa completo de ambientes e IDs

### Supabase

| | DEV | PROD |
|---|---|---|
| **Projeto** | `vagasoeste-dev` | `vagasoeste` |
| **Project ID** | `nlqdjoxawzoegfxihief` | `jfyeheapyimdlickjozw` |
| **URL** | `https://nlqdjoxawzoegfxihief.supabase.co` | `https://jfyeheapyimdlickjozw.supabase.co` |
| **Dashboard** | https://supabase.com/dashboard/project/nlqdjoxawzoegfxihief | https://supabase.com/dashboard/project/jfyeheapyimdlickjozw |
| **SQL Editor** | https://supabase.com/dashboard/project/nlqdjoxawzoegfxihief/sql/new | https://supabase.com/dashboard/project/jfyeheapyimdlickjozw/sql/new |
| **Auth Users** | https://supabase.com/dashboard/project/nlqdjoxawzoegfxihief/auth/users | https://supabase.com/dashboard/project/jfyeheapyimdlickjozw/auth/users |
| **Tabelas** | https://supabase.com/dashboard/project/nlqdjoxawzoegfxihief/editor | https://supabase.com/dashboard/project/jfyeheapyimdlickjozw/editor |

### Vercel

| | DEV | PROD |
|---|---|---|
| **Site (santarem.app)** | Preview automático | `santarem.app` |
| **Platform (app.santarem.app)** | Preview automático | `app.santarem.app` |
| **Project ID — site** | `prj_W2Xd4Rr3gnbDjNmq0i5zJOYzk5Ou` | idem |
| **Project ID — platform** | `prj_NO65CAMalQxLZI7NkUOTnZo7e1QD` | idem |
| **Team/Org ID** | `team_fLwgcmPlPDXHwyOEqnALBOLJ` | idem |
| **Usuário Vercel** | `allanonica-1900` | idem |
| **Dashboard site** | https://vercel.com/allan-roberts-projects/site | idem |
| **Dashboard platform** | https://vercel.com/allan-roberts-projects/platform | idem |

### Fly.io (API)

| | DEV/Staging | PROD |
|---|---|---|
| **App name** | `vagasoeste-api-staging` | `vagasoeste-api` |
| **URL** | `https://vagasoeste-api-staging.fly.dev` | `https://api.santarem.app` |
| **Health** | `https://vagasoeste-api-staging.fly.dev/health` | `https://api.santarem.app/health` |
| **Dashboard** | https://fly.io/apps/vagasoeste-api-staging | https://fly.io/apps/vagasoeste-api |
| **Config file** | `fly.staging.toml` | `fly.toml` |

### URLs finais

| Serviço | DEV (local) | PROD |
|---|---|---|
| Site (Astro) | `http://localhost:4321` | `https://santarem.app` |
| Platform (React/Vite) | `http://localhost:3001` | `https://app.santarem.app` |
| API (Hono) | `http://localhost:3000` | `https://api.santarem.app` |

> **Por que platform usa porta 3001?** O `vite.config.ts` configura `server.port = 3000`, mas a API ocupa 3000 primeiro. O Vite auto-incrementa para 3001. Comportamento esperado, não é bug.

### Git

| Item | Valor |
|---|---|
| Repositório remoto | `https://github.com/allanonica-pixel/vagasoeste.git` |
| Branch de produção | `master` |
| Branch de desenvolvimento | qualquer branch de feature, ou diretamente em `master` |

> ⚠️ **ATENÇÃO:** A branch de produção é `master`, NÃO `main`. Nunca confundir. O Vercel está configurado contra `master`.

---

## 2. Autenticações e credenciais necessárias

### Vercel CLI

A CLI do Vercel está autenticada localmente. O token está em:
```
C:\Users\allan\AppData\Roaming\com.vercel.cli\Data\auth.json
```

Verificar se ainda está autenticado antes de qualquer deploy:
```bash
vercel whoami
# Esperado: allanonica-1900
```

Se expirado (o token tem validade), reautenticar:
```bash
vercel login
```

### Fly.io CLI

Verificar autenticação:
```bash
fly auth whoami
# Esperado: allanonica@gmail.com (ou allanstm@gmail.com)
```

### Git / GitHub

O repositório está configurado com o remote `origin`. Verificar:
```bash
git remote -v
# Esperado: origin  https://github.com/allanonica-pixel/vagasoeste.git
```

---

## 3. Estrutura do repositório

```
vagas-oeste/                          ← raiz do monorepo
├── apps/
│   ├── site/                         ← Astro (santarem.app)
│   │   └── .vercel/project.json      ← vincula ao prj_W2Xd4Rr3gnbDjNmq0i5zJOYzk5Ou
│   └── platform/                     ← React/Vite (app.santarem.app)
│       └── .vercel/project.json      ← vincula ao prj_NO65CAMalQxLZI7NkUOTnZo7e1QD
├── services/
│   └── api/                          ← Hono (api.santarem.app, Fly.io)
│       ├── fly.toml                  ← config PROD
│       ├── fly.staging.toml          ← config STAGING
│       └── migrations/               ← SQL a executar manualmente no Supabase
└── docs/                             ← esta pasta

```

> Os arquivos `.vercel/project.json` dentro de cada app garantem que o `vercel --prod` executado dentro de `apps/site` deploy para o projeto correto, e o mesmo para `apps/platform`. Nunca executar `vercel --prod` na raiz do monorepo.

---

## PARTE A — Deploy de desenvolvimento (DEV)

### A.1 — Subir o ambiente local

Execute em terminais separados, nesta ordem:

**Terminal 1 — API**
```bash
cd /c/Users/allan/openclaude/vagas-oeste/services/api
npm run dev
```
Aguardar: `API rodando em http://localhost:3000`
Testar: http://localhost:3000/health → `{"status":"ok"}`

**Terminal 2 — Platform**
```bash
cd /c/Users/allan/openclaude/vagas-oeste/apps/platform
npm run dev
```
Aguardar: `Local: http://localhost:3001/` (ou 3001 se 3000 já ocupada pela API)

**Terminal 3 — Site**
```bash
cd /c/Users/allan/openclaude/vagas-oeste/apps/site
npm run dev -- --host
```
Aguardar: `Local: http://localhost:4321/`

> O `--host` expõe o site na rede local (útil para testar no celular).

---

### A.2 — Commitar e fazer push de uma feature

```bash
cd /c/Users/allan/openclaude/vagas-oeste

# 1. Verificar estado do repositório
git status
git diff

# 2. Verificar se há erros TypeScript antes de commitar
cd apps/platform && npx tsc --noEmit && cd ../..
cd apps/site && npx tsc --noEmit && cd ../..

# 3. Adicionar arquivos relevantes (NUNCA usar git add . ou git add -A)
git add apps/platform/src/components/MinhaFeature.tsx
git add apps/site/src/pages/minha-pagina.astro

# 4. Commitar
git commit -m "feat: descrição clara da mudança"

# 5. Push para origin
git push origin master
```

Após o push, a **Vercel gera automaticamente um Preview** para os dois projetos. Os links aparecem em:
- https://vercel.com/allan-roberts-projects/site → aba Deployments
- https://vercel.com/allan-roberts-projects/platform → aba Deployments

---

### A.3 — Deploy da API de Staging

Só necessário quando há mudanças no código da API (`services/api/`):

```bash
cd /c/Users/allan/openclaude/vagas-oeste/services/api
fly deploy --config fly.staging.toml
```

Verificar após deploy:
```bash
curl https://vagasoeste-api-staging.fly.dev/health
# Esperado: {"status":"ok","db":{"status":"ok","latencyMs":...}}
```

---

### A.4 — Criar e executar uma nova migration no DEV

```bash
# 1. Criar o arquivo SQL (próximo número sequencial)
# services/api/migrations/000X_descricao.sql

# 2. Executar no Supabase DEV:
# https://supabase.com/dashboard/project/nlqdjoxawzoegfxihief/sql/new
# Cole o conteúdo do .sql e execute

# 3. Testar localmente

# 4. Commitar o arquivo
git add services/api/migrations/000X_descricao.sql
git commit -m "migration: descrição"
```

> ❌ NUNCA executar uma migration diretamente em PROD sem antes testar em DEV.

---

## PARTE B — Deploy de produção (PROD)

> ⚠️ Só execute quando TUDO foi testado em DEV e você tem certeza.

---

### B.0 — Checklist pré-deploy (verificar antes de qualquer coisa)

- [ ] Todos os arquivos estão commitados (`git status` limpo)
- [ ] O branch atual é `master` (`git branch` — deve mostrar `* master`)
- [ ] O push para origin já foi feito (`git log origin/master` = mesmo HEAD local)
- [ ] TypeScript sem erros (`npx tsc --noEmit` sem output)
- [ ] Se há migration nova: já testada e funcionando no Supabase DEV
- [ ] `vercel whoami` retorna `allanonica-1900`
- [ ] `fly auth whoami` retorna o email correto

---

### B.1 — Executar migration em PRODUÇÃO (se houver nova)

Acesse o SQL Editor do Supabase PROD e execute o conteúdo do arquivo SQL novo:

**URL:** https://supabase.com/dashboard/project/jfyeheapyimdlickjozw/sql/new

Execute as migrations na ordem sequencial. Verificar se a execução foi bem-sucedida antes de continuar.

> Se não há migration nova neste deploy, pule para B.2.

---

### B.2 — Deploy do Site (santarem.app)

```bash
cd /c/Users/allan/openclaude/vagas-oeste/apps/site
vercel --prod --yes
```

O output correto termina com:
```
Aliased: https://santarem.app [Xs]
{
  "status": "ok",
  "deployment": {
    "readyState": "READY",
    "target": "production"
  }
}
```

> **Importante:** executar DENTRO de `apps/site`. O arquivo `.vercel/project.json` presente nessa pasta garante que o deploy vai para `prj_W2Xd4Rr3gnbDjNmq0i5zJOYzk5Ou` (site/santarem.app), e não para outro projeto.

---

### B.3 — Deploy da Platform (app.santarem.app)

```bash
cd /c/Users/allan/openclaude/vagas-oeste/apps/platform
vercel --prod --yes
```

O output correto termina com:
```
Aliased: https://app.santarem.app [Xs]
{
  "status": "ok",
  "deployment": {
    "readyState": "READY",
    "target": "production"
  }
}
```

> **Importante:** executar DENTRO de `apps/platform`. O `.vercel/project.json` garante que vai para `prj_NO65CAMalQxLZI7NkUOTnZo7e1QD` (platform/app.santarem.app).

---

### B.4 — Deploy da API em PRODUÇÃO

Só necessário quando há mudanças no código da API (`services/api/`):

```bash
cd /c/Users/allan/openclaude/vagas-oeste/services/api
fly deploy
```

> Sem `--config`: usa o `fly.toml` padrão, que aponta para o app `vagasoeste-api` (PROD).

Verificar após deploy:
```bash
curl https://api.santarem.app/health
# Esperado: {"status":"ok","db":{"status":"ok","latencyMs":...}}
```

---

### B.5 — Por que NÃO usar "push para master = deploy automático"

> A integração GitHub → Vercel **não está funcionando de forma confiável** neste projeto.

Evidência: todos os deploys recentes em produção foram via `source: "cli"` ou `source: "redeploy"`. Os pushes para `master` não acionaram builds automáticos da Vercel. Os deployments de produção estavam servindo um commit antigo (`78c245af`) mesmo após vários pushes.

**Fluxo correto e seguro:**
1. Commitar e fazer `git push origin master` (mantém o GitHub atualizado)
2. Executar `vercel --prod --yes` em cada app manualmente (garante que o código certo vai para PROD)

---

## Checklist pré-deploy obrigatório

```
Antes de qualquer deploy de PRODUÇÃO, confirme cada item:

[ ] git status              → "nothing to commit, working tree clean"
[ ] git branch              → "* master"
[ ] git log origin/master   → mesmo SHA que HEAD local
[ ] vercel whoami           → "allanonica-1900"
[ ] fly auth whoami         → email correto
[ ] npm run build (opcional) → sem erros de build locais
[ ] Migrations: testadas em DEV antes de executar em PROD
[ ] Não há .env sendo commitado acidentalmente
```

---

## Verificação pós-deploy

### Site (santarem.app)

```bash
# Verificar via API da Vercel qual deployment está ativo
curl -s "https://api.vercel.com/v6/deployments?projectId=prj_W2Xd4Rr3gnbDjNmq0i5zJOYzk5Ou&target=production&limit=1" \
  -H "Authorization: Bearer $(cat /c/Users/allan/AppData/Roaming/com.vercel.cli/Data/auth.json | python3 -c 'import sys,json; print(json.load(sys.stdin)[\"token\"])')"
```

Verificação manual:
- Abrir https://santarem.app no navegador
- Verificar que o conteúdo está atualizado
- Verificar https://vercel.com/allan-roberts-projects/site → aba Deployments → deployment mais recente deve ter `target: production` e `readyState: READY`

### Platform (app.santarem.app)

- Abrir https://app.santarem.app no navegador
- Verificar que o conteúdo está atualizado
- Verificar https://vercel.com/allan-roberts-projects/platform → aba Deployments

### API (api.santarem.app)

```bash
curl https://api.santarem.app/health
# Esperado: {"status":"ok","db":{"status":"ok","latencyMs":<número>}}
```

### Supabase PROD

- Verificar tabelas: https://supabase.com/dashboard/project/jfyeheapyimdlickjozw/editor
- Verificar logs de Auth: https://supabase.com/dashboard/project/jfyeheapyimdlickjozw/auth/users

---

## Comandos de diagnóstico rápido

### Ver último deployment de cada projeto na Vercel

```bash
# Site
curl -s "https://api.vercel.com/v6/deployments?projectId=prj_W2Xd4Rr3gnbDjNmq0i5zJOYzk5Ou&target=production&limit=3" \
  -H "Authorization: Bearer TOKEN" \
  > /c/Users/allan/AppData/Local/Temp/site_check.json

# Platform
curl -s "https://api.vercel.com/v6/deployments?projectId=prj_NO65CAMalQxLZI7NkUOTnZo7e1QD&target=production&limit=3" \
  -H "Authorization: Bearer TOKEN" \
  > /c/Users/allan/AppData/Local/Temp/plat_check.json
```

> Substituir `TOKEN` pelo valor em `C:\Users\allan\AppData\Roaming\com.vercel.cli\Data\auth.json` → campo `"token"`.

### Verificar qual commit está em produção

No output do Vercel API, olhar:
- `meta.gitCommitSha` → SHA do commit que está sendo servido
- `meta.gitCommitMessage` → mensagem do commit

Comparar com o HEAD local:
```bash
git log --oneline -5
```

Se o SHA em produção for diferente do HEAD local, o deploy não foi aplicado.

### Verificar se há commits não deployados

```bash
git log --oneline origin/master | head -5
# Compare o SHA do topo com o que a Vercel API reporta em produção
```

---

## Regras de segurança invioláveis

### ❌ NUNCA fazer

```bash
# Nunca commitar .env com valores reais
git add .env
git add apps/platform/.env

# Nunca usar service_role no frontend
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJ...  # expõe bypass total de RLS

# Nunca executar deploy na raiz do monorepo
cd vagas-oeste && vercel --prod  # errado! vai criar um novo projeto desconhecido

# Nunca executar migration em PROD sem testar em DEV

# Nunca usar git push --force no master
git push --force origin master  # destrói histórico, bloqueia outros deploys

# Nunca resetar o banco de PRODUÇÃO
# (resetar DEV é permitido a qualquer hora)
```

### ✅ SEMPRE fazer

```bash
# Executar vercel --prod de dentro da pasta do app específico
cd apps/site && vercel --prod --yes
cd apps/platform && vercel --prod --yes

# Verificar autenticação antes do deploy
vercel whoami && fly auth whoami

# Fazer git push antes do vercel --prod (manter GitHub sincronizado)
git push origin master

# Executar migrations em DEV primeiro, PROD depois
# Commitar os arquivos .sql no git

# Usar --yes para evitar prompts interativos no Vercel CLI
vercel --prod --yes
```

---

## Migrations — status por ambiente

| Arquivo | Propósito | DEV | PROD |
|---------|-----------|-----|------|
| `0001_audit_media_functions.sql` | Schema audit + media + funções SQL | ✅ | ✅ |
| `0002_cron_jobs.sql` | pg_cron: purge mídia, expirar vagas, cleanup rate limit | ✅ | ✅ |
| `0003_admin_user.sql` | Tabela admin_users + policy básica | ✅ | ✅ |
| `0004_security_hardening.sql` | REVOKE granular, ops.rate_limit, INSERT público restrito | ✅ | ✅ |
| `0005_interesse_empresa.sql` | Tabelas otp_codes + empresa_pre_cadastros | ✅ | ✅ |
| `0006_fix_rls_admin_permissions.sql` | is_admin() SECURITY DEFINER + 6 policies recriadas | ⚠️ Pendente DEV | ✅ (2026-04-26) |

> A próxima migration a criar será `0007_nome.sql`.

---

## Variáveis de ambiente por app

### apps/platform — DEV local (`.env`)

```env
VITE_SUPABASE_URL=https://nlqdjoxawzoegfxihief.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scWRqb3hhd3pvZWdmeGloaWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNzI5OTYsImV4cCI6MjA5MjY0ODk5Nn0.S5XVCa2KjzK8yIU_iJDEZfJOSu7qRhaFWX3A2r1efVw
VITE_API_URL=http://localhost:3000
VITE_PUBLIC_SITE_URL=http://localhost:4321
```

### apps/site — DEV local (`.env`)

```env
PUBLIC_SUPABASE_URL=https://nlqdjoxawzoegfxihief.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scWRqb3hhd3pvZWdmeGloaWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNzI5OTYsImV4cCI6MjA5MjY0ODk5Nn0.S5XVCa2KjzK8yIU_iJDEZfJOSu7qRhaFWX3A2r1efVw
PUBLIC_SITE_URL=http://localhost:4321
PUBLIC_APP_URL=http://localhost:5173
```

### services/api — DEV local (`.env`)

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

> As variáveis de PRODUÇÃO do Vercel e Fly.io estão configuradas diretamente nos dashboards — nunca ficam em arquivo local. Consultar: Vercel Dashboard → Settings → Environment Variables | Fly.io → `fly secrets list -a vagasoeste-api`

---

## Histórico de deploys recentes

### santarem.app (site)

| Data | Deployment ID | Commit | Status |
|------|--------------|--------|--------|
| 2026-04-26 | `dpl_iwQogAaYcdSEskqP4bZBJnTvFvHk` | v5.0 (home + RLS fix + docs) | ✅ PROD |
| 2026-04-23 | `dpl_8zQQNiUyGjuEv1Uqsg3j93rYJRcM` | cards vaga + login (redeploy) | — |
| 2026-04-22 | `dpl_8AZnUKDztAVXce6w9gkzvnS9FGFF` | cards vaga + login (cli) | — |

### app.santarem.app (platform)

| Data | Deployment ID | Commit | Status |
|------|--------------|--------|--------|
| 2026-04-26 | `dpl_49Pb9tt8tBAi7NFBU1e8WFYJzaSd` | v5.0 (home + RLS fix + docs) | ✅ PROD |
| 2026-04-23 | `dpl_4jFouzrRTxUvkQitpxvjYVZWeEJG` | cards vaga + login (redeploy) | — |
| 2026-04-23 | `dpl_6rijz7MeJ4hj3RYtqAP6Y62r1WCc` | cards vaga + login (redeploy) | — |

---

## Diagrama do fluxo completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE DEPLOY                              │
└─────────────────────────────────────────────────────────────────┘

  DESENVOLVIMENTO LOCAL
  ─────────────────────
  Terminal 1: cd services/api && npm run dev       → :3000
  Terminal 2: cd apps/platform && npm run dev      → :3001
  Terminal 3: cd apps/site && npm run dev --host   → :4321
         │
         │  Supabase DEV: nlqdjoxawzoegfxihief
         │
         ▼
  COMMIT + PUSH
  ─────────────
  git add <arquivos específicos>
  git commit -m "feat: ..."
  git push origin master
         │
         ├──── Vercel gera Preview automático (Supabase DEV)
         │     └── links em vercel.com/dashboard
         │
         ▼
  [SE MIGRATION NOVA]
  ─────────────────────────────────────────────────────────────────
  1. Executar no Supabase DEV (SQL Editor)
  2. Testar localmente
  3. Executar no Supabase PROD (SQL Editor)
  ─────────────────────────────────────────────────────────────────
         │
         ▼
  DEPLOY PRODUÇÃO — SITE
  ───────────────────────
  cd apps/site
  vercel --prod --yes
         │
         └──→ santarem.app atualizado ✅
         │
         ▼
  DEPLOY PRODUÇÃO — PLATFORM
  ───────────────────────────
  cd apps/platform
  vercel --prod --yes
         │
         └──→ app.santarem.app atualizado ✅
         │
         ▼
  [SE MUDOU services/api]
  ─────────────────────────────────────────────────────────────────
  cd services/api
  fly deploy
  curl https://api.santarem.app/health → {"status":"ok"}
  ─────────────────────────────────────────────────────────────────
         │
         ▼
  VERIFICAÇÃO FINAL
  ──────────────────
  ✅ https://santarem.app         (site público)
  ✅ https://app.santarem.app     (plataforma)
  ✅ https://api.santarem.app/health (API)
```

---

*Última atualização: 2026-04-26 | Versão: 1.0*
*Este documento deve ser atualizado sempre que houver mudança de IDs, novos projetos, novas migrations ou alteração no fluxo de deploy.*
