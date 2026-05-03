# Sprint — Fix UX de Ativação de Empresa

**Status:** planejado (não iniciado)
**Aberto em:** 2026-05-03
**Pré-requisito:** Sprint Bugfix Aprovação fechado e validado pelo PO
**Papéis principais:** Backend Sênior · Frontend Site/SEO Sênior · Frontend Platform Sênior · UI/UX

---

## Contexto

Durante teste E2E do [Sprint Bugfix Aprovação](../adr/0002-pausa-fase1-fix-aprovacao-empresa.md), o PO descobriu 5 bugs de UX/segurança que **não fazem parte do bugfix daquele sprint** mas precisam entrar antes do lançamento real.

Esses bugs foram identificados durante o passo a passo do fluxo:
1. Pré-cadastro de empresa pelo site
2. Recebimento de e-mail de ativação
3. Clique no link → ativação no site
4. Tentativa de login na plataforma
5. Recuperação de senha + redefinição
6. Configuração 2FA (forçada)
7. Login no painel da empresa

Detalhes do diagnóstico estão consolidados nos prints da conversa de PO + Tech Lead em 2026-05-03.

---

## Backlog

### Bug B (P0 — segurança) — Botão "Acessar a Plataforma" leva pra rota restrita

**Sintoma:** após ativação no site, o botão "Acessar a Plataforma" redireciona pra `localhost:3001/acesso-restrito` (rota do Painel-admin que **nunca pode ser exposta** publicamente).

**Esperado:** levar pra `localhost:3001/login`.

**Adicional:** URL após ativação contém `?error=access_denied&error_co...` — Supabase Auth retornou erro silencioso. Investigar se está relacionado.

**Arquivo provável:** `apps/site/src/pages/ativar-empresa.astro`

---

### Bug C (P0 — UX bloqueante) — Senha provisória não funciona após ativação

**Sintoma:** após ativar a conta no site, empresa tenta logar na plataforma com a senha provisória que ela definiu no pré-cadastro. Sistema retorna "Email ou senha incorretos".

**Esperado:** empresa loga direto após ativação, sem precisar usar forgot-senha.

**Workaround atual:** PO contornou pela tela de "Esqueceu a senha?" — funcionou, mas força fricção em todo novo cadastro de empresa.

**Hipóteses:**
1. `inviteUserByEmail` cria user sem senha; em seguida `updateUserById({ password })` não estaria sendo executado ou estaria falhando.
2. Senha está sendo gravada com hash diferente em `auth.users` vs o que a empresa digita no pré-cadastro.
3. A função `gerarEEnviarLinkAtivacao` em `services/api/src/routes/interesse.ts` está parcialmente correta mas o `updateUserById` não está sendo chamado depois.

**Arquivo provável:** `services/api/src/routes/interesse.ts` (função `gerarEEnviarLinkAtivacao` + endpoint `/v1/interesse/ativar`)

---

### Bug D (P1 — UX agressiva) — 2FA forçado imediatamente após reset de senha

**Sintoma:** após "Sua senha foi atualizada" → redireciona direto pro QR code do autenticador. Empresa nem entra na plataforma antes.

**Esperado:** permitir entrar com a nova senha. Mostrar banner ou alerta na tela "Configure 2FA — obrigatório antes da próxima sessão". Forçar 2FA em sessão futura, não no momento do reset.

**Arquivo provável:** `apps/platform/src/pages/redefinir-senha/page.tsx` ou middleware de auth que detecta MFA não configurado.

---

### Bug A (P2 — copy) — Mensagem de boas-vindas mostra razão social

**Sintoma:** após ativação, tela diz "Bem-vindo(a) à VagasOeste, ONICA SISTEMAS!" — usa razão social em vez de nome da pessoa.

**Esperado:** "Bem-vindo(a) à VagasOeste, [contact_name]!" — mais humano.

**Arquivo provável:** `apps/site/src/pages/ativar-empresa.astro` (busca `company_name` em vez de `contact_name`)

---

### Bug E (a investigar) — Painel da empresa mostra candidatos em conta nova

**Sintoma:** empresa3 acabou de ser criada do zero (limpeza completa em `auth.users`, `empresa_pre_cadastros`, `companies`). No painel `/empresa/dashboard`, aparecem "3 novos candidatos aguardando análise!" e "5 CANDIDATOS" listados.

**Hipótese mais provável:** dados mock em `apps/platform/src/mocks/adminData.ts` ou similar sobrando na renderização do dashboard da empresa.

**Hipótese alternativa:** filtro por `companyId` faltando em alguma query do dashboard — mostra candidatos de OUTRAS empresas pra empresa3.

**Severidade variável:**
- Se for mock → P3 (limpar antes do lançamento)
- Se for filtro errado → **P0 (vazamento de dados pessoais entre empresas — incidente LGPD)**

**Arquivo a investigar:** `apps/platform/src/pages/empresa/dashboard/...` ou similar

---

## Definition of Done do Sprint

- [ ] Bug B resolvido — botão leva pra `/login`, sem erro residual na URL
- [ ] Bug C resolvido — empresa nova consegue logar com senha provisória direto após ativar (validado em fluxo E2E)
- [ ] Bug D resolvido — 2FA não força no momento do reset; banner indica obrigatoriedade
- [ ] Bug A resolvido — copy usa nome da pessoa
- [ ] Bug E investigado — se mock, removido; se filtro errado, fix com teste de isolamento entre empresas
- [ ] Build production verificado nos 3 workspaces
- [ ] Pipeline frontend obrigatório aplicado (4-5 etapas) em arquivos `.astro` e `.tsx` modificados
- [ ] Teste E2E completo refeito do zero por PO
- [ ] Retrospectiva escrita ao fechar

---

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Bug E ser vazamento de dados (não mock) | Média | **CRÍTICO** (LGPD) | Investigar primeiro, antes de mexer nos outros |
| Fix de Bug C quebrar o fluxo de invite atual | Média | Alto | Teste E2E completo após fix |
| Fix de 2FA introduzir falha de segurança | Baixa | Alto | Banner obrigatório + flag em DB pra forçar config no próximo login |

---

## Status semanal

*A ser preenchido quando o sprint abrir formalmente.*

---

## Retrospectiva

*A ser preenchida ao fechar.*
