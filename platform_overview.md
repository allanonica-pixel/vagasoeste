# VagasOeste — Documentação Técnica e Estrutural da Plataforma

> Versão: 3.7 | Data: Abril 2026  
> Documento de referência técnica para desenvolvimento, manutenção e evolução do ecossistema VagasOeste.

---

## 1. Visão Geral

**VagasOeste** é um ecossistema completo de recrutamento e seleção com quatro frentes distintas:

| Frente | Público | Acesso |
|--------|---------|--------|
| Site Público | Qualquer visitante | Aberto |
| Plataforma do Candidato | Candidatos cadastrados | Login com email/senha |
| Plataforma da Empresa | Empresas parceiras | Acesso concedido pela VagasOeste |
| Painel Administrativo | Equipe VagasOeste | Login restrito |

### Diferenciais do Modelo de Negócio

- **Empresa anônima para o público:** O candidato vê o bairro e a função, mas nunca o nome da empresa.
- **Dados do candidato protegidos:** A empresa parceira nunca acessa nome, telefone ou email do candidato diretamente. Todo contato é intermediado pela equipe VagasOeste.
- **Cadastro de empresa controlado:** Empresas **nunca se cadastram sozinhas**. O cadastro é feito exclusivamente pela equipe VagasOeste, que envia as credenciais de acesso.
- **Troca de senha obrigatória:** No primeiro acesso, a empresa é obrigada a trocar a senha provisória antes de acessar o painel.
- **Monetização:** AdSense nas páginas públicas + links de afiliados + planos para empresas anunciantes.

---

## 2. Princípios de Desenvolvimento

### Mobile-First & Progressive Enhancement

O sistema VagasOeste é desenvolvido com abordagem **Mobile-First**, priorizando a experiência em dispositivos móveis, onde a maior parte do tráfego de candidatos ocorre.

**Fluxo de escala:** Mobile → Tablet → Desktop (nunca o inverso)

| Princípio | Implementação |
|-----------|--------------|
| Mobile-First | Estilos base para mobile, breakpoints para telas maiores |
| Touch-First UX | Botões com área de toque mínima de 44px, gestos naturais |
| Core Web Vitals | Imagens otimizadas, lazy loading, código dividido por rota |
| Conversion-Oriented UX | Fluxo de candidatura em poucos cliques, sem fricção |
| Progressive Enhancement | Funcionalidades básicas em mobile, ricas em desktop |
| Fluid Grid Layout | CSS Grid + Flexbox com breakpoints bem definidos |
| Adaptive Navigation | Menu hambúrguer mobile, nav horizontal desktop |

**Breakpoints padrão:**
- `sm`: 640px (tablet pequeno)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (desktop largo)

---

## 3. Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Estilização | Tailwind CSS v3 (Mobile-First) |
| Roteamento | React Router DOM v6 |
| Ícones | Remix Icon (CDN) + Font Awesome (CDN) |
| Fontes | Google Fonts — **Inter** (padrão global) |
| PDF | window.print() com HTML/CSS customizado (sem dependência externa) |
| SEO | Schema.org markup (Article, Blog, JobPosting) + meta tags |
| Backend (futuro) | Supabase (Auth + Database + Edge Functions) |
| Notificações (futuro) | Resend (email) + Evolution API (WhatsApp) |
| Pagamentos (futuro) | Stripe |

### Estrutura de Pastas

