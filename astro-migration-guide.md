# VagasOeste — Guia de Migração para Astro
## Site Público com SEO Avançado + Integração com Plataformas React

> Versão: 1.0 | Abril 2026  
> Documento técnico e estrutural para migração do site público VagasOeste de React SPA para Astro, mantendo as plataformas privadas (Candidato, Empresa, Admin) em React.

---

## 1. Por Que Migrar o Site Público para Astro?

### Problema Atual (React SPA)

O site público VagasOeste roda hoje como uma **Single Page Application (SPA)** em React. Isso significa:

- **JavaScript executa no cliente** — o Google precisa renderizar JS para indexar o conteúdo
- **Sem HTML estático** — o `<head>` com title/description/Schema.org é gerado em runtime
- **Core Web Vitals prejudicados** — LCP alto, FID alto, CLS instável
- **Sem sitemap dinâmico** — Google não descobre novas vagas e artigos automaticamente
- **Sem páginas programáticas** — impossível gerar `/vagas/santarem/vendedor` estaticamente

### O Que Astro Resolve

| Problema React SPA | Solução Astro |
|--------------------|--------------|
| JS no cliente para renderizar conteúdo | HTML puro gerado no servidor (SSG/SSR) |
| Meta tags dinâmicas difíceis | `<head>` nativo em cada `.astro` |
| Sem sitemap automático | `@astrojs/sitemap` gera automaticamente |
| Vagas não indexadas | Cada vaga vira uma página HTML estática |
| Blog sem SEO real | Artigos com HTML completo, sem JS |
| LCP alto | Zero JS por padrão — carregamento instantâneo |
| Schema.org manual | Injetado diretamente no `<head>` de cada página |

### Resultado Esperado

- **Lighthouse SEO: 100/100** em todas as páginas públicas
- **LCP < 1.5s** nas páginas de vagas e blog
- **Indexação imediata** de novas vagas pelo Google
- **Ranqueamento local** para "vagas em Santarém", "emprego Santarém PA"
- **Páginas programáticas** por bairro + cargo (ex: `/vagas/santarem/vendedor`)

---

## 2. Arquitetura da Solução — Dois Projetos Separados

A estratégia é manter **dois projetos distintos** que se comunicam via URL e API compartilhada (Supabase):

```
vagasoeste.com.br/          → Astro (site público, SSG/SSR)
vagasoeste.com.br/plataforma → React SPA (candidato)
vagasoeste.com.br/empresa    → React SPA (empresa)
vagasoeste.com.br/admin      → React SPA (admin)
vagasoeste.com.br/login      → React SPA (auth)
vagasoeste.com.br/cadastro   → React SPA (auth)
```

### Opção A — Subdomínio (mais simples)

```
vagasoeste.com.br/          → Astro (Vercel/Netlify)
app.vagasoeste.com.br/      → React SPA (Vercel/Netlify)
```

**Vantagens:** Deploy independente, sem conflito de rotas  
**Desvantagens:** Subdomínio diferente pode confundir usuários

### Opção B — Mesmo Domínio com Proxy Reverso (recomendada)

```
vagasoeste.com.br/          → Astro
vagasoeste.com.br/plataforma → React (proxy via Vercel rewrites)
vagasoeste.com.br/empresa    → React (proxy via Vercel rewrites)
vagasoeste.com.br/admin      → React (proxy via Vercel rewrites)
vagasoeste.com.br/login      → React (proxy via Vercel rewrites)
vagasoeste.com.br/cadastro   → React (proxy via Vercel rewrites)
```

**Vantagens:** Mesmo domínio, melhor UX, cookies compartilhados  
**Desvantagens:** Requer configuração de proxy no Vercel/Nginx

#### Configuração Vercel (`vercel.json` no projeto Astro)

```json
{
  "rewrites": [
    {
      "source": "/plataforma/:path*",
      "destination": "https://app.vagasoeste.com.br/plataforma/:path*"
    },
    {
      "source": "/empresa/:path*",
      "destination": "https://app.vagasoeste.com.br/empresa/:path*"
    },
    {
      "source": "/admin/:path*",
      "destination": "https://app.vagasoeste.com.br/admin/:path*"
    },
    {
      "source": "/login",
      "destination": "https://app.vagasoeste.com.br/login"
    },
    {
      "source": "/cadastro/:path*",
      "destination": "https://app.vagasoeste.com.br/cadastro/:path*"
    }
  ]
}
```

