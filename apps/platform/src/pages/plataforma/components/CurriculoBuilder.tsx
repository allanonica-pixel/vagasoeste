import { useState, useRef } from "react";

interface CurriculoData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  neighborhood: string;
  birthDate: string;
  objective: string;
  educationLevel: string;
  educationInstitution: string;
  educationYear: string;
  experiences: ExperienceEntry[];
  courses: CourseEntry[];
  skills: string;
  languages: string;
}

interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

interface CourseEntry {
  id: string;
  title: string;
  institution: string;
  year: string;
}

const INITIAL_DATA: CurriculoData = {
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

export default function CurriculoBuilder() {
  const [step, setStep] = useState<BuilderStep>("dados");
  const [data, setData] = useState<CurriculoData>(INITIAL_DATA);
  const [expForm, setExpForm] = useState<Omit<ExperienceEntry, "id">>({
    company: "", role: "", startDate: "", endDate: "", isCurrent: false, description: "",
  });
  const [courseForm, setCourseForm] = useState<Omit<CourseEntry, "id">>({
    title: "", institution: "", year: "",
  });
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const update = (field: keyof CurriculoData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const addExperience = () => {
    if (!expForm.company || !expForm.role) return;
    setData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, { ...expForm, id: Date.now().toString() }],
    }));
    setExpForm({ company: "", role: "", startDate: "", endDate: "", isCurrent: false, description: "" });
  };

  const removeExperience = (id: string) => {
    setData((prev) => ({ ...prev, experiences: prev.experiences.filter((e) => e.id !== id) }));
  };

  const addCourse = () => {
    if (!courseForm.title) return;
    setData((prev) => ({
      ...prev,
      courses: [...prev.courses, { ...courseForm, id: Date.now().toString() }],
    }));
    setCourseForm({ title: "", institution: "", year: "" });
  };

  const removeCourse = (id: string) => {
    setData((prev) => ({ ...prev, courses: prev.courses.filter((c) => c.id !== id) }));
  };

  const steps: { id: BuilderStep; label: string; icon: string }[] = [
    { id: "dados", label: "Dados", icon: "ri-user-line" },
    { id: "experiencias", label: "Experiências", icon: "ri-briefcase-line" },
    { id: "cursos", label: "Cursos", icon: "ri-book-open-line" },
    { id: "habilidades", label: "Habilidades", icon: "ri-star-line" },
    { id: "preview", label: "Prévia", icon: "ri-eye-line" },
  ];

  const currentIdx = steps.findIndex((s) => s.id === step);

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400";

  const handleDownloadPDF = () => {
    setIsPrinting(true);

    const printContent = printRef.current?.innerHTML || "";
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setIsPrinting(false);
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Currículo — ${data.fullName || "VagasOeste"}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; background: #fff; padding: 32px; font-size: 13px; line-height: 1.5; }
          .cv-name { font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 4px; }
          .cv-contact { display: flex; flex-wrap: wrap; gap: 12px; color: #6b7280; font-size: 12px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #059669; }
          .cv-contact span { display: flex; align-items: center; gap: 4px; }
          .cv-section { margin-bottom: 16px; }
          .cv-section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #059669; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #d1fae5; }
          .cv-text { color: #4b5563; font-size: 13px; line-height: 1.6; }
          .cv-exp { margin-bottom: 10px; }
          .cv-exp-title { font-weight: 600; color: #111827; font-size: 13px; }
          .cv-exp-sub { color: #6b7280; font-size: 12px; margin-bottom: 3px; }
          .cv-exp-desc { color: #4b5563; font-size: 12px; line-height: 1.5; }
          .cv-course { color: #374151; font-size: 13px; margin-bottom: 4px; }
          @media print {
            body { padding: 20px; }
            @page { margin: 1cm; size: A4; }
          }
        </style>
      </head>
      <body>
        <div class="cv-name">${data.fullName || "Seu Nome"}</div>
        <div class="cv-contact">
          ${data.email ? `<span>✉ ${data.email}</span>` : ""}
          ${data.phone ? `<span>📱 ${data.phone}</span>` : ""}
          ${data.city ? `<span>📍 ${data.neighborhood ? data.neighborhood + ", " : ""}${data.city}</span>` : ""}
          ${data.birthDate ? `<span>🗓 ${new Date(data.birthDate).toLocaleDateString("pt-BR")}</span>` : ""}
        </div>
        ${data.objective ? `
        <div class="cv-section">
          <div class="cv-section-title">Objetivo Profissional</div>
          <p class="cv-text">${data.objective}</p>
        </div>` : ""}
        ${data.educationLevel ? `
        <div class="cv-section">
          <div class="cv-section-title">Formação Acadêmica</div>
          <div class="cv-exp-title">${data.educationLevel}</div>
          ${data.educationInstitution ? `<div class="cv-exp-sub">${data.educationInstitution}${data.educationYear ? " · " + data.educationYear : ""}</div>` : ""}
        </div>` : ""}
        ${data.experiences.length > 0 ? `
        <div class="cv-section">
          <div class="cv-section-title">Experiências Profissionais</div>
          ${data.experiences.map((exp) => `
            <div class="cv-exp">
              <div class="cv-exp-title">${exp.role}</div>
              <div class="cv-exp-sub">${exp.company} · ${exp.startDate} – ${exp.isCurrent ? "Atual" : exp.endDate}</div>
              ${exp.description ? `<div class="cv-exp-desc">${exp.description}</div>` : ""}
            </div>
          `).join("")}
        </div>` : ""}
        ${data.courses.length > 0 ? `
        <div class="cv-section">
          <div class="cv-section-title">Cursos e Certificações</div>
          ${data.courses.map((c) => `
            <div class="cv-course">• ${c.title}${c.institution ? " — " + c.institution : ""}${c.year ? " (" + c.year + ")" : ""}</div>
          `).join("")}
        </div>` : ""}
        ${data.skills ? `
        <div class="cv-section">
          <div class="cv-section-title">Habilidades</div>
          <p class="cv-text">${data.skills}</p>
        </div>` : ""}
        ${data.languages ? `
        <div class="cv-section">
          <div class="cv-section-title">Idiomas</div>
          <p class="cv-text">${data.languages}</p>
        </div>` : ""}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      setIsPrinting(false);
    }, 500);
  };

  return (
    <div>
      {/* Step Nav */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                step === s.id
                  ? "bg-emerald-600 text-white"
                  : i < currentIdx
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${s.icon} text-xs`}></i>
              </div>
              {s.label}
              {i < currentIdx && <i className="ri-check-line text-xs"></i>}
            </button>
            {i < steps.length - 1 && <div className="w-4 h-0.5 bg-gray-200 shrink-0"></div>}
          </div>
        ))}
      </div>

      {/* Dados Pessoais */}
      {step === "dados" && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Dados Pessoais e Objetivo</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nome Completo *</label>
                <input type="text" value={data.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Seu nome completo" className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="seu@email.com" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">WhatsApp</label>
                <input type="tel" value={data.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(93) 99999-0000" className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Data de Nascimento</label>
                <input type="date" value={data.birthDate} onChange={(e) => update("birthDate", e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Cidade</label>
                <input type="text" value={data.city} onChange={(e) => update("city", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Bairro</label>
                <input type="text" value={data.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} placeholder="Ex: Centro" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Escolaridade</label>
              <select value={data.educationLevel} onChange={(e) => update("educationLevel", e.target.value)} className={inputCls}>
                <option value="">Selecione</option>
                {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Instituição de Ensino</label>
                <input type="text" value={data.educationInstitution} onChange={(e) => update("educationInstitution", e.target.value)} placeholder="Nome da escola/faculdade" className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Ano de Conclusão</label>
                <input type="text" value={data.educationYear} onChange={(e) => update("educationYear", e.target.value)} placeholder="Ex: 2023" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Objetivo Profissional</label>
              <textarea
                value={data.objective}
                onChange={(e) => update("objective", e.target.value)}
                placeholder="Descreva seu objetivo profissional em 2-3 frases..."
                rows={3}
                maxLength={500}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 resize-none"
              />
              <p className="text-gray-400 text-xs mt-1 text-right">{data.objective.length}/500</p>
            </div>
          </div>
          <button onClick={() => setStep("experiencias")} className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer transition-colors">
            Próximo: Experiências
          </button>
        </div>
      )}

      {/* Experiências */}
      {step === "experiencias" && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Experiências Profissionais</h3>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Empresa *</label>
                  <input type="text" value={expForm.company} onChange={(e) => setExpForm((p) => ({ ...p, company: e.target.value }))} placeholder="Nome da empresa" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Cargo/Função *</label>
                  <input type="text" value={expForm.role} onChange={(e) => setExpForm((p) => ({ ...p, role: e.target.value }))} placeholder="Ex: Auxiliar Administrativo" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Início</label>
                  <input type="month" value={expForm.startDate} onChange={(e) => setExpForm((p) => ({ ...p, startDate: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Fim</label>
                  <input type="month" value={expForm.endDate} onChange={(e) => setExpForm((p) => ({ ...p, endDate: e.target.value }))} disabled={expForm.isCurrent} className={`${inputCls} ${expForm.isCurrent ? "opacity-50" : ""}`} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={expForm.isCurrent} onChange={(e) => setExpForm((p) => ({ ...p, isCurrent: e.target.checked }))} className="rounded" />
                <span className="text-xs text-gray-600">Emprego atual</span>
              </label>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Descrição das atividades</label>
                <textarea
                  value={expForm.description}
                  onChange={(e) => setExpForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Descreva suas principais atividades..."
                  rows={2}
                  maxLength={500}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 resize-none"
                />
              </div>
              <button onClick={addExperience} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-center gap-2">
                <i className="ri-add-line text-sm"></i> Adicionar Experiência
              </button>
            </div>
          </div>
          {data.experiences.map((exp) => (
            <div key={exp.id} className="border border-gray-100 rounded-lg p-3 mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{exp.role}</p>
                <p className="text-gray-500 text-xs">{exp.company} · {exp.startDate} – {exp.isCurrent ? "Atual" : exp.endDate}</p>
              </div>
              <button onClick={() => removeExperience(exp.id)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 cursor-pointer shrink-0">
                <i className="ri-delete-bin-line text-xs"></i>
              </button>
            </div>
          ))}
          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep("dados")} className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg text-sm cursor-pointer hover:bg-gray-50">Voltar</button>
            <button onClick={() => setStep("cursos")} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer">Próximo</button>
          </div>
        </div>
      )}

      {/* Cursos */}
      {step === "cursos" && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Cursos e Certificações</h3>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Título do Curso *</label>
                <input type="text" value={courseForm.title} onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))} placeholder="Ex: Excel Avançado" className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Instituição</label>
                  <input type="text" value={courseForm.institution} onChange={(e) => setCourseForm((p) => ({ ...p, institution: e.target.value }))} placeholder="SENAC, Udemy..." className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Ano</label>
                  <input type="text" value={courseForm.year} onChange={(e) => setCourseForm((p) => ({ ...p, year: e.target.value }))} placeholder="2024" className={inputCls} />
                </div>
              </div>
              <button onClick={addCourse} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-center gap-2">
                <i className="ri-add-line text-sm"></i> Adicionar Curso
              </button>
            </div>
          </div>
          {data.courses.map((c) => (
            <div key={c.id} className="border border-gray-100 rounded-lg p-3 mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{c.title}</p>
                <p className="text-gray-500 text-xs">{c.institution} {c.year && `· ${c.year}`}</p>
              </div>
              <button onClick={() => removeCourse(c.id)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 cursor-pointer shrink-0">
                <i className="ri-delete-bin-line text-xs"></i>
              </button>
            </div>
          ))}
          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep("experiencias")} className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg text-sm cursor-pointer hover:bg-gray-50">Voltar</button>
            <button onClick={() => setStep("habilidades")} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer">Próximo</button>
          </div>
        </div>
      )}

      {/* Habilidades */}
      {step === "habilidades" && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Habilidades e Idiomas</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Habilidades</label>
              <textarea
                value={data.skills}
                onChange={(e) => update("skills", e.target.value)}
                placeholder="Ex: Pacote Office, Atendimento ao cliente, Trabalho em equipe, Organização..."
                rows={4}
                maxLength={500}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 resize-none"
              />
              <p className="text-gray-400 text-xs mt-1 text-right">{data.skills.length}/500</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Idiomas</label>
              <textarea
                value={data.languages}
                onChange={(e) => update("languages", e.target.value)}
                placeholder="Ex: Português (nativo), Inglês (básico), Espanhol (intermediário)..."
                rows={2}
                maxLength={500}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setStep("cursos")} className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg text-sm cursor-pointer hover:bg-gray-50">Voltar</button>
            <button onClick={() => setStep("preview")} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer">Ver Prévia</button>
          </div>
        </div>
      )}

      {/* Preview */}
      {step === "preview" && (
        <div>
          <div ref={printRef} className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
            <div className="border-b-2 border-emerald-600 pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{data.fullName || "Seu Nome"}</h2>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                {data.email && <span><i className="ri-mail-line mr-1 text-emerald-500"></i>{data.email}</span>}
                {data.phone && <span><i className="ri-phone-line mr-1 text-emerald-500"></i>{data.phone}</span>}
                {data.city && <span><i className="ri-map-pin-line mr-1 text-emerald-500"></i>{data.neighborhood ? `${data.neighborhood}, ` : ""}{data.city}</span>}
              </div>
            </div>

            {data.objective && (
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-2 text-emerald-700">Objetivo</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{data.objective}</p>
              </div>
            )}

            {data.educationLevel && (
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-2 text-emerald-700">Formação</h3>
                <p className="text-gray-800 text-sm font-semibold">{data.educationLevel}</p>
                {data.educationInstitution && <p className="text-gray-500 text-xs">{data.educationInstitution} {data.educationYear && `· ${data.educationYear}`}</p>}
              </div>
            )}

            {data.experiences.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-2 text-emerald-700">Experiências</h3>
                <div className="space-y-3">
                  {data.experiences.map((exp) => (
                    <div key={exp.id}>
                      <p className="font-semibold text-gray-900 text-sm">{exp.role}</p>
                      <p className="text-gray-500 text-xs">{exp.company} · {exp.startDate} – {exp.isCurrent ? "Atual" : exp.endDate}</p>
                      {exp.description && <p className="text-gray-600 text-xs mt-1 leading-relaxed">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.courses.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-2 text-emerald-700">Cursos</h3>
                <div className="space-y-1">
                  {data.courses.map((c) => (
                    <p key={c.id} className="text-gray-700 text-sm">• {c.title} {c.institution && `— ${c.institution}`} {c.year && `(${c.year})`}</p>
                  ))}
                </div>
              </div>
            )}

            {data.skills && (
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-2 text-emerald-700">Habilidades</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{data.skills}</p>
              </div>
            )}

            {data.languages && (
              <div>
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-2 text-emerald-700">Idiomas</h3>
                <p className="text-gray-600 text-sm">{data.languages}</p>
              </div>
            )}
          </div>

          {/* Download CTA */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-emerald-100 rounded-full">
              <i className="ri-download-line text-emerald-600 text-xl"></i>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Seu currículo está pronto!</h3>
            <p className="text-gray-500 text-sm mb-4">Clique abaixo para gerar e baixar o PDF do seu currículo profissional.</p>
            <button
              onClick={handleDownloadPDF}
              disabled={isPrinting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-file-pdf-line text-base"></i>
              </div>
              {isPrinting ? "Gerando PDF..." : "Baixar PDF Grátis"}
            </button>
            <p className="text-gray-400 text-xs mt-3">Uma janela de impressão será aberta. Selecione &quot;Salvar como PDF&quot; para baixar.</p>
          </div>

          <button onClick={() => setStep("habilidades")} className="mt-3 w-full border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
            Editar Currículo
          </button>
        </div>
      )}
    </div>
  );
}
