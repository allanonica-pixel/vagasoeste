# VagasOeste — Plano e Histórico de Desenvolvimento

> Última atualização: 2026-04-24
> Documento de registro histórico das fases e decisões de produto.
> Referência técnica atual: `platform_overview.md` e `sitemap.md`

---

## Stack atual (produção)

| Camada | Tecnologia | URL |
|--------|-----------|-----|
| Site público | Astro SSG/hybrid | https://santarem.app |
| Plataforma | React 18 + Vite + TypeScript | https://app.santarem.app |
| API | Hono + Node 22 + Drizzle | https://api.santarem.app |
| Banco | Supabase Pro (Postgres) | jfyeheapyimdlickjozw.supabase.co |
| Auth + MFA | Supabase Auth (TOTP nativo) | — |
| Deploy | Vercel (site + platform) + Fly.io GRU (api) | — |
| DNS/CDN | Cloudflare Free | santarem.app |

---

## Modelo de negócio

- **Empresa anônima:** candidato vê bairro + função, nunca o nome da empresa
- **Dados do candidato protegidos:** empresa acessa apenas perfil profissional via plataforma
- **Cadastro de empresa controlado:** feito exclusivamente pela VagasOeste via SQL
- **Monetização:** planos para empresas + AdSense nas páginas públicas + links de afiliados

---

## Histórico de fases

### ✅ Fase 1 — Site Público (Site Vitrine)
- Home com hero, vagas em destaque, como funciona, CTA
- Listagem de vagas com filtros
- Páginas institucionais (como-funciona, para-empresas, blog)
- Página de detalhe de vaga com Schema.org completo
- Cadastro e login do candidato (mock inicial)

### ✅ Fase 2 — Plataforma do Candidato
- Dashboard com abas: Vagas, Candidaturas, Currículo, Notificações
- VagaDetalheModal (bottom sheet mobile + modal desktop)
- Builder de currículo 5 etapas com download PDF (window.print)
- Candidatura com confirmação e status

### ✅ Fase 3 — Plataforma da Empresa
- Painel com candidatos anonimizados (sem nome, email, telefone)
- Alteração de status com histórico (7 status)
- Favoritar candidatos
- Solicitar pré-entrevista e contato (intermediado pela VagasOeste)
- Gerenciar vagas (publicar, pausar, reativar)

### ✅ Fase 4 — Painel Administrativo
- Gestão de empresas, candidatos, vagas, candidaturas
- Aprovação de pré-cadastros com email automático
- Relatórios com gráficos (candidaturas/mês, funil, setores, top vagas/empresas)
- Notificações via email e WhatsApp (Evolution API)
- Configurações de design (color picker, imagens hero)

### ✅ Fase 5 — SEO Programático + Blog
- Schema.org completo nas páginas de vaga (JobPosting + BreadcrumbList + FAQPage)
- FAQ visual accordion em cada vaga
- Blog com Schema.org Article em cada post
- 6 artigos sobre mercado de trabalho em Santarém
- Meta tags dinâmicas por vaga

### ✅ Fase 6 — Migração para Monorepo + Supabase Auth Real
- Monorepo npm workspaces (apps/site + apps/platform + services/api)
- apps/site migrado para Astro SSG/hybrid
- apps/platform em React + Vite separado
- services/api em Hono + Drizzle no Fly.io
- **sessionStorage mock eliminado** — Supabase Auth real integrado
- AuthContext + PrivateRoute por role
- Schema DB aplicado no Supabase Pro (RLS default-deny)
- pg_cron + funções SQL atômicas (apply_to_job, etc.)
- Deploy automático via Vercel (Astro + React) + Fly.io (API)
- DNS Cloudflare (3 domínios)

### ✅ Fase 7 — Sistema de Segurança Empresa
- **Login multi-step:** credentials → change-password → enroll-mfa → verify-mfa
- Primeiro acesso detectado via `user_metadata.first_access = true`
- Medidor de força de senha em tempo real
- **MFA TOTP obrigatório** para empresa — QR "VagasOeste: Empresas"
- `PrivateRoute requireMfa` → verifica AAL2 em cada acesso ao painel empresa
- AdminTab: UserManagementSection (badge MFA, reset senha, invite sub-user)
- Header empresa: email real + signOut com hover reveal
- Rate limiting client-side: 5 tentativas → bloqueio 30s
- Anti-timing jitter para login (400+random*300ms)

