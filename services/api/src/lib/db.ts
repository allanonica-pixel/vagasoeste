import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema/index.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não definida. Verifique o .env');
}

// Pool de conexões — postgres.js gerencia internamente
const client = postgres(process.env.DATABASE_URL, {
  max: 10,                  // máximo de conexões simultâneas
  idle_timeout: 30,         // fecha conexões ociosas em 30s
  connect_timeout: 10,      // timeout de conexão em 10s
  ssl: 'require',              // Supabase exige SSL sempre (inclusive em dev)
});

export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});

export type DB = typeof db;
