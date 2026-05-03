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

  // Edição inline de nome (UF do estado é imutável depois de criado pra evitar inconsistência)
  const [editEstadoId, setEditEstadoId] = useState<string | null>(null);
  const [editEstadoNome, setEditEstadoNome] = useState("");
  const [editCidadeId, setEditCidadeId] = useState<string | null>(null);
  const [editCidadeNome, setEditCidadeNome] = useState("");
  const [editBairroId, setEditBairroId] = useState<string | null>(null);
  const [editBairroNome, setEditBairroNome] = useState("");

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

  // ── Edição inline de nome (estado/cidade/bairro) ──
  const saveEstadoNome = async (id: string) => {
    if (editEstadoNome.trim().length < 3) return;
    const headers = await authHeader();
    const res  = await fetch(`${API_URL}/v1/admin/regioes/estados/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body:    JSON.stringify({ nome: editEstadoNome.trim() }),
    });
    const json = await res.json();
    if (!res.ok) { showToast(json.message ?? "Erro.", "error"); return; }
    setEstados((prev) => prev.map((x) => x.id === id ? json.estado : x).sort((a, b) => a.nome.localeCompare(b.nome)));
    setEditEstadoId(null);
    showToast("Estado atualizado.", "success");
  };

  const saveCidadeNome = async (id: string) => {
    if (editCidadeNome.trim().length < 2) return;
    const headers = await authHeader();
    const res  = await fetch(`${API_URL}/v1/admin/regioes/cidades/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body:    JSON.stringify({ nome: editCidadeNome.trim() }),
    });
    const json = await res.json();
    if (!res.ok) { showToast(json.message ?? "Erro.", "error"); return; }
    setCidades((prev) => prev.map((x) => x.id === id ? json.cidade : x).sort((a, b) => a.nome.localeCompare(b.nome)));
    setEditCidadeId(null);
    showToast("Cidade atualizada.", "success");
  };

  const saveBairroNome = async (id: string) => {
    if (editBairroNome.trim().length < 2) return;
    const headers = await authHeader();
    const res  = await fetch(`${API_URL}/v1/admin/regioes/bairros/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...headers },
      body:    JSON.stringify({ nome: editBairroNome.trim() }),
    });
    const json = await res.json();
    if (!res.ok) { showToast(json.message ?? "Erro.", "error"); return; }
    setBairros((prev) => prev.map((x) => x.id === id ? json.bairro : x).sort((a, b) => a.nome.localeCompare(b.nome)));
    setEditBairroId(null);
    showToast("Bairro atualizado.", "success");
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
          Hierarquia <strong>Estado → Cidade → Bairro</strong>. Cidades ativas aparecem como opção no cadastro de empresa.
        </p>
        <div className="mt-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-3 flex items-start gap-2">
          <i className="ri-information-line text-blue-600 text-base shrink-0 mt-0.5" aria-hidden="true"></i>
          <div className="text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
            <strong>Como cadastrar:</strong> primeiro o estado (UF + nome por extenso, ex. "PA" + "Pará"). Depois <strong>clique no estado</strong> que aparecer pra liberar o card de Cidades. Mesmo padrão pra adicionar bairros: clique numa cidade.
          </div>
        </div>
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
          <form onSubmit={criarEstado} className="space-y-2 mb-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Sigla (UF)</label>
              <input
                type="text"
                value={novoEstadoUf}
                onChange={(e) => setNovoEstadoUf(e.target.value.toUpperCase().slice(0, 2))}
                placeholder="Ex.: PA, SP, MG"
                className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 uppercase"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Nome do estado</label>
              <input
                type="text"
                value={novoEstadoNome}
                onChange={(e) => setNovoEstadoNome(e.target.value)}
                placeholder="Ex.: Pará, São Paulo"
                className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500"
                maxLength={100}
              />
            </div>
            <button
              type="submit"
              disabled={novoEstadoUf.length !== 2 || novoEstadoNome.trim().length < 3}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-2 py-1.5 rounded cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <i className="ri-add-line text-base" aria-hidden="true"></i>
              Adicionar estado
            </button>
          </form>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {estados.map((e) => (
              <div key={e.id}
                className={`group flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg ${
                  estadoSel === e.id ? "bg-emerald-50 dark:bg-emerald-950 ring-1 ring-emerald-300 dark:ring-emerald-800" : "hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                } ${!e.ativo ? "opacity-50" : ""}`}
                onClick={() => editEstadoId !== e.id && (setEstadoSel(e.id), setCidadeSel(null))}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300 shrink-0">{e.uf}</span>
                  {editEstadoId === e.id ? (
                    <input
                      type="text"
                      value={editEstadoNome}
                      onChange={(ev) => setEditEstadoNome(ev.target.value)}
                      onClick={(ev) => ev.stopPropagation()}
                      onKeyDown={(ev) => { if (ev.key === "Enter") saveEstadoNome(e.id); if (ev.key === "Escape") setEditEstadoId(null); }}
                      className="flex-1 px-2 py-0.5 border border-emerald-300 dark:border-emerald-700 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100 focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate">{e.nome}</span>
                  )}
                  {estadoSel === e.id && editEstadoId !== e.id && (
                    <i className="ri-arrow-right-s-line text-emerald-600 text-base shrink-0" aria-hidden="true" title="Selecionado"></i>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {editEstadoId === e.id ? (
                    <>
                      <button onClick={(ev) => { ev.stopPropagation(); saveEstadoNome(e.id); }} className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold px-1.5 py-0.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950">Salvar</button>
                      <button onClick={(ev) => { ev.stopPropagation(); setEditEstadoId(null); }} className="text-xs text-gray-500 hover:text-gray-700 font-semibold px-1.5 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800">×</button>
                    </>
                  ) : (
                    <>
                      <button onClick={(ev) => { ev.stopPropagation(); setEditEstadoId(e.id); setEditEstadoNome(e.nome); }} className="text-xs text-sky-600 hover:text-sky-700 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded hover:bg-sky-50 dark:hover:bg-sky-950" aria-label={`Editar nome de ${e.nome}`}>Editar</button>
                      <button onClick={(ev) => { ev.stopPropagation(); toggleEstado(e); }}
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          e.ativo
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {e.ativo ? "Ativo" : "Inativo"}
                      </button>
                    </>
                  )}
                </div>
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
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
              <i className="ri-arrow-left-line text-gray-400 text-base mb-1 block" aria-hidden="true"></i>
              <p className="text-xs text-gray-500 dark:text-gray-400">Selecione um estado à esquerda<br />pra cadastrar suas cidades.</p>
            </div>
          ) : (
            <>
              <form onSubmit={criarCidade} className="space-y-2 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Nome da cidade</label>
                  <input
                    type="text"
                    value={novaCidadeNome}
                    onChange={(e) => setNovaCidadeNome(e.target.value)}
                    placeholder="Ex.: Santarém, Itaituba"
                    className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500"
                    maxLength={120}
                  />
                </div>
                <button
                  type="submit"
                  disabled={novaCidadeNome.trim().length < 2}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-2 py-1.5 rounded cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <i className="ri-add-line text-base" aria-hidden="true"></i>
                  Adicionar cidade
                </button>
              </form>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {cidadesEstado.map((c) => (
                  <div key={c.id}
                    className={`group flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg ${
                      cidadeSel === c.id ? "bg-emerald-50 dark:bg-emerald-950 ring-1 ring-emerald-300 dark:ring-emerald-800" : "hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    } ${!c.ativo ? "opacity-50" : ""}`}
                    onClick={() => editCidadeId !== c.id && setCidadeSel(c.id)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {editCidadeId === c.id ? (
                        <input
                          type="text"
                          value={editCidadeNome}
                          onChange={(ev) => setEditCidadeNome(ev.target.value)}
                          onClick={(ev) => ev.stopPropagation()}
                          onKeyDown={(ev) => { if (ev.key === "Enter") saveCidadeNome(c.id); if (ev.key === "Escape") setEditCidadeId(null); }}
                          className="flex-1 px-2 py-0.5 border border-emerald-300 dark:border-emerald-700 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm text-gray-900 dark:text-gray-100 truncate flex-1">{c.nome}</span>
                      )}
                      {cidadeSel === c.id && editCidadeId !== c.id && (
                        <i className="ri-arrow-right-s-line text-emerald-600 text-base shrink-0" aria-hidden="true"></i>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {editCidadeId === c.id ? (
                        <>
                          <button onClick={(ev) => { ev.stopPropagation(); saveCidadeNome(c.id); }} className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold px-1.5 py-0.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950">Salvar</button>
                          <button onClick={(ev) => { ev.stopPropagation(); setEditCidadeId(null); }} className="text-xs text-gray-500 hover:text-gray-700 font-semibold px-1.5 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800">×</button>
                        </>
                      ) : (
                        <>
                          <button onClick={(ev) => { ev.stopPropagation(); setEditCidadeId(c.id); setEditCidadeNome(c.nome); }} className="text-xs text-sky-600 hover:text-sky-700 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded hover:bg-sky-50 dark:hover:bg-sky-950" aria-label={`Editar nome de ${c.nome}`}>Editar</button>
                          <button onClick={(ev) => { ev.stopPropagation(); toggleCidade(c); }}
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              c.ativo
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {c.ativo ? "Ativa" : "Inativa"}
                          </button>
                        </>
                      )}
                    </div>
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
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
              <i className="ri-arrow-left-line text-gray-400 text-base mb-1 block" aria-hidden="true"></i>
              <p className="text-xs text-gray-500 dark:text-gray-400">Selecione uma cidade no card<br />ao lado pra cadastrar bairros.</p>
            </div>
          ) : (
            <>
              <form onSubmit={criarBairro} className="space-y-2 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Nome do bairro</label>
                  <input
                    type="text"
                    value={novoBairroNome}
                    onChange={(e) => setNovoBairroNome(e.target.value)}
                    placeholder="Ex.: Aldeia, Centro, Maracanã"
                    className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500"
                    maxLength={120}
                  />
                </div>
                <button
                  type="submit"
                  disabled={novoBairroNome.trim().length < 2}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-2 py-1.5 rounded cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <i className="ri-add-line text-base" aria-hidden="true"></i>
                  Adicionar bairro
                </button>
              </form>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {bairrosCidade.map((b) => (
                  <div key={b.id} className={`group flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 ${!b.ativo ? "opacity-50" : ""}`}>
                    {editBairroId === b.id ? (
                      <input
                        type="text"
                        value={editBairroNome}
                        onChange={(ev) => setEditBairroNome(ev.target.value)}
                        onKeyDown={(ev) => { if (ev.key === "Enter") saveBairroNome(b.id); if (ev.key === "Escape") setEditBairroId(null); }}
                        className="flex-1 px-2 py-0.5 border border-emerald-300 dark:border-emerald-700 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100 focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm text-gray-900 dark:text-gray-100 truncate flex-1">{b.nome}</span>
                    )}
                    <div className="flex items-center gap-1 shrink-0">
                      {editBairroId === b.id ? (
                        <>
                          <button onClick={() => saveBairroNome(b.id)} className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold px-1.5 py-0.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950">Salvar</button>
                          <button onClick={() => setEditBairroId(null)} className="text-xs text-gray-500 hover:text-gray-700 font-semibold px-1.5 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800">×</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditBairroId(b.id); setEditBairroNome(b.nome); }} className="text-xs text-sky-600 hover:text-sky-700 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded hover:bg-sky-50 dark:hover:bg-sky-950" aria-label={`Editar ${b.nome}`}>Editar</button>
                          <button onClick={() => toggleBairro(b)}
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              b.ativo
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {b.ativo ? "Ativo" : "Inativo"}
                          </button>
                        </>
                      )}
                    </div>
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
