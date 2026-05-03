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

### Fase 1 — SEO técnico do site (PAUSADA em 90%)
**Objetivo:** levar o `apps/site` ao nível "production-grade" em SEO técnico antes do lançamento público, garantindo Lighthouse SEO ≥ 95 e estrutura de schema completa pra ranqueamento local Santarém/PA.

**Pausa:** vide [ADR 0002](./adr/0002-pausa-fase1-fix-aprovacao-empresa.md). Pendente apenas Bloco B4-B6 (assets gráficos) e Bloco D (Lighthouse benchmark + validação JobPosting com vaga real).

Documento: [`docs/fases/001-seo-tecnico-site.md`](./fases/001-seo-tecnico-site.md)

### Sprint Bugfix — Aprovação de Empresa (em finalização)
**Objetivo:** corrigir bugs no fluxo de cadastro/ativação/aprovação de empresa.
- ✅ Bug 1: Aprovação envia e-mail real (commit `2c40fdd`)
- ✅ Bug 2: Forgot-password acha empresa em `empresa_pre_cadastros` (commit `be08ac9`)
- ✅ Bug 3: Backend valida que empresa ativou antes de aprovar (commit `be08ac9`)
- ✅ Bug B: Botão "Acessar a Plataforma" não vai mais pra rota restrita (commit `1f510ac`)
- ✅ Bug C: Empresa loga após ativar (email_confirm via /ativar) (commit `30dcb2e`)
- ✅ Bug D: 2FA não força enrollment imediato no login (commit `2dcd962`)
- ⏳ Bug H: Modal de confirmação ao Redefinir Senha
- ⏳ Bug I: UI pra empresa ativar/desativar MFA pelo painel
- ⏳ Limpeza completa de dados (pre_cadastros, companies, candidates, jobs, mocks)

ADR: [0002](./adr/0002-pausa-fase1-fix-aprovacao-empresa.md)
Bugs descobertos no E2E: [`docs/fases/sprint-fix-ux-ativacao.md`](./fases/sprint-fix-ux-ativacao.md)

### Fase 1.5 — Cobertura Geográfica (planejada)
**Objetivo:** gerenciar cidades atendidas e capturar leads de empresas em cidades não-cobertas.
- Schema regiões (estados/cidades/bairros) + potenciais_empresas
- Painel-admin: menus "Regiões Atendidas" e "Potenciais Empresas"
- Cadastro de empresa: dropdowns Estado/Cidade da operação + validação de cobertura
- Disparo de e-mail bulk pra potenciais quando cidade ganha cobertura

Documento: [`docs/fases/0015-cobertura-geografica.md`](./fases/0015-cobertura-geografica.md)

### Fase 2 — Marketplace Operacional (planejada)
**Objetivo:** habilitar e-mail transacional real, limites de candidaturas por empresa/vaga, pausa de vaga com limpeza de candidaturas + notificação.

Documento: [`docs/fases/002-marketplace-operacional.md`](./fases/002-marketplace-operacional.md)

Pré-requisito: Sprint Bugfix fechado + Fase 1 reaberta e fechada.

### Fase 3 — Hardening de produção (planejada)
**Objetivo:** preparar projeto pra deploy real (Vercel + Fly.io + Supabase PROD), com observabilidade, monitoramento, SSL enforce, secrets em provedores e plano de rollback.

Pré-requisito: Fase 2 fechada.

### Fase 4 — Lançamento e captação inicial (planejada)
**Objetivo:** colocar `santarem.app` no ar, submeter ao Google Search Console, popular banco PROD com primeiras vagas reais, primeiros candidatos cadastrados.

### Fase 5+ — Crescimento e escala
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

**Andou (manhã/tarde):**
- Rotação completa de credenciais Supabase (DB password + JWT secret + sb_secret_)
- Limpeza de credenciais e refs em arquivos versionados
- Definição de estrutura de equipe v2.0 (10 papéis) + ADR 0001
- Fase 1 SEO: Bloco A (schemas globais) + Bloco B parcial (fonts/icons/preload/lazy) + Bloco C (cache/CSP) entregues
- ADR 0002 e Sprint Bugfix Aprovação aberto durante teste E2E
- 6 bugs corrigidos no sprint bugfix (1, 2, 3, B, C, D)
- SMTP transacional próprio integrado (Resend via nodemailer)
- Layout padrão de e-mails idêntico aos templates Supabase oficiais
- Bug G fechado (e-mail de invite agora em pt-BR via SMTP próprio)
- Painel-admin ganhou aba "Aguardando Ativação" pra suporte

**Vem agora:**
- Limpeza de dados (pre_cadastros, candidates, jobs, mocks)
- Bug H (confirmação ao redefinir senha) + Bug I (UI ativação MFA)
- Fechar Sprint Bugfix Aprovação
- Abrir Fase 1.5 (Cobertura Geográfica)

**Bloqueios:** nenhum.
