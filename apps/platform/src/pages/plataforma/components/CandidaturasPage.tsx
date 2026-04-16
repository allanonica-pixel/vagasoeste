import { useState } from "react";

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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  aguardando: { label: "Aguardando Análise", color: "text-gray-600", bg: "bg-gray-100" },
  em_analise: { label: "Em Análise", color: "text-amber-700", bg: "bg-amber-100" },
  pre_entrevista: { label: "Pré-entrevista", color: "text-sky-700", bg: "bg-sky-100" },
  aprovado: { label: "Aprovado!", color: "text-emerald-700", bg: "bg-emerald-100" },
  reprovado: { label: "Não selecionado", color: "text-red-600", bg: "bg-red-100" },
};

const mockApplications: Application[] = [
  {
    id: "a1",
    jobTitle: "Auxiliar Administrativo",
    sector: "Comércio",
    neighborhood: "Centro",
    contractType: "CLT",
    appliedAt: "2026-04-14",
    status: "pre_entrevista",
    steps: [
      { label: "Candidatura enviada", date: "14/04/2026", done: true, current: false, description: "Sua candidatura foi recebida pela equipe VagasOeste." },
      { label: "Perfil em análise", date: "15/04/2026", done: true, current: false, description: "Nossa equipe analisou seu perfil e verificou compatibilidade com a vaga." },
      { label: "Pré-entrevista agendada", date: "17/04/2026", done: false, current: true, description: "A equipe VagasOeste entrará em contato para agendar sua pré-entrevista." },
      { label: "Apresentação à empresa", date: "", done: false, current: false, description: "Seu perfil será apresentado à empresa de forma anônima." },
      { label: "Resultado final", date: "", done: false, current: false, description: "Você será notificado sobre o resultado do processo seletivo." },
    ],
  },
  {
    id: "a2",
    jobTitle: "Recepcionista",
    sector: "Saúde",
    neighborhood: "Maracanã",
    contractType: "CLT",
    appliedAt: "2026-04-15",
    status: "em_analise",
    steps: [
      { label: "Candidatura enviada", date: "15/04/2026", done: true, current: false, description: "Sua candidatura foi recebida pela equipe VagasOeste." },
      { label: "Perfil em análise", date: "", done: false, current: true, description: "Nossa equipe está analisando seu perfil para esta vaga." },
      { label: "Pré-entrevista", date: "", done: false, current: false, description: "Se aprovado, você será contatado para uma pré-entrevista." },
      { label: "Apresentação à empresa", date: "", done: false, current: false, description: "Seu perfil será apresentado à empresa de forma anônima." },
      { label: "Resultado final", date: "", done: false, current: false, description: "Você será notificado sobre o resultado." },
    ],
  },
  {
    id: "a3",
    jobTitle: "Operador de Caixa",
    sector: "Comércio",
    neighborhood: "Jardim Santarém",
    contractType: "CLT",
    appliedAt: "2026-04-10",
    status: "aprovado",
    steps: [
      { label: "Candidatura enviada", date: "10/04/2026", done: true, current: false, description: "Sua candidatura foi recebida." },
      { label: "Perfil em análise", date: "11/04/2026", done: true, current: false, description: "Perfil analisado com sucesso." },
      { label: "Pré-entrevista realizada", date: "13/04/2026", done: true, current: false, description: "Pré-entrevista realizada com a equipe VagasOeste." },
      { label: "Apresentado à empresa", date: "14/04/2026", done: true, current: false, description: "Seu perfil foi apresentado à empresa." },
      { label: "Aprovado! 🎉", date: "16/04/2026", done: true, current: true, description: "Parabéns! Você foi aprovado. A equipe VagasOeste entrará em contato para os próximos passos." },
    ],
  },
  {
    id: "a4",
    jobTitle: "Assistente de Vendas",
    sector: "Comércio",
    neighborhood: "Aldeia",
    contractType: "CLT",
    appliedAt: "2026-04-08",
    status: "reprovado",
    steps: [
      { label: "Candidatura enviada", date: "08/04/2026", done: true, current: false, description: "Sua candidatura foi recebida." },
      { label: "Perfil em análise", date: "09/04/2026", done: true, current: false, description: "Perfil analisado." },
      { label: "Não selecionado", date: "12/04/2026", done: true, current: true, description: "Infelizmente seu perfil não foi selecionado para esta vaga. Continue tentando!" },
    ],
  },
];

export default function CandidaturasPage() {
  const [selected, setSelected] = useState<string>(mockApplications[0].id);
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterSector, setFilterSector] = useState("Todos");

  const sectors = ["Todos", ...Array.from(new Set(mockApplications.map((a) => a.sector)))];

  const filtered = mockApplications.filter((a) => {
    const matchStatus = filterStatus === "Todos" || a.status === filterStatus;
    const matchSector = filterSector === "Todos" || a.sector === filterSector;
    return matchStatus && matchSector;
  });

  const selectedApp = mockApplications.find((a) => a.id === selected) || mockApplications[0];

  return (
    <div>
      {/* Filters */}
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
        {/* List */}
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
                <p className="text-gray-700 text-xs mt-0.5">Setor {app.sector}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="flex items-center gap-1 text-gray-600 text-xs">
                    <i className="ri-map-pin-line text-emerald-500 text-xs"></i>
                    {app.neighborhood}
                  </span>
                  <span className="text-gray-600 text-xs">{app.appliedAt}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Detail */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{selectedApp.jobTitle}</h3>
                <p className="text-gray-700 text-sm">Setor {selectedApp.sector} · {selectedApp.neighborhood} · {selectedApp.contractType}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_CONFIG[selectedApp.status].bg} ${STATUS_CONFIG[selectedApp.status].color}`}>
                {STATUS_CONFIG[selectedApp.status].label}
              </span>
            </div>

            {/* Timeline */}
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
      </div>
    </div>
  );
}
