# VagasOeste — Plataforma de Emprego com SEO Avançado

## 1. Descrição do Projeto

**VagasOeste** é um ecossistema completo de recrutamento com 3 frentes:

1. **Site Público (SEO + Monetização)** — Páginas otimizadas para Google com vagas por bairro/cidade, AdSense e links de afiliados
2. **Plataforma do Candidato** — Cadastro validado por email/WhatsApp, candidatura anônima às vagas, acompanhamento via WhatsApp e email
3. **Plataforma da Empresa** — Visualização de candidatos com dados profissionais (sem dados pessoais identificáveis), gerenciada pela equipe VagasOeste

**Diferencial:** A empresa que anuncia a vaga é anônima para o público. O candidato vê o bairro e a função, mas não sabe qual empresa é. Isso protege o processo e centraliza o controle na VagasOeste.

**Monetização:** AdSense nas páginas públicas + links de afiliados (cursos, ferramentas de emprego) + planos para empresas anunciantes.

---

## 2. Estrutura de Páginas

### Site Público
- `/` — Home: hero, busca por bairro, vagas em destaque, como funciona, CTA, depoimentos, footer
- `/vagas` — Listagem completa de vagas com filtros (bairro, cargo, tipo de contrato)
- `/vagas/[bairro]/[cargo]` — Página SEO programática por bairro + cargo (ex: /vagas/vila-prudente/auxiliar-administrativo)
- `/como-funciona` — Explicação do processo para candidatos e empresas
- `/blog` — Blog com artigos SEO sobre mercado de trabalho
- `/blog/[slug]` — Artigo individual do blog
- `/afiliados` — Página de links de afiliados (cursos, ferramentas)
- `/para-empresas` — Landing page para empresas anunciarem vagas

### Plataforma do Candidato (área privada)
- `/cadastro` — Formulário de cadastro do candidato
- `/verificar-email` — Tela de aguardo de verificação
- `/plataforma` — Dashboard do candidato: vagas disponíveis para candidatura
- `/plataforma/candidaturas` — Minhas candidaturas e status
- `/plataforma/perfil` — Editar perfil profissional

### Plataforma da Empresa (área privada)
- `/empresa/login` — Login da empresa
- `/empresa/dashboard` — Painel com candidatos às vagas (dados anonimizados)
- `/empresa/vagas` — Gerenciar vagas publicadas

### Admin VagasOeste (área restrita)
- `/admin` — Dashboard administrativo
- `/admin/candidatos` — Ver todos os candidatos com dados completos
- `/admin/empresas` — Gerenciar empresas cadastradas
- `/admin/vagas` — Gerenciar todas as vagas

---

## 3. Funcionalidades Principais

### Site Público
- [x] Hero com busca por bairro/cargo
- [x] Grid de vagas com empresa anônima (mostra bairro + função)
- [x] Filtros: bairro, tipo de contrato (CLT/PJ/Freelance), área
- [x] Páginas SEO programáticas por bairro + cargo
- [x] Blog com artigos otimizados para SEO
- [x] Links de afiliados (cursos, plataformas de emprego)
- [x] Newsletter por email
- [x] Schema.org markup (JobPosting, FAQPage, Article)
- [x] Sitemap dinâmico
- [x] AdSense placeholders estratégicos

### Candidato
- [x] Cadastro com validação por email
- [x] Perfil profissional (experiências, cursos, disponibilidade)
- [x] Visualizar vagas na plataforma
- [x] Candidatar-se a múltiplas vagas
- [x] Fluxo "Vamos lá!" com mensagem de sucesso
- [x] Tela "Agora é com a gente!" explicando o processo
- [x] Notificações por WhatsApp e email sobre status da vaga

### Empresa
- [x] Login seguro
- [x] Ver candidatos às suas vagas (sem nome, sexo, idade, telefone)
- [x] Ver: experiências, cursos, disponibilidade, pretensão salarial
- [x] Solicitar contato via VagasOeste (não diretamente)

### Admin
- [x] Ver todos os dados completos dos candidatos
- [x] Gerenciar empresas e vagas
- [x] Aprovar/reprovar candidaturas
- [x] Enviar notificações WhatsApp/email

---

## 4. Modelo de Dados (Supabase)

### Tabela: candidates
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| email | text | Email (único) |
| phone_whatsapp | text | WhatsApp |
| full_name | text | Nome completo (visível só para admin) |
| birth_date | date | Data de nascimento (visível só para admin) |
| gender | text | Sexo (visível só para admin) |
| neighborhood | text | Bairro onde mora |
| city | text | Cidade |
| education_level | text | Escolaridade |
| courses | jsonb | Cursos e certificações |
| experiences | jsonb | Experiências profissionais |
| availability | text | Disponibilidade (manhã/tarde/noite/integral) |
| salary_expectation | numeric | Pretensão salarial |
| email_verified | boolean | Email verificado |
| created_at | timestamp | Data de cadastro |

### Tabela: jobs
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| title | text | Título da vaga |
| area | text | Área profissional |
| contract_type | text | CLT/PJ/Freelance/Temporário |
| neighborhood | text | Bairro da empresa |
| city | text | Cidade |
| description | text | Descrição da vaga |
| requirements | text | Requisitos |
| salary_range | text | Faixa salarial (opcional) |
| company_id | uuid | FK para companies (oculto no público) |
| is_active | boolean | Vaga ativa |
| created_at | timestamp | Data de publicação |

### Tabela: companies
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| name | text | Nome da empresa |
| email | text | Email de contato |
| phone | text | Telefone |
| plan | text | Plano contratado |
| is_active | boolean | Ativa |

### Tabela: applications
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| candidate_id | uuid | FK candidates |
| job_id | uuid | FK jobs |
| status | text | pendente/em_analise/aprovado/reprovado |
| applied_at | timestamp | Data da candidatura |
| notes | text | Notas internas (admin) |

### Tabela: blog_posts
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| title | text | Título |
| slug | text | URL amigável |
| content | text | Conteúdo HTML |
| meta_description | text | Meta description SEO |
| keywords | text | Keywords SEO |
| published_at | timestamp | Data de publicação |

---

## 5. Integrações

- **Supabase**: Auth, Database, Storage, Edge Functions
- **WhatsApp API (Evolution API / Z-API)**: Notificações automáticas para candidatos
- **Email (Resend)**: Verificação de email e notificações
- **Google AdSense**: Monetização nas páginas públicas
- **Links de Afiliados**: Hotmart, Udemy, Workana, etc.
- **Schema.org**: JobPosting, FAQPage, Article, LocalBusiness

---

## 6. Regras de Segurança (RLS)

- Candidatos: só veem seus próprios dados
- Empresas: só veem candidatos às suas vagas (sem dados pessoais)
- Admin: acesso total via role especial
- Vagas: públicas para leitura, escrita apenas para admin/empresa autenticada
- Candidaturas: candidato vê as suas, empresa vê as da sua vaga (anonimizadas)

---

## 7. Plano de Desenvolvimento

### ✅ Fase 1: Site Público — Home + Listagem de Vagas
- Goal: Criar a vitrine pública com SEO, vagas anônimas, links de afiliados
- Deliverable: Home completa + página de vagas + navbar + footer
- Status: **CONCLUÍDA**

### ✅ Fase 2: Cadastro e Autenticação do Candidato
- Goal: Fluxo completo de cadastro, verificação de email, login
- Deliverable: Páginas de cadastro, verificação, login do candidato
- Status: **CONCLUÍDA** (login demo funcional; Supabase Auth pendente de conexão)

### ✅ Fase 3: Plataforma do Candidato
- Goal: Dashboard do candidato com vagas e fluxo de candidatura
- Deliverable: Dashboard, seleção de vagas, fluxo "Vamos lá!", tela "Agora é com a gente!"
- Status: **CONCLUÍDA**

### ✅ Fase 4: Plataforma da Empresa
- Goal: Área da empresa para ver candidatos anonimizados
- Deliverable: Login empresa, dashboard com candidatos, detalhes profissionais
- Status: **CONCLUÍDA** (troca de senha obrigatória no primeiro acesso implementada)

