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

export const mockCompanyJobs: CompanyJob[] = [
  {
    id: "cj1",
    title: "Auxiliar Administrativo",
    sector: "Comércio",
    area: "Administrativo",
    contractType: "CLT",
    workMode: "Presencial",
    neighborhood: "Centro",
    city: "Santarém",
    state: "Pará",
    salaryRange: "R$ 1.800 – R$ 2.200",
    description: "Buscamos um Auxiliar Administrativo para apoiar as rotinas do escritório, incluindo controle de documentos, atendimento interno, organização de arquivos e suporte às demais áreas da empresa.",
    requirements: "Ensino médio completo. Pacote Office básico. Boa comunicação e organização. Experiência anterior na área é um diferencial.",
    benefits: "Vale transporte, vale refeição, plano de saúde após 3 meses, 13º salário.",
    educationLevel: "Ensino Médio",
    experienceYears: "0 a 1 ano",
    vacancies: 2,
    isActive: true,
    createdAt: "2026-04-10",
    applicantsCount: 8,
  },
  {
    id: "cj2",
    title: "Vendedor Externo",
    sector: "Comércio",
    area: "Vendas",
    contractType: "CLT",
    workMode: "Presencial",
    neighborhood: "Maracanã",
    city: "Santarém",
    state: "Pará",
    salaryRange: "R$ 2.500 – R$ 4.000 + comissão",
    description: "Responsável pela prospecção de novos clientes, manutenção da carteira existente e cumprimento de metas mensais de vendas na região de Santarém.",
    requirements: "CNH B obrigatória. Experiência mínima de 1 ano em vendas externas. Habilidade de negociação e foco em resultados.",
    benefits: "Comissão atrativa, vale combustível, celular corporativo, plano de saúde.",
    educationLevel: "Ensino Médio",
    experienceYears: "1 a 3 anos",
    vacancies: 1,
    isActive: true,
    createdAt: "2026-04-12",
    applicantsCount: 5,
  },
];
