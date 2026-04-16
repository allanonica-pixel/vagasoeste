-- ============================================================
-- VagasOeste — Supabase Schema Migration
-- Versão: 1.0 | Data: 2026-04-16
-- Substitui os mocks: jobs.ts, blogPosts.ts, candidates.ts, companyJobs.ts
-- Compatível com migração Astro (SSG/SSR)
-- ============================================================

-- ============================================================
-- EXTENSÕES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca full-text

-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE contract_type AS ENUM ('CLT', 'PJ', 'Temporário', 'Freelance', 'Estágio');
CREATE TYPE work_mode AS ENUM ('Presencial', 'Híbrido', 'Remoto');
CREATE TYPE job_status AS ENUM ('pendente', 'ativo', 'pausado', 'encerrado');
CREATE TYPE company_status AS ENUM ('pendente', 'ativo', 'suspenso', 'rejeitado');
CREATE TYPE candidate_status AS ENUM ('pendente', 'em_analise', 'pre_entrevista', 'entrevista', 'aprovado', 'reprovado', 'contratado');
CREATE TYPE education_level AS ENUM ('Ensino Fundamental', 'Ensino Médio', 'Técnico', 'Superior Incompleto', 'Superior Completo', 'Pós-graduação');
CREATE TYPE gender_type AS ENUM ('M', 'F', 'NB', 'NI');
CREATE TYPE request_type AS ENUM ('contact', 'interview');
CREATE TYPE request_status AS ENUM ('pending', 'done', 'scheduled');

-- ============================================================
-- TABLE: companies
-- Substitui: src/mocks/companyJobs.ts (dados de empresa)
-- ============================================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  
  -- Setor e localização
  sector VARCHAR(100),
  cidade VARCHAR(100) DEFAULT 'Santarém',
  estado VARCHAR(2) DEFAULT 'PA',
  bairro VARCHAR(100),
  endereco TEXT,
  
  -- Contato
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  whatsapp VARCHAR(20),
  
  -- Responsável
  responsavel_nome VARCHAR(255),
  responsavel_cargo VARCHAR(100),
  
  -- Acesso
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  senha_provisoria BOOLEAN DEFAULT TRUE, -- TRUE = ainda usando senha do pré-cadastro
  
  -- Status de validação
  status company_status DEFAULT 'pendente',
  validado_em TIMESTAMPTZ,
  validado_por UUID, -- admin user id
  motivo_rejeicao TEXT,
  
  -- Plano
  plano VARCHAR(50) DEFAULT 'basico', -- basico, profissional, enterprise
  plano_expira_em DATE,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para companies
CREATE INDEX idx_companies_cnpj ON companies(cnpj);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_sector ON companies(sector);
CREATE INDEX idx_companies_cidade ON companies(cidade);

-- ============================================================
-- TABLE: jobs
-- Substitui: src/mocks/jobs.ts e src/mocks/companyJobs.ts
-- ============================================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Empresa (anônima para candidatos)
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Dados da vaga
  title VARCHAR(255) NOT NULL,
  sector VARCHAR(100),
  area VARCHAR(100),
  contract_type contract_type NOT NULL DEFAULT 'CLT',
  work_mode work_mode DEFAULT 'Presencial',
  
  -- Localização
  neighborhood VARCHAR(100),
  city VARCHAR(100) DEFAULT 'Santarém',
  state VARCHAR(2) DEFAULT 'PA',
  
  -- Remuneração
  salary_min NUMERIC(10,2),
  salary_max NUMERIC(10,2),
  salary_range VARCHAR(100), -- Texto livre: "R$ 1.800 – R$ 2.200" ou "A combinar"
  
  -- Detalhes
  description TEXT NOT NULL,
  requirements TEXT,
  desirable TEXT,
  benefits TEXT,
  education_level education_level DEFAULT 'Ensino Médio',
  experience_years VARCHAR(50), -- "0 a 1 ano", "1 a 3 anos", etc.
  schedule VARCHAR(100), -- "Segunda a Sexta, 08h às 17h"
  vacancies INTEGER DEFAULT 1,
  
  -- Tags para busca
  tags TEXT[], -- Array de strings: ['CLT', 'Presencial', 'Administrativo']
  
  -- Status e visibilidade
  status job_status DEFAULT 'pendente',
  is_active BOOLEAN GENERATED ALWAYS AS (status = 'ativo') STORED,
  
  -- SEO (para Astro)
  slug VARCHAR(255) UNIQUE, -- "auxiliar-administrativo-centro-santarem"
  meta_title VARCHAR(120),
  meta_description VARCHAR(160),
  
  -- Contadores
  views_count INTEGER DEFAULT 0,
  applicants_count INTEGER DEFAULT 0,
  
  -- Datas
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para jobs
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_sector ON jobs(sector);
CREATE INDEX idx_jobs_neighborhood ON jobs(neighborhood);
CREATE INDEX idx_jobs_city ON jobs(city);
CREATE INDEX idx_jobs_contract_type ON jobs(contract_type);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_slug ON jobs(slug);
-- Full-text search index
CREATE INDEX idx_jobs_fts ON jobs USING GIN(to_tsvector('portuguese', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(area, '') || ' ' || COALESCE(sector, '')));

