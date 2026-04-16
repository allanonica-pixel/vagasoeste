import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockJobs } from "@/mocks/jobs";
import AnimatedSection from "@/components/base/AnimatedSection";

const CONTRACT_COLORS: Record<string, string> = {
  CLT: "bg-emerald-100 text-emerald-700",
  PJ: "bg-amber-100 text-amber-700",
  Freelance: "bg-violet-100 text-violet-700",
  Temporário: "bg-orange-100 text-orange-700",
};

export default function JobsSection() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const navigate = useNavigate();

  const filters = ["Todos", "CLT", "PJ", "Temporário", "Freelance"];
  const filtered = activeFilter === "Todos"
    ? mockJobs.slice(0, 8)
    : mockJobs.filter((j) => j.contractType === activeFilter).slice(0, 8);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <AnimatedSection variant="fade-up" className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-emerald-600 text-xs font-semibold uppercase tracking-widest">Oportunidades</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Vagas Disponíveis Hoje
            </h2>
            <p className="text-gray-700 text-sm mt-2">
              Empresa anônima até sua seleção — candidate-se com segurança.
            </p>
          </div>
          <button
            onClick={() => navigate("/vagas")}
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            Ver todas as vagas
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-right-line text-sm"></i>
            </div>
          </button>
        </AnimatedSection>

        {/* Filters */}
        <AnimatedSection variant="fade-up" delay={100} className="flex flex-wrap gap-2 mb-8">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeFilter === f
                  ? "bg-emerald-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300"
              }`}
            >
              {f}
            </button>
          ))}
        </AnimatedSection>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((job, index) => (
            <AnimatedSection key={job.id} variant="fade-up" delay={index * 60}>
              <div
                className="bg-white rounded-xl border border-gray-100 p-5 hover:border-emerald-200 transition-all cursor-pointer group h-full"
                onClick={() => navigate("/cadastro")}
              >
                {/* Contract Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CONTRACT_COLORS[job.contractType] || "bg-gray-100 text-gray-600"}`}>
                    {job.contractType}
                  </span>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <i className="ri-arrow-right-up-line text-gray-300 group-hover:text-emerald-500 transition-colors text-sm"></i>
                  </div>
                </div>

                {/* Job Info */}
                <h3 className="font-bold text-gray-900 text-base mb-1 leading-tight">{job.title}</h3>
                <p className="text-gray-700 text-xs mb-3">{job.area}</p>

                {/* Location */}
                <div className="flex items-center gap-1 mb-3">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-map-pin-line text-emerald-500 text-xs"></i>
                  </div>
                  <span className="text-gray-800 text-xs">{job.neighborhood}, {job.city}</span>
                </div>

                {/* Salary */}
                {job.salaryRange && (
                  <div className="flex items-center gap-1 mb-4">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-money-dollar-circle-line text-emerald-500 text-xs"></i>
                    </div>
                    <span className="text-gray-800 text-xs">{job.salaryRange}</span>
                  </div>
                )}

                {/* Anonymous Notice */}
                <div className="flex items-center gap-1.5 pt-3 border-t border-gray-50">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-eye-off-line text-gray-400 text-xs"></i>
                  </div>
                  <span className="text-gray-400 text-xs">Empresa anônima</span>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* CTA */}
        <AnimatedSection variant="fade-up" delay={200} className="text-center mt-10">
          <button
            onClick={() => navigate("/vagas")}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Ver todas as {mockJobs.length}+ vagas
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-right-line text-sm"></i>
            </div>
          </button>
        </AnimatedSection>
      </div>
    </section>
  );
}
