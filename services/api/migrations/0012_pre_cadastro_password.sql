-- =============================================================================
-- Migration 0012: Adiciona campo contact_password em empresa_pre_cadastros
--
-- Armazena a senha desejada pelo responsável no pré-cadastro para que o
-- administrador possa utilizá-la ao criar a conta na plataforma.
-- Rodar no Supabase SQL Editor (DEV e PROD)
-- =============================================================================

ALTER TABLE empresa_pre_cadastros
  ADD COLUMN IF NOT EXISTS contact_password text;
