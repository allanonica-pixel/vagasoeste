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

/** Mapeia row do banco (snake_case) para interface BlogPost (camelCase) */
function mapPost(row: Record<string, unknown>): BlogPost {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    excerpt: (row.excerpt ?? '') as string,
    content: (row.content ?? '') as string,
    category: (row.category ?? '') as string,
    author: (row.author ?? 'Equipe VagasOeste') as string,
    authorRole: (row.author_role ?? '') as string,
    authorImage: (row.author_image ?? '') as string,
    coverImage: (row.cover_image ?? '') as string,
    publishedAt: (row.published_at ?? row.created_at ?? '') as string,
    readTime: (row.read_time ?? 5) as number,
    tags: (row.tags ?? []) as string[],
    featured: (row.is_featured ?? false) as boolean,
  };
}

/** Busca todos os posts publicados */
export async function getAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(
      'id, slug, title, excerpt, content, category, author, author_role, author_image, cover_image, published_at, created_at, read_time, tags, is_featured'
    )
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[blog.ts] getAllPosts error:', error.message);
    return [];
  }
  return (data ?? []).map(mapPost);
}

/** Busca post por slug */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    console.error('[blog.ts] getPostBySlug error:', error.message);
    return null;
  }
  return data ? mapPost(data) : null;
}

/** Posts em destaque */
export async function getFeaturedPosts(limit = 2): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, category, cover_image, published_at, read_time, tags, is_featured')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[blog.ts] getFeaturedPosts error:', error.message);
    return [];
  }
  return (data ?? []).map(mapPost);
}

/** Posts relacionados (excluindo um slug específico) */
export async function getRelatedPosts(excludeSlug: string, category: string, limit = 3): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, category, cover_image, published_at, read_time')
    .eq('is_published', true)
    .neq('slug', excludeSlug)
    .eq('category', category)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error || !data?.length) {
    const { data: fallback } = await supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, category, cover_image, published_at, read_time')
      .eq('is_published', true)
      .neq('slug', excludeSlug)
      .order('published_at', { ascending: false })
      .limit(limit);
    return (fallback ?? []).map(mapPost);
  }
  return data.map(mapPost);
}

/** Categorias únicas */
export async function getCategories(): Promise<string[]> {
  const posts = await getAllPosts();
  return ['Todos', ...new Set(posts.map((p) => p.category).filter(Boolean))];
}

/**
 * Converte markdown simples (##, ###, **bold**, - lista) para HTML
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