```
src/
├── components/
│   ├── base/          # Componentes base reutilizáveis (botões, inputs, cards)
│   └── feature/       # Componentes compartilhados entre páginas (Navbar, Footer)
├── hooks/             # Custom React hooks
├── mocks/             # Dados mock para desenvolvimento (substituir por Supabase)
│   ├── jobs.ts        # Vagas públicas
│   ├── candidates.ts  # Candidatos (painel empresa)
│   ├── companyJobs.ts # Vagas da empresa
│   ├── adminData.ts   # Dados do painel admin
│   └── blogPosts.ts   # Artigos do blog
├── pages/             # Páginas da aplicação
│   ├── home/          # Página inicial pública
│   ├── vagas/         # Listagem de vagas
│   ├── vaga-detalhe/  # Detalhe de uma vaga específica
│   ├── blog/          # Blog com artigos SEO
│   ├── cadastro/      # Cadastro do candidato (4 etapas)
│   ├── verificar-email/
│   ├── como-funciona/ # Página institucional "Como Funciona"
│   ├── para-empresas/ # Página institucional "Para Empresas"
│   ├── plataforma/    # Dashboard do candidato (área privada)
│   ├── empresa/       # Dashboard da empresa (área privada)
│   ├── admin/         # Painel administrativo VagasOeste
│   ├── login/         # Página de login unificada
│   ├── dicas-de-vaga/
│   ├── crie-seu-curriculo/
│   └── curriculo-avulso/  # Editor completo de currículo sem cadastro (6 etapas)
│       └── components/    # CurriculoEditor, Steps (Dados/Objetivo/Experiencias/Formacao/Habilidades), CurriculoPreview
├── router/
│   ├── config.tsx     # Definição de rotas (EDITAR AQUI para novas rotas)
│   └── index.ts       # Setup do router (NÃO EDITAR)
└── i18n/              # Internacionalização (futuro)
```

---

## 4. Mapa de Rotas

### Site Público

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/` | `home/page.tsx` | Home com hero, vagas em destaque, como funciona, CTA |
| `/vagas` | `vagas/page.tsx` | Listagem de vagas com filtros |
| `/vagas/:id` | `vaga-detalhe/page.tsx` | Detalhe de uma vaga + fluxo de candidatura integrado |
| `/blog` | `blog/page.tsx` | Blog com artigos SEO + Schema.org Blog markup |
| `/blog/:slug` | `blog/post.tsx` | Artigo individual com Schema.org Article markup |
| `/como-funciona` | `como-funciona/page.tsx` | Página institucional com passo a passo, benefícios e FAQ |
| `/para-empresas` | `para-empresas/page.tsx` | Página institucional com planos, depoimentos e FAQ |
| `/dicas-de-vaga` | `dicas-de-vaga/page.tsx` | Dicas práticas + setores em alta em Santarém + integração com Blog |
| `/crie-seu-curriculo` | `crie-seu-curriculo/page.tsx` | Landing page de criação de currículo |
| `/curriculo-avulso` | `curriculo-avulso/page.tsx` | Opção de currículo avulso sem cadastro |

### Autenticação

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/login` | `login/page.tsx` | Login unificado com indicador de redirecionamento por perfil e animação de entrada |
| `/cadastro` | `cadastro/page.tsx` | Cadastro do candidato (4 etapas) |
| `/verificar-email` | `verificar-email/page.tsx` | Aguardo de verificação de email |

### Plataforma do Candidato (área privada)

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/plataforma` | `plataforma/page.tsx` | Dashboard: vagas, candidaturas, currículo, notificações |
| `/plataforma/perfil` | `plataforma/components/CandidatoPerfilPage.tsx` | Editar perfil e cursos |

### Plataforma da Empresa (área privada)

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/empresa/dashboard` | `empresa/page.tsx` | Painel com candidatos, vagas e administrativo |

