import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApplicationStep {
  label: string;
  date: string;
  done: boolean;
  current: boolean;
  description: string;
}

interface Application {
  id: string;
  jobTitle: string;
  sector: string;
  neighborhood: string;
  contractType: string;
  appliedAt: string;
  status: "em_analise" | "pre_entrevista" | "aprovado" | "reprovado" | "aguardando";
  steps: ApplicationStep[];
}

// ─── Configurações visuais ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  aguardando:    { label: "Aguardando Análise", color: "text-gray-600",    bg: "bg-gray-100"    },
  em_analise:    { label: "Em Análise",          color: "text-amber-700",   bg: "bg-amber-100"   },
  pre_entrevista:{ label: "Pré-entrevista",      color: "text-sky-700",     bg: "bg-sky-100"     },
  aprovado:      { label: "Aprovado!",           color: "text-emerald-700", bg: "bg-emerald-100" },
  reprovado:     { label: "Não selecionado",     color: "text-red-600",     bg: "bg-red-100"     },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converte o status do banco para o status visual */
function mapStatus(dbStatus: string): Application["status"] {
  const map: Record<string, Application["status"]> = {
    pendente:      "aguardando",
    em_analise:    "em_analise",
    pre_entrevista:"pre_entrevista",
    entrevista:    "pre_entrevista",
    aprovado:      "aprovado",
    contratado:    "aprovado",
    reprovado:     "reprovado",
  };
  return map[dbStatus] ?? "aguardando";
}

