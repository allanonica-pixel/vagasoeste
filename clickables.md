# VagasOeste — Mapa de Clicáveis

> Versão: 2.7 | Abril 2026  
> Este documento mapeia todos os elementos clicáveis da plataforma VagasOeste, organizados por área e página.

---

## Estrutura dos Clicáveis

A plataforma VagasOeste possui **quatro ambientes distintos**, cada um com seus próprios elementos interativos:

1. **Site Público** — acessível por qualquer visitante, sem login
2. **Plataforma do Candidato** — área privada após login do candidato
3. **Plataforma da Empresa** — área privada após login da empresa parceira
4. **Painel Administrativo** — área restrita da equipe VagasOeste

Os clicáveis são classificados em:
- **Links de navegação** — redirecionam para outra rota
- **Botões de ação** — executam uma ação na página (abrir modal, filtrar, enviar)
- **Toggles/Switches** — alternam estado (ativo/inativo, favorito, filtro)
- **Formulários** — campos de entrada com botão de envio
- **Modais** — janelas sobrepostas com ações internas

**Nota Mobile-First:** Todos os elementos clicáveis possuem área de toque mínima de 44px em mobile. Modais se comportam como bottom sheets em dispositivos móveis.

---

## 1. Site Público

### 1.1 Navbar (todas as páginas públicas)

| Elemento | Tipo | Ação |
|----------|------|------|
| Logo "VagasOeste" | Link | → `/` (Home) |
| "Vagas" | Link | → `/vagas` |
| "Blog" | Link | → `/blog` |
| "Crie seu Currículo" | Link | → `/crie-seu-curriculo` |
| "Como Funciona" | Link | → `/como-funciona` |
| "Para Empresas" | Link | → `/para-empresas` |
| Botão "Entrar" | Link | → `/login` |
| Botão "Cadastrar-se" | Link | → `/cadastro` |
| Ícone hambúrguer (mobile) | Toggle | Abre/fecha menu mobile |

### 1.2 Footer (todas as páginas públicas)

| Elemento | Tipo | Ação |
|----------|------|------|
| Logo "VagasOeste" | Link | → `/` |
| Links de navegação | Links | → respectivas rotas |
| Links de redes sociais | Links externos | Abre em nova aba |
| Campo de newsletter | Formulário | Envia email para lista |

### 1.3 Home (`/`)

| Elemento | Tipo | Ação |
|----------|------|------|
| Botão "Ver todas as vagas" (hero) | Link | → `/vagas` |
| Botão "Cadastrar-se grátis" (hero) | Link | → `/cadastro` |
| Cards de vagas em destaque | Link | → `/vagas/:id` |
| Botão "Ver mais vagas" | Link | → `/vagas` |
| Cards de bairros | Botão | Filtra vagas por bairro |
| Links de afiliados | Links externos | Abre em nova aba |
| Botão "Criar meu cadastro" (CTA) | Link | → `/cadastro` |
| Botão "Ver vagas disponíveis" (CTA) | Link | → `/vagas` |

### 1.4 Listagem de Vagas (`/vagas`)

| Elemento | Tipo | Ação |
|----------|------|------|
| Campo de busca | Input | Filtra vagas por texto em tempo real |
| Botão "Filtros" (com badge) | Botão | Abre painel de filtros overlay/drawer |
| **Painel de Filtros (overlay)** | | |
| Backdrop (fundo escuro) | Botão | Fecha o painel sem aplicar filtros |
| Botão "X" (fechar painel) | Botão | Fecha o painel sem aplicar filtros |
| Chips de Setor | Toggle | Seleciona/deseleciona setor (pendente) |
| Chips de Área Profissional | Toggle | Seleciona/deseleciona área (pendente) |
| Chips de Tipo de Contrato | Toggle | Seleciona/deseleciona contrato (pendente) |
| Select "Bairro" | Select | Seleciona bairro (pendente) |
| Botão "Limpar seleções" | Botão | Remove todos os filtros pendentes no painel |
| Botão "Buscar Vagas" (cinza/desabilitado) | Visual | Inativo enquanto nenhum filtro estiver selecionado |
| Botão "Buscar Vagas" (verde/ativo) | Botão | Aplica filtros, fecha painel, exibe resultados |
| **Resultados** | | |
| Chips de filtros ativos (abaixo do contador) | Visual | Exibe filtros aplicados |
| Botão "X" em chip de filtro ativo | Botão | Remove filtro individual |
| Botão "Limpar todos" | Botão | Remove todos os filtros aplicados |
| Chips de setor (barra rápida) | Toggle | Aplica filtro de setor diretamente sem abrir painel |
| **Dropdown "Ordenar por"** | | |
| Botão "Ordenar por" (com ícone e label) | Toggle | Abre/fecha menu de ordenação |
| Opção "Mais recentes" | Botão | Ordena por data de publicação (decrescente) |
| Opção "Maior salário" | Botão | Ordena por valor salarial (decrescente) |
| Opção "Mais candidaturas" | Botão | Ordena por número de candidaturas (decrescente) |
| Card de vaga | Link | → `/vagas/:id` |

