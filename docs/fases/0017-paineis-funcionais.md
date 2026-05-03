# Fase 1.7 — Painéis Funcionais (Empresa + Candidato)

**Status:** planejada (não iniciada)
**Aberta em:** 2026-05-03
**Pré-requisito:** Sprint Bugfix Aprovação fechado e Bloco 3 da Fase 1.5 concluído (Potenciais Empresas)
**Estimativa:** 3-5 dias
**Papéis principais:** Backend Sênior · Frontend Platform Sênior · DBA · QA

---

## Contexto

Durante a Etapa A do refator de mocks (2026-05-03), foi confirmado que o **Painel da Empresa** consome dados estáticos (`mockCompanyJobs`, `mockCandidates`) e **não persiste** alterações no Supabase. Empresa cria vaga via formulário → salva em `useState` → desaparece no F5.

Sintoma: PO removeu mocks, painel agora mostra empty states corretos. Mas qualquer ação real (cadastrar vaga, candidatura, mudar status) não funciona ponta a ponta.

Causa raiz: backend não tem endpoints autenticados por empresa (`/v1/company/*`) pra CRUD de vagas/candidaturas.

Esta fase **é pré-requisito de produção** — sem ela, o produto não é operável.

---

## Decisões já tomadas (PO 2026-05-03)

- Etapa A: zerar mocks AGORA pra ver estado real
- Etapa B (esta fase): refator pra dados reais via Supabase + endpoints autenticados
- Vagas só ficam visíveis ao público após **empresa aprovada** + **vaga aprovada** (status `ativo`). Antes disso ficam `pendente`.

---

## Objetivos da Fase

### Objetivo primário
Tornar o **Painel da Empresa** 100% funcional com dados reais persistidos no Supabase. Empresa loga, cria vaga, vê candidaturas reais, gerencia tudo sem perda de dados.

### Objetivo secundário
Garantir que a **plataforma do candidato** (`/plataforma`) também esteja consumindo dados reais (já está, validar).

### Objetivo terciário
Confirmar que **vagas só aparecem no site/plataforma após aprovação** do admin (regra do produto).

---

## Backlog detalhado

### Bloco A — Backend endpoints autenticados por empresa

| ID | Tarefa | DoD |
|---|---|---|
| A1 | `GET /v1/company/jobs` — lista vagas da empresa logada (filtro por `app_metadata.company_id`) com paginação | Retorna `{ jobs: [], total: N }` |
| A2 | `GET /v1/company/jobs/:id` — detalhe de uma vaga, valida ownership | 404 se não pertence à empresa |
| A3 | `POST /v1/company/jobs` — cria vaga com `company_id = app_metadata.company_id`, status default `pendente`, valida cidade/bairro ativos | Vaga criada como pendente |
| A4 | `PATCH /v1/company/jobs/:id` — atualiza vaga, mantém ownership, não permite alterar `company_id` | OK |
| A5 | `DELETE /v1/company/jobs/:id` — soft delete (status `encerrado`), não remove fisicamente | OK |
| A6 | `GET /v1/company/applications` — lista candidaturas das vagas da empresa, com filtros por job_id, status | Retorna candidatura + dados anonimizados do candidato |
| A7 | `GET /v1/company/applications/:id` — detalhe de candidatura, valida ownership via job.company_id | OK |
| A8 | `PATCH /v1/company/applications/:id/status` — empresa muda status (em_analise, pre_entrevista, entrevista, aprovado, reprovado, contratado) | Histórico em `status_history` |
| A9 | `POST /v1/company/applications/:id/request-contact` — empresa solicita contato com candidato (cria registro em `candidate_requests`) | Notifica candidato |
| A10 | Middleware `requireCompany()` que valida `app_metadata.role === 'empresa'` + `app_metadata.company_id` presente | Rotas protegidas corretamente |

### Bloco B — Validação geográfica + sector na criação de vaga

| ID | Tarefa | DoD |
|---|---|---|
| B1 | `POST /v1/company/jobs` valida `setor` está em `setores` ativos | Rejeita 400 com erro claro |
| B2 | Valida cidade da vaga está em `cidades` ativas + estado ativo | Rejeita 400 |
| B3 | Bairro da vaga: aceita texto livre OU bairro cadastrado em `bairros` daquela cidade | Sem bloqueio |
| B4 | Vaga criada com `status='pendente'`. Só vira `ativo` quando admin aprova a empresa **OU** se empresa já está `ativo` no momento da criação, vaga já vira `ativo` | Status correto |

