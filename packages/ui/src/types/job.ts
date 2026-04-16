export interface Job {
  id: string;
  title: string;
  sector: string;
  area: string;
  contractType: 'CLT' | 'PJ' | 'Temporário' | 'Estágio' | 'Freelance';
  workMode?: 'Presencial' | 'Remoto' | 'Híbrido';
  neighborhood: string;
  city: string;
  state: string;
  salaryRange: string;
  description: string;
  requirements: string;
  benefits?: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  validThrough?: string;
  vacancies?: number;
  workHours?: string;
  educationLevel?: string;
  experienceYears?: string;
}
