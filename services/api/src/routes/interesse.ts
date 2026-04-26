/**
 * VagasOeste — Pré-cadastro de empresas (interesse)
 *
 * Fluxo:
 *  1. POST /v1/interesse/send-code   → gera OTP, envia via WhatsApp (stub), retorna número mascarado
 *  2. POST /v1/interesse/verify-code → valida OTP → retorna sessionId (UUID)
 *  3. POST /v1/interesse/submit      → valida sessionId + salva pré-cadastro
 */

import { Hono } from 'hono';
import { supabaseAdmin } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';

export const interesseRouter = new Hono();

// ── Utilitários ────────────────────────────────────────────────────────────────

/** Gera código OTP numérico de 6 dígitos */
function gerarOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Máscara do telefone para exibição: (93) 9 9999-9999 */
function mascaraTelefone(digits: string): string {
  if (digits.length === 11)
    return `(${digits.slice(0,2)}) ${digits[2]} ${digits.slice(3,7)}-${digits.slice(7)}`;
  if (digits.length === 10)
    return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  return digits;
}

/**
 * Envia mensagem WhatsApp com o código OTP.
 * TODO: Substituir pelo provider real (Evolution API, Z-API, Twilio, Meta Cloud API…)
 */
async function enviarWhatsApp(phone: string, codigo: string): Promise<void> {
  const mensagem = `VagasOeste — Seu código de verificação é: *${codigo}*\n\nVálido por 10 minutos. Não compartilhe com ninguém.`;

  // ── Stub de desenvolvimento ──────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    logger.info({ phone, codigo, mensagem }, '📱 [WhatsApp STUB] Código que seria enviado');
    return; // remove este bloco ao integrar o provider real
  }

  // ── Integração real (exemplo com Evolution API) ──────────────────────────
  // const res = await fetch(`${process.env.WHATSAPP_API_URL}/message/sendText/vagasoeste`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     apikey: process.env.WHATSAPP_API_KEY ?? '',
  //   },
  //   body: JSON.stringify({ number: `55${phone}`, textMessage: { text: mensagem } }),
  // });
  // if (!res.ok) throw new Error('Falha ao enviar WhatsApp');
}

// ── Middleware: valida Content-Type ───────────────────────────────────────────
interesseRouter.use('*', async (c, next) => {
  if (c.req.method !== 'GET' && !c.req.header('content-type')?.includes('application/json')) {
    return c.json({ error: 'Content-Type deve ser application/json' }, 415);
  }
  await next();
});

// ── POST /v1/interesse/send-code ──────────────────────────────────────────────
interesseRouter.post('/send-code', async (c) => {
  let body: { phone?: string } = {};
  try { body = await c.req.json(); } catch { /* body vazio */ }
  const raw = (body.phone ?? '').replace(/\D/g, '');

  if (raw.length < 10 || raw.length > 11) {
    return c.json({ error: 'Número de WhatsApp inválido.' }, 400);
  }

  const codigo   = gerarOTP();
  const expira   = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  // Invalida OTPs anteriores pendentes deste número
  await supabaseAdmin
    .from('otp_codes')
    .update({ used: true })
    .eq('phone', raw)
    .eq('type', 'otp')
    .eq('used', false);

  // Persiste novo OTP
  const { error } = await supabaseAdmin.from('otp_codes').insert({
    phone:      raw,
    code:       codigo,
    type:       'otp',
    expires_at: expira.toISOString(),
  });

  if (error) {
    logger.error({ error }, '[interesse] Erro ao salvar OTP');
    return c.json({ error: 'Erro interno. Tente novamente.' }, 500);
  }

  // Envia via WhatsApp
  try {
    await enviarWhatsApp(raw, codigo);
  } catch (err) {
    logger.error({ err }, '[interesse] Falha ao enviar WhatsApp');
    // Não bloqueia — o usuário ainda pode tentar pelo suporte
  }

  return c.json({ success: true, maskedPhone: mascaraTelefone(raw) });
});

