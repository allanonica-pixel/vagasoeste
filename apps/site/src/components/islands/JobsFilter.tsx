import { useState, useMemo } from 'react';
import type { Job } from '../../lib/jobs';

interface JobsFilterProps {
  initialJobs: Job[];
  sectors: string[];
  neighborhoods: string[];
  contractTypes: string[];
  initialEstado?: string;
  initialCidade?: string;
  initialBairro?: string;
  initialQ?: string;
}

const LOCATIONS: Record<string, Record<string, string[]>> = {
  Pará: {
    Santarém: ['Centro', 'Maracanã', 'Jardim Santarém', 'Aldeia', 'Santa Clara', 'Aparecida'],
  },
};

const CONTRACT_COLORS: Record<string, string> = {
  CLT: 'bg-emerald-100 text-emerald-700',
  PJ: 'bg-blue-100 text-blue-700',
  Temporário: 'bg-amber-100 text-amber-700',
  Estágio: 'bg-purple-100 text-purple-700',
  Freelance: 'bg-pink-100 text-pink-700',
};

type SortKey = 'recente' | 'salario' | 'candidaturas';

function extractSalary(salaryRange: string): number {
  const nums = salaryRange.replace(/[^\d]/g, ' ').trim().split(/\s+/).map(Number).filter(Boolean);
  return nums.length ? Math.max(...nums) : 0;
}