/** Formata timestamp ISO para "DD/MM/YYYY" */
function formatDateDisplay(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const day   = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year  = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Gera a linha do tempo baseada no status atual da candidatura */
function buildSteps(dbStatus: string, appliedDate: string): ApplicationStep[] {
  const done = (statuses: string[]) => statuses.includes(dbStatus);
  const isCurrent = (s: string) => dbStatus === s;

  const isFinished = done(["aprovado", "contratado", "reprovado"]);
  const isInterviewing = done(["pre_entrevista", "entrevista"]);
  const hasAnalysis = done(["em_analise", "pre_entrevista", "entrevista", "aprovado", "contratado", "reprovado"]);

  const finalLabel =
    done(["aprovado", "contratado"]) ? "Aprovado! 🎉"
    : dbStatus === "reprovado"       ? "Não selecionado"
    :                                  "Resultado final";

  const finalDesc =
    done(["aprovado", "contratado"])
      ? "Parabéns! Você foi aprovado. A equipe VagasOeste entrará em contato pelo WhatsApp para os próximos passos."
      : dbStatus === "reprovado"
      ? "Infelizmente seu perfil não foi selecionado para esta vaga. Continue tentando — novas oportunidades aparecem toda semana!"
      : "Você será notificado sobre o resultado do processo seletivo.";

  return [
    {
      label:       "Candidatura enviada",
      date:        appliedDate,
      done:        true,
      current:     dbStatus === "pendente",
      description: "Sua candidatura foi recebida pela equipe VagasOeste.",
    },
    {
      label:       "Perfil em análise",
      date:        "",
      done:        hasAnalysis,
      current:     isCurrent("em_analise"),
      description: "Nossa equipe está analisando seu perfil e verificando compatibilidade com a vaga.",
    },
    {
      label:       "Pré-entrevista",
      date:        "",
      done:        isInterviewing || isFinished,
      current:     isCurrent("pre_entrevista") || isCurrent("entrevista"),
      description: "A equipe VagasOeste entrará em contato para agendar sua pré-entrevista.",
    },
    {
      label:       "Apresentação à empresa",
      date:        "",
      done:        isFinished,
      current:     false,
      description: "Seu perfil será apresentado à empresa de forma anônima.",
    },
    {
      label:       finalLabel,
      date:        "",
      done:        isFinished,
      current:     isFinished,
      description: finalDesc,
    },
  ];
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CandidaturasPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selected, setSelected]         = useState<string>("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterSector, setFilterSector] = useState("Todos");

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);

    // 1. Obtém o usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // 2. Busca o candidate_id do usuário
    const { data: candidate } = await supabase
      .from("candidates")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (!candidate) { setLoading(false); return; }

    // 3. Busca as candidaturas com dados da vaga
    const { data: apps, error } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        created_at,
        jobs (
          id,
          title,
          sector,
          neighborhood,
          contract_type
        )
      `)
      .eq("candidate_id", candidate.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar candidaturas:", error.message);
      setLoading(false);
      return;
    }

    if (apps && apps.length > 0) {
      const mapped: Application[] = apps.map((a) => {
        const job = Array.isArray(a.jobs) ? a.jobs[0] : a.jobs;
        const appliedDate = formatDateDisplay(a.created_at);
        const uiStatus = mapStatus(a.status);
        return {
          id:           a.id,
          jobTitle:     job?.title ?? "Vaga",
          sector:       (job as any)?.sector ?? "",
          neighborhood: (job as any)?.neighborhood ?? "",
          contractType: (job as any)?.contract_type ?? "",
          appliedAt:    appliedDate,
          status:       uiStatus,
          steps:        buildSteps(a.status, appliedDate),
        };
      });
      setApplications(mapped);
      setSelected(mapped[0].id);
    }

    setLoading(false);
  }

  // ── Derivados ─────────────────────────────────────────────────────

  const sectors = ["Todos", ...Array.from(new Set(applications.map((a) => a.sector).filter(Boolean)))];

  const filtered = applications.filter((a) => {
    const matchStatus = filterStatus === "Todos" || a.status === filterStatus;
    const matchSector = filterSector === "Todos" || a.sector === filterSector;
    return matchStatus && matchSector;
  });

  const selectedApp = applications.find((a) => a.id === selected) ?? applications[0];

  // ── Loading ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-emerald-500 text-3xl block mb-3"></i>
          <p className="text-gray-500 text-sm">Carregando candidaturas...</p>
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <i className="ri-file-list-line text-gray-400 text-2xl"></i>
        </div>
        <h3 className="font-bold text-gray-900 text-base mb-2">Nenhuma candidatura ainda</h3>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
          Candidate-se a vagas na aba <strong>Vagas Disponíveis</strong> e acompanhe o andamento aqui.
        </p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div>
      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="aguardando">Aguardando Análise</option>
              <option value="em_analise">Em Análise</option>
              <option value="pre_entrevista">Pré-entrevista</option>
              <option value="aprovado">Aprovado</option>
              <option value="reprovado">Não selecionado</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Setor</label>
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer"
            >
              {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista */}
        <div className="lg:col-span-1 space-y-3">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            {filtered.length} candidatura{filtered.length !== 1 ? "s" : ""}
          </p>

          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <p className="text-gray-400 text-sm">Nenhuma candidatura encontrada</p>
            </div>
          )}

          {filtered.map((app) => {
            const cfg = STATUS_CONFIG[app.status];
            return (
              <div
                key={app.id}
                onClick={() => setSelected(app.id)}
                className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  selected === app.id ? "border-emerald-500" : "border-gray-100 hover:border-emerald-200"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 text-sm">{app.jobTitle}</p>
                {app.sector && <p className="text-gray-700 text-xs mt-0.5">Setor {app.sector}</p>}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {app.neighborhood && (
                    <span className="flex items-center gap-1 text-gray-600 text-xs">
                      <i className="ri-map-pin-line text-emerald-500 text-xs"></i>
                      {app.neighborhood}
                    </span>
                  )}
                  <span className="text-gray-600 text-xs">{app.appliedAt}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detalhe com linha do tempo */}
        {selectedApp && (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{selectedApp.jobTitle}</h3>
                  <p className="text-gray-700 text-sm">
                    {[selectedApp.sector && `Setor ${selectedApp.sector}`, selectedApp.neighborhood, selectedApp.contractType]
                      .filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_CONFIG[selectedApp.status].bg} ${STATUS_CONFIG[selectedApp.status].color}`}>
                  {STATUS_CONFIG[selectedApp.status].label}
                </span>
              </div>

              {/* Linha do tempo */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100"></div>
                <div className="space-y-6">
                  {selectedApp.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-4 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                        step.done
                          ? "bg-emerald-600 border-emerald-600"
                          : step.current
                          ? "bg-white border-emerald-500"
                          : "bg-white border-gray-200"
                      }`}>
                        {step.done ? (
                          <i className="ri-check-line text-white text-xs"></i>
                        ) : step.current ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        )}
                      </div>
                      <div className={`flex-1 pb-2 ${!step.done && !step.current ? "opacity-50" : ""}`}>
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className={`font-semibold text-sm ${step.current ? "text-emerald-700" : step.done ? "text-gray-900" : "text-gray-400"}`}>
                            {step.label}
                          </p>
                          {step.date && <span className="text-xs text-gray-400">{step.date}</span>}
                          {step.current && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Atual</span>
                          )}
                        </div>
                        <p className="text-gray-700 text-xs leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedApp.status === "aprovado" && (
                <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 flex items-center justify-center mx-auto mb-2">
                    <i className="ri-trophy-line text-emerald-600 text-2xl"></i>
                  </div>
                  <p className="font-bold text-emerald-800">Parabéns! Você foi aprovado!</p>
                  <p className="text-emerald-700 text-sm mt-1">A equipe VagasOeste entrará em contato pelo WhatsApp para os próximos passos.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
