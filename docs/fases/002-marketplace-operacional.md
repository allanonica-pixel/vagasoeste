# Fase 2 — Marketplace Operacional

**Status:** planejada (não iniciada)
**Aberta em:** 2026-05-03 (planejamento)
**Início estimado:** após fechamento do Sprint Bugfix Aprovação + retomada e fechamento da Fase 1
**Prazo estimado:** 1-2 semanas (alta disponibilidade do PO)
**Papéis principais:** Backend Sênior · Frontend Platform Sênior · DBA · UI/UX · QA

---

## Contexto

Durante o sprint bugfix de aprovação de empresa (vide [ADR 0002](../adr/0002-pausa-fase1-fix-aprovacao-empresa.md)), o PO levantou requisitos operacionais adicionais que não cabem no bugfix cirúrgico mas precisam entrar antes do lançamento real do produto. Esta fase consolida esses requisitos.

---

## Objetivos

### Objetivo primário
Implementar mecanismos de **gestão operacional** que tornem o marketplace gerenciável em escala — controle de capacidade por empresa e ciclo de vida de vaga (pausa com efeitos colaterais).

### Objetivo secundário
Habilitar **e-mail transacional real** (não apenas de auth via Supabase) — necessário pra notificações de aprovação, rejeição, pausa de vaga, etc.

---

## Backlog detalhado

### Bloco E — E-mail transacional

| ID | Tarefa | Critério de aceitação |
|---|---|---|
| E1 | Decisão técnica: Resend × SMTP custom OnicaSistemasPro × outro. ADR 0003. | ADR escrito |
| E2 | Implementar `services/api/src/lib/email.ts` com helper `sendTransactional({to, subject, html})` | Função tipada, testável |
| E3 | Templates HTML pra: aprovação, rejeição, vaga pausada (candidato), limite atingido (empresa) | 4 templates em `services/api/src/templates/` |
| E4 | Substituir `email_pending: true` (do bugfix) por envio real | Logs mostram envio bem-sucedido |
| E5 | Health check do envio em `/health` (campo `email.status`) | `/health` retorna `email.status: ok\|degraded` |

### Bloco F — Limites de candidaturas

**Regra de negócio:** Admin define limite de candidaturas por empresa. Empresa configura **padrão** pra novas vagas e pode **sobrescrever por vaga**.

| ID | Tarefa | Critério de aceitação |
|---|---|---|
| F1 | Migration `0016_candidate_limits.sql`: adicionar `companies.max_candidates_default INTEGER`, `companies.max_candidates_global INTEGER NULL` (limite total imposto pelo admin), `jobs.max_candidates INTEGER NULL` (override por vaga) | Migration idempotente, índices revisados |
| F2 | Backend: ao receber candidatura nova, verificar `applications WHERE job_id = X AND status NOT IN ('reprovado','contratado')` < `jobs.max_candidates ?? companies.max_candidates_default ?? companies.max_candidates_global ?? infinito` | Endpoint de candidatura retorna 409 quando limite atingido |
| F3 | Backend: ao definir `max_candidates_global` por admin, validar que valor ≥ candidaturas ativas atuais | 400 se valor inviável |
| F4 | Frontend admin: na tela de detalhe da empresa, input pra `max_candidates_global` + botão "Aplicar limite" | Validação visual + toast |
| F5 | Frontend empresa: na config da conta, input pra `max_candidates_default` (aplicado a novas vagas) | Persiste em companies |
| F6 | Frontend empresa: no formulário de cadastro/edição de vaga, input opcional `max_candidates` (override) | Default = `max_candidates_default` |
| F7 | UI candidato: quando limite atingido em uma vaga, mostrar estado "Vaga com candidaturas encerradas — capacidade atingida" em vez de botão "Candidatar" | Mensagem clara, sem expor número exato |

### Bloco G — Pausar vaga com limpeza de candidaturas

**Regra de negócio:** empresa pode pausar uma vaga. Se a vaga tem candidatos, **limpa todos** ao pausar. Empresa **é avisada antes** de pausar (modal de confirmação). Candidatos afetados recebem **e-mail informativo**.

