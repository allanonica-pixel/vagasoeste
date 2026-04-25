# Arquitetura VagasOeste — Análise de Perenidade

> Documento técnico preparado para orientar a evolução da plataforma VagasOeste
> de um MVP funcional para um sistema sustentável capaz de operar com **milhares
> de candidatos** e **centenas de acessos simultâneos**, com regras de negócio
> **enforçadas no servidor**, operações críticas em **transações SQL**, mídia
> com **ciclo de vida controlado** e **isolamento rigoroso** entre os mundos
> Candidato ↔ Empresa.

**Autor:** Arquitetura de Software
**Data:** 2026-04-19
**Versão:** 1.0
**Escopo:** apps/site (Astro SSG), apps/platform (React/Vite), Supabase (Postgres + Auth + Storage)

---

## Sumário

1. [Diagnóstico do estado atual](#1-diagnóstico-do-estado-atual)
2. [Princípios arquiteturais inegociáveis](#2-princípios-arquiteturais-inegociáveis)
3. [Tier 1 — Básico e Frágil (hoje)](#3-tier-1--básico-e-frágil-hoje)
4. [Tier 2 — Intermediário (recomendado 12–24 meses)](#4-tier-2--intermediário-recomendado-1224-meses)
5. [Tier 3 — Avançado (escala nacional / multi-região)](#5-tier-3--avançado-escala-nacional--multi-região)
6. [Modelagem de dados proposta](#6-modelagem-de-dados-proposta)
7. [Fluxos críticos com transação SQL](#7-fluxos-críticos-com-transação-sql)
8. [Ciclo de vida de mídia (foto temporária, vídeo 30s)](#8-ciclo-de-vida-de-mídia)
9. [Segurança — MFA, isolamento e defesa em profundidade](#9-segurança)
10. [Observabilidade e SLO](#10-observabilidade)
11. [Plano de migração incremental](#11-plano-de-migração)
12. [Estimativa de custo por tier](#12-estimativa-de-custo)
13. [Decisões de arquitetura (ADR)](#13-adrs)

---

## 1. Diagnóstico do estado atual

O MVP atual atende à validação de mercado, mas **não é sustentável** para o
volume desejado. Os riscos principais:

| Risco | Situação hoje | Impacto |
|---|---|---|
| **Autenticação mock** | `sessionStorage.setItem("vagasoeste_user_auth", …)` | Qualquer pessoa abre o DevTools e se "autentica". Zero segurança. |
| **Regras de negócio no frontend** | Filtros, limites, elegibilidade de candidatura checados no React | Dev malicioso burla trivialmente (ex.: candidatar-se em vagas expiradas, duplicar candidaturas). |
| **Acesso direto ao Supabase pelo cliente** | `PUBLIC_SUPABASE_ANON_KEY` embutida no bundle | Toda proteção depende exclusivamente de **RLS** bem escritas — uma policy esquecida = vazamento. |
| **Sem transações explícitas** | Operações multi-tabela (candidatura + contador + notificação) são sequenciais e podem inconsistir | Estado sujo no banco. |
| **Mídia sem ciclo de vida** | Fotos e vídeos futuros no Supabase Storage sem TTL | Custo cresce linear, LGPD descumprida (dados retidos além do necessário). |
| **Sem isolamento Empresa ↔ Candidato** | Mesmo banco, mesmo auth | Uma vulnerabilidade afeta todos. |
| **Sem rate limiting** | Endpoint aberto | Bot de spam cria 10k candidaturas em 1 min. |
| **Sem auditoria** | Nenhum log estruturado de ações sensíveis | Impossível investigar incidente ou atender a requisição LGPD. |

**Conclusão:** o frontend hoje é uma vitrine bonita, mas a camada de confiança
está do lado errado. Precisamos **inverter a pirâmide de confiança**: nada que
o cliente envia é verdade até o servidor validar.

---

## 2. Princípios arquiteturais inegociáveis

Estes cinco princípios norteiam os três tiers adiante. Eles **não são negociáveis**
— o que muda entre tiers é a sofisticação da implementação, não a presença.

### 2.1. Servidor é a única fonte de verdade
- Toda regra de negócio (elegibilidade, limites, cotas, expiração) vive em
  código de servidor ou em constraints/funções do Postgres.
- Frontend **apenas** apresenta e envia intenções; nunca decide.

### 2.2. Defesa em profundidade
1. **WAF / rate limit** na borda (Vercel Edge Middleware / Cloudflare)
2. **AuthN** — JWT assinado, curto TTL, rotação de refresh token
3. **AuthZ** — checagem de papel (candidato/empresa/admin) no handler
4. **RLS** — Postgres Row Level Security como última trincheira
5. **Auditoria** — append-only log de ações sensíveis

Se uma camada falhar, a seguinte contém o dano.

### 2.3. Operações críticas em transação SQL
Candidatura, publicação de vaga, expiração de mídia, alteração de plano da
empresa — **tudo** dentro de `BEGIN … COMMIT` com `SERIALIZABLE` ou
`REPEATABLE READ` onde houver race condition possível.

### 2.4. Isolamento por tenant (empresa) e por persona
- Schema lógico separa `candidate.*` de `company.*`
- Empresa **nunca** consulta tabela de candidato diretamente — sempre via view
  materializada com PII mascarada até haver consentimento explícito.
- MFA obrigatório para empresa; opcional (mas incentivado) para candidato.

### 2.5. Mídia com ciclo de vida declarado
Todo blob no storage nasce com `expires_at`. Um job periódico remove objetos
vencidos. Política de retenção é parte do contrato de dados, não um detalhe
operacional.

---

## 3. Tier 1 — Básico e Frágil (hoje)

### 3.1. Topologia

```
[ Navegador ]
     │  (HTTPS)
     ▼
[ Vercel Edge — Astro SSG + React SPA ]
     │  (anon key pública)
     ▼
[ Supabase ] ── Postgres + Storage + Auth
```

### 3.2. Características
- **Stack:** Astro SSG (site público) + React/Vite (plataforma) + Supabase.
- **Auth:** mock via `sessionStorage`.
- **Dados:** lidos do Supabase com anon key; RLS parcialmente configurada.
- **Mídia:** nenhuma ainda.
- **Deploy:** Vercel, duas apps separadas.

### 3.3. Capacidade estimada
- ~50 usuários simultâneos antes de sintomas.
- ~500 candidatos cadastrados antes de a gestão virar manual.
- Zero resiliência: uma policy errada vaza o banco inteiro.

### 3.4. Quando aceitar este tier
Apenas para **validação de mercado até 200 candidatos cadastrados e < 10
empresas-piloto**. Passou disso, migrar para Tier 2 é urgente.

---

## 4. Tier 2 — Intermediário (recomendado 12–24 meses)

Este é o **alvo imediato**. Suporta milhares de candidatos, centenas de
simultâneos, mídia com ciclo de vida, MFA para empresa, regras no servidor, e
custa abaixo de R$ 2.000/mês até ~10k candidatos ativos.

### 4.1. Topologia

```
                     ┌──────────────────────────────────────┐
                     │  Cloudflare (DNS, WAF, rate limit)   │
                     └──────────────────┬───────────────────┘
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
 [ site.vagasoeste ]         [ app.vagasoeste ]             [ api.vagasoeste ]
   Astro SSG (Vercel)          React SPA (Vercel)            Hono + Node 22
                                                             (Fly.io / Render)
                                                                      │
                ┌─────────────────────────────────────────────────────┤
                ▼                    ▼                     ▼          ▼
        [ Supabase Postgres ]  [ Supabase Auth ]   [ Cloudflare      [ Upstash Redis ]
          (RLS + pgcrypto        (MFA/TOTP)         Stream ]           (rate-limit,
          + row-level audit)                        vídeos 30s         cache, fila
                                                    TTL assinado)      leve)
                                │
                                ▼
                        [ Inngest / Trigger.dev ]
                         (jobs: expiração, emails,
                          webhooks de pagamento)
```

### 4.2. Componentes

#### 4.2.1. Camada de API (`api.vagasoeste.com.br`)
- **Framework:** [Hono](https://hono.dev) rodando em Node 22 (ou Bun) — leve,
  tipado, suporta edge se preciso.
- **ORM:** Drizzle ORM — migrations versionadas, tipado em TS, suporta
  transações explícitas com `db.transaction(async (tx) => …)`.
- **Validação:** Zod em todo input; resposta tipada também.
- **Hospedagem:** Fly.io (2 regiões: GRU + GIG) ou Render.
- **Contratos:** OpenAPI gerado a partir dos schemas Zod (`zod-openapi`).

**Decisão crítica:** o frontend **nunca mais** usa `supabase-js` com anon key
para mutations. Toda escrita passa pela API. Leituras públicas (listagem de
vagas) podem seguir via anon key + RLS somente-leitura, mas o ideal é também
mediar pela API para permitir cache/CDN.

#### 4.2.2. Autenticação e MFA
- **Supabase Auth** continua como IdP (barato, funciona, tem MFA/TOTP nativo).
- **Candidato:** senha + email; MFA opcional.
- **Empresa:** MFA **obrigatório** via TOTP (Google Authenticator/Authy).
  Fluxo de onboarding bloqueia primeiro acesso sem enroll de TOTP.
- **Admin:** MFA obrigatório + IP allowlist (Cloudflare Access).
- **Custom claims:** `role`, `company_id`, `mfa_verified_at` — injetados no JWT
  via [Auth Hook](https://supabase.com/docs/guides/auth/auth-hooks). Handlers
  checam claims em cada request.

#### 4.2.3. Banco — Postgres com rigor
- **Schemas lógicos:** `public`, `candidate`, `company`, `ops`, `audit`.
- **RLS habilitada em todas as tabelas**, mas a API usa `service_role`
  controlada — RLS vira **rede de segurança**, não o único controle.
- **Funções `SECURITY DEFINER`** para operações atômicas (vide §7).
- **Triggers de auditoria** em tabelas sensíveis (candidaturas, ofertas,
  alteração de dados pessoais) gravando em `audit.event_log` append-only.
- **Backups:** PITR do Supabase (7 dias) + dump diário criptografado em R2.

#### 4.2.4. Mídia — Cloudflare Stream + R2
- **Fotos de currículo (temporárias):** bucket R2 com `x-amz-expires` header e
  URL pré-assinada de 10 min para upload, 24 h para leitura. Registro em
  `media.asset` com `expires_at`.
- **Vídeos de 30s:** Cloudflare Stream — upload direto do cliente via TUS
  (token de upload gerado pela API), transcoding automático, expiração nativa
  via `requireSignedURLs=true` e tokens de acesso com TTL.
- **Job de purge:** Inngest cron a cada 15 min varre `media.asset WHERE
  expires_at < now() AND deleted_at IS NULL`, deleta do storage, marca
  `deleted_at`.

#### 4.2.5. Filas e jobs sem "peso de fila"
Você pediu explicitamente para evitar filas pesadas. Proposta:
- **Inngest** (ou Trigger.dev) — step functions serverless, sem infra de Kafka/RabbitMQ.
  Modelo de eventos + retries + cron, cobrado por execução.
- Casos de uso:
  - Purge de mídia expirada
  - Email de confirmação de candidatura
  - Webhook de pagamento da empresa
  - Agregações noturnas para dashboards
- **Upstash Redis** — rate limiting (`@upstash/ratelimit`), cache de listagens,
  locks distribuídos leves.

#### 4.2.6. Observabilidade mínima
- **Logs:** estruturados (pino) → Axiom ou Logtail.
- **Traces:** OpenTelemetry → Grafana Cloud Free tier.
- **Métricas:** RED (Rate/Error/Duration) por endpoint; p95, p99.
- **Alertas:** erro 5xx > 1% em 5 min, p95 > 800 ms, fila de jobs > 100.

### 4.3. Capacidade estimada
- ~1.000 requisições/segundo em pico (Hono + 2 vCPU Fly.io).
- ~50.000 candidatos cadastrados sem degradação.
- ~500 simultâneos sem ajuste; 2k com scale-out horizontal.

---

## 5. Tier 3 — Avançado (escala nacional / multi-região)

Acionar quando Tier 2 mostrar sinais de saturação: p95 > 500 ms de forma
sustentada, > 100k candidatos, expansão para outras regiões do Brasil ou
produto B2B com SLA contratual.

### 5.1. Mudanças-chave sobre Tier 2

| Área | Tier 2 | Tier 3 |
|---|---|---|
| **Banco** | Supabase single-region | Postgres gerenciado (Neon/Crunchy) com **read replicas** por região + PgBouncer |
| **Cache** | Upstash Redis single | Redis Cluster regional + CDN de leitura com stale-while-revalidate |
| **Busca** | Postgres FTS | Meilisearch/Typesense dedicado, indexado via CDC (Debezium ou Supabase Realtime) |
| **API** | Hono Node GRU+GIG | Hono + Bun em 4+ regiões; gateway com circuit breaker (Envoy/Kong) |
| **Auth** | Supabase Auth | WorkOS / Auth0 para enterprise SSO; Supabase Auth para self-serve |
| **Mídia** | Cloudflare Stream + R2 | Idem + Mux para analytics avançado de vídeo |
| **Observabilidade** | Axiom + Grafana Cloud | Datadog ou New Relic com APM + RUM + Session Replay |
| **Segurança** | Cloudflare WAF | WAF + Bot Management + DDoS L7 + pentest trimestral |
| **Compliance** | LGPD básico | LGPD + ISO 27001 + SOC 2 Type II |
| **Deploy** | Vercel + Fly | Kubernetes gerenciado (EKS/GKE) com ArgoCD |

### 5.2. Quando NÃO ir para Tier 3
- Complexidade operacional explode (DevOps dedicado necessário).
- Custo 5–10× o Tier 2.
- Só faz sentido com receita recorrente > R$ 100k/mês.

---

## 6. Modelagem de dados proposta

Schema resumido (Postgres). Migrations via Drizzle.

```sql
-- =========================================================
-- SCHEMA: identidade
-- =========================================================
CREATE SCHEMA IF NOT EXISTS identity;

CREATE TABLE identity.user (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id    UUID NOT NULL UNIQUE,        -- ref auth.users (Supabase)
  role            TEXT NOT NULL CHECK (role IN ('candidate','company_member','admin')),
  email           CITEXT NOT NULL UNIQUE,
  mfa_enrolled_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

-- =========================================================
-- SCHEMA: candidato
-- =========================================================
CREATE SCHEMA IF NOT EXISTS candidate;

CREATE TABLE candidate.profile (
  user_id     UUID PRIMARY KEY REFERENCES identity.user(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  phone_e164  TEXT,
  city        TEXT,
  state       TEXT,
  headline    TEXT,
  summary     TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE candidate.resume (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES identity.user(id),
  version         INT  NOT NULL,
  photo_asset_id  UUID REFERENCES media.asset(id),   -- foto TEMPORÁRIA
  video_asset_id  UUID REFERENCES media.asset(id),   -- pitch 30s
  payload         JSONB NOT NULL,                    -- seções estruturadas
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, version)
);

-- =========================================================
-- SCHEMA: empresa
-- =========================================================
CREATE SCHEMA IF NOT EXISTS company;

CREATE TABLE company.organization (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name    TEXT NOT NULL,
  cnpj          CHAR(14) NOT NULL UNIQUE,
  display_name  TEXT NOT NULL,
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','starter','pro','enterprise')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE company.member (
  organization_id UUID NOT NULL REFERENCES company.organization(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES identity.user(id)        ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('owner','admin','recruiter','viewer')),
  mfa_required    BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE company.job_posting (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES company.organization(id),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  contract_type   TEXT NOT NULL,
  salary_min      NUMERIC(12,2),
  salary_max      NUMERIC(12,2),
  city            TEXT,
  state           TEXT,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','closed','expired')),
  published_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  applications_count INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON company.job_posting (status, expires_at);
CREATE INDEX ON company.job_posting (organization_id);

-- =========================================================
-- SCHEMA: candidatura (cruza candidato × vaga)
-- =========================================================
CREATE TABLE public.application (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id  UUID NOT NULL REFERENCES company.job_posting(id),
  candidate_id    UUID NOT NULL REFERENCES identity.user(id),
  resume_id       UUID NOT NULL REFERENCES candidate.resume(id),
  status          TEXT NOT NULL DEFAULT 'submitted'
                  CHECK (status IN ('submitted','seen','shortlisted','rejected','hired','withdrawn')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_posting_id, candidate_id)       -- evita candidatura duplicada
);

CREATE INDEX ON public.application (candidate_id, created_at DESC);
CREATE INDEX ON public.application (job_posting_id, status);

-- =========================================================
-- SCHEMA: mídia
-- =========================================================
CREATE SCHEMA IF NOT EXISTS media;

CREATE TABLE media.asset (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID NOT NULL REFERENCES identity.user(id),
  kind         TEXT NOT NULL CHECK (kind IN ('resume_photo','pitch_video','company_logo')),
  storage      TEXT NOT NULL CHECK (storage IN ('r2','cf_stream')),
  external_id  TEXT NOT NULL,      -- chave no bucket ou UID do Stream
  mime_type    TEXT NOT NULL,
  size_bytes   BIGINT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at   TIMESTAMPTZ NOT NULL,
  deleted_at   TIMESTAMPTZ
);

CREATE INDEX ON media.asset (expires_at) WHERE deleted_at IS NULL;

-- =========================================================
-- SCHEMA: auditoria (append-only)
-- =========================================================
CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE audit.event_log (
  id          BIGSERIAL PRIMARY KEY,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id    UUID,
  actor_role  TEXT,
  action      TEXT NOT NULL,
  target      TEXT NOT NULL,
  target_id   UUID,
  payload     JSONB,
  ip          INET,
  user_agent  TEXT
);
-- insert-only: revoga UPDATE/DELETE do role aplicação
REVOKE UPDATE, DELETE ON audit.event_log FROM PUBLIC;
```

---

## 7. Fluxos críticos com transação SQL

### 7.1. Candidatura atômica

Regra de negócio: candidato elegível + vaga ativa + sem duplicata + incrementa
contador + grava auditoria — **tudo ou nada**.

Implementação como `SECURITY DEFINER` function (invocada pela API):

```sql
CREATE OR REPLACE FUNCTION public.apply_to_job(
  p_candidate_id UUID,
  p_job_id       UUID,
  p_resume_id    UUID,
  p_ip           INET,
  p_user_agent   TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, company, candidate, audit
AS $$
DECLARE
  v_application_id UUID;
  v_job            company.job_posting%ROWTYPE;
BEGIN
  -- lock pessimista na vaga para evitar condição de corrida no contador
  SELECT * INTO v_job
    FROM company.job_posting
   WHERE id = p_job_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'JOB_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  IF v_job.status <> 'active'
     OR (v_job.expires_at IS NOT NULL AND v_job.expires_at < now()) THEN
    RAISE EXCEPTION 'JOB_NOT_APPLICABLE' USING ERRCODE = 'P0001';
  END IF;

  -- resume pertence ao candidato?
  PERFORM 1
    FROM candidate.resume
   WHERE id = p_resume_id
     AND user_id = p_candidate_id
     AND published_at IS NOT NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'RESUME_INVALID' USING ERRCODE = 'P0001';
  END IF;

  -- insere (unique constraint barra duplicata)
  INSERT INTO public.application (job_posting_id, candidate_id, resume_id)
    VALUES (p_job_id, p_candidate_id, p_resume_id)
    RETURNING id INTO v_application_id;

  UPDATE company.job_posting
     SET applications_count = applications_count + 1
   WHERE id = p_job_id;

  INSERT INTO audit.event_log (actor_id, actor_role, action, target, target_id, payload, ip, user_agent)
       VALUES (p_candidate_id, 'candidate', 'application.submitted', 'job_posting', p_job_id,
               jsonb_build_object('application_id', v_application_id, 'resume_id', p_resume_id),
               p_ip, p_user_agent);

  RETURN v_application_id;
END;
$$;
```

Handler Hono:

```ts
app.post('/v1/applications', zValidator('json', applySchema), async (c) => {
  const user = c.get('user');              // do middleware de auth
  if (user.role !== 'candidate') return c.json({ error: 'FORBIDDEN' }, 403);

  const { jobId, resumeId } = c.req.valid('json');
  const { ip, ua } = ctx(c);

  try {
    const id = await db.execute(sql`
      SELECT public.apply_to_job(${user.id}, ${jobId}, ${resumeId}, ${ip}, ${ua}) AS id
    `);
    return c.json({ applicationId: id.rows[0].id }, 201);
  } catch (e) {
    return mapPgError(c, e);               // P0001 → 409, P0002 → 404, unique → 409
  }
});
```

**Nenhuma regra vive no React.** O botão "Candidatar" apenas envia `{ jobId,
resumeId }`. Se o frontend tentar trapacear (ex.: enviar um `resumeId` de
outro candidato), a função SQL rejeita.

### 7.2. Publicação de vaga pela empresa

```sql
CREATE OR REPLACE FUNCTION company.publish_job(
  p_user_id UUID, p_job_id UUID
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_org UUID; v_plan TEXT; v_active_count INT;
BEGIN
  -- usuário pertence à org dona da vaga?
  SELECT jp.organization_id INTO v_org
    FROM company.job_posting jp
    JOIN company.member      m ON m.organization_id = jp.organization_id
   WHERE jp.id = p_job_id AND m.user_id = p_user_id AND m.role IN ('owner','admin','recruiter')
   FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;

  -- plano permite?
  SELECT plan INTO v_plan FROM company.organization WHERE id = v_org;
  SELECT count(*) INTO v_active_count
    FROM company.job_posting WHERE organization_id = v_org AND status = 'active';

  IF v_plan = 'free' AND v_active_count >= 1 THEN
    RAISE EXCEPTION 'PLAN_LIMIT_REACHED';
  END IF;

  UPDATE company.job_posting
     SET status = 'active', published_at = now(), expires_at = now() + INTERVAL '30 days'
   WHERE id = p_job_id;

  INSERT INTO audit.event_log (actor_id, actor_role, action, target, target_id)
       VALUES (p_user_id, 'company_member', 'job.published', 'job_posting', p_job_id);
END;
$$;
```

### 7.3. Expiração e purge de mídia (cron Inngest + SQL)

```sql
CREATE OR REPLACE FUNCTION media.pick_expired(p_limit INT)
RETURNS TABLE (id UUID, storage TEXT, external_id TEXT)
LANGUAGE sql AS $$
  SELECT id, storage, external_id
    FROM media.asset
   WHERE expires_at < now() AND deleted_at IS NULL
   ORDER BY expires_at
   LIMIT p_limit
   FOR UPDATE SKIP LOCKED;     -- permite vários workers sem colisão
$$;
```

Worker Inngest:

```ts
inngest.createFunction(
  { id: 'media-purge', concurrency: 3 },
  { cron: '*/15 * * * *' },
  async ({ step }) => {
    const assets = await step.run('pick', () => pickExpired(100));
    for (const a of assets) {
      await step.run(`delete-${a.id}`, async () => {
        if (a.storage === 'r2')        await r2.delete(a.external_id);
        if (a.storage === 'cf_stream') await cfStream.delete(a.external_id);
        await db.execute(sql`UPDATE media.asset SET deleted_at = now() WHERE id = ${a.id}`);
      });
    }
  }
);
```

---

## 8. Ciclo de vida de mídia

### 8.1. Foto de currículo (temporária)
- Upload: cliente pede à API `POST /v1/media/resume-photo/upload-url`.
- API valida (MIME, role, rate), gera URL pré-assinada R2 (10 min), insere
  `media.asset` com `kind='resume_photo'` e `expires_at = now() + 90 days`.
- Cliente dá `PUT` direto no R2.
- Leitura por URL assinada de 1 h, gerada sob demanda.
- Ao atingir `expires_at`, purge remove do bucket e marca `deleted_at`.

### 8.2. Vídeo pitch 30s
- API cria upload direto no Cloudflare Stream com `maxDurationSeconds=30` e
  `requireSignedURLs=true`; devolve token TUS.
- Cliente envia vídeo direto ao Stream (reduz carga na API).
- `media.asset` registra UID, `expires_at = now() + 30 days` (configurável).
- Reprodução só com token assinado (curto TTL: 10 min).
- Purge chama `DELETE /accounts/.../stream/:uid`.

### 8.3. LGPD
- `/v1/me/delete` (direito ao esquecimento) — transação que anonimiza
  `candidate.profile`, marca `identity.user.deleted_at`, lista e apaga assets,
  registra em `audit.event_log` com motivo.
- Export de dados (portabilidade) em ZIP via job Inngest.

---

## 9. Segurança

### 9.1. MFA
| Persona | MFA | Observação |
|---|---|---|
| Candidato | Opcional (incentivado via badge de "perfil verificado") | Reduz fricção no cadastro |
| Membro de empresa | **Obrigatório** (TOTP) | Enroll no primeiro login; sem TOTP não acessa painel |
| Admin interno | **Obrigatório** + IP allowlist Cloudflare Access | |

### 9.2. Isolamento Empresa ↔ Candidato
- Schemas Postgres separados (§6).
- RLS: `candidate.*` nunca é lida por `role=company_member`; empresa acessa
  candidatos **somente** via view `company.application_view` que aplica
  mascaramento progressivo:
  - Status `submitted/seen`: só primeiro nome + iniciais.
  - Status `shortlisted`: nome completo, contato, currículo.
- Toda elevação de acesso gera linha em `audit.event_log`.

### 9.3. Rate limiting (Upstash)
```ts
const limiter = new Ratelimit({
  redis, limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true, prefix: 'rl:apply',
});
// middleware
const { success } = await limiter.limit(`apply:${user.id}`);
if (!success) return c.json({ error: 'RATE_LIMIT' }, 429);
```

### 9.4. Segredos
- Nunca no frontend. `PUBLIC_*` apenas para URLs e anon key de leitura pública.
- Rotação trimestral de service role keys.
- Doppler ou Vercel env para gestão.

### 9.5. Checklist OWASP ASVS L2
Implementar gradualmente: validação de input, output encoding, CSP estrita,
cookies `Secure/HttpOnly/SameSite=Lax`, CSRF tokens em mutações que usem
sessão (não aplica se for Bearer JWT), headers de segurança via middleware.

---

## 10. Observabilidade

### 10.1. Logs estruturados (pino)
```ts
logger.info({ userId, jobId, latencyMs, outcome: 'applied' }, 'application.submit');
```
Campos obrigatórios: `traceId`, `userId` (hash), `route`, `status`, `latencyMs`.

### 10.2. Traces
OpenTelemetry auto-instrumenta Hono, pg, fetch. Export OTLP → Grafana
Tempo / Axiom.

### 10.3. SLOs propostos
| SLO | Alvo |
|---|---|
| Disponibilidade API | 99.9 % (≈ 43 min/mês) |
| p95 leitura vagas | < 300 ms |
| p95 candidatura | < 600 ms |
| Tempo de purge de vídeo após expiração | < 30 min |
| Erro 5xx | < 0,5 % |

### 10.4. Dashboards
- **Produto:** candidaturas/dia, vagas ativas, conversão vaga→candidatura.
- **Ops:** p50/p95/p99 por rota, erro por rota, saturação do pool Postgres.
- **Segurança:** tentativas de login falhas, spikes de 429, anomalias.

---

## 11. Plano de migração

Fases incrementais — zero big-bang. Cada fase é implantável independentemente.

### Fase 0 — Fundação (2 semanas)
- [ ] Criar repo de migrations Drizzle apontando para Supabase atual
- [ ] Aplicar schemas novos (§6) sem remover tabelas antigas (convivência)
- [ ] Habilitar RLS em TUDO com policy `FALSE` padrão; abrir explicitamente
- [ ] Configurar Cloudflare na frente dos domínios

### Fase 1 — API mínima (3 semanas)
- [ ] Hono + Drizzle no Fly.io (2 regiões)
- [ ] Endpoints: `/v1/auth/me`, `/v1/jobs` (list/detail), `/v1/applications`
      (create), `/v1/me/resumes`
- [ ] Frontend platform migra para chamar API (remove `supabase-js` de mutations)
- [ ] Função `apply_to_job` implantada e em uso

### Fase 2 — Empresa + MFA (3 semanas)
- [ ] Painel da empresa consome API exclusivamente
- [ ] Enroll TOTP obrigatório para `company_member`
- [ ] Função `publish_job` + limites por plano

### Fase 3 — Mídia (2 semanas)
- [ ] R2 + Cloudflare Stream provisionados
- [ ] Endpoints de upload assinado
- [ ] Job Inngest de purge rodando

### Fase 4 — Observabilidade (1 semana)
- [ ] OTEL instrumentando toda a API
- [ ] Dashboards e alertas no Grafana Cloud

### Fase 5 — Remoção do mock auth (1 semana)
- [ ] `sessionStorage.vagasoeste_user_auth` deletado do código
- [ ] Todas as páginas usam sessão real do Supabase Auth
- [ ] Redirect 401 → /login

### Fase 6 — Hardening (contínuo)
- [ ] Pentest externo
- [ ] Revisão trimestral de RLS
- [ ] Rotação de chaves

---

## 12. Estimativa de custo

Valores aproximados em USD/mês, para referência (4/2026):

### Tier 1 (hoje)
| Item | Custo |
|---|---|
| Vercel Hobby (2 projetos) | US$ 0 |
| Supabase Free | US$ 0 |
| Domínio | ~US$ 3 |
| **Total** | **~US$ 3** |

### Tier 2 (recomendado)
| Item | Custo |
|---|---|
| Vercel Pro | US$ 20 |
| Supabase Pro (8 GB, PITR) | US$ 25 |
| Fly.io (2× shared-cpu-1x) | US$ 10 |
| Cloudflare (DNS+WAF+Stream básico) | US$ 5 + mídia sob demanda |
| R2 (100 GB, 10M requests) | ~US$ 5 |
| Upstash Redis Pay-as-you-go | ~US$ 10 |
| Inngest Starter | US$ 20 |
| Axiom (observability) | US$ 25 |
| **Total base** | **~US$ 120** (~R$ 720) |
| Com ~10k candidatos ativos + 1 TB mídia | **~US$ 280** (~R$ 1.700) |

### Tier 3 (avançado)
| Item | Custo |
|---|---|
| Postgres gerenciado multi-região | US$ 400+ |
| Redis Cluster | US$ 150 |
| Meilisearch dedicado | US$ 100 |
| Datadog APM + RUM | US$ 500+ |
| Cloudflare Enterprise features | negociado |
| DevOps dedicado (pessoa) | custo humano significativo |
| **Total** | **US$ 2.000+ / mês** |

---

## 13. ADRs

Decisões de arquitetura com justificativa. Cada uma em arquivo separado em
`docs/adr/` no futuro; aqui o resumo.

### ADR-001 · Hono no lugar de Next.js API Routes
**Contexto:** API precisa ser tipada, leve, portável entre edge e node, e
independente dos apps frontend.
**Decisão:** Hono em processo dedicado.
**Consequência:** Mais um serviço para operar, mas evita acoplamento ao
runtime da Vercel e permite deploy em Fly.io multi-região.

### ADR-002 · Drizzle ORM no lugar de Prisma
**Contexto:** Precisamos de transações explícitas, SQL próximo do metal,
sem runtime pesado.
**Decisão:** Drizzle.
**Consequência:** Curva mais próxima de SQL; migrations triviais; bundle
pequeno.

### ADR-003 · Cloudflare Stream para vídeo
**Contexto:** Vídeos de 30s com expiração, streaming HLS, signed URLs.
**Decisão:** Cloudflare Stream em vez de rolar infra própria com ffmpeg.
**Consequência:** Custo previsível por minuto, zero operação.

### ADR-004 · Inngest em vez de BullMQ/Celery
**Contexto:** Usuário explicitamente pediu "sem peso de fila".
**Decisão:** Inngest (step functions serverless).
**Consequência:** Retries, cron, eventos, tudo gerenciado. Lock-in mitigado
por API simples; saída para SQS+Lambda se necessário.

### ADR-005 · Schemas Postgres para isolamento
**Contexto:** Evitar que query de empresa acesse tabela de candidato.
**Decisão:** Schemas lógicos `candidate`, `company`, `audit` + RLS.
**Consequência:** Permissões granulares por role; views explícitas mediam
cruzamentos.

### ADR-006 · Supabase Auth mantido no Tier 2
**Contexto:** Reescrever auth é caro; Supabase Auth tem MFA, OAuth, magic
link, custom claims.
**Decisão:** Manter Supabase Auth, migrar só se demanda enterprise surgir.
**Consequência:** Um fornecedor a menos para trocar agora; custo marginal.

---

## Apêndice A · Glossário rápido

- **RLS** (Row Level Security): policies do Postgres que filtram linhas
  visíveis por role/contexto.
- **SECURITY DEFINER**: função SQL que roda com privilégios do dono, não do
  chamador — ideal para encapsular regras sensíveis.
- **Custom claims**: campos extras no JWT (role, company_id) injetados por
  Auth Hook.
- **TTL**: Time To Live, prazo de expiração.
- **TUS**: protocolo de upload resumível, usado pelo Cloudflare Stream.
- **CDC**: Change Data Capture, stream de mudanças do banco para outros
  serviços (ex.: índice de busca).

---

## Apêndice B · O que NÃO fazer

Anti-padrões que vi em projetos similares e que devemos evitar:

1. **Checar `isLoggedIn` só no frontend.** Toda rota protegida precisa de
   middleware no servidor.
2. **Usar `service_role` key no browser.** Nunca. Ela bypassa RLS.
3. **"Sincronizar" contadores via polling.** Use triggers ou função atômica
   como `apply_to_job`.
4. **Armazenar CPF/CNPJ em claro.** Criptografia coluna-nível (pgcrypto) ou
   tokenização externa.
5. **Logs com PII.** Hashear `userId`, mascarar email (`j***@domain`).
6. **Deploy de schema sem migration.** Toda mudança passa por Drizzle +
   PR + CI.
7. **Confiar em `updated_at` do frontend.** Timestamp sempre do servidor
   (`DEFAULT now()`).

---

**Fim do documento.**

Próximos passos sugeridos:
1. Revisar e aprovar este documento.
2. Abrir PR criando `docs/adr/` e mover ADRs para arquivos individuais.
3. Começar **Fase 0** do plano de migração — o ganho de segurança do mock auth
   para Supabase Auth real + RLS é imediato e barato.