### 1.5 Detalhe da Vaga (`/vagas/:id`)

| Elemento | Tipo | Ação |
|----------|------|------|
| Breadcrumb "Início" | Link | → `/` |
| Breadcrumb "Vagas" | Link | → `/vagas` |
| Botão "Quero me Candidatar!" | Botão | Abre modal de candidatura |
| Botão "Ver outras vagas" | Botão | → `/vagas` |
| Cards de vagas relacionadas | Link | → `/vagas/:id` (outra vaga) |
| **FAQ Visual (accordion)** | | |
| Item do FAQ (5 perguntas) | Toggle | Abre/fecha resposta da pergunta |
| **Modal — Etapa 1 (Escolha)** | | |
| "Já tenho cadastro" | Botão | Avança para etapa de login |
| "Criar cadastro grátis" | Botão | → `/cadastro` |
| "Cancelar" | Botão | Fecha o modal |
| **Modal — Etapa 2 (Login)** | | |
| "Voltar" | Botão | Retorna à etapa de escolha |
| Campo email | Input | Preenche email |
| Campo senha | Input | Preenche senha |
| Ícone olho (mostrar/ocultar senha) | Toggle | Alterna visibilidade da senha |
| Botão "Entrar e candidatar-se" | Botão | Autentica e avança |
| "Cadastre-se grátis" | Botão | → `/cadastro` |
| **Modal — Etapa 3 (Confirmação)** | | |
| Botão "Confirmar candidatura!" | Botão | Registra candidatura, avança para sucesso |
| "Cancelar" | Botão | Fecha o modal |
| **Modal — Etapa 4 (Sucesso)** | | |
| "Ver minhas candidaturas" | Botão | → `/plataforma` |
| "Ver mais vagas" | Botão | Fecha modal e → `/vagas` |

### 1.6 Blog (`/blog`)

| Elemento | Tipo | Ação |
|----------|------|------|
| Campo de busca | Input | Filtra artigos por texto |
| Botões de categoria | Toggle | Filtra artigos por categoria |
| Card de artigo em destaque | Link | → `/blog/:slug` |
| Card de artigo (grid) | Link | → `/blog/:slug` |
| Botão "Criar cadastro grátis" (CTA) | Link | → `/cadastro` |
| Botão "Ver vagas disponíveis" (CTA) | Link | → `/vagas` |
| Botão "Limpar filtros" | Botão | Remove busca e categoria |

### 1.7 Artigo do Blog (`/blog/:slug`)

| Elemento | Tipo | Ação |
|----------|------|------|
| Breadcrumb "Início" | Link | → `/` |
| Breadcrumb "Blog" | Link | → `/blog` |
| Botão WhatsApp (compartilhar) | Link externo | Abre WhatsApp com link do artigo |
| Botão LinkedIn (compartilhar) | Link externo | Abre LinkedIn com link do artigo |
| Botão "Criar cadastro grátis" (CTA) | Link | → `/cadastro` |
| Botão "Ver vagas" (CTA) | Link | → `/vagas` |
| Cards de artigos relacionados | Link | → `/blog/:slug` (outro artigo) |

### 1.8 Como Funciona (`/como-funciona`)

| Elemento | Tipo | Ação |
|----------|------|------|
| Botão "Criar meu cadastro grátis" | Link | → `/cadastro` |
| Botão "Ver vagas disponíveis" | Link | → `/vagas` |
| Itens do FAQ | Toggle | Abre/fecha resposta do accordion |
| Botão "Criar cadastro grátis" (CTA) | Link | → `/cadastro` |
| Botão "Ver vagas abertas" (CTA) | Link | → `/vagas` |

### 1.9 Para Empresas (`/para-empresas`)

| Elemento | Tipo | Ação |
|----------|------|------|
| Botão "Falar com a equipe" (hero) | Botão | → `/interesse-empresa` |
| Link "Como funciona" (hero) | Âncora | Rola para seção #como-funciona |
| Botões "Falar com a equipe" (planos) | Botão | → `/interesse-empresa` |
| Itens do FAQ | Toggle | Abre/fecha resposta do accordion |
| Botão "Falar com a equipe agora" (CTA) | Botão | → `/interesse-empresa` |
| Link "WhatsApp direto" (CTA) | Link externo | Abre WhatsApp da VagasOeste |

### 1.X Interesse de Empresa (`/interesse-empresa`)

