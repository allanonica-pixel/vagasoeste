import { useNavigate } from "react-router-dom";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://readdy.ai/api/search-image?query=Brazilian%20professionals%20working%20together%20modern%20office%20diverse%20team%20collaboration%20warm%20natural%20light%20productive%20environment%20success%20career%20growth%20urban%20setting&width=1920&height=600&seq=cta-bg&orientation=landscape"
          alt="Profissionais trabalhando"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/85 to-emerald-950/70"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        <div className="max-w-2xl">
          <span className="text-emerald-300 text-xs font-semibold uppercase tracking-widest">Comece agora</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-5 leading-tight">
            Sua próxima oportunidade está esperando por você
          </h2>
          <p className="text-white/70 text-lg mb-8 leading-relaxed">
            Cadastre-se gratuitamente, candidate-se às vagas e receba atualizações pelo WhatsApp. A VagasOeste cuida do processo por você.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate("/cadastro")}
              className="flex items-center justify-center gap-3 bg-white text-emerald-800 font-bold px-8 py-4 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-user-add-line text-base"></i>
              </div>
              Criar meu cadastro grátis
            </button>
            <button
              onClick={() => navigate("/vagas")}
              className="flex items-center justify-center gap-3 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-search-line text-base"></i>
              </div>
              Ver vagas disponíveis
            </button>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap gap-6 mt-10">
            {[
              { icon: "ri-shield-check-line", text: "100% gratuito para candidatos" },
              { icon: "ri-whatsapp-line", text: "Atualizações por WhatsApp" },
              { icon: "ri-eye-off-line", text: "Processo anônimo e seguro" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`${item.icon} text-emerald-300 text-sm`}></i>
                </div>
                <span className="text-white/70 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
