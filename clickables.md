# VagasOeste — Mapa de Clicáveis

> Versão: 5.0 | 2026-04-26
> Atualizado com: abas Por Setor/Por Função, modal de localização, login multi-step,
> aba Segurança no perfil candidato, esqueci/redefinir senha, filtros /vagas refatorados,
> home plataforma alinhada ao site, interesse-empresa Supabase real, AdminCompanies Supabase real.

---

## Estrutura dos ambientes

1. **Site Público** (santarem.app) — acessível sem login
2. **Plataforma do Candidato** (app.santarem.app/plataforma) — após login candidato
3. **Plataforma da Empresa** (app.santarem.app/empresa/dashboard) — após login empresa + MFA
4. **Painel Administrativo** (app.santarem.app/vo-painel) — após login admin + MFA

**Nota Mobile-First:** todos os elementos com área de toque mínima 44px. Modais = bottom sheets em mobile.

---

## 1. Site Público

### 1.1 Navbar (todas as páginas)

| Elemento | Tipo | Ação |
|----------|------|------|
| Logo "VagasOeste" | Link | → `/` |
| "Vagas" | Link | → `/vagas` |
| "Blog" | Link | → `/blog` |
| "Crie seu Currículo" | Link | → `/crie-seu-curriculo` |
| "Como Funciona" | Link | → `/como-funciona` |
| "Para Empresas" | Link | → `/para-empresas` |
| Botão "Entrar" | Link | → `/login` |
| Botão "Cadastrar-se" | Link | → `/cadastro` |
| Ícone hambúrguer (mobile) | Toggle | Abre/fecha menu mobile (NavbarMobile.tsx) |

### 1.2 Footer (todas as páginas)

| Elemento | Tipo | Ação |
|----------|------|------|
| Logo "VagasOeste" | Link | → `/` |
| Links de navegação (3 colunas: Plataforma, Links, Contato) | Links | → respectivas rotas |
| Links de redes sociais | Links externos | Abre em nova aba |
| *(Newsletter removida em v4.0)* | — | — |

### 1.3 Home (`/`) — Hero

| Elemento | Tipo | Ação |
|----------|------|------|
| Selector "Estado" (HeroSearch) | Select | Popula cidades; reseta cidade ao trocar |
| Selector "Cidade" (HeroSearch) | Select | Habilitado após Estado selecionado |
| Selector "Setor" (HeroSearch) | Select | 8 setores disponíveis |
| Campo busca (HeroSearch) | Input | Cargo, área ou palavra-chave |
| Botão "Buscar Vagas" (HeroSearch) | Botão (submit) | → `/vagas?estado=X&cidade=Y&setor=Z&q=W` |
| Quick pills de setor (6 ícones) | Botão | → `/vagas?setor=NomeDoSetor` |

### 1.4 Home — Seção "Explore por Setor ou Função" (SectorCards island)

| Elemento | Tipo | Ação |
|----------|------|------|
| Aba "Por Setor" | Toggle | Exibe 8 cards de setores (estado padrão) |
| Aba "Por Função/Cargo" | Toggle | Exibe 8 cards de funções |
| Card de setor (ex: Saúde) | Botão | Abre modal de localização com nome do setor |
| Card de função (ex: Vendedor) | Botão | Abre modal de localização com nome da função |
| **Modal de localização** | | |
| Backdrop do modal | Clique | Fecha o modal |
| Botão X (fechar modal) | Botão | Fecha o modal |
| Radio "Pará" (Passo 1) | Label/radio | Seleciona estado → revela Passo 2 |
| Botão "Santarém" (Passo 2) | Botão | → `/vagas?setor=X&estado=Pará&cidade=Santarém` OU `?funcao=X&...` |

### 1.5 Listagem de Vagas (`/vagas`) — Filtros

