import { useState, useEffect } from "react";
import AnimatedSection from "@/components/base/AnimatedSection";
import { AdminCompany, mockAdminJobs } from "@/mocks/adminData";
import CompanyValidationModal from "@/pages/admin/components/CompanyValidationModal";
import CompanyDetailPanel from "@/pages/admin/components/CompanyDetailPanel";
import { supabase } from "@/lib/supabase";

// Mapeia uma linha da tabela empresa_pre_cadastros para a interface AdminCompany
function mapRow(row: Record<string, unknown>): AdminCompany {
  const createdAt = typeof row.created_at === "string" ? row.created_at.split("T")[0] : "—";
  const updatedAt = typeof row.updated_at === "string" ? row.updated_at.split("T")[0] : undefined;
  const dbStatus = row.status as string;
  const uiStatus: AdminCompany["status"] =
    dbStatus === "aprovado" ? "ativo" : dbStatus === "rejeitado" ? "rejeitado" : "pendente";

  const logradouro = typeof row.logradouro === "string" ? row.logradouro : "";
  const numero = typeof row.numero === "string" ? row.numero : "";
  const endereco = [logradouro, numero].filter(Boolean).join(", ") || "—";

  const setores = Array.isArray(row.setores) ? (row.setores as string[]) : [];

  return {
    id: String(row.id),
    name: String(row.company_name ?? ""),
    razaoSocial: String(row.razao_social ?? row.company_name ?? ""),
    cnpj: String(row.cnpj ?? "—"),
    sector: setores[0] ?? "—",
    city: "Santarém",
    neighborhood: String(row.bairro_empresa ?? row.neighborhood ?? "—"),
    endereco,
    email: String(row.contact_email ?? ""),
    phone: "—",
    whatsapp: String(row.contact_whatsapp ?? ""),
    contactName: String(row.contact_name ?? ""),
    contactRole: String(row.contact_role ?? ""),
    activeJobs: 0,
    pendingJobs: 0,
    totalCandidates: 0,
    registeredAt: createdAt,
    status: uiStatus,
    validadoEm: updatedAt,
    plano: "basico",
    senhaProvisoria: uiStatus === "pendente",
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  ativo: { label: "Ativo", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  inativo: { label: "Inativo", color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  pendente: { label: "Pendente", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  rejeitado: { label: "Rejeitado", color: "bg-red-100 text-red-600", dot: "bg-red-500" },
};

const SECTORS = ["Todos", "Saúde", "Comércio", "Tecnologia", "Construção Civil", "Alimentação", "Logística", "Serviços", "Indústria", "Agronegócio"];
const TABS = [
  { id: "todos", label: "Todas" },
  { id: "pendente", label: "Pré-cadastros Pendentes" },
  { id: "ativo", label: "Ativas" },
  { id: "rejeitado", label: "Rejeitadas" },
];

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSector, setFilterSector] = useState("Todos");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const [selected, setSelected] = useState<string | null>(null);
  const [validationModal, setValidationModal] = useState<{ company: AdminCompany; action: "approve" | "reject" } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true);
      const { data, error } = await supabase
        .from("empresa_pre_cadastros")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar empresas:", error);
      } else if (data) {
        setCompanies(data.map(mapRow));
      }
      setLoading(false);
    }
    fetchCompanies();
  }, []);

  const pendingCount = companies.filter((c) => c.status === "pendente").length;

  const filtered = companies.filter((c) => {
    const matchTab = activeTab === "todos" || c.status === activeTab;
    const matchSector = filterSector === "Todos" || c.sector === filterSector;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.cnpj.includes(search) || c.email.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSector && matchSearch;
  });

  const selectedCompany = companies.find((c) => c.id === selected) || null;

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleApprove = (company: AdminCompany) => {
    setValidationModal({ company, action: "approve" });
  };

  const handleReject = (company: AdminCompany) => {
    setValidationModal({ company, action: "reject" });
  };

  const handleConfirmValidation = async (action: "approve" | "reject", motivo?: string) => {
    if (!validationModal) return;
    const { company } = validationModal;
    const dbStatus = action === "approve" ? "aprovado" : "rejeitado";
    const uiStatus: AdminCompany["status"] = action === "approve" ? "ativo" : "rejeitado";
    const now = new Date().toISOString();

    // Persiste no Supabase
    const { error } = await supabase
      .from("empresa_pre_cadastros")
      .update({ status: dbStatus, updated_at: now })
      .eq("id", company.id);

    if (error) {
      console.error("Erro ao atualizar status da empresa:", error);
      showToast("Erro ao salvar. Verifique a conexão e tente novamente.", "error");
      return;
    }

    // Atualiza estado local
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === company.id
          ? {
              ...c,
              status: uiStatus,
              validadoEm: now.split("T")[0],
              motivoRejeicao: motivo,
              senhaProvisoria: false,
            }
          : c
      )
    );

    setValidationModal(null);
    setSelected(null);

    if (action === "approve") {
      showToast(`Empresa "${company.name}" aprovada! Email de confirmação enviado para ${company.email}.`, "success");
    } else {
      showToast(`Empresa "${company.name}" rejeitada. Email de notificação enviado.`, "error");
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
          <h2 className="text-xl font-bold text-gray-900">Empresas</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {companies.length} empresas · {pendingCount > 0 && (
              <span className="text-amber-600 font-semibold">{pendingCount} pré-cadastro{pendingCount !== 1 ? "s" : ""} aguardando validação</span>
            )}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 text-gray-500 text-sm py-6">
          <i className="ri-loader-4-line animate-spin text-emerald-600 text-lg"></i>
          Carregando empresas...
        </div>
      )}

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <i className="ri-time-line text-amber-600 text-base"></i>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-900 text-sm mb-0.5">
              {pendingCount} pré-cadastro{pendingCount !== 1 ? "s" : ""} aguardando validação
            </p>
            <p className="text-amber-700 text-xs leading-relaxed">
              Empresas que realizaram o pré-cadastro estão aguardando aprovação. Após validação, suas vagas serão publicadas automaticamente e elas receberão um email de confirmação.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("pendente")}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors whitespace-nowrap"
          >
            Ver pendentes
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 w-fit">
        {TABS.map((tab) => {
          const count = tab.id === "todos" ? companies.length : companies.filter((c) => c.status === tab.id).length;
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
                    ? "bg-amber-500 text-white"
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
          <div className="sm:col-span-2">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-gray-400 text-xs"></i>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, CNPJ ou email..."
                className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400"
              />
            </div>
          </div>
          <div>
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer"
            >
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {filtered.length} empresa{filtered.length !== 1 ? "s" : ""}
          </p>

          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <i className="ri-building-line text-gray-300 text-3xl"></i>
              </div>
              <p className="text-gray-400 text-sm">Nenhuma empresa encontrada</p>
            </div>
          )}

          {filtered.map((company, idx) => (
            <AnimatedSection key={company.id} variant="fade-up" delay={(idx % 6) * 60}>
              <div
                onClick={() => setSelected(company.id === selected ? null : company.id)}
                className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  selected === company.id ? "border-emerald-500" : "border-gray-100 hover:border-emerald-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      company.status === "pendente" ? "bg-amber-50" : company.status === "rejeitado" ? "bg-red-50" : "bg-emerald-50"
                    }`}>
                      <i className={`ri-building-line text-base ${
                        company.status === "pendente" ? "text-amber-600" : company.status === "rejeitado" ? "text-red-500" : "text-emerald-600"
                      }`}></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">{company.name}</p>
                        {company.senhaProvisoria && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
                            Senha provisória
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs">{company.cnpj} · {company.sector} · {company.neighborhood}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${STATUS_CONFIG[company.status].color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[company.status].dot}`}></span>
                      {STATUS_CONFIG[company.status].label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500 mb-3">
                  <span><i className="ri-mail-line mr-1 text-emerald-500"></i>{company.email}</span>
                  <span><i className="ri-user-line mr-1 text-emerald-500"></i>{company.contactName}</span>
                  <span><i className="ri-calendar-line mr-1"></i>Cadastro: {company.registeredAt}</span>
                  {company.status === "ativo" && (
                    <>
                      <span><i className="ri-briefcase-line mr-1 text-emerald-500"></i>{company.activeJobs} vagas ativas</span>
                      <span><i className="ri-user-line mr-1 text-emerald-500"></i>{company.totalCandidates} candidatos</span>
                    </>
                  )}
                  {company.status === "pendente" && company.pendingJobs > 0 && (
                    <span className="text-amber-600 font-medium">
                      <i className="ri-time-line mr-1"></i>{company.pendingJobs} vaga{company.pendingJobs !== 1 ? "s" : ""} pendente{company.pendingJobs !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Action buttons for pending */}
                {company.status === "pendente" && (
                  <div className="flex gap-2 pt-3 border-t border-gray-50">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleApprove(company); }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <i className="ri-checkbox-circle-line text-sm"></i>
                      Aprovar cadastro
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleReject(company); }}
                      className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <i className="ri-close-circle-line text-sm"></i>
                      Rejeitar
                    </button>
                  </div>
                )}

                {company.status === "rejeitado" && company.motivoRejeicao && (
                  <div className="mt-2 pt-2 border-t border-gray-50">
                    <p className="text-xs text-red-500">
                      <i className="ri-information-line mr-1"></i>
                      Motivo: {company.motivoRejeicao}
                    </p>
                  </div>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Detail Panel */}
        <div>
          {selectedCompany ? (
            <CompanyDetailPanel
              company={selectedCompany}
              jobs={mockAdminJobs.filter((j) => j.companyId === selectedCompany.id)}
              onApprove={() => handleApprove(selectedCompany)}
              onReject={() => handleReject(selectedCompany)}
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center sticky top-20">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <i className="ri-building-line text-gray-300 text-3xl"></i>
              </div>
              <p className="text-gray-400 text-sm">Selecione uma empresa para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>

      {/* Validation Modal */}
      {validationModal && (
        <CompanyValidationModal
          company={validationModal.company}
          action={validationModal.action}
          onConfirm={handleConfirmValidation}
          onClose={() => setValidationModal(null)}
        />
      )}
    </div>
  );
}
