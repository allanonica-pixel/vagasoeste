# Fase 1.5 — Cobertura Geográfica

**Status:** planejada (não iniciada)
**Aberta em:** 2026-05-03
**Pré-requisito:** Sprint Bugfix Aprovação (atual) fechado
**Estimativa:** 1-2 dias (alta disponibilidade do PO)
**Papéis principais:** Backend Sênior · DBA · Frontend Platform Sênior · Frontend Site/SEO Sênior

---

## Contexto

VagasOeste atende inicialmente Santarém/PA. Conforme expansão regional, novas cidades serão cobertas progressivamente. Hoje o cadastro de empresa não restringe por geografia — qualquer empresa de qualquer cidade pode se cadastrar, mas operacionalmente só atendemos quem está em cidades cobertas.

PO levantou em 2026-05-03 a necessidade de:
1. **Gestão administrativa** de regiões cobertas (Estado → Cidade → Bairro)
2. **Validação no cadastro** que bloqueia empresas fora de cobertura
3. **Captura de leads** dessas empresas bloqueadas (Potenciais Empresas) pra contato manual quando a cidade for adicionada à cobertura

---

## Decisões de produto (PO em 2026-05-03)

| Pergunta | Resposta |
|---|---|
| Validação do cadastro falha em qual nível? | **Cidade** (bairro é cadastro complementar, não bloqueia) |
| Empresa com matriz fora pode cadastrar? | **Sim**, escolhendo Estado + Cidade da operação via dropdown (não usa mais os dados retornados pela BrasilAPI pra cidade/estado) |
| Múltiplas cidades por empresa? | Cadastro inicial = **1 cidade**; adicionar mais cidades fica pra fase futura via painel da empresa |
| Anti-spam em Potenciais Empresas? | **Rate limit por IP + validação CNPJ rigorosa** via BrasilAPI |
| Notificação manual quando cobrir nova cidade? | **E-mail** apenas (WhatsApp seria intromissão pra empresa que tivemos que rejeitar) |

---

## Objetivos da Fase

### Objetivo primário
Permitir que o admin gerencie progressivamente as cidades atendidas pela VagasOeste, e que o cadastro de empresa respeite essa cobertura.

### Objetivo secundário
Capturar leads de empresas que tentaram se cadastrar mas não foram atendidas (cidade sem cobertura), pra contato manual posterior.

---

## Modelo de dados

### Migration `0016_regioes.sql`

```sql
-- Estados brasileiros (UF + nome)
CREATE TABLE IF NOT EXISTS estados (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  uf          char(2)     NOT NULL UNIQUE,        -- "PA", "SP", etc.
  nome        text        NOT NULL,               -- "Pará", "São Paulo"
  ativo       boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Cidades cobertas (vinculadas a estado)
CREATE TABLE IF NOT EXISTS cidades (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  estado_id   uuid        NOT NULL REFERENCES estados(id) ON DELETE RESTRICT,
  nome        text        NOT NULL,
  ativo       boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (estado_id, nome)
);

-- Bairros (vinculados a cidade) — cadastro complementar, não bloqueia cadastro
CREATE TABLE IF NOT EXISTS bairros (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  cidade_id   uuid        NOT NULL REFERENCES cidades(id) ON DELETE CASCADE,
  nome        text        NOT NULL,
  ativo       boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cidade_id, nome)
);

CREATE INDEX IF NOT EXISTS idx_cidades_estado_id ON cidades(estado_id);
CREATE INDEX IF NOT EXISTS idx_cidades_ativo     ON cidades(ativo) WHERE ativo = true;
CREATE INDEX IF NOT EXISTS idx_bairros_cidade_id ON bairros(cidade_id);

-- RLS: leitura pública (anon/authenticated), escrita só admin
ALTER TABLE estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE cidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE bairros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estados_read_public" ON estados FOR SELECT USING (true);
CREATE POLICY "cidades_read_public" ON cidades FOR SELECT USING (true);
CREATE POLICY "bairros_read_public" ON bairros FOR SELECT USING (true);

-- Seed inicial: PA + Santarém + Aldeia
INSERT INTO estados (uf, nome) VALUES ('PA', 'Pará') ON CONFLICT (uf) DO NOTHING;
WITH e AS (SELECT id FROM estados WHERE uf = 'PA')
INSERT INTO cidades (estado_id, nome) SELECT id, 'Santarém' FROM e ON CONFLICT DO NOTHING;
```

