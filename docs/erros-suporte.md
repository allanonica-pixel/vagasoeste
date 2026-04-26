---
name: VagasOeste — Mapeamento de Erros para Suporte
description: Tabela de todos os erros apresentados ao usuário com o erro técnico correspondente, localização no código e orientação de suporte.
updatedAt: 2026-04-26
---

# VagasOeste — Mapeamento de Erros para Suporte

> **Como usar este documento:** quando um usuário entrar em contato reportando um erro, localize a mensagem que ele viu na coluna **"Mensagem ao usuário"**, consulte a coluna **"Erro técnico"** para entender a causa raiz e use a coluna **"Orientação de suporte"** para guiar o atendimento.

---

## 1. Cadastro de Candidato (`/cadastro`)

| # | Mensagem ao usuário | Erro técnico | Arquivo | Orientação de suporte |
|---|---|---|---|---|
| C01 | "Este e-mail já está cadastrado. Tente fazer login." | `User already registered` / `already been registered` — Supabase Auth | `cadastro/page.tsx` | Usuário tentou cadastrar um e-mail já existente. Orientar a ir para `/login` ou `/esqueci-senha`. |
| C02 | "Tente novamente — o volume de cadastros pelo sistema está elevado no momento." | `email rate limit exceeded` — Supabase limita envios de e-mail de confirmação (plano Free: 3/hora; Pro: varia) | `cadastro/page.tsx` | Aguardar alguns minutos e tentar novamente. Em produção com volume alto, verificar configuração de SMTP customizado no Supabase Dashboard → Authentication → SMTP. |
| C03 | "Não foi possível enviar o código. Verifique sua conexão e tente novamente." | Fetch falhou para `POST /v1/interesse/send-code` — API offline, timeout ou rede do usuário | `cadastro/page.tsx` | Verificar se a API está no ar (`GET /health`). Se API online, problema é de rede/dispositivo do usuário. |
| C04 | "Código inválido ou expirado. Solicite um novo código." | `verify-code` retornou não-ok — código OTP incorreto ou passou dos 10 minutos de validade | `cadastro/page.tsx` | Pedir ao usuário para clicar em "Reenviar código" e digitar o novo código em até 10 minutos. |
| C05 | "Erro ao verificar código. Tente novamente." | Exceção de rede ao chamar `POST /v1/interesse/verify-code` | `cadastro/page.tsx` | Mesmo tratamento do C03. |
| C06 | "Nome obrigatório" | Campo `fullName` vazio no Step 1 | `cadastro/page.tsx` (validateStep1) | Validação de formulário no frontend. |
| C07 | "Email inválido" | Campo `email` vazio ou sem formato `\S+@\S+\.\S+` | `cadastro/page.tsx` (validateStep1) | Validação de formulário no frontend. |
| C08 | "WhatsApp obrigatório" / "Número inválido. Use o formato (XX) XXXXX-XXXX" | Campo `phone` vazio ou não passa em `isValidBrazilPhone()` | `cadastro/page.tsx` (validateStep1) | Validação de formulário no frontend. |
| C09 | "Selecione a categoria da CNH" | `hasCNH = 'sim'` mas `cnhCategory` vazio | `cadastro/page.tsx` (validateStep1) | Validação de formulário no frontend. |
| C10 | "Por segurança, não inclua [tipo]. As empresas falam com você apenas pela plataforma…" | `validateFreeText()` detectou: CPF, CNPJ, telefone, e-mail, URL, plataforma de contato, handle `@`, provedor de e-mail | `cadastro/page.tsx` (validateFreeText) | Explicar ao usuário que dados de contato são protegidos — empresas só contatam pela plataforma. Não é um erro técnico. |
| C11 | "Detectamos uma possível frase de contato direto. Lembre-se: as empresas só podem te contatar pela plataforma." | `validateFreeText()` detectou frase suspeita (WARN) mas não bloqueou | `cadastro/page.tsx` (validateFreeText) | Aviso informativo. Não impede o cadastro. |
| C12 | "Selecione ao menos uma disponibilidade" | `availability[]` vazio no Step 2 | `cadastro/page.tsx` (validateStep2) | Validação de formulário no frontend. |
| C13 | "Senha deve ter ao menos 6 caracteres" | `password.length < 6` no Step 5 | `cadastro/page.tsx` (validateStep5) | Validação de formulário no frontend. |
| C14 | "Senhas não conferem" | `password !== confirmPassword` | `cadastro/page.tsx` (validateStep5) | Validação de formulário no frontend. |
| C15 | "Título/Cargo obrigatório" | Campo `title` vazio ao adicionar experiência | `cadastro/page.tsx` (addExperience) | Validação de formulário no frontend. |
| C16 | `Data de conclusão obrigatória (ou marque "Emprego atual")` | `endDate` vazio e `current = false` na experiência | `cadastro/page.tsx` (addExperience) | Validação de formulário no frontend. |
| C17 | "Título do curso obrigatório" / "Data de início obrigatória" / "Data de conclusão obrigatória" | Campos obrigatórios do formulário de curso ausentes | `cadastro/page.tsx` (addCourse) | Validação de formulário no frontend. |

