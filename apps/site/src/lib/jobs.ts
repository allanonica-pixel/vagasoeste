import { supabase } from './supabase';

export interface Job {
  id: string;
  title: string;
  sector: string;
  area: string;
  contractType: string;
  workMode?: string;
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

/** Busca todas as vagas ativas — usada no build SSG e SSR */
export async function getAllJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select(
      'id, title, sector, area, contractType, workMode, neighborhood, city, state, salaryRange, description, requirements, benefits, tags, isActive, createdAt, validThrough, vacancies, workHours, educationLevel, experienceYears'
    )
    .eq('isActive', true)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('[jobs.ts] getAllJobs error:', error.message);
    return [];
  }
  return data ?? [];
}

/** Busca uma vaga por ID */
export async function getJobById(id: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('isActive', true)
    .maybeSingle();

  if (error) {
    console.error('[jobs.ts] getJobById error:', error.message);
    return null;
  }
  return data;
}

/** Busca vagas por área + cidade (para páginas programáticas) */
export async function getJobsByAreaAndCity(area: string, city: string): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .ilike('area', `%${area}%`)
    .ilike('city', `%${city}%`)
    .eq('isActive', true)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('[jobs.ts] getJobsByAreaAndCity error:', error.message);
    return [];
  }
  return data ?? [];
}

/** Retorna combinações únicas cidade + área para getStaticPaths */
export async function getJobCityAreaCombinations(): Promise<
  Array<{ cidade: string; cargo: string; cityName: string; cargoName: string }>
> {
  const jobs = await getAllJobs();
  const seen = new Set<string>();
  const result: Array<{ cidade: string; cargo: string; cityName: string; cargoName: string }> = [];

  for (const job of jobs) {
    const cidade = slugify(job.city);
    const cargo = slugify(job.area);
    const key = `${cidade}/${cargo}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ cidade, cargo, cityName: job.city, cargoName: job.area });
    }
  }
  return result;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

/** Unique values helpers */
export function getUniqueSectors(jobs: Job[]): string[] {
  return [...new Set(jobs.map((j) => j.sector))].sort();
}

export function getUniqueNeighborhoods(jobs: Job[]): string[] {
  return [...new Set(jobs.map((j) => j.neighborhood))].sort();
}

export function getUniqueContractTypes(jobs: Job[]): string[] {
  return [...new Set(jobs.map((j) => j.contractType))].sort();
}

/** Schema.org JobPosting para uma vaga */
export function buildJobSchema(job: Job): object {
  const employmentTypeMap: Record<string, string> = {
    CLT: 'FULL_TIME',
    PJ: 'CONTRACTOR',
    Temporário: 'TEMPORARY',
    Estágio: 'INTERN',
    Freelance: 'CONTRACTOR',
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    '@id': `https://vagasoeste.com.br/vagas/${job.id}`,
    url: `https://vagasoeste.com.br/vagas/${job.id}`,
    title: job.title,
    description: job.description,
    datePosted: job.createdAt,
    validThrough: job.validThrough ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    employmentType: employmentTypeMap[job.contractType] ?? 'OTHER',
    directApply: true,
    hiringOrganization: {
      '@type': 'Organization',
      name: 'VagasOeste',
      url: 'https://vagasoeste.com.br',
      logo: {
        '@type': 'ImageObject',
        url: 'https://vagasoeste.com.br/logo.png',
      },
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: job.neighborhood,
        addressLocality: job.city,
        addressRegion: 'PA',
        postalCode: '68000-000',
        addressCountry: 'BR',
      },
    },
    ...(job.salaryRange && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: 'BRL',
        value: {
          '@type': 'QuantitativeValue',
          unitText: 'MONTH',
          description: job.salaryRange,
        },
      },
    }),
    skills: job.requirements,
    qualifications: job.requirements,
    occupationalCategory: job.sector,
    industry: job.sector,
    ...(job.workHours && { workHours: job.workHours }),
    ...(job.vacancies && { numberOfPositions: job.vacancies }),
    identifier: {
      '@type': 'PropertyValue',
      name: 'VagasOeste',
      value: `vagasoeste-${job.id}`,
    },
  };
}
