import { useState, useMemo } from 'react';
import type { BlogPost } from '../../lib/blog';

interface BlogSearchProps {
  initialPosts: BlogPost[];
  categories: string[];
}

export default function BlogSearch({ initialPosts, categories }: BlogSearchProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');

  const filtered = useMemo(() => {
    return initialPosts.filter((post) => {
      const q = query.toLowerCase();
      const matchQuery = !q || post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q) || post.tags.some((t) => t.toLowerCase().includes(q));
      const matchCat = category === 'Todos' || post.category === category;
      return matchQuery && matchCat;
    });
  }, [initialPosts, query, category]);

  return (
    <div>
      {/* Busca e Filtro de Categoria */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <i className="ri-search-line text-gray-400 text-sm shrink-0" aria-hidden="true"></i>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar artigos..."
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            aria-label="Buscar artigos"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none bg-white cursor-pointer"
          aria-label="Filtrar por categoria"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Resultados */}
      <p className="text-sm text-gray-500 mb-4">
        <span className="font-semibold text-gray-900">{filtered.length}</span> artigo{filtered.length !== 1 ? 's' : ''}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <i className="ri-article-line text-4xl text-gray-300 mb-3 block" aria-hidden="true"></i>
          <p className="text-gray-500">Nenhum artigo encontrado para "{query}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <article key={post.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <a href={`/blog/${post.slug}`} className="block">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-44 object-cover"
                  loading="lazy"
                />
              </a>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <i className="ri-time-line" aria-hidden="true"></i>
                    {post.readTime} min
                  </span>
                </div>
                <h2 className="font-bold text-gray-900 text-base leading-tight mb-2 line-clamp-2 text-balance">
                  <a href={`/blog/${post.slug}`} className="hover:text-emerald-600 transition-colors">
                    {post.title}
                  </a>
                </h2>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 text-pretty">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {new Date(post.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <a href={`/blog/${post.slug}`} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                    Ler artigo <i className="ri-arrow-right-line" aria-hidden="true"></i>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
