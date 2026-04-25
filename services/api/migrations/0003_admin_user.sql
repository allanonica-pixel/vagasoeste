-- ============================================================
-- Configuração do usuário admin no Supabase Auth
-- Rodar no SQL Editor do Supabase (com permissão service_role)
-- ============================================================

-- PASSO 1: Crie o usuário admin pelo painel do Supabase:
--   Authentication → Users → Add user
--   Email: <seu-email-admin>
--   Senha: <senha-forte>
--   "Auto Confirm User": ✅ marcado
--
-- PASSO 2: Após criar, copie o UUID do usuário e rode este UPDATE:

UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'vagas@vagasoeste.com.br'; -- substituir pelo email real do admin

-- Verificar se ficou correto:
SELECT id, email, raw_app_meta_data
FROM auth.users
WHERE email = 'vagas@vagasoeste.com.br';

-- ============================================================
-- PASSO 3 (opcional): Criar usuário empresa de exemplo
-- Quando uma empresa for aprovada, configurar o role via API:
-- ============================================================
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"role": "empresa", "company_id": "<uuid-da-empresa>"}'::jsonb
-- WHERE email = 'empresa@exemplo.com.br';
