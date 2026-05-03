import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/base/AnimatedSection";
import AdminCompanies from "./components/AdminCompanies";
import AdminCandidates from "./components/AdminCandidates";
import AdminJobs from "./components/AdminJobs";
import AdminReports from "./components/AdminReports";
import AdminNotifications from "./components/AdminNotifications";
import AdminSettings from "./components/AdminSettings";
import AdminAuditoria from "./components/AdminAuditoria";
import { supabase } from "@/lib/supabase";
import { AdminNotification } from "@/mocks/adminData";
import { useAdminTheme } from "@/hooks/useAdminTheme";
import { formatDateTimeBR } from "@/utils/date";

type AdminSection = "dashboard" | "empresas" | "candidatos" | "vagas" | "relatorios" | "notificacoes" | "configuracoes" | "auditoria";

interface AdminStats {
  totalCandidates:   number;
  activeCompanies:   number;
  activeJobs:        number;
  pendingCompanies:  number;
  pendingJobs:       number;
  pendingNotifs:     number;
  recentNotifs:      AdminNotification[];
}

const EMPTY_STATS: AdminStats = {
  totalCandidates:  0,
  activeCompanies:  0,
  activeJobs:       0,
  pendingCompanies: 0,
  pendingJobs:      0,
  pendingNotifs:    0,
  recentNotifs:     [],
};

// Mapeia linha do admin_notifications → AdminNotification UI
function mapNotifRow(row: Record<string, unknown>): AdminNotification {
  const sentAt = typeof row.sent_at === "string" ? formatDateTimeBR(row.sent_at) : "—";
  return {
    id:                String(row.id),
    type:              row.type as AdminNotification["type"],
    recipientType:     row.recipient_type as "empresa" | "candidato",
    recipientEmail:    String(row.recipient_email ?? ""),
    recipientWhatsapp: row.recipient_whatsapp ? String(row.recipient_whatsapp) : undefined,
    subject:           String(row.subject ?? ""),
    message:           String(row.message ?? ""),
    sentAt,
    status:            row.status as "enviado" | "pendente" | "falhou",
    jobTitle:          row.job_title ? String(row.job_title) : undefined,
    companyName:       String(row.company_name ?? ""),
  };
}

