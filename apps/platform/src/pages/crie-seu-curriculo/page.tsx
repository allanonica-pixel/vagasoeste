import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

const steps = [
  {
    number: "01",
    icon: "ri-user-add-line",
    title: "Crie sua conta gratuita",
    description: "Cadastre-se na plataforma VagasOeste em menos de 2 minutos. Só precisa de e-mail e senha.",
  },
  {
    number: "02",
    icon: "ri-edit-2-line",
    title: "Preencha seu currículo",
    description: "Use nosso editor guiado para inserir suas experiências, habilidades, formação e objetivos profissionais.",
  },
  {
    number: "03",
    icon: "ri-eye-line",
    title: "Visualize e revise",
    description: "Veja como seu currículo ficará antes de finalizar. Faça ajustes até ficar perfeito.",
  },
  {
    number: "04",
    icon: "ri-secure-payment-line",
    title: "Pague e baixe o PDF",
    description: "Pagamento único e seguro. Após a confirmação automática, seu currículo em PDF fica disponível para download imediato.",
  },
];

const benefits = [
  { icon: "ri-layout-line", title: "Templates Profissionais", desc: "Modelos modernos e aprovados por recrutadores de Santarém e região." },
  { icon: "ri-magic-line", title: "Editor Guiado", desc: "Passo a passo intuitivo — sem precisar saber nada de design ou formatação." },
  { icon: "ri-file-pdf-line", title: "PDF de Alta Qualidade", desc: "Arquivo pronto para enviar por e-mail ou imprimir, com visual impecável." },
  { icon: "ri-cloud-line", title: "Salvo na Plataforma", desc: "Seu currículo fica salvo na sua conta. Acesse e baixe quando quiser." },
  { icon: "ri-refresh-line", title: "Atualize Quando Quiser", desc: "Edite e gere um novo PDF sempre que precisar atualizar suas informações." },
  { icon: "ri-shield-check-line", title: "Pagamento Seguro", desc: "Transação protegida com confirmação automática e liberação imediata." },
];

const faqs = [
  {
    q: "Preciso pagar para criar o currículo?",
    a: "Criar e editar o currículo é gratuito. O pagamento é cobrado apenas para gerar e baixar o arquivo PDF final.",
  },
  {
    q: "Quanto custa o download do PDF?",
    a: "O valor é acessível e único — você paga uma vez e pode baixar o PDF quantas vezes quiser, além de ter acesso a futuras atualizações do mesmo currículo.",
  },
  {
    q: "Posso atualizar meu currículo depois?",
    a: "Sim! Seu currículo fica salvo na plataforma. Você pode editar e gerar um novo PDF sempre que precisar.",
  },
  {
    q: "O pagamento é seguro?",
    a: "Sim. Utilizamos uma plataforma de pagamento certificada. A liberação do download é automática após a confirmação do pagamento.",
  },
  {
    q: "Posso usar o currículo para me candidatar às vagas da VagasOeste?",
    a: "Com certeza! Após criar seu currículo, você pode se candidatar diretamente às vagas disponíveis na plataforma.",
  },
];

