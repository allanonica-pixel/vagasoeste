# VagasOeste — Gestão de Segredos e Variáveis de Ambiente

> Versão: 1.0 | Data: 2026-04-25

---

## Catálogo completo de variáveis

### API (services/api — Fly.io secrets)

| Variável | Classificação | Descrição | Rotação |
|----------|--------------|-----------|---------|
| `SUPABASE_URL` | Pública* | URL do projeto Supabase | Apenas se migrar projeto |
| `SUPABASE_ANON_KEY` | Pública* | Chave pública para Auth flows | Semestral ou se exposta |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secreto** | Bypass total de RLS — server-side only | Trimestral ou se exposta |
| `DATABASE_URL` | **Secreto** | Conexão direta ao Postgres | Trimestral ou se exposta |
| `ALLOWED_ORIGINS` | Configuração | Origens CORS permitidas | A cada novo domínio |
| `API_SECRET` | Secreto | Token interno (uso futuro) | Semestral |
| `NODE_ENV` | Configuração | `production` em prod | Nunca muda |
| `PORT` | Configuração | `8080` (Fly.io padrão) | Nunca muda |
| `LOG_LABEL` | Configuração | `api-prod` | Nunca muda |

*Pública = pode aparecer em JS bundle; não é sensível mas não deve ser exposta em logs desnecessariamente.

### Platform (apps/platform — Vercel env vars)

| Variável | Classificação | Quem vê |
|----------|--------------|---------|
| `VITE_SUPABASE_URL` | Pública | Bundle do React (build-time) |
| `VITE_SUPABASE_ANON_KEY` | Pública | Bundle do React (build-time) |
| `VITE_API_URL` | Pública | Bundle do React |
| `VITE_PUBLIC_SITE_URL` | Pública | Bundle do React |

### Site (apps/site — Vercel env vars)

| Variável | Classificação | Quem vê |
|----------|--------------|---------|
| `PUBLIC_SUPABASE_URL` | Pública | Bundle Astro (build-time) |
| `PUBLIC_SUPABASE_ANON_KEY` | Pública | Bundle Astro (build-time) |
| `PUBLIC_SITE_URL` | Pública | Bundle Astro |
| `PUBLIC_APP_URL` | Pública | Bundle Astro |

---

## Regras invioláveis

### O que NUNCA fazer

```bash
# ❌ NUNCA commitar .env real
git add .env
git add apps/platform/.env

# ❌ NUNCA passar service_role para o frontend
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJ...  # catastrófico

# ❌ NUNCA logar secrets (pino redact já protege, mas cuidado com logs manuais)
console.log('DATABASE_URL:', process.env.DATABASE_URL)

# ❌ NUNCA expor service_role no fly.toml (usar fly secrets set)
[env]
  SUPABASE_SERVICE_ROLE_KEY = "eyJ..."  # errado!
```

### O que SEMPRE fazer

```bash
# ✅ Secrets via Fly.io CLI
fly secrets set SUPABASE_SERVICE_ROLE_KEY="eyJ..." -a vagasoeste-api
fly secrets set DATABASE_URL="postgres://..." -a vagasoeste-api

# ✅ Verificar que secrets estão configurados (não revela os valores)
fly secrets list -a vagasoeste-api

# ✅ Variáveis públicas via Vercel Dashboard (não secrets)
# Settings > Environment Variables > Production

# ✅ .env.example com placeholders (sem valores reais)
SUPABASE_SERVICE_ROLE_KEY=eyJ_SUBSTITUA_AQUI
```

---

## Como gerar `API_SECRET`

```bash
openssl rand -base64 32
# Exemplo de saída: sC3kL2mP9nWqR7vX1jY4hE6bT0oA8dF5gN2pZ
```

---

## Procedimento de rotação de segredos

### Em caso de vazamento suspeito

```bash
# 1. Verificar se service_role está no bundle de produção
grep -r "service_role" apps/platform/out/ 2>/dev/null
grep -r "service_role" apps/site/dist/  2>/dev/null

# 2. Verificar se .env está no git
git log --all --full-history -- "**/.env" | head -20

# 3. Se confirmado vazamento:
#    a. Ir ao Supabase Dashboard > Settings > API > Regenerate service_role key
#    b. Atualizar no Fly.io imediatamente:
fly secrets set SUPABASE_SERVICE_ROLE_KEY="nova_chave" -a vagasoeste-api

#    c. Regenerar DATABASE_URL se necessário:
#       Supabase Dashboard > Settings > Database > Connection string
fly secrets set DATABASE_URL="nova_url" -a vagasoeste-api

#    d. Verificar audit.event_log para atividades suspeitas
```

### Rotação regular (trimestral)

```bash
# 1. Supabase Dashboard: Settings > API
# → Copiar nova service_role key

# 2. Atualizar Fly.io
fly secrets set SUPABASE_SERVICE_ROLE_KEY="nova_chave" -a vagasoeste-api

# 3. Verificar health após deploy
curl https://api.santarem.app/health

# 4. Testar login de empresa (valida que service_role nova funciona)
```

---

## Verificação de segurança dos secrets

### Script de auditoria completo

```bash
#!/bin/bash
echo "=== Auditoria de segredos VagasOeste ==="

echo ""
echo "[1] .env no git?"
git ls-files | grep -E "^\.env$|/\.env$" \
  && echo "⚠️  ALERTA: .env rastreado pelo git!" \
  || echo "✅ OK"

echo ""
echo "[2] service_role no bundle da platform?"
if [ -d "apps/platform/out" ]; then
  grep -r "service_role" apps/platform/out/ 2>/dev/null \
    && echo "⚠️  ALERTA: chave exposta no bundle!" \
    || echo "✅ OK"
else
  echo "⏭  Skipped (build não encontrado)"
fi

echo ""
echo "[3] service_role no bundle do site?"
if [ -d "apps/site/dist" ]; then
  grep -r "service_role" apps/site/dist/ 2>/dev/null \
    && echo "⚠️  ALERTA: chave exposta no bundle!" \
    || echo "✅ OK"
else
  echo "⏭  Skipped (build não encontrado)"
fi

echo ""
echo "[4] Fly.io secrets configurados?"
fly secrets list -a vagasoeste-api 2>/dev/null \
  && echo "✅ OK" \
  || echo "⚠️  Não foi possível verificar (fly CLI não autenticado?)"

echo ""
echo "[5] /health não expõe env?"
HEALTH=$(curl -s https://api.santarem.app/health)
echo "$HEALTH" | grep -E '"env"|"NODE_ENV"|"message"' \
  && echo "⚠️  ALERTA: /health expõe dados internos!" \
  || echo "✅ OK"

echo ""
echo "=== Auditoria concluída ==="
```

---

## Migração de domínio (santarem.app → vagasoeste.com.br)

Quando o domínio definitivo entrar:

```bash
# 1. Atualizar ALLOWED_ORIGINS na API
fly secrets set ALLOWED_ORIGINS="https://vagasoeste.com.br,https://app.vagasoeste.com.br" -a vagasoeste-api

# 2. Atualizar Supabase Auth Redirect URLs
# Dashboard > Authentication > URL Configuration

# 3. Atualizar variáveis de ambiente no Vercel
# VITE_PUBLIC_SITE_URL=https://vagasoeste.com.br
# PUBLIC_SITE_URL=https://vagasoeste.com.br
# PUBLIC_APP_URL=https://app.vagasoeste.com.br

# 4. Atualizar vercel.json (rewrites de santarem.app → vagasoeste.com.br)

# Nota: as chaves do Supabase NÃO mudam — são do projeto, não do domínio
```
