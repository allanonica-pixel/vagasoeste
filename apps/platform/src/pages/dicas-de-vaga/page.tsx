import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import AnimatedSection from "@/components/base/AnimatedSection";
import { mockBlogPosts } from "@/mocks/blogPosts";

const categories = [
  { id: "all", label: "Todas as Dicas" },
  { id: "curriculo", label: "Currículo" },
  { id: "entrevista", label: "Entrevista" },
  { id: "mercado", label: "Mercado Local" },
  { id: "carreira", label: "Carreira" },
];

const tips = [
  {
    id: 1,
    category: "curriculo",
    icon: "ri-file-text-line",
    title: "Como montar um currículo que chama atenção",
    summary: "Aprenda a estruturar seu currículo de forma objetiva, destacando suas experiências mais relevantes para a vaga desejada.",
    readTime: "5 min",
    featured: true,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    content: [
      "Use fonte legível (Arial ou Calibri, tamanho 11–12)",
      "Coloque seus dados de contato no topo: nome, telefone, e-mail e cidade",
      "Resumo profissional: 2 a 3 linhas sobre quem você é e o que busca",
      "Liste experiências do mais recente para o mais antigo",
      "Destaque conquistas com números: 'Aumentei vendas em 30%'",
      "Mantenha o currículo em no máximo 2 páginas",
    ],
  },
  {
    id: 2,
    category: "entrevista",
    icon: "ri-user-voice-line",
    title: "Como se preparar para uma entrevista de emprego",
    summary: "Dicas práticas para chegar confiante na entrevista, desde a pesquisa sobre a empresa até as perguntas mais comuns.",
    readTime: "7 min",
    featured: true,
    color: "bg-amber-50 text-amber-600 border-amber-100",
    content: [
      "Pesquise sobre a empresa antes da entrevista",
      "Prepare respostas para perguntas clássicas: 'Fale sobre você', 'Pontos fortes e fracos'",
      "Vista-se adequadamente para o ambiente da empresa",
      "Chegue 10 minutos antes do horário marcado",
      "Leve cópias do seu currículo",
      "Prepare perguntas para fazer ao entrevistador",
    ],
  },
  {
    id: 3,
    category: "mercado",
    icon: "ri-line-chart-line",
    title: "Áreas em alta no mercado de Santarém em 2026",
    summary: "Descubra quais setores estão contratando mais em Santarém e região, e como se posicionar para essas oportunidades.",
    readTime: "4 min",
    featured: true,
    color: "bg-sky-50 text-sky-600 border-sky-100",
    content: [
      "Logística e transporte: crescimento com o agronegócio regional",
      "Saúde: demanda constante por técnicos e auxiliares",
      "Comércio e varejo: expansão de redes no interior do Pará",
      "Construção civil: obras de infraestrutura em andamento",
      "TI e suporte técnico: digitalização das empresas locais",
      "Educação: cursos técnicos e reforço escolar em alta",
    ],
  },
  {
    id: 4,
    category: "carreira",
    icon: "ri-road-map-line",
    title: "Como planejar sua carreira do zero",
    summary: "Um guia passo a passo para quem está começando ou quer mudar de área, com foco no mercado regional.",
    readTime: "8 min",
    featured: false,
    color: "bg-rose-50 text-rose-600 border-rose-100",
    content: [
      "Identifique suas habilidades e interesses",
      "Pesquise as profissões que combinam com seu perfil",
      "Invista em cursos técnicos e certificações acessíveis",
      "Construa sua rede de contatos (networking)",
      "Defina metas de curto, médio e longo prazo",
      "Acompanhe as tendências do mercado local",
    ],
  },
  {
    id: 5,
    category: "curriculo",
    icon: "ri-edit-line",
    title: "Erros que eliminam seu currículo na triagem",
    summary: "Conheça os erros mais comuns que fazem recrutadores descartarem currículos antes mesmo de ler o conteúdo.",
    readTime: "3 min",
    featured: false,
    color: "bg-orange-50 text-orange-600 border-orange-100",
    content: [
      "Erros de ortografia e gramática",
      "Foto inadequada ou sem foto quando solicitada",
      "Informações desatualizadas ou incorretas",
      "Currículo muito longo ou muito curto",
      "Falta de objetivo profissional claro",
      "Não adaptar o currículo para cada vaga",
    ],
  },
  {
    id: 6,
    category: "entrevista",
    icon: "ri-question-answer-line",
    title: "As 10 perguntas mais comuns em entrevistas",
    summary: "Prepare respostas honestas e estratégicas para as perguntas que quase sempre aparecem em processos seletivos.",
    readTime: "6 min",
    featured: false,
    color: "bg-teal-50 text-teal-600 border-teal-100",
    content: [
      "Fale sobre você — foque no profissional, não no pessoal",
      "Por que quer trabalhar aqui? — pesquise a empresa",
      "Quais são seus pontos fortes? — seja específico",
      "Quais são seus pontos fracos? — mostre que está melhorando",
      "Onde se vê em 5 anos? — demonstre ambição realista",
      "Por que saiu do emprego anterior? — seja honesto e positivo",
    ],
  },
  {
    id: 7,
    category: "mercado",
    icon: "ri-money-dollar-circle-line",
    title: "Como negociar salário com confiança",
    summary: "Estratégias para negociar sua remuneração sem medo, com base em pesquisa de mercado e argumentos sólidos.",
    readTime: "5 min",
    featured: false,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    content: [
      "Pesquise a faixa salarial da função na sua região",
      "Espere a empresa fazer a primeira oferta",
      "Apresente seus diferenciais antes de negociar",
      "Negocie o pacote completo: salário + benefícios",
      "Seja firme, mas flexível e respeitoso",
      "Tenha um valor mínimo definido antes da conversa",
    ],
  },
  {
    id: 8,
    category: "carreira",
    icon: "ri-award-line",
    title: "Cursos gratuitos que valorizam seu currículo",
    summary: "Lista de plataformas e cursos gratuitos reconhecidos pelo mercado que você pode fazer agora mesmo.",
    readTime: "4 min",
    featured: false,
    color: "bg-violet-50 text-violet-600 border-violet-100",
    content: [
      "SENAI e SENAC: cursos técnicos presenciais e online",
      "Coursera e edX: cursos de universidades internacionais",
      "Google Ateliê Digital: marketing e tecnologia gratuito",
      "SEBRAE: empreendedorismo e gestão",
      "Fundação Bradesco: informática e gestão",
      "YouTube: tutoriais de Excel, Word e ferramentas de trabalho",
    ],
  },
];