| Elemento | Tipo | Ação |
|----------|------|------|
| Breadcrumb "Início" | Link | → `/` |
| Breadcrumb "Para Empresas" | Link | → `/para-empresas` |
| Campo "Nome da Empresa" | Input | Preenche nome |
| Select "Setor de Atuação" | Select | Seleciona setor |
| Select "Porte da Empresa" | Select | Seleciona porte |
| Chips de quantidade de vagas | Toggle | Seleciona faixa de vagas pretendidas |
| Campo "Nome Completo" | Input | Preenche nome do responsável |
| Campo "Cargo / Função" | Input | Preenche cargo |
| Campo "Email" | Input | Preenche email |
| Campo "WhatsApp" | Input | Preenche WhatsApp com máscara |
| Textarea "Mensagem" | Input | Mensagem opcional (máx 500 chars) |
| Select "Como nos conheceu?" | Select | Seleciona canal de origem |
| Botão "Enviar interesse" | Botão | Valida e envia formulário via Readdy Forms |
| Link WhatsApp (sidebar) | Link externo | Abre WhatsApp da VagasOeste |
| Link Email (sidebar) | Link externo | Abre cliente de email |
| Link "Ir para o Pré-Cadastro" (sidebar) | Link | → `/pre-cadastro` |
| **Tela de sucesso** | | |
| Botão "Voltar para Para Empresas" | Botão | → `/para-empresas` |
| Link "Ir para a Home" | Link | → `/` |

### 1.10 Login (`/login`)

| Elemento | Tipo | Ação |
|----------|------|------|
| Logo "VagasOeste" | Link | → `/` |
| Link "Ver vagas" (header) | Link | → `/vagas` |
| Link "Criar conta" (header) | Link | → `/cadastro` |
| Seletor "Candidato" | Toggle | Seleciona tipo + mostra indicador de redirecionamento |
| Seletor "Empresa" | Toggle | Seleciona tipo + mostra indicador de redirecionamento |
| Seletor "Administrador" | Toggle | Seleciona tipo + mostra indicador de redirecionamento |
| Indicador de redirecionamento | Visual | Mostra destino após login (ex: "Você será redirecionado para a plataforma do candidato") |
| Campo email | Input | Preenche email |
| Campo senha | Input | Preenche senha |
| Ícone olho | Toggle | Mostra/oculta senha |
| Botão "Entrar como [Perfil]" | Botão | Autentica e redireciona para rota correta do perfil |
| "Preencher com credenciais de demonstração" | Botão | Preenche campos automaticamente |
| "Cadastre-se grátis" (candidato) | Link | → `/cadastro` |

**Redirecionamentos por perfil:**
| Perfil | Destino |
|--------|---------|
| Candidato | `/plataforma` |
| Empresa | `/empresa/dashboard` |
| Administrador | `/admin` |

### 1.11 Cadastro (`/cadastro`)

| Elemento | Tipo | Ação |
|----------|------|------|
| Indicadores de etapa (1-4) | Visual | Mostra progresso |
| Campos do formulário | Inputs | Preenchimento de dados |
| Botão "Próximo" | Botão | Avança para próxima etapa |
| Botão "Voltar" | Botão | Retorna à etapa anterior |
| Botão "Adicionar curso" | Botão | Adiciona campo de curso |
| Botão "Remover" (curso) | Botão | Remove curso da lista |
| Botão "Finalizar cadastro" | Botão | Envia formulário → `/verificar-email` |

### 1.12 Dicas de Vaga (`/dicas-de-vaga`)

| Elemento | Tipo | Ação |
|----------|------|------|
| Filtros de categoria (Todas, Currículo, Entrevista, Mercado Local, Carreira) | Toggle | Filtra dicas por categoria |
| Card de dica em destaque | Toggle | Expande/colapsa conteúdo da dica |
| Card de dica (grid) | Toggle | Expande/colapsa conteúdo da dica |
| "Ler dica ▼" / "Fechar ▲" | Toggle | Expande/colapsa conteúdo |
| Card de artigo do blog (seção relacionados) | Link | → `/blog/:slug` |
| Botão "Ver todos os artigos" | Link | → `/blog` |
| Botão "Ver Vagas Disponíveis" (CTA) | Link | → `/vagas` |
| Botão "Criar meu Currículo" (CTA) | Link | → `/crie-seu-curriculo` |

### 1.13 Crie seu Currículo (`/crie-seu-curriculo`) e Currículo Avulso (`/curriculo-avulso`)

| Elemento | Tipo | Ação |
|----------|------|------|
| Botão "Criar currículo avulso" | Link | → `/curriculo-avulso` |
| Botão "Criar cadastro + currículo" | Link | → `/cadastro` |
| Botão "Começar agora" | Link | → `/cadastro` |

**Tela de Escolha (`/curriculo-avulso` — modo choose):**

| Elemento | Tipo | Ação |
|----------|------|------|
| Botão "Criar Currículo Agora" (avulso) | Botão | Entra no modo editor |
| Botão "Criar Cadastro e Currículo" | Link | → `/cadastro` |
| Link "Acessar minha conta" | Link | → `/plataforma` |

**Editor de Currículo (`/curriculo-avulso` — modo editor):**