### Painel Administrativo VagasOeste

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/admin` | `admin/page.tsx` | Painel completo com sidebar e módulos |

---

## 5. Módulos e Funcionalidades

### 5.1 Site Público

**Navbar** (`src/components/feature/Navbar.tsx`)
- Transparente na home, branca ao rolar
- Links: Vagas, Blog, Crie seu Currículo, Como Funciona, Para Empresas
- Botões: **Entrar** (→ `/login`) e **Cadastrar-se** (→ `/cadastro`)
- Menu hambúrguer responsivo para mobile

**Blog** (`/blog` e `/blog/:slug`)
- Listagem com artigos em destaque (featured)
- Filtros por categoria e busca por texto
- Artigo individual com renderização de markdown simples
- **Schema.org Blog markup** na listagem
- **Schema.org Article markup** em cada artigo
- Compartilhamento via WhatsApp e LinkedIn
- Artigos relacionados no rodapé do post
- CTA de cadastro integrado em cada artigo
- 6 artigos iniciais sobre: entrevistas, currículo, mercado de trabalho, LinkedIn, direitos trabalhistas, negociação salarial

**Página "Dicas de Vaga"** (`/dicas-de-vaga`) — reformulada em v3.2
- Hero com imagem de fundo de Santarém + stats do mercado local (vagas, empresas, contratações, candidatos)
- Seção "Setores que mais contratam em Santarém": Agronegócio & Logística, Saúde, Comércio, Construção Civil — com nível de demanda e cargos típicos
- Dicas em destaque (3 cards) com cores diferenciadas por categoria
- Todas as dicas com filtro por categoria (Currículo, Entrevista, Mercado Local, Carreira)
- **Integração com o Blog** — seção "Artigos relacionados" puxando posts reais do `mockBlogPosts`
- CTA final com imagem de fundo e links para /vagas e /crie-seu-curriculo
- Todas as seções com animações `AnimatedSection`

**Página "Como Funciona"** (`/como-funciona`)
- 6 etapas em linha do tempo visual alternada
- Seção de 6 benefícios
- FAQ com accordion interativo
- CTA final

**Página "Para Empresas"** (`/para-empresas`)
- Hero com imagem de fundo
- Estatísticas da plataforma
- 6 etapas do processo para empresas
- 6 recursos do painel empresarial
- 3 depoimentos de empresas parceiras
- 3 planos (Básico, Profissional, Enterprise)
- FAQ com 5 perguntas específicas para empresas

**Detalhe da Vaga** (`/vagas/:id`) — Fluxo de candidatura integrado
- Breadcrumb de navegação
- Informações completas da vaga
- Sidebar com botão "Quero me Candidatar!"
- **Fluxo modal em 4 etapas:**
  1. **Escolha:** Já tenho cadastro (login) ou Criar cadastro grátis
  2. **Login inline:** formulário de login sem sair da página
  3. **Confirmação:** resumo da vaga + checklist do processo
  4. **Sucesso:** confirmação + botões para candidaturas ou mais vagas

**Listagem de Vagas** (`/vagas`) — v3.9 — Ordenação adicionada
- **Dropdown "Ordenar por"** na barra de resultados (ao lado do indicador "Atualizado hoje"):
  - Mais recentes (padrão) — por data de publicação
  - Maior salário — extrai valor numérico do salário
  - Mais candidaturas — valor determinístico por vaga
- Painel de filtros overlay/drawer (v3.8) mantido

**Página de Interesse de Empresa** (`/interesse-empresa`) — nova em v3.9
- Acessível pelos botões "Falar com a equipe" em `/para-empresas`
- Hero com imagem de fundo + overlay verde + breadcrumb
- Formulário em 3 blocos: Dados da Empresa, Responsável pelo Contato, Informações Adicionais
- Chips visuais para quantidade de vagas pretendidas
- Envio via Readdy Forms com tela de sucesso e próximos passos
- Sidebar: contato direto (WhatsApp + email), benefícios, stats, CTA para pré-cadastro completo
- Botões "Falar com a equipe" em `/para-empresas` (hero, planos, CTA) redirecionam para esta página

**Grid de vagas com animações `fade-up` escalonadas**

---

### 5.2 Cadastro do Candidato

**Fluxo em 4 etapas** (`/cadastro`):
1. **Dados Pessoais:** nome, email, telefone, WhatsApp, bairro, cidade, data de nascimento, sexo, PCD
2. **Perfil Profissional:** escolaridade, disponibilidade, pretensão salarial, experiências
3. **Cursos e Certificações:** título, instituição, data início, data fim (múltiplos)
4. **Senha:** criação de senha + confirmação

Após cadastro → redireciona para `/verificar-email`

---

### 5.3 Plataforma do Candidato

**Dashboard** (`/plataforma`) com **4 abas:**

**Aba: Vagas Disponíveis**
- Filtros: busca por texto, setor, contrato, bairro
- Cards de vagas com seleção múltipla
- **Botão "Ver detalhes"** em cada card → abre `VagaDetalheModal`
- **Botão "Candidatar-se"** em cada card → abre `VagaDetalheModal` com candidatura
- Fluxo de candidatura com confirmação e modais

**VagaDetalheModal** (`src/pages/plataforma/components/VagaDetalheModal.tsx`)
- Modal responsivo (bottom sheet em mobile, centralizado em desktop)
- Exibe: título, área, contrato, setor, localização, salário, descrição, requisitos, tags
- Aviso de privacidade (processo anônimo)
- Botão "Quero me Candidatar!" com modal de confirmação
- Estado "Candidatado ✓" após candidatura
- Funciona como bottom sheet em mobile (touch-friendly)

**Aba: Minhas Candidaturas**
- Filtros: status, setor
- Linha do tempo do processo por vaga
- Status: Em análise, Aprovado, Reprovado, Aguardando

**Aba: Meu Currículo**
- Builder em 5 etapas: Dados Pessoais → Objetivo → Experiências → Formação → Habilidades
- Prévia do currículo em tempo real
- **Download em PDF gratuito** via `window.print()` com HTML/CSS customizado
  - Abre nova janela com layout profissional formatado para A4
  - Usuário seleciona "Salvar como PDF" no diálogo de impressão
  - Sem dependência de biblioteca externa

**Aba: Notificações**
- Lista de notificações com badge de não lidas
- Tipos: Mudança de status, Pré-entrevista, Contato, Aprovado, Reprovado, Contratado
- Filtros por tipo e status (lida/não lida)
- Marcar como lida individualmente ou todas de uma vez
- **Preferências de notificação:**
  - Canais: WhatsApp e/ou Email (toggles individuais)
  - Tipos: Mudança de status, Pré-entrevista, Solicitação de contato

**Perfil do Candidato** (`/plataforma/perfil`):
- Aba Dados Pessoais: editar todos os dados cadastrais
- Aba Cursos e Certificações: adicionar/editar/remover cursos

---

### 5.4 Plataforma da Empresa

**Acesso:** Credenciais fornecidas pela VagasOeste. Empresa nunca se cadastra sozinha.

**Primeiro acesso — Troca de senha obrigatória:**
- Modal bloqueante aparece automaticamente ao logar pela primeira vez
- Aviso claro sobre a senha provisória `vagasoeste`
- Medidor de força da senha em tempo real (Fraca / Razoável / Boa / Forte)
- Validação: mínimo 8 caracteres, senhas coincidem, não pode ser igual à provisória

**Dashboard** (`/empresa/dashboard`) com 3 abas:

**Aba: Candidatos**
- Notificação visual de novos candidatos (badge no tab + banner)
- Filtros: Escolaridade, Sexo, Função (vaga)
- Sub-abas: Todos os Candidatos | Favoritados
- **Alteração de status do candidato:** 7 opções (Pendente, Em Análise, Pré-Entrevista, Entrevista, Aprovado, Reprovado, Contratado)
- **Histórico de status:** linha do tempo com data e observação de cada mudança
- **Dados visíveis para a empresa:** bairro, idade, sexo, PCD, escolaridade, disponibilidade, pretensão salarial, experiências, cursos
- **Dados ocultos:** nome completo, email, telefone, WhatsApp

**Ações no perfil do candidato (3 botões):**
1. **Favoritar** → adiciona à lista de Favoritados
2. **Solicitar Pré-entrevista** → dispara para o painel admin
3. **Solicitar Contato** → dispara para o painel admin

**Aba: Minhas Vagas**
- Formulário em 2 passos para publicar nova vaga
- Gerenciar vagas: pausar/reativar, editar, excluir

**Aba: Administrativo (Solicitações)**
- Lista de todas as solicitações enviadas ao admin
- Detalhe com campo de relato da pré-entrevista

---

### 5.5 Painel Administrativo VagasOeste

**Acesso:** `/admin` | Login: `vagas@email.com` / `vagasoeste`

**Sidebar com módulos:**

| Módulo | Funcionalidades |
|--------|----------------|
| Dashboard | KPIs gerais, ações rápidas, últimas notificações |
| Empresas | Lista com filtros, detalhe completo (CNPJ, contato, plano) |
| Candidatos | Lista com filtros, todos os dados visíveis (nome, email, telefone) |
| Vagas | Lista com filtros, estatísticas de candidatos por vaga |
| Relatórios | Gráficos avançados: candidaturas/mês, funil de status, vagas por setor, escolaridade, top empresas, top vagas |
| Notificações | Disparar emails/WhatsApp, histórico, regras de privacidade, aba WhatsApp com Evolution API |
| Configurações | 4 abas: Geral, Notificações, Acessos, **Design** |

**Aba Design (Configurações):**
- **Cores Primárias:** cor principal, escura, clara, texto, accent — color picker + input hex
- **Botões, Barras e Fontes:** cor dos botões, texto dos botões, navbar, footer, fontes
- **Prévia em tempo real** das cores selecionadas
- **Imagens Hero via URL:** Home, Crie seu Currículo, Para Empresas — com prévia ao clicar
- **Botão "Restaurar Design Padrão"** — reverte todas as cores e URLs para os valores originais

**5.5.1 Módulo de Relatórios — Detalhado:**
- **Seletor de período:** 7 dias / 30 dias / 90 dias / Tudo
- **4 KPIs:** Empresas Ativas, Candidatos, Vagas Ativas, Candidaturas
- **Gráfico de barras:** Candidaturas por mês (candidaturas + vagas publicadas)
- **Funil de candidatos:** distribuição por status (Pendente → Contratado)
- **Vagas por setor:** barras horizontais com cores por setor
- **Candidatos por escolaridade:** barras horizontais
- **Top 5 empresas mais ativas:** ranking por candidatos recebidos
- **Top 5 vagas mais procuradas:** ranking por candidatos inscritos
- **Tabela resumo:** empresa, setor, vagas, candidatos, taxa candidatos/vaga, status

**Heroes padronizadas (v3.6):**
Todas as páginas com seção hero agora têm a mesma altura e estilo que `/vagas` (bg-emerald-900, pt-24 pb-12, imagem de fundo com overlay escuro):

| Página | Estilo Hero |
|--------|------------|
| `/vagas` | Referência — bg-emerald-900, pt-24 pb-12, busca integrada |
| `/blog` | Imagem de fundo + overlay + busca integrada |
| `/crie-seu-curriculo` | Imagem de fundo + overlay + card de prévia |
| `/como-funciona` | Imagem de fundo + overlay (convertida de gradiente) |
| `/para-empresas` | Imagem de fundo + overlay + 3 CTAs |

---

## 6. SEO e Schema.org

### Blog (`/blog` e `/blog/:slug`)

```json
// Listagem do Blog
{
  "@type": "Blog",
  "name": "Blog VagasOeste — Dicas de Emprego em Santarém",
  "blogPost": [/* array de BlogPosting */]
}

