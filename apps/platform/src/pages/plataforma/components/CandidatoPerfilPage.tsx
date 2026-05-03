/**
 * CandidatoPerfilPage — Perfil do candidato com 5 abas
 *
 * Visualmente idêntico ao /cadastro: stepper numerado + white card.
 * Diferenças:
 *   • Campos pré-preenchidos do banco (Supabase)
 *   • Navegação livre entre as abas sem validação obrigatória
 *   • Aba 5 = Segurança (troca de senha), não "Criar Senha"
 *   • Detecta dirty → exibe [Atualizar Cadastro] + [Cancelar]
 *   • Fluxo de atualização: OTP WhatsApp → salvar no DB → email de confirmação
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { formatBrazilPhone, isValidBrazilPhone } from "@/hooks/useBrazilPhone";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5;

interface CourseEntry {
  id: string;
  title: string;
  institution: string;
  startDate: string; // YYYY-MM
  endDate: string;
}

interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  startDate: string; // YYYY-MM
  endDate: string;
  current: boolean;
}

interface ProfileForm {
  // Step 1
  fullName: string;
  phone: string;
  birthDate: string;
  gender: string;
  isPCD: string;      // 'nao' | 'sim'
  hasCNH: string;    // 'nao' | 'sim'
  cnhCategory: string;
  jovemAprendizOpt: boolean;
  // Step 2
  city: string;
  neighborhood: string;
  educationLevel: string;
  educationSituation: string;
  availability: string[];
  salaryMin: string;
  salaryMax: string;
  salaryNegotiable: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

const SALARY_SUGGESTIONS: { label: string; min: string; maxCap: number | null }[] = [
  { label: "Até R$ 2.000",        min: "",     maxCap: 2000 },
  { label: "R$ 2.000 – R$ 3.000", min: "2000", maxCap: 3000 },
  { label: "R$ 3.000 – R$ 5.000", min: "3000", maxCap: 5000 },
  { label: "Acima de R$ 5.000",   min: "5000", maxCap: null },
];

const STEP_LABELS = ["Dados Pessoais", "Perfil Profissional", "Experiências", "Cursos", "Segurança"];

// ─── Sanitização ──────────────────────────────────────────────────────────────

function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/&[#\w]+;/g, " ");
}

type FreeTextResult =
  | { ok: true }
  | { ok: false; severity: "block" | "warn"; reason: string };

function validateFreeText(text: string): FreeTextResult {
  if (!text || !text.trim()) return { ok: true };
  const clean = text.replace(/\s/g, "");
  const lower = text.toLowerCase();

  if (/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/.test(clean)) return { ok: false, severity: "block", reason: "CPF" };
  if (/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/.test(clean)) return { ok: false, severity: "block", reason: "CNPJ" };
  if (/\(?\d{2}\)?[\s.-]?9?\d{4}[\s.-]?\d{4}/.test(text)) return { ok: false, severity: "block", reason: "telefone" };
  if (/(?:^|\D)\d{8,}(?:\D|$)/.test(text)) return { ok: false, severity: "block", reason: "sequência numérica longa" };
  if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text)) return { ok: false, severity: "block", reason: "e-mail" };
  if (/\b(arroba|\(at\)|\[at\])\b/i.test(text)) return { ok: false, severity: "block", reason: "tentativa de ofuscar e-mail" };
  if (/\b(ponto\s+com\s+br|ponto\s+com|ponto\s+br|dot\s+com|\(dot\))\b/i.test(text)) return { ok: false, severity: "block", reason: "tentativa de ofuscar domínio" };

  for (const p of ["gmail","hotmail","outlook","yahoo","icloud","bol","uol","terra","ig","globo","protonmail"]) {
    if (new RegExp(`\\b${p}\\b`, "i").test(text)) return { ok: false, severity: "block", reason: `provedor de e-mail (${p})` };
  }

  if (/https?:\/\//i.test(text)) return { ok: false, severity: "block", reason: "URL" };
  if (/\bwww\.[a-z0-9-]+/i.test(text)) return { ok: false, severity: "block", reason: "site (www)" };
  if (/[a-z0-9-]+\.(com|net|org|io|br|app|me|tv|info|biz|xyz|co)(\.[a-z]{2})?\b/i.test(text)) return { ok: false, severity: "block", reason: "domínio" };

  for (const p of ["whatsapp","whats","wpp","zap","zapzap","zapinho","instagram","insta","facebook","fb","telegram","tg","linkedin","tiktok","twitter","snapchat","discord","skype","messenger"]) {
    if (new RegExp(`\\b${p}\\b`, "i").test(text)) return { ok: false, severity: "block", reason: `menção a ${p}` };
  }

  if (/(?:^|[\s,;.!?])@[a-z0-9._]{3,}/i.test(text)) return { ok: false, severity: "block", reason: "handle de rede social" };

  for (const p of ["me chama","me chame","me liga","me ligue","fale comigo","falar comigo","entre em contato","entrar em contato","meu contato","meu numero","meu número","chama no","manda mensagem","manda msg"]) {
    if (lower.includes(p)) return { ok: false, severity: "warn", reason: "frase de contato direto" };
  }

  return { ok: true };
}

function freeTextMessage(r: Extract<FreeTextResult, { ok: false }>): string {
  if (r.severity === "block") return `Por segurança, não inclua ${r.reason}. As empresas falam com você apenas pela plataforma.`;
  return `Detectamos uma possível ${r.reason}. Lembre-se: as empresas só podem te contatar pela plataforma.`;
}

// ─── Formatação ───────────────────────────────────────────────────────────────

function formatMonthYear(yyyyMM: string): string {
  if (!yyyyMM) return "";
  const [year, month] = yyyyMM.split("-");
  if (!year || !month) return yyyyMM;
  return new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1)
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function formatCurrency(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return parseInt(digits, 10).toLocaleString("pt-BR");
}

function toMonthValue(dateStr?: string | null): string {
  return dateStr?.slice(0, 7) ?? "";
}

function toDateValue(monthStr: string): string | null {
  return monthStr ? monthStr + "-01" : null;
}

// ─── Aprendiz ────────────────────────────────────────────────────────────────

function calcAprendizInfo(birthDate: string) {
  if (!birthDate) return { isMenorAprendiz: false, isJovemAuto: false, canOptJovem: false, age: 0 };
  const today = new Date();
  const birth = new Date(birthDate + "T00:00:00");
  let age = today.getFullYear() - birth.getFullYear();
  const md = today.getMonth() - birth.getMonth();
  if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age--;
  return {
    isMenorAprendiz: age >= 14 && age < 17,
    isJovemAuto: age === 17,
    canOptJovem: age >= 18 && age < 24,
    age,
  };
}

// ─── Mapeamento DB ↔ Form ─────────────────────────────────────────────────────

function parseEducationLevel(dbLevel?: string | null): { level: string; situation: string } {
  if (!dbLevel) return { level: "", situation: "" };
  switch (dbLevel) {
    case "Ensino Fundamental": return { level: "Fundamental", situation: "Completo" };
    case "Ensino Médio":       return { level: "Médio",       situation: "Completo" };
    case "Técnico":            return { level: "Técnico",     situation: "Completo" };
    case "Superior Incompleto":return { level: "Superior",    situation: "Incompleto" };
    case "Superior Completo":  return { level: "Superior",    situation: "Completo" };
    case "Pós-graduação":      return { level: "Pós-graduação", situation: "Completo" };
    default:                   return { level: dbLevel,       situation: "" };
  }
}

function buildEducationLevel(level: string, situation: string): string | null {
  if (!level) return null;
  if (level === "Sem Escolaridade") return "Sem Escolaridade";
  if (level === "Fundamental") return "Ensino Fundamental";
  if (level === "Médio") return "Ensino Médio";
  if (level === "Técnico") return "Técnico";
  if (level === "Superior") return situation === "Incompleto" ? "Superior Incompleto" : "Superior Completo";
  if (level === "Pós-graduação") return "Pós-graduação";
  return level;
}

function parseSalaryExpectation(text?: string | null): { min: string; max: string; negotiable: boolean } {
  if (!text || text === "A combinar") return { min: "", max: "", negotiable: true };
  const range = text.match(/R\$\s*([\d.]+)\s*[–-]\s*R\$\s*([\d.]+)/);
  if (range) return { min: range[1].replace(/\./g, ""), max: range[2].replace(/\./g, ""), negotiable: false };
  const from = text.match(/A partir de R\$\s*([\d.]+)/);
  if (from) return { min: from[1].replace(/\./g, ""), max: "", negotiable: false };
  const upto = text.match(/Até R\$\s*([\d.]+)/);
  if (upto) return { min: "", max: upto[1].replace(/\./g, ""), negotiable: false };
  return { min: "", max: "", negotiable: false };
}

function buildSalaryExpectation(min: string, max: string, negotiable: boolean): string {
  if (negotiable || (!min && !max)) return "A combinar";
  if (min && max) return `R$ ${formatCurrency(min)} – R$ ${formatCurrency(max)}`;
  if (min) return `A partir de R$ ${formatCurrency(min)}`;
  if (max) return `Até R$ ${formatCurrency(max)}`;
  return "A combinar";
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

function SearchableSelect({ value, onChange, options, placeholder = "Selecione...", error, disabled }: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const select = (opt: string) => { onChange(opt); setQuery(""); setOpen(false); };

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
        <span className={value ? "text-gray-800" : "text-gray-400"}>{value || placeholder}</span>
        <i className={`ri-arrow-down-s-line text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}></i>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input autoFocus type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar..."
              className="w-full text-sm px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-emerald-400" />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-gray-400 text-sm px-3 py-2">Nenhum resultado</p>
            ) : filtered.map((opt) => (
              <button key={opt} type="button" onClick={() => select(opt)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors ${
                  value === opt ? "bg-emerald-50 text-emerald-700 font-medium" : "text-gray-700"
                }`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const EMPTY_FORM: ProfileForm = {
  fullName: "", phone: "", birthDate: "", gender: "",
  isPCD: "nao", hasCNH: "nao", cnhCategory: "", jovemAprendizOpt: false,
  city: "Santarém", neighborhood: "", educationLevel: "", educationSituation: "",
  availability: [], salaryMin: "", salaryMax: "", salaryNegotiable: false,
};

export default function CandidatoPerfilPage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [candidateId, setCandidateId] = useState<string | null>(null);

  // Form + dirty tracking
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [originalForm, setOriginalForm] = useState<ProfileForm>(EMPTY_FORM);
  const [originalLoaded, setOriginalLoaded] = useState(false);

  // Cursos
  const [courses, setCourses] = useState<CourseEntry[]>([]);
  const [originalCourses, setOriginalCourses] = useState<CourseEntry[]>([]);
  const [courseForm, setCourseForm] = useState<Omit<CourseEntry, "id">>({ title: "", institution: "", startDate: "", endDate: "" });
  const [courseError, setCourseError] = useState("");
  const [courseWarning, setCourseWarning] = useState("");

  // Experiências
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([]);
  const [originalExperiences, setOriginalExperiences] = useState<ExperienceEntry[]>([]);
  const [expForm, setExpForm] = useState<Omit<ExperienceEntry, "id">>({ title: "", company: "", startDate: "", endDate: "", current: false });
  const [expError, setExpError] = useState("");
  const [expWarning, setExpWarning] = useState("");

  // Avisos de texto livre
  const [nameWarning, setNameWarning] = useState("");

  // Sugestão salarial ativa
  const [activeSuggestion, setActiveSuggestion] = useState<number | null>(null);

  // OTP
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  // Sucesso pós-atualização
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Senha (Step 5)
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
  const navigate = useNavigate();

  // Erro de validação de CNH (precisa de categoria)
  const [cnhError, setCnhError] = useState("");

  // ─── Dirty detection ──────────────────────────────────────────────────────

  const isDirty = useMemo(() => {
    if (!originalLoaded) return false;
    return (
      JSON.stringify(form) !== JSON.stringify(originalForm) ||
      JSON.stringify(courses) !== JSON.stringify(originalCourses) ||
      JSON.stringify(experiences) !== JSON.stringify(originalExperiences)
    );
  }, [form, originalForm, courses, originalCourses, experiences, originalExperiences, originalLoaded]);

  // ─── Load ─────────────────────────────────────────────────────────────────

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    setUserEmail(user.email ?? "");
    const meta = user.user_metadata ?? {};

    // Carrega (ou cria) linha candidates
    let { data: candidate } = await supabase
      .from("candidates")
      .select("*")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (!candidate) {
      // Primeiro acesso: upsert a partir de user_metadata
      const edu = parseEducationLevel(meta.education_level as string);
      const availArr = Array.isArray(meta.availability)
        ? (meta.availability as string[]).join(", ")
        : String(meta.availability ?? "");

      const { data: upserted } = await supabase.from("candidates").upsert({
        auth_user_id: user.id,
        nome_completo: meta.full_name ?? "",
        email: user.email ?? "",
        telefone: meta.phone ?? "",
        whatsapp: meta.phone ?? "",
        neighborhood: meta.neighborhood ?? "",
        city: meta.city ?? "Santarém",
        age: meta.birth_date ? calcAprendizInfo(meta.birth_date as string).age : null,
        gender: meta.gender ?? null,
        is_pcd: meta.is_pcd ?? false,
        has_cnh: meta.has_cnh ?? false,
        cnh_category: meta.cnh_category ?? null,
        education_level: buildEducationLevel(edu.level, edu.situation),
        education_situation: edu.situation ?? null,
        availability: availArr,
        salary_expectation: meta.salary_expectation ?? "A combinar",
        experiences: "",
        is_menor_aprendiz: meta.is_menor_aprendiz ?? false,
        is_jovem_aprendiz: meta.is_jovem_aprendiz ?? false,
      }, { onConflict: "auth_user_id" }).select().maybeSingle();
      candidate = upserted;
    }

    if (candidate) {
      setCandidateId(candidate.id as string);
    }

    // Monta o form
    const edu = parseEducationLevel(candidate?.education_level as string);
    const availStr: string = (candidate?.availability as string) ?? (
      Array.isArray(meta.availability)
        ? (meta.availability as string[]).join(", ")
        : String(meta.availability ?? "")
    );
    const availArr = availStr
      ? availStr.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const sal = parseSalaryExpectation(candidate?.salary_expectation as string);

    const loadedForm: ProfileForm = {
      fullName: ((candidate?.nome_completo ?? meta.full_name ?? "") as string),
      phone: ((candidate?.telefone ?? meta.phone ?? "") as string),
      birthDate: ((meta.birth_date ?? "") as string),
      gender: ((candidate?.gender ?? meta.gender ?? "") as string),
      isPCD: (candidate?.is_pcd ?? meta.is_pcd) ? "sim" : "nao",
      hasCNH: (candidate?.has_cnh ?? meta.has_cnh) ? "sim" : "nao",
      cnhCategory: ((candidate?.cnh_category ?? meta.cnh_category ?? "") as string),
      jovemAprendizOpt: ((meta.is_jovem_aprendiz ?? false) as boolean),
      city: ((candidate?.city ?? meta.city ?? "Santarém") as string),
      neighborhood: ((candidate?.neighborhood ?? meta.neighborhood ?? "") as string),
      educationLevel: edu.level,
      educationSituation: ((candidate?.education_situation ?? edu.situation ?? "") as string),
      availability: availArr,
      salaryMin: sal.min,
      salaryMax: sal.max,
      salaryNegotiable: sal.negotiable,
    };

    setForm(loadedForm);
    setOriginalForm(loadedForm);

    // Carrega cursos do DB
    const dbCourses: CourseEntry[] = [];
    if (candidate) {
      const { data: dbC } = await supabase
        .from("candidate_courses")
        .select("*")
        .eq("candidate_id", candidate.id)
        .order("start_date");
      if (dbC) {
        for (const c of dbC as Record<string, unknown>[]) {
          dbCourses.push({
            id: c.id as string,
            title: (c.title ?? "") as string,
            institution: (c.institution ?? "") as string,
            startDate: toMonthValue(c.start_date as string),
            endDate: toMonthValue(c.end_date as string),
          });
        }
      }

      // Primeiro acesso: importar cursos do user_metadata
      if (dbCourses.length === 0 && Array.isArray(meta.courses) && (meta.courses as unknown[]).length > 0) {
        const metaCourses = meta.courses as Array<{ title: string; institution: string; startDate: string; endDate: string }>;
        for (const c of metaCourses) {
          const { data: inserted } = await supabase.from("candidate_courses").insert({
            candidate_id: candidate.id,
            title: c.title,
            institution: c.institution,
            start_date: toDateValue(c.startDate),
            end_date: toDateValue(c.endDate),
          }).select().maybeSingle();
          if (inserted) {
            dbCourses.push({
              id: (inserted as Record<string, unknown>).id as string,
              title: ((inserted as Record<string, unknown>).title ?? "") as string,
              institution: ((inserted as Record<string, unknown>).institution ?? "") as string,
              startDate: toMonthValue((inserted as Record<string, unknown>).start_date as string),
              endDate: toMonthValue((inserted as Record<string, unknown>).end_date as string),
            });
          }
        }
      }
    }

    setCourses(dbCourses);
    setOriginalCourses(JSON.parse(JSON.stringify(dbCourses)));

    // Carrega experiências do user_metadata (estruturado do signup)
    const metaExps: ExperienceEntry[] = Array.isArray(meta.experiences)
      ? (meta.experiences as Record<string, unknown>[]).map((e) => ({
          id: ((e.id as string) ?? crypto.randomUUID()),
          title: ((e.title ?? "") as string),
          company: ((e.company ?? "") as string),
          startDate: ((e.startDate ?? "") as string),
          endDate: ((e.endDate ?? "") as string),
          current: ((e.current ?? false) as boolean),
        }))
      : [];

    setExperiences(metaExps);
    setOriginalExperiences(JSON.parse(JSON.stringify(metaExps)));
    setOriginalLoaded(true);
    setLoading(false);
  }

  // ─── Form helpers ──────────────────────────────────────────────────────────

  const update = (field: keyof ProfileForm, value: string | boolean | string[]) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "birthDate") next.jovemAprendizOpt = false;
      return next;
    });
  };

  const updatePhone = (value: string) => update("phone", formatBrazilPhone(value));

  const handleNameChange = (raw: string) => {
    const s = sanitizeText(raw);
    update("fullName", s);
    const r = validateFreeText(s);
    if (!r.ok && r.severity === "warn") setNameWarning(freeTextMessage(r));
    else setNameWarning("");
  };

  const toggleAvailability = (opt: string) => {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.includes(opt)
        ? prev.availability.filter((a) => a !== opt)
        : [...prev.availability, opt],
    }));
  };

  const cities = Object.keys(CITIES_DATA);
  const neighborhoods = CITIES_DATA[form.city] ?? [];

  // ─── Experiências ──────────────────────────────────────────────────────────

  const handleExpTextChange = (field: "title" | "company", raw: string) => {
    const s = sanitizeText(raw);
    setExpForm((p) => ({ ...p, [field]: s }));
    const r = validateFreeText(s);
    if (!r.ok) {
      if (r.severity === "block") { setExpError(freeTextMessage(r)); setExpWarning(""); }
      else { setExpWarning(freeTextMessage(r)); setExpError(""); }
    } else { setExpError(""); setExpWarning(""); }
  };

  const addExperience = () => {
    if (!expForm.title.trim()) { setExpError("Título do cargo é obrigatório"); return; }
    if (!expForm.startDate) { setExpError("Data de início é obrigatória"); return; }
    if (!expForm.current && !expForm.endDate) { setExpError("Data de conclusão é obrigatória"); return; }
    if (!expForm.current && expForm.startDate && expForm.endDate && expForm.endDate < expForm.startDate) {
      setExpError("A data de conclusão não pode ser anterior à data de início"); return;
    }
    const titleCheck = validateFreeText(expForm.title);
    if (!titleCheck.ok && titleCheck.severity === "block") { setExpError(freeTextMessage(titleCheck)); return; }
    const compCheck = validateFreeText(expForm.company);
    if (!compCheck.ok && compCheck.severity === "block") { setExpError(freeTextMessage(compCheck)); return; }

    setExperiences((prev) => [...prev, { ...expForm, id: crypto.randomUUID() }]);
    setExpForm({ title: "", company: "", startDate: "", endDate: "", current: false });
    setExpError(""); setExpWarning("");
  };

  const removeExperience = (id: string) => setExperiences((prev) => prev.filter((e) => e.id !== id));

  // ─── Cursos ────────────────────────────────────────────────────────────────

  const handleCourseTextChange = (field: "title" | "institution", raw: string) => {
    const s = sanitizeText(raw);
    setCourseForm((p) => ({ ...p, [field]: s }));
    const r = validateFreeText(s);
    if (!r.ok) {
      if (r.severity === "block") { setCourseError(freeTextMessage(r)); setCourseWarning(""); }
      else { setCourseWarning(freeTextMessage(r)); setCourseError(""); }
    } else { setCourseError(""); setCourseWarning(""); }
  };

  const addCourse = () => {
    if (!courseForm.title.trim()) { setCourseError("Título do curso é obrigatório"); return; }
    if (!courseForm.startDate) { setCourseError("Data de início é obrigatória"); return; }
    if (!courseForm.endDate) { setCourseError("Data de conclusão é obrigatória"); return; }
    if (courseForm.startDate && courseForm.endDate && courseForm.endDate < courseForm.startDate) {
      setCourseError("A data de conclusão não pode ser anterior à data de início"); return;
    }
    const titleCheck = validateFreeText(courseForm.title);
    if (!titleCheck.ok && titleCheck.severity === "block") { setCourseError(freeTextMessage(titleCheck)); return; }
    const instCheck = validateFreeText(courseForm.institution);
    if (!instCheck.ok && instCheck.severity === "block") { setCourseError(freeTextMessage(instCheck)); return; }

    setCourses((prev) => [...prev, { ...courseForm, id: crypto.randomUUID() }]);
    setCourseForm({ title: "", institution: "", startDate: "", endDate: "" });
    setCourseError(""); setCourseWarning("");
  };

  const removeCourse = (id: string) => setCourses((prev) => prev.filter((c) => c.id !== id));

  // ─── OTP ──────────────────────────────────────────────────────────────────

  const sendOTP = async () => {
    setOtpError(""); setOtpSending(true);
    try {
      const res = await fetch(`${API_URL}/v1/interesse/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone }),
      });
      if (!res.ok) throw new Error();
      setOtpCode("");
    } catch {
      setOtpError("Não foi possível enviar o código. Verifique sua conexão e tente novamente.");
    } finally {
      setOtpSending(false);
    }
  };

  const openOTPModal = async () => {
    // Valida CNH antes de abrir o OTP
    if (form.hasCNH === "sim" && !form.cnhCategory) {
      setCnhError("Selecione a categoria da CNH para continuar.");
      setStep(1);
      return;
    }
    if (!isValidBrazilPhone(form.phone)) {
      alert("Número de WhatsApp inválido. Verifique o número antes de continuar.");
      return;
    }
    setCnhError("");
    setOtpCode(""); setOtpError("");
    setOtpModalOpen(true);
    await sendOTP();
  };

  const verifyOTPAndSave = async () => {
    if (otpCode.trim().length !== 6) { setOtpError("Digite os 6 dígitos do código"); return; }
    setOtpError(""); setOtpVerifying(true);
    try {
      const res = await fetch(`${API_URL}/v1/interesse/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, code: otpCode.trim() }),
      });
      if (!res.ok) { setOtpError("Código inválido ou expirado. Solicite um novo código."); return; }
      setOtpModalOpen(false);
      await saveChanges();
    } catch {
      setOtpError("Erro ao verificar código. Tente novamente.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // ─── Salvar alterações ────────────────────────────────────────────────────

  async function saveChanges() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const eduLevel = buildEducationLevel(form.educationLevel, form.educationSituation);
      const salaryExp = buildSalaryExpectation(form.salaryMin, form.salaryMax, form.salaryNegotiable);
      const availStr = form.availability.join(", ");
      const ageCalc = form.birthDate ? calcAprendizInfo(form.birthDate).age : null;

      // 1. Atualiza candidates
      const { error: candErr } = await supabase
        .from("candidates")
        .update({
          nome_completo: form.fullName.trim(),
          telefone: form.phone,
          whatsapp: form.phone,
          age: ageCalc,
          gender: form.gender || null,
          is_pcd: form.isPCD === "sim",
          has_cnh: form.hasCNH === "sim",
          cnh_category: form.hasCNH === "sim" ? (form.cnhCategory || null) : null,
          neighborhood: form.neighborhood,
          city: form.city,
          education_level: eduLevel,
          education_situation: form.educationSituation || null,
          availability: availStr,
          salary_expectation: salaryExp,
        })
        .eq("auth_user_id", user.id);
      if (candErr) throw candErr;

      // 2. Sincroniza cursos
      if (candidateId) {
        const origIds = new Set(originalCourses.map((c) => c.id));
        const currIds = new Set(courses.map((c) => c.id));

        // Deletar removidos
        for (const id of origIds) {
          if (!currIds.has(id)) await supabase.from("candidate_courses").delete().eq("id", id);
        }

        for (const c of courses) {
          if (!origIds.has(c.id)) {
            // Inserir novos
            await supabase.from("candidate_courses").insert({
              candidate_id: candidateId,
              title: c.title,
              institution: c.institution,
              start_date: toDateValue(c.startDate),
              end_date: toDateValue(c.endDate),
            });
          } else {
            // Atualizar modificados
            const orig = originalCourses.find((o) => o.id === c.id);
            if (orig && JSON.stringify(c) !== JSON.stringify(orig)) {
              await supabase.from("candidate_courses").update({
                title: c.title,
                institution: c.institution,
                start_date: toDateValue(c.startDate),
                end_date: toDateValue(c.endDate),
              }).eq("id", c.id);
            }
          }
        }
      }

      // 3. Atualiza user_metadata (preserva experiências estruturadas)
      await supabase.auth.updateUser({
        data: {
          full_name: form.fullName.trim(),
          first_name: form.fullName.trim().split(/\s+/)[0],
          phone: form.phone,
          birth_date: form.birthDate,
          gender: form.gender,
          is_pcd: form.isPCD === "sim",
          has_cnh: form.hasCNH === "sim",
          cnh_category: form.hasCNH === "sim" ? (form.cnhCategory || null) : null,
          neighborhood: form.neighborhood,
          city: form.city,
          education_level: form.educationLevel,
          education_situation: form.educationSituation,
          availability: form.availability,
          salary_expectation: salaryExp,
          experiences,
          is_jovem_aprendiz: form.jovemAprendizOpt || calcAprendizInfo(form.birthDate).isJovemAuto,
        },
      });

      // 4. Envia email de notificação (fire and forget)
      fetch(`${API_URL}/v1/profile/notify-change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, name: form.fullName.trim() }),
      }).catch(() => {/* silencioso — não bloqueia o fluxo */});

      // 5. Atualiza snapshots → limpa dirty
      setOriginalForm({ ...form });
      setOriginalCourses(JSON.parse(JSON.stringify(courses)));
      setOriginalExperiences(JSON.parse(JSON.stringify(experiences)));
      setUpdateSuccess(true);
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      alert("Ocorreu um erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const handleCancel = () => {
    setForm({ ...originalForm });
    setCourses(JSON.parse(JSON.stringify(originalCourses)));
    setExperiences(JSON.parse(JSON.stringify(originalExperiences)));
    setNameWarning(""); setExpError(""); setExpWarning(""); setCourseError(""); setCourseWarning("");
    setActiveSuggestion(null);
  };

  // ─── Senha (Step 5) ───────────────────────────────────────────────────────

  const handlePasswordChange = async () => {
    setPasswordError("");
    if (!newPassword || newPassword.length < 6) { setPasswordError("Nova senha deve ter ao menos 6 caracteres"); return; }
    if (newPassword !== confirmNewPassword) { setPasswordError("As senhas não conferem"); return; }
    setPasswordSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword(""); setConfirmNewPassword(""); setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch {
      setPasswordError("Erro ao alterar senha. Tente novamente.");
    } finally {
      setPasswordSaving(false);
    }
  };

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-emerald-500 text-3xl block mb-3"></i>
          <p className="text-gray-500 text-sm">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // ─── Aprendiz info ────────────────────────────────────────────────────────

  const aprendizInfo = calcAprendizInfo(form.birthDate);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto">

      {/* ── Barra de navegação do perfil ── */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigate("/plataforma")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium cursor-pointer transition-colors"
        >
          <i className="ri-arrow-left-line text-base"></i>
          Voltar
        </button>
        <button
          type="button"
          onClick={() => navigate("/plataforma")}
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
          title="Fechar perfil"
        >
          <i className="ri-close-line text-lg"></i>
        </button>
      </div>

      {/* ── Stepper ── */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 mb-4 shadow-sm">
        <div className="flex items-center justify-between">
          {STEP_LABELS.map((label, idx) => {
            const n = (idx + 1) as Step;
            const isActive = n === step;
            const isDone = n < step;
            return (
              <div key={n} className="flex items-center flex-1">
                {/* Circle + label */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setStep(n)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all cursor-pointer ${
                      isDone
                        ? "bg-emerald-600 text-white"
                        : isActive
                        ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                        : "bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
                    }`}
                  >
                    {isDone ? <i className="ri-check-line text-sm"></i> : n}
                  </button>
                  <span className={`hidden sm:block text-xs mt-1.5 font-medium whitespace-nowrap ${
                    isActive ? "text-emerald-700" : isDone ? "text-emerald-600" : "text-gray-400"
                  }`}>{label}</span>
                </div>

                {/* Connector line */}
                {idx < STEP_LABELS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 sm:mb-0 transition-colors ${n < step ? "bg-emerald-500" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Card de conteúdo ── */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-6 shadow-sm">

        {/* ─── Step 1: Dados Pessoais ─── */}
        {step === 1 && (
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-1">Dados Pessoais</h2>
            <p className="text-gray-500 text-sm mb-6">Suas informações básicas de identificação.</p>

            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome Completo *</label>
                <input type="text" value={form.fullName} onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400" />
                {nameWarning && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-1">
                    <i className="ri-alert-line text-amber-600 text-sm mt-0.5 shrink-0"></i>
                    <p className="text-amber-700 text-xs">{nameWarning}</p>
                  </div>
                )}
              </div>

              {/* Email somente leitura */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email</label>
                <input type="email" value={userEmail} readOnly
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-500 bg-gray-50 outline-none cursor-not-allowed" />
                <p className="text-gray-400 text-xs mt-1">Gerenciado pela plataforma. Para alterar, entre em contato com o suporte.</p>
              </div>

              {/* WhatsApp */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">WhatsApp *</label>
                <div className="relative">
                  <input type="tel" value={form.phone} onChange={(e) => updatePhone(e.target.value)}
                    placeholder="(XX) XXXXX-XXXX" maxLength={15}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors pr-8 ${
                      form.phone && isValidBrazilPhone(form.phone)
                        ? "border-emerald-400 focus:border-emerald-500"
                        : form.phone && !isValidBrazilPhone(form.phone)
                        ? "border-red-300 focus:border-red-400"
                        : "border-gray-200 focus:border-emerald-400"
                    }`} />
                  {form.phone && (
                    <i className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${
                      isValidBrazilPhone(form.phone) ? "ri-check-line text-emerald-500" : "ri-close-line text-red-400"
                    }`}></i>
                  )}
                </div>
                {form.phone && !isValidBrazilPhone(form.phone) && (
                  <p className="text-red-500 text-xs mt-1">Número inválido. Use o formato (XX) XXXXX-XXXX</p>
                )}
              </div>

              {/* Nascimento + Sexo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Data de Nascimento *</label>
                  <input type="date" value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Sexo *</label>
                  <select value={form.gender} onChange={(e) => update("gender", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400">
                    <option value="">Selecione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="NB">Não-binário</option>
                    <option value="NI">Prefiro não informar</option>
                  </select>
                </div>
              </div>

              {/* Aprendiz badges */}
              {form.birthDate && aprendizInfo.isMenorAprendiz && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <i className="ri-award-line text-blue-600 text-sm"></i>
                  <span className="text-blue-700 text-xs font-semibold">Menor Aprendiz ({aprendizInfo.age} anos)</span>
                </div>
              )}
              {form.birthDate && aprendizInfo.isJovemAuto && (
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
                  <i className="ri-award-line text-indigo-600 text-sm"></i>
                  <span className="text-indigo-700 text-xs font-semibold">Jovem Aprendiz ({aprendizInfo.age} anos)</span>
                </div>
              )}
              {form.birthDate && aprendizInfo.canOptJovem && (
                <label onClick={() => update("jovemAprendizOpt", !form.jovemAprendizOpt)}
                  className="flex items-center gap-3 cursor-pointer select-none bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2.5">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    form.jovemAprendizOpt ? "bg-indigo-600 border-indigo-600" : "border-indigo-300"
                  }`}>
                    {form.jovemAprendizOpt && <i className="ri-check-line text-white text-xs"></i>}
                  </div>
                  <span className="text-sm text-indigo-700">Participar de vagas como Jovem Aprendiz ({aprendizInfo.age} anos)</span>
                </label>
              )}

              {/* PCD */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Pessoa com Deficiência (PCD)?</label>
                <div className="flex gap-2">
                  {["nao", "sim"].map((v) => (
                    <button key={v} type="button" onClick={() => update("isPCD", v)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all cursor-pointer ${
                        form.isPCD === v ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-emerald-200"
                      }`}>
                      {v === "nao" ? "Não" : "Sim"}
                    </button>
                  ))}
                </div>
              </div>

              {/* CNH */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Possui CNH?</label>
                <div className="flex gap-2">
                  {["nao", "sim"].map((v) => (
                    <button key={v} type="button"
                      onClick={() => { update("hasCNH", v); if (v === "nao") { update("cnhCategory", ""); setCnhError(""); } }}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all cursor-pointer ${
                        form.hasCNH === v ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-emerald-200"
                      }`}>
                      {v === "nao" ? "Não" : "Sim"}
                    </button>
                  ))}
                </div>
                {form.hasCNH === "sim" && (
                  <div className="mt-3">
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Categoria da CNH *</label>
                    <select value={form.cnhCategory}
                      onChange={(e) => { update("cnhCategory", e.target.value); if (e.target.value) setCnhError(""); }}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 ${
                        cnhError ? "border-red-400 bg-red-50" : "border-gray-200"
                      }`}>
                      <option value="">Selecione</option>
                      {CNH_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    {cnhError && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="ri-error-warning-line"></i> {cnhError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Privacy badge */}
              <div className="mt-2 p-4 bg-emerald-50 rounded-lg flex items-start gap-3">
                <i className="ri-shield-check-line text-emerald-600 text-sm mt-0.5 shrink-0"></i>
                <p className="text-emerald-700 text-xs leading-relaxed">
                  <strong>Seus dados estão protegidos.</strong> Nome e telefone nunca são exibidos para empresas.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 2: Perfil Profissional ─── */}
        {step === 2 && (
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-1">Perfil Profissional</h2>
            <p className="text-gray-500 text-sm mb-6">Essas informações serão apresentadas às empresas de forma anônima.</p>

            <div className="space-y-4">
              {/* Cidade + Bairro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Cidade *</label>
                  <SearchableSelect value={form.city}
                    onChange={(v) => { update("city", v); update("neighborhood", ""); }}
                    options={cities} placeholder="Selecione a cidade" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Bairro onde mora *</label>
                  <SearchableSelect value={form.neighborhood}
                    onChange={(v) => update("neighborhood", v)}
                    options={neighborhoods}
                    placeholder={form.city ? "Selecione o bairro" : "Selecione a cidade primeiro"}
                    disabled={!form.city || neighborhoods.length === 0} />
                </div>
              </div>

              {/* Escolaridade */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nível de Escolaridade *</label>
                <select value={form.educationLevel}
                  onChange={(e) => { update("educationLevel", e.target.value); update("educationSituation", ""); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400">
                  <option value="">Selecione</option>
                  <option value="Sem Escolaridade">Sem Escolaridade</option>
                  {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                {form.educationLevel && form.educationLevel !== "Sem Escolaridade" && (
                  <div className="mt-3">
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Situação *</label>
                    <select value={form.educationSituation} onChange={(e) => update("educationSituation", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400">
                      <option value="">Selecione a situação</option>
                      <option value="Completo">Completo</option>
                      <option value="Incompleto">Incompleto</option>
                      <option value="Cursando">Cursando</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Disponibilidade */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Disponibilidade de horário *</label>
                <div className="space-y-2.5">
                  {AVAILABILITY_OPTIONS.map((opt) => {
                    const checked = form.availability.includes(opt);
                    return (
                      <label key={opt} onClick={() => toggleAvailability(opt)}
                        className="flex items-center gap-3 cursor-pointer group select-none">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                          checked ? "bg-emerald-600 border-emerald-600" : "border-gray-300 group-hover:border-emerald-400"
                        }`}>
                          {checked && <i className="ri-check-line text-white text-xs"></i>}
                        </div>
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Pretensão salarial */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Pretensão Salarial</label>
                {/* Sugestões rápidas */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {SALARY_SUGGESTIONS.map((s, idx) => (
                    <button key={s.label} type="button"
                      onClick={() => {
                        setActiveSuggestion(idx);
                        setForm((prev) => ({ ...prev, salaryMin: s.min, salaryMax: s.maxCap ? String(s.maxCap) : "", salaryNegotiable: false }));
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                        activeSuggestion === idx && !form.salaryNegotiable
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-700"
                      }`}>
                      {s.label}
                    </button>
                  ))}
                </div>
                {/* Min/Max */}
                {!form.salaryNegotiable && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Valor mínimo</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium pointer-events-none">R$</span>
                        <input type="text" inputMode="numeric"
                          value={form.salaryMin ? formatCurrency(form.salaryMin) : ""}
                          onChange={(e) => { setActiveSuggestion(null); update("salaryMin", e.target.value.replace(/\D/g, "")); }}
                          placeholder="0"
                          className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Valor máximo</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium pointer-events-none">R$</span>
                        <input type="text" inputMode="numeric"
                          value={form.salaryMax ? formatCurrency(form.salaryMax) : ""}
                          onChange={(e) => { setActiveSuggestion(null); update("salaryMax", e.target.value.replace(/\D/g, "")); }}
                          placeholder="0"
                          className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400" />
                      </div>
                    </div>
                  </div>
                )}
                {/* A combinar */}
                <label onClick={() => {
                  setActiveSuggestion(null);
                  setForm((prev) => ({ ...prev, salaryNegotiable: !prev.salaryNegotiable, salaryMin: !prev.salaryNegotiable ? "" : prev.salaryMin, salaryMax: !prev.salaryNegotiable ? "" : prev.salaryMax }));
                }} className="flex items-center gap-2 cursor-pointer select-none">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                    form.salaryNegotiable ? "bg-emerald-600 border-emerald-600" : "border-gray-300 hover:border-emerald-400"
                  }`}>
                    {form.salaryNegotiable && <i className="ri-check-line text-white text-xs"></i>}
                  </div>
                  <span className="text-sm text-gray-700">A combinar</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 3: Experiências ─── */}
        {step === 3 && (
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-1">Experiências Profissionais</h2>
            <p className="text-gray-500 text-sm mb-6">Adicione ou edite suas experiências. Isso enriquece sua candidatura.</p>

            {/* Formulário de adição */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="text-xs font-semibold text-gray-600 mb-3">Adicionar Experiência Profissional:</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Título do Cargo *</label>
                  <input type="text" maxLength={100} value={expForm.title}
                    onChange={(e) => handleExpTextChange("title", e.target.value)}
                    placeholder="Ex: Vendedor, Atendente, Auxiliar Administrativo..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Empresa / Instituição</label>
                  <input type="text" maxLength={100} value={expForm.company}
                    onChange={(e) => handleExpTextChange("company", e.target.value)}
                    placeholder="Ex: Mercado Central, Supermercado XYZ..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Data de Início *</label>
                    <input type="month" value={expForm.startDate}
                      onChange={(e) => setExpForm((p) => ({ ...p, startDate: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Data de Conclusão *</label>
                    <input type="month" value={expForm.endDate} disabled={expForm.current}
                      onChange={(e) => setExpForm((p) => ({ ...p, endDate: e.target.value }))}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors ${
                        expForm.current ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400"
                          : expForm.startDate && expForm.endDate && expForm.endDate < expForm.startDate
                          ? "border-red-300 focus:border-red-400 text-gray-800"
                          : "border-gray-200 focus:border-emerald-400 text-gray-800"
                      }`} />
                    {!expForm.current && expForm.startDate && expForm.endDate && expForm.endDate < expForm.startDate && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="ri-error-warning-line"></i> Deve ser igual ou posterior à data de início
                      </p>
                    )}
                  </div>
                </div>
                {/* Emprego atual */}
                <label onClick={() => setExpForm((p) => ({ ...p, current: !p.current, endDate: !p.current ? "" : p.endDate }))}
                  className="flex items-center gap-2 cursor-pointer select-none">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                    expForm.current ? "bg-emerald-600 border-emerald-600" : "border-gray-300 hover:border-emerald-400"
                  }`}>
                    {expForm.current && <i className="ri-check-line text-white text-xs"></i>}
                  </div>
                  <span className="text-sm text-gray-700">Emprego atual</span>
                </label>
                {expWarning && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <i className="ri-alert-line text-amber-600 text-sm mt-0.5 shrink-0"></i>
                    <p className="text-amber-700 text-xs">{expWarning}</p>
                  </div>
                )}
                {expError && <p className="text-red-500 text-xs">{expError}</p>}
                <button type="button" onClick={addExperience}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-center gap-2">
                  <i className="ri-add-line text-sm"></i> Adicionar Experiência
                </button>
              </div>
            </div>

            {/* Lista de experiências */}
            {experiences.length > 0 ? (
              <div className="space-y-2 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {experiences.length} experiência{experiences.length > 1 ? "s" : ""} adicionada{experiences.length > 1 ? "s" : ""}
                </p>
                {experiences.map((exp) => (
                  <div key={exp.id} className="bg-white border border-gray-100 rounded-lg p-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{exp.title}</p>
                      {exp.company && <p className="text-gray-500 text-xs mt-0.5">{exp.company}</p>}
                      <p className="text-gray-400 text-xs mt-0.5">
                        {formatMonthYear(exp.startDate)} → {exp.current ? "Atual" : formatMonthYear(exp.endDate)}
                      </p>
                    </div>
                    <button type="button" onClick={() => removeExperience(exp.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 cursor-pointer transition-colors shrink-0">
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
                <p className="text-gray-400 text-sm">Nenhuma experiência adicionada ainda</p>
              </div>
            )}
          </div>
        )}

        {/* ─── Step 4: Cursos ─── */}
        {step === 4 && (
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-1">Cursos e Certificações</h2>
            <p className="text-gray-500 text-sm mb-6">Adicione ou edite seus cursos. Isso aumenta suas chances de ser selecionado!</p>

            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="text-xs font-semibold text-gray-600 mb-3">Adicionar Curso</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Título do Curso *</label>
                  <input type="text" maxLength={100} value={courseForm.title}
                    onChange={(e) => handleCourseTextChange("title", e.target.value)}
                    placeholder="Ex: Excel Avançado, Atendimento ao Cliente..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Instituição</label>
                  <input type="text" maxLength={100} value={courseForm.institution}
                    onChange={(e) => handleCourseTextChange("institution", e.target.value)}
                    placeholder="Ex: SENAC, Udemy, Coursera..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Data de Início *</label>
                    <input type="month" value={courseForm.startDate}
                      onChange={(e) => setCourseForm((p) => ({ ...p, startDate: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Data de Conclusão *</label>
                    <input type="month" value={courseForm.endDate}
                      onChange={(e) => setCourseForm((p) => ({ ...p, endDate: e.target.value }))}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors ${
                        courseForm.startDate && courseForm.endDate && courseForm.endDate < courseForm.startDate
                          ? "border-red-300 focus:border-red-400"
                          : "border-gray-200 focus:border-emerald-400"
                      }`} />
                    {courseForm.startDate && courseForm.endDate && courseForm.endDate < courseForm.startDate && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="ri-error-warning-line"></i> Deve ser igual ou posterior à data de início
                      </p>
                    )}
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
                <button type="button" onClick={addCourse}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-center gap-2">
                  <i className="ri-add-line text-sm"></i> Adicionar Curso
                </button>
              </div>
            </div>

            {courses.length > 0 ? (
              <div className="space-y-2 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {courses.length} curso{courses.length > 1 ? "s" : ""} adicionado{courses.length > 1 ? "s" : ""}
                </p>
                {courses.map((course) => (
                  <div key={course.id} className="bg-white border border-gray-100 rounded-lg p-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{course.title}</p>
                      {course.institution && <p className="text-gray-500 text-xs mt-0.5">{course.institution}</p>}
                      <p className="text-gray-400 text-xs mt-0.5">
                        {formatMonthYear(course.startDate)} → {formatMonthYear(course.endDate)}
                      </p>
                    </div>
                    <button type="button" onClick={() => removeCourse(course.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 cursor-pointer transition-colors shrink-0">
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
                <p className="text-gray-400 text-sm">Nenhum curso adicionado ainda</p>
              </div>
            )}
          </div>
        )}

        {/* ─── Step 5: Segurança ─── */}
        {step === 5 && (
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-1">Segurança</h2>
            <p className="text-gray-500 text-sm mb-6">Gerencie sua senha de acesso à plataforma.</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nova Senha</label>
                <input type="password" value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError(""); }}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Confirmar Nova Senha</label>
                <input type="password" value={confirmNewPassword}
                  onChange={(e) => { setConfirmNewPassword(e.target.value); setPasswordError(""); }}
                  placeholder="Repita a nova senha"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400" />
              </div>
              {passwordError && <p className="text-red-500 text-xs">{passwordError}</p>}
              {passwordSuccess && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  <i className="ri-check-line text-emerald-600 text-sm"></i>
                  <p className="text-emerald-700 text-xs font-medium">Senha alterada com sucesso!</p>
                </div>
              )}
              <button type="button" onClick={handlePasswordChange} disabled={passwordSaving}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-center gap-2">
                {passwordSaving ? (
                  <><i className="ri-loader-4-line animate-spin text-sm"></i> Salvando...</>
                ) : (
                  <><i className="ri-lock-line text-sm"></i> Alterar Senha</>
                )}
              </button>
            </div>

            <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
              <i className="ri-information-line text-amber-500 text-sm mt-0.5 shrink-0"></i>
              <div>
                <p className="text-amber-800 text-sm font-semibold mb-1">Dica de segurança</p>
                <p className="text-amber-700 text-xs leading-relaxed">
                  Use uma senha forte com letras maiúsculas, minúsculas, números e símbolos. Não compartilhe sua senha com ninguém.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Botões de atualização — aparecem quando há alterações ── */}
        {isDirty && (
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <button type="button" onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium cursor-pointer px-4 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              Cancelar
            </button>
            <button type="button" onClick={openOTPModal} disabled={saving}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-center gap-2">
              {saving ? (
                <><i className="ri-loader-4-line animate-spin text-sm"></i> Salvando...</>
              ) : (
                <><i className="ri-save-line text-sm"></i> Atualizar Cadastro</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Modal OTP ── */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <i className="ri-whatsapp-line text-emerald-600 text-2xl"></i>
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Verificação por WhatsApp</h3>
              <p className="text-gray-500 text-sm mt-1">
                Enviamos um código de 6 dígitos para <strong className="text-gray-700">{form.phone}</strong>.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Código de verificação</label>
                <input type="text" inputMode="numeric" maxLength={6}
                  value={otpCode}
                  onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
                  placeholder="000000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-3 text-center text-xl font-bold text-gray-900 tracking-widest outline-none focus:border-emerald-400"
                  autoFocus />
              </div>

              {otpError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <i className="ri-error-warning-line text-red-500 text-sm mt-0.5 shrink-0"></i>
                  <p className="text-red-600 text-xs">{otpError}</p>
                </div>
              )}

              <button type="button" onClick={verifyOTPAndSave} disabled={otpVerifying || otpCode.length !== 6}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm cursor-pointer transition-colors flex items-center justify-center gap-2">
                {otpVerifying ? (
                  <><i className="ri-loader-4-line animate-spin text-sm"></i> Verificando...</>
                ) : (
                  <><i className="ri-check-line text-sm"></i> Confirmar e Salvar</>
                )}
              </button>

              <div className="flex items-center justify-between">
                <button type="button" onClick={sendOTP} disabled={otpSending}
                  className="text-xs text-emerald-600 hover:underline cursor-pointer disabled:opacity-50">
                  {otpSending ? "Enviando..." : "Reenviar código"}
                </button>
                <button type="button" onClick={() => setOtpModalOpen(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Sucesso ── */}
      {updateSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-emerald-600 text-3xl"></i>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Cadastro atualizado!</h3>
            <p className="text-gray-500 text-sm mb-2">Suas informações foram salvas com sucesso.</p>
            <p className="text-gray-400 text-xs mb-6 leading-relaxed">
              Enviamos um email para{" "}
              <strong className="text-gray-600">{userEmail}</strong>{" "}
              para confirmar a alteração. Verifique sua caixa de entrada.
            </p>
            <button type="button" onClick={() => setUpdateSuccess(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm cursor-pointer transition-colors">
              Ok, entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
