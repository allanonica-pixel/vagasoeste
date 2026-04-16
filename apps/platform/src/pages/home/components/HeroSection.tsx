import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LOCATIONS = {
  "Pará": {
    "Santarém": ["Centro", "Maracanã", "Jardim Santarém", "Aldeia", "Santa Clara", "Aparecida"],
  },
};

export default function HeroSection() {
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const navigate = useNavigate();

  const estados = Object.keys(LOCATIONS);
  const cidades = estado ? Object.keys(LOCATIONS[estado as keyof typeof LOCATIONS]) : [];
  const bairros = estado && cidade ? LOCATIONS[estado as keyof typeof LOCATIONS][cidade as keyof (typeof LOCATIONS)[keyof typeof LOCATIONS]] : [];

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEstado(e.target.value);
    setCidade("");
    setBairro("");
  };

  const handleCidadeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCidade(e.target.value);
    setBairro("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (estado) params.set("estado", estado);
    if (cidade) params.set("cidade", cidade);
    if (bairro) params.set("bairro", bairro);
    navigate(`/vagas${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://readdy.ai/api/search-image?query=Santarem%20Para%20Brazil%20Amazon%20river%20city%20aerial%20view%20warm%20golden%20hour%20sunset%20tropical%20urban%20landscape%20buildings%20streets%20professional%20environment%20vibrant%20Brazilian%20city&width=1920&height=700&seq=hero-santarem&orientation=landscape"
          alt="Santarém Pará cidade de oportunidades"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-emerald-900/70 to-emerald-950/85"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 pt-20 pb-6 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-white/90 text-xs font-medium">1.240+ vagas ativas em Santarém e região</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2 max-w-2xl">
          Encontre sua vaga{" "}
          <span className="text-emerald-300">no bairro certo</span> da sua cidade
        </h1>

        <p className="text-white/75 text-sm max-w-lg mb-4 leading-relaxed">
          Vagas reais em Santarém/PA. Você vê o bairro e a função — a empresa fica anônima até você ser selecionado.
        </p>

        {/* Search + Filters */}
        <form onSubmit={handleSearch} className="w-full max-w-3xl">
          {/* Location Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <i className="ri-map-pin-line text-emerald-600 text-sm"></i>
              </div>
              <select
                value={estado}
                onChange={handleEstadoChange}
                className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
              >
                <option value="">Estado</option>
                {estados.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <i className="ri-building-2-line text-emerald-600 text-sm"></i>
              </div>
              <select
                value={cidade}
                onChange={handleCidadeChange}
                disabled={!estado}
                className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer disabled:opacity-50"
              >
                <option value="">Cidade</option>
                {cidades.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <i className="ri-home-4-line text-emerald-600 text-sm"></i>
              </div>
              <select
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                disabled={!cidade}
                className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer disabled:opacity-50"
              >
                <option value="">Bairro</option>
                {bairros.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-1.5">
            <div className="flex-1 flex items-center gap-3 bg-white rounded-lg px-4 py-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-search-line text-gray-400 text-sm"></i>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cargo, área ou palavra-chave..."
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap text-sm"
            >
              Buscar Vagas
            </button>
          </div>
        </form>

        {/* Quick Tags */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-3">
          {["Administrativo", "Vendas", "Logística", "TI", "Saúde", "Construção"].map((tag) => (
            <button
              key={tag}
              onClick={() => navigate(`/vagas?area=${encodeURIComponent(tag)}`)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer whitespace-nowrap"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
