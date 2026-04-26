# VagasOeste — Mapa de Políticas RLS

> Versão: 2.0 | Data: 2026-04-26
> Row Level Security completo do banco Supabase Pro.
> Toda tabela nasce com RLS habilitado e default-deny.
> **Migration 0006 aplicada em produção** — todas as policies admin usam `is_admin()` SECURITY DEFINER.

---

## Princípio fundamental

```
RLS habilitado = qualquer acesso negado por padrão
Policy explícita = exceção autorizada para uma operação específica
service_role    = bypass total de RLS (somente na API server-side)
anon role       = acesso mínimo necessário para site público
```

> **Nunca desabilitar RLS em produção.** Se precisar de acesso total temporário, usar `service_role` com client específico no código, nunca via Supabase Studio em produção.

---

## Função `is_admin()` — SECURITY DEFINER (migration 0006)

Todas as policies de admin usam esta função em vez de referenciar `admin_users` diretamente.

**Por que é necessário:** o PostgreSQL avalia TODAS as policies permissivas antes de decidir o acesso. Se qualquer policy lança um erro de permissão (ex.: `anon` tentando acessar `admin_users`), a query inteira falha — mesmo que outra policy concedesse acesso. A função SECURITY DEFINER roda com os privilégios do owner (postgres), não do chamador.

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
```

> **Verificar se está aplicada em produção:**
> ```sql
> SELECT proname, prosecdef FROM pg_proc
> WHERE proname = 'is_admin' AND pronamespace = 'public'::regnamespace;
> -- Esperado: prosecdef = true
> ```

---

## Tabela: `jobs` (vagas)

| Policy | Operação | USING / WITH CHECK | Quem |
|--------|----------|-------------------|------|
| `jobs_public_read` | SELECT | `status = 'ativo'` | Todos (anon + authenticated) |
| `jobs_company_read_own` | SELECT | `company_id IN (SELECT id FROM companies WHERE auth_user_id = auth.uid())` | Empresa (próprias vagas, qualquer status) |
| `jobs_company_insert` | INSERT | `company_id IN (...empresa ativa...)` | Empresa com status ativo |
| `jobs_company_update` | UPDATE | `company_id IN (SELECT id FROM companies WHERE auth_user_id = auth.uid())` | Empresa (próprias) |
| `jobs_admin_all` | ALL | **`is_admin()`** | Admin |

**Risco mitigado:** Empresa não pode ver vagas de outra empresa. Candidato vê apenas vagas `ativo`. Admin vê tudo.

---

## Tabela: `companies` (empresas)

| Policy | Operação | WITH CHECK | Quem |
|--------|----------|-----------|------|
| `companies_own_read` | SELECT | `auth_user_id = auth.uid()` | Empresa (própria) |
| `companies_own_update` | UPDATE | `auth_user_id = auth.uid()` | Empresa (própria) |
| `companies_public_insert` | INSERT | `status = 'pendente' AND cnpj IS NOT NULL AND email IS NOT NULL AND razao_social IS NOT NULL` | Público (pré-cadastro) |
| `companies_admin_all` | ALL | **`is_admin()`** | Admin |

**Risco mitigado (migration 0004):** INSERT público agora exige campos obrigatórios e status='pendente'. Impossível criar empresa diretamente ativa via RLS.

---

## Tabela: `candidates` (candidatos)

| Policy | Operação | USING / WITH CHECK | Quem |
|--------|----------|-------------------|------|
| `candidates_own_read` | SELECT | `auth_user_id = auth.uid()` | Próprio candidato |
| `candidates_own_update` | UPDATE | `auth_user_id = auth.uid()` | Próprio candidato |
| `candidates_own_insert` | INSERT | `auth_user_id = auth.uid()` | Próprio candidato |
| `candidates_admin_all` | ALL | **`is_admin()`** | Admin |

**Risco mitigado:** Empresa NUNCA acessa a tabela `candidates` diretamente. O acesso da empresa passa pela API Hono, que usa `service_role` e aplica mascaramento de PII em código.

**Permissões revogadas (migration 0004):**
```sql
REVOKE INSERT, UPDATE, DELETE ON candidates FROM anon;
```

---

## Tabela: `applications` (candidaturas)

| Policy | Operação | USING / WITH CHECK | Quem |
|--------|----------|-------------------|------|
| `applications_candidate_read` | SELECT | `candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid())` | Candidato (próprias) |
| `applications_candidate_insert` | INSERT | `candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid())` | Candidato (próprias) |
| `applications_company_read` | SELECT | `company_id IN (SELECT id FROM companies WHERE auth_user_id = auth.uid())` | Empresa (das suas vagas) |
| `applications_company_update` | UPDATE | `company_id IN (SELECT id FROM companies WHERE auth_user_id = auth.uid())` | Empresa (das suas vagas) |
| `applications_admin_all` | ALL | **`is_admin()`** | Admin |

**Risco mitigado:**
- Candidato A não vê candidaturas de Candidato B
- Empresa A não vê candidaturas nas vagas de Empresa B
- `anon` não pode inserir candidatura (REVOKE em migration 0004)

---

## Tabela: `candidate_courses`

| Policy | Operação | USING | Quem |
|--------|----------|-------|------|
| (herda via JOIN de `candidates`) | SELECT/INSERT/UPDATE | `candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid())` | Próprio candidato |
| Admin | ALL | `is_admin()` | Admin |

---

## Tabela: `candidate_requests` (solicitações de contato/entrevista)

| Policy | Operação | Quem |
|--------|----------|------|
| Empresa lê próprias solicitações | SELECT | Empresa (company_id = auth.uid()) |
| Admin | ALL | `is_admin()` |

**Nota:** Candidato não acessa esta tabela diretamente — as solicitações são gerenciadas pela VagasOeste.

---

## Tabela: `blog_posts`

| Policy | Operação | USING | Quem |
|--------|----------|-------|------|
| `blog_posts_public_read` | SELECT | `is_published = TRUE` | Todos |
| `blog_posts_admin_all` | ALL | **`is_admin()`** | Admin |

---

## Tabela: `neighborhoods`

| Policy | Operação | USING | Quem |
|--------|----------|-------|------|
| `neighborhoods_public_read` | SELECT | `TRUE` | Todos |
| `neighborhoods_admin_all` | ALL | **`is_admin()`** | Admin |

---

## Tabela: `admin_users`

| Policy | Operação | Quem |
|--------|----------|------|
| `admin_admin_all` | ALL | `auth.uid() IN (SELECT auth_user_id FROM admin_users)` |

**Risco mitigado:** Nenhum usuário não-admin acessa esta tabela. `anon` tem `REVOKE ALL` explícito (migration 0004).

> **Nota:** esta é a única tabela que pode referenciar `admin_users` diretamente na policy (self-referential). Todas as outras tabelas usam `is_admin()` para evitar "permission denied" quando o role anon avalia as policies.

---

## Tabela: `empresa_pre_cadastros` (pré-cadastros de empresa)

> Criada em migration 0005. Alimentada por `/interesse-empresa` (plataforma e site).

| Policy | Operação | USING / WITH CHECK | Quem |
|--------|----------|-------------------|------|
| `empresa_pre_cadastros_insert_public` | INSERT | `status = 'pendente'` | Todos (formulário público) |
| `empresa_pre_cadastros_admin_all` | ALL | **`is_admin()`** | Admin |

**Campos principais:**
- `company_name`, `razao_social`, `cnpj` — dados da empresa
- `contact_name`, `contact_role`, `contact_email`, `contact_whatsapp` — contato
- `setores` (array text), `vacancies_qty`, `message` — interesse
- `status`: `pendente` → `aprovado` | `rejeitado` (mapeado no UI como `pendente/ativo/rejeitado`)
- `created_at`, `updated_at`

---

## Tabela: `otp_codes` (códigos OTP WhatsApp)

> Criada em migration 0005. Usada pela API para o fluxo OTP do `/interesse-empresa`.

| Policy | Operação | Quem |
|--------|----------|------|
| Sem policy pública | — | Acesso apenas via API com service_role |

**Campos principais:**
- `phone` — número WhatsApp
- `code` — código de 6 dígitos (hasheado)
- `expires_at` — 10 minutos de validade
- `used` — boolean; código é marcado como usado após verificação

---

## Schemas internos (audit, media, ops)

Estes schemas não têm policies RLS — são acessados **somente** via `service_role` pela API Hono ou por funções SECURITY DEFINER.

```sql
-- migration 0004
REVOKE ALL ON ALL TABLES IN SCHEMA ops   FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA audit FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA media FROM anon;
```

O `authenticated` role também não tem acesso direto a esses schemas — toda escrita passa pelas funções SQL:

| Schema | Acesso permitido via |
|--------|---------------------|
| `audit` | `apply_to_job()` (SECURITY DEFINER) |
| `media` | `media.purge_expired()` (SECURITY DEFINER) |
| `ops` | API Hono (service_role client) |

---

## Verificação de políticas ativas

```sql
-- Listar todas as políticas RLS ativas
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Verificar RLS habilitado em todas as tabelas
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Esperado: rowsecurity = true em todas
```

---

## Regras para adicionar novas tabelas

1. Criar com `ALTER TABLE nova_tabela ENABLE ROW LEVEL SECURITY;`
2. Definir policy de SELECT mínima necessária
3. `REVOKE INSERT, UPDATE, DELETE FROM anon;` se não for tabela pública
4. Documentar aqui com rationale
5. Nunca criar policy `FOR ALL USING (TRUE)` — isso remove toda proteção