const marketStats = [
  { value: "1.240+", label: "Vagas ativas", icon: "ri-briefcase-line", color: "text-emerald-600" },
  { value: "320+", label: "Empresas parceiras", icon: "ri-building-line", color: "text-amber-600" },
  { value: "2.100+", label: "Contratações realizadas", icon: "ri-trophy-line", color: "text-sky-600" },
  { value: "8.500+", label: "Candidatos cadastrados", icon: "ri-user-line", color: "text-rose-600" },
];

const santaremSectors = [
  {
    sector: "Agronegócio & Logística",
    icon: "ri-truck-line",
    description: "Santarém é polo do agronegócio paraense. Empresas de soja, milho e transporte fluvial contratam constantemente motoristas, operadores e técnicos.",
    demand: "Alta",
    demandColor: "bg-emerald-100 text-emerald-700",
    roles: ["Motorista de caminhão", "Operador de empilhadeira", "Auxiliar de logística", "Técnico agrícola"],
  },
  {
    sector: "Saúde & Bem-estar",
    icon: "ri-heart-pulse-line",
    description: "Com hospitais, clínicas e UBSs em expansão, a área de saúde é uma das que mais contrata em Santarém, especialmente técnicos e auxiliares.",
    demand: "Alta",
    demandColor: "bg-emerald-100 text-emerald-700",
    roles: ["Técnico de enfermagem", "Auxiliar de farmácia", "Recepcionista clínica", "Agente comunitário"],
  },
  {
    sector: "Comércio & Varejo",
    icon: "ri-store-line",
    description: "O comércio local cresce com a chegada de redes nacionais. Vagas de vendedor, caixa e estoquista são as mais frequentes na plataforma.",
    demand: "Média",
    demandColor: "bg-amber-100 text-amber-700",
    roles: ["Vendedor externo", "Operador de caixa", "Estoquista", "Promotor de vendas"],
  },
  {
    sector: "Construção Civil",
    icon: "ri-building-2-line",
    description: "Obras de infraestrutura e habitação popular impulsionam a demanda por pedreiros, eletricistas e encanadores em toda a região.",
    demand: "Média",
    demandColor: "bg-amber-100 text-amber-700",
    roles: ["Pedreiro", "Eletricista", "Encanador", "Mestre de obras"],
  },
];