---

## 2. Login — Candidato e Empresa (`/login`)

| # | Mensagem ao usuário | Erro técnico | Arquivo | Orientação de suporte |
|---|---|---|---|---|
| L01 | "Email ou senha incorretos. (N/5 tentativas)" | Supabase Auth retornou erro de credenciais; contador de tentativas local atingiu < 5 | `login/page.tsx` | Usuário pode estar usando o e-mail/senha errados. Orientar `/esqueci-senha`. |
| L02 | "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente." | Contador local atingiu 5 tentativas; Supabase pode também retornar `over_email_send_rate_limit` | `login/page.tsx` | Aguardar 5–15 minutos. Se persistir, verificar se conta existe no Supabase Dashboard → Authentication → Users. |
| L03 | "Sua conta não tem acesso à plataforma de empresas. Verifique o e-mail ou entre em contato." | `signIn` ok mas `role` retornou diferente de `empresa` ou `admin` | `login/page.tsx` | Usuário de role candidato tentando entrar no painel empresa. Verificar `raw_user_meta_data.role` no Supabase. |
| L04 | "Erro ao configurar autenticador. Tente novamente." | `supabase.auth.mfa.enroll()` retornou erro — geralmente problema de rede ou sessão expirada | `login/page.tsx` | Pedir para o usuário sair e entrar novamente. Se persistir, verificar logs Supabase. |
| L05 | "Erro ao iniciar verificação MFA. Tente novamente." | `supabase.auth.mfa.challenge()` falhou — sessão pode ter expirado | `login/page.tsx` | Recarregar a página e tentar novamente. |
| L06 | "Código incorreto. Verifique o app e tente novamente." | `supabase.auth.mfa.verify()` retornou `invalid_totp` — código TOTP errado ou horário do dispositivo desincronizado | `login/page.tsx` | Verificar se o horário do smartphone está sincronizado (automático). TOTP é sensível a drift de relógio (>30s). |
| L07 | "Código incorreto ou expirado. Aguarde o próximo código e tente novamente." | `verify-mfa` — mesmo erro do L06, etapa de verificação pós-enroll | `login/page.tsx` | Mesmo tratamento do L06. |
| L08 | "A senha deve ter pelo menos 8 caracteres." | Validação local na troca de senha obrigatória (first access) | `login/page.tsx` | Validação de formulário no frontend. |
| L09 | "Use pelo menos uma letra maiúscula e um número." | Validação de força de senha local | `login/page.tsx` | Validação de formulário no frontend. |
| L10 | "As senhas não coincidem." | `newPassword !== confirmPassword` | `login/page.tsx` | Validação de formulário no frontend. |
| L11 | "Erro ao salvar nova senha. Tente novamente." | `supabase.auth.updateUser()` falhou — possível sessão expirada | `login/page.tsx` | Pedir ao usuário para recarregar e tentar novamente. Se persistir, resetar pelo painel Supabase. |

---

## 3. Login Admin (`/acesso-restrito`)

