# Plano Mestre — VagasOeste

> **Função deste documento:** visão de alto nível das fases do projeto. Não substitui os documentos individuais de cada fase em `docs/fases/`. Atualizado pelo **PM** ao abrir/fechar fase, ou quando há mudança de escopo significativa.
>
> **Última atualização:** 2026-05-03

---

## Estado atual do produto

| Camada | Estado | Observação |
|---|---|---|
| `apps/site` (Astro) | DEV completo, funcional em `localhost:4321` | Base SEO já implementada (sitemap, JobPosting, FAQ, Breadcrumb) — entra em fase de **hardening** |
| `apps/platform` (Vite/React) | DEV completo, funcional em `localhost:3001` | Login + admin + plataforma candidato + cadastro 5 etapas + currículo unificado |
| `services/api` (Hono) | DEV completo, funcional em `localhost:3000` | Drizzle + Supabase Postgres, migrations 0001-0015 aplicadas no DEV Pro |
| Supabase DEV | Pro tier (OnicaSistemasPro / vagasoeste-dev) | Auth real, SMTP custom, JWT keys novo (HS256 legacy desabilitado), `sb_publishable_` + `sb_secret_` em uso |
| Produção | **Não está no ar com volume** | Domínio `santarem.app` reservado, deploy não feito ainda |

---

## Roadmap de fases

### Fase 1 — SEO técnico do site (em execução)
**Objetivo:** levar o `apps/site` ao nível "production-grade" em SEO técnico antes do lançamento público, garantindo Lighthouse SEO ≥ 95 e estrutura de schema completa pra ranqueamento local Santarém/PA.

Documento: [`docs/fases/001-seo-tecnico-site.md`](./fases/001-seo-tecnico-site.md)

### Fase 2 — Hardening de produção (planejada)
**Objetivo:** preparar projeto pra deploy real (Vercel + Fly.io + Supabase PROD), com observabilidade, monitoramento, SSL enforce, secrets em provedores e plano de rollback.

Pré-requisito: Fase 1 fechada.

### Fase 3 — Lançamento e captação inicial (planejada)
**Objetivo:** colocar `santarem.app` no ar, submeter ao Google Search Console, popular banco PROD com primeiras vagas reais, primeiros candidatos cadastrados.

Pré-requisito: Fase 2 fechada.

### Fase 4+ — Crescimento e escala
**Objetivo:** otimizações de escala (cache, particionamento, CDN tuning) à medida que o volume justificar. Definidas com dados, não especulação.

---

## Fases concluídas

Nenhuma ainda — primeiro ciclo formalizado começa com a Fase 1.

**Trabalho anterior à formalização** (2026-04 a 2026-05-03):
- Reorganização de histórico git em commits temáticos (10 commits)
- Migração de memória do projeto pro namespace correto
- Rotação completa de credenciais Supabase (DB password, JWT secret, sb_secret_)
- Limpeza de credenciais e refs de project em arquivos versionados (1 commit)
- Definição do modelo de equipe (10 papéis) e cadência (Modelo A — fases temáticas)

---

## Cadência operacional

- **Status:** atualizado neste documento toda segunda-feira pelo PM, parágrafo curto sobre o que andou na semana e o que vem na próxima.
- **Abertura de fase:** novo documento em `docs/fases/NNN-titulo.md` com objetivos, DoD, riscos.
- **Fechamento de fase:** retrospectiva escrita na seção final do documento da fase, decisões grandes registradas em `docs/adr/`.
- **ADRs:** decisões arquiteturais grandes em `docs/adr/NNNN-titulo.md` — append-only.

---

## Status semanal (mais recente no topo)

### Semana de 2026-05-03

**Andou:**
- Limpeza de credenciais e migração pra `sb_publishable_` / `sb_secret_`
- Definição da estrutura de equipe e cadência (commit pendente)
- Auditoria inicial de SEO no site (resultado: base sólida, hardening focado)

**Vem agora:**
- Fase 1 — SEO técnico do site

**Bloqueios:** nenhum.
