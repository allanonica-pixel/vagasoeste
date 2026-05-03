# SQL de Limpeza Total — 2026-05-03

> **Pra rodar:** Dashboard Supabase DEV → SQL Editor → cola os blocos abaixo na ordem.
> **Antes:** o admin (`allanstm@gmail.com`) deve ser preservado em todas as etapas — esse é o **único** usuário que NÃO apagamos.

## 1. Limpa dados de negócio (public schema)

```sql
-- Aplicações dependem de jobs e candidates → apaga primeiro
DELETE FROM applications;

-- Empresas, vagas, candidatos
DELETE FROM jobs;
DELETE FROM candidate_courses;
DELETE FROM candidates;
DELETE FROM companies;

-- Pre-cadastros e OTP de empresa
DELETE FROM empresa_pre_cadastros;
DELETE FROM otp_codes;

-- Notificações + auditoria
DELETE FROM admin_notifications;
DELETE FROM company_audit_log;

-- Posts de blog (se quiser zerar — comente se não)
-- DELETE FROM blog_posts;
```

## 2. Limpa users do Authentication (auth schema)

⚠️ **Use a GUI.** Apagar de `auth.users` direto via SQL pode deixar órfãos em `auth.sessions`, `auth.identities`, `auth.refresh_tokens`. A GUI cascateia.

**Caminho:** Dashboard Supabase DEV → **Authentication** → **Users**

Apaga **TODOS os usuários** EXCETO `allanstm@gmail.com` (admin):
- empresa3, empresa4, empresa5, empresa6 (e qualquer outra `@onica.com.br` exceto allanstm)
- teste1, teste3 (Allan Robert tese1, Allan Robert Teste3 — eram candidatos de teste)

**Procedimento:**
1. Marca o checkbox de cada usuário a apagar (todos menos `allanstm@gmail.com`)
2. Clica em **"Delete users"** no topo
3. Confirma

## 3. Confirma estado limpo

```sql
SELECT 'auth.users'              AS tabela, count(*) FROM auth.users
UNION ALL
SELECT 'companies',                count(*) FROM companies
UNION ALL
SELECT 'empresa_pre_cadastros',    count(*) FROM empresa_pre_cadastros
UNION ALL
SELECT 'jobs',                     count(*) FROM jobs
UNION ALL
SELECT 'candidates',               count(*) FROM candidates
UNION ALL
SELECT 'applications',             count(*) FROM applications
UNION ALL
SELECT 'admin_notifications',      count(*) FROM admin_notifications
UNION ALL
SELECT 'company_audit_log',        count(*) FROM company_audit_log;
```

**Esperado:**
- `auth.users` = **1** (só o admin)
- Todas as outras = **0**

Se algo não bater, manda print que eu investigo.
