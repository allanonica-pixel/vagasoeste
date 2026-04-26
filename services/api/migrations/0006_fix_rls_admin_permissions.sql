-- =============================================================
-- Migration 0006: Corrige "permission denied for table admin_users"
-- =============================================================
-- PROBLEMA: As políticas RLS de jobs, companies, candidates, applications,
-- blog_posts e neighborhoods referenciam admin_users diretamente.
-- O role anon/authenticated não tem SELECT em admin_users, então o
-- PostgreSQL lança "permission denied" ao avaliar essas políticas,
-- derrubando até as queries de leitura pública (ex: vagas ativas).
--
-- SOLUÇÃO: Função SECURITY DEFINER is_admin() — executa com os
-- privilégios do owner (postgres/supabase_admin), não do caller.
-- Anon pode chamar a função sem precisar de acesso direto à tabela.
-- =============================================================

-- 1. Criar função helper is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid()
  );
$$;

-- Permitir que anon e authenticated chamem a função
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- =============================================================
-- 2. Recriar políticas que referenciam admin_users usando is_admin()
-- =============================================================

-- jobs
DROP POLICY IF EXISTS "jobs_admin_all" ON jobs;
CREATE POLICY "jobs_admin_all" ON jobs
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- companies
DROP POLICY IF EXISTS "companies_admin_all" ON companies;
CREATE POLICY "companies_admin_all" ON companies
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- candidates
DROP POLICY IF EXISTS "candidates_admin_all" ON candidates;
CREATE POLICY "candidates_admin_all" ON candidates
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- applications
DROP POLICY IF EXISTS "applications_admin_all" ON applications;
CREATE POLICY "applications_admin_all" ON applications
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- blog_posts
DROP POLICY IF EXISTS "blog_posts_admin_all" ON blog_posts;
CREATE POLICY "blog_posts_admin_all" ON blog_posts
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- neighborhoods
DROP POLICY IF EXISTS "neighborhoods_admin_all" ON neighborhoods;
CREATE POLICY "neighborhoods_admin_all" ON neighborhoods
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());
