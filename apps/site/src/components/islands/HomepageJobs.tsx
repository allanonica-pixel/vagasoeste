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
  CLT:        'bg-emerald-100 text-emerald-700',
  PJ:         'bg-amber-100 text-amber-700',
  Freelance:  'bg-violet-100 text-violet-700',
  Temporário: 'bg-orange-100 text-orange-700',
  Estágio:    'bg-sky-100 text-sky-700',
};

/** Tempo relativo de publicação */
function timeAgo(dateStr: string): string {
  if (!dateStr) return 'Recém publicado';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffH  = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD  = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffH < 1)  return 'Publicado agora';
  if (diffH === 1) return 'Há 1 hora';
  if (diffH < 24)  return `Há ${diffH} horas`;
  if (diffD === 1) return 'Publicado ontem';
  if (diffD < 30)  return `Há ${diffD} dias`;
  return 'Há mais de 1 mês';
}

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

      {/* Cards grid */}
      {visible.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <i className="ri-briefcase-line text-3xl mb-2 block"></i>
          <p className="text-sm">Nenhuma vaga para este filtro no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visible.map((job) => (
            <a
              key={job.id}
              href={`/vagas/${job.id}`}
              className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 hover:border-emerald-200 hover:shadow-md transition-all group h-full flex flex-col no-underline"
            >
              {/* Título + área */}
              <div className="mb-3">
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-0.5 line-clamp-2">
                  {job.title}
                </h3>
                <p className="text-base text-gray-500 line-clamp-1">
                  {job.area}
                  {job.sector && job.sector !== job.area ? ` · ${job.sector}` : ''}
                </p>
              </div>

              {/* Proposta salarial — destaque */}
              {job.salaryRange && (
                <div className="flex items-center gap-1.5 mb-2">
                  <i className="ri-money-dollar-circle-line text-emerald-500 text-base shrink-0"></i>
                  <span className="text-lg font-bold text-gray-900 leading-tight">
                    {job.salaryRange}
                  </span>
                </div>
              )}

              {/* Localização */}
              <div className="flex items-center gap-1.5 mb-3">
                <i className="ri-map-pin-line text-emerald-500 text-base shrink-0"></i>
                <span className="text-base text-gray-600 line-clamp-1">
                  {job.neighborhood}, {job.city}
                </span>
              </div>

              {/* Tags: tipo de contrato + tags da vaga */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span
                  className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${
                    contractColors[job.contractType] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {job.contractType}
                </span>
                {job.tags?.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Rodapé: data de publicação + CTA */}
              <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <i className="ri-time-line text-sm"></i>
                  {timeAgo(job.createdAt)}
                </span>
                <span className="text-base font-semibold text-emerald-600 group-hover:underline whitespace-nowrap">
                  Ver detalhes →
                </span>
              </div>
            </a>
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
