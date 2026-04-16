import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockNeighborhoods } from "@/mocks/jobs";

export default function NeighborhoodSection() {
  const [hovered, setHovered] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-emerald-600 text-xs font-semibold uppercase tracking-widest">Localização</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Vagas por Bairro
            </h2>
            <p className="text-gray-700 text-sm mt-2 max-w-md">
              Você vê o bairro da empresa, mas o nome dela fica anônimo até você ser selecionado.
            </p>
          </div>
          <button
            onClick={() => navigate("/vagas")}
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            Ver todos os bairros
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-right-line text-sm"></i>
            </div>
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockNeighborhoods.map((neighborhood) => (
            <div
              key={neighborhood.name}
              className="relative rounded-xl overflow-hidden cursor-pointer group"
              style={{ height: "220px" }}
              onMouseEnter={() => setHovered(neighborhood.name)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate(`/vagas?bairro=${encodeURIComponent(neighborhood.name)}`)}
            >
              <img
                src={neighborhood.image}
                alt={`Vagas em ${neighborhood.name}`}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

              {/* Default State */}
              <div className={`absolute inset-0 flex flex-col justify-end p-5 transition-opacity duration-300 ${hovered === neighborhood.name ? "opacity-0" : "opacity-100"}`}>
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-map-pin-line text-emerald-400 text-xs"></i>
                  </div>
                  <span className="text-white/70 text-xs">{neighborhood.jobCount} vagas</span>
                </div>
                <h3 className="text-white font-bold text-xl">{neighborhood.name}</h3>
              </div>

              {/* Hover State */}
              <div className={`absolute inset-0 flex flex-col items-center justify-center p-5 transition-opacity duration-300 ${hovered === neighborhood.name ? "opacity-100" : "opacity-0"}`}>
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-3">
                  <i className="ri-search-line text-emerald-300 text-sm"></i>
                </div>
                <p className="text-white font-bold text-lg">{neighborhood.name}</p>
                <p className="text-emerald-300 text-sm font-semibold mt-1">{neighborhood.jobCount} vagas disponíveis</p>
                <p className="text-white/60 text-xs mt-2">Clique para ver as vagas</p>
              </div>
            </div>
          ))}
        </div>

        {/* Anonymous Notice */}
        <div className="mt-8 flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-100">
            <i className="ri-shield-check-line text-emerald-600 text-sm"></i>
          </div>
          <p className="text-sm text-emerald-800">
            <strong>Processo seguro:</strong> O nome da empresa só é revelado após você ser selecionado para a vaga. Seu processo seletivo é conduzido pela equipe VagasOeste.
          </p>
        </div>
      </div>
    </section>
  );
}