| Elemento | Tipo | Ação |
|----------|------|------|
| **Barra principal** | | |
| Selector "Estado" | Select | Popula cidades; limpa cidade ao trocar |
| Selector "Cidade" | Select | Habilitado após Estado |
| Selector "Setor" | Select | Filtro de setor (estava em "Mais Filtros", agora principal) |
| **Busca + Mais Filtros** | | |
| Campo busca (texto) | Input | Filtra por título, área e descrição em tempo real |
| Botão X no campo busca | Botão | Limpa campo de busca |
| Botão "Mais filtros" | Toggle | Abre/fecha painel de filtros extras |
| Dropdown "Ordenar" | Select | Mais recentes / Maior salário / Mais procuradas |
| **Painel "Mais Filtros"** | | |
| Campo "Função / Cargo" | Input texto | Filtra vagas por j.title e j.area; botão X para limpar |
| Select "Tipo de Contrato" | Select | CLT, PJ, Temporário, Estágio, Freelance |
| Checkbox "Necessário CNH" | Label/checkbox (customizado) | Filtra vagas onde requirements contém 'cnh' |
| **Quick pills de setor** | | |
| Pill "Todos" | Toggle | Remove filtro de setor |
| Pill de setor (ex: Saúde) | Toggle | Ativa filtro de setor (mesmo estado do selector principal) |
| **Resultados** | | |
| Botão "Limpar filtros" (canto direito) | Botão | Limpa todos os filtros (estado, cidade, setor, busca, função, contrato, cnh) |
| Card de vaga | Link | → `/vagas/:id` |
| Botão "Limpar filtros" (empty state) | Botão | `clearAllFilters()` |

### 1.6 Detalhe da Vaga (`/vagas/:id`)

| Elemento | Tipo | Ação |
|----------|------|------|
| Breadcrumb "Início" | Link | → `/` |
| Breadcrumb "Vagas" | Link | → `/vagas` |
| Botão "Quero me Candidatar!" | Botão | Abre modal de candidatura (4 etapas) |
| FAQ accordion (5 itens) | Toggle | Abre/fecha resposta |
| **Modal candidatura — Etapa 1** | | |
| "Já tenho cadastro" | Botão | Avança para etapa de login |
| "Criar cadastro grátis" | Link | → `/cadastro` |
| "Cancelar" | Botão | Fecha modal |
| **Modal candidatura — Etapa 2 (Login inline)** | | |
| Campo email | Input | — |
| Campo senha + ícone olho | Input + Toggle | — |
| "Entrar e candidatar-se" | Botão | Autentica; avança para etapa 3 |
| "Voltar" | Botão | Retorna etapa 1 |
| **Modal candidatura — Etapa 3 (Confirmação)** | | |
| "Confirmar candidatura!" | Botão | Registra; avança para etapa 4 |
| "Cancelar" | Botão | Fecha modal |
| **Modal candidatura — Etapa 4 (Sucesso)** | | |
| "Ver minhas candidaturas" | Link | → `/plataforma` |
| "Ver mais vagas" | Link | Fecha e → `/vagas` |

### 1.7 Login (`/login`)

| Elemento | Tipo | Ação |
|----------|------|------|
| Logo VagasOeste | Link | → `/` |
| Selector tipo (Candidato / Empresa / Admin) | Toggle | Muda aparência e destino do login |
| Campo email | Input | — |
| Campo senha + ícone olho | Input + Toggle | — |
| **Link "Esqueci minha senha"** | Link | → `/esqueci-senha` (aparece para Candidato e Empresa) |
| Botão "Entrar como [Perfil]" | Botão (submit) | signInWithPassword → multi-step |
| **Step: change-password** | | |
| Campo nova senha + confirmar senha | Inputs | — |
| Medidor de força | Visual | Fraca/Razoável/Boa/Forte |
| Botão "Salvar nova senha e continuar" | Botão | updateUser({password}) → próximo step |
| **Step: enroll-mfa** | | |
| QR code (gerado via QRCode lib) | Imagem | Escanear no Google Authenticator |
| Campo código TOTP (6 dígitos) | Input | — |
| Botão "Verificar e ativar" | Botão | mfa.enroll confirm → próximo step |
| **Step: verify-mfa** | | |
| Campo código TOTP | Input | Mostra label "VagasOeste: Empresas" ou "VagasOeste: Candidato" |
| Botão "Verificar" | Botão | mfa.challengeAndVerify → navega para destino |
| "Cadastre-se grátis" (candidato) | Link | → `/cadastro` |

### 1.8 Esqueci Minha Senha (`/esqueci-senha`)

| Elemento | Tipo | Ação |
|----------|------|------|
| Logo + "Voltar ao login" | Link | → `/login` |
| Campo email | Input | — |
| Botão "Enviar link de recuperação" | Botão (submit) | resetPasswordForEmail → tela de sucesso (mesmo visual se email não existe) |
| **Tela de sucesso** | | |
| "Voltar ao login" | Link | → `/login` |

### 1.9 Redefinir Senha (`/redefinir-senha`)

