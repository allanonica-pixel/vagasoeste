import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: 'https://santarem.app',
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap({
      filter: (page) =>
        !page.includes('/plataforma') &&
        !page.includes('/empresa') &&
        !page.includes('/admin') &&
        !page.includes('/login') &&
        !page.includes('/cadastro') &&
        !page.includes('/verificar-email'),
      serialize(item) {
        if (item.url.match(/\/vagas\/[^/]+\/[^/]+/)) {
          return { ...item, priority: 0.9, changefreq: 'daily' };
        }
        if (item.url.includes('/vagas/')) {
          return { ...item, priority: 0.85, changefreq: 'daily' };
        }
        if (item.url.includes('/blog/')) {
          return { ...item, priority: 0.8, changefreq: 'weekly' };
        }
        if (item.url === 'https://santarem.app/') {
          return { ...item, priority: 1.0, changefreq: 'daily' };
        }
        return { ...item, priority: 0.7, changefreq: 'monthly' };
      },
    }),
    react(),
  ],
  vite: {
    resolve: {
      alias: {
        '@': '/src',
        // Conteúdo compartilhado com apps/platform — fonte única da verdade
        '@content': path.resolve(__dirname, '../../packages/content/src'),
      },
    },
  },
});
