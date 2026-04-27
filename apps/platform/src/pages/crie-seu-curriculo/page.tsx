import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import { features, steps } from "@content/crie-seu-curriculo";

export default function CrieSeuCurriculoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden" aria-label="Criar currículo">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-950 to-gray-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(16,185,129,0.15),transparent_65%)]"></div>
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
              <li className="text-white font-medium">Crie seu Currículo</li>
            </ol>
          </nav>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-4">
            <i className="ri-star-fill text-amber-400 text-xs"></i>
            <span className="text-white/90 text-xs font-medium">100% gratuito, sem cadastro obrigatório</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Crie seu currículo profissional<br className="hidden md:block" />
            <span className="text-emerald-300">em menos de 10 minutos</span>
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-lg mx-auto mb-8 leading-relaxed">
            Templates modernos, prévia em tempo real e download em PDF gratuito. Pronto para se candidatar às vagas de Santarém.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/curriculo-avulso")}
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-8 py-3 rounded-lg text-base transition-colors cursor-pointer"
            >
              <i className="ri-file-user-line"></i>
              Criar meu currículo grátis
            </button>
            {!isLoggedIn && (
              <button
                onClick={() => navigate("/cadastro")}
                className="inline-flex items-center justify-center gap-2 border border-white/40 text-white font-medium px-6 py-3 rounded-lg text-sm hover:bg-white/10 transition-colors cursor-pointer"
              >
                <i className="ri-user-add-line"></i>
                Criar conta + currículo
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Etapas do construtor */}
      <section className="py-16 bg-white" aria-labelledby="etapas-curriculo-title">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 id="etapas-curriculo-title" className="text-2xl font-bold text-gray-900">Como funciona o construtor</h2>
            <p className="text-sm text-gray-500 mt-2">6 etapas simples, em qualquer dispositivo</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-sm">{step.num}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-xs mb-1">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-snug">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section className="py-16 bg-gray-50" aria-labelledby="recursos-curriculo-title">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 id="recursos-curriculo-title" className="text-2xl font-bold text-gray-900">Por que usar o VagasOeste?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                  <i className={`${f.icon} text-emerald-600 text-xl`}></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-600">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA duplo */}
      <section className="py-16 bg-emerald-900" aria-label="Chamada para ação currículo">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Escolha como quer criar seu currículo</h2>
          <p className="text-emerald-200 text-sm mb-8">Com ou sem cadastro, seu currículo vai ficar profissional.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-white/10 border border-white/20 rounded-xl p-6 text-left">
              <p className="text-xs font-bold text-emerald-300 uppercase tracking-wide mb-2">Sem cadastro</p>
              <h3 className="font-bold text-white mb-2">Currículo Avulso</h3>
              <p className="text-sm text-white/70 mb-4 leading-relaxed">
                Crie, visualize e baixe em PDF sem precisar criar uma conta. Ideal para quem precisa rápido.
              </p>
              <button
                onClick={() => navigate("/curriculo-avulso")}
                className="inline-flex items-center gap-2 border border-white/40 text-white font-medium px-4 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-colors cursor-pointer"
              >
                Criar sem cadastro <i className="ri-arrow-right-line"></i>
              </button>
            </div>
            <div className="bg-white rounded-xl p-6 text-left">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">Com conta grátis</p>
              <h3 className="font-bold text-gray-900 mb-2">Currículo + Candidaturas</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Crie o currículo e candidate-se às vagas diretamente. Acompanhe tudo pelo painel.
              </p>
              {isLoggedIn ? (
                <button
                  onClick={() => navigate("/plataforma")}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Ir para meu painel <i className="ri-arrow-right-line"></i>
                </button>
              ) : (
                <button
                  onClick={() => navigate("/cadastro")}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Criar conta grátis <i className="ri-arrow-right-line"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