---

## 3. Estrutura do Projeto Astro

### Instalação e Configuração

```bash
# Criar projeto Astro
npm create astro@latest vagasoeste-public
cd vagasoeste-public

# Integrações essenciais
npx astro add tailwind
npx astro add sitemap
npx astro add react          # Para ilhas interativas
npx astro add vercel         # Adapter para SSR/SSG no Vercel

# Dependências
npm install @supabase/supabase-js
npm install @astrojs/image
```

### `astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://vagasoeste.com.br',
  output: 'hybrid',          // SSG por padrão, SSR onde necessário
  adapter: vercel(),
  integrations: [
    tailwind(),
    sitemap({
      customPages: [
        'https://vagasoeste.com.br/',
        'https://vagasoeste.com.br/vagas',
        'https://vagasoeste.com.br/blog',
        'https://vagasoeste.com.br/como-funciona',
        'https://vagasoeste.com.br/para-empresas',
        'https://vagasoeste.com.br/dicas-de-vaga',
      ],
      filter: (page) => !page.includes('/admin') && !page.includes('/plataforma'),
    }),
    react(),
  ],
});
```

### Estrutura de Pastas Astro

```
vagasoeste-astro/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── og-image.jpg
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.astro          # Navbar estática
│   │   │   ├── Footer.astro          # Footer estático
│   │   │   └── BaseHead.astro        # <head> com SEO
│   │   ├── sections/
│   │   │   ├── HeroSection.astro
│   │   │   ├── JobsSection.astro
│   │   │   ├── HowItWorksSection.astro
│   │   │   └── TestimonialsSection.astro
│   │   ├── cards/
│   │   │   ├── JobCard.astro
│   │   │   └── BlogCard.astro
│   │   └── islands/                  # Componentes React interativos
│   │       ├── JobsFilter.tsx        # Filtros de vagas (client:load)
│   │       ├── BlogSearch.tsx        # Busca do blog (client:load)
│   │       ├── NewsletterForm.tsx    # Formulário (client:load)
│   │       └── CandidatureModal.tsx  # Modal de candidatura (client:load)
│   ├── layouts/
│   │   ├── BaseLayout.astro          # Layout base com head + navbar + footer
│   │   └── BlogLayout.astro          # Layout específico para artigos
│   ├── pages/
│   │   ├── index.astro               # /
│   │   ├── vagas/
│   │   │   ├── index.astro           # /vagas
│   │   │   └── [id].astro            # /vagas/:id (SSR)
│   │   ├── blog/
│   │   │   ├── index.astro           # /blog
│   │   │   └── [slug].astro          # /blog/:slug
│   │   ├── como-funciona.astro       # /como-funciona
│   │   ├── para-empresas.astro       # /para-empresas
│   │   ├── dicas-de-vaga.astro       # /dicas-de-vaga
│   │   ├── crie-seu-curriculo.astro  # /crie-seu-curriculo
│   │   └── 404.astro                 # Página 404
│   ├── lib/
│   │   ├── supabase.ts               # Cliente Supabase
│   │   ├── jobs.ts                   # Funções de busca de vagas
│   │   └── blog.ts                   # Funções de busca de artigos
│   └── styles/
│       └── global.css                # Tailwind + Inter font
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

---

## 4. Conceito Central — Astro Islands

Astro usa o conceito de **"Ilhas de Interatividade"**: a página é HTML estático, e apenas os componentes que precisam de JavaScript são hidratados no cliente.

