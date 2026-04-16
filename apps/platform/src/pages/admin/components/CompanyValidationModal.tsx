import { useState } from "react";
import { AdminCompany } from "@/mocks/adminData";
import { sendEmailNotification } from "@/hooks/useEmailNotification";

interface CompanyValidationModalProps {
  company: AdminCompany;
  action: "approve" | "reject";
  onConfirm: (action: "approve" | "reject", motivo?: string) => void;
  onClose: () => void;
}

const REJECTION_REASONS = [
  "CNPJ inválido ou não encontrado na Receita Federal",
  "Documentação incompleta ou inconsistente",
  "Empresa não atende aos critérios da plataforma",
  "Setor de atuação não compatível com a VagasOeste",
  "Dados de contato inválidos ou não verificáveis",
  "Empresa com restrições cadastrais",
  "Outro motivo",
];

export default function CompanyValidationModal({ company, action, onConfirm, onClose }: CompanyValidationModalProps) {
  const [motivo, setMotivo] = useState("");
  const [motivoCustom, setMotivoCustom] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [sendWhatsapp, setSendWhatsapp] = useState(!!company.whatsapp);
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const isApprove = action === "approve";
  const finalMotivo = motivo === "Outro motivo" ? motivoCustom : motivo;

  const canConfirm = isApprove || (motivo && (motivo !== "Outro motivo" || motivoCustom.length > 5));

  const handleConfirm = async () => {
    setLoading(true);

    if (sendEmail) {
      setEmailStatus("sending");
      const result = await sendEmailNotification({
        type: isApprove ? "company_approved" : "company_rejected",
        to: company.email,
        companyName: company.name,
        contactName: company.contactName,
        cnpj: company.cnpj,
        motivo: isApprove ? undefined : finalMotivo,
        pendingJobs: company.pendingJobs,
        loginUrl: "https://vagasoeste.com.br/login",
      });
      setEmailStatus(result.success ? "sent" : "error");
    }

    setLoading(false);
    onConfirm(action, isApprove ? undefined : finalMotivo);
  };

  // Email preview
  const emailPreview = isApprove
    ? {
        subject: `✅ Cadastro aprovado — Bem-vinda à VagasOeste, ${company.name}!`,
        body: `Olá, ${company.contactName}!\n\nÓtima notícia! O cadastro da empresa ${company.name} (CNPJ: ${company.cnpj}) foi aprovado pela equipe VagasOeste.\n\nA partir de agora:\n• Suas vagas cadastradas já estão disponíveis no site público\n• Candidatos de Santarém e região já podem se candidatar\n• Você pode acessar o painel definitivo com suas credenciais\n\nAcesse: vagasoeste.com.br/empresa/dashboard\n\nQualquer dúvida, entre em contato pelo WhatsApp: (93) 99999-9999\n\nEquipe VagasOeste`,
      }
    : {
        subject: `❌ Pré-cadastro não aprovado — VagasOeste`,
        body: `Olá, ${company.contactName}.\n\nInformamos que o pré-cadastro da empresa ${company.name} (CNPJ: ${company.cnpj}) não foi aprovado pela equipe VagasOeste.\n\nMotivo: ${finalMotivo || "[motivo será preenchido]"}\n\nCaso queira regularizar a situação ou tenha dúvidas, entre em contato com nossa equipe:\n• WhatsApp: (93) 99999-9999\n• Email: contato@vagasoeste.com.br\n\nEquipe VagasOeste`,
      };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 border-b border-gray-100 ${isApprove ? "bg-emerald-50" : "bg-red-50"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isApprove ? "bg-emerald-100" : "bg-red-100"}`}>
              <i className={`text-xl ${isApprove ? "ri-checkbox-circle-line text-emerald-600" : "ri-close-circle-line text-red-600"}`}></i>
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isApprove ? "text-emerald-900" : "text-red-900"}`}>
                {isApprove ? "Aprovar pré-cadastro" : "Rejeitar pré-cadastro"}
              </h2>
              <p className={`text-sm ${isApprove ? "text-emerald-700" : "text-red-700"}`}>
                {company.name} · {company.cnpj}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Company Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resumo do pré-cadastro</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Razão Social", value: company.razaoSocial },
                { label: "Setor", value: company.sector },
                { label: "Responsável", value: `${company.contactName} (${company.contactRole})` },
                { label: "Email", value: company.email },
                { label: "WhatsApp", value: company.whatsapp || "Não informado" },
                { label: "Endereço", value: `${company.neighborhood}, ${company.city}` },
                { label: "Vagas cadastradas", value: `${company.pendingJobs} vaga${company.pendingJobs !== 1 ? "s" : ""} pendente${company.pendingJobs !== 1 ? "s" : ""}` },
                { label: "Data do cadastro", value: company.registeredAt },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm text-gray-800 font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rejection reason */}
          {!isApprove && (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Motivo da rejeição <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2 mb-3">
                {REJECTION_REASONS.map((reason) => (
                  <label key={reason} className="flex items-center gap-2.5 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      motivo === reason ? "border-red-500 bg-red-500" : "border-gray-300 group-hover:border-red-300"
                    }`}>
                      {motivo === reason && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                    <input
                      type="radio"
                      name="motivo"
                      value={reason}
                      checked={motivo === reason}
                      onChange={() => setMotivo(reason)}
                      className="sr-only"
                    />
                    <span className="text-sm text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>
              {motivo === "Outro motivo" && (
                <textarea
                  value={motivoCustom}
                  onChange={(e) => setMotivoCustom(e.target.value)}
                  placeholder="Descreva o motivo da rejeição..."
                  rows={3}
                  maxLength={300}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-red-400 resize-none"
                />
              )}
            </div>
          )}

          {/* Notification options */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Notificações automáticas</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setSendEmail(!sendEmail)}
                  className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${sendEmail ? "bg-emerald-500" : "bg-gray-200"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${sendEmail ? "translate-x-5" : "translate-x-0.5"}`}></div>
                </div>
                <div>
                  <p className="text-sm text-gray-800 font-medium">Enviar email para {company.email}</p>
                  <p className="text-xs text-gray-500">
                    {isApprove ? "Email de boas-vindas com instruções de acesso" : "Email com motivo da rejeição e orientações"}
                  </p>
                </div>
              </label>
              {company.whatsapp && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setSendWhatsapp(!sendWhatsapp)}
                    className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${sendWhatsapp ? "bg-emerald-500" : "bg-gray-200"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${sendWhatsapp ? "translate-x-5" : "translate-x-0.5"}`}></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Notificar via WhatsApp ({company.whatsapp})</p>
                    <p className="text-xs text-gray-500">Mensagem automática pelo WhatsApp Business</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Email Preview */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Prévia do email</p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-700 mb-1">Assunto: {emailPreview.subject}</p>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">{emailPreview.body}</pre>
            </div>
          </div>

          {/* Approve info */}
          {isApprove && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="text-emerald-800 font-semibold text-sm mb-2 flex items-center gap-2">
                <i className="ri-information-line text-emerald-600"></i>
                O que acontece após a aprovação:
              </p>
              <ul className="space-y-1.5">
                {[
                  `As ${company.pendingJobs} vaga${company.pendingJobs !== 1 ? "s" : ""} cadastradas serão publicadas automaticamente no site público`,
                  "A empresa receberá email de boas-vindas com instruções de acesso definitivo",
                  "A senha provisória será mantida até que a empresa a altere no painel",
                  "Candidatos já poderão se candidatar às vagas imediatamente",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-emerald-700">
                    <i className="ri-check-line text-emerald-500 mt-0.5 shrink-0"></i>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            className={`flex-1 font-bold py-3 rounded-xl text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
              isApprove
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line animate-spin text-sm"></i>
                {isApprove ? "Aprovando..." : "Rejeitando..."}
              </>
            ) : (
              <>
                <i className={`${isApprove ? "ri-checkbox-circle-line" : "ri-close-circle-line"} text-sm`}></i>
                {isApprove ? "Confirmar aprovação" : "Confirmar rejeição"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
