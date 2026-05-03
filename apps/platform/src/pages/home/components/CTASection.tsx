import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function CTASection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <section className="relative overflow-hidden py-20">
      {/* Gradient background — sem imagem externa */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 to-emerald-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(16,185,129,0.15),transparent_60%)]"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight text-balance">
          Sua próxima oportunidade está{" "}
          <span className="text-emerald-300">esperando por você</span>
        </h2>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8 text-xs text-emerald-200">
          <span className="flex items-center gap-1.5">
            <i className="ri-check-line text-emerald-400" aria-hidden="true"></i>
            100% gratuito para candidatos
          </span>
          <span className="flex items-center gap-1.5">
            <i className="ri-whatsapp-line text-emerald-400" aria-hidden="true"></i>
            Alertas no WhatsApp
          </span>
          <span className="flex items-center gap-1.5">
            <i className="ri-shield-check-line text-emerald-400" aria-hidden="true"></i>
            Processo anônimo e seguro
          </span>
          <span className="flex items-center gap-1.5">
            <i className="ri-verified-badge-line text-emerald-400" aria-hidden="true"></i>
            Empresas verificadas
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => navigate("/plataforma")}
              className="flex items-center justify-center gap-2 bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer whitespace-nowrap text-sm"
            >
              <i className="ri-dashboard-line text-base" aria-hidden="true"></i>
              Ir para o meu painel
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/cadastro")}
              className="flex items-center justify-center gap-2 bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer whitespace-nowrap text-sm"
            >
              <i className="ri-user-add-line text-base" aria-hidden="true"></i>
              Criar conta grátis
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate("/vagas")}
            className="flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap text-sm"
          >
            <i className="ri-briefcase-line text-base" aria-hidden="true"></i>
            Ver vagas
          </button>
        </div>
      </div>
    </section>
  );
}