| Elemento | Tipo | Ação |
|----------|------|------|
| Botão voltar (seta) | Link | → `/curriculo-avulso` (tela de escolha) |
| Botões de etapa na sidebar (1-6) | Botão | Navega diretamente para a etapa |
| Barra de progresso | Visual | Exibe % de conclusão |
| **Etapa 1 — Dados Pessoais** | | |
| Campos nome, email, telefone, cidade, estado, LinkedIn | Inputs | Preenchimento de dados |
| Botão "Próximo" | Botão | Avança para etapa 2 (desabilitado se inválido) |
| **Etapa 2 — Objetivo** | | |
| Botões de sugestão (4 textos) | Botão | Preenche textarea com texto sugerido |
| Textarea objetivo | Input | Edição livre (máx 500 chars) |
| Botão "Voltar" | Botão | Retorna à etapa 1 |
| Botão "Próximo" | Botão | Avança para etapa 3 |
| **Etapa 3 — Experiências** | | |
| Botão "Adicionar experiência" (dashed) | Botão | Abre formulário de nova experiência |
| Botão editar (lápis) em card | Botão | Abre formulário de edição |
| Botão remover (lixeira) em card | Botão | Remove experiência |
| Campos cargo, empresa, início, fim, atual, descrição | Inputs | Preenchimento |
| Checkbox "Atual" | Toggle | Desabilita campo "fim" |
| Botão "Cancelar" (formulário) | Botão | Fecha formulário sem salvar |
| Botão "Adicionar" / "Salvar edição" | Botão | Salva experiência |
| Botão "Voltar" | Botão | Retorna à etapa 2 |
| Botão "Próximo" | Botão | Avança para etapa 4 |
| **Etapa 4 — Formação** | | |
| Botão "Adicionar formação" (dashed) | Botão | Abre formulário de nova formação |
| Botão editar / remover em card | Botão | Edita ou remove formação |
| Campos curso, instituição, nível, início, fim, cursando | Inputs | Preenchimento |
| Botão "Voltar" / "Próximo" | Botão | Navega entre etapas |
| **Etapa 5 — Habilidades** | | |
| Chips de habilidades sugeridas (25) | Toggle | Adiciona/remove habilidade |
| Botão "X" em habilidade selecionada | Botão | Remove habilidade |
| Input + Botão "Adicionar" (habilidade custom) | Input+Botão | Adiciona habilidade personalizada |
| Botão "Adicionar idioma" | Botão | Abre campos de idioma + nível |
| Botão "OK" (idioma) | Botão | Salva idioma |
| Botão "X" em idioma | Botão | Remove idioma |
| Botão "Adicionar curso complementar" | Botão | Abre formulário de curso |
| Botão "Adicionar" (curso) | Botão | Salva curso complementar |
| Botão "X" em curso | Botão | Remove curso |
| Botão "Voltar" | Botão | Retorna à etapa 4 |
| Botão "Ver Prévia" | Botão | Avança para etapa 6 |
| **Etapa 6 — Prévia** | | |
| Botão "Editar" | Botão | Retorna à etapa 5 |
| Botão "Baixar PDF Grátis" | Botão | Abre janela de impressão para salvar como PDF |
| Botão "Criar conta grátis" (CTA) | Link | → `/cadastro` |

---

## 2. Plataforma do Candidato (`/plataforma`)

### 2.1 Header da Plataforma

| Elemento | Tipo | Ação |
|----------|------|------|
| Logo "VagasOeste" | Link | → `/plataforma` |
| Botão "Meu Perfil" | Link | → `/plataforma/perfil` |
| Avatar do usuário | Link | → `/plataforma/perfil` |

### 2.2 Abas da Plataforma

| Elemento | Tipo | Ação |
|----------|------|------|
| Aba "Vagas Disponíveis" | Toggle | Exibe aba de vagas |
| Aba "Minhas Candidaturas" | Toggle | Exibe aba de candidaturas |
| Aba "Meu Currículo" | Toggle | Exibe aba do currículo |
| Aba "Notificações" (badge) | Toggle | Exibe aba de notificações |

### 2.3 Aba: Vagas Disponíveis

| Elemento | Tipo | Ação |
|----------|------|------|
| Campo de busca | Input | Filtra vagas por texto |
| Botão "Filtros" | Toggle | Abre/fecha painel de filtros |
| Filtro "Setor" | Select | Filtra por setor |
| Filtro "Contrato" | Select | Filtra por contrato |
| Filtro "Bairro" | Select | Filtra por bairro |
| Botão "Limpar todos os filtros" | Botão | Remove todos os filtros |
| Checkbox circular (card de vaga) | Toggle | Seleciona/deseleciona vaga para candidatura em lote |
| Botão "Ver detalhes" (card) | Botão | Abre VagaDetalheModal |
| Botão "Candidatar-se" (card) | Botão | Abre VagaDetalheModal com foco em candidatura |
| Botão "Vamos lá! 🚀" (barra de seleção) | Botão | Abre modal de candidatura em lote |
| **VagaDetalheModal** | | |
| Botão fechar (X) | Botão | Fecha o modal |
| Botão "Quero me Candidatar!" | Botão | Abre modal de confirmação |
| **Modal de confirmação** | | |
| Botão "Cancelar" | Botão | Fecha modal de confirmação |
| Botão "Confirmar!" | Botão | Registra candidatura |
| **Modal de candidatura em lote — Sucesso** | | |
| Botão "OK" | Botão | Avança para modal de processo |
| **Modal de candidatura em lote — Processo** | | |
| Botão "Ver minhas candidaturas" | Botão | Fecha modal, vai para aba Candidaturas |

