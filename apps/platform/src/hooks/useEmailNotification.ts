/**
 * useEmailNotification
 *
 * Hook para envio de notificações por email via Supabase Edge Function.
 *
 * Quando Supabase estiver conectado, substitua o fetch abaixo por:
 *   import { createClient } from "@supabase/supabase-js";
 *   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
 *   const { data, error } = await supabase.functions.invoke("send-notification-email", { body: payload });
 *
 * Por enquanto, opera em modo simulado (preview) sem Supabase.
 */

export type EmailNotificationType =
  | "company_approved"
  | "company_rejected"
  | "job_approved"
  | "job_rejected"
  | "new_candidate"
  | "pre_interview";

export interface SendEmailPayload {
  type: EmailNotificationType;
  to: string;
  companyName: string;
  contactName?: string;
  cnpj?: string;
  jobTitle?: string;
  motivo?: string;
  loginUrl?: string;
  pendingJobs?: number;
}

export interface EmailResult {
  success: boolean;
  preview?: boolean;
  id?: string;
  error?: string;
}

/**
 * Simulates email sending when Supabase is not connected.
 * Replace with real Supabase call after connecting.
 */
async function simulateSend(payload: SendEmailPayload): Promise<EmailResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  console.log("[useEmailNotification] Simulated email send:", {
    type: payload.type,
    to: payload.to,
    companyName: payload.companyName,
    jobTitle: payload.jobTitle,
  });
  return { success: true, preview: true };
}

export async function sendEmailNotification(payload: SendEmailPayload): Promise<EmailResult> {
  try {
    // TODO: When Supabase is connected, replace simulateSend with:
    // const { data, error } = await supabase.functions.invoke("send-notification-email", { body: payload });
    // if (error) return { success: false, error: error.message };
    // return data as EmailResult;
    return await simulateSend(payload);
  } catch (err) {
    console.error("[useEmailNotification] Error:", err);
    return { success: false, error: "Falha ao enviar email" };
  }
}
