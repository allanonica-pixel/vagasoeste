import { useState, useEffect } from 'react';

// Estados e cidades disponíveis na plataforma — TODO Fase 1.7: alimentar via /v1/regioes/cobertas
const LOCATIONS: Record<string, string[]> = {
  Pará: ['Santarém'],
};

// Mapeamento de ícones por nome de setor (fallback pra ri-stack-line se não conhecido).
// Setores cadastrados via Painel-admin não precisam estar aqui — recebem ícone genérico.
const SECTOR_ICONS: Record<string, string> = {
  'Saúde':            'ri-heart-pulse-line',
  'Comércio':         'ri-store-2-line',
  'Construção Civil': 'ri-building-4-line',
  'Serviços':         'ri-tools-line',
  'Logística':        'ri-truck-line',
  'Alimentação':      'ri-restaurant-line',
  'Tecnologia':       'ri-computer-line',
  'Indústria':        'ri-factory-line',
  'Educação':         'ri-graduation-cap-line',
  'Agronegócio':      'ri-plant-line',
};

const DEFAULT_SECTOR_ICON = 'ri-stack-line';

// TODO Fase 1.7: tornar Funções/Cargos dinâmicos também.
// Por ora a lista é curadoria estática (cargos mais buscados no oeste do PA).
// Decisão de produto pendente: virar tabela 'funcoes' no banco OU agregar de jobs.title?
const FUNCOES = [
  { name: 'Vendedor(a)',              icon: 'ri-customer-service-2-line' },
  { name: 'Auxiliar Administrativo',  icon: 'ri-file-list-3-line'        },
  { name: 'Recepcionista',            icon: 'ri-phone-line'              },
  { name: 'Operador de Caixa',        icon: 'ri-bank-card-line'          },
  { name: 'Motorista/Entregador',     icon: 'ri-truck-line'              },
  { name: 'Auxiliar de Limpeza',      icon: 'ri-home-gear-line'          },
  { name: 'Cozinheiro(a)',            icon: 'ri-restaurant-2-line'       },
  { name: 'Manutenção/Eletricista',   icon: 'ri-tools-fill'              },
];

type Tab = 'setor' | 'funcao';

interface SectorItem { name: string; icon: string; }

interface SectorCardsProps {
  /** Setores ativos vindos do banco (Painel-admin → Setores). Se vazio, mostra empty state. */
  sectors?: Array<{ nome: string }>;
  sectorCounts?: Record<string, number>;
  funcaoCounts?: Record<string, number>;
}