### 2.4 Aba: Minhas Candidaturas

| Elemento | Tipo | Ação |
|----------|------|------|
| Filtro "Status" | Select | Filtra candidaturas por status |
| Filtro "Setor" | Select | Filtra candidaturas por setor |
| Card de candidatura | Toggle | Seleciona e exibe linha do tempo |
| Linha do tempo | Visual | Mostra progresso do processo |

### 2.5 Aba: Meu Currículo

| Elemento | Tipo | Ação |
|----------|------|------|
| Indicadores de etapa (1-5) | Botão | Navega entre etapas |
| Campos do formulário | Inputs | Preenchimento de dados |
| Botão "Próximo" | Botão | Avança etapa |
| Botão "Voltar" | Botão | Retorna etapa |
| Botão "Adicionar Experiência" | Botão | Adiciona experiência à lista |
| Botão "Remover" (experiência) | Botão | Remove experiência |
| Botão "Adicionar Curso" | Botão | Adiciona curso à lista |
| Botão "Remover" (curso) | Botão | Remove curso |
| Botão "Ver Prévia" | Botão | Avança para etapa de prévia |
| Botão "Baixar PDF Grátis" | Botão | Abre janela de impressão para salvar como PDF |
| Botão "Editar Currículo" | Botão | Retorna à etapa de habilidades |

### 2.6 Aba: Notificações

| Elemento | Tipo | Ação |
|----------|------|------|
| Botão "Marcar todas como lidas" | Botão | Marca todas as notificações como lidas |
| Botão "Preferências" | Toggle | Abre/fecha painel de preferências |
| Filtros de tipo | Toggles | Filtra notificações por tipo |
| Card de notificação | Botão | Marca como lida ao clicar |
| Toggle "WhatsApp" (preferências) | Toggle | Ativa/desativa notificações WhatsApp |
| Toggle "Email" (preferências) | Toggle | Ativa/desativa notificações por email |
| Toggle "Mudança de status" | Toggle | Ativa/desativa tipo de notificação |
| Toggle "Pré-entrevista" | Toggle | Ativa/desativa tipo de notificação |
| Toggle "Solicitação de contato" | Toggle | Ativa/desativa tipo de notificação |
| Botão "Salvar preferências" | Botão | Salva configurações e fecha painel |

### 2.7 Perfil do Candidato (`/plataforma/perfil`)

| Elemento | Tipo | Ação |
|----------|------|------|
| Botão "Voltar" | Link | → `/plataforma` |
| Aba "Dados Pessoais" | Toggle | Exibe formulário de dados |
| Aba "Cursos e Certificações" | Toggle | Exibe lista de cursos |
| Campos do formulário | Inputs | Edição de dados |
| Botão "Salvar alterações" | Botão | Salva dados pessoais |
| Botão "Adicionar curso" | Botão | Adiciona novo curso |
| Botão "Editar" (curso) | Botão | Habilita edição do curso |
| Botão "Remover" (curso) | Botão | Remove curso da lista |
| Botão "Salvar" (curso) | Botão | Salva edição do curso |

---

## 3. Plataforma da Empresa (`/empresa/dashboard`)

### 3.1 Header da Empresa

| Elemento | Tipo | Ação |
|----------|------|------|
| Logo "VagasOeste" | Visual | Identidade |
| Sino de notificação (badge) | Botão | Vai para aba Candidatos |
| Avatar da empresa | Visual | Identidade |

### 3.2 Modal de Troca de Senha (primeiro acesso)

| Elemento | Tipo | Ação |
|----------|------|------|
| Campo "Nova senha" | Input | Preenche nova senha |
| Ícone olho (nova senha) | Toggle | Mostra/oculta senha |
| Campo "Confirmar senha" | Input | Confirma nova senha |
| Ícone olho (confirmar) | Toggle | Mostra/oculta senha |
| Medidor de força | Visual | Indica força da senha |
| Botão "Salvar nova senha e continuar" | Botão | Valida e libera acesso ao painel |

### 3.3 Abas do Painel da Empresa

| Elemento | Tipo | Ação |
|----------|------|------|
| Aba "Candidatos" (badge) | Toggle | Exibe aba de candidatos |
| Aba "Minhas Vagas" | Toggle | Exibe aba de vagas |
| Aba "Administrativo" | Toggle | Exibe aba administrativa |
| Banner de novos candidatos | Botão | Vai para aba Candidatos |
| Botão fechar banner (X) | Botão | Dispensa o banner |

### 3.4 Aba: Candidatos

