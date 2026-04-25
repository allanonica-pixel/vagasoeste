# VagasOeste — Documentação Técnica da Plataforma

> Versão: 4.0 | Data: 2026-04-24
> Stack real em produção (não React monolítico — monorepo com Astro + React Vite + Hono)

---

## 1. Visão Geral do Ecossistema

**VagasOeste** é um ecossistema de recrutamento com três frentes em produção:

| Frente | App | URL | Tech |
|--------|-----|-----|------|
| Site Público | `apps/site` | https://santarem.app | Astro SSG/hybrid |
| Plataforma (candidato/empresa/admin) | `apps/platform` | https://app.santarem.app | React 18 + Vite + TypeScript |
| API | `services/api` | https://api.santarem.app | Hono + Node 22 + Drizzle |
| Banco / Auth | — | jfyeheapyimdlickjozw.supabase.co | Supabase Pro |

### Diferenciais do modelo de negócio

- **Empresa anônima para o público:** candidato vê bairro + função, nunca o nome da empresa
- **Dados do candidato protegidos:** empresa parceira nunca acessa nome, telefone ou email diretamente — tudo intermediado pela VagasOeste
- **Cadastro de empresa controlado:** empresas **nunca se cadastram sozinhas** — credenciais criadas pela VagasOeste via SQL
- **MFA obrigatório para empresa** — TOTP verificado em toda sessão (AAL2)
- **MFA opcional para candidato** — incentivado, porém não bloqueante

---

## 2. Stack Tecnológica

### apps/site (Astro SSG/hybrid)
- **Astro** `output: 'hybrid'` — SSG por padrão, SSR onde necessário
- **Tailwind CSS** — utilitários, Mobile-First
- **React islands** (`client:load`) — componentes interativos hidratados no cliente
- **Remix Icons** (CDN) — iconografia consistente
- **Supabase JS** (apenas leitura pública com anon key) — busca de vagas no build time

### apps/platform (React Vite)
- **React 18 + TypeScript**
- **Vite** como bundler
- **React Router DOM v6** — roteamento client-side + PrivateRoute guard
- **Supabase JS** — Auth, MFA, signIn/signOut
- **QRCode** (npm) — gera QR codes para enroll TOTP
- **Tailwind CSS**

### services/api (Hono)
- **Hono** + Node 22 — leve, tipado, edge-ready
- **Drizzle ORM** — migrations versionadas, SQL próximo do metal
- **Postgres** via Supabase Pooler (porta 6543, SSL obrigatório)
- **Fly.io GRU** — deploy contínuo

---

## 3. Estrutura de Pastas (apps/platform)

```
src/
├── lib/
│   ├── supabase.ts       → createClient (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
│   └── api.ts            → cliente tipado para API Hono (jobs, applications, health)
├── contexts/
│   └── AuthContext.tsx   → UserRole, AuthContext, AuthProvider, useAuth()
│                            signIn → supabase.auth.signInWithPassword
│                            signOut → supabase.auth.signOut
│                            session → supabase.auth.getSession + onAuthStateChange
├── components/
│   └── PrivateRoute.tsx  → guard por role + requireMfa (AAL2 check via mfa.getAuthenticatorAssuranceLevel)
│                            se requireMfa e AAL < aal2 → redireciona para /login
├── router/
│   └── config.tsx        → todas as rotas; candidato sem requireMfa; empresa/admin com requireMfa
├── mocks/
│   ├── candidates.ts     → dados mock para painel empresa (pendente migração para API real)
│   ├── companyJobs.ts    → vagas mock da empresa
│   └── adminData.ts      → dados mock do admin
└── pages/
    ├── login/
    │   └── page.tsx      → multi-step login + MFA enroll/verify + rate limit
    ├── esqueci-senha/
    │   └── page.tsx      → resetPasswordForEmail (seguro, não revela existência)
    ├── redefinir-senha/
    │   └── page.tsx      → PASSWORD_RECOVERY event + sessionReadyRef + updateUser
    ├── cadastro/
    │   └── page.tsx      → 4 etapas + supabase.auth.signUp(user_metadata completo)
    ├── verificar-email/
    ├── plataforma/
    │   ├── page.tsx      → displayName real + signOut + 4 abas
    │   └── components/
    │       ├── CandidatoPerfilPage.tsx  → aba Segurança (senha + 2FA opcional)
    │       ├── VagaDetalheModal.tsx
    │       └── ...outros
    ├── empresa/
    │   ├── page.tsx      → signOut + UserManagementSection
    │   └── components/
    │       ├── AdminTab.tsx         → UserManagementSection + solicitações
    │       ├── CandidatesTab.tsx
    │       └── CompanyJobsTab.tsx
    ├── acesso-restrito/   → login admin
    ├── admin/             → painel admin
    └── ...páginas públicas
```

