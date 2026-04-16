import { useState } from "react";
import { CurriculoData, Formacao } from "./CurriculoEditor";

interface Props {
  data: CurriculoData;
  update: (partial: Partial<CurriculoData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const NIVEIS = ["Ensino Fundamental", "Ensino Médio", "Técnico", "Tecnólogo", "Graduação", "Pós-Graduação", "MBA", "Mestrado", "Doutorado"];

const EMPTY: Omit<Formacao, "id"> = {
  curso: "",
  instituicao: "",
  nivel: "",
  inicio: "",
  fim: "",
  atual: false,
};

export default function CurriculoStepFormacao({ data, update, onNext, onPrev }: Props) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<Formacao, "id">>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);

  const handleSave = () => {
    if (!form.curso.trim() || !form.instituicao.trim() || !form.nivel) return;
    if (editId) {
      update({ formacoes: data.formacoes.map((f) => (f.id === editId ? { ...form, id: editId } : f)) });
      setEditId(null);
    } else {
      update({ formacoes: [...data.formacoes, { ...form, id: Date.now().toString() }] });
    }
    setForm(EMPTY);
    setAdding(false);
  };

  const handleEdit = (f: Formacao) => {
    setForm({ curso: f.curso, instituicao: f.instituicao, nivel: f.nivel, inicio: f.inicio, fim: f.fim, atual: f.atual });
    setEditId(f.id);
    setAdding(true);
  };

  const handleRemove = (id: string) => {
    update({ formacoes: data.formacoes.filter((f) => f.id !== id) });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Formação Acadêmica</h2>
        <p className="text-gray-500 text-sm">Adicione sua escolaridade e cursos de formação.</p>
      </div>

      {data.formacoes.length > 0 && (
        <div className="space-y-3 mb-4">
          {data.formacoes.map((f) => (
            <div key={f.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{f.curso}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{f.instituicao}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{f.nivel}</span>
                    <span className="text-gray-400 text-xs">{f.inicio}{f.fim || f.atual ? ` — ${f.atual ? "Cursando" : f.fim}` : ""}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleEdit(f)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer">
                    <i className="ri-edit-line text-sm"></i>
                  </button>
                  <button onClick={() => handleRemove(f.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                    <i className="ri-delete-bin-line text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/30 mb-4">
          <p className="text-sm font-semibold text-gray-800 mb-3">{editId ? "Editar formação" : "Nova formação"}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Curso / Área *</label>
              <input
                type="text"
                value={form.curso}
                onChange={(e) => setForm((f) => ({ ...f, curso: e.target.value }))}
                placeholder="Ex: Administração de Empresas"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Instituição *</label>
              <input
                type="text"
                value={form.instituicao}
                onChange={(e) => setForm((f) => ({ ...f, instituicao: e.target.value }))}
                placeholder="Nome da instituição"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nível *</label>
              <select
                value={form.nivel}
                onChange={(e) => setForm((f) => ({ ...f, nivel: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white cursor-pointer"
              >
                <option value="">Selecione</option>
                {NIVEIS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Início</label>
              <input
                type="month"
                value={form.inicio}
                onChange={(e) => setForm((f) => ({ ...f, inicio: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Conclusão</label>
              <div className="flex items-center gap-2">
                <input
                  type="month"
                  value={form.fim}
                  onChange={(e) => setForm((f) => ({ ...f, fim: e.target.value }))}
                  disabled={form.atual}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white disabled:opacity-40"
                />
                <label className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={form.atual}
                    onChange={(e) => setForm((f) => ({ ...f, atual: e.target.checked, fim: "" }))}
                    className="accent-emerald-600"
                  />
                  <span className="text-xs text-gray-600">Cursando</span>
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={() => { setForm(EMPTY); setAdding(false); setEditId(null); }} className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!form.curso.trim() || !form.instituicao.trim() || !form.nivel}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              {editId ? "Salvar edição" : "Adicionar"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-xl py-4 text-sm text-gray-400 hover:text-emerald-600 transition-all cursor-pointer flex items-center justify-center gap-2 mb-4"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-add-line text-sm"></i>
          </div>
          Adicionar formação
        </button>
      )}

      <div className="flex justify-between mt-2">
        <button onClick={onPrev} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium text-sm cursor-pointer whitespace-nowrap transition-colors">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line text-sm"></i></div>
          Voltar
        </button>
        <button onClick={onNext} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 text-sm">
          Próximo
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-line text-sm"></i></div>
        </button>
      </div>
    </div>
  );
}
