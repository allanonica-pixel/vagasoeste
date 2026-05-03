import { useState } from "react";
import { AdminCompany, AdminJob } from "@/mocks/adminData";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ativo: { label: "Ativo", color: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400" },
  inativo: { label: "Inativo", color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" },
  pendente: { label: "Pendente", color: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400" },
  rejeitado: { label: "Rejeitado", color: "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400" },
};

const JOB_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ativa: { label: "Ativa", color: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400" },
  pausada: { label: "Pausada", color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" },
  encerrada: { label: "Encerrada", color: "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400" },
  pendente: { label: "Pendente", color: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400" },
};

const PLANO_CONFIG: Record<string, { label: string; color: string }> = {
  basico: { label: "Básico", color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" },
  profissional: { label: "Profissional", color: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400" },
  enterprise: { label: "Enterprise", color: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400" },
};

interface CompanyDetailPanelProps {
  company: AdminCompany;
  jobs: AdminJob[];
  onApprove: () => void;
  onReject: () => void;
}

export default function CompanyDetailPanel({ company, jobs, onApprove, onReject }: CompanyDetailPanelProps) {
  const [showPassword, setShowPassword] = useState(false);
  const pendingJobs = jobs.filter((j) => j.status === "pendente");
  const activeJobs = jobs.filter((j) => j.status === "ativa");

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 sticky top-20 overflow-hidden">
      {/* Header */}
      <div className={`p-5 ${company.status === "pendente" ? "bg-amber-50 dark:bg-amber-950 border-b border-amber-100 dark:border-amber-900" : "border-b border-gray-100 dark:border-gray-800"}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            company.status === "pendente" ? "bg-amber-100 dark:bg-amber-900" : company.status === "rejeitado" ? "bg-red-100 dark:bg-red-900" : "bg-emerald-100 dark:bg-emerald-900"
          }`}>
            <i className={`ri-building-line text-xl ${
              company.status === "pendente" ? "text-amber-600" : company.status === "rejeitado" ? "text-red-500" : "text-emerald-600"
            }`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">{company.name}</p>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CONFIG[company.status].color}`}>
                {STATUS_CONFIG[company.status].label}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PLANO_CONFIG[company.plano].color}`}>
                {PLANO_CONFIG[company.plano].label}
              </span>
              {company.senhaProvisoria && (
                <span className="text-xs bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full">
                  Senha provisória
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Pending actions */}
        {company.status === "pendente" && (
          <div className="flex gap-2">
            <button
              onClick={onApprove}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <i className="ri-checkbox-circle-line text-sm"></i>
              Aprovar
            </button>
            <button
              onClick={onReject}
              className="flex-1 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <i className="ri-close-circle-line text-sm"></i>
              Rejeitar
            </button>
          </div>
        )}
      </div>

      <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
        {/* Company Info */}
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Dados da empresa</p>
          <div className="space-y-2.5">
            {[
              { icon: "ri-file-text-line", label: "CNPJ", value: company.cnpj },
              { icon: "ri-building-2-line", label: "Razão Social", value: company.razaoSocial },
              { icon: "ri-store-line", label: "Setor", value: company.sector },
              { icon: "ri-map-pin-line", label: "Endereço", value: `${company.endereco}, ${company.neighborhood}, ${company.city}` },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2.5">
                <div className="w-5 h-5 flex items-center justify-center mt-0.5 shrink-0">
                  <i className={`${item.icon} text-emerald-500 text-xs`}></i>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 dark:text-gray-500">{item.label}</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium break-words">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Responsável</p>
          <div className="space-y-2.5">
            {[
              { icon: "ri-user-line", label: "Nome", value: `${company.contactName} · ${company.contactRole}` },
              { icon: "ri-mail-line", label: "Email", value: company.email },
              { icon: "ri-phone-line", label: "Telefone", value: company.phone },
              { icon: "ri-whatsapp-line", label: "WhatsApp", value: company.whatsapp || "Não informado" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2.5">
                <div className="w-5 h-5 flex items-center justify-center mt-0.5 shrink-0">
                  <i className={`${item.icon} text-emerald-500 text-xs`}></i>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 dark:text-gray-500">{item.label}</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium break-words">{item.value}</p>
                </div>
              </div>
            ))}
            {company.status === "pendente" && company.contactPassword && (
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 flex items-center justify-center mt-0.5 shrink-0">
                  <i className="ri-lock-password-line text-emerald-500 text-xs"></i>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400 dark:text-gray-500">Senha definida</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium font-mono tracking-wide">
                      {showPassword ? company.contactPassword : "••••••••"}
                    </p>
                    <button
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                      title={showPassword ? "Ocultar senha" : "Revelar senha"}
                    >
                      <i className={`${showPassword ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Cadastro em</span>
            <span className="text-gray-800 dark:text-gray-200 font-medium">{company.registeredAt}</span>
          </div>
          {company.validadoEm && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Validado em</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">{company.validadoEm}</span>
            </div>
          )}
          {company.motivoRejeicao && (
            <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Motivo da rejeição</p>
              <p className="text-xs text-red-600 dark:text-red-400">{company.motivoRejeicao}</p>
            </div>
          )}
        </div>

        {/* Jobs */}
        {jobs.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
              Vagas ({jobs.length})
            </p>
            <div className="space-y-2">
              {jobs.map((job) => (
                <div key={job.id} className="border border-gray-100 dark:border-gray-800 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-xs leading-snug">{job.title}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${JOB_STATUS_CONFIG[job.status].color}`}>
                      {JOB_STATUS_CONFIG[job.status].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                    <span>{job.contractType}</span>
                    <span>·</span>
                    <span>{job.neighborhood}</span>
                    {job.salaryRange && (
                      <>
                        <span>·</span>
                        <span>{job.salaryRange}</span>
                      </>
                    )}
                  </div>
                  {job.status === "pendente" && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <i className="ri-time-line text-xs"></i>
                      Aguardando aprovação da empresa
                    </p>
                  )}
                </div>
              ))}
            </div>

            {pendingJobs.length > 0 && company.status === "pendente" && (
              <div className="mt-3 bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-xl p-3">
                <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                  <i className="ri-information-line mr-1"></i>
                  {pendingJobs.length} vaga{pendingJobs.length !== 1 ? "s" : ""} será{pendingJobs.length !== 1 ? "ão" : ""} publicada{pendingJobs.length !== 1 ? "s" : ""} automaticamente após aprovação do cadastro.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick actions */}
        {company.status === "ativo" && (
          <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <a
              href={`mailto:${company.email}`}
              className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium py-2 rounded-lg text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <i className="ri-mail-line text-xs"></i>
              Enviar email
            </a>
            {company.whatsapp && (
              <a
                href={`https://wa.me/55${company.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <i className="ri-whatsapp-line text-xs"></i>
                WhatsApp
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
