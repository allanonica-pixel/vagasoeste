export const SECTORS = [
  "Comércio",
  "Saúde",
  "Tecnologia",
  "Logística",
  "Alimentação",
  "Indústria",
  "Serviços",
  "Construção Civil",
  "Educação",
  "Financeiro",
];

export const NEIGHBORHOODS = [
  "Centro",
  "Maracanã",
  "Jardim Santarém",
  "Aldeia",
  "Santa Clara",
  "Aparecida",
];

export const CONTRACT_TYPES = ["CLT", "PJ", "Temporário", "Freelance", "Estágio"];

export const WORK_MODES = ["Presencial", "Híbrido", "Remoto"];

export const EDUCATION_LEVELS = [
  "Ensino Fundamental",
  "Ensino Médio",
  "Técnico",
  "Superior Incompleto",
  "Superior Completo",
  "Pós-graduação",
];

export interface CompanyJob {
  id: string;
  title: string;
  sector: string;
  area: string;
  contractType: string;
  workMode: string;
  neighborhood: string;
  city: string;
  state: string;
  salaryRange: string;
  description: string;
  requirements: string;
  benefits: string;
  educationLevel: string;
  experienceYears: string;
  vacancies: number;
  isActive: boolean;
  createdAt: string;
  applicantsCount: number;
}

// ─────────────────────────────────────────────────────────────────────────
// Mock REMOVIDO em 2026-05-03 a pedido do PO.
// Componentes que dependem de `mockCompanyJobs` agora veem empty state.
// As interfaces e constantes (SECTORS, NEIGHBORHOODS, etc.) permanecem
// como fonte de tipo/dropdowns; a Fase 1.7 (Painel da Empresa Funcional)
// substitui o consumo desse array por queries reais ao Supabase +
// endpoints /v1/company/jobs/*.
// ─────────────────────────────────────────────────────────────────────────

export const mockCompanyJobs: CompanyJob[] = [];
