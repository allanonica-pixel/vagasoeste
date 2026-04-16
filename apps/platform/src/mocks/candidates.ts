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

export const mockCandidates: Candidate[] = [
  {
    id: "c1",
    jobTitle: "Auxiliar Administrativo",
    jobId: "cj1",
    neighborhood: "Centro",
    city: "Santarém",
    age: 24,
    gender: "F",
    isPCD: false,
    educationLevel: "Ensino Médio",
    availability: "Integral",
    salaryExpectation: "R$ 1.800 – R$ 2.200",
    experiences: "3 anos em rotinas administrativas, controle de documentos, atendimento ao cliente interno.",
    courses: [
      { id: "cr1", title: "Pacote Office Intermediário", institution: "SENAC", startDate: "2024-03", endDate: "2024-06" },
      { id: "cr2", title: "Atendimento ao Cliente", institution: "Online", startDate: "2023-08", endDate: "2023-10" },
    ],
    appliedAt: "2026-04-14",
    status: "pendente",
    statusHistory: [
      { status: "pendente", date: "2026-04-14", note: "Candidatura recebida" },
    ],
    isFavorited: false,
    requests: [],
  },
  {
    id: "c2",
    jobTitle: "Auxiliar Administrativo",
    jobId: "cj1",
    neighborhood: "Maracanã",
    city: "Santarém",
    age: 31,
    gender: "M",
    isPCD: false,
    educationLevel: "Superior Incompleto",
    availability: "Manhã",
    salaryExpectation: "R$ 2.000 – R$ 2.400",
    experiences: "1 ano como assistente em empresa de logística, controle de planilhas e relatórios.",
    courses: [
      { id: "cr3", title: "Excel Avançado", institution: "Udemy", startDate: "2025-01", endDate: "2025-03" },
      { id: "cr4", title: "Gestão do Tempo", institution: "Coursera", startDate: "2024-11", endDate: "2024-12" },
    ],
    appliedAt: "2026-04-15",
    status: "em_analise",
    statusHistory: [
      { status: "pendente", date: "2026-04-15", note: "Candidatura recebida" },
      { status: "em_analise", date: "2026-04-15", note: "Perfil em análise pela empresa" },
    ],
    isFavorited: true,
    requests: [
      {
        type: "contact",
        requestedAt: "2026-04-15",
        status: "pending",
        contactDetails: "Solicitado contato via WhatsApp para apresentação da proposta.",
      },
    ],
  },
  {
    id: "c3",
    jobTitle: "Auxiliar Administrativo",
    jobId: "cj1",
    neighborhood: "Jardim Santarém",
    city: "Santarém",
    age: 28,
    gender: "F",
    isPCD: true,
    educationLevel: "Técnico",
    availability: "Integral",
    salaryExpectation: "R$ 1.900 – R$ 2.300",
    experiences: "2 anos em escritório contábil, emissão de notas fiscais, controle de contas a pagar.",
    courses: [
      { id: "cr5", title: "Contabilidade Básica", institution: "SENAI", startDate: "2023-02", endDate: "2023-07" },
    ],
    appliedAt: "2026-04-15",
    status: "pendente",
    statusHistory: [
      { status: "pendente", date: "2026-04-15", note: "Candidatura recebida" },
    ],
    isFavorited: false,
    requests: [],
  },
  {
    id: "c4",
    jobTitle: "Vendedor Externo",
    jobId: "cj2",
    neighborhood: "Aldeia",
    city: "Santarém",
    age: 35,
    gender: "M",
    isPCD: false,
    educationLevel: "Ensino Médio",
    availability: "Integral",
    salaryExpectation: "R$ 2.500 – R$ 3.500",
    experiences: "5 anos em vendas externas, carteira de clientes consolidada, experiência com metas.",
    courses: [
      { id: "cr6", title: "Técnicas de Vendas", institution: "Sebrae", startDate: "2024-05", endDate: "2024-07" },
      { id: "cr7", title: "Negociação Avançada", institution: "Hotmart", startDate: "2025-02", endDate: "2025-04" },
    ],
    appliedAt: "2026-04-13",
    status: "aprovado",
    statusHistory: [
      { status: "pendente", date: "2026-04-13", note: "Candidatura recebida" },
      { status: "em_analise", date: "2026-04-13", note: "Perfil em análise" },
      { status: "pre_entrevista", date: "2026-04-14", note: "Pré-entrevista solicitada pela empresa" },
      { status: "aprovado", date: "2026-04-15", note: "Candidato aprovado para próxima etapa" },
    ],
    isFavorited: true,
    requests: [
      {
        type: "interview",
        requestedAt: "2026-04-14",
        status: "done",
        interviewReport: "Candidato demonstrou excelente domínio de técnicas de vendas e boa comunicação. Perfil alinhado com a vaga. Recomendamos fortemente para a próxima etapa. Mostrou proatividade e conhecimento do mercado local de Santarém.",
      },
    ],
  },
  {
    id: "c5",
    jobTitle: "Vendedor Externo",
    jobId: "cj2",
    neighborhood: "Santa Clara",
    city: "Santarém",
    age: 22,
    gender: "F",
    isPCD: false,
    educationLevel: "Superior Incompleto",
    availability: "Tarde",
    salaryExpectation: "R$ 2.000 – R$ 2.800",
    experiences: "1 ano em vendas internas, interesse em migrar para vendas externas.",
    courses: [
      { id: "cr8", title: "Marketing Digital", institution: "Google", startDate: "2025-01", endDate: "2025-02" },
    ],
    appliedAt: "2026-04-16",
    status: "pendente",
    statusHistory: [
      { status: "pendente", date: "2026-04-16", note: "Candidatura recebida" },
    ],
    isFavorited: false,
    requests: [],
  },
];
