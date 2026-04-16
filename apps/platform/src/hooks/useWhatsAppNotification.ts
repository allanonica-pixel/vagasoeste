/**
 * Hook para envio de notificações WhatsApp via Evolution API
 * Usa Supabase Edge Function: send-whatsapp-notification
 *
 * Secrets necessários no Supabase (após conexão):
 *   EVOLUTION_API_URL   — URL base da sua instância Evolution API (ex: https://api.seudominio.com)
 *   EVOLUTION_API_KEY   — Chave de API da Evolution API
 *   EVOLUTION_INSTANCE  — Nome da instância (padrão: "vagasoeste")
 *
 * Para ativar o envio real:
 *   1. Conecte o Supabase ao projeto
 *   2. Configure os 3 secrets acima
 *   3. Substitua `simulateSend` pela chamada `supabase.functions.invoke` (comentário abaixo)
 */

export type WhatsAppNotificationType =
  | "new_candidate"
  | "pre_interview"
  | "contact_request"
  | "company_approved"
  | "company_rejected"
  | "job_approved"
  | "job_rejected"
  | "status_update";

export interface WhatsAppNotificationPayload {
  type: WhatsAppNotificationType;
  recipientPhone: string;
  recipientName?: string;
  jobTitle?: string;
  companyName?: string;
  customMessage?: string;
  motivo?: string;
}

export interface WhatsAppNotificationResult {
  success: boolean;
  preview: boolean;
  error?: string;
}

// Prévia das mensagens para exibir no painel antes de enviar
export const WHATSAPP_MESSAGE_PREVIEWS: Record<WhatsAppNotificationType, (p: WhatsAppNotificationPayload) => string> = {
  new_candidate: (p) =>
    `🔔 *VagasOeste — Novo Candidato*\n\nUm novo candidato se inscreveu para a vaga de *${p.jobTitle || "[Título da Vaga]"}*.\n\nAcesse a plataforma para visualizar o perfil.`,

  pre_interview: (p) =>
    `🎉 *VagasOeste — Pré-entrevista!*\n\nOlá${p.recipientName ? `, *${p.recipientName}*` : ""}! Você foi selecionado(a) para uma *pré-entrevista* para a vaga de *${p.jobTitle || "[Vaga]"}*.\n\nNossa equipe entrará em contato em breve.`,

  contact_request: (p) =>
    `📞 *VagasOeste — Solicitação de Contato*\n\nOlá${p.recipientName ? `, *${p.recipientName}*` : ""}! Uma empresa demonstrou interesse no seu perfil para a vaga de *${p.jobTitle || "[Vaga]"}*.`,

  company_approved: (p) =>
    `✅ *VagasOeste — Cadastro Aprovado!*\n\nO cadastro de *${p.companyName || "[Empresa]"}* foi aprovado! Suas vagas já estão visíveis no site público.`,

  company_rejected: (p) =>
    `❌ *VagasOeste — Cadastro Não Aprovado*\n\nO cadastro de *${p.companyName || "[Empresa]"}* não foi aprovado.\n\n*Motivo:* ${p.motivo || "[Motivo]"}`,

  job_approved: (p) =>
    `✅ *VagasOeste — Vaga Aprovada!*\n\nA vaga de *${p.jobTitle || "[Vaga]"}* foi aprovada e já está publicada!`,

  job_rejected: (p) =>
    `❌ *VagasOeste — Vaga Reprovada*\n\nA vaga de *${p.jobTitle || "[Vaga]"}* foi reprovada.\n\n*Motivo:* ${p.motivo || "[Motivo]"}`,

  status_update: (p) =>
    `📋 *VagasOeste — Atualização de Status*\n\nOlá${p.recipientName ? `, *${p.recipientName}*` : ""}! Houve uma atualização no seu processo para a vaga de *${p.jobTitle || "[Vaga]"}*.`,
};

async function simulateSend(payload: WhatsAppNotificationPayload): Promise<WhatsAppNotificationResult> {
  // Simula latência de rede
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log("[WhatsApp Simulado]", {
    to: payload.recipientPhone,
    type: payload.type,
    preview: WHATSAPP_MESSAGE_PREVIEWS[payload.type]?.(payload),
  });
  return { success: true, preview: true };
}

// Quando Supabase estiver conectado, substitua simulateSend por:
// import { supabase } from "@/lib/supabase";
// async function realSend(payload: WhatsAppNotificationPayload): Promise<WhatsAppNotificationResult> {
//   const { data, error } = await supabase.functions.invoke("send-whatsapp-notification", { body: payload });
//   if (error) return { success: false, preview: false, error: error.message };
//   return { success: true, preview: data?.preview ?? false };
// }

export function useWhatsAppNotification() {
  const sendWhatsApp = async (payload: WhatsAppNotificationPayload): Promise<WhatsAppNotificationResult> => {
    try {
      return await simulateSend(payload);
      // Trocar por: return await realSend(payload);
    } catch (err) {
      return { success: false, preview: false, error: String(err) };
    }
  };

  const getPreview = (payload: WhatsAppNotificationPayload): string => {
    return WHATSAPP_MESSAGE_PREVIEWS[payload.type]?.(payload) || payload.customMessage || "";
  };

  return { sendWhatsApp, getPreview };
}
