import { supabase } from './supabase';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorRole: string;
  authorImage: string;
  coverImage: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  featured: boolean;
}

/** Busca todos os posts publicados */
export async function getAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(
      'id, slug, title, excerpt, content, category, author, authorRole, authorImage, coverImage, publishedAt, readTime, tags, featured'
    )
    .order('publishedAt', { ascending: false });

  if (error) {
    console.error('[blog.ts] getAllPosts error:', error.message);
    return [];
  }
  return data ?? [];
}

/** Busca post por slug */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[blog.ts] getPostBySlug error:', error.message);
    return null;
  }
  return data;
}

/** Posts em destaque */
export async function getFeaturedPosts(limit = 2): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, category, coverImage, publishedAt, readTime, tags, featured')
    .eq('featured', true)
    .order('publishedAt', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[blog.ts] getFeaturedPosts error:', error.message);
    return [];
  }
  return data ?? [];
}

/** Posts recentes (excluindo um slug específico) */
export async function getRelatedPosts(excludeSlug: string, category: string, limit = 3): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, category, coverImage, publishedAt, readTime')
    .neq('slug', excludeSlug)
    .eq('category', category)
    .order('publishedAt', { ascending: false })
    .limit(limit);

  if (error || !data?.length) {
    // Fallback: posts recentes de qualquer categoria
    const { data: fallback } = await supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, category, coverImage, publishedAt, readTime')
      .neq('slug', excludeSlug)
      .order('publishedAt', { ascending: false })
      .limit(limit);
    return fallback ?? [];
  }
  return data;
}

/** Categorias únicas */
export async function getCategories(): Promise<string[]> {
  const posts = await getAllPosts();
  return ['Todos', ...new Set(posts.map((p) => p.category))];
}

/**
 * Converte markdown simples (##, ###, **bold**, - lista) para HTML
 * Para conteúdo completo, recomenda-se usar @astrojs/markdown-remark ou marked
 */
export function markdownToHtml(md: string): string {
  return md
    .trim()
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hup]|<li)(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '');
}
