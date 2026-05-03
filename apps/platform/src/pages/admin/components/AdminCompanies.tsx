import { useState, useEffect } from "react";
import AnimatedSection from "@/components/base/AnimatedSection";
import { AdminCompany, mockAdminJobs } from "@/mocks/adminData";
import CompanyValidationModal from "@/pages/admin/components/CompanyValidationModal";
import CompanyDetailPanel from "@/pages/admin/components/CompanyDetailPanel";
import CompanyActionModal from "@/pages/admin/components/CompanyActionModal";
import { supabase } from "@/lib/supabase";
import { isoToBR } from "@/utils/date";

// Mapeia uma linha da tabela empresa_pre_cadastros para a interface AdminCompany
function mapRow(row: Record<string, unknown>): AdminCompany {
  const dbStatus = row.status as string;
  const uiStatus: AdminCompany["status"] =
    dbStatus === "aprovado" ? "ativo" :
    dbStatus === "rejeitado" ? "rejeitado" :
    dbStatus === "inativo" ? "inativo" :
    dbStatus === "excluido" ? "excluido" :
    "pendente";

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
    registeredAt: isoToBR(typeof row.created_at === "string" ? row.created_at : undefined),
    status: uiStatus,
    validadoEm: typeof row.updated_at === "string" ? isoToBR(row.updated_at) : undefined,
    ativadoEm: typeof row.ativado_em === "string" ? isoToBR(row.ativado_em) : undefined,
    inativadoEm: typeof row.updated_at === "string" && uiStatus === "inativo" ? isoToBR(row.updated_at) : undefined,
    excluidoEm: typeof row.updated_at === "string" && uiStatus === "excluido" ? isoToBR(row.updated_at) : undefined,
    plano: "basico",
    senhaProvisoria: uiStatus === "pendente",
    contactPassword: typeof row.contact_password === "string" && row.contact_password ? row.contact_password : undefined,
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  ativo:     { label: "Ativo",     color: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  inativo:   { label: "Inativo",   color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",            dot: "bg-gray-400 dark:bg-gray-500" },
  excluido:  { label: "Excluído",  color: "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400",                dot: "bg-red-400" },
  pendente:  { label: "Pendente",  color: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400",        dot: "bg-amber-500" },
  rejeitado: { label: "Rejeitado", color: "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400",                dot: "bg-red-500" },
};

const SECTORS = ["Todos", "Saúde", "Comércio", "Tecnologia", "Construção Civil", "Alimentação", "Logística", "Serviços", "Indústria", "Agronegócio"];

const TABS = [
  { id: "todos",                label: "Todas"                   },
  { id: "aguardando-ativacao",  label: "Aguardando Ativação"     },
  { id: "pendente",             label: "Pré-cadastros Pendentes" },
  { id: "ativo",                label: "Ativas"                  },
  { id: "rejeitado",            label: "Rejeitadas"              },
  { id: "inativo",              label: "Inativas"                },
  { id: "excluido",             label: "Excluídas"               },
];

export default function AdminCompanies() {
  const [companies, setCompanies]       = useState<AdminCompany[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filterSector, setFilterSector] = useState("Todos");
  const [search, setSearch]             = useState("");
  const [activeTab, setActiveTab]       = useState("todos");
  const [selected, setSelected]         = useState<string | null>(null);
  const [validationModal, setValidationModal] = useState<{ company: AdminCompany; action: "approve" | "reject" } | null>(null);
  const [actionModal, setActionModal]   = useState<{ company: AdminCompany; action: "inativar" | "excluir" } | null>(null);
  const [toast, setToast]               = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [reenvioLoading, setReenvioLoading] = useState<string | null>(null); // id da empresa em reenvio

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

  // Pré-cadastros têm 2 estados internos quando status === "pendente":
  //   - "aguardando-ativacao" → empresa preencheu mas NÃO clicou no link de ativação (ativadoEm vazio)
  //   - "pendente"            → empresa ATIVOU e aguarda aprovação do admin (ativadoEm preenchido)
  // Distinguir os dois desambigua a visão do admin e habilita suporte a empresas que erraram o e-mail.
  const isAwaitingActivation = (c: AdminCompany) => c.status === "pendente" && !c.ativadoEm;
  const isReadyForApproval   = (c: AdminCompany) => c.status === "pendente" && !!c.ativadoEm;

  const pendingCount    = companies.filter(isReadyForApproval).length;
  const awaitingCount   = companies.filter(isAwaitingActivation).length;

  const filtered = companies.filter((c) => {
    let matchTab: boolean;
    if (activeTab === "todos") {
      matchTab = true;
    } else if (activeTab === "aguardando-ativacao") {
      matchTab = isAwaitingActivation(c);
    } else if (activeTab === "pendente") {
      matchTab = isReadyForApproval(c);
    } else {
      matchTab = c.status === activeTab;
    }
    const matchSector = filterSector === "Todos" || c.sector === filterSector;
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.cnpj.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSector && matchSearch;
  });

  const selectedCompany = companies.find((c) => c.id === selected) || null;

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleApprove = (company: AdminCompany) => setValidationModal({ company, action: "approve" });
  const handleReject  = (company: AdminCompany) => setValidationModal({ company, action: "reject"  });

  const handleReenviarEmail = async (company: AdminCompany) => {
    if (reenvioLoading) return;
    setReenvioLoading(company.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token    = session?.access_token;
      const API_URL  = import.meta.env.VITE_API_URL ?? import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000";

      const res  = await fetch(`${API_URL}/v1/admin/companies/${company.id}/reenviar-ativacao`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        showToast(`E-mail de ativação reenviado para ${json.email ?? company.email}.`, "success");
      } else if (json.error === "ALREADY_ACTIVATED") {
        showToast("Este pré-cadastro já foi ativado — não é necessário reenviar.", "error");
      } else {
        showToast(json.message ?? json.error ?? "Erro ao reenviar e-mail. Tente novamente.", "error");
      }
    } catch {
      showToast("Não foi possível contatar a API. Verifique a conexão.", "error");
    } finally {
      setReenvioLoading(null);
    }
  };
  const handleInativar= (company: AdminCompany) => { setActionModal({ company, action: "inativar" }); setSelected(null); };
  const handleExcluir = (company: AdminCompany) => { setActionModal({ company, action: "excluir"  }); setSelected(null); };

  const handleConfirmValidation = async (action: "approve" | "reject", motivo?: string) => {
    if (!validationModal) return;
    const { company } = validationModal;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token   = session?.access_token;
      const API_URL = import.meta.env.VITE_API_URL ?? import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000";

      const endpoint = action === "approve"
        ? `${API_URL}/v1/admin/companies/${company.id}/aprovar`
        : `${API_URL}/v1/admin/companies/${company.id}/rejeitar`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: action === "reject" ? JSON.stringify({ motivo: motivo ?? "" }) : undefined,
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Erros conhecidos do backend
        if (json.error === "NOT_ACTIVATED") {
          showToast(json.message ?? "Empresa ainda não ativou o pré-cadastro. Use 'Reenviar e-mail de ativação'.", "error");
        } else if (json.error === "ALREADY_APPROVED") {
          showToast("Empresa já está aprovada.", "error");
        } else if (json.error === "ALREADY_REJECTED") {
          showToast("Empresa já está rejeitada.", "error");
        } else if (json.error === "COMPANY_MISSING") {
          showToast("Estado inconsistente — empresa ativou mas registro principal está faltando. Contate o desenvolvedor.", "error");
        } else if (json.error === "MOTIVO_REQUIRED") {
          showToast("Informe o motivo da rejeição.", "error");
        } else {
          showToast(json.message ?? json.error ?? "Erro ao processar. Tente novamente.", "error");
        }
        return;
      }

      const now      = new Date().toISOString();
      const uiStatus: AdminCompany["status"] = action === "approve" ? "ativo" : "rejeitado";

      setCompanies((prev) =>
        prev.map((c) =>
          c.id === company.id
            ? { ...c, status: uiStatus, validadoEm: isoToBR(now), motivoRejeicao: motivo, senhaProvisoria: false }
            : c,
        ),
      );
      setValidationModal(null);
      setSelected(null);

      if (action === "approve") {
        const promoted = typeof json.promoted_jobs_count === "number" ? json.promoted_jobs_count : 0;
        const jobsMsg  = promoted > 0 ? ` ${promoted} vaga${promoted > 1 ? "s" : ""} ativada${promoted > 1 ? "s" : ""}.` : "";
        const emailMsg = json.email_sent ? " E-mail de notificação enviado." : " ⚠️ E-mail não foi enviado — verifique configuração SMTP no .env da API.";
        showToast(`Empresa "${company.name}" aprovada.${jobsMsg}${emailMsg}`, "success");
      } else {
        const emailMsg = json.email_sent ? " E-mail de notificação enviado." : " ⚠️ E-mail não foi enviado — verifique configuração SMTP no .env da API.";
        showToast(`Empresa "${company.name}" rejeitada.${emailMsg}`, "error");
      }
    } catch {
      showToast("Não foi possível contatar a API. Verifique a conexão.", "error");
    }
  };

  const handleConfirmAction = (actionDone: "inativar" | "excluir") => {
    if (!actionModal) return;
    const { company } = actionModal;
    const newStatus: AdminCompany["status"] = actionDone === "inativar" ? "inativo" : "excluido";
    const now = isoToBR(new Date().toISOString());

    setCompanies((prev) =>
      prev.map((c) =>
        c.id === company.id
          ? {
              ...c,
              status: newStatus,
              ...(actionDone === "inativar" ? { inativadoEm: now } : { excluidoEm: now }),
            }
          : c
      )
    );
    setActionModal(null);
    showToast(
      actionDone === "inativar"
        ? `Empresa "${company.name}" inativada. Vagas pausadas automaticamente.`
        : `Empresa "${company.name}" excluída. Vagas encerradas.`,
      actionDone === "inativar" ? "success" : "error"
    );
  };

  const handleReativar = async (company: AdminCompany) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const API_URL = import.meta.env.VITE_API_URL ?? import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000";

    const res = await fetch(`${API_URL}/v1/admin/companies/${company.id}/reativar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ admin_name: session?.user?.email ?? "Administrador" }),
    });

    if (res.ok) {
      setCompanies((prev) =>
        prev.map((c) => c.id === company.id ? { ...c, status: "ativo", inativadoEm: undefined } : c)
      );
      showToast(`Empresa "${company.name}" reativada com sucesso.`, "success");
    } else {
      const json = await res.json().catch(() => ({}));
      showToast(json.error ?? "Erro ao reativar empresa.", "error");
    }
  };

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm px-5 py-4 rounded-xl text-sm font-medium flex items-start gap-3 ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`} role="status" aria-live="polite">
          <i className={`${toast.type === "success" ? "ri-checkbox-circle-line" : "ri-close-circle-line"} text-base shrink-0`} aria-hidden="true"></i>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Empresas</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {companies.length} empresas
            {awaitingCount > 0 && (
              <> · <span className="text-blue-600 font-semibold">{awaitingCount} aguardando ativação</span></>
            )}
            {pendingCount > 0 && (
              <> · <span className="text-amber-600 font-semibold">{pendingCount} pré-cadastro{pendingCount !== 1 ? "s" : ""} aguardando validação</span></>
            )}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm py-6">
          <i className="ri-loader-4-line motion-safe:animate-spin text-emerald-600 text-lg" aria-hidden="true"></i>
          Carregando empresas...
        </div>
      )}

      {/* Awaiting Activation Alert (azul) — empresas que preencheram mas não clicaram no link */}
      {awaitingCount > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-3 flex items-start gap-3">
          <div className="size-9 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
            <i className="ri-mail-send-line text-blue-600 text-base" aria-hidden="true"></i>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-blue-900 dark:text-blue-300 text-sm mb-0.5">
              {awaitingCount} empresa{awaitingCount !== 1 ? "s" : ""} aguardando ativação
            </p>
            <p className="text-blue-700 dark:text-blue-400 text-xs leading-relaxed">
              Pré-cadastro foi enviado mas a empresa ainda não clicou no link de ativação. Caso a empresa entre em contato relatando dificuldade, use "Reenviar e-mail de ativação".
            </p>
          </div>
          <button
            onClick={() => setActiveTab("aguardando-ativacao")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors whitespace-nowrap"
          >
            Ver lista
          </button>
        </div>
      )}

      {/* Pending Alert (amarelo) — empresas ativadas aguardando aprovação */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-5 flex items-start gap-3">
          <div className="size-9 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0">
            <i className="ri-time-line text-amber-600 text-base" aria-hidden="true"></i>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-900 dark:text-amber-300 text-sm mb-0.5">
              {pendingCount} pré-cadastro{pendingCount !== 1 ? "s" : ""} aguardando validação
            </p>
            <p className="text-amber-700 dark:text-amber-400 text-xs leading-relaxed">
              Empresas que ativaram o pré-cadastro estão aguardando aprovação para publicar vagas.
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
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-5 w-fit overflow-x-auto">
        {TABS.map((tab) => {
          let count: number;
          if (tab.id === "todos") {
            count = companies.length;
          } else if (tab.id === "aguardando-ativacao") {
            count = awaitingCount;
          } else if (tab.id === "pendente") {
            count = pendingCount;
          } else {
            count = companies.filter((c) => c.status === tab.id).length;
          }
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  tab.id === "aguardando-ativacao" && count > 0
                    ? "bg-blue-500 text-white"
                    : tab.id === "pendente" && count > 0
                    ? "bg-amber-500 text-white"
                    : tab.id === "inativo" && count > 0
                    ? "bg-gray-400 dark:bg-gray-600 text-white"
                    : tab.id === "excluido" && count > 0
                    ? "bg-red-500 text-white"
                    : activeTab === tab.id
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 size-4 flex items-center justify-center">
              <i className="ri-search-line text-gray-400 text-xs" aria-hidden="true"></i>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, CNPJ ou email..."
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400"
            />
          </div>
          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer"
          >
            {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {filtered.length} empresa{filtered.length !== 1 ? "s" : ""}
          </p>

          {filtered.length === 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-10 text-center">
              <div className="size-12 flex items-center justify-center mx-auto mb-3">
                <i className="ri-building-line text-gray-300 dark:text-gray-600 text-3xl" aria-hidden="true"></i>
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Nenhuma empresa encontrada</p>
            </div>
          )}

          {filtered.map((company, idx) => (
            <AnimatedSection key={company.id} variant="fade-up" delay={(idx % 6) * 60}>
              <div
                onClick={() => setSelected(company.id === selected ? null : company.id)}
                className={`bg-white dark:bg-gray-900 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  selected === company.id ? "border-emerald-500" : "border-gray-100 dark:border-gray-800 hover:border-emerald-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                      company.status === "pendente"  ? "bg-amber-50 dark:bg-amber-950" :
                      company.status === "rejeitado" ? "bg-red-50 dark:bg-red-950" :
                      company.status === "inativo"   ? "bg-gray-50 dark:bg-gray-800" :
                      company.status === "excluido"  ? "bg-red-50 dark:bg-red-950" :
                      "bg-emerald-50 dark:bg-emerald-950"
                    }`}>
                      <i className={`ri-building-line text-base ${
                        company.status === "pendente"  ? "text-amber-600 dark:text-amber-400" :
                        company.status === "rejeitado" ? "text-red-500 dark:text-red-400" :
                        company.status === "inativo"   ? "text-gray-400 dark:text-gray-500" :
                        company.status === "excluido"  ? "text-red-400 dark:text-red-500" :
                        "text-emerald-600 dark:text-emerald-400"
                      }`} aria-hidden="true"></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{company.name}</p>
                        {company.senhaProvisoria && (
                          <span className="text-xs bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-medium">
                            Senha provisória
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{company.cnpj} · {company.sector} · {company.neighborhood}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0 ${
                    isAwaitingActivation(company)
                      ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                      : STATUS_CONFIG[company.status]?.color
                  }`}>
                    <span className={`size-1.5 rounded-full ${
                      isAwaitingActivation(company)
                        ? "bg-blue-500"
                        : STATUS_CONFIG[company.status]?.dot
                    }`}></span>
                    {isAwaitingActivation(company) ? "Aguardando Ativação" : STATUS_CONFIG[company.status]?.label}
                  </span>
                </div>

                <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <span><i className="ri-mail-line mr-1 text-emerald-500" aria-hidden="true"></i>{company.email}</span>
                  <span><i className="ri-user-line mr-1 text-emerald-500" aria-hidden="true"></i>{company.contactName}</span>
                  <span><i className="ri-calendar-line mr-1" aria-hidden="true"></i>Cadastro: {company.registeredAt}</span>
                  {company.status === "ativo" && (
                    <>
                      <span><i className="ri-briefcase-line mr-1 text-emerald-500" aria-hidden="true"></i>{company.activeJobs} vagas ativas</span>
                    </>
                  )}
                  {company.inativadoEm && (
                    <span className="text-gray-400"><i className="ri-pause-circle-line mr-1" aria-hidden="true"></i>Inativada em: {company.inativadoEm}</span>
                  )}
                  {company.excluidoEm && (
                    <span className="text-red-400"><i className="ri-delete-bin-line mr-1" aria-hidden="true"></i>Excluída em: {company.excluidoEm}</span>
                  )}
                </div>

                {/* Botões por status */}
                <div className="flex gap-2 pt-3 border-t border-gray-50 dark:border-gray-800 flex-wrap">
                  {/* Pendente AGUARDANDO ATIVAÇÃO — empresa não clicou no link.
                      Mostra apenas reenviar (e rejeitar se admin quiser descartar). */}
                  {isAwaitingActivation(company) && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReenviarEmail(company); }}
                        disabled={reenvioLoading === company.id}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                        aria-label={`Reenviar e-mail de ativação para ${company.name}`}
                      >
                        {reenvioLoading === company.id ? (
                          <i className="ri-loader-4-line text-sm motion-safe:animate-spin" aria-hidden="true"></i>
                        ) : (
                          <i className="ri-mail-send-line text-sm" aria-hidden="true"></i>
                        )}
                        {reenvioLoading === company.id ? "Enviando…" : "Reenviar e-mail de ativação"}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReject(company); }}
                        className="flex-1 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 font-semibold py-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <i className="ri-close-circle-line text-sm" aria-hidden="true"></i> Descartar
                      </button>
                    </>
                  )}

                  {/* Pendente PRONTO PARA APROVAÇÃO — empresa já ativou e aguarda validação */}
                  {isReadyForApproval(company) && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApprove(company); }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <i className="ri-checkbox-circle-line text-sm" aria-hidden="true"></i> Aprovar cadastro
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReject(company); }}
                        className="flex-1 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 font-semibold py-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <i className="ri-close-circle-line text-sm" aria-hidden="true"></i> Rejeitar
                      </button>
                    </>
                  )}

                  {company.status === "ativo" && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleInativar(company); }}
                        className="flex-1 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 font-semibold py-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <i className="ri-pause-circle-line text-sm" aria-hidden="true"></i> Inativar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleExcluir(company); }}
                        className="flex-1 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 font-semibold py-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <i className="ri-delete-bin-line text-sm" aria-hidden="true"></i> Excluir
                      </button>
                    </>
                  )}

                  {company.status === "inativo" && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReativar(company); }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <i className="ri-play-circle-line text-sm" aria-hidden="true"></i> Reativar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleExcluir(company); }}
                        className="flex-1 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 font-semibold py-2 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <i className="ri-delete-bin-line text-sm" aria-hidden="true"></i> Excluir
                      </button>
                    </>
                  )}

                  {company.status === "rejeitado" && company.motivoRejeicao && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <i className="ri-information-line" aria-hidden="true"></i>
                      Motivo: {company.motivoRejeicao}
                    </p>
                  )}

                  {company.status === "excluido" && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <i className="ri-delete-bin-line" aria-hidden="true"></i>
                      Empresa excluída da plataforma
                    </p>
                  )}
                </div>
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
              onReject={()  => handleReject(selectedCompany)}
            />
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-8 text-center sticky top-20">
              <div className="size-12 flex items-center justify-center mx-auto mb-3">
                <i className="ri-building-line text-gray-300 dark:text-gray-600 text-3xl" aria-hidden="true"></i>
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Selecione uma empresa para ver os detalhes</p>
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

      {/* Action Modal (Inativar / Excluir) */}
      {actionModal && (
        <CompanyActionModal
          company={actionModal.company}
          action={actionModal.action}
          onConfirm={() => handleConfirmAction(actionModal.action)}
          onClose={() => setActionModal(null)}
        />
      )}
    </div>
  );
}
