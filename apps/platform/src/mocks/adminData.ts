export interface AdminCompany {
  id: string;
  name: string;
  razaoSocial: string;
  cnpj: string;
  sector: string;
  city: string;
  neighborhood: string;
  endereco: string;
  email: string;
  phone: string;
  whatsapp: string;
  contactName: string;
  contactRole: string;
  activeJobs: number;
  pendingJobs: number;
  totalCandidates: number;
  registeredAt: string;
  status: "ativo" | "inativo" | "excluido" | "pendente" | "rejeitado";
  motivoRejeicao?: string;
  validadoEm?: string;
  ativadoEm?: string;
  inativadoEm?: string;
  inativadoPor?: string;
  excluidoEm?: string;
  excluidoPor?: string;
  plano: "basico" | "profissional" | "enterprise";
  senhaProvisoria: boolean;
  contactPassword?: string;
}

export interface AdminCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  neighborhood: string;
  age: number;
  gender: string;
  isPCD: boolean;
  educationLevel: string;
  jobTitle: string;
  registeredAt: string;
  status: "ativo" | "inativo";
  candidaturas: number;
}

export interface AdminJob {
  id: string;
  title: string;
  sector: string;
  company: string;
  companyId: string;
  companyEmail: string;
  companyWhatsapp: string;
  city: string;
  neighborhood: string;
  contractType: string;
  salaryRange: string;
  description: string;
  requirements: string;
  benefits: string;
  publishedAt: string;
  status: "ativa" | "pausada" | "encerrada" | "pendente";
  candidates: number;
}

export interface AdminNotification {
  id: string;
  type: "new_candidate" | "pre_interview" | "contact_request" | "company_approved" | "company_rejected" | "job_approved" | "job_rejected" | "status_update";
  recipientType: "empresa" | "candidato";
  recipientEmail: string;
  recipientWhatsapp?: string;
  subject: string;
  message: string;
  sentAt: string;
  status: "enviado" | "pendente" | "falhou";
  jobTitle?: string;
  companyName: string;
}


// ─────────────────────────────────────────────────────────────────────────
// Mocks REMOVIDOS em 2026-05-03 a pedido do PO.
// Componentes que dependiam destes arrays agora devem buscar dados reais
// do banco (Supabase) ou exibir empty state.
// As interfaces acima permanecem como fonte de tipo (são reaproveitadas
// nos componentes Admin* até que migrem para os types do schema da API).
// ─────────────────────────────────────────────────────────────────────────

export const mockAdminCompanies: AdminCompany[] = [];
export const mockAdminCandidates: AdminCandidate[] = [];
export const mockAdminJobs: AdminJob[] = [];
export const mockAdminNotifications: AdminNotification[] = [];
