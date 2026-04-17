import { useState } from 'react';
import type { Job } from '../../lib/jobs';

type FilterType = 'Todos' | 'CLT' | 'PJ' | 'Temporário' | 'Freelance';

const FILTERS: FilterType[] = ['Todos', 'CLT', 'PJ', 'Temporário', 'Freelance'];

interface Props {
  jobs: Job[];
  appUrl: string;
  totalCount: number;
}

const contractColors: Record<string, string> = {
  CLT:       'bg-emerald-100 text-emerald-700',
  PJ:        'bg-amber-100 text-amber-700',
  Freelance: 'bg-violet-100 text-violet-700',
  Temporário:'bg-orange-100 text-orange-700',
  Estágio:   'bg-sky-100 text-sky-700',
};

export default function HomepageJobs({ jobs, appUrl, totalCount }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('Todos');

  const filtered =
    activeFilter === 'Todos'
      ? jobs
      : jobs.filter((j) => j.contractType === activeFilter);

  const visible = filtered.slice(0, 8);

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeFilter === f
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards grid — 4 colunas igual à plataforma */}
      {visible.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <i className="ri-briefcase-line text-3xl mb-2 block"></i>
          <p className="text-sm">Nenhuma vaga para este filtro no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visible.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 hover:border-emerald-200 transition-all group h-full flex flex-col"
            >
              {/* Badge + arrow */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${contractColors[job.contractType] ?? 'bg-gray-100 text-gray-600'}`}>
                  {job.contractType}
                </span>
                <a
                  href={`${appUrl}/cadastro?jobId=${job.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Candidatar-se"
                  className="w-7 h-7 flex items-center justify-center"
                >
                  <i className="ri-arrow-right-up-line text-gray-300 group-hover:text-emerald-500 transition-colors text-base"></i>
                </a>
              </div>

              {/* Info */}
              <h3 className="font-bold text-gray-900 text-lg mb-1 leading-tight">{job.title}</h3>
              <p className="text-gray-700 text-sm mb-3">{job.area}</p>

              <div className="flex items-center gap-1.5 mb-2">
                <i className="ri-map-pin-line text-emerald-500 text-sm"></i>
                <span className="text-gray-800 text-sm">{job.neighborhood}, {job.city}</span>
              </div>

              {job.salaryRange && (
                <div className="flex items-center gap-1.5 mb-3">
                  <i className="ri-money-dollar-circle-line text-emerald-500 text-sm"></i>
                  <span className="text-gray-800 text-sm">{job.salaryRange}</span>
                </div>
              )}

              {/* Empresa anônima + CTA */}
              <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <i className="ri-eye-off-line text-gray-400 text-sm"></i>
                  <span className="text-gray-400 text-sm">Empresa anônima</span>
                </div>
                <a
                  href={`${appUrl}/cadastro?jobId=${job.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors whitespace-nowrap"
                >
                  Candidatar-se
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ver todas */}
      <div className="text-center mt-10">
        <a
          href="/vagas"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Ver todas as {totalCount}+ vagas
          <i className="ri-arrow-right-line text-sm"></i>
        </a>
      </div>
    </div>
  );
}
