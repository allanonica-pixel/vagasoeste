import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import { mockBlogPosts } from "@/mocks/blogPosts";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = mockBlogPosts.find((p) => p.slug === slug);
  const related = mockBlogPosts.filter((p) => p.slug !== slug).slice(0, 3);

  useEffect(() => {
    if (!post) navigate("/blog");
    window.scrollTo(0, 0);
  }, [post, navigate]);

  if (!post) return null;

  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Organization",
      name: post.author,
      jobTitle: post.authorRole,
    },
    publisher: {
      "@type": "Organization",
      name: "VagasOeste",
      logo: {
        "@type": "ImageObject",
        url: "https://vagasoeste.com.br/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://vagasoeste.com.br/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
    articleSection: post.category,
    wordCount: post.content.split(" ").length,
  };

  const renderContent = (content: string) => {
    const lines = content.trim().split("\n");
    const elements: JSX.Element[] = [];
    let key = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        key++;
        continue;
      }
      if (trimmed.startsWith("## ")) {
        elements.push(
          <h2 key={key++} className="text-xl font-bold text-gray-900 mt-8 mb-3">
            {trimmed.replace("## ", "")}
          </h2>
        );
      } else if (trimmed.startsWith("### ")) {
        elements.push(
          <h3 key={key++} className="text-base font-bold text-gray-800 mt-5 mb-2">
            {trimmed.replace("### ", "")}
          </h3>
        );
      } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        elements.push(
          <p key={key++} className="font-semibold text-gray-900 text-sm mt-3 mb-1">
            {trimmed.replace(/\*\*/g, "")}
          </p>
        );
      } else if (trimmed.startsWith("- ")) {
        elements.push(
          <li key={key++} className="text-gray-600 text-sm leading-relaxed ml-4 list-disc">
            {trimmed.replace("- ", "")}
          </li>
        );
      } else if (/^\d+\./.test(trimmed)) {
        elements.push(
          <li key={key++} className="text-gray-600 text-sm leading-relaxed ml-4 list-decimal">
            {trimmed.replace(/^\d+\.\s/, "")}
          </li>
        );
      } else {
        elements.push(
          <p key={key++} className="text-gray-600 text-sm leading-relaxed mb-3">
            {trimmed}
          </p>
        );
      }
    }
    return elements;
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-16">
        {/* Cover Image */}
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover object-top"
          />
        </div>

        <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 flex-wrap">
            <Link to="/" className="hover:text-emerald-600 cursor-pointer">Início</Link>
            <i className="ri-arrow-right-s-line text-gray-300"></i>
            <Link to="/blog" className="hover:text-emerald-600 cursor-pointer">Blog</Link>
            <i className="ri-arrow-right-s-line text-gray-300"></i>
            <span className="text-gray-600 line-clamp-1">{post.title}</span>
          </nav>

          {/* Category + Meta */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-gray-400 text-xs flex items-center gap-1">
              <i className="ri-time-line text-xs"></i>
              {post.readTime} min de leitura
            </span>
            <span className="text-gray-400 text-xs flex items-center gap-1">
              <i className="ri-calendar-line text-xs"></i>
              {new Date(post.publishedAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-gray-800 text-base leading-relaxed mb-6 border-l-4 border-emerald-400 pl-4">
            {post.excerpt}
          </p>

          {/* Author */}
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
              <img
                src={post.authorImage}
                alt={post.author}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{post.author}</p>
              <p className="text-gray-600 text-xs">{post.authorRole}</p>
            </div>
          </div>

          {/* Content */}
          <article className="prose-sm max-w-none">
            {renderContent(post.content)}
          </article>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-100">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Share */}
          <div className="mt-6 flex items-center gap-3">
            <span className="text-xs text-gray-500 font-medium">Compartilhar:</span>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(post.title + " - " + window.location.href)}`}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors cursor-pointer"
            >
              <i className="ri-whatsapp-line text-sm"></i>
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-sky-100 text-sky-600 hover:bg-sky-200 transition-colors cursor-pointer"
            >
              <i className="ri-linkedin-line text-sm"></i>
            </a>
          </div>

          {/* CTA Box */}
          <div className="mt-10 bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
            <div className="w-10 h-10 flex items-center justify-center mx-auto mb-3 bg-emerald-100 rounded-full">
              <i className="ri-briefcase-line text-emerald-600 text-lg"></i>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Pronto para encontrar emprego?</h3>
            <p className="text-gray-500 text-sm mb-4">
              Cadastre-se gratuitamente e acesse as melhores vagas de Santarém.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                to="/cadastro"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm cursor-pointer transition-colors whitespace-nowrap"
              >
                Criar cadastro grátis
              </Link>
              <Link
                to="/vagas"
                className="border border-emerald-300 text-emerald-700 font-semibold px-6 py-2.5 rounded-xl text-sm cursor-pointer hover:bg-emerald-50 transition-colors whitespace-nowrap"
              >
                Ver vagas
              </Link>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        <section className="max-w-6xl mx-auto px-4 md:px-6 pb-16">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Artigos Relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {related.map((rp) => (
              <Link
                key={rp.id}
                to={`/blog/${rp.slug}`}
                className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-emerald-200 transition-all cursor-pointer block"
              >
                <div className="w-full h-40 overflow-hidden">
                  <img
                    src={rp.coverImage}
                    alt={rp.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {rp.category}
                  </span>
                  <h3 className="font-bold text-gray-900 text-sm mt-2 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {rp.title}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(rp.publishedAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