```
┌─────────────────────────────────────────────────────┐
│  PÁGINA ASTRO (HTML ESTÁTICO — zero JS)             │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  <Navbar.astro>  — HTML puro, sem JS        │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  <HeroSection.astro> — HTML puro            │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  🏝️ <JobsFilter client:load />              │   │
│  │     ILHA REACT — hidratada no cliente       │   │
│  │     (filtros, busca, interação)             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  <JobCard.astro> × N — HTML puro            │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  🏝️ <CandidatureModal client:load />        │   │
│  │     ILHA REACT — modal de candidatura       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  <Footer.astro> — HTML puro                 │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Diretivas de Hidratação

| Diretiva | Quando usar | Exemplo |
|----------|-------------|---------|
| `client:load` | Hidrata imediatamente ao carregar | Filtros de vagas, busca |
| `client:idle` | Hidrata quando o browser está ocioso | Newsletter, formulários |
| `client:visible` | Hidrata quando entra na viewport | Seções abaixo do fold |
| `client:only="react"` | Nunca renderiza no servidor | Modais, dashboards |

---

## 5. Componentes Astro — Exemplos de Implementação

### 5.1 BaseHead.astro — SEO Centralizado

```astro
---
// src/components/layout/BaseHead.astro
interface Props {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  canonicalURL?: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  schema?: object;
}

const {
  title,
  description,
  keywords,
  image = '/og-image.jpg',
  canonicalURL = Astro.url.href,
  type = 'website',
  publishedAt,
  schema,
} = Astro.props;

const siteURL = 'https://vagasoeste.com.br';
const fullTitle = title.includes('VagasOeste') ? title : `${title} | VagasOeste`;
---

<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{fullTitle}</title>
<meta name="description" content={description} />
{keywords && <meta name="keywords" content={keywords} />}
<link rel="canonical" href={canonicalURL} />
<meta name="last-modified" content={new Date().toISOString()} />

<!-- Open Graph -->
<meta property="og:type" content={type} />
<meta property="og:title" content={fullTitle} />
<meta property="og:description" content={description} />
<meta property="og:image" content={`${siteURL}${image}`} />
<meta property="og:url" content={canonicalURL} />
<meta property="og:site_name" content="VagasOeste" />
<meta property="og:locale" content="pt_BR" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={fullTitle} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={`${siteURL}${image}`} />

<!-- Geo Tags (SEO Local Santarém) -->
<meta name="geo.region" content="BR-PA" />
<meta name="geo.placename" content="Santarém, Pará, Brasil" />
<meta name="geo.position" content="-2.4426;-54.7082" />
<meta name="ICBM" content="-2.4426, -54.7082" />

{publishedAt && <meta property="article:published_time" content={publishedAt} />}

<!-- Schema.org JSON-LD -->
{schema && (
  <script type="application/ld+json" set:html={JSON.stringify(schema)} />
)}

<!-- Google Fonts: Inter -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

<!-- Remix Icon CDN -->
<link href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css" rel="stylesheet" />
```

### 5.2 BaseLayout.astro

```astro
---
// src/layouts/BaseLayout.astro
import BaseHead from '../components/layout/BaseHead.astro';
import Navbar from '../components/layout/Navbar.astro';
import Footer from '../components/layout/Footer.astro';

interface Props {
  title: string;
  description: string;
  keywords?: string;
  schema?: object;
  image?: string;
}

const { title, description, keywords, schema, image } = Astro.props;
---

<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <BaseHead
      title={title}
      description={description}
      keywords={keywords}
      schema={schema}
      image={image}
    />
  </head>
  <body class="font-inter bg-white text-gray-900">
    <Navbar />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

### 5.3 Página de Vaga — `/vagas/[id].astro` (SSR)

