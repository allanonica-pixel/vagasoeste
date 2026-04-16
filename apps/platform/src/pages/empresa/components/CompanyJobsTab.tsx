import { useState } from "react";
import { CompanyJob, mockCompanyJobs } from "@/mocks/companyJobs";
import JobFormModal from "./JobFormModal";

const CONTRACT_COLORS: Record<string, string> = {
  CLT: "bg-emerald-100 text-emerald-700",
  PJ: "bg-amber-100 text-amber-700",
  Freelance: "bg-violet-100 text-violet-700",
  Temporário: "bg-orange-100 text-orange-700",
  Estágio: "bg-sky-100 text-sky-700",
};

export default function CompanyJobsTab() {
  const [jobs, setJobs] = useState<CompanyJob[]>(mockCompanyJobs);
  const [showModal, setShowModal] = useState(false);
  const [editJob, setEditJob] = useState<CompanyJob | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSave = (job: CompanyJob) => {
    if (editJob) {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? job : j)));
      setSuccessMsg("Vaga atualizada com sucesso!");
    } else {
      setJobs((prev) => [job, ...prev]);
      setSuccessMsg("Vaga publicada com sucesso! Candidatos já podem se candidatar.");
    }
    setShowModal(false);
    setEditJob(null);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleToggleActive = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, isActive: !j.isActive } : j))
    );
  };

  const handleDelete = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setConfirmDelete(null);
    setSuccessMsg("Vaga removida.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const openEdit = (job: CompanyJob) => {
    setEditJob(job);
    setShowModal(true);
  };

  const openNew = () => {
    setEditJob(null);
    setShowModal(true);
  };

  const activeJobs = jobs.filter((j) => j.isActive);
  const inactiveJobs = jobs.filter((j) => !j.isActive);

  return (
    <div>
      {/* Success Toast */}
      {successMsg && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-checkbox-circle-line text-emerald-600"></i>
          </div>
          {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-gray-700">
            <strong className="text-gray-900">{activeJobs.length}</strong> vaga{activeJobs.length !== 1 ? "s" : ""} ativa{activeJobs.length !== 1 ? "s" : ""}
            {inactiveJobs.length > 0 && (
              <span className="text-gray-600"> · {inactiveJobs.length} pausada{inactiveJobs.length !== 1 ? "s" : ""}</span>
            )}
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-colors whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-add-line text-sm"></i>
          </div>
          Publicar Nova Vaga
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 mb-5 flex items-start gap-3">
        <div className="w-5 h-5 flex items-center justify-center mt-0.5">
          <i className="ri-information-line text-sky-500 text-sm"></i>
        </div>
        <p className="text-sky-800 text-xs leading-relaxed">
          O <strong>Setor</strong> que você define aqui aparece automaticamente ao lado do título da vaga no site público, ajudando os candidatos a identificar a área de atuação sem revelar a identidade da empresa.
        </p>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4">
            <i className="ri-briefcase-line text-gray-200 text-4xl"></i>
          </div>
          <h3 className="text-gray-500 font-semibold mb-2">Nenhuma vaga publicada</h3>
          <p className="text-gray-400 text-sm mb-5">Publique sua primeira vaga e comece a receber candidatos!</p>
          <button
            onClick={openNew}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm cursor-pointer transition-colors"
          >
            Publicar Primeira Vaga
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className={`bg-white rounded-xl border-2 p-5 transition-all ${
                job.isActive ? "border-gray-100" : "border-gray-100 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title + badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-gray-900 text-base">{job.title}</h3>
                    {!job.isActive && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Pausada</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <i className="ri-building-line text-xs"></i>
                      Setor {job.sector}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${CONTRACT_COLORS[job.contractType] || "bg-gray-100 text-gray-600"}`}>
                      {job.contractType}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                      {job.workMode}
                    </span>
                  </div>

                  {/* Details row */}
                  <div className="flex items-center gap-4 flex-wrap text-xs text-gray-700">
                    <span className="flex items-center gap-1">
                      <i className="ri-map-pin-line text-emerald-500"></i>
                      {job.neighborhood}, {job.city}
                    </span>
                    {job.salaryRange && (
                      <span className="flex items-center gap-1 font-medium">
                        <i className="ri-money-dollar-circle-line text-emerald-500"></i>
                        {job.salaryRange}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <i className="ri-user-line text-emerald-500"></i>
                      {job.vacancies} vaga{job.vacancies !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-calendar-line text-gray-400"></i>
                      Publicada em {new Date(job.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>

                {/* Applicants + Actions */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{job.applicantsCount}</p>
                    <p className="text-xs text-gray-400">candidato{job.applicantsCount !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(job.id)}
                      title={job.isActive ? "Pausar vaga" : "Reativar vaga"}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg border cursor-pointer transition-colors ${
                        job.isActive
                          ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                          : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      <i className={`text-sm ${job.isActive ? "ri-pause-line" : "ri-play-line"}`}></i>
                    </button>
                    <button
                      onClick={() => openEdit(job)}
                      title="Editar vaga"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <i className="ri-edit-line text-sm"></i>
                    </button>
                    <button
                      onClick={() => setConfirmDelete(job.id)}
                      title="Excluir vaga"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 cursor-pointer transition-colors"
                    >
                      <i className="ri-delete-bin-line text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Description preview */}
              {job.description && (
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <p className="text-xs text-gray-700 line-clamp-2">{job.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 bg-red-50 rounded-full">
              <i className="ri-delete-bin-line text-red-500 text-xl"></i>
            </div>
            <h3 className="text-gray-900 font-bold text-center mb-2">Excluir vaga?</h3>
            <p className="text-gray-700 text-sm text-center mb-5">
              Esta ação não pode ser desfeita. Os candidatos desta vaga serão notificados pelo VagasOeste.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showModal && (
        <JobFormModal
          onClose={() => { setShowModal(false); setEditJob(null); }}
          onSave={handleSave}
          editJob={editJob}
        />
      )}
    </div>
  );
}
