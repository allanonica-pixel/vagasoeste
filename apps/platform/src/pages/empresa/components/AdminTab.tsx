import { useState } from "react";

interface Solicitation {
  id: string;
  type: "contact" | "interview";
  companyName: string;
  candidateRef: string;
  jobTitle: string;
  requestedAt: string;
  status: "pending" | "scheduled" | "done";
  notes: string;
  interviewReport?: string;
  contactDetails?: string;
}

const mockSolicitations: Solicitation[] = [
  {
    id: "s1",
    type: "interview",
    companyName: "Empresa Parceira A",
    candidateRef: "Candidato #C4",
    jobTitle: "Vendedor Externo",
    requestedAt: "2026-04-14",
    status: "done",
    notes: "Pré-entrevista realizada com sucesso.",
    interviewReport: "Candidato demonstrou excelente domínio de técnicas de vendas e boa comunicação. Perfil alinhado com a vaga. Recomendamos fortemente para a próxima etapa. Mostrou proatividade e conhecimento do mercado local de Santarém.",
  },
  {
    id: "s2",
    type: "contact",
    companyName: "Empresa Parceira A",
    candidateRef: "Candidato #C2",
    jobTitle: "Auxiliar Administrativo",
    requestedAt: "2026-04-15",
    status: "pending",
    notes: "",
    contactDetails: "Solicitado contato via WhatsApp para apresentação da proposta.",
  },
  {
    id: "s3",
    type: "interview",
    companyName: "Empresa Parceira B",
    candidateRef: "Candidato #C1",
    jobTitle: "Auxiliar Administrativo",
    requestedAt: "2026-04-16",
    status: "scheduled",
    notes: "Agendado para 18/04/2026 às 14h.",
    interviewReport: "",
  },
];

const STATUS_CONFIG = {
  pending: { label: "Pendente", color: "bg-gray-100 text-gray-600" },
  scheduled: { label: "Agendado", color: "bg-amber-100 text-amber-700" },
  done: { label: "Concluído", color: "bg-emerald-100 text-emerald-700" },
};

export default function AdminTab() {
  const [solicitations, setSolicitations] = useState<Solicitation[]>(mockSolicitations);
  const [selected, setSelected] = useState<string | null>(null);
  const [editReport, setEditReport] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "contact" | "interview">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "scheduled" | "done">("all");

  const filtered = solicitations.filter((s) => {
    const matchType = filterType === "all" || s.type === filterType;
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchType && matchStatus;
  });

  const selectedSol = solicitations.find((s) => s.id === selected) || null;

  const handleSelect = (id: string) => {
    const sol = solicitations.find((s) => s.id === id);
    setSelected(id);
    setEditReport(sol?.interviewReport || "");
    setEditNotes(sol?.notes || "");
  };

  const handleSave = () => {
    setSolicitations((prev) =>
      prev.map((s) =>
        s.id === selected
          ? { ...s, interviewReport: editReport, notes: editNotes }
          : s
      )
    );
  };

  const handleStatusChange = (id: string, status: Solicitation["status"]) => {
    setSolicitations((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 flex items-center justify-center">
            <i className="ri-admin-line text-emerald-600 text-base"></i>
          </div>
          <h2 className="font-bold text-gray-900 text-lg">Painel Administrativo VagasOeste</h2>
        </div>
        <p className="text-gray-500 text-sm">Gerencie todas as solicitações de contato e pré-entrevistas das empresas parceiras.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total de Solicitações", value: solicitations.length, icon: "ri-file-list-line", color: "text-gray-700" },
          { label: "Pendentes", value: solicitations.filter((s) => s.status === "pending").length, icon: "ri-time-line", color: "text-amber-600" },
          { label: "Concluídas", value: solicitations.filter((s) => s.status === "done").length, icon: "ri-checkbox-circle-line", color: "text-emerald-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
              <i className={`${stat.icon} ${stat.color} text-xl`}></i>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex flex-wrap gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Tipo</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer"
          >
            <option value="all">Todos</option>
            <option value="contact">Contato</option>
            <option value="interview">Pré-entrevista</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendente</option>
            <option value="scheduled">Agendado</option>
            <option value="done">Concluído</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {filtered.length} solicitaç{filtered.length !== 1 ? "ões" : "ão"}
          </p>
          {filtered.map((sol) => (
            <div
              key={sol.id}
              onClick={() => handleSelect(sol.id)}
              className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
                selected === sol.id ? "border-emerald-500" : "border-gray-100 hover:border-emerald-200"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  sol.type === "contact" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {sol.type === "contact" ? "Contato" : "Pré-entrevista"}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_CONFIG[sol.status].color}`}>
                  {STATUS_CONFIG[sol.status].label}
                </span>
              </div>
              <p className="font-semibold text-gray-900 text-sm">{sol.companyName}</p>
              <p className="text-gray-500 text-xs mt-0.5">{sol.candidateRef} · {sol.jobTitle}</p>
              <p className="text-gray-400 text-xs mt-1">Solicitado em {sol.requestedAt}</p>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <p className="text-gray-400 text-sm">Nenhuma solicitação encontrada</p>
            </div>
          )}
        </div>

        {/* Detail */}
        <div>
          {selectedSol ? (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Detalhes da Solicitação</h3>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_CONFIG[selectedSol.status].color}`}>
                  {STATUS_CONFIG[selectedSol.status].label}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                {[
                  { label: "Tipo", value: selectedSol.type === "contact" ? "Solicitação de Contato" : "Pré-entrevista" },
                  { label: "Empresa", value: selectedSol.companyName },
                  { label: "Candidato", value: selectedSol.candidateRef },
                  { label: "Vaga", value: selectedSol.jobTitle },
                  { label: "Data da Solicitação", value: selectedSol.requestedAt },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <span className="text-xs text-gray-400 w-32 shrink-0 pt-0.5">{item.label}:</span>
                    <span className="text-sm text-gray-800 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Status change */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Atualizar Status</label>
                <div className="flex gap-2 flex-wrap">
                  {(["pending", "scheduled", "done"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selectedSol.id, s)}
                      className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors whitespace-nowrap ${
                        selectedSol.status === s
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "border-gray-200 text-gray-600 hover:border-emerald-400"
                      }`}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Observações</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Adicione observações sobre esta solicitação..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400 resize-none"
                />
              </div>

              {/* Interview Report */}
              {selectedSol.type === "interview" && (
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Relato da Pré-entrevista</label>
                  <textarea
                    value={editReport}
                    onChange={(e) => setEditReport(e.target.value)}
                    rows={5}
                    maxLength={500}
                    placeholder="Descreva detalhadamente como foi a pré-entrevista, impressões do candidato, pontos fortes e fracos..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400 resize-none"
                  />
                  <p className="text-gray-400 text-xs mt-1 text-right">{editReport.length}/500</p>
                </div>
              )}

              <button
                onClick={handleSave}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <div className="w-10 h-10 flex items-center justify-center mx-auto mb-3">
                <i className="ri-file-list-line text-gray-300 text-2xl"></i>
              </div>
              <p className="text-gray-400 text-sm">Selecione uma solicitação para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
