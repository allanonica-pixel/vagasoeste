import { useState } from "react";

type NotifChannel = "whatsapp" | "email" | "both";
type NotifStatus = "unread" | "read";

interface Notification {
  id: string;
  type: "status_change" | "pre_interview" | "contact" | "approved" | "rejected" | "hired";
  title: string;
  message: string;
  jobTitle: string;
  date: string;
  time: string;
  channel: NotifChannel;
  status: NotifStatus;
}

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  status_change: { icon: "ri-refresh-line", color: "text-amber-600", bg: "bg-amber-50", label: "Atualização de status" },
  pre_interview: { icon: "ri-calendar-check-line", color: "text-sky-600", bg: "bg-sky-50", label: "Pré-entrevista" },
  contact: { icon: "ri-phone-line", color: "text-violet-600", bg: "bg-violet-50", label: "Solicitação de contato" },
  approved: { icon: "ri-checkbox-circle-line", color: "text-emerald-600", bg: "bg-emerald-50", label: "Aprovado" },
  rejected: { icon: "ri-close-circle-line", color: "text-red-500", bg: "bg-red-50", label: "Reprovado" },
  hired: { icon: "ri-trophy-line", color: "text-teal-600", bg: "bg-teal-50", label: "Contratado" },
};

// Notificações serão carregadas de admin_notifications no futuro.
// Por enquanto, o sistema começa com lista vazia — notificações reais chegam
// via WhatsApp e email quando o status da candidatura muda.

const CHANNEL_LABELS: Record<NotifChannel, { icon: string; label: string }> = {
  whatsapp: { icon: "ri-whatsapp-line", label: "WhatsApp" },
  email: { icon: "ri-mail-line", label: "Email" },
  both: { icon: "ri-notification-line", label: "WhatsApp + Email" },
};

export default function NotificacoesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [showSettings, setShowSettings] = useState(false);

  // Notification preferences
  const [prefWhatsapp, setPrefWhatsapp] = useState(true);
  const [prefEmail, setPrefEmail] = useState(true);
  const [prefStatusChange, setPrefStatusChange] = useState(true);
  const [prefInterview, setPrefInterview] = useState(true);
  const [prefContact, setPrefContact] = useState(true);

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const filtered = notifications.filter((n) => {
    if (filterType === "all") return true;
    if (filterType === "unread") return n.status === "unread";
    return n.type === filterType;
  });

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" as NotifStatus })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, status: "read" as NotifStatus } : n));
  };

  const formatDate = (date: string, time: string) => {
    const [y, m, d] = date.split("-");
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${d} ${months[parseInt(m) - 1]} ${y} às ${time}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Notificações
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">Atualizações sobre suas candidaturas por WhatsApp e email</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-emerald-600 hover:underline cursor-pointer font-medium whitespace-nowrap"
            >
              Marcar todas como lidas
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
              showSettings ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-settings-3-line text-xs"></i>
            </div>
            Preferências
          </button>
        </div>
      </div>

      {/* Preferences Panel */}
      {showSettings && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Preferências de notificação</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Channels */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Canais</p>
              <div className="space-y-3">
                <ToggleRow
                  icon="ri-whatsapp-line"
                  label="WhatsApp"
                  desc="Receber mensagens no WhatsApp cadastrado"
                  value={prefWhatsapp}
                  onChange={setPrefWhatsapp}
                  color="text-emerald-600"
                />
                <ToggleRow
                  icon="ri-mail-line"
                  label="Email"
                  desc="Receber emails no endereço cadastrado"
                  value={prefEmail}
                  onChange={setPrefEmail}
                  color="text-sky-600"
                />
              </div>
            </div>
            {/* Types */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tipos de notificação</p>
              <div className="space-y-3">
                <ToggleRow
                  icon="ri-refresh-line"
                  label="Mudança de status"
                  desc="Quando o status da candidatura mudar"
                  value={prefStatusChange}
                  onChange={setPrefStatusChange}
                  color="text-amber-600"
                />
                <ToggleRow
                  icon="ri-calendar-check-line"
                  label="Pré-entrevista"
                  desc="Quando for selecionado para pré-entrevista"
                  value={prefInterview}
                  onChange={setPrefInterview}
                  color="text-sky-600"
                />
                <ToggleRow
                  icon="ri-phone-line"
                  label="Solicitação de contato"
                  desc="Quando uma empresa quiser falar com você"
                  value={prefContact}
                  onChange={setPrefContact}
                  color="text-violet-600"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => setShowSettings(false)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-lg text-sm cursor-pointer transition-colors whitespace-nowrap"
            >
              Salvar preferências
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-5">
        {[
          { value: "all", label: "Todas" },
          { value: "unread", label: `Não lidas (${unreadCount})` },
          { value: "pre_interview", label: "Pré-entrevista" },
          { value: "contact", label: "Contato" },
          { value: "approved", label: "Aprovado" },
          { value: "status_change", label: "Status" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterType(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
              filterType === f.value
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <i className="ri-notification-off-line text-gray-300 text-3xl"></i>
          </div>
          <p className="text-gray-400 text-sm">Nenhuma notificação encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => {
            const cfg = TYPE_CONFIG[notif.type];
            const channelCfg = CHANNEL_LABELS[notif.channel];
            return (
              <div
                key={notif.id}
                onClick={() => markRead(notif.id)}
                className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-all ${
                  notif.status === "unread"
                    ? "border-emerald-200 bg-emerald-50/20"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    <i className={`${cfg.icon} ${cfg.color} text-lg`}></i>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold text-sm ${notif.status === "unread" ? "text-gray-900" : "text-gray-700"}`}>
                          {notif.title}
                        </p>
                        {notif.status === "unread" && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">{formatDate(notif.date, notif.time)}</span>
                    </div>

                    <p className="text-xs text-gray-500 mb-2">
                      Vaga: <strong className="text-gray-700">{notif.jobTitle}</strong>
                    </p>

                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{notif.message}</p>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <div className="w-3 h-3 flex items-center justify-center">
                          <i className={`${channelCfg.icon} text-xs`}></i>
                        </div>
                        {channelCfg.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info box */}
      <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
        <div className="w-5 h-5 flex items-center justify-center mt-0.5 shrink-0">
          <i className="ri-information-line text-amber-500 text-sm"></i>
        </div>
        <div>
          <p className="text-amber-800 text-sm font-semibold mb-1">Como funcionam as notificações?</p>
          <p className="text-amber-700 text-xs leading-relaxed">
            Sempre que o status de uma candidatura mudar, você será notificado pelo WhatsApp e/ou email cadastrado. As notificações são enviadas pela equipe VagasOeste e nunca revelam o nome da empresa antes da aprovação.
          </p>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  icon, label, desc, value, onChange, color,
}: {
  icon: string;
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 flex items-center justify-center">
          <i className={`${icon} ${color} text-base`}></i>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="text-xs text-gray-400">{desc}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0 ${value ? "bg-emerald-500" : "bg-gray-200"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-5" : "left-0.5"}`}></span>
      </button>
    </div>
  );
}