// Artigo Individual
{
  "@type": "Article",
  "headline": "Título do artigo",
  "datePublished": "2026-04-10",
  "author": { "@type": "Organization", "name": "Equipe VagasOeste" },
  "publisher": { "@type": "Organization", "name": "VagasOeste" },
  "keywords": "tags separadas por vírgula",
  "articleSection": "categoria"
}
```

### Vagas (`/vagas/:id`) — v3.5 — Schema Completo

Cada página de detalhe de vaga emite **3 blocos de Schema.org**:

**1. JobPosting (completo)**
```json
{
  "@type": "JobPosting",
  "@id": "https://vagasoeste.com.br/vagas/{id}",
  "url": "https://vagasoeste.com.br/vagas/{id}",
  "title": "Título da Vaga",
  "description": "Descrição completa",
  "datePosted": "YYYY-MM-DD",
  "validThrough": "YYYY-MM-DD",
  "employmentType": "FULL_TIME | CONTRACTOR | TEMPORARY | OTHER",
  "directApply": true,
  "hiringOrganization": {
    "@type": "Organization",
    "name": "VagasOeste",
    "url": "https://vagasoeste.com.br",
    "logo": { "@type": "ImageObject", "url": "https://vagasoeste.com.br/logo.png" }
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Bairro",
      "addressLocality": "Santarém",
      "addressRegion": "PA",
      "postalCode": "68000-000",
      "addressCountry": "BR"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "BRL",
    "value": { "@type": "QuantitativeValue", "unitText": "MONTH", "description": "R$ X – R$ Y" }
  },
  "skills": "requisitos separados por vírgula",
  "qualifications": "requisitos separados por vírgula",
  "experienceRequirements": "requisitos de experiência",
  "educationRequirements": "requisitos de escolaridade",
  "jobBenefits": "benefícios separados por vírgula",
  "occupationalCategory": "Setor",
  "industry": "Setor",
  "workHours": "Horário de trabalho",
  "numberOfPositions": 1,
  "identifier": { "@type": "PropertyValue", "name": "VagasOeste", "value": "vagasoeste-{id}" }
}
```

**2. BreadcrumbList**
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://vagasoeste.com.br/" },
    { "@type": "ListItem", "position": 2, "name": "Vagas", "item": "https://vagasoeste.com.br/vagas" },
    { "@type": "ListItem", "position": 3, "name": "Título em Bairro", "item": "https://vagasoeste.com.br/vagas/{id}" }
  ]
}
```

