import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import { formatBrazilPhone, isValidBrazilPhone } from "@/hooks/useBrazilPhone";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5;

interface CourseEntry {
  id: string;
  title: string;
  institution: string;
  startDate: string;
  endDate: string;
}

interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  isPCD: string;
  hasCNH: string;
  cnhCategory: string;
  city: string;
  neighborhood: string;
  educationLevel: string;
  educationSituation: string;
  availability: string[];
  salaryMin: string;
  salaryMax: string;
  salaryNegotiable: boolean;
  password: string;
  confirmPassword: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Cidades e bairros — futuramente virá do painel admin (recurso "Cidades") */
const CITIES_DATA: Record<string, string[]> = {
  Santarém: [
    "Aldeia", "Alvorada", "Aparecida", "Caranazal", "Centro", "Diamantino",
    "Fátima", "Floresta", "Interventoria", "Jaderlândia", "Laguinho", "Liberdade",
    "Maicá", "Mapiri", "Matinha", "Nova República", "Novo Horizonte",
    "Palmares", "Prainha", "Santa Clara", "Santíssimo", "Urumanduba",
  ],
  Óbidos: ["Centro", "Bairro Novo", "São Francisco"],
  Alenquer: ["Centro", "Vila Nova"],
  "Monte Alegre": ["Centro", "Boa Vista"],
  Oriximiná: ["Centro", "Bela Vista"],
};

const EDUCATION_LEVELS = ["Fundamental", "Médio", "Técnico", "Superior", "Pós-graduação"];
const CNH_CATEGORIES = ["A", "AB", "C", "D", "E"];
const AVAILABILITY_OPTIONS = ["Manhã", "Tarde", "Noite", "Fins de semana"];

const SALARY_SUGGESTIONS: {
  label: string;
  min: string;       // valor fixo para salaryMin ('' = livre)
  maxCap: number | null; // teto do salaryMax (null = sem limite)
}[] = [
  { label: "Até R$ 2.000",        min: "",     maxCap: 2000 },
  { label: "R$ 2.000 – R$ 3.000", min: "2000", maxCap: 3000 },
  { label: "R$ 3.000 – R$ 5.000", min: "3000", maxCap: 5000 },
  { label: "Acima de R$ 5.000",   min: "5000", maxCap: null },
];

const INITIAL_FORM: FormData = {
  fullName: "",
  email: "",
  phone: "",
  birthDate: "",
  gender: "",
  isPCD: "nao",
  hasCNH: "nao",
  cnhCategory: "",
  city: "Santarém",
  neighborhood: "",
  educationLevel: "",
  educationSituation: "",
  availability: [],
  salaryMin: "",
  salaryMax: "",
  salaryNegotiable: false,
  password: "",
  confirmPassword: "",
};

// ─── Sanitização ──────────────────────────────────────────────────────────────

