import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import CandidaturasPage from "./components/CandidaturasPage";
import CurriculoBuilder from "./components/CurriculoBuilder";
import NotificacoesPage from "./components/NotificacoesPage";
import VagaDetalheModal from "./components/VagaDetalheModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Job {
  id: string;
  title: string;
  sector: string;
  area: string;
  contractType: string;
  neighborhood: string;
  city: string;
  state: string;
  salaryRange?: string;
  description: string;
  requirements: string;
  tags: string[];
  createdAt: string;
}

const CONTRACT_COLORS: Record<string, string> = {
  CLT: "bg-emerald-100 text-emerald-700",
  PJ: "bg-amber-100 text-amber-700",
  Freelance: "bg-violet-100 text-violet-700",
  Temporário: "bg-orange-100 text-orange-700",
};

const SECTOR_COLORS: Record<string, string> = {
  "Saúde": "bg-rose-100 text-rose-700",
  "Comércio": "bg-sky-100 text-sky-700",
  "Tecnologia": "bg-indigo-100 text-indigo-700",
  "Logística": "bg-teal-100 text-teal-700",
  "Alimentação": "bg-orange-100 text-orange-700",
  "Indústria": "bg-gray-100 text-gray-700",
  "Serviços": "bg-emerald-100 text-emerald-700",
  "Construção Civil": "bg-amber-100 text-amber-700",
};

type Tab = "vagas" | "candidaturas" | "curriculo" | "notificacoes";
type ModalState = "none" | "success" | "process";