-- ============================================================
-- TABLE: candidates
-- Substitui: src/mocks/candidates.ts
-- ============================================================
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Autenticação (Supabase Auth)
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Dados pessoais (protegidos — não expostos para empresas)
  nome_completo VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  whatsapp VARCHAR(20),
  data_nascimento DATE,
  cpf VARCHAR(14),
  
  -- Localização
  neighborhood VARCHAR(100),
  city VARCHAR(100) DEFAULT 'Santarém',
  state VARCHAR(2) DEFAULT 'PA',
  
  -- Perfil profissional (visível para empresas)
  age INTEGER,
  gender gender_type,
  is_pcd BOOLEAN DEFAULT FALSE,
  education_level education_level,
  availability VARCHAR(50), -- "Integral", "Manhã", "Tarde", "Noite"
  salary_expectation VARCHAR(100),
  experiences TEXT,
  
  -- Currículo
  curriculo_url TEXT, -- URL do PDF gerado
  curriculo_data JSONB, -- Dados estruturados do currículo
  
  -- Status da conta
  email_verified BOOLEAN DEFAULT FALSE,
  profile_complete BOOLEAN DEFAULT FALSE,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para candidates
CREATE INDEX idx_candidates_auth_user_id ON candidates(auth_user_id);
CREATE INDEX idx_candidates_neighborhood ON candidates(neighborhood);
CREATE INDEX idx_candidates_education_level ON candidates(education_level);
CREATE INDEX idx_candidates_availability ON candidates(availability);

-- ============================================================
-- TABLE: candidate_courses
-- Cursos e certificações dos candidatos
-- ============================================================
CREATE TABLE candidate_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  institution VARCHAR(255),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_candidate_courses_candidate_id ON candidate_courses(candidate_id);

-- ============================================================
-- TABLE: applications
-- Candidaturas (candidato → vaga)
-- ============================================================
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Status da candidatura
  status candidate_status DEFAULT 'pendente',
  
  -- Histórico de status (JSONB array)
  status_history JSONB DEFAULT '[]'::JSONB,
  -- Formato: [{"status": "pendente", "date": "2026-04-14", "note": "Candidatura recebida"}]
  
  -- Favorito pela empresa
  is_favorited BOOLEAN DEFAULT FALSE,
  
  -- Notas internas (visíveis apenas para empresa/admin)
  company_notes TEXT,
  
  -- Datas
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: candidato não pode se candidatar duas vezes à mesma vaga
  UNIQUE(candidate_id, job_id)
);

CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_company_id ON applications(company_id);
CREATE INDEX idx_applications_status ON applications(status);

-- ============================================================
-- TABLE: candidate_requests
-- Solicitações de contato ou pré-entrevista
-- ============================================================
CREATE TABLE candidate_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  
  type request_type NOT NULL,
  status request_status DEFAULT 'pending',
  
  -- Dados da solicitação
  notes TEXT,
  interview_report TEXT, -- Relatório da pré-entrevista (preenchido pela VagasOeste)
  contact_details TEXT,
  scheduled_at TIMESTAMPTZ,
  
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_candidate_requests_application_id ON candidate_requests(application_id);
CREATE INDEX idx_candidate_requests_company_id ON candidate_requests(company_id);

