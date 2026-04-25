import { useState, useMemo } from 'react';
import type { Job } from '../../lib/jobs';

interface JobsFilterProps {
  initialJobs: Job[];
  sectors: string[];
  contractTypes: string[];
  initialEstado?: string;
  initialCidade?: string;
  initialQ?: string;
  initialSetor?: string;
  initialFuncao?: string;
  initialCnh?: string;
}

const LOCATIONS: Record<string, string[]> = {
  Pará: ['Santarém'],
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
  contractTypes,
  initialEstado = '',
  initialCidade = '',
  initialQ = '',
  initialSetor = '',
  initialFuncao = '',
  initialCnh = '',
}: JobsFilterProps) {
  // ── Filtros de localização + setor (barra principal) ──
  const [estado, setEstado] = useState(initialEstado);
  const [cidade, setCidade] = useState(initialCidade);
  const [sector, setSector] = useState(initialSetor);

  const estados = Object.keys(LOCATIONS);
  const cidades = estado ? (LOCATIONS[estado] ?? []) : [];

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEstado(e.target.value);
    setCidade('');
  };

  // ── Filtros de conteúdo ──
  const [query, setQuery] = useState(initialQ);
  const [funcao, setFuncao] = useState(initialFuncao);
  const [contract, setContract] = useState('');
  const [requiresCnh, setRequiresCnh] = useState(initialCnh === 'true');
  const [sort, setSort] = useState<SortKey>('recente');
  const [showFilters, setShowFilters] = useState(!!(initialFuncao || initialCnh));

  const hasLocationFilter = !!(estado || cidade || sector);
  const hasContentFilters = !!(query || funcao || contract || requiresCnh);
  const hasAnyFilter = hasLocationFilter || hasContentFilters;

  // ── Breadcrumb ──
  const filterBreadcrumb = [
    estado ? `Estado: ${estado}` : null,
    cidade ? `Cidade: ${cidade}` : null,
    sector ? `Setor: ${sector}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  // ── Filtro + ordenação ──
  const filtered = useMemo(() => {
    let jobs = initialJobs.filter((j) => {
      // Busca textual
      const q = query.toLowerCase();
      if (
        q &&
        !j.title.toLowerCase().includes(q) &&
        !j.area.toLowerCase().includes(q) &&
        !j.description.toLowerCase().includes(q)
      )
        return false;

      // Setor (barra principal)
      if (sector && j.sector !== sector) return false;

      // Função/Cargo (Mais Filtros)
      if (funcao) {
        const fq = funcao.toLowerCase().replace(/\(.*?\)/g, '').trim();
        if (!j.title.toLowerCase().includes(fq) && !j.area.toLowerCase().includes(fq))
          return false;
      }

      // Tipo de contrato
      if (contract && j.contractType !== contract) return false;

      // CNH obrigatória
      if (requiresCnh && !j.requirements.toLowerCase().includes('cnh')) return false;

      // Cidade
      if (cidade && j.city !== cidade) return false;

      return true;
    });

    jobs = [...jobs].sort((a, b) => {
      if (sort === 'salario') return extractSalary(b.salaryRange) - extractSalary(a.salaryRange);
      if (sort === 'candidaturas') return b.id.localeCompare(a.id);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return jobs;
  }, [initialJobs, query, sector, funcao, contract, requiresCnh, sort, cidade]);

  const clearAllFilters = () => {
    setEstado('');
    setCidade('');
    setSector('');
    setQuery('');
    setFuncao('');
    setContract('');
    setRequiresCnh(false);
  };

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <div>
      {/* ── Breadcrumb de filtros ativos ── */}
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

      {/* ── Barra principal: Estado · Cidade · Setor ── */}
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
            {estados.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5">
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

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5">
          <i className="ri-briefcase-line text-emerald-600 text-sm shrink-0"></i>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
            aria-label="Setor"
          >
            <option value="">Setor</option>
            {sectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Busca + Mais Filtros + Ordenação ── */}
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
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <i className="ri-close-line text-sm"></i>
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            showFilters
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <i className="ri-filter-3-line"></i>
          Mais filtros
          {hasContentFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
          )}
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

      {/* ── Painel de Mais Filtros: Função/Cargo · Tipo de Contrato · CNH ── */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Função/Cargo */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Função / Cargo
            </label>
            <div className="relative">
              <i className="ri-user-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                type="text"
                value={funcao}
                onChange={(e) => setFuncao(e.target.value)}
                placeholder="Ex: Vendedor, Recepcionista..."
                className="w-full border border-gray-200 rounded-md pl-8 pr-3 py-2 text-sm text-gray-700 outline-none bg-white placeholder-gray-400 focus:border-emerald-400"
              />
              {funcao && (
                <button
                  onClick={() => setFuncao('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-sm"></i>
                </button>
              )}
            </div>
          </div>

          {/* Tipo de Contrato */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Tipo de Contrato
            </label>
            <select
              value={contract}
              onChange={(e) => setContract(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 outline-none bg-white cursor-pointer"
            >
              <option value="">Todos os contratos</option>
              {contractTypes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Necessário CNH */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Habilitação (CNH)
            </label>
            <label className="flex items-center gap-3 p-2.5 border border-gray-200 rounded-md bg-white cursor-pointer hover:border-emerald-300 transition-colors">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  requiresCnh
                    ? 'bg-emerald-600 border-emerald-600'
                    : 'border-gray-300'
                }`}
              >
                {requiresCnh && <i className="ri-check-line text-white text-xs"></i>}
              </div>
              <input
                type="checkbox"
                checked={requiresCnh}
                onChange={(e) => setRequiresCnh(e.target.checked)}
                className="sr-only"
              />
              <span className="text-sm text-gray-700">Necessário CNH</span>
            </label>
          </div>
        </div>
      )}

      {/* ── Sector Quick Pills ── */}
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

      {/* ── Contagem de resultados + Limpar ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{filtered.length}</span>{' '}
          vaga{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
        </p>
        {hasAnyFilter && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer"
          >
            <i className="ri-close-circle-line"></i>
            Limpar filtros
          </button>
        )}
      </div>

      {/* ── Grid de vagas ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <i className="ri-search-line text-4xl text-gray-300 mb-3 block"></i>
          <p className="text-gray-500 font-medium">Nenhuma vaga encontrada</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">
            Tente outros filtros ou palavras-chave
          </p>
          <button
            onClick={clearAllFilters}
            className="text-sm text-emerald-600 font-medium hover:underline cursor-pointer"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((job) => (
            <a
              key={job.id}
              href={`/vagas/${job.id}`}
              className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all hover:-translate-y-0.5 p-4 sm:p-5 no-underline group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                    {job.title}
                  </h2>
                  <p className="text-base font-medium text-gray-600">{job.area}</p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                    CONTRACT_COLORS[job.contractType] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
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

              <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">
                {job.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {new Date(job.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>
                <span className="text-base font-semibold text-emerald-600 group-hover:underline flex items-center gap-1 transition-colors">
                  Ver vaga
                  <i className="ri-arrow-right-line"></i>
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