| ID | Tarefa | Critério de aceitação |
|---|---|---|
| G1 | Backend: endpoint `POST /v1/company/jobs/:id/pausar` autenticado por empresa. Valida ownership. Conta candidaturas ativas. Retorna `{ pendingCount: N }` (sem efeito ainda) — modo "preview" | Retorna corretamente |
| G2 | Backend: endpoint `POST /v1/company/jobs/:id/pausar/confirmar` — efetivamente pausa (jobs.status='pausado'), DELETE FROM applications WHERE job_id, dispara e-mail pra cada candidato afetado | Status atualizado, mails enviados |
| G3 | Frontend empresa: botão "Pausar vaga" → chama endpoint preview → modal "Esta vaga tem N candidatos. Pausar vai REMOVER as candidaturas e notificar os candidatos. Confirmar?" → ao confirmar chama o endpoint de confirmação | UX clara, sem ambiguidade |
| G4 | Backend: endpoint `POST /v1/company/jobs/:id/reativar` — só permite se status='pausado'. Volta pra 'ativo'. Não restaura candidaturas (já foram limpas) | Vaga volta a aparecer ao público |
| G5 | UI candidato: quando vê histórico de candidaturas e uma foi removida por pause, mostrar status especial "Vaga pausada pela empresa" em vez de sumir do histórico (defesa em profundidade) | Histórico transparente |

### Bloco H — Hardening, telemetria e auditoria

| ID | Tarefa | Critério de aceitação |
|---|---|---|
| H1 | Auditoria em `company_audit_log` pra ações: aprovação, rejeição, pausa, reativação, ajuste de limite | Toda ação relevante tem entry |
| H2 | Métricas no admin: candidaturas por vaga (média), vagas pausadas, limites usados | Dashboard com 4-6 KPIs |
| H3 | Notificação ao admin quando empresa atinge `max_candidates_global` | Linha em `admin_notifications` |
| H4 | Testes E2E (Playwright): fluxo aprovação completo, fluxo pausa de vaga | Testes verdes em CI |

---

## Definition of Done da Fase 2

- [ ] Bloco E: e-mail transacional funcional, 4 templates entregues
- [ ] Bloco F: limites por empresa e por vaga, com UI nos 2 painéis
- [ ] Bloco G: pausar vaga com limpeza + notificação de candidatos
- [ ] Bloco H: auditoria completa, métricas no admin, testes E2E
- [ ] Build production verificado nos 3 workspaces
- [ ] Pipeline frontend obrigatório aplicado em qualquer arquivo `.tsx` modificado
- [ ] Migrations testadas em DEV
- [ ] ADRs registrados pras decisões grandes (escolha de SMTP, modelo de limites)
- [ ] Retrospectiva escrita ao fechar a fase

---

## Riscos identificados

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Limpar candidaturas ao pausar = perda de dado real | Alta (regra do PO) | Alto | Auditar cada delete em `audit.application_deletions` antes de remover |
| E-mail transacional falha silenciosamente | Média | Alto | Health check + retry queue básica + log estruturado |
| Race condition em controle de limite (2 candidaturas simultâneas no último slot) | Média | Médio | UNIQUE INDEX condicional + transaction |
| UX confusa de limites no painel empresa | Média | Médio | Wireframe rápido + revisão UI/UX antes do desenvolvimento |

---

## Out of scope

- ❌ Pagamento por vaga ou plano premium
- ❌ Exportação de candidaturas pra CSV/Excel
- ❌ Importar vagas via planilha
- ❌ Integração com APIs externas (Catho, Indeed, etc.)
- ❌ Painel de analytics avançado (Hotjar, Mixpanel)

Itens acima ficam pra fases posteriores.

---

## Status semanal

*A ser preenchido quando a fase abrir formalmente.*

---

## Retrospectiva (preencher ao fechar a fase)

*A ser preenchida ao fechar.*
