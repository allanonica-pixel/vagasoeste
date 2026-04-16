import { useState } from "react";
import { CurriculoData, Experiencia } from "./CurriculoEditor";

interface Props {
  data: CurriculoData;
  update: (partial: Partial<CurriculoData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const EMPTY_EXP: Omit<Experiencia, "id"> = {
  cargo: "",
  empresa: "",
  inicio: "",
  fim: "",
  atual: false,
  descricao: "",
};

export default function CurriculoStepExperiencias({ data, update, onNext, onPrev }: Props) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<Experiencia, "id">>(EMPTY_EXP);
  const [editId, setEditId] = useState<string | null>(null);

  const handleSave = () => {
    if (!form.cargo.trim() || !form.empresa.trim() || !form.inicio) return;
    if (editId) {
      update({
        experiencias: data.experiencias.map((e) =>
          e.id === editId ? { ...form, id: editId } : e
        ),
      });
      setEditId(null);
    } else {
      update({
        experiencias: [...data.experiencias, { ...form, id: Date.now().toString() }],
      });
    }
    setForm(EMPTY_EXP);
    setAdding(false);
  };

  const handleEdit = (exp: Experiencia) => {
    setForm({ cargo: exp.cargo, empresa: exp.empresa, inicio: exp.inicio, fim: exp.fim, atual: exp.atual, descricao: exp.descricao });
    setEditId(exp.id);
    setAdding(true);
  };

  const handleRemove = (id: string) => {
    update({ experiencias: data.experiencias.filter((e) => e.id !== id) });
  };

  const handleCancel = () => {
    setForm(EMPTY_EXP);
    setAdding(false);
    setEditId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Experiências Profissionais</h2>
        <p className="text-gray-500 text-sm">Adicione suas experiências mais relevantes. Sem experiência? Pode pular esta etapa.</p>
      </div>

      {/* Lista de experiências */}
      {data.experiencias.length > 0 && (
        <div className="space-y-3 mb-4">
          {data.experiencias.map((exp) => (
            <div key={exp.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{exp.cargo}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{exp.empresa}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {exp.inicio} — {exp.atual ? "Atual" : exp.fim}
                  </p>
                  {exp.descricao && (
                    <p className="text-gray-500 text-xs mt-1.5 leading-relaxed line-clamp-2">{exp.descricao}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    <i className="ri-edit-line text-sm"></i>
                  </button>
                  <button
                    onClick={() => handleRemove(exp.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <i className="ri-delete-bin-line text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulário de adição */}
      {adding ? (
        <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/30 mb-4">
          <p className="text-sm font-semibold text-gray-800 mb-3">{editId ? "Editar experiência" : "Nova experiência"}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cargo *</label>
              <input
                type="text"
                value={form.cargo}
                onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}
                placeholder="Ex: Auxiliar Administrativo"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Empresa *</label>
              <input
                type="text"
                value={form.empresa}
                onChange={(e) => setForm((f) => ({ ...f, empresa: e.target.value }))}
                placeholder="Nome da empresa"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Início *</label>
              <input
                type="month"
                value={form.inicio}
                onChange={(e) => setForm((f) => ({ ...f, inicio: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fim</label>
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
                  <span className="text-xs text-gray-600">Atual</span>
                </label>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Descrição das atividades</label>
              <textarea
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                placeholder="Descreva suas principais atividades e conquistas..."
                rows={3}
                maxLength={500}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 bg-white resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!form.cargo.trim() || !form.empresa.trim() || !form.inicio}
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
          Adicionar experiência
        </button>
      )}

      <div className="flex justify-between mt-2">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium text-sm cursor-pointer whitespace-nowrap transition-colors"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-arrow-left-line text-sm"></i>
          </div>
          Voltar
        </button>
        <button
          onClick={onNext}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 text-sm"
        >
          Próximo
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-arrow-right-line text-sm"></i>
          </div>
        </button>
      </div>
    </div>
  );
}
