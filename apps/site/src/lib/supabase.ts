import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis PUBLIC_SUPABASE_URL e PUBLIC_SUPABASE_ANON_KEY são obrigatórias.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/** Cria cliente Supabase com cookies SSR (para páginas Astro com prerender=false) */
export function createServerSupabaseClient(cookies: {
  get: (key: string) => string | undefined;
}) {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      storage: {
        getItem: (key: string) => cookies.get(key) ?? null,
        setItem: () => {},
        removeItem: () => {},
      },
    },
  });
}
