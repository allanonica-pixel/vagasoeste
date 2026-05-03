export const EDUCATION_LEVELS_FILTER = [
  "Todos",
  "Ensino Fundamental",
  "Ensino Médio",
  "Técnico",
  "Superior Incompleto",
  "Superior Completo",
  "Pós-graduação",
];

export const GENDER_OPTIONS = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Feminino" },
  { value: "NB", label: "Não-binário" },
  { value: "NI", label: "Prefiro não informar" },
];

export interface CandidateCourse {
  id: string;
  title: string;
  institution: string;
  startDate: string;
  endDate: string;
}

export interface CandidateRequest {
  type: "contact" | "interview";
  requestedAt: string;
  status: "pending" | "done" | "scheduled";
  notes?: string;
  interviewReport?: string;
  contactDetails?: string;
}

export type CandidateStatus =
  | "pendente"
  | "em_analise"
  | "pre_entrevista"
  | "entrevista"
  | "aprovado"
  | "reprovado"
  | "contratado";

export interface StatusHistoryEntry {
  status: CandidateStatus;
  date: string;
  note?: string;
}

export interface Candidate {
  id: string;
  jobTitle: string;
  jobId: string;
  neighborhood: string;
  city: string;
  age: number;
  gender: string;
  isPCD: boolean;
  educationLevel: string;
  availability: string;
  salaryExpectation: string;
  experiences: string;
  courses: CandidateCourse[];
  appliedAt: string;
  status: CandidateStatus;
  statusHistory: StatusHistoryEntry[];
  isFavorited: boolean;
  requests: CandidateRequest[];
}

// ─────────────────────────────────────────────────────────────────────────
// Mock REMOVIDO em 2026-05-03 a pedido do PO.
// Componentes que dependem de `mockCandidates` agora veem empty state.
// As interfaces/types acima permanecem como fonte de tipos; a Fase 1.7
// (Painel da Empresa Funcional) substitui o consumo desses arrays por
// queries reais ao Supabase + endpoints /v1/company/applications/*.
// ─────────────────────────────────────────────────────────────────────────

export const mockCandidates: Candidate[] = [];
