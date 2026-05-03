import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface Setor {
  id: string;
  nome: string;
  slug: string;
  ordem: number;
  ativo: boolean;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function AdminSetores() {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoNome, setNovoNome] = useState("");
  const [novoOrdem, setNovoOrdem] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editOrdem, setEditOrdem] = useState(0);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const authHeader = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
  }, []);

  const fetchSetores = useCallback(async () => {
    setLoading(true);
    const headers = await authHeader();
    const res  = await fetch(`${API_URL}/v1/admin/setores`, { headers });
    const json = await res.json();
    if (res.ok) setSetores(json.setores ?? []);
    else showToast(json.message ?? "Erro ao carregar setores.", "error");
    setLoading(false);
  }, [authHeader]);

  useEffect(() => { fetchSetores(); }, [fetchSetores]);

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || novoNome.trim().length < 2) return;
    setSubmitting(true);
    const headers = await authHeader();
    const res  = await fetch(`${API_URL}/v1/admin/setores`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body:    JSON.stringify({ nome: novoNome.trim(), ordem: novoOrdem }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      showToast(json.message ?? json.error ?? "Erro ao criar setor.", "error");
      return;
    }
    setSetores((prev) => [...prev, json.setor].sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome)));
    setNovoNome("");
    setNovoOrdem(0);
    showToast(`Setor "${json.setor.nome}" criado.`, "success");
  };

  const startEdit = (s: Setor) => { setEditingId(s.id); setEditNome(s.nome); setEditOrdem(s.ordem); };
  const cancelEdit = () => { setEditingId(null); setEditNome(""); setEditOrdem(0); };

  const saveEdit = async (id: string) => {
    if (editNome.trim().length < 2) return;
    const headers = await authHeader();
    const res  = await fetch(`${API_URL}/v1/admin/setores/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body:    JSON.stringify({ nome: editNome.trim(), ordem: editOrdem }),
    });
    const json = await res.json();
    if (!res.ok) {
      showToast(json.message ?? "Erro ao atualizar.", "error");
      return;
    }
    setSetores((prev) => prev.map((s) => s.id === id ? json.setor : s).sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome)));
    cancelEdit();
    showToast("Setor atualizado.", "success");
  };

  const toggleAtivo = async (s: Setor) => {
    const headers = await authHeader();
    const res  = await fetch(`${API_URL}/v1/admin/setores/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body:    JSON.stringify({ ativo: !s.ativo }),
    });
    const json = await res.json();
    if (!res.ok) {
      showToast(json.message ?? "Erro ao alterar status.", "error");
      return;
    }
    setSetores((prev) => prev.map((x) => x.id === s.id ? json.setor : x));
    showToast(`Setor "${s.nome}" ${json.setor.ativo ? "ativado" : "desativado"}.`, "success");
  };

  return (
    <div className="max-w-5xl">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`} role="status" aria-live="polite">
          <i className={`${toast.type === "success" ? "ri-checkbox-circle-line" : "ri-close-circle-line"} text-base shrink-0`} aria-hidden="true"></i>
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Setores de Atuação</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
          {setores.length} setor{setores.length !== 1 ? "es" : ""} cadastrado{setores.length !== 1 ? "s" : ""} · Aparecem no formulário de pré-cadastro de empresa
        </p>
      </div>

      {/* Formulário de criação */}
      <form onSubmit={handleCriar} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 mb-5 flex gap-2 items-end flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="novo-setor-nome" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Nome do setor</label>
          <input
            id="novo-setor-nome"
            type="text"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Ex: Saúde, Comércio, Tecnologia..."
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500"
            maxLength={100}
          />
        </div>
        <div className="w-24">
          <label htmlFor="novo-setor-ordem" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Ordem</label>
          <input
            id="novo-setor-ordem"
            type="number"
            value={novoOrdem}
            onChange={(e) => setNovoOrdem(Number(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || novoNome.trim().length < 2}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          <i className="ri-add-line text-base" aria-hidden="true"></i>
          Adicionar
        </button>
      </form>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm py-6">
          <i className="ri-loader-4-line motion-safe:animate-spin text-emerald-600 text-lg" aria-hidden="true"></i>
          Carregando...
        </div>
      ) : setores.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-8 text-center">
          <i className="ri-stack-line text-4xl text-gray-200 dark:text-gray-700 mb-3 block" aria-hidden="true"></i>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum setor cadastrado ainda.</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Use o formulário acima pra adicionar.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase">
              <tr>
                <th className="text-left px-4 py-2 font-semibold">Nome</th>
                <th className="text-left px-4 py-2 font-semibold">Slug</th>
                <th className="text-center px-4 py-2 font-semibold">Ordem</th>
                <th className="text-center px-4 py-2 font-semibold">Status</th>
                <th className="text-right px-4 py-2 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {setores.map((s) => (
                <tr key={s.id} className={!s.ativo ? "opacity-50" : ""}>
                  <td className="px-4 py-2.5">
                    {editingId === s.id ? (
                      <input
                        type="text"
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.nome}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <code className="text-xs text-gray-500 dark:text-gray-400 font-mono">{s.slug}</code>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {editingId === s.id ? (
                      <input
                        type="number"
                        value={editOrdem}
                        onChange={(e) => setEditOrdem(Number(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100 text-center focus:outline-none focus:border-emerald-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-600 dark:text-gray-400">{s.ordem}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => toggleAtivo(s)}
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full cursor-pointer transition-colors ${
                        s.ativo
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                      aria-label={s.ativo ? `Desativar ${s.nome}` : `Ativar ${s.nome}`}
                    >
                      {s.ativo ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {editingId === s.id ? (
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => saveEdit(s.id)} className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold px-2 py-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950 cursor-pointer">Salvar</button>
                        <button onClick={cancelEdit} className="text-xs text-gray-500 hover:text-gray-700 font-semibold px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">Cancelar</button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(s)} className="text-xs text-sky-600 hover:text-sky-700 font-semibold px-2 py-1 rounded hover:bg-sky-50 dark:hover:bg-sky-950 cursor-pointer">Editar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
