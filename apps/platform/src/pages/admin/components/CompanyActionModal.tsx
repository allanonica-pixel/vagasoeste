/**
 * CompanyActionModal — modal para inativar ou excluir empresa
 *
 * - Carrega motivos pré-cadastrados via API
 * - Permite cadastrar novo motivo inline
 * - Exibe aviso de impacto (vagas, login bloqueado)
 * - Registra na trilha de auditoria
 */

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { AdminCompany } from "@/mocks/adminData";

const API_URL = import.meta.env.VITE_API_URL ?? import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000";

interface Reason {
  id: string;
  reason: string;
  action_type: string;
}

interface Props {
  company: AdminCompany;
  action: "inativar" | "excluir";
  onConfirm: () => void;
  onClose: () => void;
}

export default function CompanyActionModal({ company, action, onConfirm, onClose }: Props) {
  const [reasons, setReasons]         = useState<Reason[]>([]);
  const [selectedId, setSelectedId]   = useState<string>("");
  const [newReason, setNewReason]     = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [savingReason, setSavingReason] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const firstFocusRef = useRef<HTMLSelectElement>(null);

  const actionType = action === "inativar" ? "inativacao" : "exclusao";
  const actionLabel = action === "inativar" ? "Inativar" : "Excluir";
  const actionColor = action === "inativar"
    ? "bg-amber-600 hover:bg-amber-700"
    : "bg-red-600 hover:bg-red-700";

  // Carrega motivos da API
  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const res = await fetch(
          `${API_URL}/v1/admin/action-reasons?action_type=${actionType}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        if (res.ok) {
          const json = await res.json();
          setReasons(json.reasons ?? []);
        }
      } catch { /* silencia */ }
    }
    load();
    // Foca no select ao abrir
    setTimeout(() => firstFocusRef.current?.focus(), 100);
  }, [actionType]);

  // Salva novo motivo
  async function handleSaveNewReason() {
    if (!newReason.trim()) return;
    setSavingReason(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`${API_URL}/v1/admin/action-reasons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason: newReason.trim(), action_type: actionType }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erro ao salvar."); return; }
      const saved = json.reason as Reason;
      setReasons((prev) => [...prev, saved].sort((a, b) => a.reason.localeCompare(b.reason)));
      setSelectedId(saved.id);
      setNewReason("");
      setShowNewForm(false);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setSavingReason(false);
    }
  }

  // Executa a ação principal
  async function handleConfirm() {
    const reasonObj = reasons.find((r) => r.id === selectedId);
    if (!selectedId && !newReason.trim()) {
      setError("Selecione ou cadastre um motivo para continuar.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Se tem texto novo mas não foi salvo, salva agora
      let finalReasonId = selectedId;
      let finalReasonText = reasonObj?.reason ?? "";

      if (showNewForm && newReason.trim() && !selectedId) {
        const res = await fetch(`${API_URL}/v1/admin/action-reasons`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ reason: newReason.trim(), action_type: actionType }),
        });
        const json = await res.json();
        if (res.ok) {
          finalReasonId = json.reason.id;
          finalReasonText = newReason.trim();
        }
      }

      const res = await fetch(`${API_URL}/v1/admin/companies/${company.id}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          reason_id:   finalReasonId || undefined,
          reason_text: finalReasonText || newReason.trim() || undefined,
          admin_name:  session?.user.email ?? "Administrador",
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erro ao executar ação."); return; }

      onConfirm();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Fecha com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="action-modal-title"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-xl flex items-center justify-center ${
              action === "inativar" ? "bg-amber-100 dark:bg-amber-950" : "bg-red-100 dark:bg-red-950"
            }`}>
              <i className={`text-lg ${
                action === "inativar" ? "ri-pause-circle-line text-amber-600 dark:text-amber-400" : "ri-delete-bin-line text-red-600 dark:text-red-400"
              }`} aria-hidden="true"></i>
            </div>
            <div>
              <h2 id="action-modal-title" className="font-bold text-gray-900 dark:text-gray-100 text-base text-balance">
                {actionLabel} Empresa
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{company.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="size-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
          >
            <i className="ri-close-line text-lg" aria-hidden="true"></i>
          </button>
        </div>

        {/* Impacto */}
        <div className={`rounded-xl p-4 mb-5 ${
          action === "inativar"
            ? "bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800"
            : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
        }`}>
          <p className={`text-xs font-semibold mb-2 ${
            action === "inativar" ? "text-amber-800 dark:text-amber-300" : "text-red-800 dark:text-red-300"
          }`}>
            <i className="ri-error-warning-line mr-1" aria-hidden="true"></i>
            Impacto desta ação
          </p>
          <ul className={`text-xs space-y-1 ${
            action === "inativar" ? "text-amber-700 dark:text-amber-400" : "text-red-700 dark:text-red-400"
          }`}>
            <li>• Todas as vagas ativas serão {action === "inativar" ? "pausadas" : "encerradas"} automaticamente</li>
            <li>• Os usuários da empresa não conseguirão fazer login</li>
            {action === "inativar" && (
              <li>• O gestor pode reativar o acesso via recuperação de senha</li>
            )}
            {action === "excluir" && (
              <li>• A exclusão é permanente e não pode ser desfeita por aqui</li>
            )}
          </ul>
        </div>

        {/* Seleção de motivo */}
        <div className="mb-4">
          <label htmlFor="reason-select" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Motivo da {action === "inativar" ? "Inativação" : "Exclusão"} *
          </label>
          {!showNewForm ? (
            <div className="flex gap-2">
              <select
                id="reason-select"
                ref={firstFocusRef}
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="flex-1 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option value="">Selecione um motivo...</option>
                {reasons.map((r) => (
                  <option key={r.id} value={r.id}>{r.reason}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewForm(true)}
                className="shrink-0 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                aria-label="Cadastrar novo motivo"
              >
                <i className="ri-add-line text-base" aria-hidden="true"></i>
                Novo
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="Descreva o motivo..."
                autoFocus
                className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveNewReason}
                  disabled={savingReason || !newReason.trim()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  {savingReason ? (
                    <><i className="ri-loader-4-line motion-safe:animate-spin" aria-hidden="true"></i> Salvando...</>
                  ) : (
                    <><i className="ri-save-line" aria-hidden="true"></i> Salvar e selecionar</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewForm(false); setNewReason(""); }}
                  className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Erro */}
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 text-xs text-red-700 dark:text-red-400 flex items-center gap-2" role="alert">
            <i className="ri-error-warning-line shrink-0" aria-hidden="true"></i>
            {error}
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || (!selectedId && !newReason.trim())}
            className={`flex-1 text-white text-sm font-bold py-2.5 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2 ${actionColor}`}
          >
            {loading ? (
              <><i className="ri-loader-4-line motion-safe:animate-spin" aria-hidden="true"></i> Executando...</>
            ) : (
              <><i className={action === "inativar" ? "ri-pause-circle-line" : "ri-delete-bin-line"} aria-hidden="true"></i> Confirmar {actionLabel}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
