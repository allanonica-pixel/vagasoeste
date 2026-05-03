import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import PreCadastroForm from "@/pages/pre-cadastro/components/PreCadastroForm";
import CNPJCheck from "@/pages/pre-cadastro/components/CNPJCheck";
import PreCadastroVagas from "@/pages/pre-cadastro/components/PreCadastroVagas";

export type PreCadastroStep = "cnpj" | "form" | "vagas" | "success";

export interface PreCadastroData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  email: string;
  telefone: string;
  whatsapp: string;
  responsavel: string;
  cargo: string;
  setor: string;
  cidade: string;
  bairro: string;
  endereco: string;
  senha: string;
  confirmarSenha: string;
}

const STEPS = [
  { id: "cnpj", label: "Verificar CNPJ", icon: "ri-search-line" },
  { id: "form", label: "Dados da Empresa", icon: "ri-building-line" },
  { id: "vagas", label: "Cadastrar Vagas", icon: "ri-briefcase-line" },
  { id: "success", label: "Concluído", icon: "ri-check-double-line" },
];

export default function PreCadastroPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<PreCadastroStep>("cnpj");
  const [formData, setFormData] = useState<Partial<PreCadastroData>>({});

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="min-h-dvh bg-gray-50">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-emerald-900 pt-24 pb-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 text-emerald-300 text-xs mb-4">
            <Link to="/" className="hover:text-white transition-colors cursor-pointer">Início</Link>
            <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
            <Link to="/para-empresas" className="hover:text-white transition-colors cursor-pointer">Para Empresas</Link>
            <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
            <span className="text-white">Pré-Cadastro</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-balance">
            Pré-Cadastro de Empresa
          </h1>
          <p className="text-emerald-200 text-sm max-w-xl">
            Cadastre sua empresa na VagasOeste e comece a publicar vagas. Após validação pela nossa equipe, suas vagas ficam disponíveis para candidatos de toda a região.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border-b border-amber-100">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 flex items-start gap-3">
          <div className="size-5 flex items-center justify-center mt-0.5 shrink-0">
            <i className="ri-information-line text-amber-600 text-sm" aria-hidden="true"></i>
          </div>
          <p className="text-amber-800 text-xs leading-relaxed">
            <strong>Como funciona o pré-cadastro:</strong> Você preenche os dados da empresa e cadastra suas vagas com login e senha provisórios. A equipe VagasOeste validará o cadastro em até <strong>48 horas úteis</strong>. Após aprovação, suas vagas ficam visíveis no site público e você recebe um email de confirmação.
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => {
              const isCompleted = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const isLast = i === STEPS.length - 1;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`size-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                          ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <i className="ri-check-line text-sm" aria-hidden="true"></i>
                      ) : (
                        <i className={`${s.icon} text-sm`} aria-hidden="true"></i>
                      )}
                    </div>
                    <span
                      className={`text-xs mt-1 font-medium whitespace-nowrap hidden sm:block ${
                        isCurrent ? "text-emerald-700" : isCompleted ? "text-emerald-600" : "text-gray-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-colors ${
                        i < currentStepIndex ? "bg-emerald-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {step === "cnpj" && (
          <CNPJCheck
            onNext={(cnpj, razaoSocial) => {
              setFormData((prev) => ({ ...prev, cnpj, razaoSocial }));
              setStep("form");
            }}
          />
        )}
        {step === "form" && (
          <PreCadastroForm
            initialData={formData}
            onNext={(data) => {
              setFormData((prev) => ({ ...prev, ...data }));
              setStep("vagas");
            }}
            onBack={() => setStep("cnpj")}
          />
        )}
        {step === "vagas" && (
          <PreCadastroVagas
            companyName={formData.nomeFantasia || formData.razaoSocial || "Sua Empresa"}
            onFinish={() => setStep("success")}
            onBack={() => setStep("form")}
          />
        )}
        {step === "success" && (
          <SuccessScreen
            companyName={formData.nomeFantasia || formData.razaoSocial || "Sua Empresa"}
            email={formData.email || ""}
            onGoToPlatform={() => navigate("/empresa/dashboard")}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}

function SuccessScreen({
  companyName,
  email,
  onGoToPlatform,
}: {
  companyName: string;
  email: string;
  onGoToPlatform: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto text-center py-12">
      <div className="size-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
        <i className="ri-checkbox-circle-fill text-emerald-600 text-5xl" aria-hidden="true"></i>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-balance">Pré-cadastro enviado!</h2>
      <p className="text-emerald-600 font-semibold text-lg mb-4">Parabéns, {companyName}!</p>
      <p className="text-gray-500 text-sm leading-relaxed mb-6">
        Seu pré-cadastro foi recebido com sucesso. Nossa equipe irá analisar e validar os dados da sua empresa em até <strong>48 horas úteis</strong>. Você receberá um email em <strong>{email}</strong> com a confirmação e as instruções de acesso definitivo.
      </p>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 mb-6 text-left">
        <p className="text-amber-900 font-semibold text-sm mb-3 flex items-center gap-2">
          <i className="ri-time-line text-amber-600" aria-hidden="true"></i>
          Próximos passos
        </p>
        <ul className="space-y-2">
          {[
            "Nossa equipe analisa os dados da sua empresa",
            "Verificamos o CNPJ e as informações cadastradas",
            "Aprovamos o cadastro e ativamos suas vagas no site público",
            "Você recebe um email com confirmação e acesso definitivo",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-amber-800">
              <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 font-bold flex items-center justify-center shrink-0 text-xs">{i + 1}</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 text-left">
        <p className="text-emerald-800 text-sm font-semibold mb-1 flex items-center gap-2">
          <i className="ri-shield-check-line text-emerald-600" aria-hidden="true"></i>
          Acesso provisório disponível
        </p>
        <p className="text-emerald-700 text-xs leading-relaxed">
          Enquanto aguarda a aprovação, você já pode acessar o painel provisório para gerenciar as vagas cadastradas. Use as credenciais criadas no pré-cadastro.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onGoToPlatform}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm cursor-pointer transition-colors whitespace-nowrap"
        >
          Acessar painel provisório
        </button>
        <Link
          to="/"
          className="flex-1 border border-gray-200 text-gray-600 font-medium py-3.5 rounded-xl text-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap text-center"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
