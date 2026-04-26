import { useNavigate } from "react-router-dom";
import AnimatedSection from "@/components/base/AnimatedSection";

const steps = [
  {
    icon: "ri-user-add-line",
    title: "Crie sua conta grátis",
    desc: "Cadastro simples em 4 etapas: dados pessoais, perfil, cursos e senha.",
  },
  {
    icon: "ri-search-eye-line",
    title: "Explore as vagas",
    desc: "Veja vagas por bairro, setor e tipo de contrato. Empresa anônima até você ser selecionado.",
  },
  {
    icon: "ri-send-plane-line",
    title: "Candidate-se",
    desc: 'Candidatura com 1 clique. Sem precisar enviar e-mail ou entrar em contato.',
  },
  {
    icon: "ri-notification-3-line",
    title: "Acompanhe em tempo real",
    desc: "Receba notificações por WhatsApp e e-mail sobre cada etapa do processo.",
  },
  {
    icon: "ri-shield-check-line",
    title: "Processo seguro",
    desc: "Seus dados são protegidos. A empresa só vê seu perfil profissional, nunca seus dados pessoais.",
  },
  {
    icon: "ri-trophy-line",
    title: "Conquiste a vaga",
    desc: "Quando selecionado, a VagasOeste media o contato e te acompanha até a contratação.",
  },
];

export default function HowItWorksSection() {
  const navigate = useNavigate();

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <AnimatedSection variant="fade-up" className="text-center mb-10">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
            Simples e seguro
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Como Funciona</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Do cadastro à contratação, com todo processo intermediado pela nossa equipe.
          </p>
        </AnimatedSection>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {steps.map((step, i) => (
            <AnimatedSection key={step.title} variant="fade-up" delay={i * 80}>
              <div className="flex gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <i className={`${step.icon} text-emerald-600 text-xl`}></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-600 mb-1">0{i + 1}</p>
                  <h3 className="font-semibold text-gray-900 text-base mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* CTA Cards — gradiente, sem imagens externas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Candidato */}
          <button
            onClick={() => navigate("/vagas")}
            className="flex flex-col items-center text-center gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition-colors p-6 cursor-pointer w-full"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <i className="ri-user-search-line text-emerald-600 text-2xl"></i>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">Quero encontrar emprego</p>
              <p className="text-sm text-gray-500 mt-1">Veja todas as vagas disponíveis</p>
            </div>
          </button>

          {/* Empresa */}
          <button
            onClick={() => navigate("/para-empresas")}
            className="flex flex-col items-center text-center gap-3 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors p-6 cursor-pointer w-full"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <i className="ri-building-2-line text-gray-600 text-2xl"></i>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">Quero contratar talentos</p>
              <p className="text-sm text-gray-500 mt-1">Publique vagas e encontre candidatos</p>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
