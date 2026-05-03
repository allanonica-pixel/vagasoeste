import { useState, useMemo, useEffect } from 'react';
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

// Mapa estado → sigla (para comparar com job.state)
const STATE_ABBR: Record<string, string> = {
  Pará: 'PA',
  Amazonas: 'AM',
};

const CONTRACT_COLORS: Record<string, string> = {
  CLT:        'bg-emerald-100 text-emerald-700',
  PJ:         'bg-blue-100 text-blue-700',
  Temporário: 'bg-amber-100 text-amber-700',
  Estágio:    'bg-purple-100 text-purple-700',
  Freelance:  'bg-pink-100 text-pink-700',
};

type SortKey = 'recente' | 'salario' | 'candidaturas';

function extractSalary(salaryRange: string): number {
  const nums = salaryRange.replace(/[^\d]/g, ' ').trim().split(/\s+/).map(Number).filter(Boolean);
  return nums.length ? Math.max(...nums) : 0;
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const now  = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffH  = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD  = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffH < 1)   return 'Agora';
  if (diffH === 1) return 'Há 1 hora';
  if (diffH < 24)  return `Há ${diffH}h`;
  if (diffD === 1) return 'Ontem';
  if (diffD < 30)  return `Há ${diffD} dias`;
  return 'Há mais de 1 mês';
}