```astro
---
// src/pages/vagas/[id].astro
export const prerender = false; // SSR — busca dados em tempo real

import BaseLayout from '../../layouts/BaseLayout.astro';
import { getJobById } from '../../lib/jobs';
import CandidatureModal from '../../components/islands/CandidatureModal';

const { id } = Astro.params;
const job = await getJobById(id);

if (!job) {
  return Astro.redirect('/vagas');
}

// Schema.org JobPosting
const jobSchema = {
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": job.title,
  "description": job.description,
  "datePosted": job.createdAt,
  "employmentType": job.contractType === 'CLT' ? 'FULL_TIME' : 'CONTRACTOR',
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": job.city,
      "addressRegion": "PA",
      "addressCountry": "BR"
    }
  },
  "hiringOrganization": {
    "@type": "Organization",
    "name": "Empresa Parceira VagasOeste",  // Anônima intencionalmente
    "sameAs": "https://vagasoeste.com.br"
  },
  "baseSalary": job.salaryRange ? {
    "@type": "MonetaryAmount",
    "currency": "BRL",
    "value": {
      "@type": "QuantitativeValue",
      "value": job.salaryRange
    }
  } : undefined,
};

const seoTitle = `${job.title} em ${job.neighborhood}, ${job.city} — VagasOeste`;
const seoDesc = `Vaga de ${job.title} no bairro ${job.neighborhood} em ${job.city}/PA. ${job.contractType}. ${job.salaryRange ? `Salário: ${job.salaryRange}.` : ''} Candidate-se agora na VagasOeste.`;
---

<BaseLayout
  title={seoTitle}
  description={seoDesc}
  keywords={`${job.title}, vaga ${job.city}, emprego ${job.neighborhood}, ${job.area}, ${job.contractType}`}
  schema={jobSchema}
>
  <!-- Breadcrumb -->
  <nav aria-label="breadcrumb" class="max-w-7xl mx-auto px-4 py-4">
    <ol class="flex items-center gap-2 text-sm text-gray-500">
      <li><a href="/" class="hover:text-emerald-600">Início</a></li>
      <li>/</li>
      <li><a href="/vagas" class="hover:text-emerald-600">Vagas</a></li>
      <li>/</li>
      <li class="text-gray-900 font-medium">{job.title}</li>
    </ol>
  </nav>

  <!-- Conteúdo da vaga (HTML estático) -->
  <article class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
    <p class="text-gray-600 mb-6">{job.area} · {job.neighborhood}, {job.city}/PA</p>

    <!-- Detalhes estáticos renderizados no servidor -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <section>
          <h2 class="text-xl font-bold text-gray-900 mb-3">Descrição da Vaga</h2>
          <p class="text-gray-700 leading-relaxed">{job.description}</p>
        </section>
        <!-- ... mais seções estáticas ... -->
      </div>

      <!-- Sidebar com botão de candidatura (ILHA REACT) -->
      <aside>
        <CandidatureModal
          client:load
          jobId={job.id}
          jobTitle={job.title}
          loginUrl="https://app.vagasoeste.com.br/login"
          cadastroUrl="https://app.vagasoeste.com.br/cadastro"
        />
      </aside>
    </div>
  </article>
</BaseLayout>
```

### 5.4 Blog — `/blog/[slug].astro` (SSG)

```astro
---
// src/pages/blog/[slug].astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getAllPosts, getPostBySlug } from '../../lib/blog';

// Gera todas as páginas em build time (SSG)
export async function getStaticPaths() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;

// Schema.org Article
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": post.title,
  "description": post.excerpt,
  "datePublished": post.publishedAt,
  "dateModified": post.publishedAt,
  "author": {
    "@type": "Organization",
    "name": post.author,
    "url": "https://vagasoeste.com.br"
  },
  "publisher": {
    "@type": "Organization",
    "name": "VagasOeste",
    "logo": {
      "@type": "ImageObject",
      "url": "https://vagasoeste.com.br/logo.png"
    }
  },
  "image": post.coverImage,
  "keywords": post.tags.join(', '),
  "articleSection": post.category,
  "url": `https://vagasoeste.com.br/blog/${post.slug}`,
};
---

<BaseLayout
  title={`${post.title} | Blog VagasOeste`}
  description={post.excerpt}
  keywords={post.tags.join(', ')}
  schema={articleSchema}
  image={post.coverImage}
  type="article"
  publishedAt={post.publishedAt}
>
  <article class="max-w-3xl mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
    <!-- Conteúdo renderizado como HTML puro -->
    <div class="prose prose-gray max-w-none" set:html={post.contentHtml} />
  </article>
</BaseLayout>
```

### 5.5 Página de Vagas Programáticas — `/vagas/[cidade]/[cargo].astro`

```astro
---
// src/pages/vagas/[cidade]/[cargo].astro
// Gera páginas como: /vagas/santarem/vendedor, /vagas/santarem/motorista

