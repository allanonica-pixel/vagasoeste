import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import { mockJobs } from "@/mocks/jobs";

const CONTRACT_COLORS: Record<string, string> = {
  CLT: "bg-emerald-100 text-emerald-700",
  PJ: "bg-amber-100 text-amber-700",
  Freelance: "bg-violet-100 text-violet-700",
  Temporário: "bg-orange-100 text-orange-700",
};

const SECTOR_COLORS: Record<string, string> = {
  Saúde: "bg-rose-50 text-rose-600 border-rose-100",
  Comércio: "bg-sky-50 text-sky-600 border-sky-100",
  Tecnologia: "bg-indigo-50 text-indigo-600 border-indigo-100",
  Logística: "bg-amber-50 text-amber-600 border-amber-100",
  Alimentação: "bg-orange-50 text-orange-600 border-orange-100",
  Indústria: "bg-gray-100 text-gray-600 border-gray-200",
  Serviços: "bg-teal-50 text-teal-600 border-teal-100",
  "Construção Civil": "bg-yellow-50 text-yellow-700 border-yellow-100",
};

const MOCK_DETAILS: Record<string, {
  fullDescription: string[];
  requirements: string[];
  desirable: string[];
  benefits: string[];
  workMode: string;
  schedule: string;
  vacancies: number;
}> = {
  "1": {
    fullDescription: [
      "Buscamos um Auxiliar Administrativo para integrar nossa equipe no bairro Centro, em Santarém/PA.",
      "O profissional será responsável por apoiar as rotinas administrativas do escritório, garantindo a organização e o bom funcionamento das operações internas.",
      "Atividades principais: controle e organização de documentos físicos e digitais, atendimento interno a colaboradores e fornecedores, suporte às demais áreas da empresa, emissão de relatórios e planilhas, controle de agenda e correspondências.",
    ],
    requirements: ["Ensino médio completo", "Pacote Office básico (Word, Excel, Outlook)", "Boa comunicação verbal e escrita", "Organização e atenção aos detalhes", "Disponibilidade para trabalho presencial"],
    desirable: ["Experiência anterior em rotinas administrativas", "Conhecimento em sistemas ERP", "Curso técnico em Administração"],
    benefits: ["Vale transporte", "Vale refeição", "Plano de saúde após 3 meses", "13º salário", "Férias remuneradas"],
    workMode: "Presencial",
    schedule: "Segunda a Sexta, 08h às 17h",
    vacancies: 2,
  },
  "2": {
    fullDescription: [
      "Estamos contratando Operador de Caixa para atuar em estabelecimento comercial no bairro Maracanã, Santarém/PA.",
      "O profissional será responsável pelo atendimento ao cliente no caixa, garantindo agilidade, precisão e cordialidade no processo de pagamento.",
      "Atividades: operação de caixa registradora e sistema PDV, controle de troco e fechamento de caixa, atendimento e orientação aos clientes, organização do espaço de trabalho.",
    ],
    requirements: ["Ensino médio completo", "Experiência mínima de 6 meses em varejo", "Habilidade com cálculo e dinheiro", "Boa comunicação e simpatia"],
    desirable: ["Experiência com sistema PDV", "Curso de atendimento ao cliente"],
    benefits: ["Vale transporte", "Vale alimentação", "Comissão por metas", "Uniforme fornecido"],
    workMode: "Presencial",
    schedule: "Escala 6x1, turnos rotativos",
    vacancies: 3,
  },
};

function getJobDetails(id: string) {
  return MOCK_DETAILS[id] || {
    fullDescription: [
      "Oportunidade de emprego em Santarém/PA. A empresa busca profissional comprometido e com vontade de crescer.",
      "O candidato selecionado atuará diretamente na área descrita, com possibilidade de crescimento dentro da organização.",
      "Mais detalhes serão fornecidos durante o processo seletivo conduzido pela equipe VagasOeste.",
    ],
    requirements: ["Escolaridade mínima conforme descrito na vaga", "Experiência na área é um diferencial", "Comprometimento e pontualidade", "Boa comunicação"],
    desirable: ["Cursos complementares na área", "Experiência prévia no setor"],
    benefits: ["Vale transporte", "Vale refeição", "Benefícios conforme CLT"],
    workMode: "Presencial",
    schedule: "A combinar",
    vacancies: 1,
  };
}

type ApplyStep = "idle" | "choose" | "login" | "register" | "logged_in_confirm" | "success";