**3. FAQPage (5 perguntas dinâmicas)**
- Requisitos obrigatórios da vaga
- Benefícios oferecidos
- Horário de trabalho
- Como se candidatar
- Número de vagas disponíveis

**Meta tags dinâmicas por vaga:**
- `<title>`: `{Cargo} em {Bairro}, {Cidade}/PA — {Contrato} | VagasOeste`
- `<meta name="description">`: inclui cargo, bairro, contrato, salário, 2 benefícios
- `<link rel="canonical">`: URL absoluta da vaga
- `<meta property="og:title">` e `<meta property="og:description">`

---

## 7. Modelo de Dados (Mock → Supabase)

### Candidatos (`src/mocks/candidates.ts`)

```typescript
interface Candidate {
  id: string;
  jobTitle: string;
  jobId: string;
  neighborhood: string;      // Visível para empresa
  city: string;
  age: number;               // Visível para empresa
  gender: string;            // M | F | NB | NI — Visível para empresa
  isPCD: boolean;            // Visível para empresa
  educationLevel: string;    // Visível para empresa
  availability: string;      // Visível para empresa
  salaryExpectation: string; // Visível para empresa
  experiences: string;       // Visível para empresa
  courses: CandidateCourse[];// Visível para empresa
  appliedAt: string;
  status: CandidateStatus;   // pendente | em_analise | pre_entrevista | entrevista | aprovado | reprovado | contratado
  statusHistory: StatusHistoryEntry[]; // Histórico com data e nota
  isFavorited: boolean;
  requests: CandidateRequest[];
}
```

