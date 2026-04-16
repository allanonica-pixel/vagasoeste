import { useState } from "react";
import { mockAdminCandidates, AdminCandidate } from "@/mocks/adminData";
import AnimatedSection from "@/components/base/AnimatedSection";

const EDUCATION_LEVELS = ["Todos", "Ensino Fundamental", "Ensino Médio", "Técnico", "Superior Incompleto", "Superior Completo", "Pós-graduação"];

const GENDER_LABELS: Record<string, string> = {
  M: "Masculino",
  F: "Feminino",
  NB: "Não-binário",
  NI: "Não informado",
};

export default function AdminCandidates() {
  const [candidates] = useState<AdminCandidate[]>(mockAdminCandidates);
  const [filterEducation, setFilterEducation] = useState("Todos");
  const [filterGender, setFilterGender] = useState("Todos");
  const [filterPCD, setFilterPCD] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = candidates.filter((c) => {
    const matchEdu = filterEducation === "Todos" || c.educationLevel === filterEducation;
    const matchGender = filterGender === "Todos" || c.gender === filterGender;
    const matchPCD = filterPCD === "Todos" || (filterPCD === "sim" ? c.isPCD : !c.isPCD);
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    return matchEdu && matchGender && matchPCD && matchSearch;
  });

  const selectedCandidate = candidates.find((c) => c.id === selected) || null;

  return (
    <div>
      <AnimatedSection variant="fade-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Candidatos Cadastrados</h2>
            <p className="text-gray-700 text-sm mt-0.5">{candidates.length} candidatos no total</p>
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors whitespace-nowrap flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-download-line text-sm"></i>
            </div>
            Exportar
          </button>
        </div>
      </AnimatedSection>

      {/* Filters */}
      <AnimatedSection variant="fade-up" delay={80}>
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Buscar</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                  <i className="ri-search-line text-gray-400 text-xs"></i>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nome, email ou telefone..."
                  className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Escolaridade</label>
              <select
                value={filterEducation}
                onChange={(e) => setFilterEducation(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer"
              >
                {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Sexo</label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option value="Todos">Todos</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="NB">Não-binário</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">PCD</label>
              <select
                value={filterPCD}
                onChange={(e) => setFilterPCD(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option value="Todos">Todos</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2">
          <AnimatedSection variant="fade-up" delay={120}>
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">{filtered.length} candidato{filtered.length !== 1 ? "s" : ""}</p>
          </AnimatedSection>
          <div className="space-y-3">
            {filtered.map((candidate, index) => (
              <AnimatedSection key={candidate.id} variant="fade-up" delay={(index % 6) * 60 + 140}>
                <div
                  onClick={() => setSelected(candidate.id)}
                  className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
                    selected === candidate.id ? "border-emerald-500" : "border-gray-100 hover:border-emerald-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <i className="ri-user-line text-gray-400 text-base"></i>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{candidate.name}</p>
                        <p className="text-gray-700 text-xs">{candidate.jobTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {candidate.isPCD && (
                        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">PCD</span>
                      )}
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                        {candidate.candidaturas} candidatura{candidate.candidaturas !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    <span className="text-xs text-gray-600">
                      <i className="ri-map-pin-line mr-1 text-emerald-500"></i>
                      {candidate.neighborhood}
                    </span>
                    <span className="text-xs text-gray-600">
                      <i className="ri-graduation-cap-line mr-1 text-emerald-500"></i>
                      {candidate.educationLevel}
                    </span>
                    <span className="text-xs text-gray-600">{candidate.age} anos · {GENDER_LABELS[candidate.gender]}</span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
            {filtered.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400 text-sm">Nenhum candidato encontrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail with full data */}
        <div>
          {selectedCandidate ? (
            <AnimatedSection variant="fade-up" delay={160}>
              <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <i className="ri-user-line text-gray-400 text-xl"></i>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{selectedCandidate.name}</p>
                    <p className="text-gray-700 text-xs">{selectedCandidate.jobTitle}</p>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-amber-800 mb-1">
                    <i className="ri-shield-check-line mr-1"></i>
                    Dados completos — Acesso Admin
                  </p>
                  <p className="text-xs text-amber-700">Estes dados são visíveis apenas para administradores VagasOeste.</p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Email", value: selectedCandidate.email, icon: "ri-mail-line" },
                    { label: "Telefone", value: selectedCandidate.phone, icon: "ri-phone-line" },
                    { label: "WhatsApp", value: selectedCandidate.whatsapp, icon: "ri-whatsapp-line" },
                    { label: "Bairro", value: `${selectedCandidate.neighborhood}, ${selectedCandidate.city}`, icon: "ri-map-pin-line" },
                    { label: "Idade", value: `${selectedCandidate.age} anos`, icon: "ri-calendar-line" },
                    { label: "Sexo", value: GENDER_LABELS[selectedCandidate.gender], icon: "ri-user-line" },
                    { label: "PCD", value: selectedCandidate.isPCD ? "Sim" : "Não", icon: "ri-heart-pulse-line" },
                    { label: "Escolaridade", value: selectedCandidate.educationLevel, icon: "ri-graduation-cap-line" },
                    { label: "Cadastro", value: selectedCandidate.registeredAt, icon: "ri-calendar-check-line" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-2">
                      <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                        <i className={`${item.icon} text-emerald-500 text-xs`}></i>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">{item.label}</p>
                        <p className="text-sm text-gray-800 font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                  <a
                    href={`https://wa.me/${selectedCandidate.whatsapp}`}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-xs cursor-pointer whitespace-nowrap text-center"
                  >
                    <i className="ri-whatsapp-line mr-1"></i>WhatsApp
                  </a>
                  <a
                    href={`mailto:${selectedCandidate.email}`}
                    className="flex-1 border border-gray-200 text-gray-600 font-medium py-2 rounded-lg text-xs cursor-pointer hover:bg-gray-50 whitespace-nowrap text-center"
                  >
                    <i className="ri-mail-line mr-1"></i>Email
                  </a>
                </div>
              </div>
            </AnimatedSection>
          ) : (
            <AnimatedSection variant="fade-up" delay={160}>
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <div className="w-10 h-10 flex items-center justify-center mx-auto mb-2">
                  <i className="ri-user-line text-gray-300 text-2xl"></i>
                </div>
                <p className="text-gray-400 text-sm">Selecione um candidato para ver os detalhes</p>
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>
    </div>
  );
}
