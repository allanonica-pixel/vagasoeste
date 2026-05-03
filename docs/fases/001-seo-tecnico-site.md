# Fase 1 — SEO Técnico do Site (`apps/site`)

**Status:** em execução
**Aberta em:** 2026-05-03
**Prazo estimado:** 1-2 semanas (ritmo solo, alta disponibilidade)
**Papéis principais:** Frontend Site/SEO Sênior · Tech Lead · UI/UX (auxiliar) · DevOps (auxiliar)

---

## Contexto

O `apps/site` (Astro) é a vitrine pública e a porta de entrada orgânica do produto. O foco declarado é **ranqueamento orgânico em buscas locais e nacionais por vagas em Santarém/PA**.

A auditoria inicial (2026-05-03) revelou que **a base está sólida** — não há refundação de SEO necessária. Esta fase é de **hardening**: cobrir gaps específicos, padronizar schemas globais, otimizar performance crítica e estabelecer benchmark mensurável (Lighthouse).

---

## O que JÁ está implementado (não tocar)

- ✅ Astro 5+ com `@astrojs/sitemap` (priorities + filter de áreas privadas)
- ✅ `robots.txt` com bloqueios corretos (`/plataforma/`, `/empresa/`, `/admin/`, etc.)
- ✅ `BaseHead.astro` completo: title + description + OG + Twitter + geo tags + canonical
- ✅ `JobPosting` schema completo em `/vagas/[id]` (`baseSalary`, `hiringOrganization`, `jobLocation`, `validThrough`, `directApply`)
- ✅ `BreadcrumbList` em `/vagas/[id]` e `/vagas/[cidade]/[cargo]`
- ✅ `FAQPage` em `/vagas/[id]`
- ✅ `ItemList` em `/vagas/index` e `/vagas/[cidade]/[cargo]`
- ✅ `Blog` schema em `/blog/index`
- ✅ Páginas programáticas SSG `/vagas/[cidade]/[cargo]` por combinação real
- ✅ Internal linking entre cargos da mesma cidade
- ✅ Geo tags Santarém/PA (-2.4426, -54.7082)
- ✅ Vercel Web Analytics ativo

---

## Objetivos da Fase

### Objetivo primário
Atingir **Lighthouse Mobile**:
- SEO ≥ 95
- Performance ≥ 90
- Accessibility ≥ 95
- Best Practices ≥ 95

Em **todas** as páginas públicas: `/`, `/vagas`, `/vagas/[id]`, `/vagas/[cidade]/[cargo]`, `/blog`, `/blog/[slug]`, `/como-funciona`, `/para-empresas`, `/dicas-de-vaga`, `/crie-seu-curriculo`, `/interesse-empresa`.

### Objetivo secundário
Cobertura **completa** de schema.org com graph linkado por `@id`:
- `Organization` global (todas as páginas)
- `WebSite` + `SearchAction` (home — habilita sitelinks search box no Google)
- `LocalBusiness` (home — sinaliza presença local)
- `BlogPosting` por artigo (`/blog/[slug]`)
- Schema graph com `@id` consistente entre entidades

### Objetivo terciário
Performance crítica:
- Self-hosting de fontes (Inter) — eliminar request a `fonts.googleapis.com`
- Self-hosting de Remix Icons — eliminar request a `cdn.jsdelivr.net`
- `<Image>` do Astro nas imagens estáticas (otimização automática + AVIF/WebP)
- Preload do recurso LCP em cada página
- Cache headers explícitos via `vercel.json`

---

## Backlog detalhado da fase

### Bloco A — Schemas globais (alta prioridade SEO)

