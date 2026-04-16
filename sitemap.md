# VagasOeste — Sitemap Completo

> Versão: 3.7 | Última atualização: Abril 2026  
> Todas as rotas existentes na plataforma VagasOeste.

---

## Site Público

| URL | Título | Descrição | Status |
|-----|--------|-----------|--------|
| `/` | Home | Hero, busca por bairro, vagas em destaque, como funciona, depoimentos, CTA, footer | ✅ Ativo |
| `/vagas` | Vagas Disponíveis | Listagem completa com filtros (painel overlay/drawer) + **ordenação** (Mais recentes, Maior salário, Mais candidaturas) + chips de filtros ativos + barra de filtros rápidos por setor | ✅ Ativo |
| `/vagas/:id` | Detalhe da Vaga | Descrição completa, requisitos, benefícios + fluxo de candidatura integrado + **FAQ visual accordion (5 perguntas)** + Schema.org JobPosting + BreadcrumbList + FAQPage + meta tags dinâmicas | ✅ Ativo |
| `/blog` | Blog VagasOeste | Artigos sobre emprego, currículo, mercado de trabalho — Schema.org Blog markup | ✅ Ativo |
| `/blog/:slug` | Artigo do Blog | Artigo individual com Schema.org Article markup, compartilhamento, artigos relacionados | ✅ Ativo |
| `/como-funciona` | Como Funciona | Passo a passo, benefícios, FAQ, CTA | ✅ Ativo |
| `/para-empresas` | Para Empresas | Processo, recursos, depoimentos, planos, FAQ — botões "Falar com a equipe" redirecionam para `/interesse-empresa` | ✅ Ativo |
| `/interesse-empresa` | Falar com a Equipe | Formulário de interesse para empresas — dados da empresa, responsável, mensagem; sidebar com contato direto, benefícios e stats; tela de sucesso com próximos passos | ✅ Ativo |
| `/dicas-de-vaga` | Dicas de Vaga | Hero com stats do mercado, setores em alta em Santarém, dicas por categoria, integração com Blog | ✅ Ativo |
| `/crie-seu-curriculo` | Crie seu Currículo | Landing page com opções de criação de currículo | ✅ Ativo |
| `/curriculo-avulso` | Currículo Avulso | **Editor completo de currículo sem cadastro** — tela de escolha + editor em 6 etapas (Dados, Objetivo, Experiências, Formação, Habilidades, Prévia) + download PDF gratuito | ✅ Ativo |

---

## Blog — Artigos Disponíveis

| Slug | Título | Categoria |
|------|--------|-----------|
| `como-se-destacar-em-entrevistas-de-emprego` | Como se Destacar em Entrevistas de Emprego em Santarém | Entrevistas |
| `curriculo-perfeito-para-o-mercado-de-santarem` | Como Criar um Currículo Perfeito para o Mercado de Santarém | Currículo |
| `mercado-de-trabalho-em-santarem-2026` | Mercado de Trabalho em Santarém em 2026: Setores em Alta | Mercado de Trabalho |
| `como-usar-o-linkedin-para-encontrar-emprego` | Como Usar o LinkedIn para Encontrar Emprego em Santarém | Dicas Profissionais |
| `direitos-trabalhistas-que-todo-candidato-deve-conhecer` | Direitos Trabalhistas que Todo Candidato Deve Conhecer | Direitos Trabalhistas |
| `como-negociar-salario-com-confianca` | Como Negociar Salário com Confiança e Conseguir o que Você Merece | Carreira |

---

## Autenticação

| URL | Título | Descrição | Status |
|-----|--------|-----------|--------|
| `/login` | Login | Login unificado com indicador de redirecionamento por perfil, animação de entrada, botão mostra perfil selecionado | ✅ Ativo |
| `/cadastro` | Cadastro do Candidato | Formulário em 4 etapas: dados pessoais, perfil, cursos, senha | ✅ Ativo |
| `/verificar-email` | Verificar Email | Tela de aguardo de verificação de email após cadastro | ✅ Ativo |

---

## Plataforma do Candidato (Área Privada)

| URL | Título | Descrição | Status |
|-----|--------|-----------|--------|
| `/plataforma` | Dashboard do Candidato | Vagas disponíveis, candidaturas, currículo, notificações | ✅ Ativo |
| `/plataforma/perfil` | Meu Perfil | Editar dados pessoais, escolaridade e cursos/certificações | ✅ Ativo |

### Abas dentro de `/plataforma`

| Aba | Funcionalidades |
|-----|----------------|
| Vagas Disponíveis | Filtros por setor/contrato/bairro, cards com "Ver detalhes" (modal) e "Candidatar-se" |
| Minhas Candidaturas | Linha do tempo do processo, filtros por status/setor |
| Meu Currículo | Builder em 5 etapas, prévia, **download PDF gratuito** via window.print() |
| Notificações | Lista de notificações, filtros, preferências de canal (WhatsApp/Email) |

