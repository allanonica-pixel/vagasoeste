import { useState } from "react";
import { Link } from "react-router-dom";
import { EDUCATION_LEVELS_FILTER } from "@/mocks/candidates";
import { formatBrazilPhone, isValidBrazilPhone } from "@/hooks/useBrazilPhone";

interface Course {
  id: string;
  title: string;
  institution: string;
  startDate: string;
  endDate: string;
}

const INITIAL_COURSES: Course[] = [
  { id: "c1", title: "Pacote Office Intermediário", institution: "SENAC", startDate: "2024-03", endDate: "2024-06" },
  { id: "c2", title: "Atendimento ao Cliente", institution: "Online", startDate: "2023-08", endDate: "2023-10" },
];

export default function CandidatoPerfilPage() {
  const [activeTab, setActiveTab] = useState<"dados" | "cursos">("dados");
  const [saved, setSaved] = useState(false);

  // Personal data
  const [name, setName] = useState("Juliana Ferreira");
  const [email, setEmail] = useState("juliana.ferreira@email.com");
  const [phone, setPhone] = useState("(93) 99111-2233");
  const [whatsapp, setWhatsapp] = useState("(93) 99111-2233");
  const [neighborhood, setNeighborhood] = useState("Centro");
  const [city, setCity] = useState("Santarém");
  const [age, setAge] = useState("24");
  const [gender, setGender] = useState("F");
  const [isPCD, setIsPCD] = useState(false);
  const [educationLevel, setEducationLevel] = useState("Ensino Médio");
  const [availability, setAvailability] = useState("Integral");
  const [salaryExpectation, setSalaryExpectation] = useState("R$ 1.800 – R$ 2.200");
  const [experiences, setExperiences] = useState("3 anos em rotinas administrativas, controle de documentos, atendimento ao cliente interno.");

  const updatePhone = (value: string, setter: (v: string) => void) => {
    setter(formatBrazilPhone(value));
  };

  // Courses
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState<Omit<Course, "id">>({ title: "", institution: "", startDate: "", endDate: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleAddCourse = () => {
    if (!courseForm.title || !courseForm.startDate) return;
    if (editingCourse) {
      setCourses((prev) => prev.map((c) => c.id === editingCourse.id ? { ...courseForm, id: editingCourse.id } : c));
    } else {
      setCourses((prev) => [...prev, { ...courseForm, id: `c${Date.now()}` }]);
    }
    setCourseForm({ title: "", institution: "", startDate: "", endDate: "" });
    setShowCourseForm(false);
    setEditingCourse(null);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({ title: course.title, institution: course.institution, startDate: course.startDate, endDate: course.endDate });
    setShowCourseForm(true);
  };

  const handleDeleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirm(null);
  };

  const formatDate = (d: string) => {
    if (!d) return "";
    const [y, m] = d.split("-");
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${months[parseInt(m) - 1]}/${y}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/plataforma" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
              <i className="ri-arrow-left-line text-gray-600 text-base"></i>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                <i className="ri-briefcase-line text-white text-xs"></i>
              </div>
              <span className="font-bold text-base text-gray-900">
                Vagas<span className="text-emerald-600">Oeste</span>
              </span>
            </div>
          </div>
          <span className="text-gray-500 text-sm">Meu Perfil</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <i className="ri-user-line text-emerald-600 text-2xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
            <p className="text-gray-700 text-sm mt-0.5">{email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Candidato Ativo</span>
              {isPCD && <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">PCD</span>}
            </div>
          </div>
        </div>

        {saved && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-checkbox-circle-line text-emerald-600 text-sm"></i>
            </div>
            <p className="text-emerald-700 text-sm font-medium">Perfil atualizado com sucesso!</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
          {[
            { id: "dados" as const, label: "Dados Pessoais", icon: "ri-user-line" },
            { id: "cursos" as const, label: "Cursos e Certificações", icon: "ri-graduation-cap-line" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id ? "bg-white text-gray-900" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${tab.icon} text-xs`}></i>
              </div>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dados Pessoais */}
        {activeTab === "dados" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-base mb-5">Informações Pessoais</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Nome Completo</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Telefone</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                    <i className="ri-phone-line text-gray-400 text-xs"></i>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => updatePhone(e.target.value, setPhone)}
                    placeholder="(93) 99999-9999"
                    maxLength={15}
                    className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400"
                  />
                </div>
                {phone && !isValidBrazilPhone(phone) && (
                  <p className="text-amber-500 text-xs mt-1 flex items-center gap-1">
                    <i className="ri-error-warning-line"></i>
                    Formato esperado: (XX) XXXXX-XXXX
                  </p>
                )}
                {phone && isValidBrazilPhone(phone) && (
                  <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                    <i className="ri-checkbox-circle-line"></i>
                    Número válido
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">WhatsApp</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                    <i className="ri-whatsapp-line text-gray-400 text-xs"></i>
                  </div>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => updatePhone(e.target.value, setWhatsapp)}
                    placeholder="(93) 99999-9999"
                    maxLength={15}
                    className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400"
                  />
                </div>
                {whatsapp && !isValidBrazilPhone(whatsapp) && (
                  <p className="text-amber-500 text-xs mt-1 flex items-center gap-1">
                    <i className="ri-error-warning-line"></i>
                    Formato esperado: (XX) XXXXX-XXXX
                  </p>
                )}
                {whatsapp && isValidBrazilPhone(whatsapp) && (
                  <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                    <i className="ri-checkbox-circle-line"></i>
                    Número válido
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Bairro</label>
                <input type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Cidade</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Idade</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Sexo</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400 cursor-pointer">
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="NB">Não-binário</option>
                  <option value="NI">Prefiro não informar</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Escolaridade Atual</label>
                <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400 cursor-pointer">
                  {EDUCATION_LEVELS_FILTER.filter((l) => l !== "Todos").map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Disponibilidade</label>
                <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400 cursor-pointer">
                  <option value="Integral">Integral</option>
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noite">Noite</option>
                  <option value="Fins de semana">Fins de semana</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Pretensão Salarial</label>
                <input type="text" value={salaryExpectation} onChange={(e) => setSalaryExpectation(e.target.value)} placeholder="Ex: R$ 1.800 – R$ 2.200" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400" />
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">PCD (Pessoa com Deficiência)</label>
                  <div className="flex gap-3">
                    {[{ label: "Sim", value: true }, { label: "Não", value: false }].map((opt) => (
                      <button
                        key={String(opt.value)}
                        onClick={() => setIsPCD(opt.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-2 transition-colors whitespace-nowrap ${
                          isPCD === opt.value ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Experiências Profissionais</label>
              <textarea
                value={experiences}
                onChange={(e) => setExperiences(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-400 resize-none"
              />
              <p className="text-xs text-gray-500 text-right mt-1">{experiences.length}/500</p>
            </div>

            <button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl text-sm cursor-pointer transition-colors whitespace-nowrap"
            >
              <i className="ri-save-line mr-2"></i>
              Salvar Alterações
            </button>
          </div>
        )}

        {/* Cursos */}
        {activeTab === "cursos" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-base mb-5">Cursos e Certificações</h2>
              <button
                onClick={() => { setShowCourseForm(true); setEditingCourse(null); setCourseForm({ title: "", institution: "", startDate: "", endDate: "" }); }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors whitespace-nowrap flex items-center gap-2"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-add-line text-sm"></i>
                </div>
                Adicionar Curso
              </button>
            </div>

            {courses.length === 0 && !showCourseForm && (
              <div className="text-center py-12">
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <i className="ri-graduation-cap-line text-gray-300 text-3xl"></i>
                </div>
                <p className="text-gray-400 text-sm">Nenhum curso cadastrado ainda</p>
                <p className="text-gray-400 text-xs mt-1">Adicione seus cursos e certificações para fortalecer seu perfil</p>
              </div>
            )}

            <div className="space-y-3 mb-4">
              {courses.map((course) => (
                <div key={course.id} className="bg-gray-50 rounded-xl p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                      <i className="ri-graduation-cap-line text-emerald-600 text-sm"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{course.title}</p>
                      {course.institution && <p className="text-gray-700 text-xs mt-0.5">{course.institution}</p>}
                      <p className="text-gray-600 text-xs mt-1">
                        {formatDate(course.startDate)}
                        {course.endDate && ` – ${formatDate(course.endDate)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                      <i className="ri-edit-line text-gray-500 text-sm"></i>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(course.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                    >
                      <i className="ri-delete-bin-line text-red-400 text-sm"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Course Form */}
            {showCourseForm && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mt-4">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm">
                  {editingCourse ? "Editar Curso" : "Novo Curso"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Título do Curso *</label>
                    <input
                      type="text"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Ex: Excel Avançado"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Instituição</label>
                    <input
                      type="text"
                      value={courseForm.institution}
                      onChange={(e) => setCourseForm((f) => ({ ...f, institution: e.target.value }))}
                      placeholder="Ex: SENAC, Udemy, Coursera..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Data de Início *</label>
                    <input
                      type="month"
                      value={courseForm.startDate}
                      onChange={(e) => setCourseForm((f) => ({ ...f, startDate: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 bg-white cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Data de Conclusão</label>
                    <input
                      type="month"
                      value={courseForm.endDate}
                      onChange={(e) => setCourseForm((f) => ({ ...f, endDate: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 bg-white cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowCourseForm(false); setEditingCourse(null); }}
                    className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg text-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddCourse}
                    disabled={!courseForm.title || !courseForm.startDate}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {editingCourse ? "Salvar Edição" : "Adicionar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 mb-2">Remover curso?</h3>
            <p className="text-gray-700 text-sm mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg text-sm cursor-pointer hover:bg-gray-50">Cancelar</button>
              <button onClick={() => handleDeleteCourse(deleteConfirm)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg text-sm cursor-pointer">Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
