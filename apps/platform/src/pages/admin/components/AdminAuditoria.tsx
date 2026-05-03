/**
 * AdminAuditoria — trilha de auditoria da plataforma
 *
 * Exibe o log de ações realizadas em empresas (inativação, exclusão, reativação)
 * identificando quem realizou (admin ou empresa) com data/hora no fuso de Fortaleza.
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { formatDateTimeBR } from "@/utils/date";

const API_URL = import.meta.env.VITE_API_URL ?? import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000";

interface AuditEntry {
  id: string;
  pre_cadastro_id: string | null;
  company_id: string | null;
  company_name: string;
  company_cnpj: string | null;
  action: string;
  reason_text: string | null;
  performed_by_name: string;
  performed_by_role: string;
  performed_at: string;
  company_action_reasons?: { reason: string; action_type: string } | null;
}

const ACTION_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  inativacao: { label: "Inativação",  icon: "ri-pause-circle-line",     color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950"  },
  reativacao: { label: "Reativação",  icon: "ri-play-circle-line",      color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950" },
  exclusao:   { label: "Exclusão",    icon: "ri-delete-bin-line",       color: "text-red-600 dark:text-red-400",      bg: "bg-red-50 dark:bg-red-950"      },
};

const ROLE_CONFIG: Record<string, { label: string; icon: string }> = {
  admin:   { label: "Admin",   icon: "ri-admin-line" },
  empresa: { label: "Empresa", icon: "ri-building-line" },
};

export default function AdminAuditoria() {
  const [log, setLog]           = useState<AuditEntry[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [filterAction, setFilterAction] = useState("todos");
  const [filterRole, setFilterRole]     = useState("todos");
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(0);
  const PAGE_SIZE = 20;

  const fetchLog = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const params = new URLSearchParams({
        limit:  String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      });
      if (filterAction !== "todos") params.set("action", filterAction);
      if (filterRole   !== "todos") params.set("role",   filterRole);

      const res = await fetch(`${API_URL}/v1/admin/audit?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const json = await res.json();
        setLog(json.log ?? []);
        setTotal(json.total ?? 0);
      }
    } catch { /* silencia */ }
    finally { setLoading(false); }
  }, [filterAction, filterRole, page]);

  useEffect(() => { fetchLog(); }, [fetchLog]);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [filterAction, filterRole]);

  const filtered = search.trim()
    ? log.filter((e) =>
        e.company_name.toLowerCase().includes(search.toLowerCase()) ||
        (e.company_cnpj ?? "").includes(search) ||
        e.performed_by_name.toLowerCase().includes(search.toLowerCase())
      )
    : log;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Auditoria</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
          Trilha de ações realizadas na plataforma — {total} registro{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 size-4 flex items-center justify-center">
              <i className="ri-search-line text-gray-400 text-xs" aria-hidden="true"></i>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar empresa, CNPJ ou usuário..."
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400 cursor-pointer"
          >
            <option value="todos">Todos os tipos</option>
            <option value="inativacao">Inativações</option>
            <option value="reativacao">Reativações</option>
            <option value="exclusao">Exclusões</option>
          </select>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400 cursor-pointer"
          >
            <option value="todos">Todos os perfis</option>
            <option value="admin">Admin</option>
            <option value="empresa">Empresa</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm py-6">
          <i className="ri-loader-4-line motion-safe:animate-spin text-emerald-600 text-lg" aria-hidden="true"></i>
          Carregando auditoria...
        </div>
      )}

      {/* Lista */}
      {!loading && (
        <>
          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-10 text-center">
              <div className="size-12 flex items-center justify-center mx-auto mb-3">
                <i className="ri-shield-check-line text-gray-300 dark:text-gray-600 text-3xl" aria-hidden="true"></i>
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Nenhum registro de auditoria encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((entry) => {
                const actionCfg = ACTION_CONFIG[entry.action] ?? ACTION_CONFIG.inativacao;
                const roleCfg   = ROLE_CONFIG[entry.performed_by_role] ?? ROLE_CONFIG.admin;
                const reason    = entry.company_action_reasons?.reason ?? entry.reason_text;

                return (
                  <div
                    key={entry.id}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4"
                  >
                    <div className="flex items-start gap-3">
                      {/* Ícone da ação */}
                      <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${actionCfg.bg}`}>
                        <i className={`${actionCfg.icon} text-lg ${actionCfg.color}`} aria-hidden="true"></i>
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${actionCfg.bg} ${actionCfg.color}`}>
                            {actionCfg.label}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                            {entry.company_name}
                          </span>
                          {entry.company_cnpj && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">{entry.company_cnpj}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500 dark:text-gray-400">
                          {/* Quem fez */}
                          <span className="flex items-center gap-1">
                            <i className={`${roleCfg.icon} text-emerald-500`} aria-hidden="true"></i>
                            <strong className="text-gray-700 dark:text-gray-300">{entry.performed_by_name}</strong>
                            <span className="text-gray-400">({roleCfg.label})</span>
                          </span>
                          {/* Quando */}
                          <span className="flex items-center gap-1">
                            <i className="ri-calendar-line" aria-hidden="true"></i>
                            {formatDateTimeBR(entry.performed_at)}
                          </span>
                        </div>

                        {/* Motivo */}
                        {reason && (
                          <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 py-1.5">
                            <i className="ri-chat-quote-line mr-1 text-gray-400" aria-hidden="true"></i>
                            {reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 text-sm">
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                Página {page + 1} de {totalPages} · {total} registros
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <i className="ri-arrow-left-line" aria-hidden="true"></i> Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Próxima <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
