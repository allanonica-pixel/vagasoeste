import { useState } from "react";

const SECTORS = [
  "Comércio", "Saúde", "Tecnologia", "Logística", "Alimentação",
  "Indústria", "Serviços", "Construção Civil", "Educação", "Financeiro", "Agronegócio",
];
const CONTRACT_TYPES = ["CLT", "PJ", "Temporário", "Freelance", "Estágio"];
const WORK_MODES = ["Presencial", "Híbrido", "Remoto"];
const EDUCATION_LEVELS = [
  "Ensino Fundamental", "Ensino Médio", "Técnico",
  "Superior Incompleto", "Superior Completo", "Pós-graduação",
];
const NEIGHBORHOODS = [
  "Centro", "Maracanã", "Jardim Santarém", "Aldeia", "Santa Clara",
  "Aparecida", "Caranazal", "Diamantino", "Laguinho", "Prainha",
];

interface VagaForm {
  id: string;
  title: string;
  sector: string;
  area: string;
  contractType: string;
  workMode: string;
  neighborhood: string;
  salaryRange: string;
  description: string;
  requirements: string;
  benefits: string;
  educationLevel: string;
  vacancies: string;
}

const emptyVaga = (): VagaForm => ({
  id: Math.random().toString(36).slice(2),
  title: "",
  sector: "",
  area: "",
  contractType: "CLT",
  workMode: "Presencial",
  neighborhood: "",
  salaryRange: "",
  description: "",
  requirements: "",
  benefits: "",
  educationLevel: "Ensino Médio",
  vacancies: "1",
});

interface PreCadastroVagasProps {
  companyName: string;
  onFinish: () => void;
  onBack: () => void;
}