export async function getStaticPaths() {
  const jobs = await getAllJobs();

  // Gera combinações únicas de cidade + cargo normalizado
  const combinations = new Set<string>();
  const paths = [];

  for (const job of jobs) {
    const cidade = job.city.toLowerCase().replace(/\s+/g, '-');
    const cargo = job.area.toLowerCase().replace(/\s+/g, '-');
    const key = `${cidade}/${cargo}`;

    if (!combinations.has(key)) {
      combinations.add(key);
      paths.push({
        params: { cidade, cargo },
        props: {
          cityName: job.city,
          cargoName: job.area,
          jobs: jobs.filter(j =>
            j.city.toLowerCase() === job.city.toLowerCase() &&
            j.area.toLowerCase() === job.area.toLowerCase()
          )
        }
      });
    }
  }

  return paths;
}

const { cityName, cargoName, jobs } = Astro.props;

const seoTitle = `Vagas de ${cargoName} em ${cityName}/PA — VagasOeste`;
const seoDesc = `${jobs.length} vaga${jobs.length > 1 ? 's' : ''} de ${cargoName} em ${cityName}, Pará. Candidate-se agora na VagasOeste — processo seletivo anônimo e seguro.`;
---

<BaseLayout title={seoTitle} description={seoDesc}>
  <h1 class="text-3xl font-bold">Vagas de {cargoName} em {cityName}</h1>
  <!-- Lista de vagas filtradas -->
</BaseLayout>
```

---

## 6. Integração com Supabase no Astro

### `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### `src/lib/jobs.ts`

```typescript
import { supabase } from './supabase';

export async function getAllJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('id, title, area, sector, contractType, neighborhood, city, salaryRange, createdAt, tags')
    .eq('isActive', true)
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getJobById(id: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('isActive', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getJobsByAreaAndCity(area: string, city: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .ilike('area', area)
    .ilike('city', city)
    .eq('isActive', true);

  if (error) throw error;
  return data ?? [];
}
```

### `src/lib/blog.ts`

```typescript
import { supabase } from './supabase';

export async function getAllPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, category, author, coverImage, publishedAt, readTime, tags, featured')
    .order('publishedAt', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}
```

---

## 7. Ilhas React — Componentes Interativos

As partes interativas do site público são mantidas como componentes React, hidratados como ilhas:

### `src/components/islands/JobsFilter.tsx`

```tsx
// Filtros de vagas — hidratado no cliente
// Recebe lista de vagas como prop (gerada no servidor)
// Filtra localmente sem nova requisição ao servidor

interface JobsFilterProps {
  initialJobs: Job[];
  sectors: string[];
  neighborhoods: string[];
}

export default function JobsFilter({ initialJobs, sectors, neighborhoods }: JobsFilterProps) {
  const [filtered, setFiltered] = useState(initialJobs);
  const [search, setSearch] = useState('');
  // ... lógica de filtro local
}
```

### `src/components/islands/CandidatureModal.tsx`

```tsx
// Modal de candidatura — redireciona para o React SPA
interface CandidatureModalProps {
  jobId: string;
  jobTitle: string;
  loginUrl: string;    // https://app.vagasoeste.com.br/login?jobId=xxx
  cadastroUrl: string; // https://app.vagasoeste.com.br/cadastro?jobId=xxx
}

export default function CandidatureModal({ jobId, jobTitle, loginUrl, cadastroUrl }: CandidatureModalProps) {
  // Ao clicar "Candidatar-se":
  // → Redireciona para loginUrl com jobId como query param
  // → O React SPA captura o jobId e pré-seleciona a vaga
}
```

---

## 8. Comunicação Astro ↔ React SPA

### Passagem de Contexto via URL

O site Astro passa contexto para o React SPA via query params:

```
# Usuário clica "Candidatar-se" na vaga 123 no Astro
→ Redireciona para: https://app.vagasoeste.com.br/login?redirect=/plataforma&jobId=123

# React SPA captura o jobId após login
→ Pré-seleciona a vaga 123 na plataforma do candidato
```

### Compartilhamento de Sessão via Supabase Auth

Ambos os projetos usam o **mesmo projeto Supabase**. O token de sessão é armazenado em `localStorage` e cookies, sendo compartilhado entre domínios se configurado corretamente:

```typescript
// No React SPA (login/page.tsx) — após autenticação bem-sucedida
const { data: { session } } = await supabase.auth.signInWithPassword({ email, password });

// Verificar se há jobId pendente na URL
const jobId = new URLSearchParams(window.location.search).get('jobId');
if (jobId) {
  // Redirecionar para plataforma com vaga pré-selecionada
  navigate(`/plataforma?candidatar=${jobId}`);
} else {
  navigate(redirectPath);
}
```

### Verificação de Sessão no Astro (SSR)

```astro
---
// Em páginas que precisam verificar autenticação (ex: /vagas/[id].astro)
import { createServerClient } from '@supabase/ssr';

const supabase = createServerClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  { cookies: { get: (key) => Astro.cookies.get(key)?.value } }
);

const { data: { session } } = await supabase.auth.getSession();
const isLoggedIn = !!session;
---

<!-- Botão muda conforme estado de login -->
{isLoggedIn ? (
  <CandidatureModal client:load jobId={job.id} isAuthenticated={true} />
) : (
  <a href={`/login?jobId=${job.id}`} class="btn-primary">
    Candidatar-se
  </a>
)}
```

---

## 9. SEO Avançado — Estratégia Completa

### 9.1 Páginas Programáticas por Bairro + Cargo

Gera automaticamente páginas como:
- `/vagas/santarem/vendedor` — "Vagas de Vendedor em Santarém/PA"
- `/vagas/santarem/motorista` — "Vagas de Motorista em Santarém/PA"
- `/vagas/santarem/auxiliar-de-logistica` — "Vagas de Auxiliar de Logística em Santarém/PA"
- `/vagas/santarem/tecnico-de-enfermagem` — "Vagas de Técnico de Enfermagem em Santarém/PA"

**Impacto:** Cada combinação vira uma página indexável com título, descrição e Schema.org únicos.

### 9.2 Schema.org por Tipo de Página

| Página | Schema.org Type | Campos Obrigatórios |
|--------|----------------|---------------------|
| `/` | `WebSite` + `Organization` | name, url, logo, sameAs |
| `/vagas` | `ItemList` + `JobPosting` | numberOfItems, itemListElement |
| `/vagas/:id` | `JobPosting` | title, description, datePosted, jobLocation, hiringOrganization |
| `/blog` | `Blog` | name, description, blogPost[] |
| `/blog/:slug` | `Article` | headline, datePublished, author, publisher, image |
| `/como-funciona` | `FAQPage` | mainEntity[{@type: Question}] |
| `/para-empresas` | `Service` | name, description, provider, areaServed |
| `/dicas-de-vaga` | `HowTo` | name, step[] |

### 9.3 Sitemap Dinâmico

O `@astrojs/sitemap` gera automaticamente o sitemap com todas as páginas. Para vagas e artigos dinâmicos, configurar no `astro.config.mjs`:

```javascript
sitemap({
  serialize(item) {
    // Vagas têm prioridade alta e atualização diária
    if (item.url.includes('/vagas/')) {
      return { ...item, priority: 0.9, changefreq: 'daily' };
    }
    // Artigos do blog têm prioridade média
    if (item.url.includes('/blog/')) {
      return { ...item, priority: 0.8, changefreq: 'weekly' };
    }
    // Páginas institucionais
    return { ...item, priority: 0.7, changefreq: 'monthly' };
  }
})
```

### 9.4 robots.txt

```
User-agent: *
Allow: /
Disallow: /plataforma/
Disallow: /empresa/
Disallow: /admin/
Disallow: /login
Disallow: /cadastro
Disallow: /verificar-email

Sitemap: https://vagasoeste.com.br/sitemap-index.xml
```

### 9.5 Meta Tags por Página

| Página | Title (max 60 chars) | Description (120-160 chars) |
|--------|---------------------|----------------------------|
| `/` | Vagas de Emprego em Santarém PA — VagasOeste | Encontre vagas de emprego em Santarém e região oeste do Pará. Processo seletivo anônimo e seguro. Mais de 1.240 vagas ativas. |
| `/vagas` | Vagas em Santarém PA — 1.240+ Oportunidades | Todas as vagas de emprego em Santarém/PA por bairro, setor e tipo de contrato. Empresa anônima até sua seleção. |
| `/vagas/:id` | [Cargo] em [Bairro], [Cidade] — VagasOeste | Vaga de [Cargo] no bairro [Bairro] em [Cidade]/PA. [Contrato]. [Salário]. Candidate-se agora na VagasOeste. |
| `/blog` | Blog VagasOeste — Dicas de Emprego Santarém | Artigos sobre currículo, entrevistas e mercado de trabalho em Santarém e região oeste do Pará. |
| `/blog/:slug` | [Título do Artigo] — Blog VagasOeste | [Excerpt do artigo] |

