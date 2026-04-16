import { useState } from "react";
import { mockAdminNotifications, AdminNotification } from "@/mocks/adminData";
import { useWhatsAppNotification, WHATSAPP_MESSAGE_PREVIEWS, WhatsAppNotificationType } from "@/hooks/useWhatsAppNotification";
import { formatBrazilPhone, isValidBrazilPhone } from "@/hooks/useBrazilPhone";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  enviado: { label: "Enviado", color: "bg-emerald-100 text-emerald-700", icon: "ri-checkbox-circle-line" },
  pendente: { label: "Pendente", color: "bg-amber-100 text-amber-700", icon: "ri-time-line" },
  falhou: { label: "Falhou", color: "bg-red-100 text-red-600", icon: "ri-close-circle-line" },
};

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  new_candidate: { label: "Novo Candidato", color: "bg-sky-100 text-sky-700", icon: "ri-user-add-line" },
  pre_interview: { label: "Pré-entrevista", color: "bg-amber-100 text-amber-700", icon: "ri-calendar-check-line" },
  contact_request: { label: "Solicitação de Contato", color: "bg-violet-100 text-violet-700", icon: "ri-phone-line" },
  company_approved: { label: "Empresa Aprovada", color: "bg-emerald-100 text-emerald-700", icon: "ri-checkbox-circle-line" },
  company_rejected: { label: "Empresa Rejeitada", color: "bg-red-100 text-red-600", icon: "ri-close-circle-line" },
  job_approved: { label: "Vaga Aprovada", color: "bg-emerald-100 text-emerald-700", icon: "ri-briefcase-line" },
  job_rejected: { label: "Vaga Reprovada", color: "bg-red-100 text-red-600", icon: "ri-briefcase-line" },
  status_update: { label: "Atualização de Status", color: "bg-gray-100 text-gray-700", icon: "ri-refresh-line" },
};

interface ComposeForm {
  recipientType: "empresa" | "candidato";
  recipientEmail: string;
  recipientWhatsapp: string;
  recipientName: string;
  type: AdminNotification["type"];
  jobTitle: string;
  companyName: string;
  customMessage: string;
  motivo: string;
  sendWhatsapp: boolean;
  sendEmail: boolean;
}

const DEFAULT_MESSAGES: Record<string, { subject: string; message: string }> = {
  new_candidate: {
    subject: "Novo candidato para a vaga: {jobTitle}",
    message: "Olá! Informamos que um novo candidato se inscreveu para a vaga de {jobTitle}. Acesse a plataforma VagasOeste para visualizar o perfil. Nenhum dado pessoal do candidato é compartilhado neste momento.",
  },
  pre_interview: {
    subject: "Você foi selecionado para pré-entrevista!",
    message: "Parabéns! Você foi selecionado para uma pré-entrevista para a vaga de {jobTitle} em {companyName}. Nossa equipe entrará em contato em breve pelo WhatsApp para agendar.",
  },
  contact_request: {
    subject: "Uma empresa quer entrar em contato com você!",
    message: "Boa notícia! Uma empresa parceira da VagasOeste demonstrou interesse no seu perfil para a vaga de {jobTitle}. Nossa equipe intermediará o contato em breve.",
  },
  company_approved: {
    subject: "Cadastro aprovado — VagasOeste",
    message: "Parabéns! O cadastro de {companyName} foi aprovado pela equipe VagasOeste. Suas vagas já estão visíveis no site público.",
  },
  company_rejected: {
    subject: "Cadastro não aprovado — VagasOeste",
    message: "Infelizmente o cadastro de {companyName} não foi aprovado. Entre em contato com nossa equipe para mais informações.",
  },
  job_approved: {
    subject: "Vaga aprovada e publicada — VagasOeste",
    message: "A vaga de {jobTitle} foi aprovada e já está publicada no site público. Candidatos já podem se inscrever.",
  },
  job_rejected: {
    subject: "Vaga reprovada — VagasOeste",
    message: "A vaga de {jobTitle} foi reprovada. Corrija as informações e reenvie pelo painel.",
  },
};