### Migration `0017_potenciais_empresas.sql`

```sql
-- Empresas que tentaram cadastro mas não foram cobertas geograficamente
CREATE TABLE IF NOT EXISTS potenciais_empresas (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj            text        NOT NULL,
  razao_social    text,
  company_name    text,
  contact_name    text,
  contact_email   text,
  contact_phone   text,         -- celular/whatsapp
  estado_uf       char(2),
  cidade          text,
  endereco        text,
  origin_ip       text,         -- pra rate limit + auditoria
  notificado_em   timestamptz,  -- preenchido quando admin envia e-mail "agora cobrimos sua cidade"
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cnpj)                 -- evita duplicatas se empresa tentar várias vezes
);

CREATE INDEX IF NOT EXISTS idx_potenciais_cidade        ON potenciais_empresas(estado_uf, cidade);
CREATE INDEX IF NOT EXISTS idx_potenciais_notificado    ON potenciais_empresas(notificado_em) WHERE notificado_em IS NULL;

ALTER TABLE potenciais_empresas ENABLE ROW LEVEL SECURITY;
-- Sem RLS de leitura pública — só admin acessa via service_role
```

---

## Backlog detalhado

### Bloco A — Schema + seeds

| ID | Tarefa | DoD |
|---|---|---|
| A1 | Migration `0016_regioes.sql` aplicada em DEV | Tabelas + RLS + seed (PA/Santarém) presentes |
| A2 | Migration `0017_potenciais_empresas.sql` aplicada em DEV | Tabela + índices + RLS |
| A3 | Drizzle schema atualizado em `services/api/src/schema/index.ts` | Types corretos, queries tipadas |

### Bloco B — Backend CRUD admin

| ID | Tarefa | DoD |
|---|---|---|
| B1 | `GET /v1/admin/regioes` — lista hierárquica (estados → cidades → bairros) | JSON estruturado |
| B2 | `POST /v1/admin/regioes/estados` — cadastra estado | Validação UF |
| B3 | `POST /v1/admin/regioes/cidades` — cadastra cidade vinculada a estado | Validação unicidade |
| B4 | `POST /v1/admin/regioes/bairros` — cadastra bairro vinculado a cidade | Idem |
| B5 | `PATCH /v1/admin/regioes/{tipo}/{id}` — ativa/desativa | Soft delete via `ativo` |
| B6 | `DELETE /v1/admin/regioes/{tipo}/{id}` — exclusão hard só se sem dependências | Senão erro com lista de dependências |

### Bloco C — Backend potenciais empresas

| ID | Tarefa | DoD |
|---|---|---|
| C1 | `POST /v1/interesse/potencial-empresa` — público com rate limit (3/IP/15min, 1/CNPJ ever) | Salva lead, valida CNPJ na BrasilAPI |
| C2 | `GET /v1/admin/potenciais-empresas` — lista paginada com filtros (cidade, notificado_em IS NULL) | JSON paginado |
| C3 | `POST /v1/admin/potenciais-empresas/notificar-cidade` — body `{ estado_uf, cidade }` envia e-mail bulk e marca `notificado_em` | Usa `sendTransactional` + template `buildPotencialNotificadoEmail` |
| C4 | `DELETE /v1/admin/potenciais-empresas/:id` — remove lead descartado | Soft? Hard? Decisão: hard (lead não tem valor histórico) |

### Bloco D — Validação no cadastro de empresa

| ID | Tarefa | DoD |
|---|---|---|
| D1 | `GET /v1/interesse/regioes-cobertas` — endpoint público leve com estados/cidades ativos pra dropdown | < 100ms |
| D2 | `POST /v1/interesse/submit` — adiciona validação: `cidade` informada deve estar em `cidades` ativas | Retorna `CITY_NOT_COVERED` com sugestão de cadastrar como potencial |
| D3 | Schema do body do `/submit` ganha campos `estado_uf` e `cidade` (escolhidos pela empresa, não BrasilAPI) | Zod atualizado |
| D4 | Migration de schema em `empresa_pre_cadastros` se necessário (talvez já tem `cidade`/`estado`) | Idempotente |