export default function DicasDeVagaPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedTip, setExpandedTip] = useState<number | null>(null);

  const filtered = activeCategory === "all" ? tips : tips.filter((t) => t.category === activeCategory);
  const featured = tips.filter((t) => t.featured);
  const relatedPosts = mockBlogPosts.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=Santarem%20Para%20Brazil%20Amazon%20river%20city%20professional%20career%20growth%20opportunity%20tropical%20urban%20landscape%20warm%20golden%20light%20modern%20buildings%20waterfront%20vibrant&width=1920&height=500&seq=dicas-hero-v2&orientation=landscape"
            alt="Santarém - mercado de trabalho"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/85 via-emerald-900/75 to-emerald-950/90"></div>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-20 text-center">
          <AnimatedSection variant="fade-up">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-lightbulb-flash-line text-yellow-300 text-sm"></i>
              </div>
              <span className="text-white/90 text-xs font-medium">Conteúdo gratuito para sua carreira em Santarém</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Dicas de Vaga
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              Orientações práticas para você se destacar no mercado de trabalho de Santarém e conquistar a vaga dos seus sonhos.
            </p>
          </AnimatedSection>

          {/* Stats */}
          <AnimatedSection variant="fade-up" delay={150}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {marketStats.map((stat) => (
                <div key={stat.label} className="bg-white/10 border border-white/15 rounded-xl p-3 text-center">
                  <div className="w-8 h-8 flex items-center justify-center mx-auto mb-1">
                    <i className={`${stat.icon} text-white text-lg`}></i>
                  </div>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-white/60 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Mercado de Santarém */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-14">
        <AnimatedSection variant="fade-up" className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-lg">
              <i className="ri-map-pin-2-line text-emerald-600"></i>
            </div>
            <span className="text-emerald-600 text-xs font-semibold uppercase tracking-widest">Mercado Local</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Setores que mais contratam em Santarém
          </h2>
          <p className="text-gray-700 text-sm mt-2 max-w-2xl">
            Entenda o cenário atual do mercado de trabalho na região oeste do Pará e saiba onde estão as melhores oportunidades.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {santaremSectors.map((sector, index) => (
            <AnimatedSection key={sector.sector} variant="fade-up" delay={index * 80}>
              <div className="bg-white rounded-xl border border-gray-100 p-5 hover:border-emerald-200 transition-all h-full">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 rounded-lg shrink-0">
                    <i className={`${sector.icon} text-emerald-600 text-lg`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-sm">{sector.sector}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sector.demandColor}`}>
                        Demanda {sector.demand}
                      </span>
                    </div>
                    <p className="text-gray-700 text-xs leading-relaxed">{sector.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-50">
                  {sector.roles.map((role) => (
                    <span key={role} className="bg-gray-50 border border-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Featured Tips */}
      <section className="bg-white py-14">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <AnimatedSection variant="fade-up" className="mb-8">
            <span className="text-emerald-600 text-xs font-semibold uppercase tracking-widest">Destaques</span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">Dicas mais acessadas</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.map((tip, index) => (
              <AnimatedSection key={tip.id} variant="fade-up" delay={index * 80}>
                <div
                  className="rounded-xl border p-5 cursor-pointer hover:border-emerald-300 transition-all h-full"
                  style={{ borderColor: "#e5e7eb" }}
                  onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-lg shrink-0 border ${tip.color}`}>
                      <i className={`${tip.icon} text-lg`}></i>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                        {categories.find((c) => c.id === tip.category)?.label}
                      </span>
                      <h3 className="text-sm font-semibold text-gray-900 mt-0.5 leading-snug">{tip.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">{tip.summary}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <i className="ri-time-line"></i> {tip.readTime} de leitura
                    </span>
                    <span className="text-xs text-emerald-600 font-medium">
                      {expandedTip === tip.id ? "Fechar ▲" : "Ler dica ▼"}
                    </span>
                  </div>
                  {expandedTip === tip.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <ul className="space-y-2">
                        {tip.content.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                            <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                              <i className="ri-checkbox-circle-line text-emerald-500"></i>
                            </div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* All Tips */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-14">
        <AnimatedSection variant="fade-up" className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Todas as Dicas</h2>
          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "bg-emerald-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((tip, index) => (
            <AnimatedSection key={tip.id} variant="fade-up" delay={index * 60}>
              <div
                className="bg-white rounded-xl border border-gray-100 p-5 cursor-pointer hover:border-emerald-200 transition-all h-full"
                onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 flex items-center justify-center rounded-lg shrink-0 border ${tip.color}`}>
                    <i className={`${tip.icon}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                        {categories.find((c) => c.id === tip.category)?.label}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                        <i className="ri-time-line"></i> {tip.readTime}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-1">{tip.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{tip.summary}</p>
                  </div>
                </div>

                {expandedTip === tip.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <ul className="space-y-2">
                      {tip.content.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                          <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                            <i className="ri-checkbox-circle-line text-emerald-500"></i>
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-3 text-right">
                  <span className="text-xs text-emerald-600 font-medium">
                    {expandedTip === tip.id ? "Fechar ▲" : "Ver dica ▼"}
                  </span>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Blog Integration */}
      <section className="bg-white py-14">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <AnimatedSection variant="fade-up" className="flex items-end justify-between mb-8">
            <div>
              <span className="text-emerald-600 text-xs font-semibold uppercase tracking-widest">Do Blog VagasOeste</span>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">Artigos relacionados</h2>
              <p className="text-gray-700 text-sm mt-1">Aprofunde seu conhecimento com nossos artigos completos</p>
            </div>
            <Link
              to="/blog"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              Ver todos os artigos
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-arrow-right-line text-sm"></i>
              </div>
            </Link>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedPosts.map((post, index) => (
              <AnimatedSection key={post.id} variant="fade-up" delay={index * 80}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden hover:border-emerald-200 transition-all cursor-pointer block h-full"
                >
                  <div className="w-full h-40 overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-gray-400 text-xs">{post.readTime} min</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">{post.excerpt}</p>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=professional%20Brazilian%20worker%20happy%20successful%20career%20achievement%20modern%20office%20warm%20light%20clean%20minimal%20background%20confident%20smile%20employment&width=1920&height=300&seq=dicas-cta&orientation=landscape"
            alt=""
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-emerald-800/90"></div>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 py-14 text-center">
          <AnimatedSection variant="fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Pronto para se candidatar?</h2>
            <p className="text-white/80 text-sm mb-6 max-w-xl mx-auto">
              Aplique essas dicas e candidate-se às vagas disponíveis em Santarém agora mesmo. Mais de 1.240 oportunidades esperando por você.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/vagas"
                className="bg-white text-emerald-700 font-semibold px-6 py-2.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer whitespace-nowrap text-sm"
              >
                <i className="ri-briefcase-line mr-2"></i>
                Ver Vagas Disponíveis
              </Link>
              <Link
                to="/crie-seu-curriculo"
                className="border border-white/40 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap text-sm"
              >
                <i className="ri-file-text-line mr-2"></i>
                Criar meu Currículo
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