-- ============================================================
-- TABLE: blog_posts
-- Substitui: src/mocks/blogPosts.ts
-- ============================================================
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Conteúdo
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  
  -- Categorização
  category VARCHAR(100),
  tags TEXT[],
  
  -- Autor
  author VARCHAR(255) DEFAULT 'Equipe VagasOeste',
  author_role VARCHAR(100),
  author_image TEXT,
  
  -- Imagens
  cover_image TEXT,
  
  -- SEO
  meta_title VARCHAR(120),
  meta_description VARCHAR(160),
  
  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Métricas
  read_time INTEGER DEFAULT 5, -- minutos
  views_count INTEGER DEFAULT 0,
  
  -- Datas
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_is_published ON blog_posts(is_published);
CREATE INDEX idx_blog_posts_is_featured ON blog_posts(is_featured);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
-- Full-text search
CREATE INDEX idx_blog_posts_fts ON blog_posts USING GIN(to_tsvector('portuguese', title || ' ' || COALESCE(excerpt, '') || ' ' || COALESCE(content, '')));

-- ============================================================
-- TABLE: neighborhoods
-- Bairros de Santarém com metadados para SEO
-- ============================================================
CREATE TABLE neighborhoods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  city VARCHAR(100) DEFAULT 'Santarém',
  state VARCHAR(2) DEFAULT 'PA',
  description TEXT, -- Para SEO da página /vagas?bairro=X
  image_url TEXT,
  job_count INTEGER DEFAULT 0, -- Atualizado via trigger
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: admin_users
-- Usuários administrativos da VagasOeste
-- ============================================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'admin', -- admin, super_admin
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: Atualizar applicants_count em jobs
-- ============================================================
CREATE OR REPLACE FUNCTION update_job_applicants_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE jobs SET applicants_count = applicants_count + 1 WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE jobs SET applicants_count = GREATEST(0, applicants_count - 1) WHERE id = OLD.job_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_applications_count
AFTER INSERT OR DELETE ON applications
FOR EACH ROW EXECUTE FUNCTION update_job_applicants_count();

-- ============================================================
-- TRIGGER: Gerar slug automático para jobs
-- ============================================================
CREATE OR REPLACE FUNCTION generate_job_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := lower(
      regexp_replace(
        regexp_replace(
          unaccent(NEW.title || '-' || COALESCE(NEW.neighborhood, '') || '-santarem'),
          '[^a-z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      )
    );
    final_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM jobs WHERE slug = final_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Nota: unaccent extension necessária
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TRIGGER trg_jobs_slug
BEFORE INSERT OR UPDATE ON jobs
FOR EACH ROW EXECUTE FUNCTION generate_job_slug();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES: jobs (vagas)
-- ============================================================

-- Qualquer pessoa pode ver vagas ativas (site público + Astro SSG)
CREATE POLICY "jobs_public_read" ON jobs
  FOR SELECT USING (status = 'ativo');

-- Empresa pode ver suas próprias vagas (qualquer status)
CREATE POLICY "jobs_company_read_own" ON jobs
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM companies WHERE auth_user_id = auth.uid()
    )
  );

-- Empresa pode inserir vagas (ficam pendentes)
CREATE POLICY "jobs_company_insert" ON jobs
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE auth_user_id = auth.uid() AND status = 'ativo'
    )
  );

-- Empresa pode atualizar suas próprias vagas
CREATE POLICY "jobs_company_update" ON jobs
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM companies WHERE auth_user_id = auth.uid()
    )
  );

-- Admin pode fazer tudo
CREATE POLICY "jobs_admin_all" ON jobs
  FOR ALL USING (
    auth.uid() IN (SELECT auth_user_id FROM admin_users)
  );

-- ============================================================
-- RLS POLICIES: companies
-- ============================================================

-- Empresa pode ver e editar seus próprios dados
CREATE POLICY "companies_own_read" ON companies
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "companies_own_update" ON companies
  FOR UPDATE USING (auth_user_id = auth.uid());

