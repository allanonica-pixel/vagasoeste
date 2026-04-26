const stats = [
  { label: "Vagas Ativas", value: "1.240+" },
  { label: "Candidatos Cadastrados", value: "8.500+" },
  { label: "Empresas Parceiras", value: "320+" },
  { label: "Contratações em 2026", value: "2.100+" },
];

export default function StatsBar() {
  return (
    <section className="bg-emerald-600">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-white">
          {stats.map((stat) => (
            <div key={stat.label} className="py-0.5">
              <dt className="text-xl md:text-2xl font-bold">{stat.value}</dt>
              <dd className="text-xs text-emerald-100 mt-0.5">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
