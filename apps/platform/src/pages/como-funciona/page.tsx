import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

const steps = [
  {
    number: "01",
    icon: "ri-user-add-line",
    title: "Crie seu cadastro gratuito",
    description:
      "Em poucos minutos, preencha seus dados pessoais, experiências profissionais, escolaridade e cursos realizados. Seu perfil fica disponível para as empresas parceiras da VagasOeste.",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    accent: "text-emerald-600",
  },
  {
    number: "02",
    icon: "ri-search-line",
    title: "Explore as vagas disponíveis",
    description:
      "Navegue pelas vagas abertas na sua região. Use os filtros por setor, tipo de contrato, bairro e turno para encontrar a oportunidade ideal para o seu perfil.",
    color: "bg-sky-50 text-sky-600 border-sky-100",
    accent: "text-sky-600",
  },
  {
    number: "03",
    icon: "ri-send-plane-line",
    title: "Candidate-se com um clique",
    description:
      "Encontrou a vaga certa? Candidate-se diretamente pela plataforma. Sua candidatura chega imediatamente para a empresa, que é notificada sem receber seus dados pessoais.",
    color: "bg-amber-50 text-amber-600 border-amber-100",
    accent: "text-amber-600",
  },
  {
    number: "04",
    icon: "ri-shield-check-line",
    title: "A VagasOeste cuida de você",
    description:
      "Nossa equipe analisa seu perfil, realiza pré-entrevistas quando solicitado pelas empresas e intermedia todo o contato — garantindo sua privacidade e segurança em cada etapa.",
    color: "bg-violet-50 text-violet-600 border-violet-100",
    accent: "text-violet-600",
  },
  {
    number: "05",
    icon: "ri-notification-line",
    title: "Acompanhe em tempo real",
    description:
      "Acesse sua plataforma e veja o status de cada candidatura: Em Análise, Pré-Entrevista, Aprovado e muito mais. Você recebe notificações por email e WhatsApp a cada atualização.",
    color: "bg-rose-50 text-rose-600 border-rose-100",
    accent: "text-rose-600",
  },
  {
    number: "06",
    icon: "ri-trophy-line",
    title: "Conquiste sua vaga",
    description:
      "Com o suporte completo da VagasOeste, você chega preparado para a entrevista final. Nosso objetivo é conectar você à empresa certa, no momento certo.",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    accent: "text-emerald-600",
  },
];

const faqs = [
  {
    q: "O cadastro é gratuito?",
    a: "Sim! O cadastro na plataforma VagasOeste é 100% gratuito para candidatos. Você pode se candidatar a quantas vagas quiser sem pagar nada.",
  },
  {
    q: "Meus dados pessoais ficam seguros?",
    a: "Absolutamente. As empresas nunca têm acesso direto ao seu nome, telefone ou email. Todo contato é intermediado pela equipe VagasOeste, garantindo sua privacidade.",
  },
  {
    q: "Como funciona a pré-entrevista?",
    a: "Quando uma empresa solicita uma pré-entrevista, nossa equipe entra em contato com você para agendar uma conversa. Após a entrevista, elaboramos um relatório e enviamos para a empresa.",
  },
  {
    q: "Posso me candidatar a mais de uma vaga?",
    a: "Sim! Você pode se candidatar a quantas vagas quiser. Recomendamos candidatar-se a todas as vagas que se encaixam no seu perfil para aumentar suas chances.",
  },
  {
    q: "Como sei se fui aprovado?",
    a: "Você recebe notificações por email e WhatsApp a cada mudança de status. Também pode acompanhar em tempo real na sua plataforma, na aba 'Minhas Candidaturas'.",
  },
  {
    q: "O que é o currículo VagasOeste?",
    a: "É um currículo profissional gerado pela nossa plataforma em PDF, com layout moderno e otimizado. Você pode criar e baixar por apenas R$ 9,90, ou criar gratuitamente ao se cadastrar.",
  },
];

