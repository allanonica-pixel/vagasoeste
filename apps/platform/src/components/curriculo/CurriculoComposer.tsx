/**
 * CurriculoComposer — componente unificado de currículo
 *
 * Usado em dois contextos:
 *   mode="authenticated"  →  /plataforma aba "Meu Currículo"
 *                            Carrega/salva curriculo_data (JSONB) no Supabase.
 *   mode="guest"          →  /curriculo-avulso
 *                            Estado local puro, somente download de PDF.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  startDate: string; // "YYYY-MM"
  endDate: string;   // "YYYY-MM"
  isCurrent: boolean;
  description: string;
}

export interface CourseEntry {
  id: string;
  title: string;
  institution: string;
  year: string; // "2024"
}

export interface CurriculoData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  neighborhood: string;
  birthDate: string; // "YYYY-MM-DD"
  objective: string;
  educationLevel: string;
  educationInstitution: string;
  educationYear: string;
  experiences: ExperienceEntry[];
  courses: CourseEntry[];
  skills: string;
  languages: string;
}

interface CurriculoComposerProps {
  mode: "guest" | "authenticated";
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_DATA: CurriculoData = {
  fullName: "",
  email: "",
  phone: "",
  city: "Santarém",
  neighborhood: "",
  birthDate: "",
  objective: "",
  educationLevel: "",
  educationInstitution: "",
  educationYear: "",
  experiences: [],
  courses: [],
  skills: "",
  languages: "",
};

const EDUCATION_LEVELS = [
  "Ensino Fundamental",
  "Ensino Médio",
  "Técnico",
  "Superior Incompleto",
  "Superior Completo",
  "Pós-graduação",
];

type BuilderStep = "dados" | "experiencias" | "cursos" | "habilidades" | "preview";

const STEPS: { id: BuilderStep; label: string; icon: string }[] = [
  { id: "dados",        label: "Dados",        icon: "ri-user-line" },
  { id: "experiencias", label: "Experiências",  icon: "ri-briefcase-line" },
  { id: "cursos",       label: "Cursos",        icon: "ri-book-open-line" },
  { id: "habilidades",  label: "Habilidades",   icon: "ri-star-line" },
  { id: "preview",      label: "Prévia",        icon: "ri-eye-line" },
];

// ─────────────────────────────────────────────────────────────────────────────
// CurriculoComposer
// ─────────────────────────────────────────────────────────────────────────────

export default function CurriculoComposer({ mode }: CurriculoComposerProps) {
  // ── State ───────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<BuilderStep>("dados");
  const [data, setData] = useState<CurriculoData>(EMPTY_DATA);
  const [savedSnapshot, setSavedSnapshot] = useState<string>("");
  const [candidateId, setCandidateId] = useState<string | null>(null);

  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">(
    mode === "authenticated" ? "loading" : "ready"
  );
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [expForm, setExpForm] = useState<Omit<ExperienceEntry, "id">>({
    company: "", role: "", startDate: "", endDate: "", isCurrent: false, description: "",
  });
  const [courseForm, setCourseForm] = useState<Omit<CourseEntry, "id">>({
    title: "", institution: "", year: "",
  });

  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // ── Dirty tracking ──────────────────────────────────────────────────────────
  const isDirty = useMemo(() => {
    if (mode !== "authenticated" || loadState !== "ready") return false;
    return JSON.stringify(data) !== savedSnapshot;
  }, [data, savedSnapshot, mode, loadState]);

  // ── Load from DB (authenticated) ────────────────────────────────────────────
  const loadFromDB = useCallback(async () => {
    setLoadState("loading");
    setSaveError(null);
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) { setLoadState("error"); return; }

      const { data: candidate, error: candErr } = await supabase
        .from("candidates")
        .select("id, nome_completo, email, telefone, city, neighborhood, education_level, curriculo_data, candidate_courses(*)")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (candErr || !candidate) { setLoadState("error"); return; }
      setCandidateId(candidate.id);

      let loaded: CurriculoData;

      if (candidate.curriculo_data) {
        // ── Snapshot salvo → usa direto ──────────────────────────────────────
        loaded = candidate.curriculo_data as CurriculoData;
      } else {
        // ── Primeiro acesso → pré-preenche do perfil ─────────────────────────
        const meta = (user.user_metadata ?? {}) as Record<string, unknown>;

        const rawExps = Array.isArray(meta.experiences)
          ? (meta.experiences as Array<Record<string, unknown>>)
          : [];

        const dbCourses = Array.isArray(candidate.candidate_courses)
          ? (candidate.candidate_courses as Array<{ id: string; title: string; institution?: string; end_date?: string }>)
          : [];

        loaded = {
          fullName:             candidate.nome_completo ?? "",
          email:                user.email ?? "",
          phone:                candidate.telefone ?? "",
          city:                 candidate.city ?? "Santarém",
          neighborhood:         candidate.neighborhood ?? "",
          birthDate:            typeof meta.birth_date === "string" ? meta.birth_date : "",
          objective:            "",
          educationLevel:       candidate.education_level ?? "",
          educationInstitution: "",
          educationYear:        "",
          experiences: rawExps.map((e, i) => ({
            id:          String(i + 1),
            company:     typeof e.company === "string" ? e.company : "",
            role:        typeof e.title === "string" ? e.title : (typeof e.role === "string" ? e.role : ""),
            startDate:   typeof e.startDate === "string" ? e.startDate : "",
            endDate:     typeof e.endDate === "string" ? e.endDate : "",
            isCurrent:   Boolean(e.current ?? e.isCurrent ?? false),
            description: typeof e.description === "string" ? e.description : "",
          })),
          courses: dbCourses.map((c) => ({
            id:          c.id,
            title:       c.title,
            institution: c.institution ?? "",
            year:        c.end_date?.slice(0, 4) ?? "",
          })),
          skills:    "",
          languages: "",
        };
      }

      setData(loaded);
      setSavedSnapshot(JSON.stringify(loaded));
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    if (mode === "authenticated") loadFromDB();
  }, [mode, loadFromDB]);

  // ── Save to DB ────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (mode !== "authenticated" || saving || !candidateId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { error } = await supabase
        .from("candidates")
        .update({ curriculo_data: data })
        .eq("id", candidateId);

      if (error) throw error;

      setSavedSnapshot(JSON.stringify(data));
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 3000);
    } catch {
      setSaveError("Erro ao salvar. Verifique sua conexão e tente novamente.");
    } finally {
      setSaving(false);
    }
  }, [mode, saving, candidateId, data]);

  // ── Data helpers ──────────────────────────────────────────────────────────
  const update = (field: keyof CurriculoData, value: string) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const addExperience = () => {
    if (!expForm.company.trim() || !expForm.role.trim()) return;
    setData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, { ...expForm, id: Date.now().toString() }],
    }));
    setExpForm({ company: "", role: "", startDate: "", endDate: "", isCurrent: false, description: "" });
  };

  const removeExperience = (id: string) =>
    setData((prev) => ({ ...prev, experiences: prev.experiences.filter((e) => e.id !== id) }));

  const addCourse = () => {
    if (!courseForm.title.trim()) return;
    setData((prev) => ({
      ...prev,
      courses: [...prev.courses, { ...courseForm, id: Date.now().toString() }],
    }));
    setCourseForm({ title: "", institution: "", year: "" });
  };

  const removeCourse = (id: string) =>
    setData((prev) => ({ ...prev, courses: prev.courses.filter((c) => c.id !== id) }));

  // ── PDF generation ────────────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    setIsPrinting(true);
    const printWindow = window.open("", "_blank");
    if (!printWindow) { setIsPrinting(false); return; }

    const formatDate = (s: string) => {
      if (!s) return "";
      const d = new Date(s + (s.length === 7 ? "-01" : "") + "T12:00:00");
      return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    };

    printWindow.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Currículo — ${data.fullName || "VagasOeste"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; background: #fff; padding: 36px; font-size: 13px; line-height: 1.55; }
    .cv-name { font-size: 26px; font-weight: 700; color: #111827; margin-bottom: 6px; }
    .cv-contact { display: flex; flex-wrap: wrap; gap: 14px; color: #6b7280; font-size: 12px; margin-bottom: 22px; padding-bottom: 16px; border-bottom: 2.5px solid #059669; }
    .cv-section { margin-bottom: 18px; }
    .cv-section-title { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.09em; color: #059669; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #d1fae5; }
    .cv-text { color: #4b5563; font-size: 13px; line-height: 1.65; }
    .cv-exp { margin-bottom: 11px; }
    .cv-exp-title { font-weight: 600; color: #111827; font-size: 13px; }
    .cv-exp-sub { color: #6b7280; font-size: 12px; margin-bottom: 3px; }
    .cv-exp-desc { color: #4b5563; font-size: 12px; line-height: 1.55; margin-top: 2px; }
    .cv-course { color: #374151; font-size: 13px; margin-bottom: 4px; }
    @media print { body { padding: 18px; } @page { margin: 1cm; size: A4; } }
  </style>
</head>
<body>
  <div class="cv-name">${data.fullName || "Seu Nome"}</div>
  <div class="cv-contact">
    ${data.email    ? `<span>✉ ${data.email}</span>` : ""}
    ${data.phone    ? `<span>📱 ${data.phone}</span>` : ""}
    ${data.city     ? `<span>📍 ${data.neighborhood ? data.neighborhood + ", " : ""}${data.city}</span>` : ""}
    ${data.birthDate ? `<span>🗓 ${new Date(data.birthDate + "T12:00:00").toLocaleDateString("pt-BR")}</span>` : ""}
  </div>
  ${data.objective ? `<div class="cv-section"><div class="cv-section-title">Objetivo Profissional</div><p class="cv-text">${data.objective}</p></div>` : ""}
  ${data.educationLevel ? `<div class="cv-section"><div class="cv-section-title">Formação Acadêmica</div><div class="cv-exp-title">${data.educationLevel}</div>${data.educationInstitution ? `<div class="cv-exp-sub">${data.educationInstitution}${data.educationYear ? " · " + data.educationYear : ""}</div>` : ""}</div>` : ""}
  ${data.experiences.length > 0 ? `
  <div class="cv-section">
    <div class="cv-section-title">Experiências Profissionais</div>
    ${data.experiences.map((exp) => `
      <div class="cv-exp">
        <div class="cv-exp-title">${exp.role}</div>
        <div class="cv-exp-sub">${exp.company} · ${formatDate(exp.startDate)} – ${exp.isCurrent ? "Atual" : formatDate(exp.endDate)}</div>
        ${exp.description ? `<div class="cv-exp-desc">${exp.description}</div>` : ""}
      </div>
    `).join("")}
  </div>` : ""}
  ${data.courses.length > 0 ? `
  <div class="cv-section">
    <div class="cv-section-title">Cursos e Certificações</div>
    ${data.courses.map((c) => `<div class="cv-course">• ${c.title}${c.institution ? " — " + c.institution : ""}${c.year ? " (" + c.year + ")" : ""}</div>`).join("")}
  </div>` : ""}
  ${data.skills    ? `<div class="cv-section"><div class="cv-section-title">Habilidades</div><p class="cv-text">${data.skills}</p></div>` : ""}
  ${data.languages ? `<div class="cv-section"><div class="cv-section-title">Idiomas</div><p class="cv-text">${data.languages}</p></div>` : ""}
</body></html>`);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      setIsPrinting(false);
    }, 500);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────────────────────────────────────

  const currentIdx = STEPS.findIndex((s) => s.id === step);
  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 transition-colors";

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loadState === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Carregando seu currículo...</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (loadState === "error") {
    return (
      <div className="text-center py-14">
        <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-red-50 rounded-full">
          <i className="ri-error-warning-line text-red-500 text-xl"></i>
        </div>
        <p className="text-gray-700 font-semibold mb-1">Não foi possível carregar o currículo</p>
        <p className="text-gray-400 text-sm mb-4">Verifique sua conexão e tente novamente.</p>
        <button
          onClick={loadFromDB}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2 rounded-lg text-sm cursor-pointer transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Main render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>

      {/* ── Save error banner ────────────────────────────────────────────── */}
      {saveError && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <i className="ri-error-warning-line shrink-0"></i>
          <span className="flex-1">{saveError}</span>
          <button onClick={() => setSaveError(null)} className="shrink-0 text-red-400 hover:text-red-600 cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}

      {/* ── Step navigation + sync indicator ──────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        {/* Pill nav */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 flex-1 min-w-0">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                  step === s.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : i < currentIdx
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <i className={`${s.icon} text-xs`}></i>
                {s.label}
                {i < currentIdx && <i className="ri-check-line text-xs opacity-80"></i>}
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-3 h-0.5 shrink-0 ${i < currentIdx ? "bg-emerald-200" : "bg-gray-200"}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Sync status (authenticated) */}
        {mode === "authenticated" && (
          <div className="shrink-0">
            {savedTick ? (
              <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                <i className="ri-check-double-line"></i> Salvo!
              </span>
            ) : isDirty ? (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                <i className={saving ? "ri-loader-4-line animate-spin" : "ri-save-line"}></i>
                {saving ? "Salvando…" : "Salvar"}
              </button>
            ) : (
              <span className="flex items-center gap-1 text-gray-400 text-xs">
                <i className="ri-cloud-line"></i>
                <span className="hidden sm:inline">Sincronizado</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 1 — Dados Pessoais
      ═══════════════════════════════════════════════════════════════════════ */}
      {step === "dados" && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Dados Pessoais e Objetivo</h3>
          <div className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nome Completo *</label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="Seu nome completo"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="seu@email.com"
                  readOnly={mode === "authenticated"}
                  className={`${inputCls} ${mode === "authenticated" ? "bg-gray-50 cursor-not-allowed text-gray-400" : ""}`}
                />
                {mode === "authenticated" && (
                  <p className="text-xs text-gray-400 mt-0.5">Gerenciado pelo login</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">WhatsApp</label>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="(93) 99999-0000"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Data de Nascimento</label>
                <input
                  type="date"
                  value={data.birthDate}
                  onChange={(e) => update("birthDate", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Cidade</label>
                <input
                  type="text"
                  value={data.city}
                  onChange={(e) => update("city", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Bairro</label>
                <input
                  type="text"
                  value={data.neighborhood}
                  onChange={(e) => update("neighborhood", e.target.value)}
                  placeholder="Ex: Centro"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Escolaridade</label>
              <select
                value={data.educationLevel}
                onChange={(e) => update("educationLevel", e.target.value)}
                className={inputCls}
              >
                <option value="">Selecione</option>
                {EDUCATION_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Instituição de Ensino</label>
                <input
                  type="text"
                  value={data.educationInstitution}
                  onChange={(e) => update("educationInstitution", e.target.value)}
                  placeholder="Nome da escola ou faculdade"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Ano de Conclusão</label>
                <input
                  type="text"
                  value={data.educationYear}
                  onChange={(e) => update("educationYear", e.target.value)}
                  placeholder="Ex: 2023"
                  maxLength={4}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Objetivo Profissional</label>
              <textarea
                value={data.objective}
                onChange={(e) => update("objective", e.target.value)}
                placeholder="Descreva seu objetivo em 2-3 frases. Ex: Busco oportunidade na área administrativa para aplicar meus conhecimentos em organização e atendimento ao cliente..."
                rows={3}
                maxLength={500}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 resize-none transition-colors"
              />
              <p className="text-gray-400 text-xs mt-1 text-right">{data.objective.length}/500</p>
            </div>
          </div>

          <button
            onClick={() => setStep("experiencias")}
            className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer transition-colors"
          >
            Próximo: Experiências →
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 2 — Experiências Profissionais
      ═══════════════════════════════════════════════════════════════════════ */}
      {step === "experiencias" && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Experiências Profissionais</h3>

          {/* Form to add */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Adicionar experiência
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Empresa *</label>
                  <input
                    type="text"
                    value={expForm.company}
                    onChange={(e) => setExpForm((p) => ({ ...p, company: e.target.value }))}
                    placeholder="Nome da empresa"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Cargo / Função *</label>
                  <input
                    type="text"
                    value={expForm.role}
                    onChange={(e) => setExpForm((p) => ({ ...p, role: e.target.value }))}
                    placeholder="Ex: Auxiliar Administrativo"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Início</label>
                  <input
                    type="month"
                    value={expForm.startDate}
                    onChange={(e) => setExpForm((p) => ({ ...p, startDate: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Fim</label>
                  <input
                    type="month"
                    value={expForm.endDate}
                    onChange={(e) => setExpForm((p) => ({ ...p, endDate: e.target.value }))}
                    disabled={expForm.isCurrent}
                    className={`${inputCls} ${expForm.isCurrent ? "opacity-40 pointer-events-none" : ""}`}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={expForm.isCurrent}
                  onChange={(e) =>
                    setExpForm((p) => ({
                      ...p,
                      isCurrent: e.target.checked,
                      endDate: e.target.checked ? "" : p.endDate,
                    }))
                  }
                  className="rounded accent-emerald-600"
                />
                <span className="text-xs text-gray-600">Emprego atual</span>
              </label>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Descrição das atividades</label>
                <textarea
                  value={expForm.description}
                  onChange={(e) => setExpForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Descreva as principais atividades realizadas..."
                  rows={2}
                  maxLength={500}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 resize-none transition-colors"
                />
              </div>

              <button
                onClick={addExperience}
                disabled={!expForm.company.trim() || !expForm.role.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <i className="ri-add-line text-sm"></i> Adicionar Experiência
              </button>
            </div>
          </div>

          {/* List */}
          {data.experiences.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              <i className="ri-briefcase-line text-2xl block mb-1 opacity-40"></i>
              Nenhuma experiência adicionada ainda.
            </div>
          ) : (
            <div className="space-y-2 mb-2">
              {data.experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="border border-gray-100 rounded-lg p-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{exp.role}</p>
                    <p className="text-gray-500 text-xs">
                      {exp.company} · {exp.startDate} – {exp.isCurrent ? "Atual" : exp.endDate}
                    </p>
                    {exp.description && (
                      <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{exp.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 cursor-pointer shrink-0 transition-colors"
                    title="Remover"
                  >
                    <i className="ri-delete-bin-line text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep("dados")} className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition-colors">
              ← Voltar
            </button>
            <button onClick={() => setStep("cursos")} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer transition-colors">
              Próximo →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 3 — Cursos e Certificações
      ═══════════════════════════════════════════════════════════════════════ */}
      {step === "cursos" && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Cursos e Certificações</h3>

          {/* Form to add */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Adicionar curso
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Título do Curso *</label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Ex: Excel Avançado, NR-10, Atendimento ao Cliente..."
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Instituição</label>
                  <input
                    type="text"
                    value={courseForm.institution}
                    onChange={(e) => setCourseForm((p) => ({ ...p, institution: e.target.value }))}
                    placeholder="SENAC, Udemy, SEBRAE..."
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Ano de Conclusão</label>
                  <input
                    type="text"
                    value={courseForm.year}
                    onChange={(e) => setCourseForm((p) => ({ ...p, year: e.target.value }))}
                    placeholder="2024"
                    maxLength={4}
                    className={inputCls}
                  />
                </div>
              </div>

              <button
                onClick={addCourse}
                disabled={!courseForm.title.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <i className="ri-add-line text-sm"></i> Adicionar Curso
              </button>
            </div>
          </div>

          {/* List */}
          {data.courses.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              <i className="ri-book-open-line text-2xl block mb-1 opacity-40"></i>
              Nenhum curso adicionado ainda.
            </div>
          ) : (
            <div className="space-y-2 mb-2">
              {data.courses.map((c) => (
                <div
                  key={c.id}
                  className="border border-gray-100 rounded-lg p-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{c.title}</p>
                    <p className="text-gray-500 text-xs">
                      {c.institution}{c.year ? ` · ${c.year}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => removeCourse(c.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 cursor-pointer shrink-0 transition-colors"
                    title="Remover"
                  >
                    <i className="ri-delete-bin-line text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep("experiencias")} className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition-colors">
              ← Voltar
            </button>
            <button onClick={() => setStep("habilidades")} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer transition-colors">
              Próximo →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 4 — Habilidades e Idiomas
      ═══════════════════════════════════════════════════════════════════════ */}
      {step === "habilidades" && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Habilidades e Idiomas</h3>
          <div className="space-y-5">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Habilidades</label>
              <p className="text-xs text-gray-400 mb-2">
                Liste suas principais habilidades separadas por vírgula ou em frases curtas.
              </p>
              <textarea
                value={data.skills}
                onChange={(e) => update("skills", e.target.value)}
                placeholder="Ex: Pacote Office, Atendimento ao cliente, Trabalho em equipe, Organização, Comunicação..."
                rows={4}
                maxLength={600}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 resize-none transition-colors"
              />
              <p className="text-gray-400 text-xs mt-1 text-right">{data.skills.length}/600</p>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Idiomas</label>
              <textarea
                value={data.languages}
                onChange={(e) => update("languages", e.target.value)}
                placeholder="Ex: Português (nativo), Inglês (básico), Espanhol (intermediário)..."
                rows={2}
                maxLength={300}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 resize-none transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={() => setStep("cursos")} className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition-colors">
              ← Voltar
            </button>
            <button onClick={() => setStep("preview")} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer transition-colors">
              Ver Prévia →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STEP 5 — Prévia do Currículo
      ═══════════════════════════════════════════════════════════════════════ */}
      {step === "preview" && (
        <div>
          {/* ── CV Preview ─────────────────────────────────────────────────── */}
          <div ref={printRef} className="bg-white rounded-xl border border-gray-100 p-6 mb-4 print:shadow-none">
            {/* Header */}
            <div className="border-b-2 border-emerald-600 pb-4 mb-5">
              <h2 className="text-2xl font-bold text-gray-900">
                {data.fullName || <span className="text-gray-300 italic">Seu Nome</span>}
              </h2>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                {data.email && (
                  <span className="flex items-center gap-1">
                    <i className="ri-mail-line text-emerald-500 text-xs"></i>{data.email}
                  </span>
                )}
                {data.phone && (
                  <span className="flex items-center gap-1">
                    <i className="ri-smartphone-line text-emerald-500 text-xs"></i>{data.phone}
                  </span>
                )}
                {data.city && (
                  <span className="flex items-center gap-1">
                    <i className="ri-map-pin-line text-emerald-500 text-xs"></i>
                    {data.neighborhood ? `${data.neighborhood}, ` : ""}{data.city}
                  </span>
                )}
                {data.birthDate && (
                  <span className="flex items-center gap-1">
                    <i className="ri-calendar-line text-emerald-500 text-xs"></i>
                    {new Date(data.birthDate + "T12:00:00").toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            </div>

            {/* Objetivo */}
            {data.objective && (
              <div className="mb-5">
                <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-700 mb-2 pb-1 border-b border-emerald-100">
                  Objetivo Profissional
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{data.objective}</p>
              </div>
            )}

            {/* Formação */}
            {data.educationLevel && (
              <div className="mb-5">
                <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-700 mb-2 pb-1 border-b border-emerald-100">
                  Formação Acadêmica
                </h3>
                <p className="font-semibold text-gray-900 text-sm">{data.educationLevel}</p>
                {data.educationInstitution && (
                  <p className="text-gray-500 text-xs mt-0.5">
                    {data.educationInstitution}
                    {data.educationYear ? ` · ${data.educationYear}` : ""}
                  </p>
                )}
              </div>
            )}

            {/* Experiências */}
            {data.experiences.length > 0 && (
              <div className="mb-5">
                <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-700 mb-2 pb-1 border-b border-emerald-100">
                  Experiências Profissionais
                </h3>
                <div className="space-y-3">
                  {data.experiences.map((exp) => (
                    <div key={exp.id}>
                      <p className="font-semibold text-gray-900 text-sm">{exp.role}</p>
                      <p className="text-gray-500 text-xs">
                        {exp.company} · {exp.startDate} – {exp.isCurrent ? "Atual" : exp.endDate}
                      </p>
                      {exp.description && (
                        <p className="text-gray-600 text-xs mt-1 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cursos */}
            {data.courses.length > 0 && (
              <div className="mb-5">
                <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-700 mb-2 pb-1 border-b border-emerald-100">
                  Cursos e Certificações
                </h3>
                <div className="space-y-1">
                  {data.courses.map((c) => (
                    <p key={c.id} className="text-gray-700 text-sm">
                      <span className="text-emerald-500 mr-1">•</span>
                      {c.title}
                      {c.institution ? ` — ${c.institution}` : ""}
                      {c.year ? ` (${c.year})` : ""}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Habilidades */}
            {data.skills && (
              <div className="mb-5">
                <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-700 mb-2 pb-1 border-b border-emerald-100">
                  Habilidades
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{data.skills}</p>
              </div>
            )}

            {/* Idiomas */}
            {data.languages && (
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-700 mb-2 pb-1 border-b border-emerald-100">
                  Idiomas
                </h3>
                <p className="text-gray-600 text-sm">{data.languages}</p>
              </div>
            )}
          </div>

          {/* ── Actions ──────────────────────────────────────────────────────── */}
          <div className="space-y-3">

            {/* Save to profile (authenticated) */}
            {mode === "authenticated" && (
              <div
                className={`rounded-xl border p-4 flex items-center gap-4 transition-colors ${
                  isDirty
                    ? "bg-amber-50 border-amber-200"
                    : "bg-emerald-50 border-emerald-100"
                }`}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0 ${
                    isDirty ? "bg-amber-100" : "bg-emerald-100"
                  }`}
                >
                  <i
                    className={`text-lg ${
                      isDirty ? "ri-save-line text-amber-600" : "ri-cloud-check-line text-emerald-600"
                    }`}
                  ></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">
                    {isDirty ? "Alterações não salvas" : "Currículo salvo no perfil"}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {isDirty
                      ? "Salve para que seu currículo reflita nas candidaturas."
                      : "Currículo sincronizado e disponível em suas candidaturas."}
                  </p>
                </div>
                {isDirty && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors disabled:opacity-60 flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <i className={saving ? "ri-loader-4-line animate-spin" : "ri-save-3-line"}></i>
                    {saving ? "Salvando…" : "Salvar Currículo"}
                  </button>
                )}
              </div>
            )}

            {/* PDF Download */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 flex items-center justify-center bg-white border border-gray-200 rounded-xl shrink-0">
                  <i className="ri-file-pdf-line text-red-500 text-xl"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm mb-0.5">Baixar como PDF</p>
                  <p className="text-gray-500 text-xs mb-3">
                    Gere o arquivo PDF profissional pronto para enviar a qualquer empresa.
                  </p>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isPrinting}
                    className="w-full bg-gray-800 hover:bg-gray-900 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="ri-download-2-line"></i>
                    {isPrinting ? "Gerando PDF…" : "Baixar PDF Grátis"}
                  </button>
                  <p className="text-gray-400 text-xs mt-2 text-center">
                    Uma janela de impressão será aberta — selecione &ldquo;Salvar como PDF&rdquo;.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep("habilidades")}
            className="mt-3 w-full border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition-colors"
          >
            ← Editar Currículo
          </button>
        </div>
      )}
    </div>
  );
}