| Elemento | Tipo | Ação |
|----------|------|------|
| *Tela de loading* | Visual | Aguarda PASSWORD_RECOVERY event (timeout 6s → "link expirado") |
| Campo nova senha + ícone olho | Input + Toggle | — |
| Campo confirmar senha | Input | — |
| Medidor de força | Visual | — |
| Botão "Salvar nova senha" | Botão (submit) | updateUser({password}) → USER_UPDATED event → navigate('/login') |
| *Tela "Link expirado"* | Visual | Aparece se PASSWORD_RECOVERY não disparar em 6s |
| "Solicitar novo link" | Link | → `/esqueci-senha` |

### 1.10 Blog, Como Funciona, Para Empresas, etc.

_(Sem mudanças v4.0 — consultar versão anterior do documento)_

---

## 2. Plataforma do Candidato

### 2.1 Header

| Elemento | Tipo | Ação |
|----------|------|------|
| Logo VagasOeste | Link | → `/plataforma` |
| Nome do usuário (user_metadata.full_name) | Visual | — |
| Ícone/avatar + hover revela "Sair" | Botão | signOut() → redirect para /login |
| Botão "Meu Perfil" | Link | → `/plataforma/perfil` |

### 2.2 Abas do Dashboard

| Elemento | Tipo | Ação |
|----------|------|------|
| Aba "Vagas Disponíveis" | Toggle | Exibe vagas |
| Aba "Minhas Candidaturas" | Toggle | Exibe candidaturas |
| Aba "Meu Currículo" | Toggle | Exibe builder de currículo |
| Aba "Notificações" (badge) | Toggle | Exibe notificações |

### 2.3 Aba: Vagas Disponíveis

_(sem mudanças v4.0 — mesmos filtros e VagaDetalheModal)_

### 2.4 Perfil do Candidato (`/plataforma/perfil`)

| Elemento | Tipo | Ação |
|----------|------|------|
| Botão "Voltar" | Link | → `/plataforma` |
| Aba "Dados Pessoais" | Toggle | Editar dados cadastrais |
| Aba "Cursos e Certificações" | Toggle | CRUD de cursos |
| **Aba "Segurança"** | Toggle | Exibe seção de senha e 2FA |
| **Seção Senha** | | |
| Botão "Redefinir senha" | Botão | resetPasswordForEmail(user.email) → tela de sucesso inline |
| **Seção 2FA (status: inativo)** | | |
| Botão "Ativar Autenticação de Dois Fatores" | Botão | Inicia enroll: gera QR "VagasOeste: Candidato" |
| **Flow de enroll** | | |
| QR code | Imagem | Escanear no autenticador |
| Campo código TOTP | Input | Digitar código do app |
| Botão "Confirmar ativação" | Botão | mfa.enroll verify → mfaStatus=ativo |
| Botão "Cancelar" | Botão | Cancela enroll, volta para status inativo |
| **Seção 2FA (status: ativo)** | | |
| Badge "2FA Ativo" | Visual | — |
| Botão "Desativar 2FA" | Botão | Inicia flow de disable |
| **Flow de disable** | | |
| Campo código TOTP atual | Input | — |
| Botão "Confirmar desativação" | Botão | mfa.challengeAndVerify → mfa.unenroll → mfaStatus=inativo |
| Botão "Cancelar" | Botão | Cancela disable |

---

## 3. Plataforma da Empresa

### 3.1 Header

| Elemento | Tipo | Ação |
|----------|------|------|
| Logo VagasOeste | Visual | Identidade |
| Sino de notificação (badge) | Botão | Vai para aba Candidatos |
| Email do usuário (user.email real) | Visual | — |
| Avatar + hover → ícone logout | Botão (signOut) | signOut() → redirect /login |

### 3.2 Aba: Administrativo — UserManagementSection (novo em v4.0)

| Elemento | Tipo | Ação |
|----------|------|------|
| Card "Gestor Principal" | Visual | Exibe email + badge MFA (Ativo/Inativo) |
| Badge MFA | Visual | Verde=Ativo / Cinza=Inativo |
| Botão "Redefinir senha" | Botão | resetPasswordForEmail(user.email) → feedback inline |
| Formulário "Convidar Colaborador" | | |
| Campo email do colaborador | Input | — |
| Select permissão (Administrador/Recrutador) | Select | — |
| Botão "Enviar convite" | Botão | Chama POST /v1/empresa/invite-user (pendente backend) |

---

## 4. Painel Administrativo

_(Sem mudanças v4.0 — consultar versão anterior do documento para detalhes completos)_