export default function AdminPage() {
  const [section, setSection]         = useState<AdminSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats]             = useState<AdminStats>(EMPTY_STATS);
  const [theme, toggleTheme]          = useAdminTheme();

  const fetchStats = useCallback(async () => {
    // Executa as contagens em paralelo
    const [
      { count: totalCandidates },
      { count: activeCompanies },
      { count: activeJobs },
      { count: pendingCompaniesPreCad },
      { count: pendingJobsCount },
      { count: pendingNotifs },
      { data: recentNotifRows },
    ] = await Promise.all([
      supabase.from("candidates").select("*", { count: "exact", head: true }),
      supabase.from("companies").select("*", { count: "exact", head: true }).eq("status", "ativo"),
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "ativo"),
      supabase.from("empresa_pre_cadastros").select("*", { count: "exact", head: true }).eq("status", "pendente"),
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "pendente"),
      supabase.from("admin_notifications").select("*", { count: "exact", head: true }).eq("status", "pendente"),
      supabase
        .from("admin_notifications")
        .select("id, type, recipient_type, recipient_email, recipient_whatsapp, subject, message, sent_at, status, job_title, company_name")
        .order("sent_at", { ascending: false })
        .limit(3),
    ]);

    setStats({
      totalCandidates:  totalCandidates  ?? 0,
      activeCompanies:  activeCompanies  ?? 0,
      activeJobs:       activeJobs       ?? 0,
      pendingCompanies: pendingCompaniesPreCad ?? 0,
      pendingJobs:      pendingJobsCount ?? 0,
      pendingNotifs:    pendingNotifs    ?? 0,
      recentNotifs:     (recentNotifRows ?? []).map((r) => mapNotifRow(r as Record<string, unknown>)),
    });
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Recarrega stats ao trocar de seção (para refletir alterações feitas nos sub-painéis)
  useEffect(() => {
    if (section === "dashboard") fetchStats();
  }, [section, fetchStats]);

  const NAV_ITEMS: { id: AdminSection; label: string; icon: string; badge?: number; badgeColor?: string }[] = [
    { id: "dashboard",     label: "Dashboard",    icon: "ri-dashboard-line" },
    { id: "empresas",      label: "Empresas",     icon: "ri-building-line",     badge: stats.pendingCompanies > 0 ? stats.pendingCompanies : undefined, badgeColor: "bg-amber-500" },
    { id: "candidatos",    label: "Candidatos",   icon: "ri-user-line",          badge: stats.totalCandidates > 0 ? stats.totalCandidates : undefined },
    { id: "vagas",         label: "Vagas",        icon: "ri-briefcase-line",    badge: stats.pendingJobs > 0 ? stats.pendingJobs : undefined, badgeColor: "bg-orange-500" },
    { id: "relatorios",    label: "Relatórios",   icon: "ri-bar-chart-line" },
    { id: "notificacoes",  label: "Notificações", icon: "ri-notification-line", badge: stats.pendingNotifs > 0 ? stats.pendingNotifs : undefined },
    { id: "auditoria",     label: "Auditoria",    icon: "ri-shield-check-line" },
    { id: "configuracoes", label: "Configurações",icon: "ri-settings-line" },
  ];

  return (
    <div className={`min-h-dvh bg-gray-50 dark:bg-gray-950 flex${theme === "dark" ? " dark" : ""}`}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <i className="ri-admin-line text-white text-xs" aria-hidden="true"></i>
            </div>
            <div>
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100">Vagas<span className="text-emerald-600">Oeste</span></span>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-none">Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => { setSection(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                section === item.id
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <div className="size-5 flex items-center justify-center">
                <i className={`${item.icon} text-sm`} aria-hidden="true"></i>
              </div>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full text-white ${
                  item.badgeColor || (section === item.id ? "bg-emerald-500" : "bg-gray-400 dark:bg-gray-600")
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
              <i className="ri-admin-line text-emerald-600 dark:text-emerald-400 text-sm" aria-hidden="true"></i>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Administrador</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">VagasOeste</p>
            </div>
          </div>
          <Link
            to="/login"
            className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            <div className="size-4 flex items-center justify-center">
              <i className="ri-logout-box-line text-xs" aria-hidden="true"></i>
            </div>
            Sair
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-dvh">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30 h-14 flex items-center px-4 md:px-6 gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
            className="lg:hidden size-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <i className="ri-menu-line text-gray-600 dark:text-gray-400 text-lg" aria-hidden="true"></i>
          </button>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {NAV_ITEMS.find((n) => n.id === section)?.label || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
              className="size-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
            >
              <i className={theme === "dark" ? "ri-sun-line" : "ri-moon-line"} aria-hidden="true"></i>
            </button>
            <Link to="/" className="text-xs text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer whitespace-nowrap px-2">
              <i className="ri-external-link-line mr-1" aria-hidden="true"></i>Ver site
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6">
          {section === "dashboard"    && <AdminDashboard stats={stats} onNavigate={setSection} />}
          {section === "empresas"     && <AdminCompanies />}
          {section === "candidatos"   && <AdminCandidates />}
          {section === "vagas"        && <AdminJobs />}
          {section === "relatorios"   && <AdminReports />}
          {section === "notificacoes" && <AdminNotifications />}
          {section === "auditoria"    && <AdminAuditoria />}
          {section === "configuracoes"&& <AdminSettings />}
        </main>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────────────────────────────────────
const TYPE_ICON: Record<string, { icon: string; bg: string; color: string }> = {
  new_candidate:    { icon: "ri-user-add-line",        bg: "bg-sky-50",    color: "text-sky-600"    },
  pre_interview:    { icon: "ri-calendar-check-line",  bg: "bg-amber-50",  color: "text-amber-600"  },
  contact_request:  { icon: "ri-phone-line",           bg: "bg-violet-50", color: "text-violet-600" },
  company_approved: { icon: "ri-checkbox-circle-line", bg: "bg-emerald-50",color: "text-emerald-600"},
  company_rejected: { icon: "ri-close-circle-line",    bg: "bg-red-50",    color: "text-red-600"    },
  job_approved:     { icon: "ri-briefcase-line",       bg: "bg-emerald-50",color: "text-emerald-600"},
  job_rejected:     { icon: "ri-briefcase-line",       bg: "bg-red-50",    color: "text-red-600"    },
  status_update:    { icon: "ri-refresh-line",         bg: "bg-gray-50",   color: "text-gray-600"   },
};

function AdminDashboard({
  stats,
  onNavigate,
}: {
  stats: AdminStats;
  onNavigate: (s: AdminSection) => void;
}) {
  return (
    <div>
      <AnimatedSection variant="fade-up">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-balance">Bem-vindo ao Painel Admin</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Visão geral do ecossistema VagasOeste</p>
        </div>
      </AnimatedSection>

      {/* Pending Alerts */}
      {(stats.pendingCompanies > 0 || stats.pendingJobs > 0) && (
        <AnimatedSection variant="fade-up" delay={60}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {stats.pendingCompanies > 0 && (
              <button
                type="button"
                onClick={() => onNavigate("empresas")}
                className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-left hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0">
                    <i className="ri-building-line text-amber-600 dark:text-amber-400 text-lg" aria-hidden="true"></i>
                  </div>
                  <div>
                    <p className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                      {stats.pendingCompanies} pré-cadastro{stats.pendingCompanies !== 1 ? "s" : ""} pendente{stats.pendingCompanies !== 1 ? "s" : ""}
                    </p>
                    <p className="text-amber-700 dark:text-amber-400 text-xs">Empresas aguardando validação</p>
                  </div>
                  <div className="ml-auto size-5 flex items-center justify-center">
                    <i className="ri-arrow-right-s-line text-amber-600 dark:text-amber-400" aria-hidden="true"></i>
                  </div>
                </div>
              </button>
            )}
            {stats.pendingJobs > 0 && (
              <button
                type="button"
                onClick={() => onNavigate("vagas")}
                className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-xl p-4 text-left hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-orange-100 dark:bg-orange-900 flex items-center justify-center shrink-0">
                    <i className="ri-briefcase-line text-orange-600 dark:text-orange-400 text-lg" aria-hidden="true"></i>
                  </div>
                  <div>
                    <p className="font-bold text-orange-900 dark:text-orange-200 text-sm">
                      {stats.pendingJobs} vaga{stats.pendingJobs !== 1 ? "s" : ""} pendente{stats.pendingJobs !== 1 ? "s" : ""}
                    </p>
                    <p className="text-orange-700 dark:text-orange-400 text-xs">Vagas aguardando aprovação</p>
                  </div>
                  <div className="ml-auto size-5 flex items-center justify-center">
                    <i className="ri-arrow-right-s-line text-orange-600 dark:text-orange-400" aria-hidden="true"></i>
                  </div>
                </div>
              </button>
            )}
          </div>
        </AnimatedSection>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Empresas Ativas", value: stats.activeCompanies,  icon: "ri-building-line",      color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950", section: "empresas"     as AdminSection },
          { label: "Candidatos",      value: stats.totalCandidates,  icon: "ri-user-line",          color: "text-sky-600 dark:text-sky-400",         bg: "bg-sky-50 dark:bg-sky-950",         section: "candidatos"   as AdminSection },
          { label: "Vagas Ativas",    value: stats.activeJobs,       icon: "ri-briefcase-line",     color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-950",     section: "vagas"        as AdminSection },
          { label: "Notif. Pendentes",value: stats.pendingNotifs,    icon: "ri-notification-line",  color: "text-rose-600 dark:text-rose-400",       bg: "bg-rose-50 dark:bg-rose-950",       section: "notificacoes" as AdminSection },
        ].map((kpi, i) => (
          <AnimatedSection key={kpi.label} variant="fade-up" delay={120 + i * 70}>
            <button
              type="button"
              onClick={() => onNavigate(kpi.section)}
              className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 text-left hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors cursor-pointer"
            >
              <div className={`size-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                <i className={`${kpi.icon} ${kpi.color} text-lg`} aria-hidden="true"></i>
              </div>
              <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.label}</p>
            </button>
          </AnimatedSection>
        ))}
      </div>

      {/* Quick Actions + Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedSection variant="fade-up" delay={420}>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Ver Empresas",   icon: "ri-building-line",   section: "empresas"    as AdminSection, color: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900" },
                { label: "Ver Candidatos", icon: "ri-user-line",       section: "candidatos"  as AdminSection, color: "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900" },
                { label: "Ver Vagas",      icon: "ri-briefcase-line",  section: "vagas"       as AdminSection, color: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900" },
                { label: "Notificações",   icon: "ri-send-plane-line", section: "notificacoes"as AdminSection, color: "bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900" },
              ].map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => onNavigate(action.section)}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${action.color} whitespace-nowrap`}
                >
                  <div className="size-5 flex items-center justify-center">
                    <i className={`${action.icon} text-sm`} aria-hidden="true"></i>
                  </div>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection variant="fade-up" delay={490}>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Últimas Notificações</h3>
            <div className="space-y-3">
              {stats.recentNotifs.length === 0 ? (
                <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">Nenhuma notificação enviada ainda</p>
              ) : (
                stats.recentNotifs.map((notif) => {
                  const cfg = TYPE_ICON[notif.type] ?? TYPE_ICON.status_update;
                  return (
                    <div key={notif.id} className="flex items-start gap-3">
                      <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                        <i className={`text-sm ${cfg.icon} ${cfg.color}`} aria-hidden="true"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{notif.subject}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{notif.sentAt}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        notif.status === "enviado" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400" :
                        notif.status === "pendente" ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400" :
                        "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400"
                      }`}>
                        {notif.status === "enviado" ? "Enviado" : notif.status === "pendente" ? "Pendente" : "Falhou"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            <button
              type="button"
              onClick={() => onNavigate("notificacoes")}
              className="mt-4 text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Ver todas as notificações →
            </button>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
