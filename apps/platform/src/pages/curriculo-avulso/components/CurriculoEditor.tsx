import { useState } from "react";
import CurriculoStepDados from "./CurriculoStepDados";
import CurriculoStepObjetivo from "./CurriculoStepObjetivo";
import CurriculoStepExperiencias from "./CurriculoStepExperiencias";
import CurriculoStepFormacao from "./CurriculoStepFormacao";
import CurriculoStepHabilidades from "./CurriculoStepHabilidades";
import CurriculoPreview from "./CurriculoPreview";

export interface CurriculoData {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  linkedin: string;
  objetivo: string;
  experiencias: Experiencia[];
  formacoes: Formacao[];
  habilidades: string[];
  idiomas: Idioma[];
  cursos: Curso[];
}

export interface Experiencia {
  id: string;
  cargo: string;
  empresa: string;
  inicio: string;
  fim: string;
  atual: boolean;
  descricao: string;
}

export interface Formacao {
  id: string;
  curso: string;
  instituicao: string;
  nivel: string;
  inicio: string;
  fim: string;
  atual: boolean;
}

export interface Idioma {
  id: string;
  idioma: string;
  nivel: string;
}

export interface Curso {
  id: string;
  titulo: string;
  instituicao: string;
  cargaHoraria: string;
  ano: string;
}

const INITIAL_DATA: CurriculoData = {
  nome: "",
  email: "",
  telefone: "",
  cidade: "",
  estado: "",
  linkedin: "",
  objetivo: "",
  experiencias: [],
  formacoes: [],
  habilidades: [],
  idiomas: [],
  cursos: [],
};

const STEPS = [
  { id: 1, label: "Dados", icon: "ri-user-line" },
  { id: 2, label: "Objetivo", icon: "ri-focus-3-line" },
  { id: 3, label: "Experiências", icon: "ri-briefcase-line" },
  { id: 4, label: "Formação", icon: "ri-graduation-cap-line" },
  { id: 5, label: "Habilidades", icon: "ri-star-line" },
  { id: 6, label: "Prévia", icon: "ri-eye-line" },
];

export default function CurriculoEditor() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<CurriculoData>(INITIAL_DATA);

  const update = (partial: Partial<CurriculoData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const next = () => setStep((s) => Math.min(s + 1, 6));
  const prev = () => setStep((s) => Math.max(s - 1, 1));
  const goTo = (s: number) => setStep(s);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Sidebar Steps */}
      <div className="lg:w-52 shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-24">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Etapas</p>
          <div className="space-y-1">
            {STEPS.map((s) => (
              <button
                key={s.id}
                onClick={() => goTo(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  step === s.id
                    ? "bg-emerald-600 text-white"
                    : step > s.id
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  {step > s.id ? (
                    <i className="ri-check-line text-sm"></i>
                  ) : (
                    <i className={`${s.icon} text-sm`}></i>
                  )}
                </div>
                {s.label}
              </button>
            ))}
          </div>

          {/* Progress */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Progresso</span>
              <span>{Math.round(((step - 1) / 5) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${((step - 1) / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {step === 1 && <CurriculoStepDados data={data} update={update} onNext={next} />}
        {step === 2 && <CurriculoStepObjetivo data={data} update={update} onNext={next} onPrev={prev} />}
        {step === 3 && <CurriculoStepExperiencias data={data} update={update} onNext={next} onPrev={prev} />}
        {step === 4 && <CurriculoStepFormacao data={data} update={update} onNext={next} onPrev={prev} />}
        {step === 5 && <CurriculoStepHabilidades data={data} update={update} onNext={next} onPrev={prev} />}
        {step === 6 && <CurriculoPreview data={data} onEdit={prev} />}
      </div>
    </div>
  );
}