### Bloco C — Frontend Painel da Empresa (refator)

| ID | Tarefa | DoD |
|---|---|---|
| C1 | `CompanyJobsTab.tsx` — substituir `mockCompanyJobs` por `fetch('/v1/company/jobs')` com loading + error states | Lista carrega real |
| C2 | `JobFormModal.tsx` — submit chama `POST /v1/company/jobs` ou `PATCH /v1/company/jobs/:id` | Persiste no banco |
| C3 | Pausar/Encerrar vaga via `PATCH /v1/company/jobs/:id` (status='pausado'\|'encerrado') | Persiste |
| C4 | `CandidatesTab.tsx` — substituir `mockCandidates` por `fetch('/v1/company/applications')` | Lista carrega real |
| C5 | `CandidateDetail.tsx` — botões "Solicitar contato" / "Mudar status" chamam endpoints reais | OK |
| C6 | `EmpresaPage.tsx` — banner "X novos candidatos" lê de count real | OK |
| C7 | Empty states profissionais quando empresa não tem vagas/candidatos ainda | UX clara |

### Bloco D — Plataforma do Candidato (validação)

| ID | Tarefa | DoD |
|---|---|---|
| D1 | Auditar `/plataforma/page.tsx` — confirmar que TODA query é Supabase real | Sem mocks restantes |
| D2 | `/plataforma/components/CandidaturasPage.tsx` — confirmar listagem real de applications | OK |
| D3 | `/plataforma/components/NotificacoesPage.tsx` — endpoint real ou empty state honesto | OK |

### Bloco E — Site público (validação)

| ID | Tarefa | DoD |
|---|---|---|
| E1 | `/vagas` mostra apenas vagas com status='ativo' (após aprovação) | Filtro confirmado |
| E2 | Empty state quando 0 vagas ativas: "Nenhuma vaga publicada no momento. Acompanhe nossas redes pra novidades." | UX honesta |
| E3 | Stats da home: substituir "—" por queries reais (count candidates, count companies ativas, count jobs com status 'contratado') ou ocultar bloco se vazio | Dados reais |

### Bloco F — QA + testes E2E

| ID | Tarefa | DoD |
|---|---|---|
| F1 | Cenário: empresa parcial cadastra vaga → vaga fica pendente → admin aprova empresa → todas vagas pendentes viram ativas → vaga aparece no /vagas público | Passa E2E |
| F2 | Cenário: candidato se candidata → aparece no painel da empresa → empresa muda status → candidato vê atualização em /plataforma/candidaturas | Passa E2E |
| F3 | Testes unit: middleware requireCompany, validação de ownership em todos os endpoints | Cobertura > 80% |

---

## Definition of Done da Fase

- [ ] Todos os endpoints `/v1/company/*` criados, autenticados e validados
- [ ] Painel da Empresa 100% conectado a dados reais — F5 preserva tudo
- [ ] Vagas seguem fluxo correto: pendente → ativo (após aprovação)
- [ ] Empty states profissionais em todos os pontos
- [ ] Build production OK nos 3 workspaces
- [ ] Pipeline frontend obrigatório aplicado em todos arquivos `.tsx` modificados
- [ ] Testes E2E principais passam
- [ ] Retrospectiva escrita ao fechar

---

## Out of scope desta fase

- ❌ Pause de vaga com limpeza de candidaturas (Fase 2 Bloco G)
- ❌ Limites de candidaturas por vaga (Fase 2 Bloco F)
- ❌ Multi-unidades por empresa (Fase 2 Bloco H)
- ❌ Painel de relatórios avançado
- ❌ Edição de status de candidatura por candidato

---

## Riscos identificados

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Quebra de UX existente ao trocar mocks por queries assíncronas | Alta | Médio | Loading states + error states em todas as transições |
| Empresas existentes (sem company_id no JWT) ficam sem acesso | Média | Alto | Validar todas empresas têm app_metadata corretamente — script de auditoria |
| Performance de listagem (N+1 queries) | Média | Médio | JOIN otimizado + índices |
| RLS policies não cobrem novos endpoints | Baixa | Crítico | Cada endpoint passa por code review de Security Engineer |

---

## Status semanal

*A ser preenchido quando a fase abrir formalmente.*

---

## Retrospectiva

*A ser preenchida ao fechar.*