---

## 10. Mapeamento de Migração — React → Astro

### Páginas do Site Público (migrar para Astro)

| Rota Atual (React) | Arquivo Astro | Tipo | Prioridade |
|--------------------|--------------|------|-----------|
| `/` | `pages/index.astro` | SSG | Alta |
| `/vagas` | `pages/vagas/index.astro` | SSR | Alta |
| `/vagas/:id` | `pages/vagas/[id].astro` | SSR | Alta |
| `/blog` | `pages/blog/index.astro` | SSG | Alta |
| `/blog/:slug` | `pages/blog/[slug].astro` | SSG | Alta |
| `/como-funciona` | `pages/como-funciona.astro` | SSG | Média |
| `/para-empresas` | `pages/para-empresas.astro` | SSG | Média |
| `/dicas-de-vaga` | `pages/dicas-de-vaga.astro` | SSG | Média |
| `/crie-seu-curriculo` | `pages/crie-seu-curriculo.astro` | SSG | Baixa |
| — (nova) | `pages/vagas/[cidade]/[cargo].astro` | SSG | Alta |

### Páginas que PERMANECEM no React SPA

| Rota | Motivo |
|------|--------|
| `/login` | Formulário interativo com estado complexo |
| `/cadastro` | Wizard em 4 etapas com validação |
| `/verificar-email` | Aguarda evento de auth |
| `/plataforma` | Dashboard completo com estado global |
| `/plataforma/perfil` | Formulário de edição |
| `/empresa/dashboard` | Dashboard com múltiplas abas e modais |
| `/admin` | Painel administrativo complexo |

### Componentes React Reutilizáveis como Ilhas

| Componente React Atual | Ilha Astro | Diretiva |
|------------------------|-----------|---------|
| `JobsSection.tsx` (filtros) | `JobsFilter.tsx` | `client:load` |
| `HeroSection.tsx` (busca) | `HeroSearch.tsx` | `client:load` |
| `TestimonialsSection.tsx` (slider) | `TestimonialsSlider.tsx` | `client:visible` |
| Modal de candidatura | `CandidatureModal.tsx` | `client:load` |
| Newsletter form | `NewsletterForm.tsx` | `client:idle` |
| Blog search | `BlogSearch.tsx` | `client:load` |
| FAQ accordion | `FAQAccordion.tsx` | `client:visible` |

---

## 11. Plano de Migração em Fases

### Fase 1 — Setup e Infraestrutura (Semana 1)
- [ ] Criar projeto Astro com integrações (Tailwind, Sitemap, React, Vercel)
- [ ] Configurar `astro.config.mjs` com `output: 'hybrid'`
- [ ] Criar `BaseHead.astro` com todos os meta tags e geo tags
- [ ] Criar `BaseLayout.astro` e `BlogLayout.astro`
- [ ] Migrar `Navbar.astro` e `Footer.astro` (HTML puro)
- [ ] Configurar Supabase client para Astro
- [ ] Configurar `robots.txt` e `sitemap`

### Fase 2 — Páginas de Alta Prioridade SEO (Semana 2)
- [ ] Migrar `/vagas` → `pages/vagas/index.astro` (SSR + filtros como ilha React)
- [ ] Migrar `/vagas/:id` → `pages/vagas/[id].astro` (SSR + Schema.org JobPosting)
- [ ] Migrar `/blog` → `pages/blog/index.astro` (SSG)
- [ ] Migrar `/blog/:slug` → `pages/blog/[slug].astro` (SSG + Schema.org Article)
- [ ] Criar ilhas React: `JobsFilter.tsx`, `CandidatureModal.tsx`, `BlogSearch.tsx`

