import { useState } from "react";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/base/AnimatedSection";
import AdminCompanies from "./components/AdminCompanies";
import AdminCandidates from "./components/AdminCandidates";
import AdminJobs from "./components/AdminJobs";
import AdminReports from "./components/AdminReports";
import AdminNotifications from "./components/AdminNotifications";
import AdminSettings from "./components/AdminSettings";
import { mockAdminCompanies, mockAdminCandidates, mockAdminJobs, mockAdminNotifications } from "@/mocks/adminData";

type AdminSection = "dashboard" | "empresas" | "candidatos" | "vagas" | "relatorios" | "notificacoes" | "configuracoes";

const NAV_ITEMS: { id: AdminSection; label: string; icon: string; badge?: number; badgeColor?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "ri-dashboard-line" },
  { id: "empresas", label: "Empresas", icon: "ri-building-line", badge: mockAdminCompanies.filter((c) => c.status === "pendente").length, badgeColor: "bg-amber-500" },
  { id: "candidatos", label: "Candidatos", icon: "ri-user-line", badge: mockAdminCandidates.length },
  { id: "vagas", label: "Vagas", icon: "ri-briefcase-line", badge: mockAdminJobs.filter((j) => j.status === "pendente").length, badgeColor: "bg-orange-500" },
  { id: "relatorios", label: "Relatórios", icon: "ri-bar-chart-line" },
  { id: "notificacoes", label: "Notificações", icon: "ri-notification-line", badge: mockAdminNotifications.filter((n) => n.status === "pendente").length },
  { id: "configuracoes", label: "Configurações", icon: "ri-settings-line" },
];

