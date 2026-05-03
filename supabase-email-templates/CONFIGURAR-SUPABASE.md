# Templates de E-mail — Configuração no Supabase

## Onde configurar

Supabase Dashboard → **Authentication** → **Email Templates**

---

## 1. Confirmar Cadastro (candidatos e empresas)

**Template:** `Confirm signup`  
**Subject:** `Confirme seu Cadastro`  
**Body:** conteúdo de `confirmation.html`

> O mesmo template serve para candidatos e empresas — o conteúdo é idêntico para ambos os casos.

---

## 2. Redefinir Senha (candidatos e empresas)

**Template:** `Reset password`  
**Subject:** `Recuperar Senha`  
**Body:** conteúdo de `recovery.html`

O template detecta automaticamente o papel do usuário via `{{ .Data.role }}`:

| Papel | Nome exibido |
|---|---|
| `candidato` | `{{ .Data.first_name }}` (primeiro nome, armazenado no cadastro) |
| `empresa` | `{{ .Data.responsavel_nome }}` (nome do responsável) |

---

## Variáveis Supabase usadas

| Variável | Descrição |
|---|---|
| `{{ .ConfirmationURL }}` | Link de ação gerado pelo Supabase (confirmação ou reset) |
| `{{ .SiteURL }}` | URL do site — configurar em Auth → URL Configuration → Site URL |
| `{{ .Data.role }}` | `"candidato"` ou `"empresa"` — definido em `raw_user_meta_data` |
| `{{ .Data.first_name }}` | Primeiro nome do candidato — salvo no signUp do cadastro |
| `{{ .Data.full_name }}` | Nome completo do candidato (fallback) |
| `{{ .Data.responsavel_nome }}` | Nome do responsável da empresa (fallback: "usuário") |

---

## Configuração do Site URL (obrigatório)

Authentication → URL Configuration:

- **Site URL:** `https://app.santarem.app`
- **Redirect URLs:** adicionar as URLs abaixo (uma por linha):
  - `https://app.santarem.app/**`
  - `http://localhost:3001/**`  ← para desenvolvimento local

> O código passa `emailRedirectTo` dinamicamente (`window.location.origin + "/confirmacao-email"`),
> então funciona em dev e prod sem configuração extra — desde que o domínio esteja na lista acima.

---

## SMTP (Resend) — já configurado conforme migration script

Settings → Auth → SMTP:

| Campo | Valor |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| User | `resend` |
| Password | `<RESEND_API_KEY>` |
| From email | `noreply@santarem.app` |
| From name | `VagasOeste` |
