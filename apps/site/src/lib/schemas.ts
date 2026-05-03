/**
 * Schemas.org centralizados — graph linkado por @id.
 *
 * Padrão: cada entidade global tem um @id estável (URL + fragment).
 * Outras entidades referenciam via { '@id': '...' } em vez de duplicar.
 * Isso ajuda o Google a entender o grafo do site e melhora rich results.
 */

import type { BlogPost } from './blog';

const SITE_URL = 'https://santarem.app';

// ─── @ids estáveis (graph anchors) ───────────────────────────────────────────
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID      = `${SITE_URL}/#website`;
export const BUSINESS_ID     = `${SITE_URL}/#business`;

// ─── Organization (global, todas as páginas) ─────────────────────────────────
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'VagasOeste',
    alternateName: 'VagasOeste — Vagas em Santarém/PA',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    description:
      'Plataforma de vagas de emprego em Santarém e região oeste do Pará. Conecta candidatos a empresas locais com processo seletivo anônimo.',
    foundingDate: '2026',
    areaServed: [
      { '@type': 'City', name: 'Santarém', containedInPlace: { '@type': 'State', name: 'Pará' } },
      { '@type': 'City', name: 'Itaituba',  containedInPlace: { '@type': 'State', name: 'Pará' } },
      { '@type': 'City', name: 'Belterra',  containedInPlace: { '@type': 'State', name: 'Pará' } },
      { '@type': 'City', name: 'Mojuí dos Campos', containedInPlace: { '@type': 'State', name: 'Pará' } },
    ],
    knowsLanguage: 'pt-BR',
    sameAs: [
      // Adicionar quando perfis sociais forem criados:
      // 'https://www.linkedin.com/company/vagasoeste',
      // 'https://www.instagram.com/vagasoeste',
    ].filter(Boolean),
  };
}

// ─── WebSite + SearchAction (somente na home) ────────────────────────────────
// Habilita "Sitelinks Search Box" nos resultados do Google.
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: 'VagasOeste',
    description: 'Vagas de emprego em Santarém/PA e região oeste do Pará.',
    inLanguage: 'pt-BR',
    publisher: { '@id': ORGANIZATION_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/vagas?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// ─── LocalBusiness / EmploymentAgency (somente na home) ──────────────────────
// Sinaliza presença local pra ranqueamento em buscas geolocalizadas.
export function buildLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EmploymentAgency',
    '@id': BUSINESS_ID,
    name: 'VagasOeste',
    url: SITE_URL,
    image: `${SITE_URL}/og-default.jpg`,
    logo: `${SITE_URL}/logo.png`,
    description:
      'Agência de empregos digital especializada em vagas para Santarém e região oeste do Pará. Processo seletivo anônimo até a seleção do candidato.',
    parentOrganization: { '@id': ORGANIZATION_ID },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Santarém',
      addressRegion: 'PA',
      addressCountry: 'BR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -2.4426,
      longitude: -54.7082,
    },
    areaServed: [
      { '@type': 'City', name: 'Santarém' },
      { '@type': 'City', name: 'Itaituba' },
      { '@type': 'City', name: 'Belterra' },
      { '@type': 'City', name: 'Mojuí dos Campos' },
    ],
    priceRange: 'Gratuito para candidatos',
    knowsLanguage: 'pt-BR',
  };
}

// ─── BlogPosting (página individual /blog/[slug]) ────────────────────────────
export function buildBlogPostingSchema(post: BlogPost) {
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${postUrl}#blogposting`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage
      ? [post.coverImage]
      : [`${SITE_URL}/og-default.jpg`],
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: 'pt-BR',
    author: {
      '@type': 'Person',
      name: post.author,
      jobTitle: post.authorRole,
    },
    publisher: { '@id': ORGANIZATION_ID },
    articleSection: post.category,
    keywords: post.tags.join(', '),
    wordCount: post.content ? post.content.split(/\s+/).length : undefined,
    url: postUrl,
    isPartOf: { '@id': WEBSITE_ID },
  };
}