### Fase 3 — Home e Páginas Institucionais (Semana 3)
- [ ] Migrar `/` → `pages/index.astro` (SSG + Schema.org Organization)
- [ ] Migrar `/como-funciona` → `pages/como-funciona.astro` (SSG + Schema.org FAQPage)
- [ ] Migrar `/para-empresas` → `pages/para-empresas.astro` (SSG + Schema.org Service)
- [ ] Migrar `/dicas-de-vaga` → `pages/dicas-de-vaga.astro` (SSG + Schema.org HowTo)
- [ ] Criar ilhas: `TestimonialsSlider.tsx`, `FAQAccordion.tsx`, `NewsletterForm.tsx`

### Fase 4 — SEO Programático (Semana 4)
- [ ] Criar `pages/vagas/[cidade]/[cargo].astro` com `getStaticPaths()`
- [ ] Gerar todas as combinações cidade + cargo a partir do Supabase
- [ ] Configurar sitemap para incluir páginas programáticas
- [ ] Adicionar breadcrumb Schema.org em todas as páginas de vaga
- [ ] Implementar `ItemList` Schema.org na listagem de vagas

### Fase 5 — Deploy e Proxy (Semana 5)
- [ ] Deploy do Astro no Vercel (projeto separado)
- [ ] Deploy do React SPA no Vercel (projeto separado, subdomínio `app.`)
- [ ] Configurar `vercel.json` com rewrites para `/plataforma`, `/empresa`, `/admin`, `/login`, `/cadastro`
- [ ] Testar fluxo completo: Astro → login React → plataforma React
- [ ] Validar Schema.org com Google Rich Results Test
- [ ] Submeter sitemap no Google Search Console

---

## 12. Variáveis de Ambiente

### Projeto Astro (`.env`)

```env
PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<sb_publishable_key>
PUBLIC_APP_URL=https://app.vagasoeste.com.br
PUBLIC_SITE_URL=https://vagasoeste.com.br
```

### Projeto React SPA (`.env`)

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=<sb_publishable_key>
VITE_PUBLIC_SITE_URL=https://vagasoeste.com.br
```

> **Importante:** Ambos os projetos apontam para o **mesmo projeto Supabase**. Isso garante que a sessão de autenticação seja compartilhada.

---

## 13. Checklist de SEO Pós-Migração

### Técnico
- [ ] Lighthouse SEO ≥ 95 em todas as páginas públicas
- [ ] Lighthouse Performance ≥ 90 (LCP < 2.5s)
- [ ] Sitemap submetido no Google Search Console
- [ ] `robots.txt` bloqueando `/plataforma`, `/empresa`, `/admin`
- [ ] Canonical URLs em todas as páginas
- [ ] Geo tags configuradas (Santarém, PA, BR)
- [ ] Schema.org validado no Rich Results Test

### Conteúdo
- [ ] Cada vaga tem título único com cargo + bairro + cidade
- [ ] Cada artigo do blog tem excerpt de 120-160 chars
- [ ] Imagens com `alt` descritivo em todas as páginas
- [ ] H1 único por página
- [ ] Breadcrumb em vagas e artigos

### Local SEO
- [ ] Google Business Profile criado para VagasOeste
- [ ] NAP (Nome, Endereço, Telefone) consistente em todas as páginas
- [ ] Schema.org `LocalBusiness` na home
- [ ] Menção a "Santarém", "Pará", "oeste do Pará" nos textos principais

---

## 14. Referências e Documentação

| Recurso | URL |
|---------|-----|
| Documentação Astro | https://docs.astro.build |
| Astro + Supabase | https://docs.astro.build/en/guides/backend/supabase/ |
| @astrojs/sitemap | https://docs.astro.build/en/guides/integrations-guide/sitemap/ |
| Astro Islands | https://docs.astro.build/en/concepts/islands/ |
| Schema.org JobPosting | https://schema.org/JobPosting |
| Schema.org Article | https://schema.org/Article |
| Google Rich Results Test | https://search.google.com/test/rich-results |
| Google Search Console | https://search.google.com/search-console |
| Vercel Rewrites | https://vercel.com/docs/edge-network/rewrites |
| Supabase SSR | https://supabase.com/docs/guides/auth/server-side/creating-a-client |