export default function SectorCards({ sectors: initialSectors = [], sectorCounts = {}, funcaoCounts = {} }: SectorCardsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('setor');
  const [modal, setModal] = useState<{ name: string; type: Tab } | null>(null);
  const [selectedEstado, setSelectedEstado] = useState('');
  const [sectors, setSectors] = useState<Array<{ nome: string }>>(initialSectors);
  const [loadingSectors, setLoadingSectors] = useState(initialSectors.length === 0);

  // Busca setores reais do banco em tempo real (SectorCards é client-side, não SSG).
  // Garante que admin cadastra setor novo no Painel-admin e ele aparece sem rebuild.
  useEffect(() => {
    if (initialSectors.length > 0) return;
    const apiUrl = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000';
    fetch(`${apiUrl}/v1/setores`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.setores)) setSectors(data.setores);
      })
      .catch(() => { /* mantém empty state */ })
      .finally(() => setLoadingSectors(false));
  }, [initialSectors.length]);

  const estados = Object.keys(LOCATIONS);
  const cidades = selectedEstado ? (LOCATIONS[selectedEstado] ?? []) : [];

  const openModal = (name: string, type: Tab) => {
    setModal({ name, type });
    setSelectedEstado('');
  };

  const closeModal = () => {
    setModal(null);
    setSelectedEstado('');
  };

  const handleCidadeSelect = (cidade: string) => {
    if (!modal) return;
    const params = new URLSearchParams();
    if (modal.type === 'setor') {
      params.set('setor', modal.name);
    } else {
      params.set('funcao', modal.name);
    }
    if (selectedEstado) params.set('estado', selectedEstado);
    params.set('cidade', cidade);
    window.location.href = `/vagas?${params.toString()}`;
  };

  // Setores reais cadastrados pelo admin (Painel-admin → Setores). Mapeamento
  // de ícones por nome (fallback ri-stack-line pra setores novos).
  const sectorsCards: SectorItem[] = sectors.map((s) => ({
    name: s.nome,
    icon: SECTOR_ICONS[s.nome] ?? DEFAULT_SECTOR_ICON,
  }));

  const cards: SectorItem[] = activeTab === 'setor' ? sectorsCards : FUNCOES;

  return (
    <>
      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-8">
        {(['setor', 'funcao'] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-base font-semibold transition-colors duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i
              className={`text-sm ${tab === 'setor' ? 'ri-building-2-line' : 'ri-user-star-line'}`}
              style={activeTab === tab ? { color: '#065f46' } : {}}
              aria-hidden="true"
            ></i>
            {tab === 'setor' ? 'Por Setor' : 'Por Função/Cargo'}
          </button>
        ))}
      </div>

      {/* ── Cards ── */}
      {activeTab === 'setor' && loadingSectors ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <i className="ri-loader-4-line text-3xl text-emerald-500 motion-safe:animate-spin block mx-auto" aria-hidden="true"></i>
        </div>
      ) : cards.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <i className="ri-stack-line text-4xl text-gray-300 mb-3 block" aria-hidden="true"></i>
          <p className="text-sm text-gray-500">
            {activeTab === 'setor'
              ? 'Setores ainda não cadastrados pela equipe.'
              : 'Funções/cargos ainda não definidos.'}
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card) => {
          const count = activeTab === 'setor'
            ? (sectorCounts[card.name] ?? 0)
            : (funcaoCounts[card.name] ?? 0);
          return (
            <button
              key={card.name}
              type="button"
              onClick={() => openModal(card.name, activeTab)}
              className="group flex flex-col items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-gray-100 p-4 text-center transition-colors duration-200 cursor-pointer"
            >
              <div
                className="size-11 rounded-lg bg-gray-100 flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{ color: '#065f46' }}
              >
                <i className={`${card.icon} text-xl`} aria-hidden="true"></i>
              </div>
              <div className="w-full">
                <p className="font-semibold text-base sm:text-lg text-gray-900 leading-tight line-clamp-1">
                  {card.name}
                </p>
                <p className="text-sm mt-0.5" style={{ color: '#111827' }}>
                  {count > 0 ? `${count} vaga${count !== 1 ? 's' : ''}` : 'Ver vagas'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      )}

      {/* ── Modal de seleção de localização ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden="true"
          />

          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="sector-modal-title">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#065f46' }}>
                  {modal.type === 'setor' ? 'Setor' : 'Função/Cargo'}
                </p>
                <h3 id="sector-modal-title" className="text-xl font-bold text-gray-900 text-balance">{modal.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Selecione onde quer buscar vagas</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="size-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors shrink-0"
                aria-label="Fechar"
              >
                <i className="ri-close-line text-lg" aria-hidden="true"></i>
              </button>
            </div>

            {/* Passo 1: Estado */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span
                  className="inline-flex items-center justify-center size-5 rounded-full text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: '#065f46' }}
                >
                  1
                </span>
                Selecione o Estado
              </p>
              <div className="space-y-2">
                {estados.map((e) => (
                  <label
                    key={e}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedEstado === e
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        selectedEstado === e
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedEstado === e && (
                        <span className="size-2 rounded-full bg-white block"></span>
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
                    className="inline-flex items-center justify-center size-5 rounded-full text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: '#065f46' }}
                  >
                    2
                  </span>
                  Selecione a Cidade
                </p>
                <div className="space-y-2">
                  {cidades.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCidadeSelect(c)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer transition-colors text-left group"
                    >
                      <span className="size-5 rounded-full border-2 border-gray-300 group-hover:border-emerald-500 flex items-center justify-center shrink-0 transition-colors">
                        <span className="size-2 rounded-full bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity block"></span>
                      </span>
                      <span className="text-sm font-medium text-gray-800 flex-1">{c}</span>
                      <i className="ri-arrow-right-line text-emerald-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true"></i>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
