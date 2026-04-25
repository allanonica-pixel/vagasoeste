/**
 * Drizzle ORM Schema — VagasOeste API
 *
 * Espelha as tabelas do supabase-schema.sql existente.
 * Novos schemas (audit, media) são adicionados via migration
 * em migrations/0001_audit_media_functions.sql
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
  jsonb,
  numeric,
  date,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================
// ENUMS (espelham os CREATE TYPE do schema SQL)
// ============================================================
export const contractTypeEnum = pgEnum('contract_type', ['CLT', 'PJ', 'Temporário', 'Freelance', 'Estágio']);
export const workModeEnum     = pgEnum('work_mode',     ['Presencial', 'Híbrido', 'Remoto']);
export const jobStatusEnum    = pgEnum('job_status',    ['pendente', 'ativo', 'pausado', 'encerrado']);
export const companyStatusEnum = pgEnum('company_status', ['pendente', 'ativo', 'suspenso', 'rejeitado']);
export const candidateStatusEnum = pgEnum('candidate_status', [
  'pendente', 'em_analise', 'pre_entrevista', 'entrevista', 'aprovado', 'reprovado', 'contratado',
]);
export const educationLevelEnum = pgEnum('education_level', [
  'Ensino Fundamental', 'Ensino Médio', 'Técnico',
  'Superior Incompleto', 'Superior Completo', 'Pós-graduação',
]);
export const applicationStatusEnum = pgEnum('application_status', [
  'pendente', 'em_analise', 'pre_entrevista', 'entrevista', 'aprovado', 'reprovado', 'contratado',
]);

// ============================================================
// TABLE: companies
// ============================================================
export const companies = pgTable('companies', {
  id:              uuid('id').primaryKey().defaultRandom(),
  cnpj:            varchar('cnpj', { length: 18 }).notNull().unique(),
  razaoSocial:     varchar('razao_social', { length: 255 }).notNull(),
  nomeFantasia:    varchar('nome_fantasia', { length: 255 }),
  sector:          varchar('sector', { length: 100 }),
  cidade:          varchar('cidade', { length: 100 }).default('Santarém'),
  estado:          varchar('estado', { length: 2 }).default('PA'),
  bairro:          varchar('bairro', { length: 100 }),
  endereco:        text('endereco'),
  email:           varchar('email', { length: 255 }).notNull().unique(),
  telefone:        varchar('telefone', { length: 20 }),
  whatsapp:        varchar('whatsapp', { length: 20 }),
  responsavelNome: varchar('responsavel_nome', { length: 255 }),
  responsavelCargo:varchar('responsavel_cargo', { length: 100 }),
  authUserId:      uuid('auth_user_id'),
  senhaProvisoriai:boolean('senha_provisoria').default(true),
  status:          companyStatusEnum('status').default('pendente'),
  validadoEm:      timestamp('validado_em', { withTimezone: true }),
  validadoPor:     uuid('validado_por'),
  motivoRejeicao:  text('motivo_rejeicao'),
  plano:           varchar('plano', { length: 50 }).default('basico'),
  planoExpiraEm:   date('plano_expira_em'),
  createdAt:       timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:       timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  cnpjIdx:   index('idx_companies_cnpj').on(t.cnpj),
  statusIdx: index('idx_companies_status').on(t.status),
}));

// ============================================================
// TABLE: jobs (vagas)
// ============================================================
export const jobs = pgTable('jobs', {
  id:             uuid('id').primaryKey().defaultRandom(),
  companyId:      uuid('company_id').notNull(),
  slug:           varchar('slug', { length: 255 }).unique(),
  title:          varchar('title', { length: 255 }).notNull(),
  sector:         varchar('sector', { length: 100 }),
  area:           varchar('area', { length: 100 }),
  contractType:   contractTypeEnum('contract_type').notNull(),
  workMode:       workModeEnum('work_mode').default('Presencial'),
  neighborhood:   varchar('neighborhood', { length: 100 }),
  city:           varchar('city', { length: 100 }).default('Santarém'),
  state:          varchar('state', { length: 2 }).default('PA'),
  salaryRange:    varchar('salary_range', { length: 100 }),
  salaryMin:      numeric('salary_min', { precision: 12, scale: 2 }),
  salaryMax:      numeric('salary_max', { precision: 12, scale: 2 }),
  description:    text('description').notNull(),
  requirements:   text('requirements'),
  benefits:       text('benefits'),
  educationLevel: educationLevelEnum('education_level'),
  schedule:       varchar('schedule', { length: 100 }),
  vacancies:      integer('vacancies').default(1),
  tags:           text('tags').array(),
  status:         jobStatusEnum('status').default('pendente'),
  viewsCount:     integer('views_count').default(0),
  applicantsCount:integer('applicants_count').default(0),
  publishedAt:    timestamp('published_at', { withTimezone: true }),
  expiresAt:      timestamp('expires_at', { withTimezone: true }),
  metaTitle:      varchar('meta_title', { length: 120 }),
  metaDescription:varchar('meta_description', { length: 160 }),
  createdAt:      timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  statusIdx:    index('idx_jobs_status').on(t.status),
  companyIdx:   index('idx_jobs_company_id').on(t.companyId),
  contractIdx:  index('idx_jobs_contract_type').on(t.contractType),
  neighborIdx:  index('idx_jobs_neighborhood').on(t.neighborhood),
}));

// ============================================================
// TABLE: candidates
// ============================================================
export const candidates = pgTable('candidates', {
  id:               uuid('id').primaryKey().defaultRandom(),
  authUserId:       uuid('auth_user_id').unique(),
  nomeCompleto:     varchar('nome_completo', { length: 255 }).notNull(),
  email:            varchar('email', { length: 255 }).notNull().unique(),
  telefone:         varchar('telefone', { length: 20 }),
  cpf:              varchar('cpf', { length: 14 }).unique(),
  dataNascimento:   date('data_nascimento'),
  cidade:           varchar('cidade', { length: 100 }),
  estado:           varchar('estado', { length: 2 }),
  bairro:           varchar('bairro', { length: 100 }),
  headline:         varchar('headline', { length: 150 }),
  curriculoData:    jsonb('curriculo_data'),
  fotoUrl:          text('foto_url'),
  videoUrl:         text('video_url'),
  status:           candidateStatusEnum('status').default('pendente'),
  profileComplete:  boolean('profile_complete').default(false),
  createdAt:        timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  authUserIdx: index('idx_candidates_auth_user_id').on(t.authUserId),
  emailIdx:    uniqueIndex('idx_candidates_email').on(t.email),
}));

// ============================================================
// TABLE: applications (candidaturas)
// ============================================================
export const applications = pgTable('applications', {
  id:            uuid('id').primaryKey().defaultRandom(),
  jobId:         uuid('job_id').notNull(),
  companyId:     uuid('company_id').notNull(),
  candidateId:   uuid('candidate_id').notNull(),
  status:        applicationStatusEnum('status').default('pendente'),
  statusHistory: jsonb('status_history').default([]),
  notes:         text('notes'),
  createdAt:     timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:     timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  jobCandidateUnique: uniqueIndex('idx_applications_job_candidate').on(t.jobId, t.candidateId),
  candidateIdx:       index('idx_applications_candidate_id').on(t.candidateId),
  companyIdx:         index('idx_applications_company_id').on(t.companyId),
  statusIdx:          index('idx_applications_status').on(t.status),
}));

// ============================================================
// TABLE: admin_users
// ============================================================
export const adminUsers = pgTable('admin_users', {
  id:          uuid('id').primaryKey().defaultRandom(),
  authUserId:  uuid('auth_user_id').unique(),
  nome:        varchar('nome', { length: 255 }).notNull(),
  email:       varchar('email', { length: 255 }).notNull().unique(),
  role:        varchar('role', { length: 50 }).default('admin'),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ============================================================
// TABLE: neighborhoods
// ============================================================
export const neighborhoods = pgTable('neighborhoods', {
  id:          uuid('id').primaryKey().defaultRandom(),
  name:        varchar('name', { length: 100 }).notNull().unique(),
  city:        varchar('city', { length: 100 }).default('Santarém'),
  state:       varchar('state', { length: 2 }).default('PA'),
  description: text('description'),
  imageUrl:    text('image_url'),
  jobCount:    integer('job_count').default(0),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ============================================================
// RELATIONS (para queries tipadas com Drizzle)
// ============================================================
export const companiesRelations = relations(companies, ({ many }) => ({
  jobs:         many(jobs),
  applications: many(applications),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company:      one(companies, { fields: [jobs.companyId], references: [companies.id] }),
  applications: many(applications),
}));

export const candidatesRelations = relations(candidates, ({ many }) => ({
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job:       one(jobs,       { fields: [applications.jobId],       references: [jobs.id] }),
  company:   one(companies,  { fields: [applications.companyId],   references: [companies.id] }),
  candidate: one(candidates, { fields: [applications.candidateId], references: [candidates.id] }),
}));