### ✅ Fase 5: Admin VagasOeste
- Goal: Painel administrativo completo
- Deliverable: Gestão de candidatos, empresas, vagas, candidaturas, relatórios, notificações
- Status: **CONCLUÍDA** — inclui:
  - Validação de pré-cadastros de empresas (aprovar/rejeitar com email automático)
  - Aprovação individual de vagas pendentes
  - Relatórios com gráficos de pré-cadastros por período
  - Animações de entrada (fade-up) nos cards e seções do painel
  - Edge Function de email (Resend) — arquivo criado, aguarda conexão Supabase
  - **Aba Design em Configurações** — personalização visual completa:
    - Cores primárias, botões, barras (navbar/footer), fontes — com color picker + hex input
    - Prévia em tempo real das cores selecionadas
    - Cadastro de imagens hero via URL para: Home, Crie seu Currículo, Para Empresas
    - Botão "Restaurar Design Padrão" que reverte todas as cores e imagens

### ✅ Fase 6: SEO Programático + Blog
- Goal: Páginas dinâmicas por bairro/cargo + blog
- Deliverable: Rotas SEO, Schema.org, sitemap, blog
- Status: **CONCLUÍDA** — inclui:
  - **Schema.org JobPosting completo** nas páginas de detalhe de vaga:
    - `@id`, `url`, `directApply: true`, `experienceRequirements`, `educationRequirements`, `industry`
    - `hiringOrganization` com `ImageObject` para logo
    - `baseSalary` com `MonetaryAmount` e `QuantitativeValue`
    - `identifier` com valor único `vagasoeste-{id}`
  - **Schema.org BreadcrumbList** em cada página de vaga (Início → Vagas → Título da Vaga)
  - **Schema.org FAQPage** em cada página de vaga com 5 perguntas dinâmicas
  - **FAQ Visual** na página de detalhe de vaga — accordion interativo com as mesmas 5 perguntas do FAQPage Schema.org (reforço SEO on-page)
  - Meta tags dinâmicas: `<title>`, `<meta description>`, `<link rel="canonical">`, `og:title`, `og:description`
  - **Heroes padronizadas** — todas as páginas com hero agora têm a mesma altura que `/vagas` (pt-24 pb-12 com imagem de fundo + overlay escuro):
    - `/blog` — hero com imagem de fundo + busca integrada
    - `/crie-seu-curriculo` — hero mantida com imagem, padding ajustado
    - `/como-funciona` — hero convertida de gradiente para imagem de fundo
    - `/para-empresas` — hero mantida com imagem, padding ajustado
  - Vagas por bairro (/vagas?bairro=X) com seção SEO e Schema.org ItemList
  - Blog com Schema.org Article markup
  - Página "Dicas de Vaga" com conteúdo real do mercado de Santarém
  - Pré-cadastro de empresas (/pre-cadastro) com fluxo completo em 3 etapas

### ✅ Fase 6 (complemento): Animações no Painel Admin — Candidatos
- Adicionadas animações `fade-up` escalonadas no módulo AdminCandidates
- Padrão consistente com AdminCompanies e AdminJobs (ciclo de 6, delay de 60ms por item)
- Todos os 4 módulos do admin agora têm animações de entrada: Dashboard, Empresas, Vagas, Candidatos

### ✅ Fase 6 (complemento v3.7): Editor de Currículo Avulso + Hero Compacta
- **Editor de Currículo Avulso** (`/curriculo-avulso`) — editor completo sem necessidade de cadastro:
  - Tela de escolha: Currículo Avulso (sem cadastro) ou Cadastro + Currículo (recomendado)
  - Editor em 6 etapas: Dados Pessoais → Objetivo → Experiências → Formação → Habilidades/Idiomas/Cursos → Prévia
  - Sidebar com progresso visual e navegação livre entre etapas
  - Etapa Dados: nome, email, telefone (máscara BR), cidade, estado, LinkedIn
  - Etapa Objetivo: textarea com sugestões de texto pré-definidas
  - Etapa Experiências: CRUD completo com cargo, empresa, período, descrição
  - Etapa Formação: CRUD completo com curso, instituição, nível, período
  - Etapa Habilidades: seleção de 25 habilidades sugeridas + personalizada; idiomas com nível; cursos complementares
  - Prévia em tempo real com layout profissional formatado
  - **Download PDF gratuito** via `window.open()` + `window.print()` com CSS profissional
  - CTA de cadastro ao final da prévia
- **Hero da Home reduzida** — altura reduzida para ~30% da original:
  - Padding reduzido: `pt-20 pb-6` (era `pt-24 pb-12`)
  - Título menor: `text-2xl md:text-3xl` (era `text-3xl md:text-5xl`)
  - Subtítulo menor: `text-sm` (era `text-base md:text-lg`)
  - Seção de stats removida (4 números: vagas, candidatos, empresas, contratações)
  - Tags e filtros com espaçamento reduzido
  - Resultado: hero muito mais compacta, conteúdo da página aparece mais cedo

