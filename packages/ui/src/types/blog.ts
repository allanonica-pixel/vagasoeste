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