| Elemento | Tipo | Ação |
|----------|------|------|
| Sub-aba "Todos os Candidatos" | Toggle | Exibe todos |
| Sub-aba "Favoritados" | Toggle | Exibe apenas favoritados |
| Filtro "Escolaridade" | Select | Filtra por escolaridade |
| Filtro "Sexo" | Select | Filtra por sexo |
| Filtro "Função (Vaga)" | Select | Filtra por vaga |
| Botão "Limpar filtros" | Botão | Remove filtros |
| Card de candidato | Botão | Seleciona e exibe detalhes |
| **Painel de detalhes do candidato** | | |
| Badge de status | Visual | Mostra status atual |
| Botão "Alterar status" | Botão | Abre modal de alteração de status |
| Botão "Histórico de status" | Toggle | Expande/colapsa linha do tempo |
| Botão "Ver detalhes" (solicitação) | Toggle | Expande/colapsa detalhes da solicitação |
| Botão "Favoritar" / "Favoritado" | Toggle | Adiciona/remove dos favoritos |
| Botão "Pré-Entrevista" | Botão | Abre modal de confirmação |
| Botão "Solicitar Contato" | Botão | Abre modal de confirmação |
| **Modal de alteração de status** | | |
| Botões de status (7 opções) | Toggle | Seleciona novo status |
| Campo "Observação" | Textarea | Adiciona nota ao status |
| Botão "Cancelar" | Botão | Fecha modal sem salvar |
| Botão "Salvar status" | Botão | Salva novo status com histórico |
| **Modal de confirmação (pré-entrevista/contato)** | | |
| Botão "Cancelar" | Botão | Fecha modal |
| Botão "Confirmar" | Botão | Envia solicitação ao admin |

### 3.5 Aba: Favoritados (ações em lote)

| Elemento | Tipo | Ação |
|----------|------|------|
| Botões de candidatos | Toggle | Seleciona/deseleciona para ação em lote |
| Botão "Solicitar Pré-entrevista (N)" | Botão | Abre modal de confirmação em lote |
| Botão "Solicitar Contato (N)" | Botão | Abre modal de confirmação em lote |
| Botão "Cancelar" (modal) | Botão | Fecha modal |
| Botão "Confirmar" (modal) | Botão | Envia solicitações em lote |

### 3.6 Aba: Minhas Vagas

| Elemento | Tipo | Ação |
|----------|------|------|
| Botão "Publicar nova vaga" | Botão | Abre formulário de nova vaga |
| Botão "Pausar" (vaga) | Botão | Pausa a vaga |
| Botão "Reativar" (vaga) | Botão | Reativa a vaga |
| Botão "Editar" (vaga) | Botão | Abre formulário de edição |
| Botão "Excluir" (vaga) | Botão | Remove a vaga |
| **Formulário de nova vaga — Passo 1** | | |
| Campos do formulário | Inputs/Selects | Preenchimento de dados |
| Botão "Próximo" | Botão | Avança para passo 2 |
| **Formulário de nova vaga — Passo 2** | | |
| Campos de descrição | Textareas | Preenchimento de texto |
| Botão "Voltar" | Botão | Retorna ao passo 1 |
| Botão "Publicar vaga" | Botão | Publica a vaga |

### 3.7 Aba: Administrativo (Solicitações)

| Elemento | Tipo | Ação |
|----------|------|------|
| Filtro "Tipo" | Select | Filtra por tipo de solicitação |
| Filtro "Status" | Select | Filtra por status |
| Card de solicitação | Toggle | Expande/colapsa detalhes |
| Botão "Ver detalhes" | Toggle | Mostra relato da pré-entrevista |

---

## 4. Painel Administrativo (`/admin`)

### 4.1 Sidebar de Navegação

| Elemento | Tipo | Ação |
|----------|------|------|
| Logo "VagasOeste" | Visual | Identidade |
| "Dashboard" | Link | Exibe módulo Dashboard |
| "Empresas" | Link | Exibe módulo Empresas |
| "Candidatos" | Link | Exibe módulo Candidatos |
| "Vagas" | Link | Exibe módulo Vagas |
| "Relatórios" | Link | Exibe módulo Relatórios |
| "Notificações" | Link | Exibe módulo Notificações |
| "Configurações" | Link | Exibe módulo Configurações |
| Botão "Sair" | Botão | Encerra sessão → `/login` |

### 4.2 Módulo: Empresas

| Elemento | Tipo | Ação |
|----------|------|------|
| Campo de busca | Input | Filtra empresas por nome, CNPJ ou email |
| Filtro "Setor" | Select | Filtra por setor |
| Aba "Todas" | Toggle | Exibe todas as empresas |
| Aba "Pré-cadastros Pendentes" (badge âmbar) | Toggle | Exibe apenas pendentes |
| Aba "Ativas" | Toggle | Exibe apenas ativas |
| Aba "Rejeitadas" | Toggle | Exibe apenas rejeitadas |
| Banner de alerta de pendentes | Botão | Vai para aba "Pré-cadastros Pendentes" |
| Card de empresa | Botão | Seleciona e exibe painel de detalhes |
| Botão "Aprovar cadastro" (empresa pendente) | Botão | Abre modal de aprovação com prévia de email |
| Botão "Rejeitar" (empresa pendente) | Botão | Abre modal de rejeição com motivos pré-definidos |
| **Modal de aprovação de empresa** | | |
| Toggle "Notificar por email" | Toggle | Ativa/desativa envio de email |
| Toggle "Notificar por WhatsApp" | Toggle | Ativa/desativa envio de WhatsApp |
| Botão "Confirmar aprovação" | Botão | Aprova empresa, publica vagas, envia email |
| Botão "Cancelar" | Botão | Fecha modal |
| **Modal de rejeição de empresa** | | |
| Botões de motivo pré-definido (7 opções) | Toggle | Seleciona motivo |
| Campo "Outro motivo" | Textarea | Motivo personalizado |
| Botão "Confirmar rejeição" | Botão | Rejeita empresa, envia email com motivo |
| Botão "Cancelar" | Botão | Fecha modal |
| **Painel de detalhes da empresa** | | |
| Botão "Aprovar cadastro" (painel) | Botão | Abre modal de aprovação |
| Botão "Rejeitar" (painel) | Botão | Abre modal de rejeição |