### ✅ Fase 6 (complemento v3.8): Painel de Filtros Aprimorado em /vagas
- **Painel de filtros como overlay/drawer** — ao clicar em "Filtros" na barra de busca, abre um painel modal (bottom sheet em mobile, modal centralizado em desktop)
- **Filtros por chips visuais** — Setor, Área Profissional e Tipo de Contrato exibidos como chips clicáveis (não selects); Bairro mantido como select
- **Botão "Buscar Vagas"** — fica cinza e desabilitado enquanto nenhum filtro estiver selecionado; fica verde e clicável ao selecionar qualquer filtro
- **Aplicação ao clicar** — ao clicar em "Buscar Vagas", o painel fecha e os resultados filtrados aparecem abaixo
- **Chips de filtros ativos** — exibidos abaixo do contador de resultados com botão "X" para remover individualmente
- **Limpar seleções** — botão dentro do painel para limpar filtros pendentes; "Limpar todos" fora do painel para remover filtros aplicados
- **Filtros rápidos por setor** — barra horizontal de chips acima dos resultados mantida para acesso rápido sem abrir o painel

### ✅ Fase 6 (complemento v3.9): Ordenação em /vagas + Página de Interesse de Empresa
- **Ordenação dos resultados em /vagas** — dropdown "Ordenar por" na barra acima do grid:
  - Mais recentes (padrão) — ordena por `createdAt` decrescente
  - Maior salário — extrai valor numérico do `salaryRange` e ordena decrescente
  - Mais candidaturas — valor determinístico baseado no ID da vaga
  - Dropdown com ícone, label e checkmark na opção ativa
- **Página /interesse-empresa** — formulário de interesse para empresas:
  - Hero com imagem de fundo + overlay verde
  - Formulário em 3 blocos: Dados da Empresa (nome, setor, porte, vagas), Responsável (nome, cargo, email, WhatsApp), Informações Adicionais (mensagem, como conheceu)
  - Chips visuais para seleção de quantidade de vagas
  - Validação completa com feedback de erros
  - Envio via `application/x-www-form-urlencoded` para endpoint Readdy Forms
  - Tela de sucesso com próximos passos
  - Sidebar com: contato direto (WhatsApp + email), benefícios da plataforma, stats, CTA para pré-cadastro completo
- **Botões "Falar com a equipe" em /para-empresas** — todos redirecionam para `/interesse-empresa` (hero, planos, CTA final); CTA final mantém também botão WhatsApp direto

### Fase 7: Supabase + Integrações (WhatsApp + Email + AdSense)
- Goal: Conectar banco de dados real, notificações automáticas e monetização
- Deliverable: Supabase conectado, mocks substituídos, Edge Functions ativas
- Status: **PARCIALMENTE IMPLEMENTADO** — artefatos prontos aguardando conexão
- Artefatos prontos:
  - `supabase-schema.sql` — 8 tabelas com RLS completo
  - `supabase/functions/send-notification-email/index.ts` — Edge Function de email (Resend), aguarda `RESEND_API_KEY`
  - `supabase/functions/send-whatsapp-notification/index.ts` — **Edge Function WhatsApp (Evolution API)**, aguarda 3 secrets
  - `src/hooks/useEmailNotification.ts` — hook pronto, modo simulado até Supabase conectar
  - `src/hooks/useWhatsAppNotification.ts` — **hook WhatsApp pronto**, modo simulado até Supabase conectar
  - `src/pages/admin/components/AdminNotifications.tsx` — **painel WhatsApp integrado** com aba dedicada, prévia de mensagens, stats de envio
- Próximos passos:
  1. Conectar Supabase ao projeto (botão "Connect Supabase" no painel Readdy)
  2. Executar `supabase-schema.sql` para criar as 8 tabelas
  3. Substituir mocks por queries reais
  4. Adicionar `RESEND_API_KEY` nos secrets para ativar emails reais
  5. Adicionar `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE` nos secrets para ativar WhatsApp real
  6. Implementar Supabase Auth no fluxo de login (/login) com redirecionamento por perfil