### Vagas da Empresa (`src/mocks/companyJobs.ts`)

```typescript
interface CompanyJob {
  id: string;
  title: string;
  sector: string;
  area: string;
  contractType: string;
  workMode: string;
  neighborhood: string;
  city: string;
  state: string;
  salaryRange: string;
  description: string;
  requirements: string;
  benefits: string;
  educationLevel: string;
  experienceYears: string;
  vacancies: number;
  isActive: boolean;
  createdAt: string;
  applicantsCount: number;
}
```

### Blog Posts (`src/mocks/blogPosts.ts`)

```typescript
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;       // Markdown simples (##, ###, -, 1.)
  category: string;
  author: string;
  authorRole: string;
  authorImage: string;
  coverImage: string;
  publishedAt: string;
  readTime: number;      // minutos
  tags: string[];
  featured: boolean;     // Aparece na seção de destaque
}
```

### Dados Admin (`src/mocks/adminData.ts`)
- `mockAdminCompanies` — empresas cadastradas
- `mockAdminCandidates` — candidatos com dados completos (nome, email, telefone)
- `mockAdminJobs` — todas as vagas
- `mockAdminNotifications` — histórico de notificações

---

## 8. Fluxos Principais

### Fluxo do Candidato
```
Visita site público
  → Lê artigo no Blog (/blog/:slug)
  → Vê vaga interessante (/vagas/:id)
  → Clica "Quero me Candidatar!"
  → Modal: escolhe entre Login ou Cadastro
  → Se login: autentica inline no modal
  → Se cadastro: vai para /cadastro (4 etapas)
  → Confirma candidatura no modal
  → Acessa /plataforma → aba "Vagas Disponíveis"
  → Clica "Ver detalhes" em qualquer vaga → VagaDetalheModal
  → Clica "Candidatar-se" → confirma candidatura
  → Acompanha na aba "Minhas Candidaturas"
  → Recebe notificação por email/WhatsApp quando acionado
  → Acompanha na aba "Notificações" com preferências configuráveis
  → Cria currículo no builder → baixa PDF grátis
```

