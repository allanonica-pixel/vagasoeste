import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import AnimatedSection from "@/components/base/AnimatedSection";
import BairroSEOSection from "@/pages/vagas/components/BairroSEOSection";

// ─── Tipos ──────────────────────────────────────────────────────────────────
interface Job {
  id: string;
  title: string;
  sector: string;
  area: string;
  contractType: string;
  neighborhood: string;
  city: string;
  salaryRange: string;
  createdAt: string;
  description: string;
  tags: string[];
}

// ─── Constantes ─────────────────────────────────────────────────────────────
const LOCATIONS: Record<string, Record<string, string[]>> = {
  Pará: {
    Santarém: ["Centro", "Maracanã", "Jardim Santarém", "Aldeia", "Santa Clara", "Aparecida"],
  },
};

const CONTRACT_COLORS: Record<string, string> = {
  CLT:        "bg-emerald-100 text-emerald-700",
  PJ:         "bg-amber-100 text-amber-700",
  Freelance:  "bg-violet-100 text-violet-700",
  Temporário: "bg-orange-100 text-orange-700",
  Estágio:    "bg-sky-100 text-sky-700",
};

const SECTOR_COLORS: Record<string, string> = {
  Saúde:            "bg-rose-50 text-rose-600 border-rose-100",
  Comércio:         "bg-sky-50 text-sky-600 border-sky-100",
  Tecnologia:       "bg-indigo-50 text-indigo-600 border-indigo-100",
  Logística:        "bg-amber-50 text-amber-600 border-amber-100",
  Alimentação:      "bg-orange-50 text-orange-600 border-orange-100",
  Indústria:        "bg-gray-100 text-gray-600 border-gray-200",
  Serviços:         "bg-teal-50 text-teal-600 border-teal-100",
  "Construção Civil": "bg-yellow-50 text-yellow-700 border-yellow-100",
};

const CONTRACT_TYPES = ["Todos", "CLT", "PJ", "Temporário", "Freelance"];

