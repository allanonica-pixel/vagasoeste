# Briefing — Projeto VagasOeste

> Cole este conteúdo como **primeira mensagem** ao iniciar uma nova sessão do Claude Code apontando para `C:\Users\allan\openclaude\vagas-oeste`.

---

## Contexto

Você está iniciando uma sessão para o projeto **VagasOeste** em `C:\Users\allan\openclaude\vagas-oeste`. Este é o diretório correto — a sessão anterior estava ancorada por engano em uma worktree do projeto `mercadoai-nextjs`, o que contaminava CLAUDE.md, working directory e namespace de memória.

**Stack**: monorepo npm workspaces — `apps/site` (Astro), `apps/platform` (Vite+React), `services/api` (Hono+Drizzle). **Não é Next.js**, ignore qualquer instrução que sugira o contrário.

**Ambiente**: tudo roda em localhost, sem usuários reais. Banco DEV no Supabase Pro `snwqnoljfbppxnofkkyd`. Não existe produção em uso.

**Idioma**: responda sempre em português do Brasil.

## Estado do git

- Branch `master`, 1 commit ahead de origin
- HEAD = commit de **snapshot de segurança** com mensagem `chore: snapshot de segurança — acúmulo pré-reorganização` (rede de proteção, não é commit "de verdade" — inclui ~102 arquivos e este próprio briefing)
- Último commit limpo antes dele = `b6cca47 chore: migração DEV para Supabase Pro`

Confirme o estado antes de qualquer ação:

```
git log --oneline -3
git status
```

Você deve ver o snapshot como HEAD, `b6cca47` logo abaixo, e working tree limpo.

## Tarefas em ordem de prioridade

### 1. Reorganizar o histórico (faça primeiro)

Desfaça o snapshot e remonte a história em commits temáticos:

```
git reset --soft b6cca47
```

Use `git add <arquivo>` (não `git add -A`) para criar **8 a 12 commits temáticos** seguindo Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`) em português, mensagem de uma linha, sem corpo, **sem trailer Co-Authored-By** (esse é o estilo do repositório).

Sugestão de agrupamento:
- `feat: pré-cadastro empresa com OTP WhatsApp`
- `feat: ativação de empresa via e-mail (token 48h + inviteUserByEmail)`
- `feat: painel admin completo (companies/candidates/jobs/notifications/auditoria)`
- `feat: plataforma do candidato com dados reais do Supabase`
- `feat: CurriculoComposer unificado (modos auth/guest)`
- `feat: recuperação de senha com rate limiting`
- `feat: cadastro candidato em 5 etapas`
- `feat: templates de e-mail Supabase`
- `chore: middleware/auth + status parcial em companies`
- `feat: ajustes de UI (Footer, Navbar, AnimatedSection, etc)`

Não busque perfeição — ~10 commits temáticos é infinitamente melhor que 1 snapshot opaco.

### 2. Migrar memória do projeto

A memória do VagasOeste está arquivada no namespace errado:
- **Errado**: `C:\Users\allan\.claude\projects\C--Users-allan-openclaude-mercadoai-nextjs\memory\MEMORY.md`
- **Correto**: `C:\Users\allan\.claude\projects\C--Users-allan-openclaude-vagas-oeste\memory\MEMORY.md` (criar pasta se não existir)

Mova todos os entries que começam com `VagasOeste —` no MEMORY.md, junto com os arquivos `.md` referenciados (`project_vagasoeste.md`, `cadastro_plataforma.md`, `auth_security.md`, `interesse_empresa_flow.md`, `infra_roadmap.md`, `supabase_vagasoeste.md`, `ui_polish_pipeline.md`, `diretrizes_sessao.md`, `curriculo_composer.md`, `plataforma_candidato.md`). Mantenha no namespace antigo apenas o que for realmente do mercadoai-nextjs.

### 3. Push para origin (após reorganização)

`git push origin master` quando os commits temáticos estiverem prontos.

## Conhecimento técnico que você precisa preservar

### Envio de e-mail no Supabase (descoberto na sessão anterior)
- `supabaseAdmin.auth.admin.generateLink()` **NÃO envia e-mail** — apenas retorna o link
- O único método admin que dispara o SMTP é `inviteUserByEmail()`
- Após `inviteUserByEmail`, defina senha via `updateUserById(userId, { password })` porque invite cria usuário sem senha
- A função `gerarEEnviarLinkAtivacao` em `services/api/src/routes/interesse.ts` foi reescrita com essa lógica

### Fluxo de ativação de empresa
1. `POST /v1/interesse/submit` → grava pré-cadastro + envia invite via Supabase
2. Empresa clica no link → Supabase confirma e-mail → redireciona para `/ativar-empresa?token=XXX`
3. Página estática lê `?token=` e chama `GET /v1/interesse/ativar?token=XXX`
4. Backend cria registro em `companies` com status `'parcial'` + injeta `app_metadata.company_id` no JWT
5. Empresa loga e cadastra vagas; vagas ficam `'pendente'` até admin aprovar

### Painel admin
- `POST /v1/admin/companies/:id/reenviar-ativacao` reenvia e-mail para empresas pendentes sem `ativado_em`
- Botão correspondente em `apps/platform/src/pages/admin/components/AdminCompanies.tsx` com loading state

### Migrations já aplicadas no DEV
- 0014 (activation_token, ativado_em, status `'parcial'`) — APLICADA
- 0015 (supabase_auth_user_id) — APLICADA

## Caso de teste pendente

Antes de qualquer tarefa nova, valide o reenvio de e-mail end-to-end:
1. Abra `http://localhost:3001/vo-painel` → Empresas → **ONICA SISTEMAS** (CNPJ 37.391.101/0001-40, e-mail empresa3@onica.com.br)
2. Clique em **"Reenviar e-mail de ativação"**
3. Confirme se o e-mail chegou em empresa3@onica.com.br
4. Se não chegou, cheque os logs da API procurando `[Supabase inviteUserByEmail]` ou warnings `[gerarLink]`

## Não faça

- Não siga convenções Next.js (este projeto é Astro/Vite/Hono)
- Não faça commits novos antes de desfazer o snapshot com `git reset --soft b6cca47`
- Não toque em arquivos `.env` (gitignored, contêm service_role do Supabase)
- Não use `git add -A` ao remontar os commits — agrupe arquivo a arquivo por tema
- Não inclua trailer `Co-Authored-By` nos commits temáticos (não é o estilo do repo)
- Não confie em qualquer MEMORY.md auto-carregada de namespace errado

## Trabalho em sessão única

Por preferência registrada do PO, todo trabalho neste projeto deve ser feito **dentro da sessão atual** (contexto acumulado). Spawned tasks só quando a segurança for inquestionável e a tarefa 100% isolada.
