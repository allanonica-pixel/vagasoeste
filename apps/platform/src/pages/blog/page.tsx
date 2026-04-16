import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import { mockBlogPosts, blogCategories } from "@/mocks/blogPosts";

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const featured = mockBlogPosts.filter((p) => p.featured);
  const filtered = mockBlogPosts.filter((p) => {
    const matchCat = activeCategory === "Todos" || p.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog VagasOeste — Dicas de Emprego em Santarém",
    description:
      "Artigos e dicas sobre emprego, currículo, entrevistas e mercado de trabalho em Santarém e região oeste do Pará.",
    url: "https://vagasoeste.com.br/blog",
    publisher: {
      "@type": "Organization",
      name: "VagasOeste",
      logo: {
        "@type": "ImageObject",
        url: "https://vagasoeste.com.br/logo.png",
      },
    },
    blogPost: mockBlogPosts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.excerpt,
      datePublished: p.publishedAt,
      author: { "@type": "Organization", name: p.author },
      url: `https://vagasoeste.com.br/blog/${p.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-16">
        {/* Hero */}
        <section className="relative bg-emerald-900 pt-24 pb-12 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://readdy.ai/api/search-image?query=open%20book%20newspaper%20articles%20journalism%20writing%20desk%20warm%20library%20cozy%20reading%20environment%20professional%20editorial%20workspace%20Santarem%20Para%20Brazil%20tropical%20warm%20light&width=1920&height=500&seq=blog-hero-v2&orientation=landscape"
              alt="Blog VagasOeste"
              className="w-full h-full object-cover object-top opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-emerald-900/70 to-emerald-800/60"></div>
          </div>
          <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6">
            <span className="inline-block bg-white/15 border border-white/25 text-white/90 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
              Blog VagasOeste
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
              Dicas de Emprego para Santarém e Região
            </h1>
            <p className="text-emerald-100 text-sm mb-6 max-w-2xl">
              Artigos práticos sobre currículo, entrevistas, mercado de trabalho e direitos trabalhistas para candidatos do oeste do Pará.
            </p>
            <div className="max-w-md relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-gray-400 text-sm"></i>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar artigos..."
                className="w-full bg-white rounded-lg pl-9 pr-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
          {/* Featured Posts */}
          {!searchQuery && activeCategory === "Todos" && (
            <section className="mb-14">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Artigos em Destaque
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featured.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-emerald-200 transition-all cursor-pointer block"
                  >
                    <div className="w-full h-52 overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                          {post.category}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {post.readTime} min de leitura
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-emerald-700 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden">
                            <img
                              src={post.authorImage}
                              alt={post.author}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                          <span className="text-xs text-gray-500">{post.author}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(post.publishedAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Category Filter */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {blogCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  activeCategory === cat
                    ? "bg-emerald-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* All Posts Grid */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {searchQuery
                  ? `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""} para "${searchQuery}"`
                  : activeCategory === "Todos"
                  ? "Todos os Artigos"
                  : activeCategory}
              </h2>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <i className="ri-article-line text-gray-300 text-3xl"></i>
                </div>
                <p className="text-gray-400 text-sm">Nenhum artigo encontrado</p>
                <button
                  onClick={() => { setSearchQuery(""); setActiveCategory("Todos"); }}
                  className="mt-3 text-xs text-emerald-600 hover:underline cursor-pointer"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-emerald-200 transition-all cursor-pointer block"
                  >
                    <div className="w-full h-44 overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {post.category}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {post.readTime} min
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-700 text-xs leading-relaxed line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(post.publishedAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* CTA */}
          <section className="mt-16 bg-emerald-600 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Pronto para encontrar seu próximo emprego?
            </h2>
            <p className="text-white text-sm md:text-base mb-6 max-w-xl mx-auto">
              Cadastre-se gratuitamente na VagasOeste e tenha acesso às melhores
              vagas de Santarém e região, com processo seletivo transparente e
              intermediado por profissionais.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/cadastro"
                className="bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Criar cadastro grátis
              </Link>
              <Link
                to="/vagas"
                className="border border-white/40 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
              >
                Ver vagas disponíveis
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
