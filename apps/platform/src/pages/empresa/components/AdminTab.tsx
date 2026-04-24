import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// ──────────────────────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────────────────────

interface Solicitation {
  id: string;
  type: "contact" | "interview";
  companyName: string;
  candidateRef: string;
  jobTitle: string;
  requestedAt: string;
  status: "pending" | "scheduled" | "done";
  notes: string;
  interviewReport?: string;
  contactDetails?: string;
}

// ──────────────────────────────────────────────────────────────
// Mock data (será substituído por dados reais da API)
// ──────────────────────────────────────────────────────────────

const mockSolicitations: Solicitation[] = [
  {
    id: "s1",
    type: "interview",
    companyName: "Empresa Parceira A",
    candidateRef: "Candidato #C4",
    jobTitle: "Vendedor Externo",
    requestedAt: "2026-04-14",
    status: "done",
    notes: "Pré-entrevista realizada com sucesso.",
    interviewReport:
      "Candidato demonstrou excelente domínio de técnicas de vendas e boa comunicação. Perfil alinhado com a vaga. Recomendamos fortemente para a próxima etapa.",
  },
  {
    id: "s2",
    type: "contact",
    companyName: "Empresa Parceira A",
    candidateRef: "Candidato #C2",
    jobTitle: "Auxiliar Administrativo",
    requestedAt: "2026-04-15",
    status: "pending",
    notes: "",
    contactDetails: "Solicitado contato via WhatsApp para apresentação da proposta.",
  },
  {
    id: "s3",
    type: "interview",
    companyName: "Empresa Parceira B",
    candidateRef: "Candidato #C1",
    jobTitle: "Auxiliar Administrativo",
    requestedAt: "2026-04-16",
    status: "scheduled",
    notes: "Agendado para 18/04/2026 às 14h.",
    interviewReport: "",
  },
];

const STATUS_CONFIG = {
  pending: { label: "Pendente", color: "bg-gray-100 text-gray-600" },
  scheduled: { label: "Agendado", color: "bg-amber-100 text-amber-700" },
  done: { label: "Concluído", color: "bg-emerald-100 text-emerald-700" },
};

// ──────────────────────────────────────────────────────────────
// Seção: Gestão de Usuários
// ──────────────────────────────────────────────────────────────

