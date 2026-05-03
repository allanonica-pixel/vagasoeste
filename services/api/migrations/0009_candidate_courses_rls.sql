-- =============================================================
-- Migration 0009: RLS policies para candidate_courses
-- =============================================================
-- A tabela candidate_courses tem RLS habilitado (via supabase-schema.sql)
-- mas nenhuma policy foi definida — bloqueando leitura/escrita para candidatos.
-- Esta migration adiciona as 4 políticas necessárias + admin full access.
-- =============================================================

-- Candidato lê apenas seus próprios cursos
CREATE POLICY "candidate_courses_own_read" ON candidate_courses
  FOR SELECT USING (
    candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid())
  );

-- Candidato insere cursos em seu próprio perfil
CREATE POLICY "candidate_courses_own_insert" ON candidate_courses
  FOR INSERT WITH CHECK (
    candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid())
  );

-- Candidato atualiza seus próprios cursos
CREATE POLICY "candidate_courses_own_update" ON candidate_courses
  FOR UPDATE USING (
    candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid())
  );

-- Candidato remove seus próprios cursos
CREATE POLICY "candidate_courses_own_delete" ON candidate_courses
  FOR DELETE USING (
    candidate_id IN (SELECT id FROM candidates WHERE auth_user_id = auth.uid())
  );

-- Admin acessa tudo (usa is_admin() SECURITY DEFINER da migration 0006)
CREATE POLICY "candidate_courses_admin_all" ON candidate_courses
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());
