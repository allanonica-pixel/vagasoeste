import { useState } from "react";
import { mockTestimonials } from "@/mocks/jobs";

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const testimonial = mockTestimonials[active];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <span className="text-emerald-600 text-xs font-semibold uppercase tracking-widest">Histórias Reais</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Quem encontrou emprego pela VagasOeste
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden" style={{ height: "380px" }}>
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-emerald-600 text-white rounded-xl px-4 py-3">
              <div className="flex items-center gap-1 mb-1">
                {[1,2,3,4,5].map((s) => (
                  <div key={s} className="w-3 h-3 flex items-center justify-center">
                    <i className="ri-star-fill text-yellow-300 text-xs"></i>
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold">Contratado em 2 semanas</p>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="w-10 h-10 flex items-center justify-center mb-6">
              <i className="ri-double-quotes-l text-emerald-200 text-5xl leading-none"></i>
            </div>
            <p className="text-gray-800 text-lg leading-relaxed mb-8 italic">
              "{testimonial.text}"
            </p>
            <div className="flex items-center gap-3 mb-8">
              <div>
                <p className="font-bold text-gray-900">{testimonial.name}</p>
                <p className="text-gray-700 text-sm">{testimonial.role} · {testimonial.neighborhood}</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActive((prev) => (prev - 1 + mockTestimonials.length) % mockTestimonials.length)}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:border-emerald-300 text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                <i className="ri-arrow-left-line text-sm"></i>
              </button>
              <div className="flex gap-2">
                {mockTestimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`rounded-full transition-all cursor-pointer ${i === active ? "w-6 h-2 bg-emerald-600" : "w-2 h-2 bg-gray-300"}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setActive((prev) => (prev + 1) % mockTestimonials.length)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
              >
                <i className="ri-arrow-right-line text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