export default function PreCadastroVagas({ companyName, onFinish, onBack }: PreCadastroVagasProps) {
  const [vagas, setVagas] = useState<VagaForm[]>([emptyVaga()]);
  const [activeVaga, setActiveVaga] = useState(0);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const updateVaga = (index: number, field: keyof VagaForm, value: string) => {
    setVagas((prev) => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
    setErrors((prev) => ({
      ...prev,
      [index]: { ...(prev[index] || {}), [field]: "" },
    }));
  };

  const addVaga = () => {
    setVagas((prev) => [...prev, emptyVaga()]);
    setActiveVaga(vagas.length);
  };

  const removeVaga = (index: number) => {
    if (vagas.length === 1) return;
    setVagas((prev) => prev.filter((_, i) => i !== index));
    setActiveVaga(Math.max(0, index - 1));
  };

  const validateVaga = (vaga: VagaForm, index: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (!vaga.title) newErrors.title = "Campo obrigatório";
    if (!vaga.sector) newErrors.sector = "Selecione um setor";
    if (!vaga.area) newErrors.area = "Campo obrigatório";
    if (!vaga.neighborhood) newErrors.neighborhood = "Selecione um bairro";
    if (!vaga.description || vaga.description.length < 30) newErrors.description = "Descreva a vaga (mínimo 30 caracteres)";
    if (!vaga.requirements) newErrors.requirements = "Campo obrigatório";
    setErrors((prev) => ({ ...prev, [index]: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleFinish = () => {
    let allValid = true;
    vagas.forEach((vaga, i) => {
      if (!validateVaga(vaga, i)) allValid = false;
    });
    if (!allValid) {
      // Find first invalid vaga
      const firstInvalid = vagas.findIndex((_, i) => Object.keys(errors[i] || {}).length > 0);
      if (firstInvalid >= 0) setActiveVaga(firstInvalid);
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onFinish();
    }, 1500);
  };

  const vaga = vagas[activeVaga];
  const vagaErrors = errors[activeVaga] || {};

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
              <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <i className="ri-briefcase-line text-emerald-600 text-sm" aria-hidden="true"></i>
              </div>
              Cadastrar Vagas
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Cadastre as vagas de <strong>{companyName}</strong>. Elas ficarão disponíveis no site público após aprovação do cadastro pela VagasOeste.
            </p>
          </div>
          <button
            type="button"
            onClick={addVaga}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors whitespace-nowrap"
          >
            <i className="ri-add-line text-sm" aria-hidden="true"></i>
            Nova vaga
          </button>
        </div>

        {/* Vaga Tabs */}
        {vagas.length > 1 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {vagas.map((v, i) => (
              <button
                key={v.id}
                onClick={() => setActiveVaga(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeVaga === i
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Vaga {i + 1}
                {v.title && <span className="opacity-70 truncate max-w-[80px]">· {v.title}</span>}
                {vagas.length > 1 && (
                  <span
                    onClick={(e) => { e.stopPropagation(); removeVaga(i); }}
                    className="ml-1 hover:text-red-400 cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label={`Remover vaga ${i + 1}`}
                  >
                    <i className="ri-close-line text-xs" aria-hidden="true"></i>
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Vaga Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-800 text-sm">
            Vaga {activeVaga + 1} {vagas.length > 1 && `de ${vagas.length}`}
          </h4>
          {Object.keys(vagaErrors).length > 0 && (
            <span className="text-xs text-red-500 flex items-center gap-1">
              <i className="ri-error-warning-line" aria-hidden="true"></i>
              Preencha os campos obrigatórios
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Título */}
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Título da Vaga <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={vaga.title}
              onChange={(e) => updateVaga(activeVaga, "title", e.target.value)}
              placeholder="Ex: Auxiliar Administrativo, Vendedor, Cozinheiro..."
              className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors ${
                vagaErrors.title ? "border-red-300" : "border-gray-200 focus:border-emerald-400"
              }`}
            />
            {vagaErrors.title && <p className="text-red-500 text-xs mt-1">{vagaErrors.title}</p>}
          </div>

          {/* Setor */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Setor <span className="text-red-400">*</span>
            </label>
            <select
              value={vaga.sector}
              onChange={(e) => updateVaga(activeVaga, "sector", e.target.value)}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors cursor-pointer ${
                vagaErrors.sector ? "border-red-300" : "border-gray-200 focus:border-emerald-400"
              }`}
            >
              <option value="">Selecione...</option>
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {vagaErrors.sector && <p className="text-red-500 text-xs mt-1">{vagaErrors.sector}</p>}
          </div>

          {/* Área */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Área / Função <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={vaga.area}
              onChange={(e) => updateVaga(activeVaga, "area", e.target.value)}
              placeholder="Ex: Administrativo, Vendas, Cozinha..."
              className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors ${
                vagaErrors.area ? "border-red-300" : "border-gray-200 focus:border-emerald-400"
              }`}
            />
            {vagaErrors.area && <p className="text-red-500 text-xs mt-1">{vagaErrors.area}</p>}
          </div>

          {/* Tipo de Contrato */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Tipo de Contrato</label>
            <select
              value={vaga.contractType}
              onChange={(e) => updateVaga(activeVaga, "contractType", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 cursor-pointer"
            >
              {CONTRACT_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Modalidade */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Modalidade</label>
            <select
              value={vaga.workMode}
              onChange={(e) => updateVaga(activeVaga, "workMode", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 cursor-pointer"
            >
              {WORK_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Bairro */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Bairro <span className="text-red-400">*</span>
            </label>
            <select
              value={vaga.neighborhood}
              onChange={(e) => updateVaga(activeVaga, "neighborhood", e.target.value)}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors cursor-pointer ${
                vagaErrors.neighborhood ? "border-red-300" : "border-gray-200 focus:border-emerald-400"
              }`}
            >
              <option value="">Selecione...</option>
              {NEIGHBORHOODS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            {vagaErrors.neighborhood && <p className="text-red-500 text-xs mt-1">{vagaErrors.neighborhood}</p>}
          </div>

          {/* Faixa Salarial */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Faixa Salarial</label>
            <input
              type="text"
              value={vaga.salaryRange}
              onChange={(e) => updateVaga(activeVaga, "salaryRange", e.target.value)}
              placeholder="Ex: R$ 1.800 – R$ 2.200 ou A combinar"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          {/* Escolaridade */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Escolaridade Mínima</label>
            <select
              value={vaga.educationLevel}
              onChange={(e) => updateVaga(activeVaga, "educationLevel", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 cursor-pointer"
            >
              {EDUCATION_LEVELS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          {/* Número de Vagas */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Número de Vagas</label>
            <input
              type="number"
              min="1"
              max="99"
              value={vaga.vacancies}
              onChange={(e) => updateVaga(activeVaga, "vacancies", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          {/* Descrição */}
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Descrição da Vaga <span className="text-red-400">*</span>
            </label>
            <textarea
              value={vaga.description}
              onChange={(e) => updateVaga(activeVaga, "description", e.target.value)}
              placeholder="Descreva as principais atividades e responsabilidades do cargo..."
              rows={4}
              maxLength={500}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors resize-none ${
                vagaErrors.description ? "border-red-300" : "border-gray-200 focus:border-emerald-400"
              }`}
            />
            <div className="flex justify-between mt-1">
              {vagaErrors.description
                ? <p className="text-red-500 text-xs">{vagaErrors.description}</p>
                : <span />
              }
              <span className="text-xs text-gray-400">{vaga.description.length}/500</span>
            </div>
          </div>

          {/* Requisitos */}
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Requisitos <span className="text-red-400">*</span>
            </label>
            <textarea
              value={vaga.requirements}
              onChange={(e) => updateVaga(activeVaga, "requirements", e.target.value)}
              placeholder="Liste os requisitos obrigatórios para a vaga..."
              rows={3}
              maxLength={500}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors resize-none ${
                vagaErrors.requirements ? "border-red-300" : "border-gray-200 focus:border-emerald-400"
              }`}
            />
            {vagaErrors.requirements && <p className="text-red-500 text-xs mt-1">{vagaErrors.requirements}</p>}
          </div>

          {/* Benefícios */}
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Benefícios</label>
            <input
              type="text"
              value={vaga.benefits}
              onChange={(e) => updateVaga(activeVaga, "benefits", e.target.value)}
              placeholder="Ex: Vale transporte, vale refeição, plano de saúde..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Pending notice */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mt-4 flex items-start gap-3">
        <div className="size-5 flex items-center justify-center mt-0.5 shrink-0">
          <i className="ri-time-line text-amber-600 text-sm" aria-hidden="true"></i>
        </div>
        <div>
          <p className="text-amber-900 font-semibold text-sm mb-1">Vagas ficam pendentes até aprovação</p>
          <p className="text-amber-700 text-xs leading-relaxed">
            As vagas cadastradas aqui ficarão com status <strong>Pendente</strong> até que a equipe VagasOeste valide o cadastro da empresa. Após aprovação, elas serão publicadas automaticamente no site público e você receberá um email de confirmação.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 font-medium px-6 py-3 rounded-xl text-sm cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          <i className="ri-arrow-left-line text-sm" aria-hidden="true"></i>
          Voltar
        </button>
        <button
          onClick={handleFinish}
          disabled={submitting}
          className={`flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {submitting ? (
            <>
              <i className="ri-loader-4-line motion-safe:animate-spin text-sm" role="status" aria-label="Enviando pré-cadastro"></i>
              Enviando pré-cadastro...
            </>
          ) : (
            <>
              <i className="ri-send-plane-line text-sm" aria-hidden="true"></i>
              Enviar pré-cadastro ({vagas.length} vaga{vagas.length !== 1 ? "s" : ""})
            </>
          )}
        </button>
      </div>
    </div>
  );
}
