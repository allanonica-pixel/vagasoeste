import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface Estado  { id: string; uf: string; nome: string; ativo: boolean; }
interface Cidade  { id: string; estadoId: string; nome: string; slug: string; ativo: boolean; }
interface Bairro  { id: string; cidadeId: string; nome: string; slug: string; ativo: boolean; }

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function AdminRegioes() {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [estadoSel, setEstadoSel] = useState<string | null>(null);
  const [cidadeSel, setCidadeSel] = useState<string | null>(null);

  const [novoEstadoUf, setNovoEstadoUf] = useState("");
  const [novoEstadoNome, setNovoEstadoNome] = useState("");
  const [novaCidadeNome, setNovaCidadeNome] = useState("");
  const [novoBairroNome, setNovoBairroNome] = useState("");

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const authHeader = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
  }, []);

  const fetchEstados = useCallback(async () => {
    const headers = await authHeader();
    const res  = await fetch(`${API_URL}/v1/admin/regioes/estados`, { headers });
    const json = await res.json();
    if (res.ok) setEstados(json.estados ?? []);
  }, [authHeader]);

  const fetchCidades = useCallback(async () => {
    const headers = await authHeader();
    const res  = await fetch(`${API_URL}/v1/admin/regioes/cidades`, { headers });
    const json = await res.json();
    if (res.ok) setCidades(json.cidades ?? []);
  }, [authHeader]);

  const fetchBairros = useCallback(async () => {
    const headers = await authHeader();
    const res  = await fetch(`${API_URL}/v1/admin/regioes/bairros`, { headers });
    const json = await res.json();
    if (res.ok) setBairros(json.bairros ?? []);
  }, [authHeader]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchEstados(), fetchCidades(), fetchBairros()]);
      setLoading(false);
    })();
  }, [fetchEstados, fetchCidades, fetchBairros]);

  // ── Criação ──
  const criarEstado = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers = await authHeader();
    const res  = await fetch(`${API_URL}/v1/admin/regioes/estados`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body:    JSON.stringify({ uf: novoEstadoUf.trim(), nome: novoEstadoNome.trim() }),
    });
    const json = await res.json();
    if (!res.ok) { showToast(json.message ?? "Erro.", "error"); return; }
    setEstados((prev) => [...prev, json.estado].sort((a, b) => a.nome.localeCompare(b.nome)));
    setNovoEstadoUf(""); setNovoEstadoNome("");
    showToast(`Estado ${json.estado.uf} cadastrado.`, "success");
  };

  const criarCidade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estadoSel) return;
    const headers = await authHeader();
    const res  = await fetch(`${API_URL}/v1/admin/regioes/cidades`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body:    JSON.stringify({ estado_id: estadoSel, nome: novaCidadeNome.trim() }),
    });
    const json = await res.json();
    if (!res.ok) { showToast(json.message ?? "Erro.", "error"); return; }
    setCidades((prev) => [...prev, json.cidade].sort((a, b) => a.nome.localeCompare(b.nome)));
    setNovaCidadeNome("");
    showToast(`Cidade "${json.cidade.nome}" cadastrada.`, "success");
  };

  const criarBairro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cidadeSel) return;
    const headers = await authHeader();
    const res  = await fetch(`${API_URL}/v1/admin/regioes/bairros`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body:    JSON.stringify({ cidade_id: cidadeSel, nome: novoBairroNome.trim() }),
    });
    const json = await res.json();
    if (!res.ok) { showToast(json.message ?? "Erro.", "error"); return; }
    setBairros((prev) => [...prev, json.bairro].sort((a, b) => a.nome.localeCompare(b.nome)));
    setNovoBairroNome("");
    showToast(`Bairro "${json.bairro.nome}" cadastrado.`, "success");
  };

  // ── Toggle ativo ──
  const toggleEstado = async (e: Estado) => {
    const headers = await authHeader();
    const res  = await fetch(`${API_URL}/v1/admin/regioes/estados/${e.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body:    JSON.stringify({ ativo: !e.ativo }),
    });
    const json = await res.json();
    if (!res.ok) { showToast(json.message ?? "Erro.", "error"); return; }
    setEstados((prev) => prev.map((x) => x.id === e.id ? json.estado : x));
  };

  const toggleCidade = async (c: Cidade) => {
    const headers = await authHeader();
    const res  = await fetch(`${API_URL}/v1/admin/regioes/cidades/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body:    JSON.stringify({ ativo: !c.ativo }),
    });
    const json = await res.json();
    if (!res.ok) { showToast(json.message ?? "Erro.", "error"); return; }
    setCidades((prev) => prev.map((x) => x.id === c.id ? json.cidade : x));
  };

  const toggleBairro = async (b: Bairro) => {
    const headers = await authHeader();
    const res  = await fetch(`${API_URL}/v1/admin/regioes/bairros/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body:    JSON.stringify({ ativo: !b.ativo }),
    });
    const json = await res.json();
    if (!res.ok) { showToast(json.message ?? "Erro.", "error"); return; }
    setBairros((prev) => prev.map((x) => x.id === b.id ? json.bairro : x));
  };

  const cidadesEstado = estadoSel ? cidades.filter((c) => c.estadoId === estadoSel) : [];
  const bairrosCidade = cidadeSel ? bairros.filter((b) => b.cidadeId === cidadeSel) : [];

  return (
    <div className="max-w-6xl">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`} role="status" aria-live="polite">
          <i className={`${toast.type === "success" ? "ri-checkbox-circle-line" : "ri-close-circle-line"} text-base shrink-0`} aria-hidden="true"></i>
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Regiões Atendidas</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
          Estado → Cidade → Bairro · Cidades ativas aparecem como opção no cadastro de empresa
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-500 text-sm py-6">
          <i className="ri-loader-4-line motion-safe:animate-spin text-emerald-600 text-lg" aria-hidden="true"></i>
          Carregando...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Coluna 1: Estados */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-3 flex items-center gap-2">
            <i className="ri-map-2-line text-emerald-600" aria-hidden="true"></i>
            Estados ({estados.length})
          </h3>
          <form onSubmit={criarEstado} className="flex gap-1.5 mb-3">
            <input
              type="text"
              value={novoEstadoUf}
              onChange={(e) => setNovoEstadoUf(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="UF"
              className="w-14 px-2 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100 text-center focus:outline-none focus:border-emerald-500 uppercase"
              maxLength={2}
            />
            <input
              type="text"
              value={novoEstadoNome}
              onChange={(e) => setNovoEstadoNome(e.target.value)}
              placeholder="Nome"
              className="flex-1 px-2 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500"
              maxLength={100}
            />
            <button
              type="submit"
              disabled={novoEstadoUf.length !== 2 || novoEstadoNome.trim().length < 3}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-2 py-1.5 rounded cursor-pointer transition-colors"
              aria-label="Adicionar estado"
            >
              <i className="ri-add-line text-base" aria-hidden="true"></i>
            </button>
          </form>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {estados.map((e) => (
              <div key={e.id} className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg cursor-pointer ${
                estadoSel === e.id ? "bg-emerald-50 dark:bg-emerald-950" : "hover:bg-gray-50 dark:hover:bg-gray-800"
              } ${!e.ativo ? "opacity-50" : ""}`}
                onClick={() => { setEstadoSel(e.id); setCidadeSel(null); }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">{e.uf}</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 truncate">{e.nome}</span>
                </div>
                <button
                  onClick={(ev) => { ev.stopPropagation(); toggleEstado(e); }}
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    e.ativo
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {e.ativo ? "Ativo" : "Inativo"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna 2: Cidades */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-3 flex items-center gap-2">
            <i className="ri-community-line text-emerald-600" aria-hidden="true"></i>
            Cidades {estadoSel && <span className="text-gray-500 font-normal">({cidadesEstado.length})</span>}
          </h3>
          {!estadoSel ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic py-4">Selecione um estado.</p>
          ) : (
            <>
              <form onSubmit={criarCidade} className="flex gap-1.5 mb-3">
                <input
                  type="text"
                  value={novaCidadeNome}
                  onChange={(e) => setNovaCidadeNome(e.target.value)}
                  placeholder="Nome da cidade"
                  className="flex-1 px-2 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500"
                  maxLength={120}
                />
                <button
                  type="submit"
                  disabled={novaCidadeNome.trim().length < 2}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-2 py-1.5 rounded cursor-pointer transition-colors"
                  aria-label="Adicionar cidade"
                >
                  <i className="ri-add-line text-base" aria-hidden="true"></i>
                </button>
              </form>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {cidadesEstado.map((c) => (
                  <div key={c.id} className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg cursor-pointer ${
                    cidadeSel === c.id ? "bg-emerald-50 dark:bg-emerald-950" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  } ${!c.ativo ? "opacity-50" : ""}`}
                    onClick={() => setCidadeSel(c.id)}
                  >
                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate flex-1">{c.nome}</span>
                    <button
                      onClick={(ev) => { ev.stopPropagation(); toggleCidade(c); }}
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        c.ativo
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {c.ativo ? "Ativa" : "Inativa"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Coluna 3: Bairros */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-3 flex items-center gap-2">
            <i className="ri-home-2-line text-emerald-600" aria-hidden="true"></i>
            Bairros {cidadeSel && <span className="text-gray-500 font-normal">({bairrosCidade.length})</span>}
          </h3>
          {!cidadeSel ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic py-4">Selecione uma cidade.</p>
          ) : (
            <>
              <form onSubmit={criarBairro} className="flex gap-1.5 mb-3">
                <input
                  type="text"
                  value={novoBairroNome}
                  onChange={(e) => setNovoBairroNome(e.target.value)}
                  placeholder="Nome do bairro"
                  className="flex-1 px-2 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500"
                  maxLength={120}
                />
                <button
                  type="submit"
                  disabled={novoBairroNome.trim().length < 2}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-2 py-1.5 rounded cursor-pointer transition-colors"
                  aria-label="Adicionar bairro"
                >
                  <i className="ri-add-line text-base" aria-hidden="true"></i>
                </button>
              </form>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {bairrosCidade.map((b) => (
                  <div key={b.id} className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 ${!b.ativo ? "opacity-50" : ""}`}>
                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate flex-1">{b.nome}</span>
                    <button
                      onClick={() => toggleBairro(b)}
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        b.ativo
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {b.ativo ? "Ativo" : "Inativo"}
                    </button>
                  </div>
                ))}
                {bairrosCidade.length === 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic py-2">Nenhum bairro nesta cidade.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
