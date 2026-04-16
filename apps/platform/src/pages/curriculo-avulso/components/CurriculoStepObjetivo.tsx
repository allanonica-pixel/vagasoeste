import { CurriculoData } from "./CurriculoEditor";

interface Props {
  data: CurriculoData;
  update: (partial: Partial<CurriculoData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const SUGESTOES = [
  "Profissional com experiência em vendas e atendimento ao cliente, buscando oportunidade para aplicar minhas habilidades em uma empresa dinâmica.",
  "Técnico em Administração com sólida experiência em rotinas administrativas, buscando crescimento profissional em empresa de médio ou grande porte.",
  "Profissional da área de logística com experiência em controle de estoque e expedição, buscando novos desafios na área operacional.",
  "Recém-formado em Contabilidade, buscando primeira oportunidade para aplicar os conhecimentos adquiridos na graduação.",
];

export default function CurriculoStepObjetivo({ data, update, onNext, onPrev }: Props) {
  const MAX = 500;
  const remaining = MAX - data.objetivo.length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Objetivo Profissional</h2>
        <p className="text-gray-500 text-sm">Descreva brevemente o que você busca profissionalmente. Seja direto e objetivo.</p>
      </div>

      {/* Sugestões */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sugestões de texto</p>
        <div className="space-y-2">
          {SUGESTOES.map((s, i) => (
            <button
              key={i}
              onClick={() => update({ objetivo: s })}
              className="w-full text-left text-xs text-gray-600 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-100 hover:border-emerald-200 rounded-lg px-3 py-2.5 transition-all cursor-pointer leading-relaxed"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Seu objetivo</label>
        <textarea
          value={data.objetivo}
          onChange={(e) => {
            if (e.target.value.length <= MAX) update({ objetivo: e.target.value });
          }}
          placeholder="Escreva seu objetivo profissional aqui ou use uma das sugestões acima..."
          rows={5}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-500 transition-colors resize-none"
        />
        <p className={`text-xs mt-1 text-right ${remaining < 50 ? "text-amber-500" : "text-gray-400"}`}>
          {remaining} caracteres restantes
        </p>
      </div>

      <div className="flex justify-between mt-6">
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