---

## 4. Sistema de Autenticação

### AuthContext (`contexts/AuthContext.tsx`)

```typescript
type UserRole = 'candidato' | 'empresa' | 'admin';

interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email, password) => Promise<AuthError | null>;
  signOut: () => Promise<void>;
}
```

- Role lida de `app_metadata.role` (admin) → `user_metadata.role` (empresa/candidato)
- `onAuthStateChange` atualiza estado global

### PrivateRoute (`components/PrivateRoute.tsx`)

```typescript
<PrivateRoute allowedRoles={["empresa"]} requireMfa redirectTo="/acesso-restrito">
  <EmpresaPage />
</PrivateRoute>
```

Quando `requireMfa = true`: verifica `mfa.getAuthenticatorAssuranceLevel()` → se `currentLevel < aal2` redireciona para `/login` com `?redirect=<rota-atual>`

### Login multi-step (`pages/login/page.tsx`)

Estados do fluxo:
```
"credentials" → "change-password" → "enroll-mfa" → "verify-mfa"
```

| Step | Quando ativo | O que faz |
|------|-------------|-----------|
| credentials | Sempre primeiro | signInWithPassword; detecta first_access; detecta fatores MFA |
| change-password | `user_metadata.first_access === true` | updateUser({password}) + set first_access=false |
| enroll-mfa | Empresa sem fator TOTP | mfa.enroll() → QRCode.toDataURL(otpauth URI customizada) |
| verify-mfa | Candidato com MFA OU empresa | mfa.challengeAndVerify() → navega para mfaDestination |

**Proteções no login:**
- Rate limit: 5 tentativas → bloqueia por 30s
- Anti-timing: `await new Promise(r => setTimeout(r, 400 + Math.random() * 300))`
- `initialized` ref: evita double-check de sessão no mount
- `useCallback` em `startEnrollment` e `goToMfaStep`: evita stale closures

### Recuperação de senha

```
/esqueci-senha → supabase.auth.resetPasswordForEmail(email, {
  redirectTo: window.location.origin + '/redefinir-senha'
})
→ Supabase envia email com magic link
→ Usuário clica → navegador abre /redefinir-senha com hash na URL
→ onAuthStateChange dispara PASSWORD_RECOVERY
→ sessionReadyRef.current = true (resolve stale closure no setTimeout)
→ Formulário habilitado → updateUser({ password: novaSenha })
→ USER_UPDATED event → navigate('/login')
```

---

## 5. Segurança — MFA (Supabase Auth TOTP)

### Empresa (obrigatório)
```typescript
// Enroll
const { data } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
const uri = `otpauth://totp/VagasOeste%3AEmpresas?secret=${data.totp.secret}&issuer=VagasOeste`;
const qrDataUrl = await QRCode.toDataURL(uri);