function UserManagementSection() {
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"rh">("rh");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [mfaInfo, setMfaInfo] = useState<"loading" | "active" | "inactive">("loading");

  // Verifica status do MFA na montagem
  useState(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const hasVerified = data?.totp?.some((f) => f.status === "verified");
      setMfaInfo(hasVerified ? "active" : "inactive");
    });
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");
    setInviting(true);

    // Envia para o backend API (endpoint a implementar no serviço)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL ?? "https://api.santarem.app"}/v1/empresa/invite-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          gestorId: user?.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message ?? "Erro ao enviar convite.");
      }

      setInviteSuccess(true);
      setShowInviteForm(false);
      setInviteEmail("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao enviar convite. Tente novamente.";
      setInviteError(message);
    } finally {
      setInviting(false);
    }
  };

  const handleChangePassword = async () => {
    setChangingPassword(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user?.email ?? "", {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setChangingPassword(false);
    if (!error) {
      alert(`Email de redefinição enviado para ${user?.email}. Verifique sua caixa de entrada.`);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 mb-8">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-50">
          <i className="ri-team-line text-sky-600 text-sm"></i>
        </div>
        <h3 className="font-bold text-gray-900 text-base">Gestão de Acesso</h3>
      </div>

      {/* Usuário atual (Gestor) */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Sua conta (Gestor)
        </p>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
              <i className="ri-user-star-line text-sky-600 text-sm"></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-sky-600 font-medium bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full">
                  Gestor
                </span>
                {mfaInfo === "active" && (
                  <span className="text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <i className="ri-shield-check-line text-xs"></i>
                    MFA ativo
                  </span>
                )}
                {mfaInfo === "inactive" && (
                  <span className="text-xs text-red-600 font-medium bg-red-50 border border-red-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <i className="ri-shield-cross-line text-xs"></i>
                    MFA inativo
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-sky-700 border border-gray-200 hover:border-sky-300 px-3 py-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {changingPassword ? (
              <i className="ri-loader-4-line animate-spin text-xs"></i>
            ) : (
              <i className="ri-lock-password-line text-xs"></i>
            )}
            Redefinir senha
          </button>
        </div>
      </div>

      {/* Acesso adicional (colaborador) */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Acesso adicional (1 colaborador)
        </p>

        {inviteSuccess ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <i className="ri-mail-check-line text-emerald-600 text-sm"></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900">Convite enviado!</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                O colaborador receberá um email com instruções para configurar acesso e MFA.
              </p>
            </div>
          </div>
        ) : showInviteForm ? (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Email do colaborador
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colaborador@empresa.com"
                  required
                  autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-sky-400 transition-colors bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Perfil</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "rh")}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-sky-400 bg-white cursor-pointer"
                >
                  <option value="rh">RH — Visualiza candidatos e vagas</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Ações administrativas são restritas ao Gestor.
                </p>
              </div>

              {inviteError && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 flex items-center gap-2">
                  <i className="ri-error-warning-line text-red-500 text-sm shrink-0"></i>
                  <p className="text-red-600 text-xs">{inviteError}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-xs cursor-pointer transition-colors"
                >
                  {inviting ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <i className="ri-loader-4-line animate-spin text-xs"></i>
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <i className="ri-mail-send-line text-xs"></i>
                      Enviar convite
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowInviteForm(false); setInviteError(""); setInviteEmail(""); }}
                  className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-xs cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-sky-200 transition-colors">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
              <i className="ri-user-add-line text-gray-400 text-sm"></i>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Nenhum colaborador cadastrado</p>
            <p className="text-xs text-gray-400 mb-3">
              Adicione um colaborador (RH) para compartilhar o acesso ao painel.
            </p>
            <button
              onClick={() => setShowInviteForm(true)}
              className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg text-xs cursor-pointer transition-colors"
            >
              <i className="ri-user-add-line text-xs"></i>
              Convidar colaborador
            </button>
          </div>
        )}

        <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 flex items-start gap-2">
          <i className="ri-shield-keyhole-line text-amber-500 text-xs shrink-0 mt-0.5"></i>
          <p className="text-xs text-amber-700 leading-relaxed">
            O colaborador deverá configurar senha própria e autenticador MFA no primeiro acesso.
            Ações críticas (gerenciar usuários, alterar dados da empresa) são restritas ao Gestor.
          </p>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Componente principal: AdminTab
// ──────────────────────────────────────────────────────────────

export default function AdminTab() {
  const [solicitations, setSolicitations] = useState<Solicitation[]>(mockSolicitations);
  const [selected, setSelected] = useState<string | null>(null);
  const [editReport, setEditReport] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "contact" | "interview">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "scheduled" | "done">("all");

  const filtered = solicitations.filter((s) => {
    const matchType = filterType === "all" || s.type === filterType;
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchType && matchStatus;
  });

  const selectedSol = solicitations.find((s) => s.id === selected) || null;

  const handleSelect = (id: string) => {
    const sol = solicitations.find((s) => s.id === id);
    setSelected(id);
    setEditReport(sol?.interviewReport || "");
    setEditNotes(sol?.notes || "");
  };

  const handleSave = () => {
    setSolicitations((prev) =>
      prev.map((s) =>
        s.id === selected
          ? { ...s, interviewReport: editReport, notes: editNotes }
          : s
      )
    );
  };

  const handleStatusChange = (id: string, status: Solicitation["status"]) => {
    setSolicitations((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  return (
    <div>
      {/* ── Gestão de Usuários ─────────────────────────────── */}
      <UserManagementSection />

      {/* ── Solicitações VagasOeste ───────────────────────── */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 flex items-center justify-center">
            <i className="ri-admin-line text-emerald-600 text-base"></i>
          </div>
          <h2 className="font-bold text-gray-900 text-lg">Solicitações — VagasOeste</h2>
        </div>
        <p className="text-gray-500 text-sm">
          Acompanhe o status das solicitações de contato e pré-entrevistas.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total", value: solicitations.length, icon: "ri-file-list-line", color: "text-gray-700" },
          { label: "Pendentes", value: solicitations.filter((s) => s.status === "pending").length, icon: "ri-time-line", color: "text-amber-600" },
          { label: "Concluídas", value: solicitations.filter((s) => s.status === "done").length, icon: "ri-checkbox-circle-line", color: "text-emerald-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
              <i className={`${stat.icon} ${stat.color} text-xl`}></i>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex flex-wrap gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Tipo</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer"
          >
            <option value="all">Todos</option>
            <option value="contact">Contato</option>
            <option value="interview">Pré-entrevista</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendente</option>
            <option value="scheduled">Agendado</option>
            <option value="done">Concluído</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {filtered.length} solicitaç{filtered.length !== 1 ? "ões" : "ão"}
          </p>
          {filtered.map((sol) => (
            <div
              key={sol.id}
              onClick={() => handleSelect(sol.id)}
              className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
                selected === sol.id ? "border-emerald-500" : "border-gray-100 hover:border-emerald-200"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  sol.type === "contact" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {sol.type === "contact" ? "Contato" : "Pré-entrevista"}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_CONFIG[sol.status].color}`}>
                  {STATUS_CONFIG[sol.status].label}
                </span>
              </div>
              <p className="font-semibold text-gray-900 text-sm">{sol.companyName}</p>
              <p className="text-gray-500 text-xs mt-0.5">{sol.candidateRef} · {sol.jobTitle}</p>
              <p className="text-gray-400 text-xs mt-1">Solicitado em {sol.requestedAt}</p>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <p className="text-gray-400 text-sm">Nenhuma solicitação encontrada</p>
            </div>
          )}
        </div>

        {/* Detalhe */}
        <div>
          {selectedSol ? (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Detalhes</h3>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_CONFIG[selectedSol.status].color}`}>
                  {STATUS_CONFIG[selectedSol.status].label}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                {[
                  { label: "Tipo", value: selectedSol.type === "contact" ? "Solicitação de Contato" : "Pré-entrevista" },
                  { label: "Empresa", value: selectedSol.companyName },
                  { label: "Candidato", value: selectedSol.candidateRef },
                  { label: "Vaga", value: selectedSol.jobTitle },
                  { label: "Data", value: selectedSol.requestedAt },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <span className="text-xs text-gray-400 w-24 shrink-0 pt-0.5">{item.label}:</span>
                    <span className="text-sm text-gray-800 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Atualizar Status</label>
                <div className="flex gap-2 flex-wrap">
                  {(["pending", "scheduled", "done"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selectedSol.id, s)}
                      className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors whitespace-nowrap ${
                        selectedSol.status === s
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "border-gray-200 text-gray-600 hover:border-emerald-400"
                      }`}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Observações</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Adicione observações..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400 resize-none"
                />
              </div>

              {selectedSol.type === "interview" && (
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Relato da Pré-entrevista</label>
                  <textarea
                    value={editReport}
                    onChange={(e) => setEditReport(e.target.value)}
                    rows={5}
                    maxLength={500}
                    placeholder="Descreva como foi a pré-entrevista..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400 resize-none"
                  />
                  <p className="text-gray-400 text-xs mt-1 text-right">{editReport.length}/500</p>
                </div>
              )}

              <button
                onClick={handleSave}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <div className="w-10 h-10 flex items-center justify-center mx-auto mb-3">
                <i className="ri-file-list-line text-gray-300 text-2xl"></i>
              </div>
              <p className="text-gray-400 text-sm">Selecione uma solicitação para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
