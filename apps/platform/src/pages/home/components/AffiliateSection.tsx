import { mockAffiliateLinks } from "@/mocks/jobs";

export default function AffiliateSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest">Capacitação</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-3">
            Aumente suas chances com cursos
          </h2>
          <p className="text-gray-700 text-base max-w-xl mx-auto">
            Candidatos com cursos e certificações têm até 3x mais chances de serem selecionados. Confira nossas recomendações.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockAffiliateLinks.map((item) => (
            <a
              key={item.id}
              href={item.url}
              rel="nofollow"
              target="_blank"
              className="group rounded-xl border border-gray-100 overflow-hidden hover:border-amber-200 transition-all cursor-pointer block"
            >
              <div className="relative" style={{ height: "160px" }}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {item.discount}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{item.platform}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1">{item.title}</h3>
                <p className="text-gray-700 text-sm mb-4">{item.description}</p>
                <div className="flex items-center gap-1 text-amber-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  Ver curso
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-arrow-right-line text-sm"></i>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          * Links de afiliados. Ao comprar através desses links, você apoia a VagasOeste sem custo adicional.
        </p>
      </div>
    </section>
  );
}