// Challenge + Verify
const { data: challenge } = await supabase.auth.mfa.challenge({ factorId });
await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
```

### Candidato (opcional — gerenciado em /plataforma/perfil aba Segurança)
```typescript
// Enroll (mesmo fluxo, URI diferente)
const uri = `otpauth://totp/VagasOeste%3ACandidato?secret=${data.totp.secret}&issuer=VagasOeste`;

// Disable
const { data: challenge } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challenge.id, code });
await supabase.auth.mfa.unenroll({ factorId: mfaFactorId });
```

---

## 6. Site Público (apps/site) — Detalhamento

### Hero da Home
- **Headline:** "As melhores vagas em Santarém e região, em um só lugar"
- **Subtítulo:** "Vagas reais com informações claras sobre função e área de atuação. Acompanhe cada etapa da sua candidatura em tempo real."
- **HeroSearch.tsx:** 3 filtros em linha — Estado | Cidade | Setor (bairro foi removido permanentemente)

### SectorCards.tsx (nova island)
Island React com dois estados principais:

**Abas:**
- "Por Setor" (ativa por padrão): 8 setores
- "Por Função/Cargo": 8 funções

**Setores:** Saúde, Comércio, Construção Civil, Serviços, Logística, Alimentação, Tecnologia, Indústria  
**Funções:** Vendedor(a), Auxiliar Administrativo, Recepcionista, Operador de Caixa, Motorista/Entregador, Auxiliar de Limpeza, Cozinheiro(a), Manutenção/Eletricista

**Cards:** `bg-gray-50` + `border-gray-200` + ícone `color: #065f46` + nome `text-base`

**Modal ao clicar:**
1. Passo 1 — radio buttons de Estado (visual customizado sem `<input type="radio">` visível)
2. Passo 2 — aparece após selecionar estado; botões de Cidade que ao clicar navegam diretamente

```typescript
// URL gerada ao selecionar Cidade
// Por Setor: /vagas?setor=Saúde&estado=Pará&cidade=Santarém
// Por Função: /vagas?funcao=Vendedor(a)&estado=Pará&cidade=Santarém
window.location.href = `/vagas?${params.toString()}`;
```

### JobsFilter.tsx — filtros em /vagas

**Barra principal (sempre visível, 3 colunas):**
- Estado (select com LOCATIONS)
- Cidade (select dependente do estado)
- Setor (select com todos os setores do banco)

**"Mais Filtros" (painel expansível):**
- Função/Cargo (input texto — filtra `j.title` e `j.area`)
- Tipo de Contrato (select)
- Necessário CNH? (checkbox customizado — filtra `j.requirements.toLowerCase().includes('cnh')`)

**Quick pills:** row horizontal de setores para filtro rápido (ligados ao mesmo estado `sector`)

**Breadcrumb de filtro ativo:** aparece na barra verde escura quando Estado, Cidade ou Setor está selecionado

---

## 7. Rotas (apps/platform/router/config.tsx)

```typescript
// Públicas
{ path: "/login",             element: <LoginPage /> }
{ path: "/cadastro",          element: <CadastroPage /> }
{ path: "/verificar-email",   element: <VerificarEmailPage /> }
{ path: "/esqueci-senha",     element: <EsqueciSenhaPage /> }    // NOVO
{ path: "/redefinir-senha",   element: <RedefinirSenhaPage /> }  // NOVO

// Candidato (sem requireMfa — MFA opcional)
{ path: "/plataforma",        element: <PrivateRoute allowedRoles={["candidato"]}><PlataformaPage /></PrivateRoute> }
{ path: "/plataforma/perfil", element: <PrivateRoute allowedRoles={["candidato"]}><CandidatoPerfilPage /></PrivateRoute> }

// Empresa (com requireMfa — MFA obrigatório)
{ path: "/empresa/dashboard", element: <PrivateRoute allowedRoles={["empresa"]} requireMfa><EmpresaPage /></PrivateRoute> }

// Admin (com requireMfa, redirect para /acesso-restrito)
{ path: "/acesso-restrito",   element: <AcessoRestritoPage /> }
{ path: "/vo-painel",         element: <PrivateRoute allowedRoles={["admin"]} redirectTo="/acesso-restrito" requireMfa><AdminPage /></PrivateRoute> }
{ path: "/admin",             element: <NotFound /> }  // decoy
```

