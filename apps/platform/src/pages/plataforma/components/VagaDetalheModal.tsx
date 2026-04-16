import { useState } from "react";

interface Job {
  id: string;
  title: string;
  sector?: string;
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

interface VagaDetalheModalProps {
  job: Job;
  onClose: () => void;
  onApply: (jobId: string) => void;
  alreadyApplied?: boolean;
}

const CONTRACT_COLORS: Record<string, string> = {
  CLT: "bg-emerald-100 text-emerald-700",
  PJ: "bg-amber-100 text-amber-700",
  Freelance: "bg-violet-100 text-violet-700",
  Temporário: "bg-orange-100 text-orange-700",
};

export default function VagaDetalheModal({
  job,
  onClose,
  onApply,
  alreadyApplied = false,
}: VagaDetalheModalProps) {
  const [applied, setApplied] = useState(alreadyApplied);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleApply = () => {
    if (applied) return;
    setShowConfirm(true);
  };

  const confirmApply = () => {
    setShowConfirm(false);
    setApplied(true);
    setShowSuccess(true);
    onApply(job.id);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-100">
              <i className="ri-briefcase-line text-emerald-600 text-sm"></i>
            </div>
            <span className="font-bold text-gray-900 text-sm">Detalhe da Vaga</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <i className="ri-close-line text-gray-500 text-lg"></i>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 py-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CONTRACT_COLORS[job.contractType] || "bg-gray-100 text-gray-600"}`}>
              {job.contractType}
            </span>
            {job.sector && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-700">
                {job.sector}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h2>
          <p className="text-gray-500 text-sm mb-4">{job.area}</p>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-map-pin-line text-emerald-500 text-xs"></i>
                </div>
                <span className="text-xs text-gray-400 font-medium">Localização</span>
              </div>
              <p className="text-gray-800 text-sm font-semibold">{job.neighborhood}</p>
              <p className="text-gray-500 text-xs">{job.city}, {job.state}</p>
            </div>
            {job.salaryRange && (
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-money-dollar-circle-line text-emerald-500 text-xs"></i>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Salário</span>
                </div>
                <p className="text-gray-800 text-sm font-semibold">{job.salaryRange}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-5">
            <h3 className="font-bold text-gray-900 text-sm mb-2">Sobre a vaga</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{job.description}</p>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="mb-5">
              <h3 className="font-bold text-gray-900 text-sm mb-2">Requisitos</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{job.requirements}</p>
            </div>
          )}

          {/* Tags */}
          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {job.tags.map((tag) => (
                <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Privacy Notice */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-2">
            <div className="w-4 h-4 flex items-center justify-center mt-0.5 shrink-0">
              <i className="ri-shield-check-line text-emerald-600 text-xs"></i>
            </div>
            <p className="text-emerald-700 text-xs leading-relaxed">
              <strong>Processo anônimo e seguro:</strong> Seu nome, email e telefone nunca são revelados à empresa. A VagasOeste intermediará todo o contato.
            </p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          {showSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-checkbox-circle-line text-emerald-600 text-base"></i>
              </div>
              <p className="text-emerald-700 text-sm font-semibold">Candidatura enviada com sucesso!</p>
            </div>
          ) : applied ? (
            <div className="flex items-center gap-2 justify-center py-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-checkbox-circle-line text-emerald-500 text-base"></i>
              </div>
              <span className="text-emerald-600 font-semibold text-sm">Você já se candidatou a esta vaga</span>
            </div>
          ) : (
            <button
              onClick={handleApply}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-send-plane-line text-base"></i>
              </div>
              Quero me Candidatar!
            </button>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 bg-emerald-100 rounded-full">
              <i className="ri-briefcase-line text-emerald-600 text-xl"></i>
            </div>
            <h3 className="font-bold text-gray-900 text-center text-lg mb-2">Confirmar candidatura?</h3>
            <p className="text-gray-500 text-sm text-center mb-1">
              <strong>{job.title}</strong>
            </p>
            <p className="text-gray-400 text-xs text-center mb-5">
              {job.neighborhood}, {job.city} · {job.contractType}
            </p>
            <div className="bg-emerald-50 rounded-xl p-3 mb-5">
              <p className="text-emerald-700 text-xs text-center leading-relaxed">
                Após a candidatura, a equipe VagasOeste analisará seu perfil e entrará em contato pelo WhatsApp.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm cursor-pointer hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmApply}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm cursor-pointer"
              >
                Confirmar!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
