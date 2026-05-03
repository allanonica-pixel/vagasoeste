# ADR 0001 — Modelo de equipe (10 papéis) e cadência por fases temáticas

**Status:** aceito
**Data:** 2026-05-03
**Decisores:** PO + Tech Lead

---

## Contexto

O projeto VagasOeste é desenvolvido por um **PO solo** com conhecimento técnico parcial, em colaboração com o assistente Claude atuando como time virtual de engenharia. O foco do produto exige perspectivas distintas e às vezes conflitantes:

- **SEO Avançado / Ranqueamento orgânico** no `apps/site` (Astro)
- **Alto volume de acessos simultâneos** no `apps/platform` (Vite/React) e `services/api` (Hono)
- **Solo dev com banda limitada** mas alta disponibilidade diária
- **Custo de infra controlado** (Vercel + Fly.io + Supabase Pro)

Sem disciplina explícita, o trabalho corre risco de:
1. Privilegiar uma camada e ignorar tradeoffs em outra (ex.: otimizar plataforma e regredir SEO do site)
2. Reduzir a presença de revisão crítica em decisões grandes
3. Perder ritmo por excesso de cerimônia inadequada pra solo dev
4. Acumular dívida técnica sem registro

Documento original `docs/equipe.md` v1.0 herdou modelo de outro projeto (sistema clínico) — inadequado pra VagasOeste.

---

## Decisão

**Estrutura:** 10 papéis explícitos, com Frontend dividido em dois (Site/SEO e Platform).

| # | Papel | Foco |
|---|---|---|
| 1 | Tech Lead / Arquiteto | Decisões arquiteturais e ADRs |
| 2 | Backend Sênior | Hono + Drizzle + Supabase server-side |
| 3 | Frontend Site / SEO Sênior | `apps/site` Astro — ranqueamento, Core Web Vitals, schema |
| 4 | Frontend Platform Sênior | `apps/platform` Vite/React — fluxos logados, performance |
| 5 | DBA / Data Engineer | Postgres, RLS, índices, migrations |
| 6 | DevOps / SRE | Vercel + Fly.io + capacidade |
| 7 | Security Engineer | OWASP, LGPD, auth, RLS |
| 8 | UI/UX Designer | Identidade visual, a11y, motion |
| 9 | QA Engineer | Vitest + Playwright |
| 10 | Project Manager | Fases, ADRs, status |

**Cadência:** Modelo A — Fases temáticas com 3 reforços:

1. Cada fase abre com `docs/fases/NNN-titulo.md`: objetivos, DoD, riscos, prazo estimado (não rígido)
2. Status semanal escrito em `docs/PLANO_MESTRE.md` toda segunda-feira (1 parágrafo)
3. Fechamento de fase com retrospectiva escrita antes de abrir a próxima

**Pipeline frontend obrigatório:** sequência fixa de 4 ou 5 skills (`/frontend-design` → `/baseline-ui` → `/fixing-accessibility` → `/fixing-motion-performance` [+ `/fixing-metadata` em `apps/site`]) em qualquer trabalho de UI. Pular = retrabalho.

**Definition of Done (DoD):** definido em `docs/equipe.md` §5 por categoria (UI, API, migration SQL, SEO).

---

## Consequências

### Positivas
- Clareza de qual perspectiva está sendo aplicada em cada decisão
- Frontend Site/SEO ganha papel próprio em vez de competir por atenção com Platform
- ADRs registram decisões grandes — não evaporam
- DoDs reduzem ambiguidade de "está pronto?"
- Pipeline frontend obrigatório força qualidade visual consistente
- Cadência por fases respeita o ritmo solo (sem standup vazio)

### Negativas
- Documentos extras pra manter (`equipe.md`, `PLANO_MESTRE.md`, `fases/*.md`, `adr/*.md`)
- Risco de virar burocracia se não usado em decisões reais
- Solo dev pode ser tentado a pular ADRs por velocidade — perda de rastreabilidade

### Riscos / dívidas registrados
- Sem ferramenta de tracking de issues (GitHub Issues / Linear) ainda — fases controladas via texto. Pode virar limitação quando feature backlog crescer.
- PM e Tech Lead são o mesmo agente (Claude). Existe risco de "captura de papel" — Tech Lead aprovando próprio plano. Mitigação: PO continua sendo árbitro final.

---

## Alternativas consideradas

### Alternativa B — Sprints de 2 semanas (clássico)
Descartada porque solo dev sem time não tira valor de standup, planning e retro formais. Vira ritual vazio.

### Alternativa C — Kanban contínuo sem marco
Descartada porque, sem marco de "fechamento", há risco de procrastinar grandes objetivos sob pretexto de tarefas pequenas urgentes. Em SEO, o investimento é de longo prazo — precisa de pressão de fechamento.

### Alternativa para papéis: 9 papéis (manter Frontend único)
Descartada porque os dois frontends têm objetivos opostos:
- `apps/site` otimiza pra crawler, indexação, Core Web Vitals
- `apps/platform` otimiza pra usuário logado, fluxo, latência percebida

Critérios de qualidade são distintos. Misturar dilui foco.

---

## Documentos relacionados

- `docs/equipe.md` (v2.0) — definição completa dos 10 papéis e cadência
- `docs/PLANO_MESTRE.md` — visão de alto nível das fases
- `docs/fases/NNN-*.md` — documentos individuais de cada fase
- `~/.claude/projects/C--Users-allan-openclaude-vagas-oeste/memory/feedback_decisao_tecnica.md` — preferência do PO por recomendação única do Tech Lead
- `~/.claude/projects/C--Users-allan-openclaude-vagas-oeste/memory/feedback_frontend_pipeline.md` — regra do pipeline obrigatório
