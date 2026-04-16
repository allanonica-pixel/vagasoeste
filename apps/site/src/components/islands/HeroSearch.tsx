import { useState } from 'react';

const LOCATIONS = {
  Pará: {
    Santarém: ['Centro', 'Maracanã', 'Jardim Santarém', 'Aldeia', 'Santa Clara', 'Aparecida'],
  },
} as const;

type Estado = keyof typeof LOCATIONS;
type Cidade = keyof (typeof LOCATIONS)[Estado];

export default function HeroSearch() {
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState<Estado | ''>('');
  const [cidade, setCidade] = useState<Cidade | ''>('');
  const [bairro, setBairro] = useState('');

  const estados = Object.keys(LOCATIONS) as Estado[];
  const cidades = estado ? (Object.keys(LOCATIONS[estado]) as Cidade[]) : [];
  const bairros = estado && cidade ? LOCATIONS[estado][cidade as Cidade] : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (estado) params.set('estado', estado);
    if (cidade) params.set('cidade', cidade);
    if (bairro) params.set('bairro', bairro);
    window.location.href = `/vagas${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const quickAreas = ['Administrativo', 'Vendas', 'Logística', 'TI', 'Saúde', 'Construção'];

  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl">
      {/* Filtros de Localização */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
          <i className="ri-map-pin-line text-emerald-600 text-sm shrink-0"></i>
          <select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value as Estado | '');
              setCidade('');
              setBairro('');
            }}
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
            onChange={(e) => {
              setCidade(e.target.value as Cidade | '');
              setBairro('');
            }}
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
          <i className="ri-home-4-line text-emerald-600 text-sm shrink-0"></i>
          <select
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            disabled={!cidade}
            className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer disabled:opacity-50"
            aria-label="Bairro"
          >
            <option value="">Bairro</option>
            {bairros.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Campo de busca */}
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
          className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-2 rounded-lg transition-colors whitespace-nowrap text-sm"
        >
          Buscar Vagas
        </button>
      </div>

      {/* Quick Tags */}
      <div className="flex flex-wrap justify-center gap-1.5 mt-3">
        {quickAreas.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              window.location.href = `/vagas?area=${encodeURIComponent(tag)}`;
            }}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 text-xs px-2.5 py-1 rounded-full transition-colors whitespace-nowrap"
          >
            {tag}
          </button>
        ))}
      </div>
    </form>
  );
}