export default function JobsFilter({
  initialJobs,
  sectors,
  neighborhoods,
  contractTypes,
  initialEstado = '',
  initialCidade = '',
  initialBairro = '',
  initialQ = '',
}: JobsFilterProps) {
  // Location state
  const [estado, setEstado] = useState(initialEstado);
  const [cidade, setCidade] = useState(initialCidade);
  const [bairroLoc, setBairroLoc] = useState(initialBairro);

  const estados = Object.keys(LOCATIONS);
  const cidades = estado ? Object.keys(LOCATIONS[estado] ?? {}) : [];
  const bairrosLoc = estado && cidade ? (LOCATIONS[estado]?.[cidade] ?? []) : [];

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEstado(e.target.value);
    setCidade('');
    setBairroLoc('');
  };
  const handleCidadeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCidade(e.target.value);
    setBairroLoc('');
  };

  // Content filters
  const [query, setQuery] = useState(initialQ);
  const [sector, setSector] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [contract, setContract] = useState('');
  const [sort, setSort] = useState<SortKey>('recente');
  const [showFilters, setShowFilters] = useState(false);

  const hasLocationFilter = !!(estado || cidade || bairroLoc);

  const filtered = useMemo(() => {
    let jobs = initialJobs.filter((j) => {
      const q = query.toLowerCase();
      if (q && !j.title.toLowerCase().includes(q) && !j.area.toLowerCase().includes(q) && !j.description.toLowerCase().includes(q)) return false;
      if (sector && j.sector !== sector) return false;
      if (neighborhood && j.neighborhood !== neighborhood) return false;
      if (contract && j.contractType !== contract) return false;
      // Location
      if (cidade && j.city !== cidade) return false;
      if (bairroLoc && j.neighborhood !== bairroLoc) return false;
      return true;
    });

    jobs = [...jobs].sort((a, b) => {
      if (sort === 'salario') return extractSalary(b.salaryRange) - extractSalary(a.salaryRange);
      if (sort === 'candidaturas') return b.id.localeCompare(a.id);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return jobs;
  }, [initialJobs, query, sector, neighborhood, contract, sort, cidade, bairroLoc]);

  const hasContentFilters = !!(query || sector || neighborhood || contract);

  const clearAllFilters = () => {
    setEstado('');
    setCidade('');
    setBairroLoc('');
    setQuery('');
    setSector('');
    setNeighborhood('');
    setContract('');
  };

  const goHome = () => {
    window.location.href = '/';
  };

  // Breadcrumb text
  const filterBreadcrumb = [
    estado ? `Estado: ${estado}` : null,
    `Cidade: ${cidade || 'Todas'}`,
    `Bairro: ${bairroLoc || 'Todos'}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div>
      {/* ── Filter Breadcrumb (acima dos filtros, visível quando localização ativa) ── */}
      {hasLocationFilter && (
        <div className="bg-emerald-800 -mx-4 md:-mx-6 px-4 md:px-6 py-2.5 mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <i className="ri-filter-line text-emerald-300 text-xs"></i>
            <span className="text-white/90 text-xs font-medium">{filterBreadcrumb}</span>
          </div>
          <button
            onClick={goHome}
            className="flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-close-circle-line text-sm"></i>
            Limpar Filtros
          </button>
        </div>
      )}

      {/* ── Location Dropdowns ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5">
          <i className="ri-map-pin-line text-emerald-600 text-sm shrink-0"></i>
          <select
            value={estado}
            onChange={handleEstadoChange}
            className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
            aria-label="Estado"
          >
            <option value="">Estado</option>
            {estados.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5">
          <i className="ri-building-2-line text-emerald-600 text-sm shrink-0"></i>
          <select
            value={cidade}
            onChange={handleCidadeChange}
            disabled={!estado}
            className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer disabled:opacity-50"
            aria-label="Cidade"
          >
            <option value="">Cidade</option>
            {cidades.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5">
          <i className="ri-home-4-line text-emerald-600 text-sm shrink-0"></i>
          <select
            value={bairroLoc}
            onChange={(e) => setBairroLoc(e.target.value)}
            disabled={!cidade}
            className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer disabled:opacity-50"
            aria-label="Bairro"
          >
            <option value="">Bairro</option>
            {bairrosLoc.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* ── Search + Filters Toggle + Sort ── */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5">
          <i className="ri-search-line text-gray-400 text-sm shrink-0"></i>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cargo, área ou palavra-chave..."
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            aria-label="Buscar vagas"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <i className="ri-close-line text-sm"></i>
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${showFilters ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
        >
          <i className="ri-filter-3-line"></i>
          Mais filtros
          {hasContentFilters && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>}
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none bg-white cursor-pointer"
          aria-label="Ordenar vagas"
        >
          <option value="recente">Mais recentes</option>
          <option value="salario">Maior salário</option>
          <option value="candidaturas">Mais procuradas</option>
        </select>
      </div>

      {/* ── Extra Filters Panel ── */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Setor</label>
            <select value={sector} onChange={(e) => setSector(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 outline-none bg-white cursor-pointer">
              <option value="">Todos os setores</option>
              {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Bairro</label>
            <select value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 outline-none bg-white cursor-pointer">
              <option value="">Todos os bairros</option>
              {neighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de contrato</label>
            <select value={contract} onChange={(e) => setContract(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 outline-none bg-white cursor-pointer">
              <option value="">Todos os contratos</option>
              {contractTypes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* ── Sector Quick Filters ── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 mb-4">
        {['Todos', ...sectors].map((s) => (
          <button
            key={s}
            onClick={() => setSector(s === 'Todos' ? '' : s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-colors border shrink-0 ${
              (s === 'Todos' && !sector) || sector === s
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Results count + Clear ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{filtered.length}</span> vaga{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
        </p>
        {(hasContentFilters || hasLocationFilter) && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer"
          >
            <i className="ri-close-circle-line"></i>
            Limpar filtros
          </button>
        )}
      </div>

      {/* ── Jobs Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <i className="ri-search-line text-4xl text-gray-300 mb-3 block"></i>
          <p className="text-gray-500 font-medium">Nenhuma vaga encontrada</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Tente outros filtros ou palavras-chave</p>
          <button onClick={goHome} className="text-sm text-emerald-600 font-medium hover:underline cursor-pointer">
            Limpar filtros e voltar ao início
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((job) => (
            <article key={job.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg leading-tight mb-1">{job.title}</h2>
                  <p className="text-base font-medium text-gray-600">{job.area}</p>
                </div>
                <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${CONTRACT_COLORS[job.contractType] ?? 'bg-gray-100 text-gray-600'}`}>
                  {job.contractType}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <i className="ri-map-pin-line text-emerald-500"></i>
                  {job.neighborhood}, {job.city}
                </span>
                <span className="flex items-center gap-1 font-medium text-gray-700">
                  <i className="ri-money-dollar-circle-line text-emerald-500"></i>
                  {job.salaryRange}
                </span>
              </div>

              <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">{job.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {new Date(job.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
                <a
                  href={`/vagas/${job.id}`}
                  className="text-base font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                >
                  Ver vaga
                  <i className="ri-arrow-right-line"></i>
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
