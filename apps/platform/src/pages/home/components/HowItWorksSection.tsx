import { useNavigate } from "react-router-dom";
import AnimatedSection from "@/components/base/AnimatedSection";

const steps = [
  {
    number: "01",
    icon: "ri-user-add-line",
    title: "Cadastre-se gratuitamente",
    description: "Preencha seus dados profissionais: experiências, cursos, disponibilidade. Seu nome e dados pessoais ficam protegidos.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    number: "02",
    icon: "ri-search-eye-line",
    title: "Explore as vagas",
    description: "Veja as vagas disponíveis por bairro e área. Você sabe onde fica a empresa, mas o nome dela é revelado só depois.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    number: "03",
    icon: "ri-checkbox-multiple-line",
    title: "Candidate-se às vagas",
    description: "Selecione as vagas que te interessam e clique em \"Vamos lá!\". Você pode se candidatar a várias vagas de uma vez.",
    color: "bg-sky-50 text-sky-600",
  },
  {
    number: "04",
    icon: "ri-team-line",
    title: "A VagasOeste trabalha por você",
    description: "Nossa equipe analisa seu perfil, apresenta você às empresas de forma anônima e conduz o processo seletivo.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    number: "05",
    icon: "ri-whatsapp-line",
    title: "Receba atualizações",
    description: "Você recebe notificações pelo WhatsApp e email sobre o andamento das suas candidaturas em tempo real.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    number: "06",
    icon: "ri-trophy-line",
    title: "Seja contratado!",
    description: "Quando aprovado, a empresa é revelada e você recebe todos os detalhes para iniciar sua nova jornada profissional.",
    color: "bg-amber-50 text-amber-600",
  },
];

export default function HowItWorksSection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <AnimatedSection variant="fade-up" className="text-center mb-16">
          <span className="text-emerald-600 text-xs font-semibold uppercase tracking-widest">Processo</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Como funciona a VagasOeste
          </h2>
          <p className="text-gray-700 text-base max-w-2xl mx-auto">
            Um processo simples, seguro e transparente para conectar você à sua próxima oportunidade de emprego.
          </p>
        </AnimatedSection>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {steps.map((step, index) => (
            <AnimatedSection key={step.number} variant="fade-up" delay={index * 80}>
              <div className="relative p-6 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors group h-full">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${step.color}`}>
                    <i className={`${step.icon} text-base`}></i>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-300 tracking-widest">{step.number}</span>
                    <h3 className="font-bold text-gray-900 text-base mt-0.5 mb-2">{step.title}</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* CTA Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatedSection variant="fade-left" delay={100}>
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src="https://readdy.ai/api/search-image?query=young%20Brazilian%20professional%20person%20smiling%20looking%20at%20laptop%20job%20search%20modern%20office%20environment%20warm%20natural%20light%20clean%20background%20hopeful%20expression&width=600&height=300&seq=cta1&orientation=landscape"
                alt="Candidato buscando emprego"
                className="w-full h-48 object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-900/50 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-emerald-300 text-xs font-semibold uppercase tracking-widest mb-1">Para Candidatos</p>
                <h3 className="text-white font-bold text-xl mb-3">Quero encontrar emprego</h3>
                <button
                  onClick={() => navigate("/cadastro")}
                  className="bg-white text-emerald-700 font-semibold text-sm px-5 py-2 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Criar meu cadastro grátis
                </button>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection variant="fade-right" delay={100}>
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src="https://readdy.ai/api/search-image?query=Brazilian%20business%20team%20meeting%20office%20professional%20environment%20modern%20workspace%20collaboration%20hiring%20recruitment%20warm%20tones%20clean%20background&width=600&height=300&seq=cta2&orientation=landscape"
                alt="Empresa buscando candidatos"
                className="w-full h-48 object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/50 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-amber-300 text-xs font-semibold uppercase tracking-widest mb-1">Para Empresas</p>
                <h3 className="text-white font-bold text-xl mb-3">Quero contratar talentos</h3>
                <button
                  onClick={() => navigate("/para-empresas")}
                  className="bg-white text-stone-700 font-semibold text-sm px-5 py-2 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Anunciar vagas
                </button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
