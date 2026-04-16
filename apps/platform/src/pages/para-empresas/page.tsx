import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

const howItWorks = [
  {
    step: "01",
    icon: "ri-phone-line",
    title: "Entre em contato conosco",
    desc: "Fale com a equipe VagasOeste pelo WhatsApp ou email. Apresentamos nossa plataforma e entendemos as necessidades da sua empresa.",
  },
  {
    step: "02",
    icon: "ri-file-list-3-line",
    title: "Cadastramos sua empresa",
    desc: "Nossa equipe realiza o cadastro completo da sua empresa na plataforma e envia as credenciais de acesso para você por email.",
  },
  {
    step: "03",
    icon: "ri-briefcase-line",
    title: "Publique suas vagas",
    desc: "Acesse o painel da empresa e cadastre suas vagas com todos os detalhes: função, requisitos, salário, turno e muito mais.",
  },
  {
    step: "04",
    icon: "ri-user-search-line",
    title: "Receba candidatos qualificados",
    desc: "Os candidatos se candidatam às suas vagas. Você visualiza os perfis com escolaridade, experiências, cursos e informações relevantes.",
  },
  {
    step: "05",
    icon: "ri-shield-user-line",
    title: "Solicite pré-entrevistas",
    desc: "Encontrou um perfil interessante? Solicite uma pré-entrevista. Nossa equipe realiza a entrevista e envia um relatório detalhado para você.",
  },
  {
    step: "06",
    icon: "ri-check-double-line",
    title: "Contrate com segurança",
    desc: "Após a aprovação, intermediamos o contato entre você e o candidato. Contratação segura, ágil e com suporte completo da VagasOeste.",
  },
];

const features = [
  {
    icon: "ri-eye-off-line",
    title: "Privacidade dos candidatos",
    desc: "Os dados pessoais dos candidatos (nome, telefone, email) são protegidos. Você vê o perfil profissional e a VagasOeste intermedia o contato.",
  },
  {
    icon: "ri-filter-line",
    title: "Filtros avançados",
    desc: "Filtre candidatos por escolaridade, sexo, função e muito mais. Encontre o perfil ideal com rapidez e precisão.",
  },
  {
    icon: "ri-heart-line",
    title: "Lista de favoritos",
    desc: "Favorite os candidatos mais interessantes e solicite pré-entrevistas ou contatos em lote diretamente da lista.",
  },
  {
    icon: "ri-bar-chart-line",
    title: "Gestão de candidaturas",
    desc: "Acompanhe o status de cada candidato: Em Análise, Pré-Entrevista, Aprovado, Contratado. Histórico completo com datas.",
  },
  {
    icon: "ri-notification-line",
    title: "Notificações automáticas",
    desc: "Receba alertas quando novos candidatos se inscreverem nas suas vagas, sem que os dados pessoais deles sejam expostos.",
  },
  {
    icon: "ri-customer-service-line",
    title: "Suporte dedicado",
    desc: "Nossa equipe está disponível para auxiliar em todo o processo seletivo, desde a publicação da vaga até a contratação.",
  },
];

const testimonials = [
  {
    name: "Mariana Costa",
    role: "Gerente de RH",
    company: "Comércio Santarém",
    text: "A VagasOeste facilitou muito nosso processo de recrutamento. Em menos de uma semana encontramos o candidato ideal para a vaga de auxiliar administrativo.",
    avatar: "MC",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Roberto Alves",
    role: "Proprietário",
    company: "Restaurante Tapajós",
    text: "O sistema de pré-entrevista é excelente. Recebemos um relatório completo do candidato antes mesmo de falar com ele. Economizamos muito tempo.",
    avatar: "RA",
    color: "bg-sky-100 text-sky-700",
  },
  {
    name: "Fernanda Lima",
    role: "Diretora Comercial",
    company: "Distribuidora Oeste",
    text: "Já contratamos 4 funcionários pela VagasOeste. A qualidade dos candidatos e o suporte da equipe são diferenciais que fazem toda a diferença.",
    avatar: "FL",
    color: "bg-amber-100 text-amber-700",
  },
];

const plans = [
  {
    name: "Básico",
    price: "Gratuito",
    period: "",
    desc: "Para empresas que estão começando",
    features: [
      "Até 2 vagas ativas",
      "Visualização de candidatos",
      "Filtros básicos",
      "Suporte por email",
    ],
    cta: "Falar com a equipe",
    highlight: false,
  },
  {
    name: "Profissional",
    price: "R$ 149",
    period: "/mês",
    desc: "Para empresas em crescimento",
    features: [
      "Vagas ilimitadas",
      "Filtros avançados",
      "Lista de favoritos",
      "Solicitação de pré-entrevistas",
      "Relatórios de candidatos",
      "Notificações automáticas",
      "Suporte prioritário",
    ],
    cta: "Falar com a equipe",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    desc: "Para grandes empresas",
    features: [
      "Tudo do Profissional",
      "Gestor de conta dedicado",
      "Relatórios personalizados",
      "Integração com RH",
      "SLA garantido",
    ],
    cta: "Falar com a equipe",
    highlight: false,
  },
];