export default function AdminPage() {
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Guard movido para o router (PrivateRoute allowedRoles={["admin"]}).
  // Este componente só renderiza se o usuário já está autenticado como admin.

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-100 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <i className="ri-admin-line text-white text-xs"></i>
            </div>
            <div>
              <span className="font-bold text-sm text-gray-900">Vagas<span className="text-emerald-600">Oeste</span></span>
              <p className="text-xs text-gray-600 leading-none">Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setSection(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                section === item.id
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`${item.icon} text-sm`}></i>
              </div>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full text-white ${
                  item.badgeColor || (section === item.id ? "bg-emerald-500" : "bg-gray-400")
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <i className="ri-admin-line text-emerald-600 text-sm"></i>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">Administrador</p>
              <p className="text-xs text-gray-600">vagas@email.com</p>
            </div>
          </div>
          <Link
            to="/login"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-logout-box-line text-xs"></i>
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
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30 h-14 flex items-center px-4 md:px-6 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <i className="ri-menu-line text-gray-600 text-lg"></i>
          </button>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 text-sm">
              {NAV_ITEMS.find((n) => n.id === section)?.label || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xs text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-external-link-line mr-1"></i>Ver site
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6">
          {section === "dashboard" && <AdminDashboard onNavigate={setSection} />}
          {section === "empresas" && <AdminCompanies />}
          {section === "candidatos" && <AdminCandidates />}
          {section === "vagas" && <AdminJobs />}
          {section === "relatorios" && <AdminReports />}
          {section === "notificacoes" && <AdminNotifications />}
          {section === "configuracoes" && <AdminSettings />}
        </main>
      </div>
    </div>
  );
}

function AdminDashboard({ onNavigate }: { onNavigate: (s: AdminSection) => void }) {
  const pendingNotifs = mockAdminNotifications.filter((n) => n.status === "pendente").length;
  const pendingCompanies = mockAdminCompanies.filter((c) => c.status === "pendente").length;
  const pendingJobs = mockAdminJobs.filter((j) => j.status === "pendente").length;

  return (
    <div>
      <AnimatedSection variant="fade-up">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Bem-vindo ao Painel Admin</h2>
          <p className="text-gray-500 text-sm mt-0.5">Visão geral do ecossistema VagasOeste</p>
        </div>
      </AnimatedSection>

      {/* Pending Alerts */}
      {(pendingCompanies > 0 || pendingJobs > 0) && (
        <AnimatedSection variant="fade-up" delay={60}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {pendingCompanies > 0 && (
              <button
                onClick={() => onNavigate("empresas")}
                className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <i className="ri-building-line text-amber-600 text-lg"></i>
                  </div>
                  <div>
                    <p className="font-bold text-amber-900 text-sm">{pendingCompanies} pré-cadastro{pendingCompanies !== 1 ? "s" : ""} pendente{pendingCompanies !== 1 ? "s" : ""}</p>
                    <p className="text-amber-700 text-xs">Empresas aguardando validação</p>
                  </div>
                  <div className="ml-auto w-5 h-5 flex items-center justify-center">
                    <i className="ri-arrow-right-s-line text-amber-600"></i>
                  </div>
                </div>
              </button>
            )}
            {pendingJobs > 0 && (
              <button
                onClick={() => onNavigate("vagas")}
                className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-left hover:bg-orange-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                    <i className="ri-briefcase-line text-orange-600 text-lg"></i>
                  </div>
                  <div>
                    <p className="font-bold text-orange-900 text-sm">{pendingJobs} vaga{pendingJobs !== 1 ? "s" : ""} pendente{pendingJobs !== 1 ? "s" : ""}</p>
                    <p className="text-orange-700 text-xs">Vagas aguardando aprovação</p>
                  </div>
                  <div className="ml-auto w-5 h-5 flex items-center justify-center">
                    <i className="ri-arrow-right-s-line text-orange-600"></i>
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
          { label: "Empresas Ativas", value: mockAdminCompanies.filter((c) => c.status === "ativo").length, icon: "ri-building-line", color: "text-emerald-600", bg: "bg-emerald-50", section: "empresas" as AdminSection },
          { label: "Candidatos", value: mockAdminCandidates.length, icon: "ri-user-line", color: "text-sky-600", bg: "bg-sky-50", section: "candidatos" as AdminSection },
          { label: "Vagas Ativas", value: mockAdminJobs.filter((j) => j.status === "ativa").length, icon: "ri-briefcase-line", color: "text-amber-600", bg: "bg-amber-50", section: "vagas" as AdminSection },
          { label: "Notif. Pendentes", value: pendingNotifs, icon: "ri-notification-line", color: "text-rose-600", bg: "bg-rose-50", section: "notificacoes" as AdminSection },
        ].map((kpi, i) => (
          <AnimatedSection key={kpi.label} variant="fade-up" delay={120 + i * 70}>
            <button
              onClick={() => onNavigate(kpi.section)}
              className="w-full bg-white rounded-xl border border-gray-100 p-5 text-left hover:border-emerald-200 transition-colors cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                <i className={`${kpi.icon} ${kpi.color} text-lg`}></i>
              </div>
              <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
            </button>
          </AnimatedSection>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedSection variant="fade-up" delay={420}>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Ver Empresas", icon: "ri-building-line", section: "empresas" as AdminSection, color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
                { label: "Ver Candidatos", icon: "ri-user-line", section: "candidatos" as AdminSection, color: "bg-sky-50 text-sky-700 hover:bg-sky-100" },
                { label: "Ver Vagas", icon: "ri-briefcase-line", section: "vagas" as AdminSection, color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
                { label: "Notificações", icon: "ri-send-plane-line", section: "notificacoes" as AdminSection, color: "bg-violet-50 text-violet-700 hover:bg-violet-100" },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => onNavigate(action.section)}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${action.color} whitespace-nowrap`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={`${action.icon} text-sm`}></i>
                  </div>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection variant="fade-up" delay={490}>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Últimas Notificações</h3>
            <div className="space-y-3">
              {mockAdminNotifications.slice(0, 3).map((notif) => (
                <div key={notif.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    notif.type === "new_candidate" ? "bg-sky-50" : notif.type === "pre_interview" ? "bg-amber-50" : "bg-violet-50"
                  }`}>
                    <i className={`text-sm ${
                      notif.type === "new_candidate" ? "ri-user-add-line text-sky-600" :
                      notif.type === "pre_interview" ? "ri-calendar-check-line text-amber-600" :
                      "ri-phone-line text-violet-600"
                    }`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{notif.subject}</p>
                    <p className="text-xs text-gray-600">{notif.sentAt}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    notif.status === "enviado" ? "bg-emerald-100 text-emerald-700" :
                    notif.status === "pendente" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-600"
                  }`}>
                    {notif.status === "enviado" ? "Enviado" : notif.status === "pendente" ? "Pendente" : "Falhou"}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigate("notificacoes")}
              className="mt-4 text-xs text-emerald-600 hover:underline cursor-pointer"
            >
              Ver todas as notificações →
            </button>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
