-- ── Migration 0018 — Seed dos 27 estados brasileiros ──────────────────────────
-- Pré-popula a tabela 'estados' com todos os estados + DF, todos como
-- inativos por padrão. O admin ativa apenas os estados em que opera.
--
-- Idempotente: usa ON CONFLICT (uf) DO NOTHING — pode rodar várias vezes
-- sem duplicar (UF é UNIQUE).

INSERT INTO estados (uf, nome, ativo) VALUES
  ('AC', 'Acre',                false),
  ('AL', 'Alagoas',             false),
  ('AP', 'Amapá',               false),
  ('AM', 'Amazonas',            false),
  ('BA', 'Bahia',               false),
  ('CE', 'Ceará',               false),
  ('DF', 'Distrito Federal',    false),
  ('ES', 'Espírito Santo',      false),
  ('GO', 'Goiás',               false),
  ('MA', 'Maranhão',            false),
  ('MT', 'Mato Grosso',         false),
  ('MS', 'Mato Grosso do Sul',  false),
  ('MG', 'Minas Gerais',        false),
  ('PA', 'Pará',                true),  -- Pará já ativo (é o foco inicial do produto)
  ('PB', 'Paraíba',             false),
  ('PR', 'Paraná',              false),
  ('PE', 'Pernambuco',          false),
  ('PI', 'Piauí',               false),
  ('RJ', 'Rio de Janeiro',      false),
  ('RN', 'Rio Grande do Norte', false),
  ('RS', 'Rio Grande do Sul',   false),
  ('RO', 'Rondônia',            false),
  ('RR', 'Roraima',             false),
  ('SC', 'Santa Catarina',      false),
  ('SP', 'São Paulo',           false),
  ('SE', 'Sergipe',             false),
  ('TO', 'Tocantins',           false)
ON CONFLICT (uf) DO NOTHING;