### Fluxo da Empresa
```
VagasOeste cadastra empresa no /admin
  → Envia credenciais por email (senha provisória: vagasoeste)
  → Empresa acessa /login → /empresa/dashboard
  → Modal de troca de senha obrigatória aparece
  → Empresa cria nova senha pessoal
  → Acessa o painel completo
  → Publica vagas (aba "Minhas Vagas")
  → Candidatos se inscrevem
  → Empresa vê candidatos anonimizados (aba "Candidatos")
  → Altera status dos candidatos com histórico
  → Favorita e solicita ações (contato / pré-entrevista)
  → VagasOeste recebe solicitação no /admin
  → VagasOeste executa e atualiza status
  → Empresa monitora na aba "Administrativo"
```

### Fluxo Administrativo
```
Admin acessa /admin (vagas@email.com / vagasoeste)
  → Gerencia empresas (cadastro, ativação)
  → Gerencia vagas (publicação, pausa)
  → Visualiza todos os candidatos com dados completos
  → Recebe solicitações das empresas
  → Executa ações e registra relatos
  → Dispara notificações para candidatos (email + WhatsApp)
  → Gera relatórios com gráficos e rankings
```

---

## 9. Credenciais de Demonstração

| Perfil | Email | Senha | Destino |
|--------|-------|-------|---------|
| Candidato | candidato@email.com | vagasoeste | /plataforma |
| Empresa | empresa@email.com | vagasoeste | /empresa/dashboard |
| Administrador | vagas@email.com | vagasoeste | /admin |

---

## 10. Regras de Negócio Críticas

1. **Empresa nunca se cadastra sozinha** — sempre via equipe VagasOeste no `/admin`
2. **Troca de senha obrigatória no primeiro acesso** — modal bloqueante com validação
3. **Dados pessoais do candidato são invisíveis para a empresa** — nome, email, telefone, WhatsApp
4. **Empresa anônima para o público** — candidatos não sabem qual empresa está anunciando
5. **Todo contato é intermediado** — empresa solicita, VagasOeste executa
6. **Currículo PDF gratuito** — gerado via window.print() sem custo adicional
7. **Candidatura anônima** — empresa vê perfil profissional, não identidade
8. **Histórico de status imutável** — cada mudança de status é registrada com data e nota
9. **Notificações com privacidade** — empresa não recebe dados do candidato; candidato não recebe nome da empresa
10. **Blog SEO-first** — todos os artigos têm Schema.org Article markup e são otimizados para busca orgânica

---

## 11. Próximas Integrações (Roadmap)

### Fase 1 — Supabase (Banco de Dados + Auth) — PRÓXIMA
- Conectar Supabase ao projeto (botão "Connect Supabase" no painel Readdy)
- Executar `supabase-schema.sql` (8 tabelas: companies, jobs, candidates, candidate_courses, applications, candidate_requests, blog_posts, neighborhoods)
- Substituir todos os mocks por queries reais
- Implementar RLS (Row Level Security) por perfil
- Implementar Supabase Auth no fluxo de login (/login) com redirecionamento por perfil (candidato → /plataforma, empresa → /empresa/dashboard, admin → /admin)

### Fase 2 — Notificações Automáticas
- **Resend** para emails transacionais — Edge Function `send-notification-email` já criada em `supabase/functions/send-notification-email/index.ts`, aguarda `RESEND_API_KEY` nos secrets
- Hook `useEmailNotification.ts` já integrado nos modais de aprovação/rejeição — basta trocar `simulateSend` por `supabase.functions.invoke` após conexão
- **Evolution API** para WhatsApp — Edge Function `send-whatsapp-notification` criada em `supabase/functions/send-whatsapp-notification/index.ts`
  - Suporta 8 tipos de mensagem: `new_candidate`, `pre_interview`, `contact_request`, `company_approved`, `company_rejected`, `job_approved`, `job_rejected`, `status_update`
  - Modo preview automático quando secrets não configurados
  - Secrets necessários: `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE`
