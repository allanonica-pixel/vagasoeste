import { useState } from "react";
import { Candidate, CandidateStatus, mockCandidates, EDUCATION_LEVELS_FILTER } from "@/mocks/candidates";
import CandidateDetail from "./CandidateDetail";

import { STATUS_CONFIG } from "./CandidateDetail";

const GENDER_LABELS: Record<string, string> = {
  M: "Masculino",
  F: "Feminino",
  NB: "Não-binário",
  NI: "Não informado",
};

export default function CandidatesTab() {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [selected, setSelected] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"todos" | "favoritados">("todos");

  // Filters
  const [filterEducation, setFilterEducation] = useState("Todos");
  const [filterGender, setFilterGender] = useState("Todos");
  const [filterJob, setFilterJob] = useState("Todos");

  const jobTitles = ["Todos", ...Array.from(new Set(candidates.map((c) => c.jobTitle)))];

  const filtered = candidates.filter((c) => {
    const matchEdu = filterEducation === "Todos" || c.educationLevel === filterEducation;
    const matchGender = filterGender === "Todos" || c.gender === filterGender;
    const matchJob = filterJob === "Todos" || c.jobTitle === filterJob;
    const matchFav = activeSubTab === "todos" || c.isFavorited;
    return matchEdu && matchGender && matchJob && matchFav;
  });

  const selectedCandidate = candidates.find((c) => c.id === selected) || null;

  const handleFavorite = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorited: !c.isFavorited } : c))
    );
  };

  const handleRequest = (id: string, type: "contact" | "interview") => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const alreadyExists = c.requests.some((r) => r.type === type && r.status !== "done");
        if (alreadyExists) return c;
        return {
          ...c,
          requests: [
            ...c.requests,
            {
              type,
              requestedAt: new Date().toISOString().split("T")[0],
              status: "pending" as const,
              contactDetails: type === "contact" ? "Solicitação enviada para a equipe VagasOeste." : undefined,
              interviewReport: undefined,
            },
          ],
        };
      })
    );
  };

  const handleBulkRequest = (ids: string[], type: "contact" | "interview") => {
    ids.forEach((id) => handleRequest(id, type));
  };

  const handleStatusChange = (id: string, newStatus: CandidateStatus, note: string) => {
    const today = new Date().toISOString().split("T")[0];
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          status: newStatus,
          statusHistory: [
            ...c.statusHistory,
            { status: newStatus, date: today, note: note || undefined },
          ],
        };
      })
    );
  };

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-5">
        {(["todos", "favoritados"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveSubTab(tab); setSelected(null); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeSubTab === tab ? "bg-white text-gray-900" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab === "todos" ? (
              <>Todos os Candidatos <span className="ml-1 text-xs text-gray-400">({candidates.length})</span></>
            ) : (
              <>
                <i className="ri-heart-line mr-1"></i>
                Favoritados <span className="ml-1 text-xs text-gray-400">({candidates.filter((c) => c.isFavorited).length})</span>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Filtros</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Escolaridade</label>
            <select
              value={filterEducation}
              onChange={(e) => setFilterEducation(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer"
            >
              {EDUCATION_LEVELS_FILTER.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Sexo</label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="NB">Não-binário</option>
              <option value="NI">Prefiro não informar</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Função (Vaga)</label>
            <select
              value={filterJob}
              onChange={(e) => setFilterJob(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer"
            >
              {jobTitles.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>
        </div>
        {(filterEducation !== "Todos" || filterGender !== "Todos" || filterJob !== "Todos") && (
          <button
            onClick={() => { setFilterEducation("Todos"); setFilterGender("Todos"); setFilterJob("Todos"); }}
            className="mt-3 text-xs text-emerald-600 hover:underline cursor-pointer"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Bulk actions for favoritados */}
      {activeSubTab === "favoritados" && filtered.length > 0 && (
        <FavoritedBulkActions
          candidates={filtered}
          onBulkRequest={handleBulkRequest}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 space-y-3">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
            {filtered.length} candidato{filtered.length !== 1 ? "s" : ""}
          </p>
          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <div className="w-10 h-10 flex items-center justify-center mx-auto mb-2">
                <i className="ri-user-search-line text-gray-300 text-2xl"></i>
              </div>
              <p className="text-gray-400 text-sm">Nenhum candidato encontrado</p>
            </div>
          )}
          {filtered.map((candidate) => (
            <div
              key={candidate.id}
              onClick={() => setSelected(candidate.id)}
              className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
                selected === candidate.id ? "border-emerald-500" : "border-gray-100 hover:border-emerald-200"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center relative">
                  <i className="ri-user-line text-gray-400 text-sm"></i>
                  {candidate.isFavorited && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center">
                      <i className="ri-heart-fill text-white text-xs" style={{ fontSize: "8px" }}></i>
                    </div>
                  )}
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CONFIG[candidate.status]?.bg} ${STATUS_CONFIG[candidate.status]?.color}`}>
                  {STATUS_CONFIG[candidate.status]?.label}
                </span>
              </div>
              <p className="font-semibold text-gray-900 text-sm">Candidato Anônimo</p>
              <p className="text-gray-700 text-xs mt-0.5">{candidate.jobTitle}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-gray-600 text-xs">
                  <i className="ri-map-pin-line text-emerald-500 text-xs"></i>
                  {candidate.neighborhood}
                </span>
                <span className="flex items-center gap-1 text-gray-600 text-xs">
                  <i className="ri-user-line text-gray-400 text-xs"></i>
                  {candidate.age} anos
                </span>
                {candidate.isPCD && (
                  <span className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full font-medium">PCD</span>
                )}
              </div>
              {candidate.requests.length > 0 && (
                <div className="mt-2 flex gap-1 flex-wrap">
                  {candidate.requests.map((r, i) => (
                    <span key={i} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      r.type === "contact" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {r.type === "contact" ? "Contato solicitado" : "Pré-entrevista"}
                      {r.status === "done" && " ✓"}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selectedCandidate ? (
            <CandidateDetail
              candidate={selectedCandidate}
              onFavorite={handleFavorite}
              onRequest={handleRequest}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <i className="ri-user-search-line text-gray-300 text-3xl"></i>
              </div>
              <p className="text-gray-400 text-sm">Selecione um candidato para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FavoritedBulkActions({
  candidates,
  onBulkRequest,
}: {
  candidates: Candidate[];
  onBulkRequest: (ids: string[], type: "contact" | "interview") => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState<"contact" | "interview" | null>(null);

  const toggleId = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleConfirm = () => {
    if (!showConfirm) return;
    onBulkRequest(selectedIds, showConfirm);
    setSelectedIds([]);
    setShowConfirm(null);
  };

  return (
    <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-5">
      <p className="text-sm font-semibold text-rose-800 mb-3">
        <i className="ri-heart-line mr-1"></i>
        Ações em lote para favoritados
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {candidates.map((c) => (
          <button
            key={c.id}
            onClick={() => toggleId(c.id)}
            className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors whitespace-nowrap ${
              selectedIds.includes(c.id)
                ? "bg-rose-500 text-white border-rose-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
            }`}
          >
            {c.jobTitle} · {c.neighborhood}
          </button>
        ))}
      </div>
      {selectedIds.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowConfirm("interview")}
            className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
          >
            <i className="ri-calendar-check-line mr-1"></i>
            Solicitar Pré-entrevista ({selectedIds.length})
          </button>
          <button
            onClick={() => setShowConfirm("contact")}
            className="text-xs bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
          >
            <i className="ri-phone-line mr-1"></i>
            Solicitar Contato ({selectedIds.length})
          </button>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 mb-2">Confirmar solicitação</h3>
            <p className="text-gray-500 text-sm mb-4">
              Você está solicitando <strong>{showConfirm === "contact" ? "Contato" : "Pré-entrevista"}</strong> para{" "}
              <strong>{selectedIds.length} candidato{selectedIds.length > 1 ? "s" : ""}</strong>. Isso será enviado ao painel administrativo da VagasOeste.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm cursor-pointer hover:bg-gray-50">Cancelar</button>
              <button onClick={handleConfirm} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
