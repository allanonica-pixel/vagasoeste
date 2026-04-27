import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedSection from "@/components/base/AnimatedSection";

// Estados e cidades disponíveis na plataforma
const LOCATIONS: Record<string, string[]> = {
  Pará: ["Santarém"],
};

const SECTORS = [
  { name: "Saúde",            icon: "ri-heart-pulse-line"   },
  { name: "Comércio",         icon: "ri-store-2-line"        },
  { name: "Construção Civil", icon: "ri-building-4-line"     },
  { name: "Serviços",         icon: "ri-tools-line"          },
  { name: "Logística",        icon: "ri-truck-line"          },
  { name: "Alimentação",      icon: "ri-restaurant-line"     },
  { name: "Tecnologia",       icon: "ri-computer-line"       },
  { name: "Indústria",        icon: "ri-factory-line"        },
];

const FUNCOES = [
  { name: "Vendedor(a)",             icon: "ri-customer-service-2-line" },
  { name: "Auxiliar Administrativo", icon: "ri-file-list-3-line"        },
  { name: "Recepcionista",           icon: "ri-phone-line"              },
  { name: "Operador de Caixa",       icon: "ri-bank-card-line"          },
  { name: "Motorista/Entregador",    icon: "ri-truck-line"              },
  { name: "Auxiliar de Limpeza",     icon: "ri-home-gear-line"          },
  { name: "Cozinheiro(a)",           icon: "ri-restaurant-2-line"       },
  { name: "Manutenção/Eletricista",  icon: "ri-tools-fill"              },
];

type Tab = "setor" | "funcao";

export default function SectorSection() {
  const [activeTab, setActiveTab] = useState<Tab>("setor");
  const [modal, setModal] = useState<{ name: string; type: Tab } | null>(null);
  const [selectedEstado, setSelectedEstado] = useState("");
  const navigate = useNavigate();

  const estados = Object.keys(LOCATIONS);
  const cidades = selectedEstado ? (LOCATIONS[selectedEstado] ?? []) : [];

  const openModal = (name: string, type: Tab) => {
    setModal({ name, type });
    setSelectedEstado("");
  };

  const closeModal = () => {
    setModal(null);
    setSelectedEstado("");
  };

  const handleCidadeSelect = (cidade: string) => {
    if (!modal) return;
    const params = new URLSearchParams();
    if (modal.type === "setor") {
      params.set("setor", modal.name);
    } else {
      params.set("funcao", modal.name);
    }
    if (selectedEstado) params.set("estado", selectedEstado);
    params.set("cidade", cidade);
    navigate(`/vagas?${params.toString()}`);
    closeModal();
  };

  const cards = activeTab === "setor" ? SECTORS : FUNCOES;

  return (
    <section className="pt-14 pb-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <AnimatedSection
          variant="fade-up"
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
        >
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
        </AnimatedSection>

        {/* Tabs */}
        <AnimatedSection variant="fade-up" delay={100}>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-8">
            {(["setor", "funcao"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-base font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <i
                  className={`text-sm ${tab === "setor" ? "ri-building-2-line" : "ri-user-star-line"}`}
                  style={activeTab === tab ? { color: "#065f46" } : {}}
                ></i>
                {tab === "setor" ? "Por Setor" : "Por Função/Cargo"}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {cards.map((card, index) => (
            <AnimatedSection key={card.name} variant="fade-up" delay={index * 60}>
              <button
                onClick={() => openModal(card.name, activeTab)}
                className="group flex flex-col items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-gray-100 p-4 text-center transition-all duration-200 cursor-pointer w-full"
              >
                <div
                  className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{ color: "#065f46" }}
                >
                  <i className={`${card.icon} text-xl`}></i>
                </div>
                <div className="w-full">
                  <p className="font-semibold text-base sm:text-lg text-gray-900 leading-tight line-clamp-1">
                    {card.name}
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: "#111827" }}>
                    Ver vagas
                  </p>
                </div>
              </button>
            </AnimatedSection>
          ))}
        </div>

        {/* Anonymous notice */}
        <AnimatedSection variant="fade-up" delay={200}>
          <div className="mt-8 flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-100 shrink-0">
              <i className="ri-shield-check-line text-emerald-600 text-sm"></i>
            </div>
            <p className="text-sm text-emerald-800">
              <strong>Processo 100% anônimo:</strong> Informações pessoais como nome, telefone e email
              não são compartilhadas durante o processo seletivo.
            </p>
          </div>
        </AnimatedSection>
      </div>

      {/* Modal de seleção de localização */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden="true"
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#065f46" }}>
                  {modal.type === "setor" ? "Setor" : "Função/Cargo"}
                </p>
                <h3 className="text-xl font-bold text-gray-900">{modal.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Selecione onde quer buscar vagas</p>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors shrink-0"
                aria-label="Fechar"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            {/* Passo 1: Estado */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: "#065f46" }}
                >
                  1
                </span>
                Selecione o Estado
              </p>
              <div className="space-y-2">
                {estados.map((e) => (
                  <label
                    key={e}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedEstado === e
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        selectedEstado === e
                          ? "border-emerald-600 bg-emerald-600"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedEstado === e && (
                        <span className="w-2 h-2 rounded-full bg-white block"></span>
                      )}
                    </span>
                    <input
                      type="radio"
                      name="estado-modal"
                      value={e}
                      checked={selectedEstado === e}
                      onChange={() => setSelectedEstado(e)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-gray-800">{e}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Passo 2: Cidade (aparece após selecionar estado) */}
            {selectedEstado && cidades.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: "#065f46" }}
                  >
                    2
                  </span>
                  Selecione a Cidade
                </p>
                <div className="space-y-2">
                  {cidades.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleCidadeSelect(c)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer transition-all text-left group"
                    >
                      <span className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-emerald-500 flex items-center justify-center shrink-0 transition-colors">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity block"></span>
                      </span>
                      <span className="text-sm font-medium text-gray-800 flex-1">{c}</span>
                      <i className="ri-arrow-right-line text-emerald-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity"></i>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