### 4.3 Módulo: Candidatos

| Elemento | Tipo | Ação |
|----------|------|------|
| Campo de busca | Input | Filtra candidatos por nome, email ou telefone |
| Filtro "Escolaridade" | Select | Filtra por escolaridade |
| Filtro "Sexo" | Select | Filtra por sexo |
| Filtro "PCD" | Select | Filtra por PCD (Sim/Não/Todos) |
| Botão "Exportar" | Botão | Exporta lista de candidatos |
| Card de candidato | Botão | Seleciona e exibe painel de detalhes completos |
| **Painel de detalhes do candidato** | | |
| Link "WhatsApp" | Link externo | Abre WhatsApp com número do candidato |
| Link "Email" | Link externo | Abre cliente de email com endereço do candidato |

### 4.4 Módulo: Vagas

| Elemento | Tipo | Ação |
|----------|------|------|
| Campo de busca | Input | Filtra vagas por título ou empresa |
| Filtro "Setor" | Select | Filtra por setor |
| Filtro "Contrato" | Select | Filtra por tipo de contrato |
| Aba "Todas" | Toggle | Exibe todas as vagas |
| Aba "Pendentes" (badge laranja) | Toggle | Exibe apenas pendentes de aprovação |
| Aba "Ativas" | Toggle | Exibe apenas ativas |
| Aba "Pausadas" | Toggle | Exibe apenas pausadas |
| Aba "Encerradas" | Toggle | Exibe apenas encerradas |
| Banner de alerta de pendentes | Botão | Vai para aba "Pendentes" |
| Card de vaga | Botão | Seleciona e exibe painel de detalhes |
| Botão "Aprovar e publicar" (vaga pendente) | Botão | Abre modal de aprovação com prévia de email |
| Botão "Reprovar" (vaga pendente) | Botão | Abre modal de reprovação com campo de motivo |
| **Modal de aprovação de vaga** | | |
| Botão "Aprovar e publicar" | Botão | Publica vaga, envia email para empresa |
| Botão "Cancelar" | Botão | Fecha modal |
| **Modal de reprovação de vaga** | | |
| Campo "Motivo da reprovação" | Textarea | Motivo obrigatório para a empresa corrigir |
| Botão "Reprovar vaga" | Botão | Reprova vaga, envia email com motivo |
| Botão "Cancelar" | Botão | Fecha modal |
| Botão "Pausar" (vaga ativa, painel) | Botão | Pausa a vaga |
| Botão "Ver Candidatos" (vaga ativa, painel) | Botão | Exibe candidatos da vaga |

### 4.5 Módulo: Relatórios

| Elemento | Tipo | Ação |
|----------|------|------|
| Seletor "7 dias" | Toggle | Filtra dados por período |
| Seletor "30 dias" | Toggle | Filtra dados por período |
| Seletor "90 dias" | Toggle | Filtra dados por período |
| Seletor "Tudo" | Toggle | Exibe todos os dados |
| Gráficos e barras | Visual | Exibição de dados (não clicáveis) |
| Tabela de resumo | Visual | Exibição de dados (não clicáveis) |

### 4.6 Módulo: Notificações

