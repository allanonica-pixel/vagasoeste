import { useState } from "react";
import {
  SECTORS,
  NEIGHBORHOODS,
  CONTRACT_TYPES,
  WORK_MODES,
  EDUCATION_LEVELS,
  CompanyJob,
} from "@/mocks/companyJobs";

interface JobFormModalProps {
  onClose: () => void;
  onSave: (job: CompanyJob) => void;
  editJob?: CompanyJob | null;
}

const EXPERIENCE_OPTIONS = [
  "Sem experiência",
  "0 a 1 ano",
  "1 a 3 anos",
  "3 a 5 anos",
  "Acima de 5 anos",
];

export default function JobFormModal({ onClose, onSave, editJob }: JobFormModalProps) {
  const [form, setForm] = useState({
    title: editJob?.title || "",
    sector: editJob?.sector || "",
    area: editJob?.area || "",
    contractType: editJob?.contractType || "CLT",
    workMode: editJob?.workMode || "Presencial",
    neighborhood: editJob?.neighborhood || "",
    city: "Santarém",
    state: "Pará",
    salaryRange: editJob?.salaryRange || "",
    description: editJob?.description || "",
    requirements: editJob?.requirements || "",
    benefits: editJob?.benefits || "",
    educationLevel: editJob?.educationLevel || "Ensino Médio",
    experienceYears: editJob?.experienceYears || "Sem experiência",
    vacancies: editJob?.vacancies || 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Título é obrigatório";
    if (!form.sector) newErrors.sector = "Setor é obrigatório";
    if (!form.area.trim()) newErrors.area = "Área é obrigatória";
    if (!form.neighborhood) newErrors.neighborhood = "Bairro é obrigatório";
    if (!form.description.trim()) newErrors.description = "Descrição é obrigatória";
    if (!form.requirements.trim()) newErrors.requirements = "Requisitos são obrigatórios";
    return newErrors;
  };

  const handleNext = () => {
    if (step === 1) {
      const errs: Record<string, string> = {};
      if (!form.title.trim()) errs.title = "Título é obrigatório";
      if (!form.sector) errs.sector = "Setor é obrigatório";
      if (!form.area.trim()) errs.area = "Área é obrigatória";
      if (!form.neighborhood) errs.neighborhood = "Bairro é obrigatório";
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const newJob: CompanyJob = {
      id: editJob?.id || `cj${Date.now()}`,
      ...form,
      isActive: true,
      createdAt: editJob?.createdAt || new Date().toISOString().split("T")[0],
      applicantsCount: editJob?.applicantsCount || 0,
    };
    onSave(newJob);
  };

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {editJob ? "Editar Vaga" : "Publicar Nova Vaga"}
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">Passo {step} de 2</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <i className="ri-close-line text-gray-500 text-lg"></i>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 pt-4 flex items-center gap-3">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= s ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                {s}
              </div>
              <span className={`text-xs font-medium ${step >= s ? "text-emerald-700" : "text-gray-400"}`}>
                {s === 1 ? "Informações Básicas" : "Descrição e Requisitos"}
              </span>
              {s < 2 && <div className={`flex-1 h-px w-8 ${step > s ? "bg-emerald-300" : "bg-gray-200"}`}></div>}
            </div>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {step === 1 && (
            <>
              {/* Título */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  Título da Vaga <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Ex: Auxiliar Administrativo, Vendedor, Técnico de TI..."
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 transition-colors ${
                    errors.title ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Setor + Área */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Setor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.sector}
                    onChange={(e) => set("sector", e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 cursor-pointer transition-colors ${
                      errors.sector ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                  >
                    <option value="">Selecione o setor</option>
                    {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.sector && <p className="text-red-500 text-xs mt-1">{errors.sector}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Área / Departamento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.area}
                    onChange={(e) => set("area", e.target.value)}
                    placeholder="Ex: Vendas, RH, Financeiro..."
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 transition-colors ${
                      errors.area ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                  />
                  {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                </div>
              </div>

              {/* Contrato + Modalidade */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Tipo de Contrato</label>
                  <select
                    value={form.contractType}
                    onChange={(e) => set("contractType", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    {CONTRACT_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Modalidade</label>
                  <select
                    value={form.workMode}
                    onChange={(e) => set("workMode", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    {WORK_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Bairro + Vagas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Bairro <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.neighborhood}
                    onChange={(e) => set("neighborhood", e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 cursor-pointer transition-colors ${
                      errors.neighborhood ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                  >
                    <option value="">Selecione o bairro</option>
                    {NEIGHBORHOODS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  {errors.neighborhood && <p className="text-red-500 text-xs mt-1">{errors.neighborhood}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Número de Vagas</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={form.vacancies}
                    onChange={(e) => set("vacancies", parseInt(e.target.value) || 1)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Salário */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Faixa Salarial</label>
                <input
                  type="text"
                  value={form.salaryRange}
                  onChange={(e) => set("salaryRange", e.target.value)}
                  placeholder="Ex: R$ 1.800 – R$ 2.200 ou A combinar"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400"
                />
              </div>

              {/* Escolaridade + Experiência */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Escolaridade Mínima</label>
                  <select
                    value={form.educationLevel}
                    onChange={(e) => set("educationLevel", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    {EDUCATION_LEVELS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Experiência Necessária</label>
                  <select
                    value={form.experienceYears}
                    onChange={(e) => set("experienceYears", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    {EXPERIENCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Descrição */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  Descrição da Vaga <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">Descreva as atividades e responsabilidades do cargo.</p>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={5}
                  maxLength={500}
                  placeholder="Descreva as principais atividades, responsabilidades e o dia a dia da função..."
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 resize-none transition-colors ${
                    errors.description ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {errors.description ? (
                    <p className="text-red-500 text-xs">{errors.description}</p>
                  ) : <span />}
                  <span className="text-xs text-gray-400">{form.description.length}/500</span>
                </div>
              </div>

              {/* Requisitos */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  Requisitos <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">Liste os requisitos obrigatórios e desejáveis.</p>
                <textarea
                  value={form.requirements}
                  onChange={(e) => set("requirements", e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Ex: Ensino médio completo, CNH B, experiência em vendas, Excel básico..."
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 resize-none transition-colors ${
                    errors.requirements ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {errors.requirements ? (
                    <p className="text-red-500 text-xs">{errors.requirements}</p>
                  ) : <span />}
                  <span className="text-xs text-gray-400">{form.requirements.length}/500</span>
                </div>
              </div>

              {/* Benefícios */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Benefícios</label>
                <textarea
                  value={form.benefits}
                  onChange={(e) => set("benefits", e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Ex: Vale transporte, vale refeição, plano de saúde, 13º salário..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 resize-none"
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-400">{form.benefits.length}/500</span>
                </div>
              </div>

              {/* Preview Card */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1.5">
                  <i className="ri-eye-line"></i>
                  Prévia da vaga
                </p>
                <p className="font-bold text-gray-900 text-sm">{form.title || "Título da vaga"}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {form.sector && (
                    <span className="text-xs bg-white border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full">
                      Setor {form.sector}
                    </span>
                  )}
                  {form.contractType && (
                    <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                      {form.contractType}
                    </span>
                  )}
                  {form.workMode && (
                    <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                      {form.workMode}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  {form.neighborhood && (
                    <span className="flex items-center gap-1">
                      <i className="ri-map-pin-line text-emerald-500"></i>
                      {form.neighborhood}, Santarém/PA
                    </span>
                  )}
                  {form.salaryRange && (
                    <span className="flex items-center gap-1">
                      <i className="ri-money-dollar-circle-line text-emerald-500"></i>
                      {form.salaryRange}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100">
          {step === 1 ? (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
            >
              Cancelar
            </button>
          ) : (
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
            >
              <i className="ri-arrow-left-line text-sm"></i>
              Voltar
            </button>
          )}

          {step === 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm cursor-pointer transition-colors whitespace-nowrap"
            >
              Próximo
              <i className="ri-arrow-right-line text-sm"></i>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm cursor-pointer transition-colors whitespace-nowrap"
            >
              <i className="ri-check-line text-sm"></i>
              {editJob ? "Salvar Alterações" : "Publicar Vaga"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