function sanitizeText(input: string): string {
  // NÃO faz .trim() aqui — sanitizeText roda em cada tecla; trim quebraria
  // a digitação de espaços (espaço seria removido antes da próxima tecla).
  // O trim acontece no momento do submit/validação, onde apropriado.
  return input
    .replace(/<[^>]*>/g, "")          // remove tags HTML
    .replace(/javascript:/gi, "")      // remove protocolo JS
    .replace(/on\w+\s*=/gi, "")        // remove event handlers inline
    .replace(/&[#\w]+;/g, " ");        // remove entidades HTML
}

/**
 * Validação anti-vazamento de contato em campos de texto livre.
 *
 * Estratégia em camadas:
 *   - BLOCK: padrões de contato direto inequívocos (e-mail, telefone, URL,
 *            nome de plataforma, handle, ofuscação clássica). Bloqueia o salvar.
 *   - WARN:  frases que sugerem tentativa de contato. Permite salvar com aviso.
 *
 * O objetivo é proteger o anonimato do candidato — empresas só devem conseguir
 * contatá-lo via plataforma, então qualquer "atalho" inserido em texto livre
 * (CV, experiências, cursos) precisa ser barrado.
 */
type FreeTextResult =
  | { ok: true }
  | { ok: false; severity: "block" | "warn"; reason: string };

function validateFreeText(text: string): FreeTextResult {
  if (!text || !text.trim()) return { ok: true };

  const clean = text.replace(/\s/g, "");
  const lower = text.toLowerCase();

  // ─── BLOCK: documentos formatados ────────────────────────────────────────
  if (/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/.test(clean))
    return { ok: false, severity: "block", reason: "CPF" };
  if (/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/.test(clean))
    return { ok: false, severity: "block", reason: "CNPJ" };

  // ─── BLOCK: telefone ─────────────────────────────────────────────────────
  // formatado: (XX) XXXX-XXXX, +55 XX XXXXX-XXXX, etc.
  if (/\(?\d{2}\)?[\s.-]?9?\d{4}[\s.-]?\d{4}/.test(text))
    return { ok: false, severity: "block", reason: "telefone" };
  // sequência de 8+ dígitos (telefone sem formatação, conta bancária, etc.)
  if (/(?:^|\D)\d{8,}(?:\D|$)/.test(text))
    return { ok: false, severity: "block", reason: "sequência numérica longa" };

  // ─── BLOCK: e-mail (e suas ofuscações) ──────────────────────────────────
  if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text))
    return { ok: false, severity: "block", reason: "e-mail" };
  if (/\b(arroba|\(at\)|\[at\])\b/i.test(text))
    return { ok: false, severity: "block", reason: "tentativa de ofuscar e-mail" };
  if (
    /\b(ponto\s+com\s+br|ponto\s+com|ponto\s+br|dot\s+com|\(dot\))\b/i.test(text)
  )
    return { ok: false, severity: "block", reason: "tentativa de ofuscar domínio" };

  // ─── BLOCK: provedores de e-mail comuns como palavras isoladas ──────────
  // (capturam tentativas tipo "joao silva gmail" ou "arroba hotmail")
  // "live" fica de fora (alta taxa de falso-positivo: "Curso de Live...");
  // "live.com" continua sendo bloqueado pelo regex de domínio acima.
  const emailProviders = [
    "gmail", "hotmail", "outlook", "yahoo", "icloud",
    "bol", "uol", "terra", "ig", "globo", "protonmail",
  ];
  for (const p of emailProviders) {
    if (new RegExp(`\\b${p}\\b`, "i").test(text))
      return { ok: false, severity: "block", reason: `provedor de e-mail (${p})` };
  }

  // ─── BLOCK: URLs e domínios ──────────────────────────────────────────────
  if (/https?:\/\//i.test(text))
    return { ok: false, severity: "block", reason: "URL" };
  if (/\bwww\.[a-z0-9-]+/i.test(text))
    return { ok: false, severity: "block", reason: "site (www)" };
  if (
    /[a-z0-9-]+\.(com|net|org|io|br|app|me|tv|info|biz|xyz|co)(\.[a-z]{2})?\b/i.test(
      text
    )
  )
    return { ok: false, severity: "block", reason: "domínio" };

  // ─── BLOCK: plataformas de contato/redes sociais (literais e gírias) ────
  const platforms = [
    "whatsapp", "whats", "wpp", "zap", "zapzap", "zapinho",
    "instagram", "insta", "facebook", "fb",
    "telegram", "tg",
    "linkedin", "tiktok", "twitter", "snapchat",
    "discord", "skype", "messenger",
  ];
  for (const p of platforms) {
    if (new RegExp(`\\b${p}\\b`, "i").test(text))
      return { ok: false, severity: "block", reason: `menção a ${p}` };
  }

  // ─── BLOCK: handle de rede social (@usuario com 3+ chars) ───────────────
  if (/(?:^|[\s,;.!?])@[a-z0-9._]{3,}/i.test(text))
    return { ok: false, severity: "block", reason: "handle de rede social" };

  // ─── WARN: frases que sugerem contato direto ────────────────────────────
  const contactPhrases = [
    "me chama", "me chame", "me liga", "me ligue",
    "fale comigo", "falar comigo", "falem comigo",
    "entre em contato", "entrar em contato",
    "meu contato", "meu numero", "meu número",
    "chama no", "manda mensagem", "manda msg", "manda mensag",
  ];
  for (const p of contactPhrases) {
    if (lower.includes(p))
      return { ok: false, severity: "warn", reason: "frase de contato direto" };
  }

  return { ok: true };
}

/** Mensagem amigável para o usuário a partir do resultado da validação */
function freeTextMessage(r: Extract<FreeTextResult, { ok: false }>): string {
  if (r.severity === "block") {
    return `Por segurança, não inclua ${r.reason}. As empresas falam com você apenas pela plataforma — seus dados de contato ficam protegidos.`;
  }
  return `Detectamos uma possível ${r.reason}. Lembre-se: as empresas só podem te contatar pela plataforma.`;
}

// ─── Formatação de data (YYYY-MM → "janeiro de 2000") ────────────────────────

function formatMonthYear(yyyyMM: string): string {
  if (!yyyyMM) return "";
  const [year, month] = yyyyMM.split("-");
  if (!year || !month) return yyyyMM;
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

// ─── Formatação de moeda ──────────────────────────────────────────────────────

function formatCurrency(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return parseInt(digits, 10).toLocaleString("pt-BR");
}

// ─── SearchableSelect ─────────────────────────────────────────────────────────

interface SearchableSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  error,
  disabled,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const select = (opt: string) => {
    onChange(opt);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full border rounded-lg px-3 py-2.5 text-sm text-left outline-none transition-colors flex items-center justify-between ${
          error ? "border-red-300" : "border-gray-200 hover:border-emerald-300"
        } ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white cursor-pointer"}`}
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <i
          className={`ri-arrow-down-s-line text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        ></i>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar..."
              className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-emerald-400"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-gray-400 text-sm px-3 py-2">Nenhum resultado</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => select(opt)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors ${
                    value === opt
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CadastroPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cursos
  const [courses, setCourses] = useState<CourseEntry[]>([]);
  const [courseForm, setCourseForm] = useState<Omit<CourseEntry, "id">>({
    title: "",
    institution: "",
    startDate: "",
    endDate: "",
  });
  const [courseError, setCourseError] = useState("");
  const [courseWarning, setCourseWarning] = useState("");
  const [nameWarning, setNameWarning] = useState("");

  // Experiências
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([]);
  const [expForm, setExpForm] = useState<Omit<ExperienceEntry, "id">>({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    current: false,
  });
  const [expError, setExpError] = useState("");
  const [expWarning, setExpWarning] = useState("");

  // Sugestão salarial ativa (-1 = nenhuma)
  const [activeSuggestion, setActiveSuggestion] = useState<number | null>(null);

  // OTP WhatsApp (verificação Step 1 → Step 2)
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  /** Número que já passou pela verificação OTP com sucesso nesta sessão */
  const [verifiedPhone, setVerifiedPhone] = useState("");

  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const update = (field: keyof FormData, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const updatePhone = (value: string) => update("phone", formatBrazilPhone(value));

  /** Atualiza o Nome Completo com sanitização XSS + checagem anti-vazamento */
  const handleNameChange = (raw: string) => {
    const sanitized = sanitizeText(raw);
    update("fullName", sanitized);

    const result = validateFreeText(sanitized);
    if (result.ok) {
      setNameWarning("");
    } else if (result.severity === "block") {
      setErrors((prev) => ({ ...prev, fullName: freeTextMessage(result) }));
      setNameWarning("");
    } else {
      setNameWarning(freeTextMessage(result));
    }
  };

  const toggleAvailability = (opt: string) => {
    setForm((prev) => {
      const next = prev.availability.includes(opt)
        ? prev.availability.filter((a) => a !== opt)
        : [...prev.availability, opt];
      return { ...prev, availability: next };
    });
    setErrors((prev) => ({ ...prev, availability: "" }));
  };

  const cities = Object.keys(CITIES_DATA);
  const neighborhoods = CITIES_DATA[form.city] ?? [];

  // ─── Validações ───────────────────────────────────────────────────────────

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) {
      e.fullName = "Nome obrigatório";
    } else {
      // Camada final de defesa: re-valida o Nome Completo
      const nameCheck = validateFreeText(form.fullName);
      if (!nameCheck.ok && nameCheck.severity === "block") {
        e.fullName = freeTextMessage(nameCheck);
      }
    }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Email inválido";
    if (!form.phone.trim()) e.phone = "WhatsApp obrigatório";
    else if (!isValidBrazilPhone(form.phone))
      e.phone = "Número inválido. Use o formato (XX) XXXXX-XXXX";
    if (!form.birthDate) e.birthDate = "Data de nascimento obrigatória";
    if (!form.gender) e.gender = "Selecione o sexo";
    if (form.hasCNH === "sim" && !form.cnhCategory)
      e.cnhCategory = "Selecione a categoria da CNH";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.city) e.city = "Cidade obrigatória";
    if (!form.neighborhood.trim()) e.neighborhood = "Bairro obrigatório";
    if (!form.educationLevel) e.educationLevel = "Escolaridade obrigatória";
    if (
      form.educationLevel &&
      form.educationLevel !== "Sem Escolaridade" &&
      !form.educationSituation
    )
      e.educationSituation = "Situação obrigatória";
    if (form.availability.length === 0)
      e.availability = "Selecione ao menos uma disponibilidade";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep5 = () => {
    const e: Record<string, string> = {};
    if (!form.password || form.password.length < 6)
      e.password = "Senha deve ter ao menos 6 caracteres";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Senhas não conferem";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── OTP WhatsApp ─────────────────────────────────────────────────────────

  const sendOTP = async () => {
    setOtpError("");
    setOtpSending(true);
    try {
      const res = await fetch(`${API_URL}/v1/interesse/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone }),
      });
      if (!res.ok) throw new Error("Falha ao enviar código");
      setOtpCode("");
    } catch {
      setOtpError("Não foi possível enviar o código. Verifique sua conexão e tente novamente.");
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOTP = async () => {
    if (otpCode.trim().length !== 6) {
      setOtpError("Digite os 6 dígitos do código");
      return;
    }
    setOtpError("");
    setOtpVerifying(true);
    try {
      const res = await fetch(`${API_URL}/v1/interesse/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, code: otpCode.trim() }),
      });
      if (!res.ok) {
        setOtpError("Código inválido ou expirado. Solicite um novo código.");
        return;
      }
      // Verificação bem-sucedida
      setVerifiedPhone(form.phone);
      setOtpModalOpen(false);
      setOtpCode("");
      setStep(2);
    } catch {
      setOtpError("Erro ao verificar código. Tente novamente.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // ─── Navegação entre steps ─────────────────────────────────────────────────

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) return;
      // Pula o OTP se o número já foi verificado nesta sessão
      if (form.phone === verifiedPhone) {
        setStep(2);
      } else {
        // Abre o modal imediatamente e dispara o envio em paralelo
        setOtpCode("");
        setOtpError("");
        setOtpModalOpen(true);
        sendOTP();
      }
    } else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3) setStep(4);
    else if (step === 4) setStep(5);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep5()) return;
    setSubmitError("");
    setSubmitting(true);

    const salaryExpectation = form.salaryNegotiable
      ? "A combinar"
      : form.salaryMin && form.salaryMax
      ? `R$ ${formatCurrency(form.salaryMin)} – R$ ${formatCurrency(form.salaryMax)}`
      : form.salaryMin
      ? `A partir de R$ ${formatCurrency(form.salaryMin)}`
      : "";

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          role: "candidato",
          full_name: form.fullName,
          phone: form.phone,
          birth_date: form.birthDate,
          gender: form.gender,
          is_pcd: form.isPCD === "sim",
          has_cnh: form.hasCNH === "sim",
          cnh_category: form.hasCNH === "sim" ? form.cnhCategory : null,
          neighborhood: form.neighborhood,
          city: form.city,
          education_level: form.educationLevel,
          education_situation:
            form.educationLevel !== "Sem Escolaridade"
              ? form.educationSituation
              : null,
          availability: form.availability,
          salary_expectation: salaryExpectation,
          experiences,
          courses,
        },
      },
    });

    setSubmitting(false);

    if (error) {
      if (
        error.message.includes("already registered") ||
        error.message.includes("already been registered")
      ) {
        setSubmitError("Este e-mail já está cadastrado. Tente fazer login.");
      } else if (error.message.toLowerCase().includes("rate limit")) {
        setSubmitError(
          "Tente novamente — o volume de cadastros pelo sistema está elevado no momento."
        );
      } else {
        setSubmitError(error.message);
      }
      return;
    }

    navigate("/verificar-email");
  };

  // ─── Cursos (com sanitização + anti-vazamento de contato) ───────────────

  const handleCourseTextChange = (
    field: "title" | "institution",
    raw: string
  ) => {
    const sanitized = sanitizeText(raw);
    setCourseForm((prev) => ({ ...prev, [field]: sanitized }));
    setCourseError("");

    const result = validateFreeText(sanitized);
    if (result.ok) {
      setCourseWarning("");
    } else if (result.severity === "block") {
      // mostra o aviso forte; o block real é re-validado em addCourse()
      setCourseError(freeTextMessage(result));
      setCourseWarning("");
    } else {
      setCourseWarning(freeTextMessage(result));
    }
  };

  const addCourse = () => {
    if (!courseForm.title.trim()) {
      setCourseError("Título do curso obrigatório");
      return;
    }
    if (!courseForm.startDate) {
      setCourseError("Data de início obrigatória");
      return;
    }
    if (!courseForm.endDate) {
      setCourseError("Data de conclusão obrigatória");
      return;
    }
    // Re-valida texto livre como camada de segurança final
    const titleCheck = validateFreeText(courseForm.title);
    if (!titleCheck.ok && titleCheck.severity === "block") {
      setCourseError(`Título: ${freeTextMessage(titleCheck)}`);
      return;
    }
    const instCheck = validateFreeText(courseForm.institution);
    if (!instCheck.ok && instCheck.severity === "block") {
      setCourseError(`Instituição: ${freeTextMessage(instCheck)}`);
      return;
    }
    setCourses((prev) => [
      ...prev,
      { ...courseForm, id: Date.now().toString() },
    ]);
    setCourseForm({ title: "", institution: "", startDate: "", endDate: "" });
    setCourseError("");
    setCourseWarning("");
  };

  const removeCourse = (id: string) =>
    setCourses((prev) => prev.filter((c) => c.id !== id));

  // ─── Experiências (com sanitização + anti-vazamento de contato) ─────────

  const handleExpTextChange = (field: "title" | "company", raw: string) => {
    const sanitized = sanitizeText(raw);
    setExpForm((prev) => ({ ...prev, [field]: sanitized }));
    setExpError("");

    const result = validateFreeText(sanitized);
    if (result.ok) {
      setExpWarning("");
    } else {
      // mostra o motivo (block ou warn) — block real é re-validado em addExperience()
      setExpWarning(freeTextMessage(result));
    }
  };

  const addExperience = () => {
    if (!expForm.title.trim()) {
      setExpError("Título/Cargo obrigatório");
      return;
    }
    if (!expForm.startDate) {
      setExpError("Data de início obrigatória");
      return;
    }
    if (!expForm.current && !expForm.endDate) {
      setExpError('Data de conclusão obrigatória (ou marque "Emprego atual")');
      return;
    }
    // Re-valida texto livre como camada de segurança final
    const titleCheck = validateFreeText(expForm.title);
    if (!titleCheck.ok && titleCheck.severity === "block") {
      setExpError(`Cargo: ${freeTextMessage(titleCheck)}`);
      return;
    }
    const compCheck = validateFreeText(expForm.company);
    if (!compCheck.ok && compCheck.severity === "block") {
      setExpError(`Empresa: ${freeTextMessage(compCheck)}`);
      return;
    }
    setExperiences((prev) => [
      ...prev,
      { ...expForm, id: Date.now().toString() },
    ]);
    setExpForm({ title: "", company: "", startDate: "", endDate: "", current: false });
    setExpWarning("");
    setExpError("");
  };

  const removeExperience = (id: string) =>
    setExperiences((prev) => prev.filter((x) => x.id !== id));

  // ─── Classes utilitárias ───────────────────────────────────────────────────

  const inputClass = (field: string) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors ${
      errors[field]
        ? "border-red-300 focus:border-red-400"
        : "border-gray-200 focus:border-emerald-400"
    }`;

  const stepLabels = [
    "Dados Pessoais",
    "Perfil Profissional",
    "Experiências",
    "Cursos",
    "Senha",
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center mx-auto mb-4">
            <i className="ri-user-add-line text-white text-xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Criar meu cadastro</h1>
          <p className="text-gray-500 text-sm mt-1">Gratuito · Seguro · Sem spam</p>
        </div>

        {/* Progress stepper */}
        <div className="flex items-center gap-1 mb-8">
          {([1, 2, 3, 4, 5] as Step[]).map((s) => (
            <div key={s} className="flex-1 flex items-center gap-1">
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step > s
                      ? "bg-emerald-600 text-white"
                      : step === s
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > s ? <i className="ri-check-line text-xs"></i> : s}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
                  {stepLabels[s - 1]}
                </span>
              </div>
              {s < 5 && (
                <div
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    step > s ? "bg-emerald-600" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <form onSubmit={handleSubmit}>

            {/* ── Step 1: Dados Pessoais ── */}
            {step === 1 && (
              <div>
                <h2 className="font-bold text-gray-900 text-lg mb-1">
                  Dados Pessoais
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Suas informações pessoais são protegidas e não serão exibidas
                  para empresas.
                </p>

                <div className="space-y-4">
                  {/* Nome */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={form.fullName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Seu nome completo"
                      className={inputClass("fullName")}
                    />
                    {errors.fullName && (
                      <div className="mt-1 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <i className="ri-shield-cross-line text-red-500 text-sm mt-0.5 shrink-0"></i>
                        <p className="text-red-600 text-xs">{errors.fullName}</p>
                      </div>
                    )}
                    {!errors.fullName && nameWarning && (
                      <div className="mt-1 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <i className="ri-alert-line text-amber-600 text-sm mt-0.5 shrink-0"></i>
                        <p className="text-amber-700 text-xs">{nameWarning}</p>
                      </div>
                    )}
                  </div>

                  {/* Email + WhatsApp */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="seu@email.com"
                        className={inputClass("email")}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                        WhatsApp *
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <i className="ri-whatsapp-line text-gray-400 text-xs"></i>
                        </div>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => updatePhone(e.target.value)}
                          placeholder="(93) 99999-0000"
                          maxLength={15}
                          className={`w-full border rounded-lg pl-8 pr-3 py-2.5 text-sm text-gray-800 outline-none transition-colors ${
                            errors.phone
                              ? "border-red-300 focus:border-red-400"
                              : "border-gray-200 focus:border-emerald-400"
                          }`}
                        />
                      </div>
                      {errors.phone ? (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <i className="ri-error-warning-line"></i>
                          {errors.phone}
                        </p>
                      ) : form.phone && isValidBrazilPhone(form.phone) ? (
                        <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                          <i className="ri-checkbox-circle-line"></i>
                          Número válido
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Nascimento + Sexo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                        Data de Nascimento *
                      </label>
                      <input
                        type="date"
                        value={form.birthDate}
                        onChange={(e) => update("birthDate", e.target.value)}
                        className={inputClass("birthDate")}
                      />
                      {errors.birthDate && (
                        <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                        Sexo *
                      </label>
                      <select
                        value={form.gender}
                        onChange={(e) => update("gender", e.target.value)}
                        className={inputClass("gender")}
                      >
                        <option value="">Selecione</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                        <option value="NB">Não-binário</option>
                        <option value="NI">Prefiro não informar</option>
                      </select>
                      {errors.gender && (
                        <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                      )}
                    </div>
                  </div>

                  {/* PCD */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Pessoa com Deficiência (PCD)?
                    </label>
                    <div className="flex gap-3">
                      {[
                        { value: "nao", label: "Não" },
                        { value: "sim", label: "Sim" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => update("isPCD", opt.value)}
                          className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium cursor-pointer transition-colors ${
                            form.isPCD === opt.value
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-gray-200 text-gray-600 hover:border-emerald-300"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CNH */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Possui CNH?
                    </label>
                    <div className="flex gap-3">
                      {[
                        { value: "nao", label: "Não" },
                        { value: "sim", label: "Sim" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            update("hasCNH", opt.value);
                            if (opt.value === "nao") update("cnhCategory", "");
                          }}
                          className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium cursor-pointer transition-colors ${
                            form.hasCNH === opt.value
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-gray-200 text-gray-600 hover:border-emerald-300"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {form.hasCNH === "sim" && (
                      <div className="mt-3">
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                          Categoria da CNH *
                        </label>
                        <select
                          value={form.cnhCategory}
                          onChange={(e) =>
                            update("cnhCategory", e.target.value)
                          }
                          className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors ${
                            errors.cnhCategory
                              ? "border-red-300 focus:border-red-400"
                              : "border-gray-200 focus:border-emerald-400"
                          }`}
                        >
                          <option value="">Selecione a categoria</option>
                          {CNH_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        {errors.cnhCategory && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.cnhCategory}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Privacy badge */}
                <div className="mt-6 p-4 bg-emerald-50 rounded-lg flex items-start gap-3">
                  <i className="ri-shield-check-line text-emerald-600 text-sm mt-0.5 shrink-0"></i>
                  <p className="text-emerald-700 text-xs leading-relaxed">
                    <strong>Seus dados estão protegidos.</strong> Nome e
                    telefone nunca são exibidos para empresas.
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 2: Perfil Profissional ── */}
            {step === 2 && (
              <div>
                <h2 className="font-bold text-gray-900 text-lg mb-1">
                  Perfil Profissional
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Essas informações serão apresentadas às empresas de forma
                  anônima.
                </p>

                <div className="space-y-4">
                  {/* Cidade + Bairro */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                        Cidade *
                      </label>
                      <SearchableSelect
                        value={form.city}
                        onChange={(v) => {
                          update("city", v);
                          update("neighborhood", "");
                        }}
                        options={cities}
                        placeholder="Selecione a cidade"
                        error={errors.city}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                        Bairro onde mora *
                      </label>
                      <SearchableSelect
                        value={form.neighborhood}
                        onChange={(v) => update("neighborhood", v)}
                        options={neighborhoods}
                        placeholder={
                          form.city
                            ? "Selecione o bairro"
                            : "Selecione a cidade primeiro"
                        }
                        error={errors.neighborhood}
                        disabled={!form.city || neighborhoods.length === 0}
                      />
                      {errors.neighborhood && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.neighborhood}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Nível de Escolaridade */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Nível de Escolaridade *
                    </label>
                    <select
                      value={form.educationLevel}
                      onChange={(e) => {
                        update("educationLevel", e.target.value);
                        update("educationSituation", "");
                      }}
                      className={inputClass("educationLevel")}
                    >
                      <option value="">Selecione</option>
                      <option value="Sem Escolaridade">Sem Escolaridade</option>
                      {EDUCATION_LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                    {errors.educationLevel && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.educationLevel}
                      </p>
                    )}

                    {/* Situação — aparece apenas se não for "Sem Escolaridade" */}
                    {form.educationLevel &&
                      form.educationLevel !== "Sem Escolaridade" && (
                        <div className="mt-3">
                          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                            Situação *
                          </label>
                          <select
                            value={form.educationSituation}
                            onChange={(e) =>
                              update("educationSituation", e.target.value)
                            }
                            className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors ${
                              errors.educationSituation
                                ? "border-red-300 focus:border-red-400"
                                : "border-gray-200 focus:border-emerald-400"
                            }`}
                          >
                            <option value="">Selecione a situação</option>
                            <option value="Completo">Completo</option>
                            <option value="Incompleto">Incompleto</option>
                            <option value="Cursando">Cursando</option>
                          </select>
                          {errors.educationSituation && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.educationSituation}
                            </p>
                          )}
                        </div>
                      )}
                  </div>

                  {/* Disponibilidade — checkboxes */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-2 block">
                      Disponibilidade de horário *
                    </label>
                    <div className="space-y-2.5">
                      {AVAILABILITY_OPTIONS.map((opt) => {
                        const checked = form.availability.includes(opt);
                        return (
                          <label
                            key={opt}
                            onClick={() => toggleAvailability(opt)}
                            className="flex items-center gap-3 cursor-pointer group select-none"
                          >
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                                checked
                                  ? "bg-emerald-600 border-emerald-600"
                                  : "border-gray-300 group-hover:border-emerald-400"
                              }`}
                            >
                              {checked && (
                                <i className="ri-check-line text-white text-xs"></i>
                              )}
                            </div>
                            <span className="text-sm text-gray-700">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.availability && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.availability}
                      </p>
                    )}
                  </div>

                  {/* Pretensão Salarial */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-2 block">
                      Pretensão Salarial
                    </label>

                    {/* Sugestões rápidas */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {SALARY_SUGGESTIONS.map((s, idx) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => {
                            // Define min fixo e max = teto (ou vazio para "Acima de")
                            setActiveSuggestion(idx);
                            setForm((prev) => ({
                              ...prev,
                              salaryMin: s.min,
                              salaryMax: s.maxCap ? String(s.maxCap) : "",
                              salaryNegotiable: false,
                            }));
                          }}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                            activeSuggestion === idx && !form.salaryNegotiable
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-700"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>

                    {/* Min / Max */}
                    {!form.salaryNegotiable && (() => {
                      const sugg = activeSuggestion !== null ? SALARY_SUGGESTIONS[activeSuggestion] : null;
                      const minFixed = sugg !== null && sugg.min !== "";
                      const maxCap   = sugg?.maxCap ?? null;

                      const handleMaxChange = (raw: string) => {
                        const digits = raw.replace(/\D/g, "");
                        if (maxCap !== null) {
                          const num = digits === "" ? 0 : parseInt(digits, 10);
                          update("salaryMax", num > maxCap ? String(maxCap) : digits);
                        } else {
                          update("salaryMax", digits);
                        }
                      };

                      const handleMinChange = (raw: string) => {
                        const digits = raw.replace(/\D/g, "");
                        // ao editar min livremente, deseleciona a sugestão
                        setActiveSuggestion(null);
                        update("salaryMin", digits);
                      };

                      return (
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                              Valor mínimo
                              {minFixed && (
                                <span className="text-emerald-600 font-semibold">(fixo)</span>
                              )}
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium pointer-events-none">
                                R$
                              </span>
                              <input
                                type="text"
                                inputMode="numeric"
                                disabled={minFixed}
                                value={form.salaryMin ? formatCurrency(form.salaryMin) : ""}
                                onChange={(e) => handleMinChange(e.target.value)}
                                placeholder="0"
                                className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-emerald-400 ${
                                  minFixed
                                    ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed"
                                    : "text-gray-800 border-gray-200"
                                }`}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                              Valor máximo
                              {maxCap !== null && (
                                <span className="text-amber-600 font-semibold">
                                  (máx R$ {formatCurrency(String(maxCap))})
                                </span>
                              )}
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium pointer-events-none">
                                R$
                              </span>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={form.salaryMax ? formatCurrency(form.salaryMax) : ""}
                                onChange={(e) => handleMaxChange(e.target.value)}
                                placeholder={maxCap ? formatCurrency(String(maxCap)) : "0"}
                                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* A combinar */}
                    <label
                      onClick={() => {
                        setActiveSuggestion(null);
                        setForm((prev) => ({
                          ...prev,
                          salaryNegotiable: !prev.salaryNegotiable,
                          salaryMin: !prev.salaryNegotiable ? "" : prev.salaryMin,
                          salaryMax: !prev.salaryNegotiable ? "" : prev.salaryMax,
                        }));
                      }}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                          form.salaryNegotiable
                            ? "bg-emerald-600 border-emerald-600"
                            : "border-gray-300 hover:border-emerald-400"
                        }`}
                      >
                        {form.salaryNegotiable && (
                          <i className="ri-check-line text-white text-xs"></i>
                        )}
                      </div>
                      <span className="text-sm text-gray-700">A combinar</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Experiências Profissionais ── */}
            {step === 3 && (
              <div>
                <h2 className="font-bold text-gray-900 text-lg mb-1">
                  Experiências Profissionais
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Adicione as experiências mais recentes. Isso enriquece sua
                  candidatura.
                </p>

                {/* Formulário de adição */}
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <p className="text-xs font-semibold text-gray-600 mb-3">
                    Adicionar Experiência Profissional:
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">
                        Título do Cargo *
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        value={expForm.title}
                        onChange={(e) =>
                          handleExpTextChange("title", e.target.value)
                        }
                        placeholder="Ex: Vendedor, Atendente, Auxiliar Administrativo..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">
                        Empresa / Instituição
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        value={expForm.company}
                        onChange={(e) =>
                          handleExpTextChange("company", e.target.value)
                        }
                        placeholder="Ex: Mercado Central, Supermercado XYZ..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Data de Início *
                        </label>
                        <input
                          type="month"
                          value={expForm.startDate}
                          onChange={(e) =>
                            setExpForm((p) => ({
                              ...p,
                              startDate: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Data de Conclusão *
                        </label>
                        <input
                          type="month"
                          value={expForm.endDate}
                          disabled={expForm.current}
                          onChange={(e) =>
                            setExpForm((p) => ({
                              ...p,
                              endDate: e.target.value,
                            }))
                          }
                          className={`w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 ${
                            expForm.current
                              ? "bg-gray-100 cursor-not-allowed text-gray-400"
                              : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* Emprego atual */}
                    <label
                      onClick={() =>
                        setExpForm((p) => ({
                          ...p,
                          current: !p.current,
                          endDate: !p.current ? "" : p.endDate,
                        }))
                      }
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                          expForm.current
                            ? "bg-emerald-600 border-emerald-600"
                            : "border-gray-300 hover:border-emerald-400"
                        }`}
                      >
                        {expForm.current && (
                          <i className="ri-check-line text-white text-xs"></i>
                        )}
                      </div>
                      <span className="text-sm text-gray-700">
                        Emprego atual
                      </span>
                    </label>

                    {/* Aviso de dado sensível */}
                    {expWarning && (
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <i className="ri-alert-line text-amber-600 text-sm mt-0.5 shrink-0"></i>
                        <p className="text-amber-700 text-xs">{expWarning}</p>
                      </div>
                    )}
                    {expError && (
                      <p className="text-red-500 text-xs">{expError}</p>
                    )}

                    <button
                      type="button"
                      onClick={addExperience}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="ri-add-line text-sm"></i>
                      Adicionar Experiência
                    </button>
                  </div>
                </div>

                {/* Lista de experiências */}
                {experiences.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {experiences.length} experiência
                      {experiences.length > 1 ? "s" : ""} adicionada
                      {experiences.length > 1 ? "s" : ""}
                    </p>
                    {experiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="bg-white border border-gray-100 rounded-lg p-3 flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {exp.title}
                          </p>
                          {exp.company && (
                            <p className="text-gray-500 text-xs mt-0.5">
                              {exp.company}
                            </p>
                          )}
                          <p className="text-gray-400 text-xs mt-0.5">
                            {formatMonthYear(exp.startDate)} →{" "}
                            {exp.current ? "Atual" : formatMonthYear(exp.endDate)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExperience(exp.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 cursor-pointer transition-colors shrink-0"
                        >
                          <i className="ri-delete-bin-line text-xs"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-xl mb-4">
                    <div className="w-10 h-10 flex items-center justify-center mx-auto mb-2">
                      <i className="ri-briefcase-line text-gray-300 text-2xl"></i>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Nenhuma experiência adicionada ainda
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Você pode pular esta etapa e adicionar depois
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 4: Cursos e Certificações ── */}
            {step === 4 && (
              <div>
                <h2 className="font-bold text-gray-900 text-lg mb-1">
                  Cursos e Certificações
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Adicione os cursos que você realizou. Isso aumenta suas
                  chances de ser selecionado!
                </p>

                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <p className="text-xs font-semibold text-gray-600 mb-3">
                    Adicionar Curso
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">
                        Título do Curso *
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        value={courseForm.title}
                        onChange={(e) =>
                          handleCourseTextChange("title", e.target.value)
                        }
                        placeholder="Ex: Excel Avançado, Atendimento ao Cliente..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">
                        Instituição
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        value={courseForm.institution}
                        onChange={(e) =>
                          handleCourseTextChange("institution", e.target.value)
                        }
                        placeholder="Ex: SENAC, Udemy, Coursera..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Data de Início *
                        </label>
                        <input
                          type="month"
                          value={courseForm.startDate}
                          onChange={(e) =>
                            setCourseForm((p) => ({
                              ...p,
                              startDate: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Data de Conclusão *
                        </label>
                        <input
                          type="month"
                          value={courseForm.endDate}
                          onChange={(e) =>
                            setCourseForm((p) => ({
                              ...p,
                              endDate: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>
                    {courseWarning && (
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <i className="ri-alert-line text-amber-600 text-sm mt-0.5 shrink-0"></i>
                        <p className="text-amber-700 text-xs">{courseWarning}</p>
                      </div>
                    )}
                    {courseError && (
                      <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <i className="ri-shield-cross-line text-red-500 text-sm mt-0.5 shrink-0"></i>
                        <p className="text-red-600 text-xs">{courseError}</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={addCourse}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="ri-add-line text-sm"></i>
                      Adicionar Curso
                    </button>
                  </div>
                </div>

                {courses.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {courses.length} curso{courses.length > 1 ? "s" : ""}{" "}
                      adicionado{courses.length > 1 ? "s" : ""}
                    </p>
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-white border border-gray-100 rounded-lg p-3 flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {course.title}
                          </p>
                          {course.institution && (
                            <p className="text-gray-500 text-xs mt-0.5">
                              {course.institution}
                            </p>
                          )}
                          <p className="text-gray-400 text-xs mt-0.5">
                            {formatMonthYear(course.startDate)} → {formatMonthYear(course.endDate)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCourse(course.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 cursor-pointer transition-colors shrink-0"
                        >
                          <i className="ri-delete-bin-line text-xs"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-xl mb-4">
                    <div className="w-10 h-10 flex items-center justify-center mx-auto mb-2">
                      <i className="ri-book-open-line text-gray-300 text-2xl"></i>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Nenhum curso adicionado ainda
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Você pode pular esta etapa e adicionar depois
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 5: Senha ── */}
            {step === 5 && (
              <div>
                <h2 className="font-bold text-gray-900 text-lg mb-1">
                  Criar senha de acesso
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Você usará essa senha para acessar a plataforma e acompanhar
                  suas candidaturas.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Senha *
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className={inputClass("password")}
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Confirmar Senha *
                    </label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        update("confirmPassword", e.target.value)
                      }
                      placeholder="Repita a senha"
                      className={inputClass("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Resumo */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-600 mb-2">
                    Resumo do cadastro:
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">
                      <strong>Nome:</strong> {form.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Email:</strong> {form.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>WhatsApp:</strong> {form.phone}
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Cidade / Bairro:</strong> {form.city},{" "}
                      {form.neighborhood}
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Escolaridade:</strong> {form.educationLevel}
                      {form.educationSituation
                        ? ` – ${form.educationSituation}`
                        : ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Disponibilidade:</strong>{" "}
                      {form.availability.join(", ") || "—"}
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Experiências:</strong> {experiences.length}{" "}
                      adicionada{experiences.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Cursos:</strong> {courses.length} adicionado
                      {courses.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                  Ao criar sua conta, você concorda com nossos{" "}
                  <Link
                    to="/termos"
                    className="text-emerald-600 hover:underline"
                  >
                    Termos de Uso
                  </Link>{" "}
                  e{" "}
                  <Link
                    to="/privacidade"
                    className="text-emerald-600 hover:underline"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </div>
            )}

            {/* Navegação */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => (prev - 1) as Step)}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium cursor-pointer"
                >
                  <i className="ri-arrow-left-line text-sm"></i>
                  Voltar
                </button>
              ) : (
                <Link
                  to="/vagas"
                  className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
                >
                  Cancelar
                </Link>
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={step === 1 && otpSending}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  {step === 1 && otpSending ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-sm"></i>
                      Enviando código…
                    </>
                  ) : step === 4 ? (
                    <>Continuar para Senha <i className="ri-arrow-right-line text-sm"></i></>
                  ) : (
                    <>Continuar <i className="ri-arrow-right-line text-sm"></i></>
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    submitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {submitting ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-sm"></i>
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <i className="ri-check-line text-sm"></i>
                      Criar minha conta
                    </>
                  )}
                </button>
              )}
            </div>

            {submitError && (
              <div className="mt-4 bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex items-center gap-2">
                <i className="ri-error-warning-line text-red-500 text-sm shrink-0"></i>
                <p className="text-red-600 text-xs">{submitError}</p>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Já tem cadastro?{" "}
          <Link
            to="/login"
            className="text-emerald-600 font-semibold hover:underline cursor-pointer"
          >
            Entrar na plataforma
          </Link>
        </p>
      </div>

      {/* ── Modal OTP WhatsApp ── */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            {/* Cabeçalho */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                <i className="ri-whatsapp-line text-white text-xl"></i>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Verificação por WhatsApp
                </h3>
                <p className="text-gray-500 text-xs">
                  Enviamos um código para{" "}
                  <span className="font-semibold text-gray-700">{form.phone}</span>
                </p>
              </div>
            </div>

            {/* Estado: enviando código / erro de envio / aguardando digitar */}
            {otpSending ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <i className="ri-loader-4-line animate-spin text-3xl text-emerald-500"></i>
                <p className="text-gray-500 text-sm">Enviando código pelo WhatsApp…</p>
              </div>
            ) : otpError && otpCode === "" ? (
              /* Erro ao enviar (modal acabou de abrir e já falhou) */
              <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-3 mb-4 flex items-start gap-2">
                <i className="ri-error-warning-line text-red-500 text-sm mt-0.5 shrink-0"></i>
                <p className="text-red-600 text-xs leading-relaxed">{otpError}</p>
              </div>
            ) : (
              /* Código enviado — aguarda digitação */
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2.5 mb-5 flex items-start gap-2">
                <i className="ri-information-line text-emerald-600 text-sm mt-0.5 shrink-0"></i>
                <p className="text-emerald-700 text-xs leading-relaxed">
                  Digite o código de 6 dígitos que enviamos via WhatsApp para
                  confirmar seu número de telefone.
                </p>
              </div>
            )}

            {/* Input do código (oculto enquanto envia) */}
            {!otpSending && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Código de verificação
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, ""));
                    setOtpError("");
                  }}
                  placeholder="000000"
                  autoFocus
                  className={`w-full border rounded-lg px-3 py-3 text-center text-2xl font-bold tracking-widest outline-none transition-colors ${
                    otpError && otpCode.length > 0
                      ? "border-red-300 focus:border-red-400"
                      : "border-gray-200 focus:border-emerald-400"
                  }`}
                />
                {otpError && otpCode.length > 0 && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <i className="ri-error-warning-line shrink-0"></i>
                    {otpError}
                  </p>
                )}
              </div>
            )}

            {/* Botão confirmar */}
            {!otpSending && (
              <button
                type="button"
                onClick={verifyOTP}
                disabled={otpVerifying || otpCode.length !== 6}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                {otpVerifying ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Verificando…
                  </>
                ) : (
                  <>
                    <i className="ri-check-line"></i>
                    Confirmar código
                  </>
                )}
              </button>
            )}

            {/* Reenviar + Cancelar */}
            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                onClick={() => {
                  setOtpCode("");
                  setOtpError("");
                  sendOTP();
                }}
                disabled={otpSending || otpVerifying}
                className="text-xs text-emerald-600 hover:underline disabled:text-gray-400 flex items-center gap-1"
              >
                <i className="ri-refresh-line"></i>
                Reenviar código
              </button>
              <button
                type="button"
                onClick={() => {
                  setOtpModalOpen(false);
                  setOtpCode("");
                  setOtpError("");
                }}
                className="text-xs text-gray-400 hover:text-gray-600 hover:underline"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
