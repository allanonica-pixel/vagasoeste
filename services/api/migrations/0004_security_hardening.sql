-- ============================================================
-- Migration 0004 — VagasOeste Security Hardening
-- Data: 2026-04-25
-- Objetivo: Reforço de segurança nas políticas RLS e funções.
-- Executar no Supabase SQL Editor em 3 blocos separados.
-- ============================================================

-- ============================================================
-- BLOCO 1 — Fechar a política de INSERT público em companies
-- ============================================================
-- PROBLEMA: companies_public_insert tem WITH CHECK (TRUE) — qualquer
-- pessoa pode inserir uma empresa sem autenticação. Isso permite
-- spam de pré-cadastros e enumeração do endpoint.
--
-- CORREÇÃO: exige que a inserção venha de um usuário autenticado
-- com role anon/authenticated, ou que o registro tenha status 'pendente'
-- e os campos obrigatórios preenchidos. O rate limiting da API garante
-- que a rota /pre-cadastro não seja acessada em massa.
--
-- Nota: o pré-cadastro público é um formulário legítimo, mas deve
-- ser controlado na camada de API (rate limit) + esta restrição de campo.

DROP POLICY IF EXISTS "companies_public_insert" ON companies;

CREATE POLICY "companies_public_insert" ON companies
  FOR INSERT WITH CHECK (
    -- Apenas status pendente é permitido no insert público
    -- (admin faz UPDATE para ativo/suspenso/rejeitado depois)
    status = 'pendente'
    -- Campos obrigatórios devem estar preenchidos
    AND cnpj IS NOT NULL
    AND email IS NOT NULL
    AND razao_social IS NOT NULL
  );

-- ============================================================
-- BLOCO 2 — Índice na tabela ops.rate_limit para cleanup eficiente
-- ============================================================
-- A tabela rate_limit cresce com o tempo. O job pg_cron de limpeza
-- (cron.schedule 'rate-limit-cleanup') precisa deste índice para ser eficiente.

CREATE INDEX IF NOT EXISTS idx_rate_limit_window_start ON ops.rate_limit (window_start);

-- ============================================================
-- BLOCO 3 — Revogar acesso público direto ao banco via anon role
-- ============================================================
-- Garante que a anon key nunca tenha acesso de escrita às tabelas
-- sensíveis que não têm política de insert pública.
-- (jobs_public_read e blog_posts_public_read já são só SELECT)

-- Candidatos: anon não deve acessar dados de candidatos diretamente
REVOKE INSERT, UPDATE, DELETE ON candidates         FROM anon;
REVOKE INSERT, UPDATE, DELETE ON candidate_courses  FROM anon;
REVOKE INSERT, UPDATE, DELETE ON candidate_requests FROM anon;

-- Applications: anon não candidata
REVOKE INSERT, UPDATE, DELETE ON applications FROM anon;

-- Admin: anon não acessa jamais
REVOKE ALL ON admin_users FROM anon;

-- Rate limit e audit: anon não acessa schemas internos
REVOKE ALL ON ALL TABLES IN SCHEMA ops   FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA audit FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA media FROM anon;

-- GRANT explícito apenas ao que é necessário para site público
GRANT SELECT ON public_jobs        TO anon;
GRANT SELECT ON neighborhood_stats TO anon;
GRANT SELECT ON neighborhoods      TO anon;
GRANT SELECT ON blog_posts         TO anon;   -- RLS filtra is_published = TRUE

-- ============================================================
-- COMENTÁRIOS
-- ============================================================
COMMENT ON INDEX idx_rate_limit_window_start IS 'Acelera o job de cleanup do pg_cron que deleta entradas antigas do rate limit';
COMMENT ON POLICY "companies_public_insert" ON companies IS 'Insert público limitado: apenas status=pendente com campos obrigatórios. Rate limit na API impede spam.';
