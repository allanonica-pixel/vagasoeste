import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import AnimatedSection from "@/components/base/AnimatedSection";

interface Job {
  id: string;
  title: string;
  sector: string;
  area: string;
  contractType: string;
  neighborhood: string;
  city: string;
  salaryRange: string;
  createdAt: string;
}

const CONTRACT_COLORS: Record<string, string> = {
  CLT: "bg-emerald-100 text-emerald-700",
  PJ: "bg-amber-100 text-amber-700",
  Freelance: "bg-violet-100 text-violet-700",
  Temporário: "bg-orange-100 text-orange-700",
};

const MOCK_FALLBACK: Job[] = [
  { id: "1", title: "Auxiliar Administrativo", sector: "Comércio", area: "Administrativo", contractType: "CLT", neighborhood: "Centro", city: "Santarém", salaryRange: "R$ 1.800 – R$ 2.200", createdAt: "2026-04-10" },
  { id: "2", title: "Operador de Caixa", sector: "Comércio", area: "Varejo", contractType: "CLT", neighborhood: "Maracanã", city: "Santarém", salaryRange: "R$ 1.600 – R$ 1.900", createdAt: "2026-04-11" },
  { id: "3", title: "Motorista Entregador", sector: "Logística", area: "Logística", contractType: "CLT", neighborhood: "Jardim Santarém", city: "Santarém", salaryRange: "R$ 2.200 – R$ 2.800", createdAt: "2026-04-12" },
  { id: "4", title: "Recepcionista", sector: "Saúde", area: "Atendimento", contractType: "CLT", neighborhood: "Aldeia", city: "Santarém", salaryRange: "R$ 1.700 – R$ 2.100", createdAt: "2026-04-12" },
  { id: "5", title: "Auxiliar de Limpeza", sector: "Serviços", area: "Serviços Gerais", contractType: "CLT", neighborhood: "Santa Clara", city: "Santarém", salaryRange: "R$ 1.500 – R$ 1.700", createdAt: "2026-04-13" },
  { id: "6", title: "Vendedor Externo", sector: "Comércio", area: "Vendas", contractType: "PJ", neighborhood: "Aparecida", city: "Santarém", salaryRange: "R$ 2.500 – R$ 4.000", createdAt: "2026-04-13" },
  { id: "7", title: "Técnico de Informática", sector: "Tecnologia", area: "TI", contractType: "CLT", neighborhood: "Centro", city: "Santarém", salaryRange: "R$ 2.800 – R$ 3.500", createdAt: "2026-04-14" },
  { id: "8", title: "Cozinheiro(a)", sector: "Alimentação", area: "Alimentação", contractType: "CLT", neighborhood: "Maracanã", city: "Santarém", salaryRange: "R$ 2.000 – R$ 2.600", createdAt: "2026-04-14" },
];

function mapRow(row: Record<string, unknown>): Job {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    sector: String(row.sector ?? ""),
    area: String(row.area ?? ""),
    contractType: String(row.contract_type ?? ""),
    neighborhood: String(row.neighborhood ?? ""),
    city: String(row.city ?? "Santarém"),
    salaryRange: String(row.salary_range ?? ""),
    createdAt: String(row.created_at ?? ""),
  };
}

export default function JobsSection() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchJobs() {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, sector, area, contract_type, neighborhood, city, salary_range, created_at")
        .eq("status", "ativo")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error || !data || data.length === 0) {
        setJobs(MOCK_FALLBACK);
        setTotalCount(12);
      } else {
        setJobs(data.map(mapRow));
        setTotalCount(data.length);
      }
    }
    fetchJobs();
  }, []);

  const filters = ["Todos", "CLT", "PJ", "Temporário", "Freelance"];
  const filtered = (
    activeFilter === "Todos" ? jobs : jobs.filter((j) => j.contractType === activeFilter)
  ).slice(0, 8);

  return (
    <section className="pt-8 pb-14 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <AnimatedSection
          variant="fade-up"
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
        >
          <div>
            <span className="text-emerald-600 text-xs font-semibold uppercase tracking-widest">
              Oportunidades
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Vagas Disponíveis Hoje
            </h2>
            <p className="text-gray-700 text-sm mt-2">
              Empresas verificadas – candidate-se com segurança.
            </p>
          </div>
          <button
            onClick={() => navigate("/vagas")}
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            Ver todas as vagas
            <i className="ri-arrow-right-line text-sm"></i>
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
                className="bg-white rounded-xl border border-gray-100 p-5 hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer group h-full flex flex-col"
                onClick={() => navigate(`/vagas/${job.id}`)}
              >
                {/* Contract Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      CONTRACT_COLORS[job.contractType] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {job.contractType || "—"}
                  </span>
                  <i className="ri-arrow-right-up-line text-gray-300 group-hover:text-emerald-500 transition-colors text-sm"></i>
                </div>

                {/* Job Info */}
                <h3 className="font-bold text-gray-900 text-base mb-1 leading-tight">{job.title}</h3>
                <p className="text-gray-500 text-xs mb-3">{job.area || job.sector}</p>

                {/* Location */}
                <div className="flex items-center gap-1.5 mb-2">
                  <i className="ri-map-pin-line text-emerald-500 text-xs shrink-0"></i>
                  <span className="text-gray-700 text-xs">{job.neighborhood}, {job.city}</span>
                </div>

                {/* Salary */}
                {job.salaryRange && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <i className="ri-money-dollar-circle-line text-emerald-500 text-xs shrink-0"></i>
                    <span className="text-gray-700 text-xs">{job.salaryRange}</span>
                  </div>
                )}

                {/* Spacer + CTA hint */}
                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <i className="ri-eye-off-line text-gray-400 text-xs"></i>
                    <span className="text-gray-400 text-xs">Empresa anônima</span>
                  </div>
                  <span className="text-emerald-600 text-xs font-semibold group-hover:underline">
                    Habilitar
                  </span>
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
            Ver todas as {totalCount}+ vagas
            <i className="ri-arrow-right-line text-sm"></i>
          </button>
        </AnimatedSection>
      </div>
    </section>
  );
}