type ActiveTab = "historico" | "whatsapp";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>(mockAdminNotifications);
  const [showCompose, setShowCompose] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("historico");
  const [sending, setSending] = useState(false);

  const { sendWhatsApp, getPreview } = useWhatsAppNotification();

  const [form, setForm] = useState<ComposeForm>({
    recipientType: "empresa",
    recipientEmail: "",
    recipientWhatsapp: "",
    recipientName: "",
    type: "new_candidate",
    jobTitle: "",
    companyName: "",
    customMessage: "",
    motivo: "",
    sendWhatsapp: false,
    sendEmail: true,
  });

  const filtered = notifications.filter((n) => {
    const matchType = filterType === "all" || n.type === filterType;
    const matchStatus = filterStatus === "all" || n.status === filterStatus;
    return matchType && matchStatus;
  });

  const selectedNotif = notifications.find((n) => n.id === selected) || null;

  const getDefaultMessage = () => {
    const tmpl = DEFAULT_MESSAGES[form.type] || DEFAULT_MESSAGES.new_candidate;
    return {
      subject: tmpl.subject.replace("{jobTitle}", form.jobTitle || "[Título da Vaga]"),
      message: tmpl.message
        .replace("{jobTitle}", form.jobTitle || "[Título da Vaga]")
        .replace("{companyName}", form.companyName || "[Empresa]"),
    };
  };

  const getWhatsAppPreview = () => {
    return getPreview({
      type: form.type as WhatsAppNotificationType,
      recipientPhone: form.recipientWhatsapp,
      recipientName: form.recipientName,
      jobTitle: form.jobTitle,
      companyName: form.companyName,
      motivo: form.motivo,
      customMessage: form.customMessage || undefined,
    });
  };

  const handleSend = async () => {
    setSending(true);
    const { subject, message } = getDefaultMessage();

    // Envia WhatsApp se habilitado
    if (form.sendWhatsapp && form.recipientWhatsapp) {
      await sendWhatsApp({
        type: form.type as WhatsAppNotificationType,
        recipientPhone: form.recipientWhatsapp.replace(/\D/g, ""),
        recipientName: form.recipientName,
        jobTitle: form.jobTitle,
        companyName: form.companyName,
        motivo: form.motivo,
        customMessage: form.customMessage || undefined,
      });
    }

    const newNotif: AdminNotification = {
      id: `n${Date.now()}`,
      type: form.type,
      recipientType: form.recipientType,
      recipientEmail: form.recipientEmail,
      recipientWhatsapp: form.sendWhatsapp ? form.recipientWhatsapp : undefined,
      subject,
      message: form.customMessage || message,
      sentAt: new Date().toLocaleString("pt-BR"),
      status: "enviado",
      jobTitle: form.jobTitle,
      companyName: form.companyName,
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setShowCompose(false);
    setSending(false);
    setSuccessMsg(
      form.sendWhatsapp
        ? `Notificação enviada por email${form.sendWhatsapp ? " e WhatsApp" : ""}!`
        : "Notificação enviada com sucesso!"
    );
    setTimeout(() => setSuccessMsg(""), 3500);
    setForm({
      recipientType: "empresa",
      recipientEmail: "",
      recipientWhatsapp: "",
      recipientName: "",
      type: "new_candidate",
      jobTitle: "",
      companyName: "",
      customMessage: "",
      motivo: "",
      sendWhatsapp: false,
      sendEmail: true,
    });
  };

  // Stats para o painel WhatsApp
  const whatsappSent = notifications.filter((n) => n.recipientWhatsapp && n.status === "enviado").length;
  const whatsappPending = notifications.filter((n) => n.recipientWhatsapp && n.status === "pendente").length;
  const whatsappFailed = notifications.filter((n) => n.recipientWhatsapp && n.status === "falhou").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Notificações</h2>
          <p className="text-gray-500 text-sm mt-0.5">Gerencie e dispare notificações para empresas e candidatos</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors whitespace-nowrap flex items-center gap-2"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-send-plane-line text-sm"></i>
          </div>
          Nova Notificação
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-checkbox-circle-line text-emerald-600 text-sm"></i>
          </div>
          <p className="text-emerald-700 text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-5">
        {([
          { id: "historico" as ActiveTab, label: "Histórico", icon: "ri-history-line" },
          { id: "whatsapp" as ActiveTab, label: "WhatsApp", icon: "ri-whatsapp-line" },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id ? "bg-white text-gray-900" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className={`${tab.icon} text-xs`}></i>
            </div>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== TAB: HISTÓRICO ===== */}
      {activeTab === "historico" && (
        <>
          {/* Rules Banner */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
            <p className="text-xs font-semibold text-amber-800 mb-2">
              <i className="ri-shield-check-line mr-1"></i>
              Regras de Notificação
            </p>
            <div className="space-y-1">
              <p className="text-xs text-amber-700">
                <strong>Para Empresas:</strong> Apenas informar que há novo candidato + link para a plataforma. Nenhum dado pessoal do candidato é enviado.
              </p>
              <p className="text-xs text-amber-700">
                <strong>Para Candidatos:</strong> Notificação de pré-entrevista ou contato via WhatsApp e Email. Não revelar nome da empresa.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex flex-wrap gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tipo</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer">
                <option value="all">Todos</option>
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer">
                <option value="all">Todos</option>
                <option value="enviado">Enviado</option>
                <option value="pendente">Pendente</option>
                <option value="falhou">Falhou</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* List */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{filtered.length} notificaç{filtered.length !== 1 ? "ões" : "ão"}</p>
              {filtered.map((notif) => {
                const typeCfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.new_candidate;
                const statusCfg = STATUS_CONFIG[notif.status];
                return (
                  <div
                    key={notif.id}
                    onClick={() => setSelected(notif.id)}
                    className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
                      selected === notif.id ? "border-emerald-500" : "border-gray-100 hover:border-emerald-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${typeCfg.color}`}>
                        <i className={`${typeCfg.icon} text-xs`}></i>
                        {typeCfg.label}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${statusCfg.color}`}>
                        <i className={`${statusCfg.icon} text-xs`}></i>
                        {statusCfg.label}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{notif.subject}</p>
                    <p className="text-gray-500 text-xs mt-0.5">Para: {notif.recipientEmail}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400">{notif.sentAt}</span>
                      {notif.recipientWhatsapp && (
                        <span className="text-xs text-emerald-600 flex items-center gap-0.5">
                          <i className="ri-whatsapp-line text-xs"></i>WhatsApp
                        </span>
                      )}
                      <span className="text-xs text-sky-600 flex items-center gap-0.5">
                        <i className="ri-mail-line text-xs"></i>Email
                      </span>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                  <p className="text-gray-400 text-sm">Nenhuma notificação encontrada</p>
                </div>
              )}
            </div>

            {/* Detail */}
            <div>
              {selectedNotif ? (
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Detalhes da Notificação</h3>
                  <div className="space-y-3 mb-4">
                    {[
                      { label: "Tipo", value: TYPE_CONFIG[selectedNotif.type]?.label || selectedNotif.type },
                      { label: "Destinatário", value: selectedNotif.recipientType === "empresa" ? "Empresa" : "Candidato" },
                      { label: "Email", value: selectedNotif.recipientEmail },
                      { label: "WhatsApp", value: selectedNotif.recipientWhatsapp || "Não enviado" },
                      { label: "Vaga", value: selectedNotif.jobTitle || "—" },
                      { label: "Empresa", value: selectedNotif.companyName || "—" },
                      { label: "Enviado em", value: selectedNotif.sentAt },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-2">
                        <span className="text-xs text-gray-400 w-24 shrink-0 pt-0.5">{item.label}:</span>
                        <span className="text-sm text-gray-800 font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Assunto:</p>
                    <p className="text-sm text-gray-800 font-medium mb-3">{selectedNotif.subject}</p>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Mensagem:</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedNotif.message}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                  <div className="w-10 h-10 flex items-center justify-center mx-auto mb-2">
                    <i className="ri-mail-line text-gray-300 text-2xl"></i>
                  </div>
                  <p className="text-gray-400 text-sm">Selecione uma notificação para ver os detalhes</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ===== TAB: WHATSAPP ===== */}
      {activeTab === "whatsapp" && (
        <div className="space-y-5">
          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Enviados", value: whatsappSent, color: "text-emerald-600", bg: "bg-emerald-50", icon: "ri-checkbox-circle-line" },
              { label: "Pendentes", value: whatsappPending, color: "text-amber-600", bg: "bg-amber-50", icon: "ri-time-line" },
              { label: "Falharam", value: whatsappFailed, color: "text-red-600", bg: "bg-red-50", icon: "ri-close-circle-line" },
            ].map((item) => (
              <div key={item.label} className={`${item.bg} rounded-xl p-4 flex items-center gap-3`}>
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white">
                  <i className={`${item.icon} ${item.color} text-lg`}></i>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Integration Banner */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <i className="ri-whatsapp-line text-emerald-600 text-lg"></i>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm mb-0.5">Evolution API — WhatsApp Business</p>
                <p className="text-gray-500 text-xs">Edge Function criada em <code className="bg-gray-100 px-1 rounded text-xs">supabase/functions/send-whatsapp-notification/index.ts</code></p>
              </div>
              <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold whitespace-nowrap">Modo Preview</span>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4">
              <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
                <i className="ri-information-line text-amber-600"></i>
                Para ativar o envio real de WhatsApp:
              </p>
              <ol className="space-y-1.5">
                {[
                  "Conecte o Supabase ao projeto (botão no painel Readdy)",
                  "Configure sua instância Evolution API (self-hosted ou cloud)",
                  "Adicione EVOLUTION_API_URL nos secrets da Edge Function",
                  "Adicione EVOLUTION_API_KEY nos secrets da Edge Function",
                  "Adicione EVOLUTION_INSTANCE (padrão: vagasoeste) nos secrets",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                    <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 font-bold flex items-center justify-center shrink-0 text-xs">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Message Types */}
            <p className="text-xs font-semibold text-gray-600 mb-3">Tipos de mensagem disponíveis:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-white">
                    <i className={`${cfg.icon} text-emerald-500 text-sm`}></i>
                  </div>
                  <span className="text-xs text-gray-700 font-medium">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent WhatsApp notifications */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm font-bold text-gray-900 mb-4">Últimas notificações WhatsApp</p>
            <div className="space-y-3">
              {notifications.filter((n) => n.recipientWhatsapp).slice(0, 5).map((notif) => {
                const typeCfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.new_candidate;
                const statusCfg = STATUS_CONFIG[notif.status];
                return (
                  <div key={notif.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shrink-0">
                      <i className={`${typeCfg.icon} text-emerald-500 text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{notif.subject}</p>
                      <p className="text-xs text-gray-500">{notif.recipientWhatsapp} · {notif.sentAt}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                );
              })}
              {notifications.filter((n) => n.recipientWhatsapp).length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">Nenhuma notificação WhatsApp enviada ainda</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== COMPOSE MODAL ===== */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Nova Notificação</h3>
              <button onClick={() => setShowCompose(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-gray-500 text-lg"></i>
              </button>
            </div>

            <div className="space-y-4">
              {/* Destinatário */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Destinatário</label>
                <div className="flex gap-2">
                  {(["empresa", "candidato"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setForm((f) => ({ ...f, recipientType: type, type: type === "empresa" ? "new_candidate" : "pre_interview" }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors border-2 whitespace-nowrap ${
                        form.recipientType === type ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500"
                      }`}
                    >
                      {type === "empresa" ? "Empresa" : "Candidato"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tipo de Notificação</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AdminNotification["type"] }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer"
                >
                  {form.recipientType === "empresa" ? (
                    <>
                      <option value="new_candidate">Novo Candidato</option>
                      <option value="company_approved">Empresa Aprovada</option>
                      <option value="company_rejected">Empresa Rejeitada</option>
                      <option value="job_approved">Vaga Aprovada</option>
                      <option value="job_rejected">Vaga Reprovada</option>
                    </>
                  ) : (
                    <>
                      <option value="pre_interview">Pré-entrevista</option>
                      <option value="contact_request">Solicitação de Contato</option>
                      <option value="status_update">Atualização de Status</option>
                    </>
                  )}
                </select>
              </div>

              {/* Nome */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome do Destinatário</label>
                <input
                  type="text"
                  value={form.recipientName}
                  onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
                  placeholder="Ex: João Silva / Empresa ABC"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email do Destinatário</label>
                <input
                  type="email"
                  value={form.recipientEmail}
                  onChange={(e) => setForm((f) => ({ ...f, recipientEmail: e.target.value }))}
                  placeholder="email@exemplo.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400"
                />
              </div>

              {/* WhatsApp toggle + campo */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, sendWhatsapp: !f.sendWhatsapp }))}
                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${form.sendWhatsapp ? "bg-emerald-500" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.sendWhatsapp ? "translate-x-5" : "translate-x-0.5"}`}></span>
                  </button>
                  <label className="text-xs font-semibold text-gray-600 cursor-pointer" onClick={() => setForm((f) => ({ ...f, sendWhatsapp: !f.sendWhatsapp }))}>
                    Enviar também pelo WhatsApp
                  </label>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">Evolution API</span>
                </div>
                {form.sendWhatsapp && (
                  <div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                        <i className="ri-whatsapp-line text-gray-400 text-xs"></i>
                      </div>
                      <input
                        type="tel"
                        value={form.recipientWhatsapp}
                        onChange={(e) => setForm((f) => ({ ...f, recipientWhatsapp: formatBrazilPhone(e.target.value) }))}
                        placeholder="(93) 99999-9999"
                        maxLength={15}
                        className={`w-full border rounded-lg pl-8 pr-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 ${
                          form.recipientWhatsapp && !isValidBrazilPhone(form.recipientWhatsapp) ? "border-amber-300" : "border-gray-200"
                        }`}
                      />
                    </div>
                    {form.recipientWhatsapp && !isValidBrazilPhone(form.recipientWhatsapp) && (
                      <p className="text-amber-500 text-xs mt-1 flex items-center gap-1">
                        <i className="ri-error-warning-line"></i>
                        Formato esperado: (XX) XXXXX-XXXX
                      </p>
                    )}
                    {form.recipientWhatsapp && isValidBrazilPhone(form.recipientWhatsapp) && (
                      <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                        <i className="ri-checkbox-circle-line"></i>
                        Número válido
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Título da Vaga</label>
                  <input
                    type="text"
                    value={form.jobTitle}
                    onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
                    placeholder="Ex: Auxiliar Administrativo"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome da Empresa</label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                    placeholder="Ex: Empresa Parceira"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Motivo (para rejected) */}
              {(form.type === "company_rejected" || form.type === "job_rejected") && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Motivo da rejeição</label>
                  <input
                    type="text"
                    value={form.motivo}
                    onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
                    placeholder="Ex: Documentação incompleta"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400"
                  />
                </div>
              )}

              {/* Preview Email */}
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-sky-700 mb-2 flex items-center gap-1.5">
                  <i className="ri-mail-line text-sky-500"></i>
                  Prévia do Email
                </p>
                <p className="text-xs font-semibold text-gray-700 mb-1">{getDefaultMessage().subject}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{getDefaultMessage().message}</p>
              </div>

              {/* Preview WhatsApp */}
              {form.sendWhatsapp && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1.5">
                    <i className="ri-whatsapp-line text-emerald-500"></i>
                    Prévia do WhatsApp
                  </p>
                  <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{getWhatsAppPreview()}</pre>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Mensagem personalizada (opcional)</label>
                <textarea
                  value={form.customMessage}
                  onChange={(e) => setForm((f) => ({ ...f, customMessage: e.target.value }))}
                  rows={3}
                  maxLength={500}
                  placeholder="Deixe em branco para usar a mensagem padrão..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-0.5">{form.customMessage.length}/500</p>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCompose(false)} className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg text-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap">
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={!form.recipientEmail || !form.jobTitle || sending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-sm"></i>
                    Enviando...
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-line text-sm"></i>
                    Enviar{form.sendWhatsapp ? " (Email + WhatsApp)" : " Notificação"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