export default function CrieSeuCurriculoPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=professional%20resume%20curriculum%20vitae%20document%20on%20clean%20white%20desk%20with%20pen%20notebook%20laptop%20modern%20minimal%20office%20workspace%20warm%20light%20top%20view&width=1920&height=700&seq=curriculo-hero&orientation=landscape"
            alt="Crie seu currículo profissional"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/75 to-emerald-800/50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-12 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 mb-6">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-file-text-line text-emerald-300 text-sm"></i>
              </div>
              <span className="text-white/90 text-xs font-medium">Currículo profissional em minutos</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
              Crie seu<br />
              <span className="text-emerald-300">Currículo!</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-xl leading-relaxed mb-8">
              Monte um currículo profissional com nosso editor guiado, baixe em PDF e aumente suas chances de conseguir a vaga que você merece em Santarém.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <button
                onClick={() => navigate("/cadastro")}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-3.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap text-base"
              >
                Crie Aqui!
              </button>
              <a
                href="#como-funciona"
                className="border border-white/40 text-white font-medium px-6 py-3.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap text-sm flex items-center justify-center gap-2"
              >
                <i className="ri-play-circle-line"></i>
                Como funciona
              </a>
            </div>
          </div>

          {/* Preview Card */}
          <div className="w-full lg:w-80 bg-white rounded-2xl p-6 shrink-0">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <i className="ri-user-line text-emerald-600 text-xl"></i>
              </div>
              <div>
                <div className="h-3 bg-gray-200 rounded w-28 mb-1.5"></div>
                <div className="h-2.5 bg-gray-100 rounded w-20"></div>
              </div>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <div className="h-2 bg-emerald-100 rounded w-16 mb-1.5"></div>
                <div className="h-2 bg-gray-100 rounded w-full mb-1"></div>
                <div className="h-2 bg-gray-100 rounded w-4/5"></div>
              </div>
              <div>
                <div className="h-2 bg-emerald-100 rounded w-20 mb-1.5"></div>
                <div className="h-2 bg-gray-100 rounded w-full mb-1"></div>
                <div className="h-2 bg-gray-100 rounded w-3/4 mb-1"></div>
                <div className="h-2 bg-gray-100 rounded w-5/6"></div>
              </div>
              <div>
                <div className="h-2 bg-emerald-100 rounded w-24 mb-1.5"></div>
                <div className="flex flex-wrap gap-1.5">
                  {["Excel", "Word", "Atendimento", "Vendas"].map((s) => (
                    <span key={s} className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-emerald-600 text-white text-xs font-semibold text-center py-2.5 rounded-lg flex items-center justify-center gap-2">
              <i className="ri-download-line"></i>
              Baixar PDF — R$ 9,90
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">Pagamento único · Acesso vitalício</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Como funciona</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Em 4 passos simples você tem um currículo profissional pronto para usar.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-emerald-100 z-0" style={{ width: "calc(100% - 2rem)" }}></div>
                )}
                <div className="bg-white rounded-xl p-5 border border-gray-100 relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-bold text-emerald-100">{step.number}</span>
                    <div className="w-9 h-9 flex items-center justify-center bg-emerald-50 rounded-lg">
                      <i className={`${step.icon} text-emerald-600`}></i>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Por que usar o nosso editor?</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Desenvolvido especialmente para candidatos de Santarém e região, com foco em praticidade e resultado.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b) => (
              <div key={b.title} className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 flex items-center justify-center bg-emerald-100 rounded-lg shrink-0">
                  <i className={`${b.icon} text-emerald-600 text-lg`}></i>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{b.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-emerald-700">
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Simples e acessível</h2>
          <p className="text-white/80 text-sm mb-10">Criar é grátis. Você só paga quando quiser baixar o PDF.</p>
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-auto">
            <div className="text-center mb-6">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Download do PDF</p>
              <div className="flex items-end justify-center gap-1">
                <span className="text-4xl font-bold text-gray-900">R$ 9,90</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">pagamento único</p>
            </div>
            <ul className="space-y-2.5 mb-6">
              {[
                "Criação e edição gratuitas",
                "PDF profissional de alta qualidade",
                "Acesso vitalício ao arquivo",
                "Atualizações inclusas",
                "Confirmação automática de pagamento",
                "Suporte via WhatsApp",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    <i className="ri-check-line text-emerald-500"></i>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("/cadastro")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Crie Aqui! — É Grátis
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">Só paga quando for baixar o PDF</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Perguntas frequentes</h2>
            <p className="text-gray-500 text-sm">Tire suas dúvidas antes de começar.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
                >
                  <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <i className={`text-gray-400 transition-transform ${openFaq === i ? "ri-subtract-line" : "ri-add-line"}`}></i>
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Comece agora mesmo</h2>
          <p className="text-gray-500 text-sm mb-7">
            Crie sua conta, monte seu currículo e candidate-se às melhores vagas de Santarém.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/cadastro")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Crie Aqui!
            </button>
            <Link
              to="/dicas-de-vaga"
              className="border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap text-sm flex items-center justify-center gap-2"
            >
              <i className="ri-lightbulb-line text-emerald-500"></i>
              Ver Dicas de Vaga
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
