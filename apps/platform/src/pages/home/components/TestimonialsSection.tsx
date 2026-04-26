import { useState } from "react";

const testimonials = [
  {
    id: 1,
    name: "Fernanda Oliveira",
    role: "Auxiliar Administrativa",
    neighborhood: "Centro",
    text: "Em menos de 2 semanas após me cadastrar na VagasOeste, recebi uma proposta de emprego no meu bairro. O processo foi super transparente!",
    initials: "FO",
    color: "bg-emerald-600",
  },
  {
    id: 2,
    name: "Carlos Mendes",
    role: "Motorista Entregador",
    neighborhood: "Jardim Santarém",
    text: "Achei incrível que a empresa ficou anônima até eu ser selecionado. Me senti mais seguro no processo. Hoje estou empregado há 4 meses!",
    initials: "CM",
    color: "bg-blue-600",
  },
  {
    id: 3,
    name: "Juliana Santos",
    role: "Recepcionista",
    neighborhood: "Maracanã",
    text: "A plataforma é muito fácil de usar. Me candidatei a 3 vagas de uma vez e fui chamada para entrevista em 2 delas. A VagasOeste realmente funciona!",
    initials: "JS",
    color: "bg-violet-600",
  },
];

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const t = testimonials[active];

  return (
    <section className="py-14 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
            Histórias reais
          </p>
          <h2 className="text-2xl font-bold text-gray-900">O que dizem nossos candidatos</h2>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <i key={s} className="ri-star-fill text-amber-400 text-base"></i>
              ))}
            </div>

            {/* Quote */}
            <p className="text-gray-800 text-lg leading-relaxed italic mb-8">"{t.text}"</p>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center shrink-0`}
              >
                <span className="text-white font-bold text-sm">{t.initials}</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">{t.name}</p>
                <p className="text-gray-500 text-sm">
                  {t.role} · {t.neighborhood}
                </p>
              </div>

              {/* Navigation */}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setActive((p) => (p - 1 + testimonials.length) % testimonials.length)}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:border-emerald-300 text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  <i className="ri-arrow-left-line text-sm"></i>
                </button>
                <button
                  onClick={() => setActive((p) => (p + 1) % testimonials.length)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                >
                  <i className="ri-arrow-right-line text-sm"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`rounded-full transition-all cursor-pointer ${
                  i === active ? "w-6 h-2 bg-emerald-600" : "w-2 h-2 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