// ── POST /v1/interesse/verify-code ────────────────────────────────────────────
interesseRouter.post('/verify-code', async (c) => {
  let body: { phone?: string; code?: string } = {};
  try { body = await c.req.json(); } catch { /* body vazio */ }
  const raw  = (body.phone ?? '').replace(/\D/g, '');
  const code = (body.code ?? '').trim();

  if (!raw || !code) {
    return c.json({ error: 'Dados incompletos.' }, 400);
  }

  // Busca OTP válido
  const { data, error } = await supabaseAdmin
    .from('otp_codes')
    .select('id')
    .eq('phone', raw)
    .eq('code', code)
    .eq('type', 'otp')
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return c.json({ error: 'Código inválido ou expirado.' }, 400);
  }

  // Marca OTP como usado
  await supabaseAdmin.from('otp_codes').update({ used: true }).eq('id', data.id);

  // Cria sessão temporária (30 min) para o submit
  const expiraSessao = new Date(Date.now() + 30 * 60 * 1000);
  const { data: sessao, error: sessaoErr } = await supabaseAdmin
    .from('otp_codes')
    .insert({
      phone:      raw,
      code:       crypto.randomUUID(), // session token aleatório
      type:       'session',
      expires_at: expiraSessao.toISOString(),
    })
    .select('id, code')
    .single();

  if (sessaoErr || !sessao) {
    logger.error({ sessaoErr }, '[interesse] Erro ao criar sessão');
    return c.json({ error: 'Erro interno. Tente novamente.' }, 500);
  }

  return c.json({ success: true, sessionId: sessao.id });
});

// ── POST /v1/interesse/invalidate-session ─────────────────────────────────────
// Chamado quando usuário volta da tela de Resumo para editar o formulário
interesseRouter.post('/invalidate-session', async (c) => {
  let body: { sessionId?: string; phone?: string } = {};
  try { body = await c.req.json(); } catch { /* body vazio */ }
  const { sessionId, phone } = body;

  if (!sessionId && !phone) return c.json({ ok: true }); // nada a invalidar

  const raw = (phone ?? '').replace(/\D/g, '');

  if (sessionId) {
    await supabaseAdmin
      .from('otp_codes')
      .update({ used: true })
      .eq('id', sessionId)
      .eq('type', 'session');
  } else if (raw) {
    await supabaseAdmin
      .from('otp_codes')
      .update({ used: true })
      .eq('phone', raw)
      .eq('type', 'session')
      .eq('used', false);
  }

  return c.json({ ok: true });
});

// ── POST /v1/interesse/submit ─────────────────────────────────────────────────
interesseRouter.post('/submit', async (c) => {
  const body = await c.req.json<{
    sessionId:        string;
    phone:            string;
    cnpj?:            string;
    razao_social?:    string;
    company_name:     string;
    setores:          string[];
    neighborhood:     string;
    cep?:             string;
    logradouro?:      string;
    numero?:          string;
    bairro_empresa?:  string;
    contact_name:     string;
    contact_role:     string;
    contact_email:    string;
    contact_whatsapp: string;
    vacancies_qty:    string;
    message?:         string;
  }>().catch(() => null);

  if (!body) return c.json({ error: 'Payload inválido.' }, 400);

  const raw = body.phone.replace(/\D/g, '');

  // Valida sessão
  const { data: sessao, error: sessaoErr } = await supabaseAdmin
    .from('otp_codes')
    .select('id')
    .eq('id', body.sessionId)
    .eq('phone', raw)
    .eq('type', 'session')
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .maybeSingle();

  if (sessaoErr || !sessao) {
    return c.json({ error: 'Sessão expirada. Faça a verificação novamente.' }, 401);
  }

  // Marca sessão como usada
  await supabaseAdmin.from('otp_codes').update({ used: true }).eq('id', sessao.id);

  // Salva pré-cadastro
  const { error: insertErr } = await supabaseAdmin.from('empresa_pre_cadastros').insert({
    cnpj:             body.cnpj             || null,
    razao_social:     body.razao_social     || null,
    company_name:     body.company_name,
    setores:          body.setores          ?? [],
    neighborhood:     body.neighborhood     || null,
    cep:              body.cep              || null,
    logradouro:       body.logradouro       || null,
    numero:           body.numero           || null,
    bairro_empresa:   body.bairro_empresa   || null,
    contact_name:     body.contact_name,
    contact_role:     body.contact_role,
    contact_email:    body.contact_email,
    contact_whatsapp: raw,
    vacancies_qty:    body.vacancies_qty    || null,
    message:          body.message          || null,
    status:           'pendente',
  });

  if (insertErr) {
    logger.error({ error: insertErr }, '[interesse] Erro ao salvar pré-cadastro');
    return c.json({ error: 'Erro ao salvar. Tente novamente.' }, 500);
  }

  logger.info({ company: body.company_name, phone: raw }, '✅ [interesse] Pré-cadastro recebido');

  return c.json({ success: true });
});
