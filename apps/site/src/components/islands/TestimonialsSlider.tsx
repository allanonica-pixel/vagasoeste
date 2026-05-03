import { useState } from 'react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  neighborhood: string;
  text: string;
  initials: string;
  color: string;
}

interface TestimonialsSliderProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSlider({ testimonials }: TestimonialsSliderProps) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <div className="relative">
      {/* Cards visíveis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div
            key={t.id}
            className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-colors duration-300 ${
              i === current ? 'ring-2 ring-emerald-200' : ''
            } md:opacity-100 ${i !== current ? 'hidden md:block' : ''}`}
          >
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, star) => (
                <i key={star} className="ri-star-fill text-amber-400 text-sm" aria-hidden="true"></i>
              ))}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-5 italic text-pretty">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-full ${t.color} flex items-center justify-center shrink-0`}>
                <span className="text-white text-xs font-bold">{t.initials}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-500">{t.role} · {t.neighborhood}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controles Mobile */}
      <div className="md:hidden flex items-center justify-center gap-4 mt-4">
        <button
          type="button"
          onClick={prev}
          className="size-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
          aria-label="Depoimento anterior"
        >
          <i className="ri-arrow-left-s-line text-xl" aria-hidden="true"></i>
        </button>
        <div className="flex gap-1.5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`size-2 rounded-full transition-colors ${i === current ? 'bg-emerald-600' : 'bg-gray-300'}`}
              aria-label={`Ir para depoimento ${i + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          className="size-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
          aria-label="Próximo depoimento"
        >
          <i className="ri-arrow-right-s-line text-xl" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
}
