/**
 * Script de migração para o novo projeto DEV Pro (vagasoeste-dev)
 * OnicaSistemasPro | snwqnoljfbppxnofkkyd
 *
 * Uso: node run-migrations-dev-pro.mjs
 */

import postgres from 'postgres';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DB_URL = 'postgresql://postgres:d8XDdQ8Nx03Y6Fdz@db.snwqnoljfbppxnofkkyd.supabase.co:5432/postgres';

const sql = postgres(DB_URL, {
  ssl: 'require',
  max: 1,
  idle_timeout: 30,
  connect_timeout: 20,
  // Permite executar múltiplos statements
  max_lifetime: 60 * 5,
});

function loadSQL(relativePath) {
  const absPath = resolve(__dirname, relativePath);
  return readFileSync(absPath, 'utf8');
}

// Executar um bloco de SQL ignorando erros de "já existe"
async function runBlock(label, query) {
  process.stdout.write(`  ▶ ${label} ... `);
  try {
    await sql.unsafe(query);
    console.log('✅');
    return true;
  } catch (err) {
    const msg = (err.message || '').toLowerCase();
    const isIdempotent =
      msg.includes('already exists') ||
      msg.includes('does not exist') ||
      msg.includes('duplicate key') ||
      msg.includes('já existe');
    if (isIdempotent) {
      console.log(`⚠️  Skipped (${err.message.split('\n')[0].trim()})`);
      return true;
    }
    console.log(`❌\n    ERRO: ${err.message.split('\n')[0]}`);
    throw err;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  VagasOeste — Migration DEV Pro');
  console.log('  Projeto: vagasoeste-dev (OnicaSistemasPro)');
  console.log('  Ref: snwqnoljfbppxnofkkyd');
  console.log('═══════════════════════════════════════════════════════════');

  // ── Teste de conexão ─────────────────────────────────────────────
  console.log('\n[0] Testando conexão...');
  const [{ version }] = await sql`SELECT version()`;
  console.log(`  ✅ ${version.split(',')[0]}`);

  // ── [1] Schema base ──────────────────────────────────────────────
  console.log('\n[1/5] Schema base (supabase-schema.sql)');
  const schema = loadSQL('../../../supabase-schema.sql');
  await runBlock('Extensões, tabelas, triggers, RLS, seed bairros', schema);

  // ── [2] Migration 0001 — audit/media/ops ─────────────────────────
  console.log('\n[2/5] 0001_audit_media_functions.sql');
  const m1 = loadSQL('../migrations/0001_audit_media_functions.sql');
  await runBlock('Schemas audit/media/ops + funções apply_to_job/publish_job/purge_expired', m1);

  // ── [3] Migration 0004 — security hardening ───────────────────────
  console.log('\n[3/5] 0004_security_hardening.sql (bloco a bloco)');

  await runBlock('DROP + CREATE POLICY companies_public_insert', `
    DROP POLICY IF EXISTS "companies_public_insert" ON companies;
    CREATE POLICY "companies_public_insert" ON companies
      FOR INSERT WITH CHECK (
        status = 'pendente'
        AND cnpj IS NOT NULL
        AND email IS NOT NULL
        AND razao_social IS NOT NULL
      );
  `);

  await runBlock('INDEX idx_rate_limit_window_start em ops.rate_limit', `
    CREATE INDEX IF NOT EXISTS idx_rate_limit_window_start ON ops.rate_limit (window_start);
  `);

  // COMMENT ON INDEX precisa do schema qualificado
  await runBlock('COMMENT no índice rate_limit', `
    COMMENT ON INDEX ops.idx_rate_limit_window_start
      IS 'Acelera o job de cleanup do pg_cron que deleta entradas antigas do rate limit';
  `);

  await runBlock('REVOKE INSERT/UPDATE/DELETE em tabelas sensíveis (anon)', `
    REVOKE INSERT, UPDATE, DELETE ON candidates         FROM anon;
    REVOKE INSERT, UPDATE, DELETE ON candidate_courses  FROM anon;
    REVOKE INSERT, UPDATE, DELETE ON candidate_requests FROM anon;
    REVOKE INSERT, UPDATE, DELETE ON applications       FROM anon;
    REVOKE ALL                     ON admin_users        FROM anon;
    REVOKE ALL ON ALL TABLES IN SCHEMA ops   FROM anon;
    REVOKE ALL ON ALL TABLES IN SCHEMA audit FROM anon;
    REVOKE ALL ON ALL TABLES IN SCHEMA media FROM anon;
  `);

  await runBlock('GRANT SELECT em tabelas públicas (anon)', `
    GRANT SELECT ON public_jobs        TO anon;
    GRANT SELECT ON neighborhood_stats TO anon;
    GRANT SELECT ON neighborhoods      TO anon;
    GRANT SELECT ON blog_posts         TO anon;
  `);

  await runBlock('COMMENT nas políticas de segurança', `
    COMMENT ON POLICY "companies_public_insert" ON companies
      IS 'Insert público limitado: apenas status=pendente com campos obrigatórios. Rate limit na API impede spam.';
  `);

  // ── [4] Migration 0005 — OTP + empresa_pre_cadastros ─────────────
  console.log('\n[4/5] 0005_interesse_empresa.sql');
  const m5 = loadSQL('../migrations/0005_interesse_empresa.sql');
  await runBlock('otp_codes + empresa_pre_cadastros + cleanup_expired_otps()', m5);

  // ── [5] Migration 0006 — is_admin() + RLS ────────────────────────
  console.log('\n[5/5] 0006_fix_rls_admin_permissions.sql');
  const m6 = loadSQL('../migrations/0006_fix_rls_admin_permissions.sql');
  await runBlock('is_admin() SECURITY DEFINER + 6 políticas RLS recriadas', m6);

  // ── Verificação final ─────────────────────────────────────────────
  console.log('\n[✓] Verificando tabelas criadas...');
  const tables = await sql`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `;
  const tableNames = tables.map(t => t.tablename);
  const expected = ['admin_users','applications','blog_posts','candidate_courses',
    'candidate_requests','candidates','companies','jobs','neighborhoods','otp_codes',
    'empresa_pre_cadastros'];
  const missing = expected.filter(t => !tableNames.includes(t));
  if (missing.length === 0) {
    console.log(`  ✅ Todas as ${tableNames.length} tabelas confirmadas`);
  } else {
    console.log(`  ⚠️  Tabelas faltando: ${missing.join(', ')}`);
  }

  const schemas = await sql`
    SELECT schema_name FROM information_schema.schemata
    WHERE schema_name IN ('audit','media','ops','company')
    ORDER BY schema_name;
  `;
  console.log(`  ✅ Schemas: ${schemas.map(s => s.schema_name).join(', ')}`);

  const bairros = await sql`SELECT count(*) FROM neighborhoods`;
  console.log(`  ✅ Bairros seed: ${bairros[0].count} registros`);

  // ── Resumo ────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  ✅ Migrations concluídas com sucesso!');
  console.log('\n  PRÓXIMOS PASSOS MANUAIS (pelo Dashboard Supabase):');
  console.log('');
  console.log('  A) Habilitar pg_cron:');
  console.log('     Database → Extensions → pg_cron → Enable');
  console.log('     Depois: SQL Editor → executar 0002_cron_jobs.sql');
  console.log('');
  console.log('  B) Criar usuário Admin:');
  console.log('     Authentication → Users → Add user');
  console.log('     Email: seu-email@dominio.com | Auto Confirm: ✅');
  console.log('     Depois: SQL Editor → executar:');
  console.log(`     UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb WHERE email = 'seu-email@dominio.com';`);
  console.log('');
  console.log('  C) Configurar SMTP (Resend):');
  console.log('     Settings → Auth → SMTP Settings');
  console.log('     Host: smtp.resend.com | Port: 465 | User: resend');
  console.log('     Password: sua_api_key_resend | From: noreply@santarem.app');
  console.log('');
  console.log('  D) Atualizar .env dos projetos (instruções no output abaixo)');
  console.log('═══════════════════════════════════════════════════════════\n');

  await sql.end();
}

main().catch(async (err) => {
  console.error('\n❌ Migration abortada:', err.message);
  await sql.end();
  process.exit(1);
});
