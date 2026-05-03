import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AnimatedSection from "@/components/base/AnimatedSection";

const steps = [
  {
    icon: "ri-user-add-line",
    title: "Crie sua conta gratuitamente",
    desc: "Cadastro rápido para montar seu perfil profissional.",
  },
  {
    icon: "ri-search-eye-line",
    title: "Explore as vagas disponíveis",
    desc: "Filtre vagas por função/cargo, setor e tipo de contrato.",
  },
  {
    icon: "ri-send-plane-line",
    title: "Candidate-se com 1 clique",
    desc: "Envio rápido, seguro e sem exposição de dados pessoais.",
  },
  {
    icon: "ri-notification-3-line",
    title: "Acompanhe em tempo real",
    desc: "Receba atualizações por email e WhatsApp.",
  },
  {
    icon: "ri-shield-check-line",
    title: "Processo seguro",
    desc: "Informações pessoais como nome, telefone e email não são compartilhadas durante o processo seletivo.",
  },
  {
    icon: "ri-trophy-line",
    title: "Avance até a contratação",
    desc: "Ao ser selecionado, você segue diretamente com a empresa.",
  },
];

export default function HowItWorksSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <AnimatedSection variant="fade-up" className="text-center mb-10">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
            Simples e seguro
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-balance">Como Funciona</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto text-pretty">
            Do cadastro à contratação, com controle total em cada etapa.
          </p>
        </AnimatedSection>

        {/* Steps Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${isLoggedIn ? "" : "mb-10"}`}>
          {steps.map((step, i) => (
            <AnimatedSection key={step.title} variant="fade-up" delay={i * 80}>
              <div className="flex gap-4 p-4">
                <div className="size-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <i className={`${step.icon} text-emerald-600 text-xl`} aria-hidden="true"></i>
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

        {/* CTA Cards — exibido apenas para usuários não logados */}
        {!isLoggedIn && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mt-10">
            <button
              type="button"
              onClick={() => navigate("/cadastro")}
              className="flex flex-col items-center text-center gap-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition-colors p-6 cursor-pointer w-full"
            >
              <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <i className="ri-user-search-line text-emerald-600 text-2xl" aria-hidden="true"></i>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-base">Quero encontrar emprego</p>
                <p className="text-sm text-gray-500 mt-1">Crie sua conta grátis e candidate-se</p>
              </div>
            </button>

            <a
              href="https://santarem.app/interesse-empresa"
              className="flex flex-col items-center text-center gap-3 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors p-6 w-full"
            >
              <div className="size-12 rounded-full bg-gray-100 flex items-center justify-center">
                <i className="ri-building-2-line text-gray-600 text-2xl" aria-hidden="true"></i>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-base">Quero contratar talentos</p>
                <p className="text-sm text-gray-500 mt-1">Publique vagas e encontre candidatos</p>
              </div>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
