import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LOCATIONS: Record<string, string[]> = {
  Pará: ["Santarém"],
};

const SETORES = [
  "Saúde",
  "Comércio",
  "Construção Civil",
  "Serviços",
  "Logística",
  "Alimentação",
  "Tecnologia",
  "Indústria",
];

const QUICK_SETORES = [
  { label: "Saúde",            icon: "ri-heart-pulse-line"  },
  { label: "Comércio",         icon: "ri-store-2-line"       },
  { label: "Construção Civil", icon: "ri-building-4-line"    },
  { label: "Serviços",         icon: "ri-tools-line"         },
  { label: "Logística",        icon: "ri-truck-line"         },
  { label: "Tecnologia",       icon: "ri-computer-line"      },
];

export default function HeroSection() {
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [setor, setSetor] = useState("");
  const navigate = useNavigate();

  const estados = Object.keys(LOCATIONS);
  const cidades = estado ? (LOCATIONS[estado] ?? []) : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (estado) params.set("estado", estado);
    if (cidade) params.set("cidade", cidade);
    if (setor) params.set("setor", setor);
    navigate(`/vagas${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section
      className="relative flex flex-col items-center justify-center overflow-hidden min-h-[480px]"
      aria-label="Busca de vagas"
    >
      {/* Gradiente — idêntico ao site Astro */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(16,185,129,0.18),transparent_65%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_60%,rgba(6,78,59,0.25),transparent_60%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-10 flex flex-col items-center text-center">
        {/* Título */}
        <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-3 max-w-2xl text-balance">
          As melhores vagas em{" "}
          <span className="text-emerald-300">Santarém e região</span>, em um só lugar
        </h1>

        <p className="text-white/75 text-sm md:text-base max-w-lg mb-6 leading-relaxed">
          Vagas reais com informações claras sobre função e área de atuação. Acompanhe cada etapa da
          sua candidatura em tempo real.
        </p>

        {/* Formulário de busca — idêntico ao HeroSearch do site Astro */}
        <form onSubmit={handleSearch} className="w-full max-w-3xl">
          {/* Filtros Estado / Cidade / Setor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
              <i className="ri-map-pin-line text-emerald-600 text-sm shrink-0"></i>
              <select
                value={estado}
                onChange={(e) => { setEstado(e.target.value); setCidade(""); }}
                className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
                aria-label="Estado"
              >
                <option value="">Estado</option>
                {estados.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
              <i className="ri-building-2-line text-emerald-600 text-sm shrink-0"></i>
              <select
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                disabled={!estado}
                className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer disabled:opacity-50"
                aria-label="Cidade"
              >
                <option value="">Cidade</option>
                {cidades.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
              <i className="ri-briefcase-line text-emerald-600 text-sm shrink-0"></i>
              <select
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
                aria-label="Setor"
              >
                <option value="">Setor</option>
                {SETORES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Campo de busca + botão */}
          <div className="flex flex-col sm:flex-row gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-1.5">
            <div className="flex-1 flex items-center gap-3 bg-white rounded-lg px-4 py-2">
              <i className="ri-search-line text-gray-400 text-sm shrink-0"></i>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cargo, área ou palavra-chave..."
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
                aria-label="Buscar vagas"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-2 rounded-lg transition-colors whitespace-nowrap text-sm cursor-pointer"
            >
              Buscar Vagas
            </button>
          </div>

          {/* Quick Setores — com ícone, igual ao site Astro */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-3">
            {QUICK_SETORES.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => navigate(`/vagas?setor=${encodeURIComponent(s.label)}`)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 text-sm px-3 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className={`${s.icon} text-sm`}></i>
                {s.label}
              </button>
            ))}
          </div>
        </form>
      </div>
    </section>
  );
}
