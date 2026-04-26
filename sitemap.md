# VagasOeste — Sitemap Completo

> Versão: 5.0 | Última atualização: 2026-04-26
> Todas as rotas existentes na plataforma VagasOeste.
> Stack: apps/site (Astro SSG/hybrid → santarem.app) + apps/platform (React Vite → app.santarem.app)

---

## Site Público (santarem.app)

| URL | Título | Descrição | Render |
|-----|--------|-----------|--------|
| `/` | Home | Hero (headline+subtítulo atualizados), filtros Estado/Cidade/Setor, **abas Por Setor/Por Função** com modal de localização, vagas destaque, como funciona, cursos afiliados, depoimentos, blog, CTA final | SSG |
| `/vagas` | Vagas Disponíveis | Filtros principais Estado·Cidade·Setor + Mais Filtros (Função/Cargo, Tipo Contrato, Necessário CNH?) + ordenação + quick pills de setor | SSR |
| `/vagas/:id` | Detalhe da Vaga | Descrição completa + FAQ accordion (5 perguntas) + Schema.org JobPosting + BreadcrumbList + FAQPage + meta tags dinâmicas | SSR |
| `/blog` | Blog VagasOeste | Artigos SEO — Schema.org Blog markup | SSG |
| `/blog/:slug` | Artigo do Blog | Schema.org Article, compartilhamento, artigos relacionados | SSG |
| `/como-funciona` | Como Funciona | Passo a passo, benefícios, FAQ accordion, CTA | SSG |
| `/para-empresas` | Para Empresas | Processo, recursos, depoimentos, planos, FAQ | SSG |
| `/interesse-empresa` | Falar com a Equipe | Formulário de interesse para empresas + sidebar contato (também existe como rota na plataforma) | SSG |
| `/dicas-de-vaga` | Dicas de Vaga | Hero com stats, setores em alta em Santarém, dicas por categoria, artigos do blog | SSG |
| `/crie-seu-curriculo` | Crie seu Currículo | Landing page — currículo avulso ou com cadastro | SSG |
| `/curriculo-avulso` | Currículo Avulso | Editor completo 6 etapas sem cadastro + download PDF | SSG |
| `/pre-cadastro` | Pré-cadastro | Formulário de pré-cadastro de empresa (3 etapas) | SSG |

---

## Blog — Artigos Disponíveis

| Slug | Título | Categoria |
|------|--------|-----------|
| `como-se-destacar-em-entrevistas-de-emprego` | Como se Destacar em Entrevistas de Emprego em Santarém | Entrevistas |
| `curriculo-perfeito-para-o-mercado-de-santarem` | Como Criar um Currículo Perfeito para o Mercado de Santarém | Currículo |
| `mercado-de-trabalho-em-santarem-2026` | Mercado de Trabalho em Santarém em 2026: Setores em Alta | Mercado de Trabalho |
| `como-usar-o-linkedin-para-encontrar-emprego` | Como Usar o LinkedIn para Encontrar Emprego em Santarém | Dicas Profissionais |
| `direitos-trabalhistas-que-todo-candidato-deve-conhecer` | Direitos Trabalhistas que Todo Candidato Deve Conhecer | Direitos Trabalhistas |
| `como-negociar-salario-com-confianca` | Como Negociar Salário com Confiança | Carreira |

---

## Plataforma (app.santarem.app) — Home Pública

> A home da plataforma (`/`) é visível sem login e replica o conteúdo do site Astro.
> Diferencial: candidato logado pode clicar em vagas e ver detalhes com opção de se candidatar.

| Seção | Componente | Descrição |
|-------|-----------|-----------|
| Hero | `HeroSection.tsx` | Estado/Cidade/Setor + quick tags com ícones. `useNavigate` → `/vagas?setor=X` |
| Stats | `StatsBar.tsx` | 4 números: vagas ativas, candidatos, empresas, contratações 2026 |
| Setores | `SectorSection.tsx` | Abas "Por Setor" / "Por Função", cards com ícone + count |
| Vagas | `JobsSection.tsx` | Busca Supabase `jobs` (status='ativo'); fallback 8 mocks se vazio. Cards → `/vagas/:id` |
| Como funciona | `HowItWorksSection.tsx` | 6 passos, 2 CTAs: candidato e empresa |
| Afiliados | `AffiliateSection.tsx` | 3 cursos (Excel/Udemy, Inglês/Hotmart, Office/Hotmart) |
| Depoimentos | `TestimonialsSection.tsx` | 3 testemunhos com navegação e dots |
| CTA Final | `CTASection.tsx` | Logado → "Ir para o meu painel"; Visitante → "Criar conta grátis" |

---

## Plataforma (app.santarem.app) — Autenticação

