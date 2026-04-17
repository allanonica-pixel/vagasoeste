import { useState } from 'react';
import type { Job } from '../../lib/jobs';

type FilterType = 'Todos' | 'CLT' | 'PJ' | 'Temporário' | 'Freelance';

const FILTERS: FilterType[] = ['Todos', 'CLT', 'PJ', 'Temporário', 'Freelance'];

interface Props {
  jobs: Job[];
  appUrl: string;
}

const contractBadge = (type: string) => {
  const map: Record<string, string> = {
    CLT: 'bg-emerald-100 text-emerald-700',
    PJ: 'bg-blue-100 text-blue-700',
    Temporário: 'bg-amber-100 text-amber-700',
    Freelance: 'bg-purple-100 text-purple-700',
  };
  return map[type] ?? 'bg-gray-100 text-gray-600';
};

export default function HomepageJobs({ jobs, appUrl }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('Todos');

  const filtered =
    activeFilter === 'Todos'
      ? jobs
      : jobs.filter((j) => j.contractType === activeFilter);

  const visible = filtered.slice(0, 8);

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeFilter === f
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Gate notice */}
      <div className="flex items-center gap-2 mb-6 text-xs text-gray-500">
        <span>🔒</span>
        <span>
          Para se candidatar,{' '}
          <a
            href={`${appUrl}/cadastro`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 font-medium hover:underline"
          >
            crie sua conta grátis
          </a>{' '}
          na plataforma
        </span>
      </div>

      {/* Cards grid */}
      {visible.length === 0 ? (
        <p className="text-center text-sm text-gray-500 py-10">
          Nenhuma vaga encontrada para este filtro.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((job) => (
            <article
              key={job.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 p-5 flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">
                    {job.title}
                  </h3>
                  <p className="text-sm font-medium text-gray-600">{job.area}</p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${contractBadge(
                    job.contractType
                  )}`}
                >
                  {job.contractType}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <i className="ri-map-pin-line text-emerald-500"></i>
                  {job.neighborhood}, {job.city}
                </span>
                <span className="flex items-center gap-1 font-medium text-gray-700">
                  <i className="ri-money-dollar-circle-line text-emerald-500"></i>
                  {job.salaryRange}
                </span>
              </div>

              <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed flex-1">
                {job.description}
              </p>

              <div className="flex items-center gap-2 mt-auto">
                <a
                  href={`/vagas/${job.id}`}
                  className="flex-1 text-center text-sm font-semibold text-emerald-600 border border-emerald-200 rounded-lg py-2 hover:bg-emerald-50 transition-colors"
                >
                  Ver detalhes
                </a>
                <a
                  href={`${appUrl}/cadastro?jobId=${job.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg py-2 transition-colors"
                >
                  Candidatar-se
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Ver todas */}
      <div className="text-center mt-8">
        <a
          href="/vagas"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Ver todas as vagas
          <i className="ri-arrow-right-line"></i>
        </a>
      </div>
    </div>
  );
}
