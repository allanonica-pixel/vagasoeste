import { CurriculoData } from "./CurriculoEditor";
import { useBrazilPhone } from "@/hooks/useBrazilPhone";

interface Props {
  data: CurriculoData;
  update: (partial: Partial<CurriculoData>) => void;
  onNext: () => void;
}

const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export default function CurriculoStepDados({ data, update, onNext }: Props) {
  const phone = useBrazilPhone(data.telefone);

  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    phone.onChange(e);
    update({ telefone: e.target.value });
  };

  const isValid = data.nome.trim().length >= 3 && data.email.includes("@") && data.cidade.trim().length >= 2;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Dados Pessoais</h2>
        <p className="text-gray-500 text-sm">Informações de contato que aparecerão no seu currículo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nome */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nome completo <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-emerald-500 transition-colors">
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              <i className="ri-user-line text-gray-400 text-sm"></i>
            </div>
            <input
              type="text"
              value={data.nome}
              onChange={(e) => update({ nome: e.target.value })}
              placeholder="Seu nome completo"
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-emerald-500 transition-colors">
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              <i className="ri-mail-line text-gray-400 text-sm"></i>
            </div>
            <input
              type="email"
              value={data.email}
              onChange={(e) => update({ email: e.target.value })}
              placeholder="seu@email.com"
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone / WhatsApp</label>
          <div className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 transition-colors ${
            phone.value && phone.isValid ? "border-emerald-400" : "border-gray-200 focus-within:border-emerald-500"
          }`}>
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              <i className="ri-phone-line text-gray-400 text-sm"></i>
            </div>
            <input
              type="tel"
              value={phone.value}
              onChange={handlePhone}
              placeholder="(99) 99999-9999"
              maxLength={15}
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            />
            {phone.value && phone.isValid && (
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <i className="ri-check-line text-emerald-500 text-sm"></i>
              </div>
            )}
          </div>
        </div>

        {/* Cidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Cidade <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-emerald-500 transition-colors">
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              <i className="ri-map-pin-line text-gray-400 text-sm"></i>
            </div>
            <input
              type="text"
              value={data.cidade}
              onChange={(e) => update({ cidade: e.target.value })}
              placeholder="Sua cidade"
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-emerald-500 transition-colors">
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              <i className="ri-map-2-line text-gray-400 text-sm"></i>
            </div>
            <select
              value={data.estado}
              onChange={(e) => update({ estado: e.target.value })}
              className="flex-1 text-sm text-gray-800 outline-none bg-transparent cursor-pointer"
            >
              <option value="">Selecione</option>
              {ESTADOS.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
        </div>

        {/* LinkedIn */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn (opcional)</label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-emerald-500 transition-colors">
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              <i className="ri-linkedin-line text-gray-400 text-sm"></i>
            </div>
            <input
              type="text"
              value={data.linkedin}
              onChange={(e) => update({ linkedin: e.target.value })}
              placeholder="linkedin.com/in/seuperfil"
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 text-sm"
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