const benefits = [
  { icon: "ri-lock-line", title: "Privacidade total", desc: "Seus dados pessoais nunca são compartilhados diretamente com as empresas." },
  { icon: "ri-team-line", title: "Intermediação humana", desc: "Nossa equipe acompanha cada etapa do processo seletivo ao seu lado." },
  { icon: "ri-map-pin-line", title: "Foco regional", desc: "Vagas exclusivas da região Oeste do Pará, perto de você." },
  { icon: "ri-time-line", title: "Processo ágil", desc: "Candidatura em segundos, resposta em até 48 horas úteis." },
  { icon: "ri-file-text-line", title: "Currículo profissional", desc: "Crie um currículo moderno em PDF diretamente na plataforma." },
  { icon: "ri-whatsapp-line", title: "Notificações no WhatsApp", desc: "Receba atualizações das suas candidaturas direto no seu celular." },
];

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-emerald-900 pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=diverse%20group%20of%20professionals%20working%20together%20in%20modern%20office%20Santarem%20Para%20Brazil%20team%20collaboration%20meeting%20warm%20light%20tropical%20city%20employment%20job%20opportunity&width=1920&height=500&seq=como-funciona-hero-v2&orientation=landscape"
            alt="Como funciona a VagasOeste"
            className="w-full h-full object-cover object-top opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/85 via-emerald-900/70 to-emerald-800/55"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6">
          <span className="inline-block bg-white/15 border border-white/25 text-white/90 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            Simples e transparente
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
            Como funciona a <span className="text-emerald-300">VagasOeste</span>
          </h1>
          <p className="text-emerald-100 text-sm mb-6 max-w-2xl">
            Conectamos candidatos e empresas da região Oeste do Pará de forma segura, humana e eficiente. Veja como é simples encontrar sua próxima oportunidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/cadastro"
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              Criar meu cadastro grátis
            </Link>
            <Link
              to="/vagas"
              className="border border-white/30 text-white font-semibold px-6 py-3 rounded-lg text-sm hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              Ver vagas disponíveis
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Passo a passo</h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Do cadastro à contratação, acompanhe cada etapa do processo com total transparência.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-100 -translate-x-1/2"></div>

          <div className="space-y-12">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
              >
                {/* Content */}
                <div className="flex-1 md:text-right">
                  {i % 2 === 1 ? (
                    <div className="md:text-left">
                      <span className={`text-5xl font-black ${step.accent} opacity-20 leading-none`}>{step.number}</span>
                      <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2">{step.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed max-w-sm">{step.description}</p>
                    </div>
                  ) : (
                    <>
                      <span className={`text-5xl font-black ${step.accent} opacity-20 leading-none`}>{step.number}</span>
                      <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2">{step.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed max-w-sm ml-auto">{step.description}</p>
                    </>
                  )}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center shrink-0 z-10 ${step.color}`}>
                  <i className={`${step.icon} text-2xl`}></i>
                </div>

                {/* Spacer */}
                <div className="flex-1 hidden md:block"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Por que escolher a VagasOeste?</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              Somos mais do que uma plataforma de vagas — somos seu parceiro na busca pelo emprego ideal.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                  <i className={`${b.icon} text-emerald-600 text-xl`}></i>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 max-w-3xl mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Perguntas frequentes</h2>
          <p className="text-gray-500 text-base">Tire suas dúvidas sobre como funciona a plataforma.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Pronto para começar?</h2>
          <p className="text-emerald-100 text-base mb-8 max-w-xl mx-auto">
            Cadastre-se gratuitamente e tenha acesso a todas as vagas disponíveis na região Oeste do Pará.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/cadastro"
              className="bg-white text-emerald-700 font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-emerald-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Criar cadastro grátis
            </Link>
            <Link
              to="/vagas"
              className="border border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl text-sm hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              Ver vagas abertas
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm">{question}</span>
        <div className="w-5 h-5 flex items-center justify-center shrink-0 ml-3">
          <i className={`ri-${open ? "subtract" : "add"}-line text-gray-400 text-sm transition-transform`}></i>
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

// Need useState import
import { useState } from "react";
