import { useState } from "react";
import { CurriculoData, Idioma, Curso } from "./CurriculoEditor";

interface Props {
  data: CurriculoData;
  update: (partial: Partial<CurriculoData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const HABILIDADES_SUGERIDAS = [
  "Pacote Office", "Excel Avançado", "Word", "PowerPoint", "Google Workspace",
  "Atendimento ao Cliente", "Vendas", "Negociação", "Liderança", "Trabalho em Equipe",
  "Comunicação", "Organização", "Proatividade", "Resolução de Problemas",
  "Gestão de Tempo", "Análise de Dados", "Redes Sociais", "Canva", "Photoshop",
  "SAP", "Totvs", "CRM", "Logística", "Estoque", "Financeiro", "Contabilidade",
];

const NIVEIS_IDIOMA = ["Básico", "Intermediário", "Avançado", "Fluente", "Nativo"];

export default function CurriculoStepHabilidades({ data, update, onNext, onPrev }: Props) {
  const [novaHab, setNovaHab] = useState("");
  const [addingIdioma, setAddingIdioma] = useState(false);
  const [addingCurso, setAddingCurso] = useState(false);
  const [idiomaForm, setIdiomaForm] = useState({ idioma: "", nivel: "" });
  const [cursoForm, setCursoForm] = useState({ titulo: "", instituicao: "", cargaHoraria: "", ano: "" });

  const toggleHab = (h: string) => {
    if (data.habilidades.includes(h)) {
      update({ habilidades: data.habilidades.filter((x) => x !== h) });
    } else {
      update({ habilidades: [...data.habilidades, h] });
    }
  };

  const addCustomHab = () => {
    const trimmed = novaHab.trim();
    if (trimmed && !data.habilidades.includes(trimmed)) {
      update({ habilidades: [...data.habilidades, trimmed] });
    }
    setNovaHab("");
  };

  const removeHab = (h: string) => {
    update({ habilidades: data.habilidades.filter((x) => x !== h) });
  };

  const addIdioma = () => {
    if (!idiomaForm.idioma || !idiomaForm.nivel) return;
    update({ idiomas: [...data.idiomas, { ...idiomaForm, id: Date.now().toString() }] });
    setIdiomaForm({ idioma: "", nivel: "" });
    setAddingIdioma(false);
  };

  const removeIdioma = (id: string) => {
    update({ idiomas: data.idiomas.filter((i) => i.id !== id) });
  };

  const addCurso = () => {
    if (!cursoForm.titulo || !cursoForm.instituicao) return;
    update({ cursos: [...data.cursos, { ...cursoForm, id: Date.now().toString() }] });
    setCursoForm({ titulo: "", instituicao: "", cargaHoraria: "", ano: "" });
    setAddingCurso(false);
  };

  const removeCurso = (id: string) => {
    update({ cursos: data.cursos.filter((c) => c.id !== id) });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Habilidades, Idiomas e Cursos</h2>
        <p className="text-gray-500 text-sm">Selecione ou adicione suas habilidades, idiomas e cursos complementares.</p>
      </div>

      {/* Habilidades */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">Habilidades</p>

        {/* Selecionadas */}
        {data.habilidades.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {data.habilidades.map((h) => (
              <span key={h} className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {h}
                <button onClick={() => removeHab(h)} className="w-3 h-3 flex items-center justify-center cursor-pointer hover:text-emerald-900">
                  <i className="ri-close-line text-xs"></i>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Sugestões */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {HABILIDADES_SUGERIDAS.filter((h) => !data.habilidades.includes(h)).map((h) => (
            <button
              key={h}
              onClick={() => toggleHab(h)}
              className="text-xs text-gray-600 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 hover:border-emerald-300 px-2.5 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap"
            >
              + {h}
            </button>
          ))}
        </div>

        {/* Adicionar personalizada */}
        <div className="flex gap-2">
          <input
            type="text"
            value={novaHab}
            onChange={(e) => setNovaHab(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomHab()}
            placeholder="Adicionar habilidade personalizada..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
          <button
            onClick={addCustomHab}
            disabled={!novaHab.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* Idiomas */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">Idiomas</p>
        {data.idiomas.length > 0 && (
          <div className="space-y-2 mb-3">
            {data.idiomas.map((i) => (
              <div key={i.id} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                <div>
                  <span className="text-sm font-medium text-gray-800">{i.idioma}</span>
                  <span className="text-xs text-gray-500 ml-2">— {i.nivel}</span>
                </div>
                <button onClick={() => removeIdioma(i.id)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 cursor-pointer">
                  <i className="ri-close-line text-sm"></i>
                </button>
              </div>
            ))}
          </div>
        )}
        {addingIdioma ? (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <input
                type="text"
                value={idiomaForm.idioma}
                onChange={(e) => setIdiomaForm((f) => ({ ...f, idioma: e.target.value }))}
                placeholder="Ex: Inglês"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex-1">
              <select
                value={idiomaForm.nivel}
                onChange={(e) => setIdiomaForm((f) => ({ ...f, nivel: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">Nível</option>
                {NIVEIS_IDIOMA.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button onClick={addIdioma} disabled={!idiomaForm.idioma || !idiomaForm.nivel} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-semibold px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap">
              OK
            </button>
            <button onClick={() => setAddingIdioma(false)} className="text-gray-400 hover:text-gray-600 text-sm px-2 py-2 cursor-pointer whitespace-nowrap">
              Cancelar
            </button>
          </div>
        ) : (
          <button onClick={() => setAddingIdioma(true)} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1.5 cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line text-sm"></i></div>
            Adicionar idioma
          </button>
        )}
      </div>

      {/* Cursos Complementares */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Cursos Complementares</p>
        {data.cursos.length > 0 && (
          <div className="space-y-2 mb-3">
            {data.cursos.map((c) => (
              <div key={c.id} className="flex items-start justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.titulo}</p>
                  <p className="text-xs text-gray-500">{c.instituicao}{c.cargaHoraria ? ` · ${c.cargaHoraria}h` : ""}{c.ano ? ` · ${c.ano}` : ""}</p>
                </div>
                <button onClick={() => removeCurso(c.id)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 cursor-pointer shrink-0">
                  <i className="ri-close-line text-sm"></i>
                </button>
              </div>
            ))}
          </div>
        )}
        {addingCurso ? (
          <div className="border border-emerald-200 rounded-xl p-3 bg-emerald-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="md:col-span-2">
                <input type="text" value={cursoForm.titulo} onChange={(e) => setCursoForm((f) => ({ ...f, titulo: e.target.value }))} placeholder="Título do curso *" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white" />
              </div>
              <input type="text" value={cursoForm.instituicao} onChange={(e) => setCursoForm((f) => ({ ...f, instituicao: e.target.value }))} placeholder="Instituição *" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white" />
              <div className="flex gap-2">
                <input type="number" value={cursoForm.cargaHoraria} onChange={(e) => setCursoForm((f) => ({ ...f, cargaHoraria: e.target.value }))} placeholder="Carga (h)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white" />
                <input type="text" value={cursoForm.ano} onChange={(e) => setCursoForm((f) => ({ ...f, ano: e.target.value }))} placeholder="Ano" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setAddingCurso(false)} className="text-gray-500 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer whitespace-nowrap">Cancelar</button>
              <button onClick={addCurso} disabled={!cursoForm.titulo || !cursoForm.instituicao} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-semibold px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap">Adicionar</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAddingCurso(true)} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1.5 cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line text-sm"></i></div>
            Adicionar curso complementar
          </button>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={onPrev} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium text-sm cursor-pointer whitespace-nowrap transition-colors">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line text-sm"></i></div>
          Voltar
        </button>
        <button onClick={onNext} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 text-sm">
          Ver Prévia
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-eye-line text-sm"></i></div>
        </button>
      </div>
    </div>
  );
}