### Bloco E — Frontend Painel-admin

| ID | Tarefa | DoD |
|---|---|---|
| E1 | Novo menu "Regiões Atendidas" — UI com 3 colunas (estados/cidades/bairros) ou 3 abas | CRUD funcional |
| E2 | Novo menu "Potenciais Empresas" — lista com filtros + ação "Notificar potenciais de [cidade]" | Confirmação antes de bulk send |
| E3 | Pipeline frontend obrigatório (4 skills) aplicado em ambas as telas | Verificado no resumo |

### Bloco F — Frontend `/interesse-empresa` (site)

| ID | Tarefa | DoD |
|---|---|---|
| F1 | Carregar regiões cobertas via `GET /v1/interesse/regioes-cobertas` ao abrir formulário | Spinner enquanto carrega |
| F2 | Substituir input de "Estado" e "Cidade" por dropdowns com regiões cobertas | UX clara: "Selecione o Estado e Cidade da operação" |
| F3 | Lógica BrasilAPI mantida pra razão social/endereço, mas Estado/Cidade prevalecem do dropdown da empresa | Não conflita |
| F4 | Tratamento do erro `CITY_NOT_COVERED` retornado pelo `/submit`: modal informando "Por enquanto não atendemos esta cidade. Posso registrar seu interesse pra avisarmos quando expandirmos?" | Submete em `/v1/interesse/potencial-empresa` se confirmado |
| F5 | Pipeline frontend obrigatório aplicado | Verificado |

### Bloco G — Templates de e-mail

| ID | Tarefa | DoD |
|---|---|---|
| G1 | `buildPotencialNotificadoEmail` em `services/api/src/templates/company-emails.ts` — usa `_layout.ts` padrão | Template testado |
| G2 | Conteúdo: "Olá [contato], a VagasOeste agora atende [cidade]! Você se cadastrou no passado e queremos te avisar..." + CTA pra novo cadastro | Funciona com variáveis dinâmicas |

---

## Definition of Done da Fase

- [ ] Migrations aplicadas em DEV com seed PA/Santarém
- [ ] Painel-admin tem 2 menus novos funcionando
- [ ] Cadastro de empresa usa dropdowns Estado/Cidade
- [ ] Empresa de cidade não-coberta vê modal e pode se registrar como potencial
- [ ] Admin consegue disparar e-mail bulk pros potenciais quando ativa cidade nova
- [ ] Build production verificado nos 3 workspaces
- [ ] Pipeline frontend aplicado em todos os arquivos `.tsx` modificados
- [ ] Retrospectiva escrita ao fechar

---

## Riscos identificados

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Bot envia 10k cadastros falsos pra `/potencial-empresa` | Média | Alto | Rate limit + validação CNPJ obrigatória + UNIQUE(cnpj) |
| Lista oficial de estados/cidades brasileiros é grande | Baixa | Médio | Não vamos importar tudo — admin cadastra conforme expansão |
| Empresa preenche CNPJ de matriz mas operação é em outra cidade NÃO coberta — frustração | Média | Médio | Mensagem amigável no modal + CTA pro registro como potencial é o caminho |
| Desativar cidade quebra cadastros existentes em `companies` | Baixa | Alto | Cidade desativada = só não aceita novos cadastros; existentes ficam |

---

## Out of scope desta fase

- ❌ Múltiplas cidades por empresa (Fase futura, painel da empresa)
- ❌ Cadastro automático de bairros via API IBGE / similar (admin cadastra manual conforme demanda)
- ❌ Importação inicial em massa de cidades brasileiras (não precisamos — só Santarém no início)
- ❌ Notificação por WhatsApp (só e-mail nesta fase)
- ❌ CAPTCHA no `/potencial-empresa` (rate limit é suficiente pra MVP)
- ❌ Estatísticas/dashboard de potenciais por cidade (futuro)

---

## Status semanal

*A ser preenchido quando a fase abrir formalmente.*

---

## Retrospectiva

*A ser preenchida ao fechar.*