| # | Mensagem ao usuário | Erro técnico | Arquivo | Orientação de suporte |
|---|---|---|---|---|
| A01 | "Credenciais inválidas. (N/5 tentativas)" | Supabase Auth retornou erro; role != `admin` | `acesso-restrito/page.tsx` | Verificar credenciais. Apenas usuários com `role = admin` têm acesso. |
| A02 | "Muitas tentativas incorretas. Tente novamente mais tarde." | 5 tentativas locais esgotadas | `acesso-restrito/page.tsx` | Aguardar ou contato direto (acesso interno). |
| A03 | "Erro ao iniciar desafio MFA. Tente novamente." | `mfa.challenge()` falhou | `acesso-restrito/page.tsx` | Recarregar e tentar. Se persistir, verificar se o factor MFA está ativo para o usuário admin no Supabase. |
| A04 | "Erro ao gerar QR code MFA. Tente novamente." | `mfa.enroll()` falhou | `acesso-restrito/page.tsx` | Recarregar e tentar. |
| A05 | "Código incorreto. Verifique o app autenticador e tente novamente." | `mfa.verify()` retornou erro | `acesso-restrito/page.tsx` | Mesmo tratamento do L06 — verificar horário do dispositivo. |
| A06 | "Código incorreto ou expirado. Aguarde o próximo código e tente novamente." | Código TOTP expirado (janela de 30s passou) | `acesso-restrito/page.tsx` | Aguardar o próximo código no app autenticador e tentar de imediato. |

---

## 4. Esqueci minha senha (`/esqueci-senha`)

| # | Mensagem ao usuário | Erro técnico | Arquivo | Orientação de suporte |
|---|---|---|---|---|
| E01 | "Erro ao processar solicitação. Tente novamente em alguns minutos." | `resetPasswordForEmail()` falhou com erro diferente de rate limit | `esqueci-senha/page.tsx` | Verificar se o e-mail existe no Supabase. O sistema intencionalmente não revela se o e-mail existe (segurança). |
| E02 | *(sem mensagem de erro — tela de sucesso é exibida mesmo se email não existir)* | Rate limit de email (`Email rate limit exceeded`) — silenciado intencionalmente para não revelar existência da conta | `esqueci-senha/page.tsx` | Se o usuário não receber o e-mail: aguardar alguns minutos (rate limit) ou verificar spam. |

---

## 5. Redefinir senha (`/redefinir-senha`)

| # | Mensagem ao usuário | Erro técnico | Arquivo | Orientação de suporte |
|---|---|---|---|---|
| R01 | "A senha deve ter pelo menos 8 caracteres." | Validação local | `redefinir-senha/page.tsx` | Validação de formulário no frontend. |
| R02 | "Use pelo menos uma letra maiúscula e um número." | Validação local de força | `redefinir-senha/page.tsx` | Validação de formulário no frontend. |
| R03 | "As senhas não coincidem." | `password !== confirmPassword` | `redefinir-senha/page.tsx` | Validação de formulário no frontend. |
| R04 | "Erro ao redefinir senha. O link pode ter expirado. Solicite um novo." | `supabase.auth.updateUser()` falhou — link de recuperação expirado (padrão: 1 hora) ou já usado | `redefinir-senha/page.tsx` | Usuário deve ir a `/esqueci-senha` e solicitar um novo link. |

---

## 6. Perfil do Candidato — Aba Segurança (`/plataforma/perfil`)

| # | Mensagem ao usuário | Erro técnico | Arquivo | Orientação de suporte |
|---|---|---|---|---|
| P01 | "Erro ao iniciar configuração. Tente novamente." | `mfa.enroll()` falhou | `CandidatoPerfilPage.tsx` | Recarregar a página e tentar novamente. |
| P02 | "Erro ao criar desafio." | `mfa.challenge()` falhou | `CandidatoPerfilPage.tsx` | Recarregar e tentar. |
| P03 | "Código incorreto. Verifique o app e tente novamente." | `mfa.verify()` retornou inválido | `CandidatoPerfilPage.tsx` | Verificar horário do dispositivo (mesmo que L06). |
| P04 | "Erro ao remover 2FA. Tente novamente." | `mfa.unenroll()` ou verify falhou ao desativar 2FA | `CandidatoPerfilPage.tsx` | Recarregar e tentar. Se persistir, verificar no Supabase se o factor ainda está listado. |