### VagaDetalheModal (dentro da aba Vagas)

| Elemento | Descrição |
|----------|-----------|
| Trigger | Botão "Ver detalhes" ou "Candidatar-se" em cada card de vaga |
| Comportamento mobile | Bottom sheet (desliza de baixo) |
| Comportamento desktop | Modal centralizado |
| Conteúdo | Título, área, contrato, setor, localização, salário, descrição, requisitos, tags |
| Ação | Botão "Quero me Candidatar!" com modal de confirmação |
| Estado pós-candidatura | "Candidatado ✓" (não permite candidatura dupla) |

---

## Plataforma da Empresa (Área Privada)

| URL | Título | Descrição | Status |
|-----|--------|-----------|--------|
| `/empresa/dashboard` | Painel da Empresa | Candidatos, vagas e administrativo | ✅ Ativo |

### Fluxo de primeiro acesso

| Etapa | Descrição |
|-------|-----------|
| Modal de troca de senha | Aparece automaticamente ao logar pela primeira vez com senha provisória |
| Validação | Mínimo 8 caracteres, medidor de força, confirmação de senha |
| Liberação | Após salvar nova senha, acesso completo ao painel |

### Abas dentro de `/empresa/dashboard`

| Aba | Funcionalidades |
|-----|----------------|
| Candidatos | Filtros (escolaridade/sexo/função), sub-abas Todos/Favoritados, notificação de novos candidatos, alteração de status com histórico |
| Favoritados | Lista de favoritos, ações em lote, status de solicitações |
| Minhas Vagas | Publicar nova vaga (2 passos), gerenciar vagas ativas/pausadas |
| Administrativo | Solicitações enviadas ao admin, relatos de pré-entrevista, status |

### Status disponíveis para candidatos (empresa)

| Status | Descrição |
|--------|-----------|
| Pendente | Candidatura recebida, aguardando análise |
| Em Análise | Perfil sendo analisado pela empresa |
| Pré-Entrevista | Selecionado para pré-entrevista pela VagasOeste |
| Entrevista | Convocado para entrevista |
| Aprovado | Aprovado para próxima etapa |
| Reprovado | Não selecionado |
| Contratado | Efetivado na vaga |

---

## Painel Administrativo VagasOeste (Área Restrita)

| URL | Título | Descrição | Status |
|-----|--------|-----------|--------|
| `/admin` | Painel Admin VagasOeste | Gestão completa do ecossistema | ✅ Ativo |

### Módulos dentro de `/admin`

| Módulo | Funcionalidades |
|--------|----------------|
| Dashboard | KPIs gerais, ações rápidas, últimas notificações |
| Empresas | Lista com filtros, detalhe completo (CNPJ, contato, plano) |
| Candidatos | Lista com filtros, todos os dados visíveis (nome, email, telefone) |
| Vagas | Lista com filtros, estatísticas de candidatos por vaga |
| Relatórios | Gráficos avançados: candidaturas/mês, funil de status, vagas por setor, escolaridade, top empresas, top vagas |
| Notificações | Disparar emails/WhatsApp, histórico, regras de privacidade |
| Configurações | 4 abas: **Geral** (nome, email, WhatsApp, preço), **Notificações** (toggles), **Acessos** (credenciais), **Design** (cores, imagens hero, restaurar padrão) |

---

## Componentes Globais

| Componente | Arquivo | Aparece em |
|-----------|---------|-----------|
| Navbar | `src/components/feature/Navbar.tsx` | Todas as páginas públicas |
| Footer | `src/components/feature/Footer.tsx` | Todas as páginas públicas |

### Links da Navbar (atualizado)

| Label | Rota |
|-------|------|
| Vagas | `/vagas` |
| Blog | `/blog` |
| Crie seu Currículo | `/crie-seu-curriculo` |
| Como Funciona | `/como-funciona` |
| Para Empresas | `/para-empresas` |
| Entrar | `/login` |
| Cadastrar-se | `/cadastro` |

---

## Rotas Planejadas (Roadmap)

| URL | Título | Prioridade |
|-----|--------|-----------|
| `/vagas/[bairro]/[cargo]` | SEO Programático por Bairro+Cargo (Astro) | Alta |
| `/afiliados` | Links de Afiliados | Baixa |

## Supabase — Status de Integração