| Elemento | Tipo | Ação |
|----------|------|------|
| Aba "Histórico" | Toggle | Exibe histórico de notificações enviadas |
| Aba "WhatsApp" | Toggle | Exibe painel de integração WhatsApp (Evolution API) |
| Filtro "Tipo" | Select | Filtra por tipo de notificação |
| Filtro "Status" | Select | Filtra por status de envio |
| Botão "Nova notificação" | Botão | Abre formulário de nova notificação |
| **Formulário de nova notificação** | | |
| Toggle "Empresa" / "Candidato" | Toggle | Seleciona tipo de destinatário |
| Select "Tipo de Notificação" | Select | Seleciona tipo (varia por destinatário) |
| Campo "Nome do Destinatário" | Input | Preenche nome para personalizar mensagem |
| Campo "Email do Destinatário" | Input | Preenche email |
| Toggle "Enviar também pelo WhatsApp" | Toggle | Ativa/desativa envio WhatsApp via Evolution API |
| Campo "WhatsApp" (quando ativo) | Input | Preenche número com máscara (XX) XXXXX-XXXX |
| Campo "Título da Vaga" | Input | Preenche título para personalizar mensagem |
| Campo "Nome da Empresa" | Input | Preenche empresa para personalizar mensagem |
| Campo "Motivo" (rejected) | Input | Preenche motivo de rejeição (aparece em company_rejected/job_rejected) |
| Prévia Email | Visual | Exibe prévia da mensagem de email em tempo real |
| Prévia WhatsApp | Visual | Exibe prévia da mensagem WhatsApp formatada (aparece quando WhatsApp ativo) |
| Campo "Mensagem personalizada" | Textarea | Substitui mensagem padrão (máx 500 chars) |
| Botão "Cancelar" | Botão | Fecha modal |
| Botão "Enviar Notificação" | Botão | Dispara email e/ou WhatsApp |
| **Aba WhatsApp** | | |
| Cards de stats (Enviados/Pendentes/Falharam) | Visual | Exibe contadores de notificações WhatsApp |
| Banner de integração Evolution API | Visual | Exibe status (Modo Preview) e guia de configuração |
| Lista de últimas notificações WhatsApp | Visual | Histórico das 5 últimas com status |
| Card de notificação (histórico) | Botão | Seleciona e exibe detalhes no painel lateral |

### 4.7 Módulo: Configurações

| Elemento | Tipo | Ação |
|----------|------|------|
| Aba "Geral" | Toggle | Exibe configurações gerais |
| Aba "Notificações" | Toggle | Exibe toggles de notificação |
| Aba "Acessos" | Toggle | Exibe credenciais de demonstração |
| Aba "Design" | Toggle | Exibe personalização visual |
| **Aba Geral** | | |
| Campo "Nome da Plataforma" | Input | Edita nome |
| Campo "Email admin" | Input | Edita email |
| Campo "WhatsApp Administrativo" | Input | Edita número |
| Campo "Preço do Currículo" | Input | Edita valor |
| **Aba Notificações** | | |
| Toggle "Notificações automáticas" | Toggle | Ativa/desativa |
| Toggle "Notificar empresa ao receber candidato" | Toggle | Ativa/desativa |
| Toggle "Notificar candidato em ações" | Toggle | Ativa/desativa |
| **Aba Design** | | |
| Color Picker "Cor Principal" | Color Input | Seleciona cor via picker ou hex |
| Color Picker "Cor Principal Escura" | Color Input | Seleciona cor via picker ou hex |
| Color Picker "Cor Principal Clara" | Color Input | Seleciona cor via picker ou hex |
| Color Picker "Cor de Texto Principal" | Color Input | Seleciona cor via picker ou hex |
| Color Picker "Cor de Destaque (Accent)" | Color Input | Seleciona cor via picker ou hex |
| Color Picker "Cor dos Botões" | Color Input | Seleciona cor via picker ou hex |
| Color Picker "Texto dos Botões" | Color Input | Seleciona cor via picker ou hex |
| Color Picker "Fundo da Navbar" | Color Input | Seleciona cor via picker ou hex |
| Color Picker "Fundo do Footer" | Color Input | Seleciona cor via picker ou hex |
| Color Picker "Cor das Fontes" | Color Input | Seleciona cor via picker ou hex |
| Prévia de cores | Visual | Exibe botões e badges com as cores selecionadas em tempo real |
| Campo URL "Hero — Home" | Input | Insere URL da imagem hero da Home |
| Campo URL "Hero — Crie seu Currículo" | Input | Insere URL da imagem hero do currículo |
| Campo URL "Hero — Para Empresas" | Input | Insere URL da imagem hero de empresas |
| Botão "Ver prévia" (imagem) | Toggle | Exibe/oculta prévia da imagem inserida |
| Botão "Limpar URL" (X) | Botão | Remove a URL da imagem |
| Botão "Restaurar Design Padrão" | Botão | Reverte todas as cores e URLs para os valores originais |
| Botão "Salvar Configurações" | Botão | Salva todas as configurações da aba ativa |

---

## Resumo Quantitativo

| Área | Clicáveis estimados |
|------|-------------------|
| Site Público (Navbar + Footer) | ~15 |
| Home | ~10 |
| Listagem de Vagas | ~10 |
| Detalhe da Vaga + Modal | ~20 |
| Blog (listagem) | ~12 |
| Artigo do Blog | ~10 |
| Como Funciona | ~8 |
| Para Empresas | ~8 |
| Dicas de Vaga | ~12 |
| Login | ~10 |
| Cadastro | ~12 |
| Plataforma do Candidato (vagas + modal) | ~25 |
| Plataforma do Candidato (candidaturas) | ~8 |
| Plataforma do Candidato (currículo PDF) | ~15 |
| Plataforma do Candidato (notificações) | ~12 |
| Perfil do Candidato | ~12 |
| Plataforma da Empresa | ~45 |
| Painel Administrativo | ~30 |
| **Total estimado** | **~274** |
