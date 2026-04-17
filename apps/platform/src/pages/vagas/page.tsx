import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import { mockJobs, mockNeighborhoods } from "@/mocks/jobs";
import AnimatedSection from "@/components/base/AnimatedSection";
import BairroSEOSection from "@/pages/vagas/components/BairroSEOSection";

const LOCATIONS: Record<string, Record<string, string[]>> = {
  Pará: {
    Santarém: ["Centro", "Maracanã", "Jardim Santarém", "Aldeia", "Santa Clara", "Aparecida"],
  },
};

const CONTRACT_COLORS: Record<string, string> = {
  CLT: "bg-emerald-100 text-emerald-700",
  PJ: "bg-amber-100 text-amber-700",
  Freelance: "bg-violet-100 text-violet-700",
  Temporário: "bg-orange-100 text-orange-700",
};

const SECTOR_COLORS: Record<string, string> = {
  Saúde: "bg-rose-50 text-rose-600 border-rose-100",
  Comércio: "bg-sky-50 text-sky-600 border-sky-100",
  Tecnologia: "bg-indigo-50 text-indigo-600 border-indigo-100",
  Logística: "bg-amber-50 text-amber-600 border-amber-100",
  Alimentação: "bg-orange-50 text-orange-600 border-orange-100",
  Indústria: "bg-gray-100 text-gray-600 border-gray-200",
  Serviços: "bg-teal-50 text-teal-600 border-teal-100",
  "Construção Civil": "bg-yellow-50 text-yellow-700 border-yellow-100",
};

const AREAS = ["Todos", "Administrativo", "Varejo", "Logística", "Atendimento", "Serviços Gerais", "Vendas", "TI", "Alimentação", "Recursos Humanos", "Construção Civil", "Design", "Saúde"];
const CONTRACT_TYPES = ["Todos", "CLT", "PJ", "Temporário", "Freelance"];
const ALL_SECTORS = ["Todos", ...Array.from(new Set(mockJobs.map((j) => j.sector).filter(Boolean)))];

type SortOption = "recentes" | "salario" | "candidaturas";

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: "recentes", label: "Mais recentes", icon: "ri-time-line" },
  { value: "salario", label: "Maior salário", icon: "ri-money-dollar-circle-line" },
  { value: "candidaturas", label: "Mais candidaturas", icon: "ri-user-heart-line" },
];