| URL | Título | Descrição |
|-----|--------|-----------|
| `/login` | Login | Multi-step: credentials → change-password (first_access) → enroll-mfa → verify-mfa. Rate limit 5 tentativas. "Esqueci minha senha" para candidato e empresa. |
| `/cadastro` | Cadastro do Candidato | **5 etapas**: Dados Pessoais (CNH toggle) → Perfil Profissional (cidade/bairro, escolaridade, disponibilidade, salário) → Experiências Profissionais (com sanitização XSS e detecção de CPF/email/telefone) → Cursos → Senha. supabase.auth.signUp |
| `/verificar-email` | Verificar Email | Aguardo confirmação de email pós-cadastro |
| `/esqueci-senha` | Esqueci Minha Senha | Envia resetPasswordForEmail. Não revela se email existe. Rate 429 tratado silenciosamente |
| `/redefinir-senha` | Redefinir Senha | Escuta PASSWORD_RECOVERY event via onAuthStateChange. sessionReadyRef anti-stale-closure. Timeout 6s para "link expirado" |
| `/interesse-empresa` | Interesse Empresa | Formulário OTP WhatsApp (máquina de estados: idle→send→verify→resumo→submit). Submete para `empresa_pre_cadastros` via Supabase direto |

---

## Plataforma do Candidato (app.santarem.app) — Área Privada

> Protegida por `PrivateRoute allowedRoles={["candidato"]}` — AAL1 suficiente (MFA opcional)

| URL | Título | Descrição |
|-----|--------|-----------|
| `/plataforma` | Dashboard do Candidato | Header com nome real do usuário + signOut. Abas: Vagas Disponíveis, Minhas Candidaturas, Meu Currículo, Notificações |
| `/plataforma/perfil` | Meu Perfil | Abas: Dados Pessoais, Cursos e Certificações, **Segurança** |
| `/vagas/:id` | Detalhe da Vaga | Detalhe de vaga com botão "Candidatar-se" (rota platform) — dados ainda via mockJobs |

### Abas do Dashboard `/plataforma`

| Aba | Funcionalidades |
|-----|----------------|
| Vagas Disponíveis | Filtros por setor/contrato/bairro, cards com modal (VagaDetalheModal), candidatura em lote |
| Minhas Candidaturas | Linha do tempo por vaga, filtros por status/setor |
| Meu Currículo | Builder 5 etapas, prévia em tempo real, download PDF via window.print() |
| Notificações | Lista, filtros, preferências de canal (WhatsApp/Email) |

### Aba Segurança (`/plataforma/perfil`)

| Seção | Funcionalidade |
|-------|---------------|
| Senha | Botão "Redefinir senha" → envia resetPasswordForEmail ao email cadastrado |
| Autenticação de Dois Fatores | Status badge (ativo/inativo); enroll: QR "VagasOeste: Candidato" → digita código → confirma; disable: digita código atual → unenroll |

---

## Plataforma da Empresa (app.santarem.app) — Área Privada

> Protegida por `PrivateRoute allowedRoles={["empresa"]} requireMfa` — exige AAL2 (TOTP verificado)

| URL | Título | Descrição |
|-----|--------|-----------|
| `/empresa/dashboard` | Painel da Empresa | Header com email real + signOut. Abas: Candidatos, Minhas Vagas, Administrativo |

### Fluxo de primeiro acesso (empresa)

| Etapa | Descrição |
|-------|-----------|
| 1. Credenciais | Email + senha provisória |
| 2. Troca de senha | `first_access = true` → medidor de força + validação + `updateUser({password})` → `first_access` → false |
| 3. Enroll MFA | QR code "VagasOeste: Empresas" → Google Authenticator → código de 6 dígitos → enroll confirmado |
| 4. Verify MFA | Digita código → `mfa.challengeAndVerify()` → AAL2 → acessa o painel |

### Abas do Painel `/empresa/dashboard`

| Aba | Funcionalidades |
|-----|----------------|
| Candidatos | Notificação novos candidatos, filtros, sub-abas Todos/Favoritados, alteração de status com histórico, favoritar, solicitar pré-entrevista/contato |
| Minhas Vagas | Publicar nova vaga (2 passos), gerenciar vagas ativas/pausadas |
| Administrativo | UserManagementSection (email + badge MFA + "Redefinir senha" + invite sub-user), solicitações enviadas |

---

## Painel Administrativo (app.santarem.app) — Área Restrita

> Protegido por `PrivateRoute allowedRoles={["admin"]} requireMfa redirectTo="/acesso-restrito"`

| URL | Título | Descrição |
|-----|--------|-----------|
| `/acesso-restrito` | Login Admin | URL não linkada em lugar nenhum do sistema |
| `/vo-painel` | Painel Admin | Gestão completa: empresas, candidatos, vagas, relatórios, notificações, configurações |
| `/admin` | — | Retorna NotFound (decoy para bots) |

### Módulos do `/vo-painel`

