# ============================================================
# Build stage
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copia package.json e instala todas as deps (incluindo devDeps para o build)
COPY package.json ./
RUN npm install

# Copia código fonte e compila com tsup
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ============================================================
# Runtime stage — imagem final mínima
# ============================================================
FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

# Copia apenas o bundle compilado e instala só as deps de produção
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts

COPY --from=builder /app/dist ./dist

# Usuário não-root por segurança
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["node", "dist/index.js"]