---

## 8. Regras de Negócio Críticas

1. **Empresa nunca se cadastra sozinha** — criada via SQL Editor do Supabase com `user_metadata.role="empresa"` e `first_access=true`
2. **MFA obrigatório para empresa** — PrivateRoute verifica AAL2 em cada acesso
3. **MFA opcional para candidato** — se ativado, login exige verificação; se não, acessa diretamente
4. **Primeiro acesso empresa** — `first_access=true` aciona step change-password no login
5. **Dados do candidato protegidos** — empresa nunca vê nome, email, telefone (UI mostra apenas bairro, experiências, cursos)
6. **Empresa anônima** — candidatos nunca sabem qual empresa anuncia a vaga
7. **Todo contato intermediado** — empresa solicita via plataforma, VagasOeste executa
8. **Bairro removido** — filtro por bairro foi eliminado de toda a UI (site + plataforma)
9. **Setor é filtro principal** — movido de "Mais Filtros" para a barra principal do /vagas
10. **Função/Cargo** — novo filtro de texto em "Mais Filtros" que filtra por título e área da vaga

---

## 9. Dados Mock (apps/platform/src/mocks/)

> Pendente migração para API real — usados no painel empresa e admin enquanto endpoints não estão prontos

| Arquivo | Conteúdo |
|---------|---------|
| `candidates.ts` | Candidatos (para painel empresa) — sem nome/email/telefone visíveis |
| `companyJobs.ts` | Vagas da empresa parceira |
| `adminData.ts` | Empresas, candidatos (completos), vagas, notificações para o admin |
| `blogPosts.ts` | Artigos do blog (substituídos por Supabase em produção real) |

---

## 10. Credenciais de Teste (Supabase real)

> Usuários reais configurados no Supabase. Admin criado via SQL.

| Perfil | Email | Observação |
|--------|-------|-----------|
| Admin 1 | allanstm@gmail.com | `app_metadata.role = "admin"` |
| Admin 2 | vagasdeempregostm@gmail.com | `app_metadata.role = "admin"` |
| Empresa | criar via SQL com `user_metadata.role="empresa"` + `first_access=true` | MFA será exigido no primeiro login |
| Candidato | qualquer signup via /cadastro | MFA opcional |

---

## 11. Commits Recentes

| Hash | Data | Descrição |
|------|------|-----------|
| `e6d3d62` | 2026-04-24 | feat(site): abas Por Setor/Por Função com modal, hero copy, filtros Setor+CNH |
| `3d65949` | 2026-04-24 | feat(platform): candidato 2FA opcional, esqueci/redefinir senha |
| `5e2fd9d` | 2026-04-24 | feat(platform): empresa MFA obrigatório, login multi-step, redefinir senha |

---

## 12. Pendências (backlog)

| Item | Prioridade | Observação |
|------|-----------|-----------|
| `POST /v1/empresa/invite-user` | Alta | UI pronta no AdminTab; backend não implementado |
| Fluxo aprovação empresa pelo admin | Alta | UPDATE app_metadata.role = "empresa" via painel admin |
| MFA recovery (codes de emergência) | Média | Hoje: "contate o administrador" — fluxo completo pendente |
| Sentry + Axiom + UptimeRobot | Média | Observabilidade — Fase 4 do roadmap |
| Rate limiting na API Hono | Média | Hoje só no login client-side (5 tentativas) |
| Upload de mídia (foto/vídeo) | Baixa | Endpoint /v1/media/upload-url pendente |
| Testes E2E do fluxo MFA | Baixa | Playwright ou Cypress |
