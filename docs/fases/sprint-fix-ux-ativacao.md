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

## Status atual (2026-05-03)

| Bug | Status | Commit |
|---|---|---|
| Bug A (copy mostra razão social) | ⏳ pendente | — |
| Bug B (botão → rota restrita) | ✅ resolvido | `1f510ac` |
| Bug C (senha não funciona após ativar) | ✅ resolvido | `30dcb2e` |
| Bug D (2FA forçado no login) | ✅ resolvido | `2dcd962` + `a8d8f2e` |
| Bug E (5 candidatos mockados) | ⏳ depende de limpeza geral |
| Bug F (auto-fill razão social/fantasia) | ⏳ pendente | — |
| Bug G (e-mail invite em inglês) | ✅ resolvido | `5595eb2` |
| Bug H (Redefinir Senha sem confirmação) | ⏳ pendente | — |
| Bug I (sem UI para empresa ativar MFA) | ⏳ pendente | — |

---

### Bug H (P1 — operacional crítico) — Redefinir Senha não tem confirmação

**Sintoma:** No painel da empresa → aba Administrativo → seção "Gestão de Acesso", o botão **"Redefinir senha"** dispara a ação imediatamente quando clicado, sem nenhuma confirmação.

**Esperado:** modal de confirmação com texto claro:
> "Deseja realmente redefinir a senha de acesso da plataforma?
> Um e-mail será enviado pra [empresa@dominio.com.br] com link pra criar nova senha. A senha atual continuará válida até a nova ser definida."
> **Botões:** [Cancelar] [Sim, enviar link]

**Justificativa do PO:** "Por ética operacional é obrigatório abrir uma telinha perguntando antes de operar a ação."

**Arquivo provável:** `apps/platform/src/pages/empresa/dashboard/...` (componente de Gestão de Acesso) ou `EmpresaPage.tsx`

---

### Bug I (P1 — funcionalidade ausente) — Falta UI para empresa ativar/configurar MFA

**Sintoma:** No painel da empresa → aba Administrativo → seção "Gestão de Acesso", aparece o badge "MFA inativo" mas **não há botão pra ativar**. Empresa fica refém de não poder configurar 2FA pelo seu próprio painel.

**Esperado:**
- Botão **"Ativar Autenticador (2FA)"** ao lado do badge "MFA inativo"
- Click abre modal/wizard com QR code (igual o que era forçado no login antes do Bug D fix)
- Após verificação do código, badge muda pra "MFA ativo" + botão "Desativar autenticador"
- Banner persistente no topo do painel sugerindo configurar enquanto MFA inativo

**Justificativa do PO:** "Uma vez que informa que está inativo, é essencial que tenha o recurso pra ativar o MFA Authenticator."

**Arquivo provável:** mesma seção do Bug H. Pode reaproveitar componente existente do login (que tinha QR code + verify) movido pra cá.

---

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

### Bug G (P1 — UX) — E-mail de invite chega em inglês com template default Supabase

**Sintoma:** quando empresa preenche `/interesse-empresa`, o e-mail de ativação chega com:
- Subject: "You have been invited"
- Body em inglês: "You have been invited to create a user on http://localhost:3000. Follow this link to accept the invite:"

**Causa:** o template "Invite user" no Supabase Auth não foi customizado (os 4 customizados são confirm_signup, reset_password, magic_link, change_email). O `auth.admin.inviteUserByEmail()` usa o template default.

**Solução proposta (Tech Lead):** **NÃO** customizar o template do Supabase. Em vez disso, mudar o fluxo de pré-cadastro pra **enviar e-mail transacional próprio** via `services/api/src/lib/email.ts` (mesma infraestrutura da aprovação), com:
- Template HTML em `services/api/src/templates/company-emails.ts` → função `buildCompanyActivationEmail`
- Saudação personalizada com `contact_name`
- Nome da empresa, CNPJ, link de ativação com token de 48h, instruções claras
- Identidade visual `#065f46`, igual aos outros transacionais

**Arquivos afetados:**
- `services/api/src/routes/interesse.ts` (função `gerarEEnviarLinkAtivacao`)
- `services/api/src/templates/company-emails.ts` (adicionar `buildCompanyActivationEmail`)

**Atenção técnica:** `inviteUserByEmail()` continua sendo necessário pra criar o user em `auth.users` com e-mail confirmado, mas o **e-mail real** que chega ao destinatário deve vir do nosso SMTP transacional. Possível abordagem: chamar `supabaseAdmin.auth.admin.generateLink({ type: 'invite' })` (gera link sem enviar e-mail) e enviar e-mail próprio com esse link.

---

### Bug F (P1 — UX/transparência) — Auto-preenchimento confuso entre Razão Social e Nome Fantasia

**Sintoma:** ao cadastrar empresa com CNPJ válido, BrasilAPI retorna razão social oficial (ex.: "ONICA SISTEMAS"). O código faz fallback `data.nome_fantasia || data.razao_social || ''` — se Receita não tem nome fantasia distinto, **copia a razão social pro campo "Nome Fantasia"**, dando impressão de que o usuário digitou esse valor.

**Esperado:** "Nome Fantasia" só auto-preenche se Receita tem nome fantasia próprio. Caso contrário fica vazio com placeholder claro pra forçar decisão consciente do usuário.

**Confirmado em investigação:** o nome "ONICA SISTEMAS" vem **exclusivamente da Receita Federal pública** via [BrasilAPI](https://brasilapi.com.br/api/cnpj/v1/CNPJ). Não há linkagem com banco anterior nem cache local. **Não é vazamento de dados** — é dado público obrigatório (registro oficial RFB).

**Arquivo:** `apps/site/src/pages/interesse-empresa.astro` linha 761

**Fix proposto (1 linha):**
```javascript
// ANTES
setVal('company_name', data.nome_fantasia || data.razao_social || '');
// DEPOIS
setVal('company_name', data.nome_fantasia || '');
```
Adicionar placeholder claro tipo "Como sua empresa é conhecida pelos clientes" e label de ajuda "Pode ser diferente da razão social".

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