| Componente | Status | Observação |
|-----------|--------|-----------|
| Schema SQL | Criado | `supabase-schema.sql` — 8 tabelas com RLS |
| Edge Function Email | Criada | `supabase/functions/send-notification-email/index.ts` — aguarda `RESEND_API_KEY` nos secrets |
| Edge Function WhatsApp | Criada | `supabase/functions/send-whatsapp-notification/index.ts` — aguarda `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE` |
| Hook useEmailNotification | Criado | `src/hooks/useEmailNotification.ts` — integrado nos modais, modo simulado até Supabase conectar |
| Hook useWhatsAppNotification | Criado | `src/hooks/useWhatsAppNotification.ts` — integrado no AdminNotifications, modo simulado até Supabase conectar |
| Painel WhatsApp Admin | Implementado | Aba dedicada em AdminNotifications com stats, guia de configuração, prévia de mensagens |
| Supabase Auth | Pendente | Login demo funcional; Auth real aguarda conexão |
| Mocks → Supabase | Pendente | Todos os mocks em `src/mocks/` prontos para substituição |

---

## Credenciais de Acesso (Demonstração)

| Perfil | Email | Senha | Rota de Destino |
|--------|-------|-------|----------------|
| Candidato | candidato@email.com | vagasoeste | `/plataforma` |
| Empresa | empresa@email.com | vagasoeste | `/empresa/dashboard` |
| Administrador | vagas@email.com | vagasoeste | `/admin` |

---

## Animações de Entrada (v3.3)

| Página | Elementos animados | Variante |
|--------|--------------------|---------|
| Home — JobsSection | Header, filtros, cada card de vaga, CTA | `fade-up` escalonado |
| Home — HowItWorksSection | Header, cada step card, CTAs laterais | `fade-up` + `fade-left`/`fade-right` |
| `/vagas` | Cada card de vaga no grid | `fade-up` escalonado (ciclo de 6) |
| `/dicas-de-vaga` | Hero, stats, setores, dicas, artigos do blog, CTA | `fade-up` escalonado |
| `/login` | Container do formulário completo | `fade-up` |
| `/admin` — Dashboard | Título, alertas de pendentes, KPIs (escalonados), ações rápidas, notificações | `fade-up` escalonado |
| `/admin` — Empresas | Cada card de empresa na lista | `fade-up` escalonado (ciclo de 6) |
| `/admin` — Vagas | Cada card de vaga na lista | `fade-up` escalonado (ciclo de 6) |
| `/admin` — Candidatos | Título, filtros, cada card de candidato, painel de detalhes | `fade-up` escalonado (ciclo de 6) |

Componente: `src/components/base/AnimatedSection.tsx` — usa `IntersectionObserver`, anima apenas ao entrar na viewport.

---

## Schema.org por Página (v3.5)

| Página | Schemas emitidos |
|--------|-----------------|
| `/vagas/:id` | `JobPosting` (completo) + `BreadcrumbList` + `FAQPage` (5 perguntas dinâmicas) |
| `/blog` | `Blog` + array de `BlogPosting` |
| `/blog/:slug` | `Article` com author, publisher, keywords, datePublished |
| `/vagas` (com filtro bairro) | `ItemList` de vagas por bairro |

---

## Padronização de Heroes (v3.6)

Todas as páginas com seção hero seguem o mesmo padrão visual de `/vagas`:

| Página | Altura | Estilo |
|--------|--------|--------|
| `/vagas` | pt-24 pb-12 | bg-emerald-900 + busca integrada (referência) |
| `/blog` | pt-24 pb-12 | Imagem de fundo + overlay + busca integrada |
| `/crie-seu-curriculo` | pt-24 pb-12 | Imagem de fundo + overlay + card de prévia |
| `/como-funciona` | pt-24 pb-12 | Imagem de fundo + overlay (convertida de gradiente) |
| `/para-empresas` | pt-24 pb-12 | Imagem de fundo + overlay + 3 CTAs |

---

## Notas Importantes

- **Empresa nunca se cadastra sozinha** — cadastro feito exclusivamente pela equipe VagasOeste via `/admin`
- **Troca de senha obrigatória** — modal bloqueante no primeiro acesso da empresa
- **Dados do candidato protegidos** — empresa vê apenas perfil profissional (sem nome, email, telefone)
- **Empresa anônima** — candidatos não sabem qual empresa está anunciando a vaga
- **Todo contato intermediado** — empresa solicita via plataforma, VagasOeste executa
- **Histórico de status** — cada mudança de status é registrada com data e observação
- **Notificações configuráveis** — candidato escolhe canais (WhatsApp/Email) e tipos de notificação
- **PDF do currículo gratuito** — gerado via window.print() sem custo adicional
- **Blog SEO-first** — Schema.org Article markup em todos os artigos
- **Mobile-First** — toda a plataforma desenvolvida com abordagem mobile-first
- **Animações de entrada** — `AnimatedSection` com `IntersectionObserver` em cards de vagas e seções principais