// ── Pill de filtro ativo ──────────────────────────────────────────────────
function ActivePill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 text-emerald-500 hover:text-emerald-700 cursor-pointer"
        aria-label={`Remover filtro ${label}`}
      >
        <i className="ri-close-line text-xs" aria-hidden="true"></i>
      </button>
    </span>
  );
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
    setSector(''); // resetar setor ao trocar estado
  };

  // ── Setores disponíveis conforme localização selecionada ──
  const availableSectors = useMemo(() => {
    if (!estado && !cidade) return sectors;
    const stateCode = estado ? (STATE_ABBR[estado] ?? estado) : '';
    return [
      ...new Set(
        initialJobs
          .filter((j) => {
            if (stateCode && j.state !== stateCode) return false;
            if (cidade && j.city !== cidade) return false;
            return true;
          })
          .map((j) => j.sector)
          .filter(Boolean)
      ),
    ].sort();
  }, [initialJobs, estado, cidade, sectors]);

  // Se o setor selecionado não existe mais após mudar localização → reset
  useEffect(() => {
    if (sector && availableSectors.length > 0 && !availableSectors.includes(sector)) {
      setSector('');
    }
  }, [availableSectors, sector]);

  // ── Filtros de conteúdo ──
  const [query, setQuery]       = useState(initialQ);
  const [funcao, setFuncao]     = useState(initialFuncao);
  const [contract, setContract] = useState('');
  const [requiresCnh, setRequiresCnh] = useState(initialCnh === 'true');
  const [sort, setSort]         = useState<SortKey>('recente');
  const [showFilters, setShowFilters] = useState(!!(initialFuncao || initialCnh));

  // ── Mobile: painel de filtros colapsável ──
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const hasLocationFilter  = !!(estado || cidade || sector);
  const hasContentFilters  = !!(query || funcao || contract || requiresCnh);
  const hasAnyFilter       = hasLocationFilter || hasContentFilters;

  const activeFilterCount  = [estado, cidade, sector, query, funcao, contract, requiresCnh ? 'cnh' : '']
    .filter(Boolean).length;

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
    const stateCode = estado ? (STATE_ABBR[estado] ?? estado) : '';
    let jobs = initialJobs.filter((j) => {
      const q = query.toLowerCase();
      if (
        q &&
        !j.title.toLowerCase().includes(q) &&
        !j.area.toLowerCase().includes(q) &&
        !j.description.toLowerCase().includes(q)
      )
        return false;

      if (sector && j.sector !== sector) return false;

      if (funcao) {
        const fq = funcao.toLowerCase().replace(/\(.*?\)/g, '').trim();
        if (!j.title.toLowerCase().includes(fq) && !j.area.toLowerCase().includes(fq))
          return false;
      }

      if (contract && j.contractType !== contract) return false;
      if (requiresCnh && !j.requirements.toLowerCase().includes('cnh')) return false;
      if (stateCode && j.state !== stateCode) return false;
      if (cidade && j.city !== cidade) return false;

      return true;
    });

    jobs = [...jobs].sort((a, b) => {
      if (sort === 'salario')      return extractSalary(b.salaryRange) - extractSalary(a.salaryRange);
      if (sort === 'candidaturas') return b.id.localeCompare(a.id);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return jobs;
  }, [initialJobs, query, sector, funcao, contract, requiresCnh, sort, estado, cidade]);

  const clearAllFilters = () => {
    setEstado(''); setCidade(''); setSector('');
    setQuery(''); setFuncao(''); setContract(''); setRequiresCnh(false);
    setShowFilters(false);
    setMobileFiltersOpen(false);
  };

  const clearContentFilters = () => {
    setQuery(''); setFuncao(''); setContract(''); setRequiresCnh(false);
    setShowFilters(false);
  };

  const goHome = () => { window.location.href = '/'; };

  // ─────────────────────────────────────────────────────────────────────────
  // Painel de filtros (compartilhado desktop + mobile)
  // ─────────────────────────────────────────────────────────────────────────
  const FilterPanel = (
    <div>
      {/* Breadcrumb de filtros de localização */}
      {hasLocationFilter && (
        <div className="bg-emerald-800 -mx-4 md:-mx-6 px-4 md:px-6 py-2.5 mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <i className="ri-filter-line text-emerald-300 text-xs" aria-hidden="true"></i>
            <span className="text-white/90 text-xs font-medium">{filterBreadcrumb}</span>
          </div>
          <button
            type="button"
            onClick={goHome}
            className="flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-close-circle-line text-sm" aria-hidden="true"></i>
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Barra principal: Estado · Cidade · Setor */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5">
          <i className="ri-map-pin-line text-emerald-600 text-sm shrink-0" aria-hidden="true"></i>
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
          <i className="ri-building-2-line text-emerald-600 text-sm shrink-0" aria-hidden="true"></i>
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
          <i className="ri-briefcase-line text-emerald-600 text-sm shrink-0" aria-hidden="true"></i>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
            aria-label="Setor"
          >
            <option value="">Setor</option>
            {availableSectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Busca + Mais Filtros + Ordenação */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5">
          <i className="ri-search-line text-gray-400 text-sm shrink-0" aria-hidden="true"></i>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cargo, área ou palavra-chave..."
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            aria-label="Buscar vagas"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <i className="ri-close-line text-sm" aria-hidden="true"></i>
            </button>
          )}
        </div>

        {/* Botão Mais Filtros — quando ativo mostra "Limpar filtro" */}
        <button
          type="button"
          onClick={() => {
            if (showFilters && hasContentFilters) {
              clearContentFilters();
            } else {
              setShowFilters(!showFilters);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            showFilters
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <i className="ri-filter-3-line" aria-hidden="true"></i>
          Mais filtros
          {showFilters ? (
            <span className="border-l border-emerald-300 pl-2 text-xs font-semibold text-emerald-600">
              Limpar filtro
            </span>
          ) : hasContentFilters ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
          ) : null}
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

      {/* Painel Mais Filtros */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Função / Cargo</label>
            <div className="relative">
              <i className="ri-user-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" aria-hidden="true"></i>
              <input
                type="text"
                value={funcao}
                onChange={(e) => setFuncao(e.target.value)}
                placeholder="Ex: Vendedor, Recepcionista..."
                className="w-full border border-gray-200 rounded-md pl-8 pr-3 py-2 text-sm text-gray-700 outline-none bg-white placeholder-gray-400 focus:border-emerald-400"
              />
              {funcao && (
                <button
                  type="button"
                  onClick={() => setFuncao('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-sm" aria-hidden="true"></i>
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Tipo de Contrato</label>
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

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Habilitação (CNH)</label>
            <label className="flex items-center gap-3 p-2.5 border border-gray-200 rounded-md bg-white cursor-pointer hover:border-emerald-300 transition-colors">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  requiresCnh ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'
                }`}
              >
                {requiresCnh && <i className="ri-check-line text-white text-xs" aria-hidden="true"></i>}
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

      {/* Sector Quick Pills — usa availableSectors */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 mb-4">
        {['Todos', ...availableSectors].map((s) => (
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
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>

      {/* ── MOBILE: barra colapsável de filtros ────────────────────────── */}
      <div className="sm:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
            activeFilterCount > 0
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
              : 'border-gray-200 bg-white text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <i className="ri-filter-3-line" aria-hidden="true"></i>
            <span>
              {activeFilterCount > 0
                ? `Filtros (${activeFilterCount} ativo${activeFilterCount > 1 ? 's' : ''})`
                : 'Filtrar vagas'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); clearAllFilters(); }}
                className="text-xs text-emerald-600 font-semibold underline cursor-pointer"
              >
                Limpar
              </button>
            )}
            <i className={`ri-arrow-${mobileFiltersOpen ? 'up' : 'down'}-s-line text-base`} aria-hidden="true"></i>
          </div>
        </button>

        {/* Pills de filtros ativos quando painel está fechado */}
        {!mobileFiltersOpen && activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {estado && <ActivePill label={estado} onRemove={() => { setEstado(''); setCidade(''); setSector(''); }} />}
            {cidade  && <ActivePill label={cidade}  onRemove={() => setCidade('')} />}
            {sector  && <ActivePill label={sector}  onRemove={() => setSector('')} />}
            {query   && <ActivePill label={`"${query}"`} onRemove={() => setQuery('')} />}
            {funcao  && <ActivePill label={funcao}  onRemove={() => setFuncao('')} />}
            {contract && <ActivePill label={contract} onRemove={() => setContract('')} />}
            {requiresCnh && <ActivePill label="CNH" onRemove={() => setRequiresCnh(false)} />}
          </div>
        )}
      </div>

      {/* ── PAINEL DE FILTROS: mobile (colapsável) + desktop (sempre visível) ── */}
      <div className={`sm:block ${mobileFiltersOpen ? 'block' : 'hidden'}`}>
        {FilterPanel}
      </div>

      {/* ── Contagem de resultados + Limpar ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{filtered.length}</span>{' '}
          vaga{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
        </p>
        {hasAnyFilter && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer"
          >
            <i className="ri-close-circle-line" aria-hidden="true"></i>
            Limpar filtros
          </button>
        )}
      </div>

      {/* ── Grid de vagas ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <i className="ri-search-line text-4xl text-gray-300 mb-3 block" aria-hidden="true"></i>
          <p className="text-gray-500 font-medium">Nenhuma vaga encontrada</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Tente outros filtros ou palavras-chave</p>
          <button
            type="button"
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
              className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-shadow hover:-translate-y-0.5 p-4 sm:p-5 no-underline group"
            >
              {/* Título + área */}
              <div className="mb-3">
                <h2 className="font-bold text-gray-900 text-base leading-tight mb-0.5 line-clamp-2 text-balance">
                  {job.title}
                </h2>
                <p className="text-sm text-gray-500">{job.area}</p>
              </div>

              {/* Tipo de contrato badge */}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${
                  CONTRACT_COLORS[job.contractType] ?? 'bg-gray-100 text-gray-600'
                }`}
              >
                {job.contractType}
              </span>

              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <i className="ri-map-pin-line text-emerald-500" aria-hidden="true"></i>
                  {job.neighborhood}, {job.city}
                </span>
                {job.salaryRange && (
                  <span className="flex items-center gap-1 font-bold text-gray-900">
                    <i className="ri-money-dollar-circle-line text-emerald-500" aria-hidden="true"></i>
                    {job.salaryRange}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">
                {job.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <i className="ri-time-line text-xs" aria-hidden="true"></i>
                  {timeAgo(job.createdAt)}
                </span>
                <span className="text-sm font-semibold text-emerald-600 group-hover:underline flex items-center gap-1 transition-colors">
                  Ver detalhes
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