### ✅ Fase 8 — Sistema de Segurança Candidato + Recuperação de Senha
- **MFA TOTP opcional** para candidato — QR "VagasOeste: Candidato"
- Aba "Segurança" em `/plataforma/perfil`:
  - Reset de senha via email (resetPasswordForEmail)
  - Enroll 2FA (QR → código → confirma)
  - Disable 2FA (código atual → unenroll)
- **`/esqueci-senha`** — segurança: não revela se email existe, rate 429 silencioso
- **`/redefinir-senha`** — `onAuthStateChange(PASSWORD_RECOVERY)` + `sessionReadyRef` (anti-stale-closure) + timeout 6s para "link expirado"
- Header da plataforma candidato: nome real (`user_metadata.full_name ?? email`) + signOut
- Login detecta fatores MFA do candidato e aplica verify-mfa step se necessário

### ✅ Fase 9 — Refactor UX Site Público
- **Hero copy:**
  - Headline: "As melhores vagas em Santarém e região, em um só lugar"
  - Subtítulo: "Vagas reais com informações claras sobre função e área de atuação. Acompanhe cada etapa da sua candidatura em tempo real."
- **HeroSearch:** filtros Estado · Cidade · Setor (bairro removido)
- **Seção "Áreas de Atuação"** refatorada:
  - Island `SectorCards.tsx` com abas "Por Setor" (padrão) e "Por Função/Cargo"
  - Cards padronizados: `bg-gray-50`, ícone `#065f46`, fonte +2px
  - Clique abre modal → seleciona Estado → seleciona Cidade → navega para /vagas com filtros
- **`/vagas` filtros refatorados:**
  - Barra principal: Estado · Cidade · Setor (bairro removido, setor promovido)
  - "Mais Filtros": Função/Cargo (texto) · Tipo Contrato · Necessário CNH? (checkbox)
  - Breadcrumb ativo mostra Estado · Cidade · Setor
- **Footer:** newsletter removida; grid 3 colunas (era 4)

---

## Próximas fases (backlog)

### Fase 10 — API Empresa + Backend Convite
- `POST /v1/empresa/invite-user` — criar sub-usuário para empresa via service_role
- `GET /v1/company/jobs/:id/applications` — painel empresa via API (sem Supabase direto)
- View `company.application_view` com mascaramento progressivo de PII

### Fase 11 — Aprovação de Empresa pelo Admin
- UI no AdminPage para aprovar/rejeitar empresas
- UPDATE `app_metadata.role = "empresa"` via Admin API
- Email automático de aprovação com credenciais

### Fase 12 — Observabilidade
- Sentry Free (erros críticos)
- Axiom Free (logs estruturados da API)
- UptimeRobot (ping no /health)

### Fase 13 — Hardening
- Rate limiting na API Hono (Upstash Redis ou tabela ops.rate_limit)
- Headers de segurança: CSP, HSTS, X-Frame-Options
- Logs com PII hasheado
- Endpoint `DELETE /v1/me` (direito ao esquecimento LGPD)

### Fase 14 — Upload de mídia
- Endpoint `POST /v1/media/upload-url` (URL pré-assinada Supabase Storage)
- Foto no perfil do candidato (temporária 90 dias)
- Vídeo pitch 30s (Cloudflare Stream, temporário 30 dias)

### Fase 15 — SEO Programático
- Páginas `/vagas/[cidade]/[cargo]` para Google (rota já existe no Astro)
- Sitemap dinâmico automático

---

## Decisões técnicas importantes

| Decisão | Motivação |
|---------|-----------|
| Monorepo npm workspaces | Separação clara de responsabilidades, deploys independentes |
| Astro SSG para site público | Performance máxima + SEO; islands React apenas onde necessário |
| React Vite para plataforma | SPA pura para área autenticada — sem SSR desnecessário |
| Hono no Fly.io | API leve, tipada, edge-ready; Fly.io GRU = baixa latência Brasil |
| Supabase Auth (mantido) | MFA TOTP nativo, OAuth, magic link — custo marginal vs reescrever |
| `requireMfa` no PrivateRoute | Verificação de AAL2 a cada render — garante sessão MFA ativa |
| `sessionReadyRef` em redefinir-senha | Evita stale closure no setTimeout sem depender de re-render |
| Bairro removido dos filtros | Foco em Setor como critério primário; bairro confundia usuários |
| QR URI customizado | Label "VagasOeste: Empresas/Candidato" no autenticador melhora UX |
| Cards de setor padronizados (gray + #065f46) | Identidade visual consistente da marca; cores temáticas poluíam |
