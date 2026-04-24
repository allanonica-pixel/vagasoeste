import { useState } from "react";
import CompanyJobsTab from "./components/CompanyJobsTab";
import CandidatesTab from "./components/CandidatesTab";
import AdminTab from "./components/AdminTab";
import { useAuth } from "@/contexts/AuthContext";
import { mockCandidates } from "@/mocks/candidates";

type Tab = "candidatos" | "vagas" | "admin";

export default function EmpresaPage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("candidatos");
  const [notifDismissed, setNotifDismissed] = useState(false);

  // Count new (pendente) candidates not yet viewed
  const newCandidatesCount = mockCandidates.filter(
    (c) => c.status === "pendente" && c.requests.length === 0 && !c.isFavorited
  ).length;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "candidatos", label: "Candidatos", icon: "ri-user-line" },
    { id: "vagas", label: "Minhas Vagas", icon: "ri-briefcase-line" },
    { id: "admin", label: "Administrativo", icon: "ri-admin-line" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <i className="ri-briefcase-line text-white text-xs"></i>
            </div>
            <span className="font-bold text-base text-gray-900">
              Vagas<span className="text-emerald-600">Oeste</span>
            </span>
            <span className="text-gray-300 mx-2">|</span>
            <span className="text-gray-700 text-sm">Área da Empresa</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            {newCandidatesCount > 0 && (
              <div className="relative cursor-pointer" onClick={() => setActiveTab("candidatos")}>
                <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <i className="ri-notification-3-line text-amber-600 text-sm"></i>
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold" style={{ fontSize: "9px" }}>
                  {newCandidatesCount}
                </span>
              </div>
            )}
            <span className="text-xs text-gray-700 hidden sm:block truncate max-w-[160px]">
              {user?.email ?? "Empresa Parceira"}
            </span>
            <div
              className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center cursor-pointer hover:bg-red-50 group"
              title="Sair"
              onClick={() => signOut()}
            >
              <i className="ri-building-line text-emerald-600 text-sm group-hover:hidden"></i>
              <i className="ri-logout-box-r-line text-red-500 text-sm hidden group-hover:block"></i>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Painel da Empresa</h1>
          <p className="text-gray-700 text-sm mt-1">
            Visualize candidatos, gerencie vagas e acompanhe solicitações.
          </p>
        </div>

        {/* New candidates notification banner */}
        {newCandidatesCount > 0 && !notifDismissed && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <i className="ri-user-add-line text-emerald-600 text-base"></i>
              </div>
              <div>
                <p className="text-emerald-900 font-semibold text-sm">
                  {newCandidatesCount} novo{newCandidatesCount > 1 ? "s" : ""} candidato{newCandidatesCount > 1 ? "s" : ""} aguardando análise!
                </p>
                <p className="text-emerald-700 text-xs mt-0.5">
                  Acesse a aba Candidatos para visualizar os perfis e tomar ações.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab("candidatos")}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
              >
                Ver candidatos
              </button>
              <button
                onClick={() => setNotifDismissed(true)}
                className="w-6 h-6 flex items-center justify-center text-emerald-500 hover:text-emerald-700 cursor-pointer"
              >
                <i className="ri-close-line text-sm"></i>
              </button>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 flex items-start gap-3">
          <div className="w-5 h-5 flex items-center justify-center mt-0.5">
            <i className="ri-shield-check-line text-amber-600 text-sm"></i>
          </div>
          <p className="text-amber-800 text-sm">
            <strong>Dados protegidos:</strong> Nome, telefone e email dos candidatos são gerenciados exclusivamente pela equipe VagasOeste. Para solicitar contato, use os botões de ação no perfil do candidato.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap relative ${
                activeTab === tab.id ? "bg-white text-gray-900" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${tab.icon} text-xs`}></i>
              </div>
              {tab.label}
              {tab.id === "admin" && (
                <span className="ml-1 text-xs bg-emerald-600 text-white px-1.5 py-0.5 rounded-full">Admin</span>
              )}
              {tab.id === "candidatos" && newCandidatesCount > 0 && (
                <span className="ml-1 text-xs bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                  {newCandidatesCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "candidatos" && <CandidatesTab />}
        {activeTab === "vagas" && <CompanyJobsTab />}
        {activeTab === "admin" && <AdminTab />}
      </div>
    </div>
  );
}
