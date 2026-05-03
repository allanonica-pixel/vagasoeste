# ADR 0002 — Pausa da Fase 1 (SEO) para fix urgente do fluxo de aprovação de empresa

**Status:** aceito
**Data:** 2026-05-03
**Decisores:** PO + Tech Lead

---

## Contexto

Durante teste manual da Fase 1 (SEO técnico do site), o PO descobriu **3 bugs críticos** no fluxo de aprovação de empresa:

1. **"Aprovar cadastro" não envia e-mail** — frontend faz `UPDATE` direto em `empresa_pre_cadastros` via Supabase client e mostra toast mentindo que enviou e-mail. Nenhum endpoint backend é chamado.
2. **Forgot-password não acha empresa aprovada** — lookup busca em `candidates`/`companies`/`admin_users`, mas empresa3 só existe em `empresa_pre_cadastros` porque a aprovação não migrou pra `companies`.
3. **Admin pode "aprovar" empresa que nunca ativou o pré-cadastro** — semântica errada. Empresa só pode ser aprovada após ter clicado no link de e-mail de ativação (etapa 1) e existir em `companies` com status `parcial`.

Investigação SQL no DEV confirmou que empresa3@onica.com.br está num **estado fantasma**:
- `empresa_pre_cadastros.status = 'aprovado'` (admin clicou aprovar — UPDATE direto)
- `auth.users.email_confirmed_at = NULL` (e-mail nunca foi confirmado)
- `companies` — **não existe row** (aprovação não migrou)

Resultado: empresa visualmente "aprovada" no painel mas **sem capacidade real** de logar, recuperar senha ou publicar vagas.

Como esses bugs **bloqueiam o fluxo principal do produto** (empresa cadastra → admin aprova → empresa publica vagas), a Fase 1 (SEO técnico) é pausada temporariamente.

---

## Decisão

**Pausar a Fase 1 no estado atual (90% concluído):**
- ✅ Bloco A (schemas globais) entregue
- ✅ Bloco B parcial (self-host fonts/icons + preload + lazy hydration) entregue
- ✅ Bloco C (cache headers + CSP) entregue
- ⏸️ Bloco B4-B6 (Image otimizado) — depende de assets `og-default.jpg`, `logo.png`, `apple-touch-icon.png`
- ⏸️ Bloco D (Lighthouse benchmark + validação JobPosting) — execução do PO

**Abrir Sprint Bugfix Aprovação Empresa** com escopo cirúrgico:

1. Criar endpoint `POST /v1/admin/companies/:id/aprovar` que valida ativação prévia, atualiza `companies.status` e `jobs.status`, e dispara e-mail de aprovação (e-mail real depende de SMTP transacional — registrado como dívida).
2. Criar endpoint `POST /v1/admin/companies/:id/rejeitar` análogo, com motivo no e-mail.
3. Adicionar `empresa_pre_cadastros.contact_email` no lookup do forgot-password (defesa em profundidade).
4. Atualizar `AdminCompanies.tsx` pra chamar os endpoints novos em vez de UPDATE direto, e mostrar botão "Aprovar" só pra empresas que **já ativaram** (têm `ativado_em IS NOT NULL`).
5. PO executa cleanup manual do estado fantasma da empresa3 e valida fluxo end-to-end.

**Reabrir Fase 1** assim que sprint bugfix fechar, pra finalizar Bloco B (assets) e Bloco D (Lighthouse).

**Abrir Fase 2 — "Marketplace Operacional"** com features adicionais identificadas durante o relato do PO:
- Pausar vaga com limpeza de candidaturas + e-mail de aviso ao candidato
- Limites de candidaturas por empresa (admin define) e por vaga (empresa configura padrão e por-vaga)

---

## Consequências

### Positivas
- Fluxo crítico do produto volta a funcionar antes de continuar polimento SEO
- Estado fantasma como o da empresa3 fica impossível (validação no endpoint impede aprovação prematura)
- Forgot-password ganha defesa em profundidade
- Fase 1 retorna com escopo bem definido (só Bloco B4-B6 + Bloco D)

### Negativas
- Atraso na finalização da Fase 1 (estimado: 2h de fix + retomada)
- Commits "fora de fase" no histórico — ADR registra a justificativa

### Dívidas técnicas registradas
- **E-mail real de aprovação/rejeição** depende de SMTP transacional (Resend, SendGrid, ou nodemailer com SMTP custom do OnicaSistemasPro). Bugfix imediato apenas registra a aprovação no banco e marca `email_pending: true`. PO recebe banner no painel admin "✅ Aprovação registrada — e-mail será enviado quando integração SMTP transacional for habilitada". Atacar quando a Fase 2 abrir.
- **Cleanup manual do estado fantasma** da empresa3 — operação one-off no SQL Editor. Não vira ferramenta automatizada.

---

## Alternativas consideradas

### A) Continuar Fase 1 e fazer bugfix em paralelo
Descartada — bugfix toca em arquivos que não tem relação com Fase 1, e fazer dois pacotes simultâneos aumenta risco de commit confuso.

### B) Embutir as features novas (pause vaga + limites) no bugfix
Descartada — features novas pedem migration nova, UI nova nos 2 painéis, e e-mail transacional configurado. Bugfix deve ser cirúrgico. Features ficam em Fase 2.

### C) Esperar Resend/SMTP transacional configurado antes de fixar
Descartada — fluxo principal já está quebrado. Banco precisa voltar a estado consistente agora; e-mail é melhoria incremental.

---

## Documentos relacionados

- `docs/fases/001-seo-tecnico-site.md` — fase pausada
- `docs/fases/002-marketplace-operacional.md` — fase futura com pause vaga + limites
- `docs/PLANO_MESTRE.md` — atualizado com estado de pausa
