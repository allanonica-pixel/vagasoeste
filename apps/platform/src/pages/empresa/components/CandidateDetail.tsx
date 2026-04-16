import { useState } from "react";
import { Candidate, CandidateStatus, StatusHistoryEntry } from "@/mocks/candidates";

export const STATUS_CONFIG: Record<CandidateStatus, { label: string; color: string; icon: string; bg: string }> = {
  pendente: { label: "Pendente", color: "text-gray-600", icon: "ri-time-line", bg: "bg-gray-100" },
  em_analise: { label: "Em Análise", color: "text-amber-700", icon: "ri-search-eye-line", bg: "bg-amber-100" },
  pre_entrevista: { label: "Pré-Entrevista", color: "text-sky-700", icon: "ri-calendar-check-line", bg: "bg-sky-100" },
  entrevista: { label: "Entrevista", color: "text-violet-700", icon: "ri-video-chat-line", bg: "bg-violet-100" },
  aprovado: { label: "Aprovado", color: "text-emerald-700", icon: "ri-checkbox-circle-line", bg: "bg-emerald-100" },
  reprovado: { label: "Reprovado", color: "text-red-600", icon: "ri-close-circle-line", bg: "bg-red-100" },
  contratado: { label: "Contratado", color: "text-teal-700", icon: "ri-trophy-line", bg: "bg-teal-100" },
};

const STATUS_ORDER: CandidateStatus[] = [
  "pendente",
  "em_analise",
  "pre_entrevista",
  "entrevista",
  "aprovado",
  "reprovado",
  "contratado",
];

const GENDER_LABELS: Record<string, string> = {
  M: "Masculino",
  F: "Feminino",
  NB: "Não-binário",
  NI: "Não informado",
};

interface Props {
  candidate: Candidate;
  onFavorite: (id: string) => void;
  onRequest: (id: string, type: "contact" | "interview") => void;
  onStatusChange: (id: string, newStatus: CandidateStatus, note: string) => void;
}