---

## 7. Empresa — Painel (`/empresa/...`)

| # | Mensagem ao usuário | Erro técnico | Arquivo | Orientação de suporte |
|---|---|---|---|---|
| EM01 | "A senha deve ter pelo menos 8 caracteres." | Validação local no modal de troca de senha | `ChangePasswordModal.tsx` | Validação de formulário no frontend. |
| EM02 | "As senhas não coincidem." | `newPassword !== confirmPassword` | `ChangePasswordModal.tsx` | Validação de formulário no frontend. |
| EM03 | "A nova senha não pode ser igual à senha provisória." | Usuário tentou reusar a senha temporária de primeiro acesso | `ChangePasswordModal.tsx` | Validação de negócio — orientar a escolher uma senha diferente. |

---

## 8. API — OTP WhatsApp (`/v1/interesse/*`)

> Estes erros são retornados pela API Hono e exibidos ao usuário no modal OTP do `/cadastro` e no formulário `interesse-empresa`.

| # | Resposta da API | Erro técnico | Arquivo | Orientação de suporte |
|---|---|---|---|---|
| API01 | `"Número de WhatsApp inválido."` (HTTP 400) | Número não passou na validação do backend | `services/api/routes/interesse.ts` | Usuário digitou número com formato incorreto. |
| API02 | `"Erro interno. Tente novamente."` (HTTP 500) — ao enviar OTP | Falha ao inserir em `otp_codes` no Supabase | `services/api/routes/interesse.ts` | Verificar logs da API no Fly.io (`fly logs --app vagasoeste-api`). Pode ser problema de conexão com o banco. |
| API03 | `"Código inválido ou expirado."` (HTTP 400) — ao verificar OTP | OTP não encontrado, já usado, ou passou dos 10 minutos | `services/api/routes/interesse.ts` | Pedir ao usuário para solicitar novo código. |
| API04 | `"Erro interno. Tente novamente."` (HTTP 500) — ao criar sessão pós-OTP | Falha ao inserir sessão em `otp_codes` | `services/api/routes/interesse.ts` | Verificar logs da API. |
| API05 | `"Payload inválido."` (HTTP 400) — no submit | Body da requisição malformado ou ausente | `services/api/routes/interesse.ts` | Erro raro em produção — pode indicar modificação de request por extensão de browser. |
| API06 | `"Erro ao salvar. Tente novamente."` (HTTP 500) — no submit | Falha ao inserir em `empresa_pre_cadastros` | `services/api/routes/interesse.ts` | Verificar logs da API e conexão com Supabase. |

---

## Referência rápida — logs e ferramentas

| Onde procurar | Como acessar |
|---|---|
| Usuários não confirmados | Supabase Dashboard → Authentication → Users → filtrar por "Unconfirmed" |
| Role do usuário | Supabase Dashboard → Authentication → Users → clicar no usuário → `raw_user_meta_data` |
| Logs da API (produção) | `fly logs --app vagasoeste-api` |
| Logs da API (staging) | `fly logs --app vagasoeste-api-staging` |
| OTPs gerados (dev) | Terminal da API: `npm run dev` em `services/api/` — código aparece no console |
| Rate limit de email Supabase | Supabase Dashboard → Authentication → Configuration → "Rate limits" |
| SMTP customizado | Supabase Dashboard → Authentication → SMTP Settings |
| Factors MFA de um usuário | Supabase Dashboard → Authentication → Users → clicar no usuário → "MFA Factors" |

---

## Convenção para novos erros

Ao adicionar uma nova mensagem de erro no código, seguir o padrão:

1. **Nunca exibir erro técnico bruto** — sempre mapear para mensagem amigável em português
2. **Logar o erro técnico** no console/Sentry para rastreamento
3. **Adicionar linha neste arquivo** com o código sequencial da seção correspondente
4. **Commit message sugerido:** `fix(erros): mapeia [descrição] para mensagem amigável — ver erros-suporte.md #XX`