Principais ações:
- Módulo Empresas: aprovar/rejeitar pré-cadastros com email automático
- Módulo Vagas: aprovar/reprovar vagas pendentes
- Módulo Notificações: disparar email/WhatsApp via Evolution API
- Configurações → Design: color picker + imagens hero

---

## Resumo de mudanças v5.0 (2026-04-26)

| O que mudou | Versão anterior | Versão 5.0 |
|-------------|----------------|------------|
| Home plataforma (`/`) | Componentes genéricos | **8 seções alinhadas ao site Astro** |
| Hero plataforma | Estado · Cidade · Bairro | Estado · Cidade · **Setor** + quick tags com ícones |
| `/interesse-empresa` (plataforma) | POST readdy.ai (quebrado) | **INSERT Supabase `empresa_pre_cadastros`** |
| AdminCompanies | mockAdminCompanies estático | **Leitura/escrita real em `empresa_pre_cadastros`** |
| RLS admin policies | `admin_users` referenciada diretamente | **`is_admin()` SECURITY DEFINER** |
| Deploy | Vercel com erro RLS | **Vercel build passa — 200 em todas tabelas** |

## Resumo de mudanças v4.0 (2026-04-24)

| O que mudou | Versão anterior | Versão 4.0 |
|-------------|----------------|------------|
| Filtro Hero | Estado · Cidade · **Bairro** | Estado · Cidade · **Setor** |
| Seção Setores na Home | Grid estático de links | Island SectorCards com **abas + modal** |
| Fundo dos cards de setor | Cores temáticas por setor | **gray-50 uniforme** |
| Ícone nos cards | Cor temática por setor | **#065f46 uniforme** |
| Texto nome no card | text-sm (14px) | **text-base (16px)** |
| Filtros /vagas barra principal | Estado · Cidade · **Bairro** | Estado · Cidade · **Setor** |
| "Mais Filtros" /vagas | Setor · Bairro · Tipo Contrato | **Função/Cargo · Tipo Contrato · Necessário CNH?** |
| Login | step único | **multi-step** (credentials→change-pw→enroll-mfa→verify-mfa) |
| Rotas novas | — | `/esqueci-senha`, `/redefinir-senha` |
| Perfil candidato | Dados Pessoais · Cursos | + **aba Segurança** (senha + 2FA) |
| Header da plataforma candidato | genérico | **nome real + signOut** |
| Footer | 4 colunas com newsletter | **3 colunas sem newsletter** |

---

## Clicáveis da Home da Plataforma (app.santarem.app/) — v5.0

### HeroSection
| Elemento | Tipo | Ação |
|----------|------|------|
| Select "Estado" | Select | Popula cidades; reseta cidade ao trocar |
| Select "Cidade" | Select | Habilitado após Estado selecionado |
| Select "Setor" | Select | 8 setores |
| Campo busca | Input | Cargo, área ou palavra-chave |
| Botão "Buscar Vagas" | Botão (submit) | navigate(`/vagas?estado=X&cidade=Y&setor=Z&q=W`) |
| Quick pill de setor (6 ícones) | Botão | navigate(`/vagas?setor=X`) |

### SectorSection
| Elemento | Tipo | Ação |
|----------|------|------|
| Aba "Por Setor" | Toggle | Exibe 8 cards de setores |
| Aba "Por Função" | Toggle | Exibe 8 cards de funções |
| Card de setor/função | Botão | navigate(`/vagas?setor=X`) ou `?area=X` |

### JobsSection
| Elemento | Tipo | Ação |
|----------|------|------|
| Card de vaga | Botão | navigate(`/vagas/:id`) |
| "Ver todas as vagas" | Link | → `/vagas` |

### CTASection (smart — varia por estado de autenticação)
| Estado | Botão principal | Ação |
|--------|----------------|------|
| Não logado | "Criar conta grátis" | navigate(`/cadastro`) |
| Logado (candidato) | "Ir para o meu painel" | navigate(`/plataforma`) |
| Botão secundário | "Ver vagas" | navigate(`/vagas`) — sempre visível |

### Módulo Admin — Empresas (v5.0)
| Elemento | Tipo | Ação |
|----------|------|------|
| Aba "Pré-Cadastros Pendentes" | Toggle | Lista de `empresa_pre_cadastros` com status='pendente' |
| Botão "Ver detalhes" | Botão | Abre `CompanyDetailPanel` com dados do pré-cadastro |
| Botão "Aprovar" | Botão | UPDATE status='aprovado' no Supabase + fecha modal |
| Botão "Rejeitar" | Botão | UPDATE status='rejeitado' + textarea motivação + fecha modal |