function JobPostingSchema({ job, details }: { job: typeof mockJobs[0]; details: ReturnType<typeof getJobDetails> }) {
  const jobUrl = `https://vagasoeste.com.br/vagas/${job.id}`;
  const datePosted = job.createdAt;
  const validThrough = new Date(new Date(job.createdAt).setMonth(new Date(job.createdAt).getMonth() + 2))
    .toISOString()
    .split("T")[0];

  const employmentTypeMap: Record<string, string> = {
    CLT: "FULL_TIME",
    PJ: "CONTRACTOR",
    Temporário: "TEMPORARY",
    Freelance: "OTHER",
  };

  const jobPosting = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "@id": jobUrl,
    "url": jobUrl,
    "title": job.title,
    "description": details.fullDescription.join(" "),
    "datePosted": datePosted,
    "validThrough": validThrough,
    "employmentType": employmentTypeMap[job.contractType] || "OTHER",
    "hiringOrganization": {
      "@type": "Organization",
      "name": "VagasOeste",
      "url": "https://vagasoeste.com.br",
      "sameAs": "https://vagasoeste.com.br",
      "logo": {
        "@type": "ImageObject",
        "url": "https://vagasoeste.com.br/logo.png",
      },
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": job.neighborhood,
        "addressLocality": job.city,
        "addressRegion": "PA",
        "postalCode": "68000-000",
        "addressCountry": "BR",
      },
    },
    "baseSalary": job.salaryRange
      ? {
          "@type": "MonetaryAmount",
          "currency": "BRL",
          "value": {
            "@type": "QuantitativeValue",
            "unitText": "MONTH",
            "description": job.salaryRange,
          },
        }
      : undefined,
    "skills": details.requirements.join(", "),
    "qualifications": details.requirements.join(", "),
    "experienceRequirements": details.requirements.filter((r) => r.toLowerCase().includes("experiência")).join(", ") || undefined,
    "educationRequirements": details.requirements.filter((r) => r.toLowerCase().includes("ensino") || r.toLowerCase().includes("superior") || r.toLowerCase().includes("técnico")).join(", ") || undefined,
    "jobBenefits": details.benefits.join(", "),
    "occupationalCategory": job.sector,
    "industry": job.sector,
    "workHours": details.schedule,
    "numberOfPositions": details.vacancies,
    "applicantLocationRequirements": {
      "@type": "Country",
      "name": "Brazil",
    },
    "jobLocationType": details.workMode === "Remoto" ? "TELECOMMUTE" : undefined,
    "directApply": true,
    "identifier": {
      "@type": "PropertyValue",
      "name": "VagasOeste",
      "value": `vagasoeste-${job.id}`,
    },
    "sameAs": jobUrl,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Início",
        "item": "https://vagasoeste.com.br/",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Vagas",
        "item": "https://vagasoeste.com.br/vagas",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${job.title} em ${job.neighborhood}`,
        "item": jobUrl,
      },
    ],
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Quais são os requisitos para a vaga de ${job.title} em ${job.city}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": details.requirements.join(". ") + ".",
        },
      },
      {
        "@type": "Question",
        "name": `Quais benefícios a vaga de ${job.title} oferece?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": details.benefits.join(", ") + ".",
        },
      },
      {
        "@type": "Question",
        "name": `Qual é o horário de trabalho para a vaga de ${job.title}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": details.schedule,
        },
      },
      {
        "@type": "Question",
        "name": `Como me candidatar à vaga de ${job.title} em ${job.neighborhood}, ${job.city}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Para se candidatar à vaga de ${job.title} em ${job.neighborhood}, ${job.city}/PA, clique no botão "Quero me Candidatar!" nesta página. Você precisará criar um cadastro gratuito na plataforma VagasOeste ou fazer login se já tiver conta. O processo é 100% online e gratuito para candidatos.`,
        },
      },
      {
        "@type": "Question",
        "name": `Quantas vagas estão disponíveis para ${job.title}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Há ${details.vacancies} vaga${details.vacancies !== 1 ? "s" : ""} disponível${details.vacancies !== 1 ? "eis" : ""} para ${job.title} em ${job.neighborhood}, ${job.city}/PA. O tipo de contrato é ${job.contractType}.`,
        },
      },
    ],
  };

  // Remove undefined fields recursively
  const clean = (obj: unknown): unknown => JSON.parse(JSON.stringify(obj));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clean(jobPosting)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  );
}

// ─── FAQ Visual Section ───────────────────────────────────────────────────────
function VagaFAQSection({ job, details }: { job: typeof mockJobs[0]; details: ReturnType<typeof getJobDetails> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: `Quais são os requisitos para a vaga de ${job.title} em ${job.city}?`,
      a: details.requirements.join(". ") + ".",
    },
    {
      q: `Quais benefícios a vaga de ${job.title} oferece?`,
      a: details.benefits.join(", ") + ".",
    },
    {
      q: `Qual é o horário de trabalho para a vaga de ${job.title}?`,
      a: details.schedule,
    },
    {
      q: `Como me candidatar à vaga de ${job.title} em ${job.neighborhood}, ${job.city}?`,
      a: `Para se candidatar à vaga de ${job.title} em ${job.neighborhood}, ${job.city}/PA, clique no botão "Quero me Candidatar!" nesta página. Você precisará criar um cadastro gratuito na plataforma VagasOeste ou fazer login se já tiver conta. O processo é 100% online e gratuito para candidatos.`,
    },
    {
      q: `Quantas vagas estão disponíveis para ${job.title}?`,
      a: `Há ${details.vacancies} vaga${details.vacancies !== 1 ? "s" : ""} disponível${details.vacancies !== 1 ? "eis" : ""} para ${job.title} em ${job.neighborhood}, ${job.city}/PA. O tipo de contrato é ${job.contractType}.`,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
        <div className="w-5 h-5 flex items-center justify-center">
          <i className="ri-question-answer-line text-emerald-500 text-sm"></i>
        </div>
        Perguntas Frequentes sobre esta Vaga
      </h2>
      <p className="text-xs text-gray-500 mb-4 ml-7">Tire suas dúvidas antes de se candidatar</p>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="border border-gray-100 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-start justify-between gap-3 px-4 py-3.5 text-left cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-800 leading-snug">{faq.q}</span>
              <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                <i className={`text-gray-400 text-sm transition-transform duration-200 ${openIndex === i ? "ri-subtract-line" : "ri-add-line"}`}></i>
              </div>
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 pt-1">
                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VagaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [applyStep, setApplyStep] = useState<ApplyStep>("idle");

  // Detecta se o usuário está logado como candidato
  const isLoggedIn = sessionStorage.getItem("vagasoeste_user_auth") === "candidato";

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  const job = mockJobs.find((j) => j.id === id);
  const details = job ? getJobDetails(job.id) : null;

  // Inject Schema.org and meta tags into document head — must be before any early return
  useEffect(() => {
    if (!job) return;
    const prevTitle = document.title;
    document.title = `${job.title} em ${job.neighborhood}, ${job.city}/PA — ${job.contractType} | VagasOeste`;

    const metaDesc = document.querySelector("meta[name='description']");
    const prevDesc = metaDesc?.getAttribute("content") || "";
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        `Vaga de ${job.title} em ${job.neighborhood}, ${job.city}/PA. Contrato ${job.contractType}. ${job.salaryRange ? `Salário: ${job.salaryRange}.` : "Salário a combinar."} ${details?.benefits.slice(0, 2).join(", ")}. Candidate-se grátis pela VagasOeste.`
      );
    }

    // Canonical
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    const prevCanonical = canonical?.href || "";
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `https://vagasoeste.com.br/vagas/${job.id}`;

    // OG tags
    const ogTitle = document.querySelector("meta[property='og:title']");
    const ogDesc = document.querySelector("meta[property='og:description']");
    const prevOgTitle = ogTitle?.getAttribute("content") || "";
    const prevOgDesc = ogDesc?.getAttribute("content") || "";
    if (ogTitle) ogTitle.setAttribute("content", `${job.title} em ${job.neighborhood}, ${job.city}/PA | VagasOeste`);
    if (ogDesc) ogDesc.setAttribute("content", `Vaga de ${job.title} — ${job.contractType} — ${job.neighborhood}, ${job.city}/PA. Candidate-se grátis!`);

    return () => {
      document.title = prevTitle;
      if (metaDesc) metaDesc.setAttribute("content", prevDesc);
      if (canonical) canonical.href = prevCanonical;
      if (ogTitle) ogTitle.setAttribute("content", prevOgTitle);
      if (ogDesc) ogDesc.setAttribute("content", prevOgDesc);
    };
  }, [job, details]);

  if (!job || !details) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-32 text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <i className="ri-search-line text-gray-300 text-4xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Vaga não encontrada</h1>
          <p className="text-gray-500 mb-6">Esta vaga pode ter sido encerrada ou o link está incorreto.</p>
          <Link to="/vagas" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
            Ver todas as vagas
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedJobs = mockJobs.filter((j) => j.sector === job.sector && j.id !== job.id).slice(0, 3);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    setTimeout(() => {
      if (loginEmail === "candidato@email.com" && loginPassword === "vagasoeste") {
        setApplyStep("logged_in_confirm");
      } else {
        setLoginError("Email ou senha incorretos.");
      }
      setLoginLoading(false);
    }, 800);
  };

  const closeModal = () => {
    setApplyStep("idle");
    setLoginEmail("");
    setLoginPassword("");
    setLoginError("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <JobPostingSchema job={job} details={details} />
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 pt-16">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center gap-2 text-xs text-gray-500">
          <Link to="/" className="hover:text-emerald-600 transition-colors cursor-pointer">Início</Link>
          <i className="ri-arrow-right-s-line"></i>
          <Link to="/vagas" className="hover:text-emerald-600 transition-colors cursor-pointer">Vagas</Link>
          <i className="ri-arrow-right-s-line"></i>
          <span className="text-gray-800 font-medium truncate">{job.title}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Job Header Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CONTRACT_COLORS[job.contractType] || "bg-gray-100 text-gray-600"}`}>
                      {job.contractType}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                      {details.workMode}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs text-emerald-600 font-medium">Vaga ativa</span>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    {job.sector && (
                      <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full border ${SECTOR_COLORS[job.sector] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
                        <i className="ri-building-line text-xs"></i>
                        Setor {job.sector}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">{job.area}</span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <i className="ri-briefcase-line text-emerald-600 text-2xl"></i>
                </div>
              </div>

              {/* Key Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-50">
                {[
                  { icon: "ri-map-pin-line", label: "Bairro", value: `${job.neighborhood}, ${job.city}` },
                  { icon: "ri-money-dollar-circle-line", label: "Salário", value: job.salaryRange || "A combinar" },
                  { icon: "ri-time-line", label: "Horário", value: details.schedule },
                  { icon: "ri-user-line", label: "Vagas", value: `${details.vacancies} vaga${details.vacancies !== 1 ? "s" : ""}` },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className={`${item.icon} text-emerald-500 text-xs`}></i>
                      </div>
                      <span className="text-xs text-gray-400">{item.label}</span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm leading-tight">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-file-text-line text-emerald-500 text-sm"></i>
                </div>
                Sobre a Vaga
              </h2>
              <div className="space-y-3">
                {details.fullDescription.map((paragraph, i) => (
                  <p key={i} className="text-gray-800 text-sm leading-relaxed">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-checkbox-circle-line text-emerald-500 text-sm"></i>
                </div>
                Requisitos Obrigatórios
              </h2>
              <ul className="space-y-2.5">
                {details.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 flex items-center justify-center mt-0.5 shrink-0">
                      <i className="ri-check-line text-emerald-500 text-sm"></i>
                    </div>
                    <span className="text-gray-800 text-sm">{req}</span>
                  </li>
                ))}
              </ul>
              {details.desirable.length > 0 && (
                <div className="mt-5 pt-5 border-t border-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-star-line text-amber-400 text-xs"></i>
                    </div>
                    Diferenciais (desejável)
                  </h3>
                  <ul className="space-y-2">
                    {details.desirable.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <div className="w-5 h-5 flex items-center justify-center mt-0.5 shrink-0">
                          <i className="ri-add-circle-line text-amber-400 text-sm"></i>
                        </div>
                        <span className="text-gray-800 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-gift-line text-emerald-500 text-sm"></i>
                </div>
                Benefícios
              </h2>
              <div className="flex flex-wrap gap-2">
                {details.benefits.map((benefit, i) => (
                  <span key={i} className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-3 py-1.5 rounded-full">
                    <i className="ri-check-line text-xs"></i>
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
              <div className="w-5 h-5 flex items-center justify-center mt-0.5 shrink-0">
                <i className="ri-shield-check-line text-amber-600 text-sm"></i>
              </div>
              <div>
                <p className="text-amber-900 font-semibold text-sm mb-1">Empresa anônima — sua privacidade protegida</p>
                <p className="text-amber-700 text-xs leading-relaxed">
                  O nome da empresa não é divulgado até que você seja selecionado. A VagasOeste gerencia todo o processo seletivo com segurança e transparência. Você receberá atualizações pelo WhatsApp e e-mail cadastrados.
                </p>
              </div>
            </div>

            {/* FAQ Visual */}
            <VagaFAQSection job={job} details={details} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply Card — Sticky */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              <div className="text-center mb-4">
                <p className="text-xs text-gray-500 mb-1">Publicada em {new Date(job.createdAt).toLocaleDateString("pt-BR")}</p>
                <div className="flex items-center justify-center gap-1.5 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs text-emerald-600 font-medium">Vaga disponível</span>
                </div>
                {isLoggedIn ? (
                  <p className="text-gray-800 text-sm">
                    Candidate-se agora e a equipe <strong>VagasOeste</strong> cuidará de todo o processo!
                  </p>
                ) : (
                  <p className="text-gray-600 text-sm">
                    Faça <strong>login</strong> ou <strong>crie sua conta</strong> para se candidatar a esta vaga.
                  </p>
                )}
              </div>

              {isLoggedIn ? (
                /* Usuário logado — candidatura direta */
                <button
                  onClick={() => setApplyStep("logged_in_confirm")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <i className="ri-send-plane-line text-sm"></i>
                  Quero me Candidatar!
                </button>
              ) : (
                /* Usuário não logado — CTAs de login/cadastro */
                <div className="space-y-2">
                  <button
                    onClick={() => navigate(`/login?redirect=/vagas/${job.id}`)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <i className="ri-login-box-line text-sm"></i>
                    Entrar e candidatar-se
                  </button>
                  <button
                    onClick={() => navigate("/cadastro")}
                    className="w-full border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-semibold py-3 rounded-xl text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <i className="ri-user-add-line text-sm"></i>
                    Criar conta grátis
                  </button>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-1">
                    <p className="text-xs text-amber-700 text-center">
                      <i className="ri-lock-line mr-1"></i>
                      Somente usuários cadastrados podem se candidatar
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <i className="ri-whatsapp-line text-emerald-500 text-xs"></i>
                  Atualizações via WhatsApp
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <i className="ri-mail-line text-emerald-500 text-xs"></i>
                  Notificações por e-mail
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <i className="ri-eye-off-line text-emerald-500 text-xs"></i>
                  Empresa anônima até seleção
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50">
                <button
                  onClick={() => navigate("/vagas")}
                  className="w-full text-gray-500 hover:text-gray-700 text-xs font-medium py-2 cursor-pointer transition-colors flex items-center justify-center gap-1"
                >
                  <i className="ri-arrow-left-line text-xs"></i>
                  Ver outras vagas
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tags da vaga</p>
              <div className="flex flex-wrap gap-1.5">
                {job.tags.map((tag) => (
                  <span key={tag} className="bg-gray-50 border border-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Outras vagas · Setor {job.sector}
                </p>
                <div className="space-y-3">
                  {relatedJobs.map((related) => (
                    <Link
                      key={related.id}
                      to={`/vagas/${related.id}`}
                      className="block p-3 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors cursor-pointer"
                    >
                      <p className="font-semibold text-gray-800 text-sm mb-1">{related.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <i className="ri-map-pin-line text-emerald-500"></i>
                        {related.neighborhood}
                        <span className="text-gray-300">·</span>
                        <span className={`font-medium px-1.5 py-0.5 rounded-full text-xs ${CONTRACT_COLORS[related.contractType] || "bg-gray-100 text-gray-600"}`}>
                          {related.contractType}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* ===== APPLY MODAL FLOW ===== */}
      {applyStep !== "idle" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">

            {/* STEP: Choose */}
            {applyStep === "choose" && (
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <i className="ri-briefcase-line text-emerald-600 text-2xl"></i>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Candidatar-se à vaga</h2>
                  <p className="text-gray-500 text-sm">
                    <strong className="text-gray-700">{job.title}</strong> · {job.neighborhood}
                  </p>
                </div>

                <div className="space-y-3 mb-5">
                  <button
                    onClick={() => setApplyStep("login")}
                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 hover:border-emerald-400 rounded-xl cursor-pointer transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <i className="ri-login-box-line text-emerald-600 text-lg"></i>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Já tenho cadastro</p>
                      <p className="text-gray-400 text-xs">Entrar com meu email e senha</p>
                    </div>
                    <div className="w-5 h-5 flex items-center justify-center ml-auto">
                      <i className="ri-arrow-right-s-line text-gray-300 group-hover:text-emerald-500 transition-colors"></i>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate("/cadastro")}
                    className="w-full flex items-center gap-4 p-4 border-2 border-emerald-500 bg-emerald-50 hover:bg-emerald-100 rounded-xl cursor-pointer transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <i className="ri-user-add-line text-emerald-600 text-lg"></i>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-emerald-800 text-sm">Criar cadastro grátis</p>
                        <span className="bg-emerald-600 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">Recomendado</span>
                      </div>
                      <p className="text-emerald-600 text-xs">Leva menos de 2 minutos!</p>
                    </div>
                    <div className="w-5 h-5 flex items-center justify-center ml-auto">
                      <i className="ri-arrow-right-s-line text-emerald-400"></i>
                    </div>
                  </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <p className="text-xs text-gray-500 text-center">
                    <i className="ri-shield-check-line text-emerald-500 mr-1"></i>
                    Seus dados são protegidos. A empresa não recebe suas informações pessoais.
                  </p>
                </div>

                <button onClick={closeModal} className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 cursor-pointer transition-colors">
                  Cancelar
                </button>
              </div>
            )}

            {/* STEP: Login */}
            {applyStep === "login" && (
              <div className="p-8">
                <button onClick={() => setApplyStep("choose")} className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-xs cursor-pointer mb-5 transition-colors">
                  <i className="ri-arrow-left-line text-xs"></i>
                  Voltar
                </button>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                    <i className="ri-login-box-line text-emerald-600 text-xl"></i>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Entrar na plataforma</h2>
                  <p className="text-gray-500 text-sm">Para se candidatar à vaga de <strong>{job.title}</strong></p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Senha</label>
                    <div className="relative">
                      <input
                        type={showLoginPwd ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 transition-colors pr-10"
                      />
                      <button type="button" onClick={() => setShowLoginPwd(!showLoginPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer text-gray-400">
                        <i className={`${showLoginPwd ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex items-center gap-2">
                      <i className="ri-error-warning-line text-red-500 text-sm"></i>
                      <p className="text-red-600 text-xs">{loginError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm cursor-pointer transition-colors whitespace-nowrap ${loginLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {loginLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <i className="ri-loader-4-line animate-spin text-sm"></i>
                        Entrando...
                      </span>
                    ) : "Entrar e candidatar-se"}
                  </button>
                </form>

                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500">
                    Não tem conta?{" "}
                    <button onClick={() => navigate("/cadastro")} className="text-emerald-600 font-semibold hover:underline cursor-pointer">
                      Cadastre-se grátis
                    </button>
                  </p>
                </div>

                <div className="mt-3 bg-amber-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-amber-700">
                    <i className="ri-magic-line mr-1"></i>
                    Demo: candidato@email.com / vagasoeste
                  </p>
                </div>
              </div>
            )}

            {/* STEP: Logged in confirm */}
            {applyStep === "logged_in_confirm" && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-user-star-line text-emerald-600 text-2xl"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Confirmar candidatura</h2>
                <p className="text-gray-500 text-sm mb-1">Você está se candidatando à vaga de:</p>
                <p className="font-bold text-gray-900 text-lg mb-1">{job.title}</p>
                <p className="text-gray-400 text-sm mb-5">{job.neighborhood}, {job.city} · {job.contractType}</p>

                <div className="bg-gray-50 rounded-xl p-4 mb-5 text-left space-y-2">
                  {[
                    { icon: "ri-search-eye-line", text: "Nossa equipe analisará seu perfil" },
                    { icon: "ri-shield-user-line", text: "Seus dados pessoais ficam protegidos" },
                    { icon: "ri-whatsapp-line", text: "Você receberá atualizações pelo WhatsApp" },
                    { icon: "ri-mail-line", text: "E também por email" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <i className={`${item.icon} text-emerald-500 text-sm`}></i>
                      </div>
                      <span className="text-gray-600 text-xs">{item.text}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setApplyStep("success")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm cursor-pointer transition-colors whitespace-nowrap mb-3"
                >
                  Confirmar candidatura!
                </button>
                <button onClick={closeModal} className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 cursor-pointer transition-colors">
                  Cancelar
                </button>
              </div>
            )}

            {/* STEP: Success */}
            {applyStep === "success" && (
              <div className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                  <i className="ri-checkbox-circle-fill text-emerald-600 text-4xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidatura enviada!</h2>
                <p className="text-emerald-600 font-semibold text-lg mb-3">Parabéns! 🎉</p>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Sua candidatura para <strong>{job.title}</strong> foi registrada com sucesso. Nossa equipe já foi notificada e entrará em contato em breve!
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate("/plataforma")}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm cursor-pointer transition-colors whitespace-nowrap"
                  >
                    Ver minhas candidaturas
                  </button>
                  <button
                    onClick={() => { closeModal(); navigate("/vagas"); }}
                    className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    Ver mais vagas
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