type SortOption = "recentes" | "salario";

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: "recentes", label: "Mais recentes",  icon: "ri-time-line" },
  { value: "salario",  label: "Maior salário",  icon: "ri-money-dollar-circle-line" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function mapRow(row: Record<string, unknown>): Job {
  const tagsRaw = row.tags;
  return {
    id:           String(row.id),
    title:        String(row.title        ?? ""),
    sector:       String(row.sector       ?? ""),
    area:         String(row.area         ?? ""),
    contractType: String(row.contract_type ?? ""),
    neighborhood: String(row.neighborhood  ?? ""),
    city:         String(row.city          ?? "Santarém"),
    salaryRange:  String(row.salary_range  ?? ""),
    createdAt:    String(row.created_at    ?? ""),
    description:  String(row.description   ?? ""),
    tags:         Array.isArray(tagsRaw) ? (tagsRaw as string[]) : [],
  };
}

function extractSalary(salaryRange: string): number {
  const nums = salaryRange.replace(/[^\d]/g, " ").trim().split(/\s+/).map(Number).filter(Boolean);
  return nums.length ? Math.max(...nums) : 0;
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "Recém publicado";
  const now  = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffH  = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD  = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffH < 1)   return "Agora";
  if (diffH === 1) return "Há 1 hora";
  if (diffH < 24)  return `Há ${diffH}h`;
  if (diffD === 1) return "Ontem";
  if (diffD < 30)  return `Há ${diffD} dias`;
  return "Há mais de 1 mês";
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function VagasPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // ── Dados
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, sector, area, contract_type, neighborhood, city, salary_range, created_at, description, tags")
        .eq("status", "ativo")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setAllJobs(data.map(mapRow));
      }
      setLoading(false);
    }
    fetchJobs();
  }, []);

  // ── Filtros de localização
  const [estado,         setEstado]         = useState(searchParams.get("estado") || "");
  const [cidade,         setCidade]         = useState(searchParams.get("cidade") || "");
  const [bairroLocation, setBairroLocation] = useState(searchParams.get("bairro") || "");

  const estados          = Object.keys(LOCATIONS);
  const cidades          = estado ? Object.keys(LOCATIONS[estado] ?? {}) : [];
  const bairrosLocation  = estado && cidade ? (LOCATIONS[estado]?.[cidade] ?? []) : [];

  // ── Filtros de conteúdo
  const [search,             setSearch]             = useState(searchParams.get("q")     || "");
  const [selectedSector,     setSelectedSector]     = useState(searchParams.get("setor") || "Todos");
  const [selectedContract,   setSelectedContract]   = useState("Todos");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("Todos");

  // Filtros pendentes (painel)
  const [pendingSector,       setPendingSector]       = useState(selectedSector);
  const [pendingContract,     setPendingContract]     = useState(selectedContract);
  const [pendingNeighborhood, setPendingNeighborhood] = useState(selectedNeighborhood);

  const [showFilters,  setShowFilters]  = useState(false);
  const [sortBy,       setSortBy]       = useState<SortOption>("recentes");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Setores e bairros derivados dos dados reais
  const allSectors     = useMemo(() => ["Todos", ...Array.from(new Set(allJobs.map(j => j.sector).filter(Boolean))).sort()], [allJobs]);
  const allNeighborhoods = useMemo(() => ["Todos", ...Array.from(new Set(allJobs.map(j => j.neighborhood).filter(Boolean))).sort()], [allJobs]);

  const activeFilterCount = [
    selectedSector !== "Todos",
    selectedContract !== "Todos",
    selectedNeighborhood !== "Todos",
  ].filter(Boolean).length;

  const pendingFilterCount = [
    pendingSector !== "Todos",
    pendingContract !== "Todos",
    pendingNeighborhood !== "Todos",
  ].filter(Boolean).length;

  const hasLocationFilter = !!(estado || cidade || bairroLocation);

  // ── Filtragem
  const filtered = useMemo(() => {
    const base = allJobs.filter((job) => {
      const q = search.toLowerCase();
      const matchSearch      = !q || job.title.toLowerCase().includes(q) || job.area.toLowerCase().includes(q) || job.neighborhood.toLowerCase().includes(q) || job.sector.toLowerCase().includes(q) || job.description.toLowerCase().includes(q);
      const matchSector      = selectedSector === "Todos" || job.sector === selectedSector;
      const matchContract    = selectedContract === "Todos" || job.contractType === selectedContract;
      const matchNeighborhood = selectedNeighborhood === "Todos" || job.neighborhood === selectedNeighborhood;
      const matchCidade      = !cidade || job.city === cidade;
      const matchBairro      = !bairroLocation || job.neighborhood === bairroLocation;
      return matchSearch && matchSector && matchContract && matchNeighborhood && matchCidade && matchBairro;
    });

    return [...base].sort((a, b) => {
      if (sortBy === "salario") return extractSalary(b.salaryRange) - extractSalary(a.salaryRange);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [allJobs, search, selectedSector, selectedContract, selectedNeighborhood, cidade, bairroLocation, sortBy]);

  // ── Handlers
  const openFilters = () => {
    setPendingSector(selectedSector);
    setPendingContract(selectedContract);
    setPendingNeighborhood(selectedNeighborhood);
    setShowFilters(true);
  };

  const applyFilters = () => {
    setSelectedSector(pendingSector);
    setSelectedContract(pendingContract);
    setSelectedNeighborhood(pendingNeighborhood);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSelectedSector("Todos");
    setSelectedContract("Todos");
    setSelectedNeighborhood("Todos");
  };

  const filterBreadcrumb = [
    estado       ? `Estado: ${estado}`       : null,
    cidade       ? `Cidade: ${cidade}`       : null,
    bairroLocation ? `Bairro: ${bairroLocation}` : null,
  ].filter(Boolean).join(" · ");

  return (
    <div className="min-h-dvh bg-gray-50">
      <Navbar />

      {/* Page Header */}
      <div className="bg-emerald-900 pt-24 pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-0 pb-4">
          <nav className="mb-3">
            <ol className="flex items-center gap-1.5 text-xs text-emerald-300">
              <li><button type="button" onClick={() => navigate("/")} className="hover:text-white transition-colors cursor-pointer">Início</button></li>
              <li><i className="ri-arrow-right-s-line" aria-hidden="true"></i></li>
              <li className="text-white font-medium">Vagas</li>
            </ol>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 text-balance">
            Vagas de Emprego em Santarém/PA
          </h1>
          <p className="text-emerald-200 text-sm mb-4">
            <span className="font-semibold text-white">{allJobs.length}+</span> vagas disponíveis · Empresa anônima até você ser selecionado
          </p>

          {/* Localização */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2.5">
              <i className="ri-map-pin-line text-emerald-600 text-sm shrink-0" aria-hidden="true"></i>
              <select value={estado} onChange={(e) => { setEstado(e.target.value); setCidade(""); setBairroLocation(""); }}
                className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer">
                <option value="">Estado</option>
                {estados.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2.5">
              <i className="ri-building-2-line text-emerald-600 text-sm shrink-0" aria-hidden="true"></i>
              <select value={cidade} onChange={(e) => { setCidade(e.target.value); setBairroLocation(""); }}
                disabled={!estado} className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer disabled:opacity-50">
                <option value="">Cidade</option>
                {cidades.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2.5">
              <i className="ri-home-4-line text-emerald-600 text-sm shrink-0" aria-hidden="true"></i>
              <select value={bairroLocation} onChange={(e) => setBairroLocation(e.target.value)}
                disabled={!cidade} className="flex-1 text-sm text-gray-700 outline-none bg-transparent cursor-pointer disabled:opacity-50">
                <option value="">Bairro</option>
                {bairrosLocation.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          {/* Search + Filtros */}
          <div className="flex flex-col sm:flex-row gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-1.5 mb-4">
            <div className="flex-1 flex items-center gap-3 bg-white rounded-lg px-4 py-2">
              <i className="ri-search-line text-gray-400 text-sm shrink-0"></i>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Cargo, setor ou bairro..."
                aria-label="Buscar vagas por cargo, setor ou bairro"
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent" />
              {search && (
                <button type="button" onClick={() => setSearch("")} className="cursor-pointer" aria-label="Limpar busca">
                  <i className="ri-close-line text-gray-400 text-sm" aria-hidden="true"></i>
                </button>
              )}
            </div>
            <button type="button" onClick={openFilters}
              className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap hover:bg-white/20 transition-colors">
              <i className="ri-filter-3-line text-sm" aria-hidden="true"></i>
              Mais filtros
              {activeFilterCount > 0 && (
                <span className="bg-emerald-400 text-emerald-900 text-xs font-bold size-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {hasLocationFilter && (
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 pt-1 border-t border-white/10">
              <div className="flex items-center gap-2 flex-wrap">
                <i className="ri-filter-line text-emerald-300 text-xs" aria-hidden="true"></i>
                <span className="text-white/90 text-xs font-medium">{filterBreadcrumb}</span>
              </div>
              <button type="button" onClick={() => { setEstado(""); setCidade(""); setBairroLocation(""); }}
                className="flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-close-circle-line text-sm" aria-hidden="true"></i>
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Panel Overlay */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)}></div>
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl z-10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="size-8 flex items-center justify-center rounded-lg bg-emerald-50">
                  <i className="ri-filter-3-line text-emerald-600 text-sm" aria-hidden="true"></i>
                </div>
                <h2 className="font-bold text-gray-900 text-base">Filtros de Busca</h2>
              </div>
              <button type="button" onClick={() => setShowFilters(false)} className="size-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors" aria-label="Fechar filtros">
                <i className="ri-close-line text-gray-500 text-lg" aria-hidden="true"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  <i className="ri-building-line mr-1" aria-hidden="true"></i>Setor
                </label>
                <div className="flex flex-wrap gap-2">
                  {allSectors.map((s) => (
                    <button key={s} onClick={() => setPendingSector(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors border whitespace-nowrap ${pendingSector === s ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  <i className="ri-file-text-line mr-1" aria-hidden="true"></i>Tipo de Contrato
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONTRACT_TYPES.map((c) => (
                    <button key={c} onClick={() => setPendingContract(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors border whitespace-nowrap ${pendingContract === c ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  <i className="ri-map-pin-line mr-1" aria-hidden="true"></i>Bairro
                </label>
                <select value={pendingNeighborhood} onChange={(e) => setPendingNeighborhood(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer bg-white">
                  {allNeighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 bg-white rounded-b-2xl">
              {pendingFilterCount > 0 && (
                <p className="text-xs text-emerald-600 font-medium mb-3 text-center">
                  {pendingFilterCount} filtro{pendingFilterCount > 1 ? "s" : ""} selecionado{pendingFilterCount > 1 ? "s" : ""}
                </p>
              )}
              <button type="button" onClick={applyFilters}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700 transition-colors motion-safe:active:scale-95">
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-search-line" aria-hidden="true"></i>Buscar Vagas
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sector Quick Filters */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {allSectors.map((s) => (
            <button key={s} onClick={() => setSelectedSector(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-colors border ${selectedSector === s ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Results + Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-gray-600 text-sm">
              <strong className="text-gray-900">{filtered.length}</strong> vaga{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
            </p>
            {selectedSector !== "Todos" && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-2.5 py-1 rounded-full">
                {selectedSector}
                <button type="button" onClick={() => setSelectedSector("Todos")} className="cursor-pointer hover:text-red-500 transition-colors" aria-label="Remover filtro de setor"><i className="ri-close-line text-xs" aria-hidden="true"></i></button>
              </span>
            )}
            {selectedContract !== "Todos" && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-2.5 py-1 rounded-full">
                {selectedContract}
                <button type="button" onClick={() => setSelectedContract("Todos")} className="cursor-pointer hover:text-red-500 transition-colors" aria-label="Remover filtro de contrato"><i className="ri-close-line text-xs" aria-hidden="true"></i></button>
              </span>
            )}
            {selectedNeighborhood !== "Todos" && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-2.5 py-1 rounded-full">
                {selectedNeighborhood}
                <button type="button" onClick={() => setSelectedNeighborhood("Todos")} className="cursor-pointer hover:text-red-500 transition-colors" aria-label="Remover filtro de bairro"><i className="ri-close-line text-xs" aria-hidden="true"></i></button>
              </span>
            )}
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-500 cursor-pointer transition-colors">Limpar todos</button>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs text-gray-500 whitespace-nowrap">Atualizado hoje</span>
            </div>
            <div className="relative">
              <button onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 border border-gray-200 bg-white rounded-lg px-3 py-2 text-xs font-medium text-gray-700 cursor-pointer hover:border-emerald-300 transition-colors whitespace-nowrap">
                <i className={`${SORT_OPTIONS.find(o => o.value === sortBy)?.icon} text-xs`}></i>
                {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                <i className={`${showSortMenu ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-xs text-gray-400`}></i>
              </button>
              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)}></div>
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 min-w-[180px] overflow-hidden">
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

        {/* Loading */}
        {loading ? (
          <div className="text-center py-20">
            <div className="size-8 border-2 border-emerald-600 border-t-transparent rounded-full motion-safe:animate-spin mx-auto mb-4" role="status" aria-label="Carregando vagas"></div>
            <p className="text-gray-400 text-sm">Carregando vagas...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="size-16 flex items-center justify-center mx-auto mb-4">
              <i className="ri-search-line text-gray-300 text-4xl" aria-hidden="true"></i>
            </div>
            <h3 className="text-gray-700 font-semibold text-lg mb-2 text-balance">Nenhuma vaga encontrada</h3>
            <p className="text-gray-600 text-sm mb-4 text-pretty">Tente ajustar os filtros ou buscar por outro termo.</p>
            <button type="button" onClick={clearFilters} className="text-sm text-emerald-600 font-medium hover:underline cursor-pointer">
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((job, index) => (
              <AnimatedSection key={job.id} variant="fade-up" delay={Math.min(index % 6, 5) * 70}>
                <div
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:border-emerald-200 hover:shadow-md transition-[border-color,box-shadow,transform] cursor-pointer group h-full flex flex-col hover:-translate-y-0.5"
                  onClick={() => navigate(`/vagas/${job.id}`)}
                >
                  {/* Título + área */}
                  <div className="mb-3">
                    <h2 className="font-bold text-gray-900 text-base leading-tight mb-0.5 line-clamp-2">{job.title}</h2>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {job.sector && (
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${SECTOR_COLORS[job.sector] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
                          {job.sector}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">{job.area}</span>
                    </div>
                  </div>

                  {/* Contrato badge */}
                  <span className={`self-start text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3 ${CONTRACT_COLORS[job.contractType] || "bg-gray-100 text-gray-600"}`}>
                    {job.contractType}
                  </span>

                  {/* Localização + Salário */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2">
                      <i className="ri-map-pin-line text-emerald-500 text-sm" aria-hidden="true"></i>
                      <span className="text-gray-700 text-sm">{job.neighborhood}, {job.city}</span>
                    </div>
                    {job.salaryRange && (
                      <div className="flex items-center gap-2">
                        <i className="ri-money-dollar-circle-line text-emerald-500 text-sm" aria-hidden="true"></i>
                        <span className="font-bold text-gray-900 text-sm">{job.salaryRange}</span>
                      </div>
                    )}
                  </div>

                  {/* Descrição resumida */}
                  {job.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">{job.description}</p>
                  )}

                  {/* Tags */}
                  {job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {job.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="bg-gray-50 border border-gray-100 text-gray-500 text-xs px-2.5 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Rodapé */}
                  <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <i className="ri-time-line text-xs" aria-hidden="true"></i>
                      {timeAgo(job.createdAt)}
                    </span>
                    <span className="text-sm font-semibold text-emerald-600 group-hover:underline whitespace-nowrap">
                      {isLoggedIn ? "Ver detalhes →" : "Candidatar-se →"}
                    </span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}

        {selectedNeighborhood !== "Todos" && (
          <BairroSEOSection bairro={selectedNeighborhood} jobCount={filtered.length} />
        )}
      </div>

      {/* CTA de cadastro — apenas para não logados */}
      {!isLoggedIn && (
        <section className="py-10 bg-emerald-50 border-t border-emerald-100">
          <div className="max-w-xl mx-auto px-4 text-center">
            <h2 className="text-lg font-bold text-gray-900 mb-2 text-balance">Não encontrou a vaga ideal?</h2>
            <p className="text-sm text-gray-600 mb-4">
              Cadastre-se gratuitamente e receba alertas quando novas vagas forem publicadas na sua área.
            </p>
            <button
              type="button"
              onClick={() => navigate("/cadastro")}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors cursor-pointer"
            >
              <i className="ri-user-add-line" aria-hidden="true"></i>
              Criar conta e receber alertas
            </button>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