export default function CandidateDetail({ candidate, onFavorite, onRequest, onStatusChange }: Props) {
  const [confirmType, setConfirmType] = useState<"contact" | "interview" | null>(null);
  const [showRequestDetail, setShowRequestDetail] = useState<number | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus>(candidate.status);
  const [statusNote, setStatusNote] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const hasContact = candidate.requests.some((r) => r.type === "contact");
  const hasInterview = candidate.requests.some((r) => r.type === "interview");

  const handleConfirm = () => {
    if (!confirmType) return;
    onRequest(candidate.id, confirmType);
    setConfirmType(null);
  };

  const handleStatusSave = () => {
    if (selectedStatus === candidate.status) {
      setShowStatusModal(false);
      return;
    }
    onStatusChange(candidate.id, selectedStatus, statusNote);
    setStatusNote("");
    setShowStatusModal(false);
  };

  const formatDate = (d: string) => {
    const [y, m, day] = d.split("-");
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${day}/${months[parseInt(m) - 1]}/${y}`;
  };

  const cfg = STATUS_CONFIG[candidate.status];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center relative">
            <i className="ri-user-line text-gray-400 text-lg"></i>
            {candidate.isFavorited && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                <i className="ri-heart-fill text-white" style={{ fontSize: "10px" }}></i>
              </div>
            )}
          </div>
          <div>
            <p className="font-bold text-gray-900">Candidato Anônimo</p>
            <p className="text-gray-700 text-xs">Candidato à vaga: <strong>{candidate.jobTitle}</strong></p>
          </div>
        </div>
        {/* Status badge + change button */}
        <div className="flex flex-col items-end gap-1.5">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${cfg.bg} ${cfg.color}`}>
            <div className="w-3 h-3 flex items-center justify-center">
              <i className={`${cfg.icon} text-xs`}></i>
            </div>
            {cfg.label}
          </span>
          <button
            onClick={() => { setSelectedStatus(candidate.status); setShowStatusModal(true); }}
            className="text-xs text-emerald-600 hover:underline cursor-pointer flex items-center gap-1"
          >
            <i className="ri-edit-line text-xs"></i>
            Alterar status
          </button>
        </div>
      </div>

      {/* Status History toggle */}
      <div className="mb-5">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-history-line text-xs"></i>
          </div>
          Histórico de status ({candidate.statusHistory.length})
          <div className="w-4 h-4 flex items-center justify-center">
            <i className={showHistory ? "ri-arrow-up-s-line text-xs" : "ri-arrow-down-s-line text-xs"}></i>
          </div>
        </button>

        {showHistory && (
          <div className="mt-3 relative pl-4">
            {/* Timeline line */}
            <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gray-100"></div>
            <div className="space-y-3">
              {[...candidate.statusHistory].reverse().map((entry, i) => {
                const entryCfg = STATUS_CONFIG[entry.status];
                return (
                  <div key={i} className="relative flex items-start gap-3">
                    {/* Dot */}
                    <div className={`absolute -left-2.5 top-1 w-4 h-4 rounded-full flex items-center justify-center ${entryCfg.bg} border-2 border-white`}>
                      <i className={`${entryCfg.icon} ${entryCfg.color}`} style={{ fontSize: "8px" }}></i>
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold ${entryCfg.color}`}>{entryCfg.label}</span>
                        <span className="text-xs text-gray-400">{formatDate(entry.date)}</span>
                      </div>
                      {entry.note && (
                        <p className="text-xs text-gray-500 mt-0.5">{entry.note}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Personal Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Bairro", value: candidate.neighborhood, icon: "ri-map-pin-line" },
          { label: "Idade", value: `${candidate.age} anos`, icon: "ri-calendar-line" },
          { label: "Sexo", value: GENDER_LABELS[candidate.gender] || candidate.gender, icon: "ri-user-line" },
          { label: "PCD", value: candidate.isPCD ? "Sim" : "Não", icon: "ri-heart-pulse-line" },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${item.icon} text-emerald-500 text-xs`}></i>
              </div>
              <span className="text-xs text-gray-500">{item.label}</span>
            </div>
            <p className={`font-semibold text-sm ${item.label === "PCD" && candidate.isPCD ? "text-violet-700" : "text-gray-900"}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Professional Info */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: "Escolaridade", value: candidate.educationLevel, icon: "ri-graduation-cap-line" },
          { label: "Disponibilidade", value: candidate.availability, icon: "ri-time-line" },
          { label: "Pretensão Salarial", value: candidate.salaryExpectation, icon: "ri-money-dollar-circle-line" },
          { label: "Cidade", value: candidate.city, icon: "ri-building-line" },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${item.icon} text-emerald-500 text-xs`}></i>
              </div>
              <span className="text-xs text-gray-500">{item.label}</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Experiences */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Experiências Profissionais</p>
        <p className="text-gray-700 text-xs leading-relaxed">{candidate.experiences}</p>
      </div>

      {/* Courses */}
      {candidate.courses.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cursos e Certificações</p>
          <div className="space-y-2">
            {candidate.courses.map((course) => (
              <div key={course.id} className="bg-gray-50 rounded-lg p-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{course.title}</p>
                  <p className="text-gray-700 text-xs mt-0.5">{course.institution}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">{course.startDate}</p>
                  <p className="text-xs text-gray-400">até {course.endDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requests Status */}
      {candidate.requests.length > 0 && (
        <div className="mb-5 bg-sky-50 border border-sky-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-3">Solicitações Realizadas</p>
          <div className="space-y-2">
            {candidate.requests.map((req, i) => (
              <div key={i} className="bg-white rounded-lg p-3 border border-sky-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      req.type === "contact" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {req.type === "contact" ? "Contato" : "Pré-entrevista"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      req.status === "done" ? "bg-emerald-100 text-emerald-700" :
                      req.status === "scheduled" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {req.status === "done" ? "Concluído" : req.status === "scheduled" ? "Agendado" : "Pendente"}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowRequestDetail(showRequestDetail === i ? null : i)}
                    className="text-xs text-sky-600 hover:underline cursor-pointer"
                  >
                    {showRequestDetail === i ? "Fechar" : "Ver detalhes"}
                  </button>
                </div>
                <p className="text-xs text-gray-400">Solicitado em {req.requestedAt}</p>
                {showRequestDetail === i && (
                  <div className="mt-2 pt-2 border-t border-sky-100">
                    {req.contactDetails && (
                      <p className="text-xs text-gray-600 leading-relaxed">{req.contactDetails}</p>
                    )}
                    {req.interviewReport && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Relato da Pré-entrevista:</p>
                        <p className="text-xs text-gray-600 leading-relaxed bg-amber-50 rounded p-2">{req.interviewReport}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons - 3 grid */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-600 mb-3">
          Dados pessoais (nome, telefone, email) são gerenciados exclusivamente pela equipe VagasOeste.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {/* Favoritar */}
          <button
            onClick={() => onFavorite(candidate.id)}
            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 cursor-pointer transition-all ${
              candidate.isFavorited
                ? "border-rose-400 bg-rose-50 text-rose-600"
                : "border-gray-200 hover:border-rose-300 text-gray-500 hover:text-rose-500"
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className={`${candidate.isFavorited ? "ri-heart-fill" : "ri-heart-line"} text-base`}></i>
            </div>
            <span className="text-xs font-semibold whitespace-nowrap">
              {candidate.isFavorited ? "Favoritado" : "Favoritar"}
            </span>
          </button>

          {/* Pré-entrevista */}
          <button
            onClick={() => !hasInterview && setConfirmType("interview")}
            disabled={hasInterview}
            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all ${
              hasInterview
                ? "border-amber-300 bg-amber-50 text-amber-600 opacity-70 cursor-not-allowed"
                : "border-gray-200 hover:border-amber-400 text-gray-500 hover:text-amber-600 cursor-pointer"
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-calendar-check-line text-base"></i>
            </div>
            <span className="text-xs font-semibold text-center leading-tight">
              {hasInterview ? "Entrevista Solicitada" : "Pré-Entrevista"}
            </span>
          </button>

          {/* Solicitar Contato */}
          <button
            onClick={() => !hasContact && setConfirmType("contact")}
            disabled={hasContact}
            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all ${
              hasContact
                ? "border-sky-300 bg-sky-50 text-sky-600 opacity-70 cursor-not-allowed"
                : "border-gray-200 hover:border-sky-400 text-gray-500 hover:text-sky-600 cursor-pointer"
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-phone-line text-base"></i>
            </div>
            <span className="text-xs font-semibold text-center leading-tight">
              {hasContact ? "Contato Solicitado" : "Solicitar Contato"}
            </span>
          </button>
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 mb-1">Alterar status do candidato</h3>
            <p className="text-gray-600 text-xs mb-4">Selecione o novo status e adicione uma observação opcional.</p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {STATUS_ORDER.map((s) => {
                const c = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedStatus(s)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-semibold cursor-pointer transition-all ${
                      selectedStatus === s
                        ? `${c.bg} ${c.color} border-current`
                        : "border-gray-100 text-gray-500 hover:border-gray-200"
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className={`${c.icon} text-xs`}></i>
                    </div>
                    {c.label}
                  </button>
                );
              })}
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Observação (opcional)</label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Ex: Candidato aprovado para entrevista presencial..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg text-sm cursor-pointer hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleStatusSave}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer"
              >
                Salvar status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Request Modal */}
      {confirmType && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className={`w-12 h-12 flex items-center justify-center mx-auto mb-4 rounded-full ${
              confirmType === "contact" ? "bg-sky-50" : "bg-amber-50"
            }`}>
              <i className={`text-xl ${confirmType === "contact" ? "ri-phone-line text-sky-500" : "ri-calendar-check-line text-amber-500"}`}></i>
            </div>
            <h3 className="text-gray-900 font-bold text-center mb-2">
              {confirmType === "contact" ? "Solicitar Contato" : "Solicitar Pré-entrevista"}
            </h3>
            <p className="text-gray-700 text-sm text-center mb-5">
              {confirmType === "contact"
                ? "A equipe VagasOeste entrará em contato com o candidato e intermediará a comunicação com sua empresa."
                : "A equipe VagasOeste realizará uma pré-entrevista com o candidato e enviará um relatório detalhado para você."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmType(null)} className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg text-sm cursor-pointer hover:bg-gray-50">Cancelar</button>
              <button onClick={handleConfirm} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