-- Qualquer pessoa pode inserir (pré-cadastro público)
CREATE POLICY "companies_public_insert" ON companies
  FOR INSERT WITH CHECK (TRUE);

-- Admin pode ver e editar tudo
CREATE POLICY "companies_admin_all" ON companies
  FOR ALL USING (
    auth.uid() IN (SELECT auth_user_id FROM admin_users)
  );

-- ============================================================
-- RLS POLICIES: candidates
-- ============================================================

-- Candidato vê apenas seu próprio perfil
CREATE POLICY "candidates_own_read" ON candidates
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "candidates_own_update" ON candidates
  FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "candidates_own_insert" ON candidates
  FOR INSERT WITH CHECK (auth_user_id = auth.uid());

-- Empresa pode ver perfil profissional (sem dados pessoais) via applications
-- Isso é feito via Edge Function para garantir anonimização

-- Admin pode ver tudo
CREATE POLICY "candidates_admin_all" ON candidates
  FOR ALL USING (
    auth.uid() IN (SELECT auth_user_id FROM admin_users)
  );

-- ============================================================
-- RLS POLICIES: applications
-- ============================================================

-- Candidato vê suas próprias candidaturas
CREATE POLICY "applications_candidate_read" ON applications
  FOR SELECT USING (
    candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "applications_candidate_insert" ON applications
  FOR INSERT WITH CHECK (
    candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid())
  );

-- Empresa vê candidaturas das suas vagas
CREATE POLICY "applications_company_read" ON applications
  FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "applications_company_update" ON applications
  FOR UPDATE USING (
    company_id IN (SELECT id FROM companies WHERE auth_user_id = auth.uid())
  );

-- Admin pode ver tudo
CREATE POLICY "applications_admin_all" ON applications
  FOR ALL USING (
    auth.uid() IN (SELECT auth_user_id FROM admin_users)
  );

-- ============================================================
-- RLS POLICIES: blog_posts
-- ============================================================

-- Qualquer pessoa pode ver posts publicados
CREATE POLICY "blog_posts_public_read" ON blog_posts
  FOR SELECT USING (is_published = TRUE);

-- Admin pode fazer tudo
CREATE POLICY "blog_posts_admin_all" ON blog_posts
  FOR ALL USING (
    auth.uid() IN (SELECT auth_user_id FROM admin_users)
  );

-- ============================================================
-- RLS POLICIES: neighborhoods
-- ============================================================

-- Leitura pública
CREATE POLICY "neighborhoods_public_read" ON neighborhoods
  FOR SELECT USING (TRUE);

-- Admin pode editar
CREATE POLICY "neighborhoods_admin_all" ON neighborhoods
  FOR ALL USING (
    auth.uid() IN (SELECT auth_user_id FROM admin_users)
  );