export default function PlataformaPage() {
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.full_name ?? user?.email ?? "Candidato";
  const [activeTab, setActiveTab] = useState<Tab>("vagas");
  const [selected, setSelected] = useState<string[]>([]);
  const [modal, setModal] = useState<ModalState>("none");
  const [vagaDetalheId, setVagaDetalheId] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const navigate = useNavigate();

  // ── Vagas reais do Supabase ────────────────────────────────────────
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    supabase
      .from("jobs")
      .select("id, title, sector, area, contract_type, neighborhood, city, state, salary_range, description, requirements, tags, created_at")
      .eq("status", "ativo")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setJobs(
            data.map((j) => ({
              id:           j.id,
              title:        j.title,
              sector:       j.sector ?? "",
              area:         j.area ?? "",
              contractType: j.contract_type,
              neighborhood: j.neighborhood ?? "",
              city:         j.city ?? "Santarém",
              state:        j.state ?? "PA",
              salaryRange:  j.salary_range ?? undefined,
              description:  j.description,
              requirements: j.requirements ?? "",
              tags:         j.tags ?? [],
              createdAt:    j.created_at,
            }))
          );
        }
        setLoadingJobs(false);
      });
  }, []);

  // ── Filtros ────────────────────────────────────────────────────────
  const [searchVaga, setSearchVaga] = useState("");
  const [filterSector, setFilterSector] = useState("Todos");
  const [filterContract, setFilterContract] = useState("Todos");
  const [filterNeighborhood, setFilterNeighborhood] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);

  const sectors = ["Todos", ...Array.from(new Set(jobs.map((j) => j.sector).filter(Boolean)))];
  const contracts = ["Todos", ...Array.from(new Set(jobs.map((j) => j.contractType)))];
  const neighborhoods = ["Todos", ...Array.from(new Set(jobs.map((j) => j.neighborhood).filter(Boolean)))];

  const filteredJobs = jobs.filter((job) => {
    const matchSearch = !searchVaga || job.title.toLowerCase().includes(searchVaga.toLowerCase()) || job.area.toLowerCase().includes(searchVaga.toLowerCase());
    const matchSector = filterSector === "Todos" || job.sector === filterSector;
    const matchContract = filterContract === "Todos" || job.contractType === filterContract;
    const matchNeighborhood = filterNeighborhood === "Todos" || job.neighborhood === filterNeighborhood;
    return matchSearch && matchSector && matchContract && matchNeighborhood;
  });

  const activeFiltersCount = [filterSector, filterContract, filterNeighborhood].filter((f) => f !== "Todos").length + (searchVaga ? 1 : 0);

  const toggleJob = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    if (selected.length === 0) return;
    setModal("success");
  };

  const handleVagaDetalheApply = (jobId: string) => {
    setAppliedJobs((prev) => [...prev, jobId]);
  };

  // Notificações não lidas (sem dados reais por enquanto)
  const unreadNotifCount = 0;

  const tabs: { id: Tab; label: string; icon: string; badge?: number }[] = [
    { id: "vagas", label: "Vagas Disponíveis", icon: "ri-briefcase-line" },
    { id: "candidaturas", label: "Minhas Candidaturas", icon: "ri-file-list-line" },
    { id: "curriculo", label: "Meu Currículo", icon: "ri-file-user-line" },
    { id: "notificacoes", label: "Notificações", icon: "ri-notification-line", badge: unreadNotifCount },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Platform Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <i className="ri-briefcase-line text-white text-xs"></i>
            </div>
            <span className="font-bold text-base text-gray-900">
              Vagas<span className="text-emerald-600">Oeste</span>
            </span>
            <span className="text-gray-300 mx-2">|</span>
            <span className="text-gray-700 text-sm hidden sm:block">Plataforma do Candidato</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:block truncate max-w-[180px]">{displayName}</span>
            <Link
              to="/plataforma/perfil"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <i className="ri-user-line text-emerald-600 text-sm"></i>
              </div>
              <span className="hidden sm:block">Meu Perfil</span>
            </Link>
            <button
              onClick={() => signOut()}
              title="Sair"
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
            >
              <i className="ri-logout-box-r-line text-gray-400 hover:text-red-500 text-sm"></i>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Olá, {displayName.split(" ")[0]}! 👋</h1>
          <p className="text-gray-700 text-sm mt-1">
            Gerencie suas candidaturas, crie seu currículo e encontre novas oportunidades.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap relative ${
                activeTab === tab.id ? "bg-white text-gray-900" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${tab.icon} text-xs`}></i>
              </div>
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className="bg-rose-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Vagas Tab */}
        {activeTab === "vagas" && (
          <div>
            {/* Search & Filters */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                    <i className="ri-search-line text-gray-400 text-xs"></i>
                  </div>
                  <input
                    type="text"
                    value={searchVaga}
                    onChange={(e) => setSearchVaga(e.target.value)}
                    placeholder="Buscar vagas por título ou área..."
                    className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${
                    showFilters || activeFiltersCount > 0 ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:border-emerald-300"
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-filter-line text-xs"></i>
                  </div>
                  Filtros
                  {activeFiltersCount > 0 && (
                    <span className="bg-emerald-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">{activeFiltersCount}</span>
                  )}
                </button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Setor</label>
                    <select value={filterSector} onChange={(e) => setFilterSector(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer">
                      {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Contrato</label>
                    <select value={filterContract} onChange={(e) => setFilterContract(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer">
                      {contracts.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Bairro</label>
                    <select value={filterNeighborhood} onChange={(e) => setFilterNeighborhood(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer">
                      {neighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  {activeFiltersCount > 0 && (
                    <div className="sm:col-span-3">
                      <button
                        onClick={() => { setFilterSector("Todos"); setFilterContract("Todos"); setFilterNeighborhood("Todos"); setSearchVaga(""); }}
                        className="text-xs text-emerald-600 hover:underline cursor-pointer"
                      >
                        Limpar todos os filtros
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Loading skeleton */}
            {loadingJobs && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
                    <div className="flex gap-2 mb-3">
                      <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
                      <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
                    </div>
                    <div className="h-5 bg-gray-100 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded mb-3 w-1/2"></div>
                    <div className="h-4 bg-gray-100 rounded mb-1 w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            )}

            {!loadingJobs && (
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
              {filteredJobs.length} vaga{filteredJobs.length !== 1 ? "s" : ""} encontrada{filteredJobs.length !== 1 ? "s" : ""}
            </p>
            )}

            {selected.length > 0 && (
              <div className="bg-emerald-600 text-white rounded-xl px-5 py-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <i className="ri-checkbox-multiple-line text-emerald-200 text-base"></i>
                  </div>
                  <span className="font-semibold text-sm">
                    {selected.length} vaga{selected.length > 1 ? "s" : ""} selecionada{selected.length > 1 ? "s" : ""}
                  </span>
                </div>
                <button
                  onClick={handleApply}
                  className="bg-white text-emerald-700 font-bold px-6 py-2 rounded-lg text-sm hover:bg-emerald-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Vamos lá! 🚀
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map((job) => {
                const isSelected = selected.includes(job.id);
                const isApplied = appliedJobs.includes(job.id);
                return (
                  <div
                    key={job.id}
                    className={`bg-white rounded-xl border-2 p-5 transition-all ${
                      isSelected ? "border-emerald-500 bg-emerald-50/30" : "border-gray-100 hover:border-emerald-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CONTRACT_COLORS[job.contractType] || "bg-gray-100 text-gray-600"}`}>
                          {job.contractType}
                        </span>
                        {job.sector && (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${SECTOR_COLORS[job.sector] || "bg-gray-100 text-gray-600"}`}>
                            {job.sector}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleJob(job.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                          isSelected ? "border-emerald-500 bg-emerald-500" : "border-gray-300 hover:border-emerald-400"
                        }`}
                      >
                        {isSelected && <i className="ri-check-line text-white text-xs"></i>}
                      </button>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-1">{job.title}</h3>
                    <p className="text-gray-700 text-xs font-medium mb-3">{job.area}</p>
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-map-pin-line text-emerald-500 text-xs"></i>
                        </div>
                        <span className="text-gray-800 text-xs font-medium">{job.neighborhood}, {job.city}</span>
                      </div>
                      {job.salaryRange && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-money-dollar-circle-line text-emerald-500 text-xs"></i>
                          </div>
                          <span className="text-gray-800 text-xs font-medium">{job.salaryRange}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 text-xs leading-relaxed line-clamp-2 mb-4">{job.description}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setVagaDetalheId(job.id)}
                        className="flex-1 border border-gray-200 text-gray-700 text-xs font-medium py-2 rounded-lg hover:border-emerald-300 hover:text-emerald-700 cursor-pointer transition-colors whitespace-nowrap"
                      >
                        Ver detalhes
                      </button>
                      {isApplied ? (
                        <span className="flex-1 text-center text-xs font-semibold text-emerald-600 py-2 bg-emerald-50 rounded-lg">
                          Candidatado ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => { setVagaDetalheId(job.id); }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
                        >
                          Candidatar-se
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-16">
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <i className="ri-search-line text-gray-300 text-3xl"></i>
                </div>
                <p className="text-gray-400 text-sm">Nenhuma vaga encontrada com esses filtros</p>
                <button
                  onClick={() => { setFilterSector("Todos"); setFilterContract("Todos"); setFilterNeighborhood("Todos"); setSearchVaga(""); }}
                  className="mt-3 text-xs text-emerald-600 hover:underline cursor-pointer"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* Candidaturas Tab */}
        {activeTab === "candidaturas" && <CandidaturasPage />}

        {/* Notificações Tab */}
        {activeTab === "notificacoes" && <NotificacoesPage />}

        {/* Currículo Tab */}
        {activeTab === "curriculo" && (
          <div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 flex items-start gap-3">
              <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                <i className="ri-information-line text-emerald-600 text-sm"></i>
              </div>
              <div>
                <p className="text-emerald-800 text-sm font-semibold">Crie seu currículo profissional</p>
                <p className="text-emerald-700 text-xs mt-0.5">Preencha as informações abaixo, visualize a prévia e baixe o PDF gratuitamente. O arquivo ficará salvo na sua conta.</p>
              </div>
            </div>
            <CurriculoBuilder />
          </div>
        )}
      </div>

      {/* Modal: Success */}
      {modal === "success" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <i className="ri-trophy-line text-emerald-600 text-3xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Candidatura enviada!</h2>
            <p className="text-emerald-600 font-semibold text-lg mb-2">Parabéns! 🎉</p>
            <p className="text-gray-700 text-sm mb-6">
              Você se candidatou a <strong>{selected.length}</strong> vaga{selected.length > 1 ? "s" : ""}. Nossa equipe já foi notificada!
            </p>
            <button
              onClick={() => setModal("process")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Vaga Detalhe Modal */}
      {vagaDetalheId && (() => {
        const job = jobs.find((j) => j.id === vagaDetalheId);
        if (!job) return null;
        return (
          <VagaDetalheModal
            job={job}
            onClose={() => setVagaDetalheId(null)}
            onApply={handleVagaDetalheApply}
            alreadyApplied={appliedJobs.includes(vagaDetalheId)}
          />
        );
      })()}

      {/* Modal: Process */}
      {modal === "process" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <i className="ri-team-line text-emerald-600 text-3xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Agora é com a gente!</h2>
              <p className="text-gray-500 text-sm mt-2">Veja como funciona o nosso processo</p>
            </div>
            <div className="space-y-4 mb-6">
              {[
                { icon: "ri-search-eye-line", title: "Análise do seu perfil", desc: "Nossa equipe analisa seu perfil e verifica a compatibilidade com as vagas selecionadas." },
                { icon: "ri-user-star-line", title: "Apresentação anônima", desc: "Apresentamos seu perfil às empresas sem revelar seus dados pessoais." },
                { icon: "ri-whatsapp-line", title: "Atualizações pelo WhatsApp", desc: "Você receberá mensagens com o andamento do processo seletivo." },
                { icon: "ri-trophy-line", title: "Aprovação e contratação", desc: "Se aprovado, revelamos a empresa e organizamos o contato para a contratação." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <i className={`${item.icon} text-emerald-600 text-sm`}></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-gray-700 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setModal("none"); setSelected([]); setActiveTab("candidaturas"); }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
            >
              Ver minhas candidaturas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
