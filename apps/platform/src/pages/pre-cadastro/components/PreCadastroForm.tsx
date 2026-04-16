import { useState } from "react";
import type { PreCadastroData } from "@/pages/pre-cadastro/page";
import { formatBrazilPhone, isValidBrazilPhone } from "@/hooks/useBrazilPhone";

const SECTORS = [
  "Comércio", "Saúde", "Tecnologia", "Logística", "Alimentação",
  "Indústria", "Serviços", "Construção Civil", "Educação", "Financeiro", "Agronegócio",
];

const NEIGHBORHOODS = [
  "Centro", "Maracanã", "Jardim Santarém", "Aldeia", "Santa Clara",
  "Aparecida", "Caranazal", "Diamantino", "Laguinho", "Prainha",
];

interface PreCadastroFormProps {
  initialData: Partial<PreCadastroData>;
  onNext: (data: Partial<PreCadastroData>) => void;
  onBack: () => void;
}

export default function PreCadastroForm({ initialData, onNext, onBack }: PreCadastroFormProps) {
  const [form, setForm] = useState<Partial<PreCadastroData>>({
    cnpj: initialData.cnpj || "",
    razaoSocial: initialData.razaoSocial || "",
    nomeFantasia: "",
    email: "",
    telefone: "",
    whatsapp: "",
    responsavel: "",
    cargo: "",
    setor: "",
    cidade: "Santarém",
    bairro: "",
    endereco: "",
    senha: "",
    confirmarSenha: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const update = (field: keyof PreCadastroData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const updatePhone = (field: "telefone" | "whatsapp", value: string) => {
    update(field, formatBrazilPhone(value));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.razaoSocial) newErrors.razaoSocial = "Campo obrigatório";
    if (!form.nomeFantasia) newErrors.nomeFantasia = "Campo obrigatório";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Email inválido";
    if (!form.telefone) {
      newErrors.telefone = "Campo obrigatório";
    } else if (!isValidBrazilPhone(form.telefone)) {
      newErrors.telefone = "Número inválido. Use o formato (XX) XXXXX-XXXX";
    }
    if (form.whatsapp && !isValidBrazilPhone(form.whatsapp)) {
      newErrors.whatsapp = "Número inválido. Use o formato (XX) XXXXX-XXXX";
    }
    if (!form.responsavel) newErrors.responsavel = "Campo obrigatório";
    if (!form.cargo) newErrors.cargo = "Campo obrigatório";
    if (!form.setor) newErrors.setor = "Selecione um setor";
    if (!form.bairro) newErrors.bairro = "Selecione um bairro";
    if (!form.endereco) newErrors.endereco = "Campo obrigatório";
    if (!form.senha || form.senha.length < 6) newErrors.senha = "Mínimo 6 caracteres";
    if (form.senha !== form.confirmarSenha) newErrors.confirmarSenha = "As senhas não coincidem";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onNext(form);
  };

  const Field = ({
    label,
    field,
    type = "text",
    placeholder,
    required = true,
  }: {
    label: string;
    field: keyof PreCadastroData;
    type?: string;
    placeholder?: string;
    required?: boolean;
  }) => (
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={(form[field] as string) || ""}
        onChange={(e) => update(field, e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors ${
          errors[field] ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-emerald-400"
        }`}
      />
      {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Dados da Empresa */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <i className="ri-building-line text-emerald-600 text-sm"></i>
            </div>
            Dados da Empresa
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CNPJ (readonly) */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">CNPJ</label>
              <input
                type="text"
                value={form.cnpj || ""}
                readOnly
                className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-500 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Setor de Atuação <span className="text-red-400">*</span>
              </label>
              <select
                value={form.setor || ""}
                onChange={(e) => update("setor", e.target.value)}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors cursor-pointer ${
                  errors.setor ? "border-red-300" : "border-gray-200 focus:border-emerald-400"
                }`}
              >
                <option value="">Selecione...</option>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.setor && <p className="text-red-500 text-xs mt-1">{errors.setor}</p>}
            </div>

            <div className="sm:col-span-2">
              <Field label="Razão Social" field="razaoSocial" placeholder="Nome jurídico da empresa" />
            </div>
            <div className="sm:col-span-2">
              <Field label="Nome Fantasia" field="nomeFantasia" placeholder="Como a empresa é conhecida" />
            </div>
          </div>
        </div>

        {/* Localização */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <i className="ri-map-pin-line text-emerald-600 text-sm"></i>
            </div>
            Localização
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Cidade</label>
              <input
                type="text"
                value="Santarém, Pará"
                readOnly
                className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Bairro <span className="text-red-400">*</span>
              </label>
              <select
                value={form.bairro || ""}
                onChange={(e) => update("bairro", e.target.value)}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors cursor-pointer ${
                  errors.bairro ? "border-red-300" : "border-gray-200 focus:border-emerald-400"
                }`}
              >
                <option value="">Selecione...</option>
                {NEIGHBORHOODS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              {errors.bairro && <p className="text-red-500 text-xs mt-1">{errors.bairro}</p>}
            </div>
            <div className="sm:col-span-2">
              <Field label="Endereço Completo" field="endereco" placeholder="Rua, número, complemento" />
            </div>
          </div>
        </div>

        {/* Responsável */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <i className="ri-user-line text-emerald-600 text-sm"></i>
            </div>
            Responsável pelo Cadastro
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Nome do Responsável" field="responsavel" placeholder="Nome completo" />
            </div>
            <Field label="Cargo / Função" field="cargo" placeholder="Ex: Gerente de RH, Proprietário" />
            <Field label="Email Corporativo" field="email" type="email" placeholder="email@empresa.com.br" />

            {/* Telefone com máscara */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Telefone <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
                  <i className="ri-phone-line text-gray-400 text-xs"></i>
                </div>
                <input
                  type="tel"
                  value={form.telefone || ""}
                  onChange={(e) => updatePhone("telefone", e.target.value)}
                  placeholder="(93) 99999-9999"
                  maxLength={15}
                  className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 outline-none transition-colors ${
                    errors.telefone ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-emerald-400"
                  }`}
                />
              </div>
              {errors.telefone ? (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <i className="ri-error-warning-line"></i>
                  {errors.telefone}
                </p>
              ) : form.telefone && isValidBrazilPhone(form.telefone) ? (
                <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                  <i className="ri-checkbox-circle-line"></i>
                  Número válido
                </p>
              ) : null}
            </div>

            {/* WhatsApp com máscara */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                WhatsApp <span className="text-gray-400 font-normal text-xs">(opcional)</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
                  <i className="ri-whatsapp-line text-gray-400 text-xs"></i>
                </div>
                <input
                  type="tel"
                  value={form.whatsapp || ""}
                  onChange={(e) => updatePhone("whatsapp", e.target.value)}
                  placeholder="(93) 99999-9999"
                  maxLength={15}
                  className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 outline-none transition-colors ${
                    errors.whatsapp ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-emerald-400"
                  }`}
                />
              </div>
              {errors.whatsapp ? (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <i className="ri-error-warning-line"></i>
                  {errors.whatsapp}
                </p>
              ) : form.whatsapp && isValidBrazilPhone(form.whatsapp) ? (
                <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                  <i className="ri-checkbox-circle-line"></i>
                  Número válido
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Acesso Provisório */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <i className="ri-lock-line text-amber-600 text-sm"></i>
            </div>
            Senha de Acesso Provisório
          </h3>
          <p className="text-gray-500 text-xs mb-5 leading-relaxed">
            Crie uma senha para acessar o painel provisório enquanto seu cadastro é validado. Após aprovação, você poderá alterar a senha no painel definitivo.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Senha <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSenha ? "text" : "password"}
                  value={form.senha || ""}
                  onChange={(e) => update("senha", e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors pr-10 ${
                    errors.senha ? "border-red-300" : "border-gray-200 focus:border-emerald-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer text-gray-400"
                >
                  <i className={`${showSenha ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
                </button>
              </div>
              {errors.senha && <p className="text-red-500 text-xs mt-1">{errors.senha}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Confirmar Senha <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmar ? "text" : "password"}
                  value={form.confirmarSenha || ""}
                  onChange={(e) => update("confirmarSenha", e.target.value)}
                  placeholder="Repita a senha"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors pr-10 ${
                    errors.confirmarSenha ? "border-red-300" : "border-gray-200 focus:border-emerald-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmar(!showConfirmar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer text-gray-400"
                >
                  <i className={`${showConfirmar ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
                </button>
              </div>
              {errors.confirmarSenha && <p className="text-red-500 text-xs mt-1">{errors.confirmarSenha}</p>}
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
          <i className="ri-shield-check-line text-emerald-500 mr-1"></i>
          Ao continuar, você concorda com os <strong className="text-gray-700">Termos de Uso</strong> e a <strong className="text-gray-700">Política de Privacidade</strong> da VagasOeste. Seus dados serão utilizados exclusivamente para o processo de cadastro e validação.
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 font-medium px-6 py-3 rounded-xl text-sm cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            <i className="ri-arrow-left-line text-sm"></i>
            Voltar
          </button>
          <button
            type="submit"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            Continuar para cadastro de vagas
            <i className="ri-arrow-right-line text-sm"></i>
          </button>
        </div>
      </form>
    </div>
  );
}
