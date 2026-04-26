import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SECTORS = [
  { name: "Comércio", icon: "ri-store-2-line", count: 4 },
  { name: "Saúde", icon: "ri-heart-pulse-line", count: 3 },
  { name: "Logística", icon: "ri-truck-line", count: 2 },
  { name: "Tecnologia", icon: "ri-computer-line", count: 2 },
  { name: "Alimentação", icon: "ri-restaurant-line", count: 2 },
  { name: "Construção Civil", icon: "ri-building-4-line", count: 1 },
  { name: "Serviços", icon: "ri-tools-line", count: 1 },
  { name: "Indústria", icon: "ri-factory-line", count: 1 },
  { name: "Agronegócio", icon: "ri-plant-line", count: 1 },
  { name: "Educação", icon: "ri-graduation-cap-line", count: 1 },
  { name: "Financeiro", icon: "ri-bank-line", count: 1 },
  { name: "Outros", icon: "ri-briefcase-line", count: 2 },
];

const FUNCOES = [
  { name: "Vendedor(a)", icon: "ri-user-voice-line", count: 3 },
  { name: "Auxiliar Administrativo", icon: "ri-file-list-3-line", count: 2 },
  { name: "Recepcionista", icon: "ri-customer-service-2-line", count: 1 },
  { name: "Operador de Caixa", icon: "ri-money-dollar-circle-line", count: 1 },
  { name: "Motorista/Entregador", icon: "ri-car-line", count: 1 },
  { name: "Auxiliar de Limpeza", icon: "ri-brush-3-line", count: 1 },
  { name: "Cozinheiro(a)", icon: "ri-restaurant-2-line", count: 1 },
  { name: "Manutenção/Eletricista", icon: "ri-flashlight-line", count: 1 },
];

type Tab = "setor" | "funcao";

export default function SectorSection() {
  const [tab, setTab] = useState<Tab>("setor");
  const navigate = useNavigate();

  const items = tab === "setor" ? SECTORS : FUNCOES;

  const handleClick = (name: string) => {
    const param = tab === "setor" ? "setor" : "area";
    navigate(`/vagas?${param}=${encodeURIComponent(name)}`);
  };

  return (
    <section className="pt-14 pb-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-emerald-600 text-xs font-semibold uppercase tracking-widest">
              Áreas de atuação
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Explore por Setor ou Função
            </h2>
            <p className="text-gray-700 text-sm mt-2 max-w-md">
              Selecione um setor ou função e veja as vagas disponíveis em Santarém e região.
            </p>
          </div>
          <button
            onClick={() => navigate("/vagas")}
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            Ver todas as vagas
            <i className="ri-arrow-right-line text-sm"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
          {(["setor", "funcao"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all whitespace-nowrap ${
                tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "setor" ? "Por Setor" : "Por Função"}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <button
              key={item.name}
              onClick={() => handleClick(item.name)}
              className="flex items-center gap-3 bg-gray-50 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 rounded-xl p-4 text-left transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 group-hover:border-emerald-200 group-hover:bg-emerald-50 flex items-center justify-center shrink-0 transition-colors">
                <i className={`${item.icon} text-gray-500 group-hover:text-emerald-600 text-lg transition-colors`}></i>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{item.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.count} vaga{item.count !== 1 ? "s" : ""}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Anonymous notice */}
        <div className="mt-8 flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-100 shrink-0">
            <i className="ri-shield-check-line text-emerald-600 text-sm"></i>
          </div>
          <p className="text-sm text-emerald-800">
            <strong>Processo seguro:</strong> O nome da empresa só é revelado após você ser selecionado
            para a vaga. Seu processo seletivo é conduzido pela equipe VagasOeste.
          </p>
        </div>
      </div>
    </section>
  );
}