export default function ParaEmpresasPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  const faqs = [
    {
      q: "Como minha empresa se cadastra na plataforma?",
      a: "O cadastro de empresas é feito exclusivamente pela equipe VagasOeste. Entre em contato conosco pelo WhatsApp ou email, apresentamos a plataforma e realizamos o cadastro. Você recebe as credenciais de acesso por email.",
    },
    {
      q: "Posso ver os dados pessoais dos candidatos?",
      a: "Não diretamente. Os dados pessoais (nome, telefone, email) são protegidos pela VagasOeste. Você visualiza o perfil profissional completo e, quando quiser contato, nossa equipe intermedia a comunicação.",
    },
    {
      q: "O que é a pré-entrevista?",
      a: "É um serviço exclusivo da VagasOeste. Quando você solicita, nossa equipe realiza uma entrevista com o candidato e envia um relatório detalhado com as impressões do entrevistador, pontos fortes e recomendação.",
    },
    {
      q: "Quanto tempo leva para receber candidatos?",
      a: "Assim que a vaga é publicada, ela fica disponível para todos os candidatos cadastrados. Normalmente as primeiras candidaturas chegam em poucas horas.",
    },
    {
      q: "Posso alterar o status dos candidatos?",
      a: "Sim! No painel da empresa você pode alterar o status de cada candidato (Em Análise, Pré-Entrevista, Aprovado, Reprovado, Contratado) e acompanhar o histórico completo com datas.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section
        className="relative pt-16 overflow-hidden"
        style={{
          backgroundImage: `url(https://readdy.ai/api/search-image?query=modern%20professional%20office%20environment%20with%20team%20working%20together%20in%20a%20bright%20open%20space%2C%20warm%20natural%20light%2C%20minimalist%20design%2C%20green%20plants%2C%20collaborative%20workspace%2C%20high%20quality%20corporate%20photography%2C%20clean%20white%20walls%2C%20wooden%20furniture&width=1440&height=700&seq=pe-hero-1&orientation=landscape)`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-gray-900/30"></div>
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 pt-24 pb-12">
          <div className="max-w-2xl">
            <span className="inline-block bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full mb-5 uppercase tracking-wide">
              Para Empresas
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Encontre os melhores talentos da região Oeste do Pará
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              A VagasOeste conecta sua empresa a candidatos qualificados com privacidade, agilidade e suporte humano em cada etapa do processo seletivo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/interesse-empresa")}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                <i className="ri-mail-send-line text-base"></i>
                Falar com a equipe
              </button>
              <a
                href="#como-funciona"
                className="border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl text-sm hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
              >
                Como funciona
              </a>
              <button
                onClick={() => navigate("/pre-cadastro")}
                className="bg-white text-emerald-800 font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-emerald-50 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                <i className="ri-add-circle-line text-base"></i>
                Pré-Cadastro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "200+", label: "Candidatos cadastrados" },
              { value: "50+", label: "Vagas publicadas" },
              { value: "30+", label: "Empresas parceiras" },
              { value: "48h", label: "Tempo médio de resposta" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-black text-emerald-600 mb-1">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Como funciona para empresas</h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Um processo simples, seguro e com suporte humano em cada etapa.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {howItWorks.map((item) => (
            <div key={item.step} className="bg-gray-50 rounded-2xl p-6 relative overflow-hidden">
              <span className="absolute top-4 right-4 text-5xl font-black text-gray-100 leading-none select-none">{item.step}</span>
              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 relative z-10">
                <i className={`${item.icon} text-emerald-600 text-xl`}></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 relative z-10">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed relative z-10">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Recursos do painel empresarial</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              Tudo que você precisa para gerenciar seu processo seletivo em um só lugar.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                  <i className={`${f.icon} text-emerald-600 text-xl`}></i>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">O que dizem nossas empresas parceiras</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-star-fill text-amber-400 text-sm"></i>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${t.color}`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role} · {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Planos para empresas</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              Escolha o plano ideal para o tamanho e necessidade da sua empresa.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border-2 relative ${
                  plan.highlight
                    ? "border-emerald-500 bg-emerald-600 text-white"
                    : "border-gray-100 bg-white"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Mais popular
                  </span>
                )}
                <p className={`text-sm font-semibold mb-1 ${plan.highlight ? "text-emerald-200" : "text-gray-500"}`}>{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-3xl font-black ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                  {plan.period && <span className={`text-sm mb-1 ${plan.highlight ? "text-emerald-200" : "text-gray-400"}`}>{plan.period}</span>}
                </div>
                <p className={`text-xs mb-5 ${plan.highlight ? "text-emerald-200" : "text-gray-400"}`}>{plan.desc}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        <i className={`ri-check-line text-sm ${plan.highlight ? "text-emerald-200" : "text-emerald-500"}`}></i>
                      </div>
                      <span className={plan.highlight ? "text-emerald-100" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/interesse-empresa")}
                  className={`block w-full text-center font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap ${
                    plan.highlight
                      ? "bg-white text-emerald-700 hover:bg-emerald-50"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 max-w-3xl mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Dúvidas frequentes</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 text-sm">{faq.q}</span>
                <div className="w-5 h-5 flex items-center justify-center shrink-0 ml-3">
                  <i className={`ri-${openFaq === i ? "subtract" : "add"}-line text-gray-400 text-sm`}></i>
                </div>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Pronto para contratar com mais eficiência?</h2>
          <p className="text-gray-400 text-base mb-8 max-w-xl mx-auto">
            Entre em contato com nossa equipe e descubra como a VagasOeste pode transformar seu processo de recrutamento.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/interesse-empresa")}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-mail-send-line text-lg"></i>
              Falar com a equipe agora
            </button>
            <a
              href="https://wa.me/5593999999999"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-bold px-8 py-4 rounded-xl text-sm hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-whatsapp-line text-lg"></i>
              WhatsApp direto
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
