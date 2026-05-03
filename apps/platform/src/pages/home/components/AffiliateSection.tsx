const courses = [
  {
    title: "Excel Completo",
    platform: "Udemy",
    discount: "85% OFF",
    href: "#afiliado-excel",
    icon: "ri-table-2",
    gradient: "from-emerald-900 to-emerald-700",
  },
  {
    title: "Inglês para o Mercado",
    platform: "Hotmart",
    discount: "60% OFF",
    href: "#afiliado-ingles",
    icon: "ri-translate-2",
    gradient: "from-blue-900 to-blue-700",
  },
  {
    title: "Pacote Office Profissional",
    platform: "Hotmart",
    discount: "70% OFF",
    href: "#afiliado-office",
    icon: "ri-computer-line",
    gradient: "from-violet-900 to-violet-700",
  },
];

export default function AffiliateSection() {
  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
            Desenvolvimento profissional
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-balance">
            Aumente suas chances com cursos
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto text-pretty">
            Candidatos com certificações têm até{" "}
            <strong>3x mais chances</strong> de serem selecionados.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <a
              key={course.title}
              href={course.href}
              rel="nofollow noopener noreferrer"
              target="_blank"
              className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden block"
            >
              {/* Gradient cover */}
              <div className="relative">
                <div
                  className={`w-full h-44 bg-gradient-to-br ${course.gradient} flex items-center justify-center transition-opacity duration-300 group-hover:opacity-90`}
                >
                  <i className={`${course.icon} text-5xl text-white/70`} aria-hidden="true"></i>
                </div>
                <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {course.discount}
                </span>
              </div>

              <div className="p-5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mb-2">
                  {course.platform}
                </span>
                <h3 className="font-bold text-gray-900 text-sm leading-snug mb-3">{course.title}</h3>
                <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                  Ver curso <i className="ri-external-link-line text-xs" aria-hidden="true"></i>
                </span>
              </div>
            </a>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          * Links de afiliado — a VagasOeste pode receber comissão sem custo adicional para você.
        </p>
      </div>
    </section>
  );
}
