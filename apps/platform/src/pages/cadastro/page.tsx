import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import { formatBrazilPhone, isValidBrazilPhone } from "@/hooks/useBrazilPhone";

type Step = 1 | 2 | 3 | 4;

interface CourseEntry {
  id: string;
  title: string;
  institution: string;
  startDate: string;
  endDate: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  isPCD: string;
  neighborhood: string;
  city: string;
  educationLevel: string;
  availability: string;
  salaryExpectation: string;
  experiences: string;
  password: string;
  confirmPassword: string;
}

const INITIAL_FORM: FormData = {
  fullName: "",
  email: "",
  phone: "",
  birthDate: "",
  gender: "",
  isPCD: "nao",
  neighborhood: "",
  city: "Santarém",
  educationLevel: "",
  availability: "",
  salaryExpectation: "",
  experiences: "",
  password: "",
  confirmPassword: "",
};

const EDUCATION_LEVELS = [
  "Ensino Fundamental",
  "Ensino Médio",
  "Técnico",
  "Superior Incompleto",
  "Superior Completo",
  "Pós-graduação",
];

export default function CadastroPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [courses, setCourses] = useState<CourseEntry[]>([]);
  const [courseForm, setCourseForm] = useState<Omit<CourseEntry, "id">>({
    title: "",
    institution: "",
    startDate: "",
    endDate: "",
  });
  const [courseError, setCourseError] = useState("");
  const navigate = useNavigate();

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const updatePhone = (value: string) => {
    update("phone", formatBrazilPhone(value));
  };

  const validateStep1 = () => {
    const e: Partial<FormData> = {};
    if (!form.fullName.trim()) e.fullName = "Nome obrigatório";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Email inválido";
    if (!form.phone.trim()) {
      e.phone = "WhatsApp obrigatório";
    } else if (!isValidBrazilPhone(form.phone)) {
      e.phone = "Número inválido. Use o formato (XX) XXXXX-XXXX";
    }
    if (!form.birthDate) e.birthDate = "Data de nascimento obrigatória";
    if (!form.gender) e.gender = "Selecione o sexo";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Partial<FormData> = {};
    if (!form.neighborhood.trim()) e.neighborhood = "Bairro obrigatório";
    if (!form.educationLevel) e.educationLevel = "Escolaridade obrigatória";
    if (!form.availability) e.availability = "Disponibilidade obrigatória";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep4 = () => {
    const e: Partial<FormData> = {};
    if (!form.password || form.password.length < 6) e.password = "Senha deve ter ao menos 6 caracteres";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Senhas não conferem";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3) setStep(4);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep4()) return;
    navigate("/verificar-email");
  };

  const addCourse = () => {
    if (!courseForm.title.trim()) { setCourseError("Título do curso obrigatório"); return; }
    if (!courseForm.startDate) { setCourseError("Data de início obrigatória"); return; }
    if (!courseForm.endDate) { setCourseError("Data de conclusão obrigatória"); return; }
    setCourses((prev) => [...prev, { ...courseForm, id: Date.now().toString() }]);
    setCourseForm({ title: "", institution: "", startDate: "", endDate: "" });
    setCourseError("");
  };

  const removeCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const inputClass = (field: keyof FormData) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors ${
      errors[field] ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-emerald-400"
    }`;

  const stepLabels = ["Dados Pessoais", "Perfil Profissional", "Cursos", "Senha"];

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

        {/* Progress */}
        <div className="flex items-center gap-1 mb-8">
          {([1, 2, 3, 4] as Step[]).map((s) => (
            <div key={s} className="flex-1 flex items-center gap-1">
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step > s ? "bg-emerald-600 text-white" : step === s ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {step > s ? <i className="ri-check-line text-xs"></i> : s}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">{stepLabels[s - 1]}</span>
              </div>
              {s < 4 && <div className={`flex-1 h-1 rounded-full transition-colors ${step > s ? "bg-emerald-600" : "bg-gray-200"}`}></div>}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Dados Pessoais */}
            {step === 1 && (
              <div>
                <h2 className="font-bold text-gray-900 text-lg mb-1">Dados Pessoais</h2>
                <p className="text-gray-500 text-sm mb-6">Suas informações pessoais são protegidas e não serão exibidas para empresas.</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nome Completo *</label>
                    <input type="text" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Seu nome completo" className={inputClass("fullName")} />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email *</label>
                      <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="seu@email.com" className={inputClass("email")} />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">WhatsApp *</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                          <i className="ri-whatsapp-line text-gray-400 text-xs"></i>
                        </div>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => updatePhone(e.target.value)}
                          placeholder="(93) 99999-0000"
                          maxLength={15}
                          className={`w-full border rounded-lg pl-8 pr-3 py-2.5 text-sm text-gray-800 outline-none transition-colors ${
                            errors.phone ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-emerald-400"
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Data de Nascimento *</label>
                      <input type="date" value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)} className={inputClass("birthDate")} />
                      {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Sexo *</label>
                      <select value={form.gender} onChange={(e) => update("gender", e.target.value)} className={inputClass("gender")}>
                        <option value="">Selecione</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                        <option value="NB">Não-binário</option>
                        <option value="NI">Prefiro não informar</option>
                      </select>
                      {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Pessoa com Deficiência (PCD)?</label>
                    <div className="flex gap-3">
                      {[{ value: "nao", label: "Não" }, { value: "sim", label: "Sim" }].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => update("isPCD", opt.value)}
                          className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium cursor-pointer transition-colors ${
                            form.isPCD === opt.value ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:border-emerald-300"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-emerald-50 rounded-lg flex items-start gap-3">
                  <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                    <i className="ri-shield-check-line text-emerald-600 text-sm"></i>
                  </div>
                  <p className="text-emerald-700 text-xs leading-relaxed">
                    <strong>Seus dados estão protegidos.</strong> Nome, sexo, idade e telefone nunca são exibidos para empresas. Apenas a equipe VagasOeste tem acesso a essas informações.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Perfil Profissional */}
            {step === 2 && (
              <div>
                <h2 className="font-bold text-gray-900 text-lg mb-1">Perfil Profissional</h2>
                <p className="text-gray-500 text-sm mb-6">Essas informações serão apresentadas às empresas de forma anônima.</p>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Bairro onde mora *</label>
                      <input type="text" value={form.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} placeholder="Ex: Centro" className={inputClass("neighborhood")} />
                      {errors.neighborhood && <p className="text-red-500 text-xs mt-1">{errors.neighborhood}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Cidade</label>
                      <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass("city")} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Escolaridade Atual *</label>
                    <select value={form.educationLevel} onChange={(e) => update("educationLevel", e.target.value)} className={inputClass("educationLevel")}>
                      <option value="">Selecione sua escolaridade</option>
                      {EDUCATION_LEVELS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                    {errors.educationLevel && <p className="text-red-500 text-xs mt-1">{errors.educationLevel}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Disponibilidade *</label>
                    <select value={form.availability} onChange={(e) => update("availability", e.target.value)} className={inputClass("availability")}>
                      <option value="">Selecione</option>
                      <option value="Integral">Integral</option>
                      <option value="Manhã">Manhã</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noite">Noite</option>
                      <option value="Fins de semana">Fins de semana</option>
                    </select>
                    {errors.availability && <p className="text-red-500 text-xs mt-1">{errors.availability}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Pretensão Salarial</label>
                    <input type="text" value={form.salaryExpectation} onChange={(e) => update("salaryExpectation", e.target.value)} placeholder="Ex: R$ 2.000 – R$ 2.500" className={inputClass("salaryExpectation")} />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Experiências Profissionais</label>
                    <textarea
                      value={form.experiences}
                      onChange={(e) => update("experiences", e.target.value)}
                      placeholder="Descreva suas experiências anteriores, cargos e funções..."
                      rows={4}
                      maxLength={500}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 resize-none"
                    />
                    <p className="text-gray-400 text-xs mt-1 text-right">{form.experiences.length}/500</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Cursos e Certificações */}
            {step === 3 && (
              <div>
                <h2 className="font-bold text-gray-900 text-lg mb-1">Cursos e Certificações</h2>
                <p className="text-gray-500 text-sm mb-6">Adicione os cursos que você realizou. Isso aumenta suas chances de ser selecionado!</p>

                {/* Add Course Form */}
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <p className="text-xs font-semibold text-gray-600 mb-3">Adicionar Curso</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Título do Curso *</label>
                      <input
                        type="text"
                        value={courseForm.title}
                        onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
                        placeholder="Ex: Excel Avançado, Atendimento ao Cliente..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Instituição</label>
                      <input
                        type="text"
                        value={courseForm.institution}
                        onChange={(e) => setCourseForm((p) => ({ ...p, institution: e.target.value }))}
                        placeholder="Ex: SENAC, Udemy, Coursera..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Data de Início *</label>
                        <input
                          type="month"
                          value={courseForm.startDate}
                          onChange={(e) => setCourseForm((p) => ({ ...p, startDate: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Data de Conclusão *</label>
                        <input
                          type="month"
                          value={courseForm.endDate}
                          onChange={(e) => setCourseForm((p) => ({ ...p, endDate: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>
                    {courseError && <p className="text-red-500 text-xs">{courseError}</p>}
                    <button
                      type="button"
                      onClick={addCourse}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-add-line text-sm"></i>
                      </div>
                      Adicionar Curso
                    </button>
                  </div>
                </div>

                {/* Courses List */}
                {courses.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{courses.length} curso{courses.length > 1 ? "s" : ""} adicionado{courses.length > 1 ? "s" : ""}</p>
                    {courses.map((course) => (
                      <div key={course.id} className="bg-white border border-gray-100 rounded-lg p-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{course.title}</p>
                          {course.institution && <p className="text-gray-500 text-xs mt-0.5">{course.institution}</p>}
                          <p className="text-gray-400 text-xs mt-0.5">{course.startDate} → {course.endDate}</p>
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
                    <p className="text-gray-400 text-sm">Nenhum curso adicionado ainda</p>
                    <p className="text-gray-400 text-xs mt-1">Você pode pular esta etapa e adicionar depois</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Senha */}
            {step === 4 && (
              <div>
                <h2 className="font-bold text-gray-900 text-lg mb-1">Criar senha de acesso</h2>
                <p className="text-gray-500 text-sm mb-6">Você usará essa senha para acessar a plataforma e acompanhar suas candidaturas.</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Senha *</label>
                    <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Mínimo 6 caracteres" className={inputClass("password")} />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Confirmar Senha *</label>
                    <input type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Repita a senha" className={inputClass("confirmPassword")} />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Resumo do cadastro:</p>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500"><strong>Nome:</strong> {form.fullName}</p>
                    <p className="text-xs text-gray-500"><strong>Email:</strong> {form.email}</p>
                    <p className="text-xs text-gray-500"><strong>WhatsApp:</strong> {form.phone}</p>
                    <p className="text-xs text-gray-500"><strong>Bairro:</strong> {form.neighborhood}, {form.city}</p>
                    <p className="text-xs text-gray-500"><strong>Escolaridade:</strong> {form.educationLevel}</p>
                    <p className="text-xs text-gray-500"><strong>Cursos:</strong> {courses.length} adicionado{courses.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                  Ao criar sua conta, você concorda com nossos{" "}
                  <Link to="/termos" className="text-emerald-600 hover:underline">Termos de Uso</Link>{" "}
                  e{" "}
                  <Link to="/privacidade" className="text-emerald-600 hover:underline">Política de Privacidade</Link>.
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => (prev - 1) as Step)}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium cursor-pointer"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-arrow-left-line text-sm"></i>
                  </div>
                  Voltar
                </button>
              ) : (
                <Link to="/vagas" className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer">
                  Cancelar
                </Link>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  {step === 3 ? "Continuar para Senha" : "Continuar"}
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-arrow-right-line text-sm"></i>
                  </div>
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-check-line text-sm"></i>
                  </div>
                  Criar minha conta
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Já tem cadastro?{" "}
          <Link to="/login" className="text-emerald-600 font-semibold hover:underline cursor-pointer">
            Entrar na plataforma
          </Link>
        </p>
      </div>
    </div>
  );
}