-- ============================================================
-- SEED DATA: Bairros de Santarém
-- ============================================================
INSERT INTO neighborhoods (name, city, state, description, image_url) VALUES
  ('Centro', 'Santarém', 'PA', 'O Centro de Santarém concentra o maior número de vagas de emprego da cidade, com oportunidades em comércio, serviços, administração e tecnologia.', 'https://readdy.ai/api/search-image?query=Santarem%20Para%20Brazil%20city%20center%20downtown%20commercial%20street%20urban%20area%20daytime%20tropical%20Amazon%20region%20buildings%20movement%20people%20warm%20light&width=400&height=300&seq=n1&orientation=landscape'),
  ('Maracanã', 'Santarém', 'PA', 'O bairro Maracanã é um dos mais movimentados de Santarém, com forte presença do setor de alimentação, varejo e serviços.', 'https://readdy.ai/api/search-image?query=Santarem%20Para%20Brazil%20Maracana%20neighborhood%20residential%20street%20urban%20area%20daytime%20tropical%20Amazon%20region%20green%20trees%20houses%20warm%20light&width=400&height=300&seq=n2&orientation=landscape'),
  ('Jardim Santarém', 'Santarém', 'PA', 'Jardim Santarém é um bairro residencial em crescimento, com vagas em logística, construção civil e serviços gerais.', 'https://readdy.ai/api/search-image?query=Santarem%20Para%20Brazil%20Jardim%20neighborhood%20residential%20street%20urban%20area%20daytime%20tropical%20Amazon%20region%20houses%20gardens%20calm%20warm%20light&width=400&height=300&seq=n3&orientation=landscape'),
  ('Aldeia', 'Santarém', 'PA', 'O bairro Aldeia tem crescido rapidamente em Santarém, com novas empresas e oportunidades nas áreas de saúde, comércio e construção civil.', 'https://readdy.ai/api/search-image?query=Santarem%20Para%20Brazil%20Aldeia%20neighborhood%20residential%20street%20urban%20area%20daytime%20tropical%20Amazon%20region%20houses%20community%20warm%20light&width=400&height=300&seq=n4&orientation=landscape'),
  ('Santa Clara', 'Santarém', 'PA', 'Santa Clara é um bairro tradicional de Santarém com boas oportunidades em comércio local, serviços e administração.', 'https://readdy.ai/api/search-image?query=Santarem%20Para%20Brazil%20Santa%20Clara%20neighborhood%20residential%20commercial%20street%20urban%20area%20daytime%20tropical%20Amazon%20region%20warm%20light&width=400&height=300&seq=n5&orientation=landscape'),
  ('Aparecida', 'Santarém', 'PA', 'O bairro Aparecida oferece vagas em diversas áreas, com destaque para vendas, atendimento ao cliente e serviços gerais.', 'https://readdy.ai/api/search-image?query=Santarem%20Para%20Brazil%20Aparecida%20neighborhood%20residential%20street%20urban%20area%20daytime%20tropical%20Amazon%20region%20houses%20calm%20warm%20light&width=400&height=300&seq=n6&orientation=landscape');

-- ============================================================
-- VIEWS úteis para o frontend e Astro
-- ============================================================

-- View: vagas ativas com dados públicos (sem info da empresa)
CREATE VIEW public_jobs AS
SELECT
  j.id,
  j.slug,
  j.title,
  j.sector,
  j.area,
  j.contract_type,
  j.work_mode,
  j.neighborhood,
  j.city,
  j.state,
  j.salary_range,
  j.description,
  j.requirements,
  j.benefits,
  j.education_level,
  j.schedule,
  j.vacancies,
  j.tags,
  j.views_count,
  j.applicants_count,
  j.published_at,
  j.created_at,
  j.meta_title,
  j.meta_description
FROM jobs j
WHERE j.status = 'ativo';

-- View: estatísticas por bairro
CREATE VIEW neighborhood_stats AS
SELECT
  n.name,
  n.city,
  n.state,
  n.description,
  n.image_url,
  COUNT(j.id) AS job_count
FROM neighborhoods n
LEFT JOIN jobs j ON j.neighborhood = n.name AND j.status = 'ativo'
GROUP BY n.id, n.name, n.city, n.state, n.description, n.image_url;

-- ============================================================
-- COMENTÁRIOS (documentação inline)
-- ============================================================
COMMENT ON TABLE companies IS 'Empresas parceiras da VagasOeste. Status pendente = aguardando validação do admin.';
COMMENT ON TABLE jobs IS 'Vagas de emprego. Status pendente = aguardando aprovação após pré-cadastro da empresa.';
COMMENT ON TABLE candidates IS 'Candidatos cadastrados. Dados pessoais protegidos por RLS.';
COMMENT ON TABLE applications IS 'Candidaturas: relacionamento candidato ↔ vaga.';
COMMENT ON TABLE blog_posts IS 'Posts do blog VagasOeste. Indexados pelo Astro para SSG.';
COMMENT ON TABLE neighborhoods IS 'Bairros de Santarém com metadados para SEO programático.';
COMMENT ON COLUMN candidates.curriculo_data IS 'JSON com dados do currículo: {personal, experiences, education, courses, skills}';
COMMENT ON COLUMN applications.status_history IS 'Array JSON com histórico de mudanças de status: [{status, date, note}]';
COMMENT ON COLUMN jobs.tags IS 'Array de tags para busca e filtro: ["CLT", "Presencial", "Administrativo"]';
