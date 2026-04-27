import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import { steps, benefits, faqItems } from "@content/como-funciona";

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm pr-4">{question}</span>
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          <i className={`${open ? "ri-subtract-line" : "ri-add-line"} text-gray-400 text-sm`}></i>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function ComoFuncionaPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden" aria-label="Como Funciona">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-950 to-gray-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_50%,rgba(16,185,129,0.15),transparent_65%)]"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 text-center">
          <nav aria-label="breadcrumb" className="mb-6 flex justify-center">
            <ol className="flex items-center gap-1.5 text-xs text-emerald-300">
              <li>
                <button onClick={() => navigate("/")} className="hover:text-white transition-colors cursor-pointer">
                  Início
                </button>
              </li>
              <li><i className="ri-arrow-right-s-line"></i></li>
              <li className="text-white font-medium">Como Funciona</li>
            </ol>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Do cadastro à contratação,<br className="hidden md:block" />
            <span className="text-emerald-300">com controle total em cada etapa</span>
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-8">
            A VagasOeste conecta candidatos e empresas com um processo automatizado, seguro e com anonimato durante a seleção.
          </p>
          {isLoggedIn ? (
            <button
              onClick={() => navigate("/vagas")}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors cursor-pointer"
            >
              <i className="ri-briefcase-line"></i>
              Ver vagas disponíveis
            </button>
          ) : (
            <button
              onClick={() => navigate("/cadastro")}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors cursor-pointer"
            >
              <i className="ri-user-add-line"></i>
              Criar conta grátis
            </button>
          )}
        </div>
      </section>

      {/* Timeline de etapas */}
      <section className="py-16 bg-white" aria-labelledby="etapas-title">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Passo a passo</p>
            <h2 id="etapas-title" className="text-2xl font-bold text-gray-900">6 Etapas Simples</h2>
          </div>

          <div className="relative">
            {/* Linha vertical (desktop) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-emerald-100 -translate-x-1/2"></div>

            <div className="space-y-8 md:space-y-0">
              {steps.map((step, i) => (
                <div
                  key={step.title}
                  className={`flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 ${step.side === "right" ? "md:flex-row-reverse" : ""} md:mb-12`}
                >
                  {/* Conteúdo */}
                  <div className={`flex-1 ${step.side === "right" ? "md:text-right" : ""}`}>
                    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-xs font-bold text-emerald-600 mb-1">Etapa {i + 1}</p>
                      <h3 className="font-bold text-gray-900 text-base mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>

                  {/* Ícone central */}
                  <div className="hidden md:flex w-12 h-12 rounded-full bg-emerald-600 border-4 border-white shadow-md items-center justify-center shrink-0 z-10">
                    <i className={`${step.icon} text-white text-xl`}></i>
                  </div>

                  {/* Espaço vazio para alternância */}
                  <div className="hidden md:block flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 bg-gray-50" aria-labelledby="beneficios-title">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Por que escolher a VagasOeste?</p>
            <h2 id="beneficios-title" className="text-2xl font-bold text-gray-900">
              Diferenciais que tornam seu processo mais seguro, eficiente e profissional
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <i className={`${b.icon} text-emerald-600 text-xl`}></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white" aria-labelledby="faq-title">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Dúvidas comuns</p>
            <h2 id="faq-title" className="text-2xl font-bold text-gray-900">Perguntas Frequentes</h2>
          </div>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-emerald-900" aria-label="Chamada para ação">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Pronto para começar?</h2>
          <p className="text-emerald-200 text-sm mb-8 leading-relaxed">
            Crie sua conta gratuitamente e encontre oportunidades em Santarém com segurança.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/vagas")}
              className="inline-flex items-center justify-center gap-2 border border-white/40 text-white font-semibold px-6 py-3 rounded-lg text-sm hover:bg-white/10 transition-colors cursor-pointer"
            >
              <i className="ri-briefcase-line"></i>
              Ver vagas disponíveis
            </button>
            {!isLoggedIn && (
              <button
                onClick={() => navigate("/cadastro")}
                className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-6 py-3 rounded-lg text-sm transition-colors cursor-pointer"
              >
                <i className="ri-user-add-line"></i>
                Criar conta grátis
              </button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
