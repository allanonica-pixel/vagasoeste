import { useState, useRef } from "react";

interface CNPJCheckProps {
  onNext: (cnpj: string, razaoSocial: string) => void;
}

interface BrasilAPICompany {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: string;
  descricao_situacao_cadastral: string;
  municipio: string;
  uf: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cep: string;
  email: string;
  ddd_telefone_1: string;
}

// CNPJs já cadastrados na plataforma (mock — substituir por query Supabase)
const REGISTERED_CNPJS = new Set([
  "12345678000190",
  "98765432000110",
  "11222333000144",
]);

function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function isValidCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const calc = (d: string, len: number) => {
    let sum = 0;
    let pos = len - 7;
    for (let i = len; i >= 1; i--) {
      sum += parseInt(d[len - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result;
  };

  const d1 = calc(digits, 12);
  const d2 = calc(digits, 13);
  return d1 === parseInt(digits[12]) && d2 === parseInt(digits[13]);
}

type Status = "idle" | "checking" | "registered" | "inactive" | "found" | "not_found" | "error" | "api_error";

export default function CNPJCheck({ onNext }: CNPJCheckProps) {
  const [cnpj, setCnpj] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [company, setCompany] = useState<BrasilAPICompany | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setCnpj(formatted);
    setStatus("idle");
    setCompany(null);
    setErrorMsg("");
  };

  const handleCheck = async () => {
    const digits = cnpj.replace(/\D/g, "");

    if (!isValidCNPJ(cnpj)) {
      setStatus("error");
      setErrorMsg("CNPJ inválido. Verifique os dígitos e tente novamente.");
      return;
    }

    // Verifica se já está cadastrado na plataforma
    if (REGISTERED_CNPJS.has(digits)) {
      setStatus("registered");
      return;
    }

    setStatus("checking");
    setCompany(null);

    // Cancela requisição anterior se houver
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`, {
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        if (res.status === 404) {
          setStatus("not_found");
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data: BrasilAPICompany = await res.json();

      // Verifica situação cadastral
      const situacao = data.situacao_cadastral?.toString();
      if (situacao !== "2") {
        // 2 = Ativa na Receita Federal
        setStatus("inactive");
        setCompany(data);
        return;
      }

      setStatus("found");
      setCompany(data);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setStatus("api_error");
      setErrorMsg("Não foi possível consultar o CNPJ agora. Verifique sua conexão e tente novamente.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCheck();
  };

  const digits = cnpj.replace(/\D/g, "");
  const canCheck = digits.length === 14 && status !== "checking";

  const inputBorderClass = () => {
    if (status === "error") return "border-red-300 focus:border-red-400";
    if (status === "registered" || status === "inactive") return "border-amber-300 bg-amber-50";
    if (status === "found") return "border-emerald-300 bg-emerald-50";
    if (status === "not_found") return "border-emerald-300 bg-emerald-50";
    return "border-gray-200 focus:border-emerald-400";
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="size-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <i className="ri-search-eye-line text-emerald-600 text-2xl" aria-hidden="true"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-balance">Verificar CNPJ</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Antes de iniciar o pré-cadastro, vamos verificar se sua empresa já possui cadastro na VagasOeste e consultar os dados na Receita Federal.
          </p>
        </div>

        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            CNPJ da Empresa
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={cnpj}
                onChange={handleCNPJChange}
                onKeyDown={handleKeyDown}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-colors font-mono ${inputBorderClass()}`}
              />
              {status === "checking" && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center">
                  <i className="ri-loader-4-line motion-safe:animate-spin text-emerald-500 text-sm" role="status" aria-label="Consultando CNPJ"></i>
                </div>
              )}
              {status === "found" && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center">
                  <i className="ri-checkbox-circle-fill text-emerald-500 text-sm" aria-hidden="true"></i>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleCheck}
              disabled={!canCheck}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-3 rounded-xl text-sm cursor-pointer transition-colors whitespace-nowrap"
            >
              {status === "checking" ? "Consultando..." : "Consultar"}
            </button>
          </div>

          {(status === "error" || status === "api_error") && (
            <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
              <i className="ri-error-warning-line" aria-hidden="true"></i>
              {errorMsg}
            </p>
          )}
        </div>

        {/* Status: Já cadastrado na plataforma */}
        {status === "registered" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-5">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <i className="ri-error-warning-line text-amber-600 text-lg" aria-hidden="true"></i>
              </div>
              <div className="flex-1">
                <p className="font-bold text-amber-800 text-sm mb-1">CNPJ já cadastrado na VagasOeste</p>
                <p className="text-amber-700 text-xs leading-relaxed mb-3">
                  O CNPJ <strong>{cnpj}</strong> já possui cadastro ativo na plataforma. Se você é responsável por esta empresa, acesse com suas credenciais.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href="/login"
                    className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs cursor-pointer transition-colors whitespace-nowrap"
                  >
                    <i className="ri-login-box-line text-sm" aria-hidden="true"></i>
                    Acessar Plataforma
                  </a>
                  <a
                    href="https://wa.me/5593999999999"
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="flex items-center justify-center gap-2 border border-amber-200 text-amber-700 font-medium px-4 py-2.5 rounded-lg text-xs cursor-pointer hover:bg-amber-50 transition-colors whitespace-nowrap"
                  >
                    <i className="ri-whatsapp-line text-sm" aria-hidden="true"></i>
                    Falar com suporte
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status: CNPJ inativo na Receita Federal */}
        {status === "inactive" && company && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-5">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <i className="ri-close-circle-line text-red-600 text-lg" aria-hidden="true"></i>
              </div>
              <div>
                <p className="font-bold text-red-800 text-sm mb-1">CNPJ com situação irregular</p>
                <p className="text-red-700 text-xs leading-relaxed mb-2">
                  <strong>{company.razao_social}</strong> — Situação na Receita Federal: <strong>{company.descricao_situacao_cadastral || "Inativa"}</strong>
                </p>
                <p className="text-red-600 text-xs">
                  Apenas empresas com situação <strong>Ativa</strong> podem se cadastrar na VagasOeste. Regularize o CNPJ e tente novamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status: CNPJ não encontrado na Receita */}
        {status === "not_found" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-5">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <i className="ri-search-line text-red-600 text-lg" aria-hidden="true"></i>
              </div>
              <div>
                <p className="font-bold text-red-800 text-sm mb-1">CNPJ não encontrado</p>
                <p className="text-red-700 text-xs leading-relaxed">
                  O CNPJ <strong>{cnpj}</strong> não foi encontrado na base da Receita Federal. Verifique se o número está correto.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status: CNPJ encontrado e ativo — exibe dados da empresa */}
        {status === "found" && company && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="size-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <i className="ri-checkbox-circle-line text-emerald-600 text-lg" aria-hidden="true"></i>
              </div>
              <div>
                <p className="font-bold text-emerald-800 text-sm mb-0.5">CNPJ válido e disponível!</p>
                <p className="text-emerald-700 text-xs">Empresa encontrada na Receita Federal. Dados pré-preenchidos abaixo.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Razão Social", value: company.razao_social, icon: "ri-building-line" },
                { label: "Nome Fantasia", value: company.nome_fantasia || "—", icon: "ri-store-line" },
                { label: "Município / UF", value: `${company.municipio}, ${company.uf}`, icon: "ri-map-pin-line" },
                { label: "Situação", value: company.descricao_situacao_cadastral || "Ativa", icon: "ri-shield-check-line" },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-lg p-3 border border-emerald-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="size-4 flex items-center justify-center">
                      <i className={`${item.icon} text-emerald-500 text-xs`} aria-hidden="true"></i>
                    </div>
                    <span className="text-xs text-emerald-600 font-medium">{item.label}</span>
                  </div>
                  <p className="text-sm text-gray-800 font-semibold leading-tight">{item.value}</p>
                </div>
              ))}
            </div>

            {(company.logradouro || company.bairro) && (
              <div className="mt-3 bg-white rounded-lg p-3 border border-emerald-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="size-4 flex items-center justify-center">
                    <i className="ri-road-map-line text-emerald-500 text-xs" aria-hidden="true"></i>
                  </div>
                  <span className="text-xs text-emerald-600 font-medium">Endereço</span>
                </div>
                <p className="text-sm text-gray-800 font-semibold">
                  {[company.logradouro, company.numero, company.bairro, company.municipio].filter(Boolean).join(", ")}
                </p>
              </div>
            )}
          </div>
        )}

        {/* CTA — só aparece quando CNPJ está ok */}
        {status === "found" && company && (
          <button
            onClick={() => onNext(cnpj, company.razao_social)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            Continuar com o pré-cadastro
            <i className="ri-arrow-right-line text-sm"></i>
          </button>
        )}

        {/* Info box */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
            <i className="ri-shield-check-line text-emerald-500" aria-hidden="true"></i>
            Por que verificamos o CNPJ?
          </p>
          <ul className="space-y-1.5">
            {[
              "Dados consultados em tempo real na Receita Federal via BrasilAPI",
              "Evitar duplicidade de cadastros na plataforma",
              "Garantir a autenticidade das empresas parceiras",
              "Proteger candidatos de vagas fraudulentas",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-gray-500">
                <i className="ri-check-line text-emerald-500 text-xs" aria-hidden="true"></i>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
