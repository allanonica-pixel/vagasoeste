import { useState } from "react";
import AnimatedSection from "@/components/base/AnimatedSection";
import { mockAdminJobs, AdminJob } from "@/mocks/adminData";
import { sendEmailNotification } from "@/hooks/useEmailNotification";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  ativa: { label: "Ativa", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  pausada: { label: "Pausada", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  encerrada: { label: "Encerrada", color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  pendente: { label: "Pendente", color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
};

const SECTORS = ["Todos", "Saúde", "Comércio", "Tecnologia", "Construção Civil", "Alimentação", "Logística", "Serviços", "Indústria", "Agronegócio"];
const CONTRACT_TYPES = ["Todos", "CLT", "PJ", "Freelance", "Temporário"];
const TABS = [
  { id: "todos", label: "Todas" },
  { id: "pendente", label: "Pendentes" },
  { id: "ativa", label: "Ativas" },
  { id: "pausada", label: "Pausadas" },
  { id: "encerrada", label: "Encerradas" },
];

interface JobApprovalModalProps {
  job: AdminJob;
  action: "approve" | "reject";
  onConfirm: (action: "approve" | "reject", motivo?: string) => void;
  onClose: () => void;
}

function JobApprovalModal({ job, action, onConfirm, onClose }: JobApprovalModalProps) {
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const isApprove = action === "approve";

  const emailPreview = isApprove
    ? `Olá, ${job.company}!\n\nA vaga de ${job.title} foi aprovada pela equipe VagasOeste e já está disponível para candidatos no site público.\n\nCandidatos de Santarém e região já podem se candidatar. Acesse o painel para acompanhar as candidaturas.\n\nEquipe VagasOeste`
    : `Olá, ${job.company}.\n\nA vaga de ${job.title} não foi aprovada pela equipe VagasOeste.\n\nMotivo: ${motivo || "[motivo]"}\n\nPara regularizar, acesse o painel e edite a vaga ou entre em contato com nossa equipe.\n\nEquipe VagasOeste`;

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirm(action, isApprove ? undefined : motivo);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className={`p-5 border-b ${isApprove ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isApprove ? "bg-emerald-100" : "bg-red-100"}`}>
              <i className={`text-lg ${isApprove ? "ri-checkbox-circle-line text-emerald-600" : "ri-close-circle-line text-red-600"}`}></i>
            </div>
            <div>
              <h3 className={`font-bold text-sm ${isApprove ? "text-emerald-900" : "text-red-900"}`}>
                {isApprove ? "Aprovar vaga" : "Reprovar vaga"}
              </h3>
              <p className={`text-xs ${isApprove ? "text-emerald-700" : "text-red-700"}`}>{job.title} · {job.company}</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Job summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Resumo da vaga</p>
            {[
              { label: "Título", value: job.title },
              { label: "Empresa", value: job.company },
              { label: "Setor", value: job.sector },
              { label: "Localização", value: `${job.neighborhood}, ${job.city}` },
              { label: "Contrato", value: job.contractType },
              { label: "Salário", value: job.salaryRange || "A combinar" },
            ].map((item) => (
              <div key={item.label} className="flex gap-2 text-xs">
                <span className="text-gray-400 w-20 shrink-0">{item.label}:</span>
                <span className="text-gray-800 font-medium">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Description preview */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Descrição</p>
            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3">{job.description}</p>
          </div>

          {/* Rejection reason */}
          {!isApprove && (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Motivo da reprovação <span className="text-red-400">*</span>
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Descreva o motivo para a empresa corrigir e reenviar..."
                rows={3}
                maxLength={300}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-red-400 resize-none"
              />
            </div>
          )}

          {/* Email preview */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Email automático para {job.companyEmail}</p>
            <pre className="text-xs text-gray-600 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap font-sans leading-relaxed">{emailPreview}</pre>
          </div>

          {isApprove && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
              <p className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                <i className="ri-information-line text-emerald-600"></i>
                A vaga será publicada imediatamente no site público e a empresa receberá email de confirmação.
              </p>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl text-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={(!isApprove && !motivo) || loading}
            className={`flex-1 font-bold py-2.5 rounded-xl text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
              isApprove ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {loading ? (
              <><i className="ri-loader-4-line animate-spin text-sm"></i>{isApprove ? "Aprovando..." : "Reprovando..."}</>
            ) : (
              <><i className={`${isApprove ? "ri-checkbox-circle-line" : "ri-close-circle-line"} text-sm`}></i>{isApprove ? "Aprovar e publicar" : "Reprovar vaga"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminJobs() {
  const [jobs, setJobs] = useState<AdminJob[]>(mockAdminJobs);
  const [filterSector, setFilterSector] = useState("Todos");
  const [filterContract, setFilterContract] = useState("Todos");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const [selected, setSelected] = useState<string | null>(null);
  const [approvalModal, setApprovalModal] = useState<{ job: AdminJob; action: "approve" | "reject" } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const pendingCount = jobs.filter((j) => j.status === "pendente").length;

  const filtered = jobs.filter((j) => {
    const matchTab = activeTab === "todos" || j.status === activeTab;
    const matchSector = filterSector === "Todos" || j.sector === filterSector;
    const matchContract = filterContract === "Todos" || j.contractType === filterContract;
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSector && matchContract && matchSearch;
  });

  const selectedJob = jobs.find((j) => j.id === selected) || null;

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleConfirmApproval = async (action: "approve" | "reject", motivo?: string) => {
    if (!approvalModal) return;
    const { job } = approvalModal;

    // Send email notification
    await sendEmailNotification({
      type: action === "approve" ? "job_approved" : "job_rejected",
      to: job.companyEmail,
      companyName: job.company,
      jobTitle: job.title,
      motivo: action === "reject" ? motivo : undefined,
      loginUrl: "https://vagasoeste.com.br/empresa/dashboard",
    });

    setJobs((prev) =>
      prev.map((j) =>
        j.id === job.id
          ? { ...j, status: action === "approve" ? "ativa" : "encerrada", publishedAt: new Date().toISOString().split("T")[0] }
          : j
      )
    );
    setApprovalModal(null);
    setSelected(null);
    if (action === "approve") {
      showToast(`Vaga "${job.title}" aprovada e publicada! Email enviado para ${job.companyEmail}.`, "success");
    } else {
      showToast(`Vaga "${job.title}" reprovada. Email com motivo enviado para ${job.companyEmail}.`, "error");
    }
  };

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm px-5 py-4 rounded-xl text-sm font-medium flex items-start gap-3 ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}>
          <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
            <i className={`${toast.type === "success" ? "ri-checkbox-circle-line" : "ri-close-circle-line"} text-base`}></i>
          </div>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Vagas</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {jobs.length} vagas · {pendingCount > 0 && (
              <span className="text-orange-600 font-semibold">{pendingCount} pendente{pendingCount !== 1 ? "s" : ""} de aprovação</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg">
            {jobs.filter((j) => j.status === "ativa").length} ativas
          </span>
        </div>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
            <i className="ri-time-line text-orange-600 text-base"></i>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-orange-900 text-sm mb-0.5">
              {pendingCount} vaga{pendingCount !== 1 ? "s" : ""} aguardando aprovação
            </p>
            <p className="text-orange-700 text-xs leading-relaxed">
              Vagas cadastradas por empresas em pré-cadastro. Após aprovação, ficam disponíveis no site público e a empresa recebe email de confirmação.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("pendente")}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors whitespace-nowrap"
          >
            Ver pendentes
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total", value: jobs.length, color: "text-gray-700", bg: "bg-gray-50" },
          { label: "Ativas", value: jobs.filter((j) => j.status === "ativa").length, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pendentes", value: pendingCount, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Candidatos", value: jobs.reduce((acc, j) => acc + j.candidates, 0), color: "text-sky-600", bg: "bg-sky-50" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 w-fit flex-wrap">
        {TABS.map((tab) => {
          const count = tab.id === "todos" ? jobs.length : jobs.filter((j) => j.status === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                activeTab === tab.id ? "bg-white text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  tab.id === "pendente" && count > 0
                    ? "bg-orange-500 text-white"
                    : activeTab === tab.id
                    ? "bg-gray-100 text-gray-600"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-gray-400 text-xs"></i>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Título ou empresa..."
                className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400"
              />
            </div>
          </div>
          <div>
            <select value={filterSector} onChange={(e) => setFilterSector(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer">
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <select value={filterContract} onChange={(e) => setFilterContract(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer">
              {CONTRACT_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {filtered.length} vaga{filtered.length !== 1 ? "s" : ""}
          </p>

          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <i className="ri-briefcase-line text-gray-300 text-3xl"></i>
              </div>
              <p className="text-gray-400 text-sm">Nenhuma vaga encontrada</p>
            </div>
          )}

          {filtered.map((job, idx) => (
            <AnimatedSection key={job.id} variant="fade-up" delay={(idx % 6) * 60}>
            <div
              onClick={() => setSelected(job.id === selected ? null : job.id)}
              className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
                selected === job.id ? "border-emerald-500" : "border-gray-100 hover:border-emerald-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{job.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{job.company} · Setor {job.sector}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0 ${STATUS_CONFIG[job.status].color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[job.status].dot}`}></span>
                  {STATUS_CONFIG[job.status].label}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500 mb-3">
                <span><i className="ri-map-pin-line mr-1 text-emerald-500"></i>{job.neighborhood}</span>
                <span><i className="ri-file-text-line mr-1 text-emerald-500"></i>{job.contractType}</span>
                <span><i className="ri-user-line mr-1 text-emerald-500"></i>{job.candidates} candidatos</span>
                {job.salaryRange && <span className="font-medium text-gray-700">{job.salaryRange}</span>}
              </div>

              {/* Pending actions */}
              {job.status === "pendente" && (
                <div className="flex gap-2 pt-3 border-t border-gray-50">
                  <button
                    onClick={(e) => { e.stopPropagation(); setApprovalModal({ job, action: "approve" }); }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <i className="ri-checkbox-circle-line text-sm"></i>
                    Aprovar e publicar
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setApprovalModal({ job, action: "reject" }); }}
                    className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <i className="ri-close-circle-line text-sm"></i>
                    Reprovar
                  </button>
                </div>
              )}
            </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Detail */}
        <div>
          {selectedJob ? (
            <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-sm">{selectedJob.title}</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CONFIG[selectedJob.status].color}`}>
                  {STATUS_CONFIG[selectedJob.status].label}
                </span>
              </div>

              <div className="space-y-2.5 mb-4">
                {[
                  { label: "Empresa", value: selectedJob.company, icon: "ri-building-line" },
                  { label: "Setor", value: selectedJob.sector, icon: "ri-building-2-line" },
                  { label: "Localização", value: `${selectedJob.neighborhood}, ${selectedJob.city}`, icon: "ri-map-pin-line" },
                  { label: "Contrato", value: selectedJob.contractType, icon: "ri-file-text-line" },
                  { label: "Salário", value: selectedJob.salaryRange || "A combinar", icon: "ri-money-dollar-circle-line" },
                  { label: "Publicada em", value: selectedJob.publishedAt, icon: "ri-calendar-line" },
                  { label: "Candidatos", value: `${selectedJob.candidates} inscritos`, icon: "ri-user-line" },
                  { label: "Email empresa", value: selectedJob.companyEmail, icon: "ri-mail-line" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <div className="w-5 h-5 flex items-center justify-center mt-0.5 shrink-0">
                      <i className={`${item.icon} text-emerald-500 text-xs`}></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="text-sm text-gray-800 font-medium break-words">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedJob.description && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 mb-1">Descrição</p>
                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3">{selectedJob.description}</p>
                </div>
              )}

              {selectedJob.status === "pendente" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setApprovalModal({ job: selectedJob, action: "approve" })}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <i className="ri-checkbox-circle-line text-sm"></i>
                    Aprovar
                  </button>
                  <button
                    onClick={() => setApprovalModal({ job: selectedJob, action: "reject" })}
                    className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <i className="ri-close-circle-line text-sm"></i>
                    Reprovar
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button className="flex-1 border border-gray-200 text-gray-600 font-medium py-2 rounded-lg text-xs cursor-pointer hover:bg-gray-50 whitespace-nowrap">
                    <i className="ri-pause-line mr-1"></i>Pausar
                  </button>
                  <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-xs cursor-pointer whitespace-nowrap">
                    <i className="ri-eye-line mr-1"></i>Candidatos
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center sticky top-20">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <i className="ri-briefcase-line text-gray-300 text-3xl"></i>
              </div>
              <p className="text-gray-400 text-sm">Selecione uma vaga para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {approvalModal && (
        <JobApprovalModal
          job={approvalModal.job}
          action={approvalModal.action}
          onConfirm={handleConfirmApproval}
          onClose={() => setApprovalModal(null)}
        />
      )}
    </div>
  );
}