- Hook `useWhatsAppNotification.ts` integrado no AdminNotifications — modo simulado até Supabase conectar
- Painel WhatsApp no AdminNotifications: aba dedicada com stats (enviados/pendentes/falharam), guia de configuração, prévia de mensagens, histórico
- Triggers automáticos: nova candidatura, pré-entrevista, contato, mudança de status

### Fase 3 — Pagamentos
- **Stripe** para planos de empresas anunciantes

### Fase 4 — SEO Programático Avançado (Astro)
- Migrar site público para Astro (ver `astro-migration-guide.md`)
- Páginas dinâmicas por bairro + cargo (`/vagas/[bairro]/[cargo]`)
- Sitemap dinâmico automático
- Mais artigos no blog com conteúdo local

### Fase 5 — Monetização
- Google AdSense nas páginas públicas
- Links de afiliados (cursos, ferramentas de emprego)

---

## 12. Design System — Tipografia e Cores

### Fonte Global
- **Inter** (Google Fonts) — aplicada em todo o projeto via `tailwind.config.ts` e `index.css`
- Tamanhos padrão: `text-xs` (12px) para metadados, `text-sm` (14px) para corpo, `text-base` (16px) para conteúdo principal, `text-xl`/`text-2xl` para títulos de seção

### Hierarquia de Cores de Texto
| Uso | Classe Tailwind | Descrição |
|-----|----------------|-----------|
| Títulos principais | `text-gray-900` | Máximo contraste |
| Subtítulos / labels | `text-gray-800` | Alto contraste |
| Corpo de texto | `text-gray-700` | Leitura confortável |
| Labels de formulário | `text-gray-700` | Legível em inputs |
| Metadados / datas | `text-gray-600` | Informação secundária |
| Placeholders | `text-gray-400` | Apenas indicativo |

### Peso de Fonte em Cards de Vagas
- Título da vaga: `font-bold`
- Área/função: `font-medium`
- Localização e salário: `font-medium` (destaque de informação importante)
- Descrição: peso normal

### Animações de Entrada (v3.3)
- Componente `AnimatedSection` (`src/components/base/AnimatedSection.tsx`) — reutilizável em todo o projeto
- Usa `IntersectionObserver` — elementos animam apenas quando entram na viewport
- Variantes: `fade-up` (padrão), `fade-in`, `fade-left`, `fade-right`
- Suporte a `delay` em ms para escalonamento de cards
- Aplicado em: cards de vagas (Home + /vagas), seções "Como Funciona", CTAs laterais, página Dicas de Vaga, página Login, **todos os módulos do painel admin** (Dashboard KPIs, alertas de pendentes, ações rápidas, cards de empresas, cards de vagas, cards de candidatos)
- Regra: cards em grid usam delay escalonado de 60–80ms por item (máximo 6 itens por ciclo)

---

## 13. Convenções de Código

- **Componentes:** PascalCase (`CandidateDetail.tsx`)
- **Hooks:** camelCase com prefixo `use` (`useAuth.ts`)
- **Mocks:** camelCase com prefixo `mock` (`mockCandidates`)
- **Interfaces:** PascalCase sem prefixo (`Candidate`, `CompanyJob`)
- **Rotas:** kebab-case (`/vaga-detalhe`, `/curriculo-avulso`)
- **Imports:** usar `@/` para caminhos absolutos a partir de `src/`
- **Máximo por arquivo:** 500 linhas — dividir em componentes menores se necessário
- **Dados mock:** sempre em `src/mocks/` com export nomeado, nunca default export
- **Mobile-First:** estilos base para mobile, breakpoints `sm:`, `md:`, `lg:` para telas maiores

---

## 14. Segurança (Implementar com Supabase)

| Regra | Descrição |
|-------|-----------|
| RLS Candidatos | Candidato só vê seus próprios dados |
| RLS Empresas | Empresa só vê candidatos às suas vagas (sem dados pessoais) |
| RLS Admin | Acesso total via role especial |
| Vagas | Públicas para leitura, escrita apenas para admin/empresa autenticada |
| Candidaturas | Candidato vê as suas; empresa vê as da sua vaga (anonimizadas) |
| API Keys | Nunca no frontend — sempre em Supabase Edge Functions |
| Senhas | Nunca armazenadas em texto puro — usar Supabase Auth (bcrypt) |