| Módulo | Funcionalidades | Fonte de dados |
|--------|----------------|---------------|
| Dashboard | KPIs gerais, ações rápidas, últimas notificações | Mock |
| Empresas | Lista com filtros, **aba "Pré-Cadastros Pendentes"**, aprovação/rejeição (UPDATE status em `empresa_pre_cadastros`) | **Supabase real** |
| Candidatos | Lista com todos os dados (nome, email, telefone visíveis para admin) | Mock |
| Vagas | Lista, aprovação/reprovação individual de vagas pendentes | Mock |
| Relatórios | Gráficos: candidaturas/mês, funil de status, vagas por setor, escolaridade, top empresas/vagas | Mock |
| Notificações | Disparar email/WhatsApp, histórico, painel Evolution API | Mock |
| Configurações | Geral, Notificações, Acessos, Design (color picker + imagens hero + restaurar padrão) | Mock |

---

## URL params suportados

### /vagas (SSR — JobsFilter.tsx)

| Param | Descrição | Exemplo |
|-------|-----------|---------|
| `estado` | Pré-seleciona dropdown Estado | `?estado=Pará` |
| `cidade` | Pré-seleciona dropdown Cidade | `?cidade=Santarém` |
| `setor` | Pré-seleciona dropdown Setor (barra principal) | `?setor=Saúde` |
| `q` | Pré-preenche busca textual | `?q=auxiliar` |
| `funcao` | Pré-preenche campo Função/Cargo em Mais Filtros | `?funcao=Vendedor(a)` |
| `cnh` | Ativa checkbox CNH em Mais Filtros | `?cnh=true` |

> **Bairro removido:** `?bairro=` não é mais suportado na UI (retro-compat silenciosa — parâmetro ignorado)

---

## Componentes de ilha (Astro islands — client:load)

| Componente | Arquivo | Função |
|-----------|---------|--------|
| HeroSearch | `components/islands/HeroSearch.tsx` | Filtros Estado+Cidade+Setor + quick pills na hero da home |
| SectorCards | `components/islands/SectorCards.tsx` | Abas Por Setor/Por Função, cards padronizados, modal Estado→Cidade |
| JobsFilter | `components/islands/JobsFilter.tsx` | Filtro + ordenação + grid de vagas em /vagas |
| HomepageJobs | `components/islands/HomepageJobs.tsx` | Grid de vagas em destaque na home |
| TestimonialsSlider | `components/islands/TestimonialsSlider.tsx` | Carrossel de depoimentos |
| FAQAccordion | `components/islands/FAQAccordion.tsx` | Accordion de FAQ em /como-funciona |
| BlogSearch | `components/islands/BlogSearch.tsx` | Busca e filtro de artigos em /blog |

---

## Schema.org por página

| Página | Schemas emitidos |
|--------|-----------------|
| `/` | `Organization` + `WebSite` (com SearchAction) |
| `/vagas/:id` | `JobPosting` (completo) + `BreadcrumbList` + `FAQPage` (5 perguntas dinâmicas) |
| `/blog` | `Blog` + array de `BlogPosting` |
| `/blog/:slug` | `Article` com author, publisher, keywords, datePublished |
| `/vagas` | `ItemList` de vagas |

---

## Padronização visual (design tokens)

| Elemento | Valor |
|----------|-------|
| Cor primária | `emerald-600` (#059669) |
| Ícones nos cards de setor | `#065f46` (emerald-900 ajustado) |
| Fundo dos cards de setor | `bg-gray-50` com `border-gray-200` |
| Hover dos cards | `border-emerald-300 bg-gray-100` |
| Tamanho do nome no card | `text-base` (16px) — era text-sm |
| Tamanho do subtexto no card | `text-sm` (14px) — era text-xs |
| Animações de entrada | `AnimatedSection` com IntersectionObserver — `fade-up` escalonado |

---

## Notas críticas do projeto

- **Empresa nunca se cadastra sozinha** — feito pela VagasOeste via Supabase SQL Editor
- **MFA obrigatório para empresa** — sem TOTP não acessa o painel (PrivateRoute requireMfa)
- **MFA opcional para candidato** — se ativado, login cobra verificação antes do redirect
- **Bairro removido de toda a UI** — hero, /vagas, filtros. Não aparece mais para usuário
- **Setor promovido** — estava em "Mais Filtros"; agora é filtro principal (barra de 3 colunas)
- **Função/Cargo** — novo filtro em "Mais Filtros" com input texto (filtra title e area)
- **CNH** — novo filtro em "Mais Filtros" (checkbox; busca "cnh" nos requirements)
- **Footer compacto** — newsletter removida; grid 3 colunas (era 4)
- **Pré-cadastros de empresa** — fluxo completo: `/interesse-empresa` (site Astro) OU `/interesse-empresa` (plataforma React) → INSERT em `empresa_pre_cadastros` → Admin aprova/rejeita em `/vo-painel` aba Empresas
- **Home da plataforma alinhada ao site** — mesmas seções e visual; diferencial: vagas levam para `/vagas/:id` com botão candidatar
- **RLS corrigida (migration 0006)** — função `is_admin()` SECURITY DEFINER evita "permission denied for table admin_users" para role anon/authenticated
- **Portas DEV**: API=3000, Platform=3001 (Vite em 3000 conflita com API, sobe em 3001), Site=4321