function extractSalary(salaryRange?: string): number {
  if (!salaryRange) return 0;
  const match = salaryRange.replace(/\./g, "").match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function mockCandidatures(id: string): number {
  const seed = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (seed * 37) % 120 + 5;
}

export default function VagasPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Location filters
  const [estado, setEstado] = useState(searchParams.get("estado") || "");
  const [cidade, setCidade] = useState(searchParams.get("cidade") || "");
  const [bairroLocation, setBairroLocation] = useState(searchParams.get("bairro") || "");

  const estados = Object.keys(LOCATIONS);
  const cidades = estado ? Object.keys(LOCATIONS[estado] ?? {}) : [];
  const bairrosLocation = estado && cidade ? (LOCATIONS[estado]?.[cidade] ?? []) : [];

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEstado(e.target.value);
    setCidade("");
    setBairroLocation("");
  };

  const handleCidadeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCidade(e.target.value);
    setBairroLocation("");
  };

  // Content filters
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedArea, setSelectedArea] = useState(searchParams.get("area") || "Todos");
  const [selectedContract, setSelectedContract] = useState("Todos");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("Todos");
  const [selectedSector, setSelectedSector] = useState(searchParams.get("setor") || "Todos");

  // Pending filters (inside the panel, not yet applied)
  const [pendingArea, setPendingArea] = useState(selectedArea);
  const [pendingContract, setPendingContract] = useState(selectedContract);
  const [pendingNeighborhood, setPendingNeighborhood] = useState(selectedNeighborhood);
  const [pendingSector, setPendingSector] = useState(selectedSector);

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("recentes");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const neighborhoods = ["Todos", ...mockNeighborhoods.map((n) => n.name)];

  // Count active applied filters
  const activeFilterCount = [
    selectedArea !== "Todos",
    selectedContract !== "Todos",
    selectedNeighborhood !== "Todos",
    selectedSector !== "Todos",
  ].filter(Boolean).length;

  const pendingFilterCount = [
    pendingArea !== "Todos",
    pendingContract !== "Todos",
    pendingNeighborhood !== "Todos",
    pendingSector !== "Todos",
  ].filter(Boolean).length;

  // Has any location filter active
  const hasLocationFilter = !!(estado || cidade || bairroLocation);

  const filtered = useMemo(() => {
    const base = mockJobs.filter((job) => {
      const matchSearch =
        !search ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.area.toLowerCase().includes(search.toLowerCase()) ||
        job.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
        (job.sector && job.sector.toLowerCase().includes(search.toLowerCase()));
      const matchArea = selectedArea === "Todos" || job.area === selectedArea;
      const matchContract = selectedContract === "Todos" || job.contractType === selectedContract;
      const matchNeighborhood = selectedNeighborhood === "Todos" || job.neighborhood === selectedNeighborhood;
      const matchSector = selectedSector === "Todos" || job.sector === selectedSector;
      // Location filters
      const matchCidade = !cidade || job.city === cidade;
      const matchBairro = !bairroLocation || job.neighborhood === bairroLocation;
      return matchSearch && matchArea && matchContract && matchNeighborhood && matchSector && matchCidade && matchBairro;
    });

    return [...base].sort((a, b) => {
      if (sortBy === "recentes") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "salario") return extractSalary(b.salaryRange) - extractSalary(a.salaryRange);
      if (sortBy === "candidaturas") return mockCandidatures(b.id) - mockCandidatures(a.id);
      return 0;
    });
  }, [search, selectedArea, selectedContract, selectedNeighborhood, selectedSector, cidade, bairroLocation, sortBy]);

  const openFilters = () => {
    setPendingArea(selectedArea);
    setPendingContract(selectedContract);
    setPendingNeighborhood(selectedNeighborhood);
    setPendingSector(selectedSector);
    setShowFilters(true);
  };

  const closeFilters = () => setShowFilters(false);

  const applyFilters = () => {
    setSelectedArea(pendingArea);
    setSelectedContract(pendingContract);
    setSelectedNeighborhood(pendingNeighborhood);
    setSelectedSector(pendingSector);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSelectedArea("Todos");
    setSelectedContract("Todos");
    setSelectedNeighborhood("Todos");
    setSelectedSector("Todos");
  };

  const clearPendingFilters = () => {
    setPendingArea("Todos");
    setPendingContract("Todos");
    setPendingNeighborhood("Todos");
    setPendingSector("Todos");
  };

  const clearAllAndGoHome = () => {
    navigate("/");
  };

  // Build filter breadcrumb text
  const filterBreadcrumb = [
    estado ? `Estado: ${estado}` : null,
    `Cidade: ${cidade || "Todas"}`,
    `Bairro: ${bairroLocation || "Todos"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page Header */}
      <div className="bg-emerald-900 pt-24 pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-0 pb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
            Vagas de Emprego em Santarém
          </h1>
          <p className="text-emerald-100 text-sm mb-5">
            {mockJobs.length}+ vagas disponíveis · Empresa anônima até sua seleção
          </p>

          {/* Location Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2.5">
              <i className="ri-map-pin-line text-emerald-600 text-sm shrink-0"></i>
              <select
                value={estado}
                onChange={handleEstadoChange}
                className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
              >
                <option value="">Estado</option>
                {estados.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2.5">
              <i className="ri-building-2-line text-emerald-600 text-sm shrink-0"></i>
              <select
                value={cidade}
                onChange={handleCidadeChange}
                disabled={!estado}
                className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer disabled:opacity-50"
              >
                <option value="">Cidade</option>
                {cidades.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2.5">
              <i className="ri-home-4-line text-emerald-600 text-sm shrink-0"></i>
              <select
                value={bairroLocation}
                onChange={(e) => setBairroLocation(e.target.value)}
                disabled={!cidade}
                className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer disabled:opacity-50"
              >
                <option value="">Bairro</option>
                {bairrosLocation.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-1.5 mb-4">
            <div className="flex-1 flex items-center gap-3 bg-white rounded-lg px-4 py-2">
              <i className="ri-search-line text-gray-400 text-sm shrink-0"></i>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cargo, setor ou bairro..."
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
              />
              {search && (
                <button onClick={() => setSearch("")} className="w-4 h-4 flex items-center justify-center cursor-pointer">
                  <i className="ri-close-line text-gray-400 text-sm"></i>
                </button>
              )}
            </div>
            <button
              onClick={openFilters}
              className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-white/20 transition-colors"
            >
              <i className="ri-filter-3-line text-sm"></i>
              Mais filtros
              {activeFilterCount > 0 && (
                <span className="bg-emerald-400 text-emerald-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Active Filter Breadcrumb — shown when location filters are active */}
          {hasLocationFilter && (
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 pt-1 border-t border-white/10">
              <div className="flex items-center gap-2 flex-wrap">
                <i className="ri-filter-line text-emerald-300 text-xs"></i>
                <span className="text-white/90 text-xs font-medium">{filterBreadcrumb}</span>
              </div>
              <button
                onClick={clearAllAndGoHome}
                className="flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-close-circle-line text-sm"></i>
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Panel Overlay */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeFilters}></div>
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl z-10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50">
                  <i className="ri-filter-3-line text-emerald-600 text-sm"></i>
                </div>
                <h2 className="font-bold text-gray-900 text-base">Filtros de Busca</h2>
              </div>
              <button onClick={closeFilters} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <i className="ri-close-line text-gray-500 text-lg"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  <i className="ri-building-line mr-1"></i>Setor
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SECTORS.map((s) => (
                    <button key={s} onClick={() => setPendingSector(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors border whitespace-nowrap ${pendingSector === s ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  <i className="ri-briefcase-line mr-1"></i>Área Profissional
                </label>
                <div className="flex flex-wrap gap-2">
                  {AREAS.map((a) => (
                    <button key={a} onClick={() => setPendingArea(a)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors border whitespace-nowrap ${pendingArea === a ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  <i className="ri-file-text-line mr-1"></i>Tipo de Contrato
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONTRACT_TYPES.map((c) => (
                    <button key={c} onClick={() => setPendingContract(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors border whitespace-nowrap ${pendingContract === c ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  <i className="ri-map-pin-line mr-1"></i>Bairro
                </label>
                <select value={pendingNeighborhood} onChange={(e) => setPendingNeighborhood(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer bg-white">
                  {neighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              {pendingFilterCount > 0 && (
                <div className="flex justify-end">
                  <button onClick={clearPendingFilters} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 cursor-pointer transition-colors">
                    <i className="ri-close-circle-line"></i>Limpar seleções
                  </button>
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 bg-white rounded-b-2xl">
              {pendingFilterCount > 0 && (
                <p className="text-xs text-emerald-600 font-medium mb-3 text-center">
                  {pendingFilterCount} filtro{pendingFilterCount > 1 ? "s" : ""} selecionado{pendingFilterCount > 1 ? "s" : ""}
                </p>
              )}
              <button onClick={applyFilters} disabled={pendingFilterCount === 0}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${pendingFilterCount > 0 ? "bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700 active:scale-95" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-search-line"></i>Buscar Vagas
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sector Quick Filters */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {ALL_SECTORS.map((s) => (
            <button key={s} onClick={() => setSelectedSector(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-colors border ${selectedSector === s ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Results Count + active filter chips + sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-gray-600 text-sm">
              <strong className="text-gray-900">{filtered.length}</strong> vaga{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
            </p>
            {selectedArea !== "Todos" && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-2.5 py-1 rounded-full">
                {selectedArea}
                <button onClick={() => setSelectedArea("Todos")} className="cursor-pointer hover:text-red-500 transition-colors">
                  <i className="ri-close-line text-xs"></i>
                </button>
              </span>
            )}
            {selectedContract !== "Todos" && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-2.5 py-1 rounded-full">
                {selectedContract}
                <button onClick={() => setSelectedContract("Todos")} className="cursor-pointer hover:text-red-500 transition-colors">
                  <i className="ri-close-line text-xs"></i>
                </button>
              </span>
            )}
            {selectedNeighborhood !== "Todos" && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-2.5 py-1 rounded-full">
                {selectedNeighborhood}
                <button onClick={() => setSelectedNeighborhood("Todos")} className="cursor-pointer hover:text-red-500 transition-colors">
                  <i className="ri-close-line text-xs"></i>
                </button>
              </span>
            )}
            {selectedSector !== "Todos" && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-2.5 py-1 rounded-full">
                {selectedSector}
                <button onClick={() => setSelectedSector("Todos")} className="cursor-pointer hover:text-red-500 transition-colors">
                  <i className="ri-close-line text-xs"></i>
                </button>
              </span>
            )}
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-500 cursor-pointer transition-colors">
                Limpar todos
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs text-gray-500 whitespace-nowrap">Atualizado hoje</span>
            </div>
            <div className="relative">
              <button onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 border border-gray-200 bg-white rounded-lg px-3 py-2 text-xs font-medium text-gray-700 cursor-pointer hover:border-emerald-300 hover:text-emerald-700 transition-colors whitespace-nowrap">
                <i className={`${SORT_OPTIONS.find(o => o.value === sortBy)?.icon} text-xs`}></i>
                {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                <i className={`${showSortMenu ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-xs text-gray-400`}></i>
              </button>
              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)}></div>
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 min-w-[180px] overflow-hidden">
                    <div className="px-3 py-2 border-b border-gray-50">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ordenar por</p>
                    </div>
                    {SORT_OPTIONS.map((opt) => (
                      <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer transition-colors text-left ${sortBy === opt.value ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}>
                        <i className={`${opt.icon} text-sm ${sortBy === opt.value ? "text-emerald-600" : "text-gray-400"}`}></i>
                        {opt.label}
                        {sortBy === opt.value && <i className="ri-check-line text-emerald-600 text-xs ml-auto"></i>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <i className="ri-search-line text-gray-300 text-4xl"></i>
            </div>
            <h3 className="text-gray-700 font-semibold text-lg mb-2">Nenhuma vaga encontrada</h3>
            <p className="text-gray-600 text-sm mb-4">Tente ajustar os filtros ou buscar por outro termo.</p>
            <button onClick={clearAllAndGoHome} className="text-sm text-emerald-600 font-medium hover:underline cursor-pointer">
              Limpar filtros e voltar ao início
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((job, index) => (
              <AnimatedSection key={job.id} variant="fade-up" delay={Math.min(index % 6, 5) * 70}>
                <div
                  className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 hover:border-emerald-200 transition-all cursor-pointer group h-full"
                  onClick={() => navigate(`/vagas/${job.id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${CONTRACT_COLORS[job.contractType] || "bg-gray-100 text-gray-600"}`}>
                      {job.contractType}
                    </span>
                    <i className="ri-arrow-right-up-line text-gray-300 group-hover:text-emerald-500 transition-colors text-base"></i>
                  </div>
                  <div className="mb-1">
                    <h2 className="font-bold text-gray-900 text-lg leading-snug mb-1.5">{job.title}</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      {job.sector && (
                        <span className={`inline-flex items-center gap-1 text-sm font-medium px-2.5 py-0.5 rounded-full border ${SECTOR_COLORS[job.sector] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
                          <i className="ri-building-line text-sm"></i>Setor {job.sector}
                        </span>
                      )}
                      <span className="text-sm text-gray-700">{job.area}</span>
                    </div>
                  </div>
                  <div className="space-y-2 mt-3 mb-3">
                    <div className="flex items-center gap-2">
                      <i className="ri-map-pin-line text-emerald-500 text-sm"></i>
                      <span className="text-gray-800 text-base">{job.neighborhood}, {job.city}</span>
                    </div>
                    {job.salaryRange && (
                      <div className="flex items-center gap-2">
                        <i className="ri-money-dollar-circle-line text-emerald-500 text-sm"></i>
                        <span className="text-gray-800 text-base">{job.salaryRange}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <i className="ri-calendar-line text-emerald-500 text-sm"></i>
                      <span className="text-gray-700 text-sm">
                        Publicada em {new Date(job.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {job.tags.map((tag) => (
                      <span key={tag} className="bg-gray-50 border border-gray-100 text-gray-500 text-sm px-2.5 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1.5">
                      <i className="ri-eye-off-line text-gray-400 text-sm"></i>
                      <span className="text-gray-600 text-sm">Empresa anônima</span>
                    </div>
                    <span className="text-emerald-600 text-sm font-semibold group-hover:underline">Candidatar-se →</span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}

        {selectedNeighborhood !== "Todos" && (
          <BairroSEOSection bairro={selectedNeighborhood} jobCount={filtered.length} />
        )}

        <div className="mt-12 bg-gray-100 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Espaço Publicitário · Google AdSense</p>
          <p className="text-gray-300 text-xs mt-1">728×90 · Leaderboard</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