| ID | Tarefa | Critério de aceitação |
|---|---|---|
| A1 | Criar `src/lib/schemas/organization.ts` exportando schema `Organization` com `@id` `https://santarem.app/#organization` | Schema validado em [Schema.org Validator](https://validator.schema.org) |
| A2 | Injetar `Organization` automaticamente no `BaseHead` (sempre presente) | Toda página pública carrega o schema |
| A3 | Criar `WebSite` schema com `SearchAction` na home (URL template `/vagas?q={search_term_string}`) | Rich Results Test reconhece sitelinks search box |
| A4 | Criar `LocalBusiness` schema na home (subtipo `EmploymentAgency`, com `address`, `geo`, `areaServed`) | Validador OK |
| A5 | Criar `BlogPosting` schema individual em `/blog/[slug]` (com `author`, `datePublished`, `dateModified`, `image`, `articleBody`, `inLanguage`) | Rich Results aprovado como Article |
| A6 | Linkar todos os schemas via `@id` (graph) — Organization referenciada em hiringOrganization de JobPosting, em publisher do Blog, etc. | Graph navegável |
| A7 | Atualizar `JobPosting` para incluir `inLanguage: 'pt-BR'` | Validador OK |

### Bloco B — Performance crítica (Core Web Vitals)

| ID | Tarefa | Critério de aceitação |
|---|---|---|
| B1 | Substituir Google Fonts CDN por `@fontsource/inter` self-hosted | Bundle inclui woff2 local; zero request externo a fonts |
| B2 | Substituir Remix Icons CDN por `remixicon/fonts/remixicon.css` self-hosted (npm package) | Zero request externo a jsdelivr |
| B3 | Adicionar `<link rel="preload">` da fonte crítica (Inter 400) em `BaseHead` | Fonte carrega antes do FCP |
| B4 | Migrar `<img>` estáticos pra `<Image>` do `astro:assets` em hero, cards de blog, OG default | AVIF/WebP servidos automaticamente |
| B5 | Verificar e criar `og-default.jpg` (1200×630, ≤ 200kB) se não existir | OG image válida em test do Twitter/Facebook |
| B6 | Adicionar `loading="eager"` + `fetchpriority="high"` na imagem LCP de cada página | LCP < 2.5s mobile |
| B7 | Auditar e remover JavaScript não-utilizado em islands (review de cada island se realmente precisa de `client:load`) | Bundle JS por rota dentro de orçamento |

### Bloco C — Cache e edge

| ID | Tarefa | Critério de aceitação |
|---|---|---|
| C1 | Definir `Cache-Control` por tipo de rota em `apps/site/vercel.json`: HTML estático = `public, s-maxage=600, stale-while-revalidate=86400`; assets = `public, max-age=31536000, immutable` (já tem) | Headers corretos no curl de produção |
| C2 | Configurar ISR (`revalidate: 60`) nas páginas SSR `/vagas` e `/vagas/[id]` | Cache HIT no Vercel após primeiro acesso |

### Bloco D — Auditoria e benchmark

| ID | Tarefa | Critério de aceitação |
|---|---|---|
| D1 | PO roda Lighthouse Mobile em build local (`npm run build && npm run preview` + Chrome DevTools) das 11 páginas públicas | Tabela de scores antes/depois registrada nesta fase |
| D2 | Validar todos os schemas em [validator.schema.org](https://validator.schema.org) e [Rich Results Test](https://search.google.com/test/rich-results) | Zero erros, warnings documentados |
| D3 | Submeter `sitemap-index.xml` no Google Search Console (após deploy) | Indexação inicial em curso (post-deploy, fora do escopo da fase) |

---

## Definition of Done da Fase 1

- [ ] Bloco A: 7 itens fechados, schemas validados sem erro
- [ ] Bloco B: 7 itens fechados, fontes e ícones self-hosted, imagens otimizadas
- [ ] Bloco C: 2 itens fechados, headers verificados em build local
- [ ] Bloco D: scores Lighthouse Mobile registrados pra todas as 11 páginas, atingindo as metas
- [ ] Build production verificado em todos os workspaces (`npm run build` sem erro)
- [ ] Pipeline frontend obrigatório aplicado em qualquer arquivo `.astro` modificado (4-5 etapas)
- [ ] Identidade visual preservada (`#065f46`, `ri-*`, `rounded-xl/2xl`)
- [ ] Commit por bloco temático
- [ ] Push para `origin/master`
- [ ] Retrospectiva escrita no final deste documento

---

## Riscos identificados

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Self-hosting de fontes aumenta bundle inicial | Média | Médio | Subset Inter (latin only) + woff2 only |
| ISR no Vercel demora pra invalidar | Baixa | Baixo | Cache de 60s é curto, aceita inconsistência transitória |
| Schema graph mal-linkado quebra rich results existentes | Média | Alto | Testar cada mudança no Rich Results Test antes de commit |
| `<Image>` de Astro pode quebrar paths em SSR | Baixa | Médio | Testar em build (`npm run build`) antes de subir |

---

## Out of scope desta fase (rejeitado para fase futura)

- ❌ Internacionalização (hreflang en/es) — produto é Santarém/PA, PT-BR é suficiente. Reavaliar quando expansão regional vier.
- ❌ AMP — Google deprecated, sem ROI.
- ❌ Lighthouse CI no GitHub Actions — Fase 2 (Hardening de produção).
- ❌ Submissão ao Search Console — depende de deploy em PROD, Fase 3.
- ❌ Páginas hub temáticas adicionais (`/vagas-clt`, `/vagas-meio-periodo`, `/jovem-aprendiz`) — depende de volume de vagas reais. Reavaliar pós-lançamento.
- ❌ Backlinks / outreach / link building — fora de engenharia, é estratégia de marketing.

---

## Status semanal (mais recente no topo)

### Semana de 2026-05-03 (abertura)
**Status:** Fase aberta. Auditoria do estado atual concluída — base muito sólida, gaps focados em schemas globais + performance + benchmark Lighthouse. Iniciando pelo Bloco A.

---

## Retrospectiva (preencher ao fechar a fase)

*A ser preenchida quando todos os blocos estiverem ✅ e Lighthouse atingir as metas.*

- O que funcionou:
- O que não funcionou:
- ADRs gerados nesta fase:
- Dívidas técnicas registradas:
