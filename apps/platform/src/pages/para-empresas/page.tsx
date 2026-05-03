import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import { steps, features, plans, testimonials, faqItems } from "@content/para-empresas";

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm pr-4">{question}</span>
        <div className="size-5 flex items-center justify-center shrink-0">
          <i className={`${open ? "ri-subtract-line" : "ri-add-line"} text-gray-400 text-sm`} aria-hidden="true"></i>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-gray-500 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function ParaEmpresasPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden bg-emerald-950" aria-label="Para Empresas">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-950 to-gray-900">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-400/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
          <nav aria-label="breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1.5 text-xs text-emerald-300">
              <li>
                <button onClick={() => navigate("/")} className="hover:text-white transition-colors cursor-pointer">
                  Início
                </button>
              </li>
              <li><i className="ri-arrow-right-s-line" aria-hidden="true"></i></li>
              <li className="text-white font-medium">Para Empresas</li>
            </ol>
          </nav>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wide mb-3">Para Empresas</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight text-balance">
              Contrate os melhores profissionais<br className="hidden md:block" />
              <span className="text-emerald-300">de Santarém e região</span>
            </h1>
            <p className="text-white/80 text-sm md:text-base mb-8 leading-relaxed max-w-lg text-pretty">
              Plataforma automatizada para publicar vagas, receber candidatos qualificados e conduzir seu processo seletivo com mais agilidade e controle.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/interesse-empresa")}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-whatsapp-line text-base" aria-hidden="true"></i>
                Publicar Vaga Agora
              </button>
              <a
                href="#como-contratar"
                className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl text-sm hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-information-line" aria-hidden="true"></i>
                Como funciona
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Etapas do processo */}
      <section id="como-contratar" className="py-16 bg-white" aria-labelledby="processo-title">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Processo simplificado</p>
            <h2 id="processo-title" className="text-2xl font-bold text-gray-900 text-balance">Como contratar pela VagasOeste</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={step.title} className="bg-gray-50 rounded-xl p-6 border border-gray-100 relative">
                <span className="absolute top-4 right-4 text-2xl font-bold text-gray-200">0{i + 1}</span>
                <div className="size-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <i className={`${step.icon} text-emerald-600 text-xl`} aria-hidden="true"></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-balance">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed text-pretty">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recursos do painel */}
      <section className="py-16 bg-gray-50" aria-labelledby="recursos-title">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Tecnologia a favor da sua empresa</p>
            <h2 id="recursos-title" className="text-2xl font-bold text-gray-900 text-balance">Recursos do Painel Empresarial</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <i className={`${f.icon} text-2xl text-emerald-600 mb-3 block`} aria-hidden="true"></i>
                <h3 className="font-bold text-gray-900 mb-2 text-balance">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed text-pretty">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="py-16 bg-white" aria-labelledby="planos-title">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Investimento</p>
            <h2 id="planos-title" className="text-2xl font-bold text-gray-900 text-balance">Planos para Empresas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-7 border-2 relative ${
                  plan.highlight ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    Mais popular
                  </span>
                )}
                <h3 className="font-bold text-gray-900 text-lg mb-1 text-balance">{plan.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{plan.desc}</p>
                <p className="text-2xl font-bold text-emerald-600 mb-5">{plan.price}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <i className="ri-check-line text-emerald-500 shrink-0" aria-hidden="true"></i>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/interesse-empresa")}
                  className={`block w-full text-center font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap ${
                    plan.highlight
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 bg-gray-50" aria-labelledby="depoimentos-title">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 id="depoimentos-title" className="text-2xl font-bold text-gray-900 text-balance">O que dizem as empresas parceiras</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="ri-star-fill text-amber-400 text-sm" aria-hidden="true"></i>
                  ))}
                </div>
                <p className="text-gray-600 text-sm italic mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white" aria-labelledby="faq-empresas-title">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 id="faq-empresas-title" className="text-2xl font-bold text-gray-900 text-balance">Dúvidas Frequentes</h2>
          </div>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-emerald-900" aria-label="Chamada para ação empresas">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3 text-balance">Pronto para contratar?</h2>
          <p className="text-emerald-200 text-sm mb-8 leading-relaxed text-pretty">
            Nossa equipe está pronta para criar sua conta e te ajudar a encontrar os melhores profissionais de Santarém.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/interesse-empresa")}
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-6 py-3 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-chat-1-line" aria-hidden="true"></i>
              Falar com a equipe
            </button>
            <button
              onClick={() => navigate("/como-funciona")}
              className="inline-flex items-center justify-center gap-2 border border-white/40 text-white font-semibold px-6 py-3 rounded-lg text-sm hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-information-line" aria-hidden="true"></i>
              Saber mais
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
