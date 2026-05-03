import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className={`border rounded-xl overflow-hidden transition-colors ${openIndex === i ? 'border-emerald-200 shadow-sm' : 'border-gray-200'}`}
        >
          <button
            type="button"
            onClick={() => toggle(i)}
            className="w-full flex items-center justify-between p-4 md:p-5 text-left"
            aria-expanded={openIndex === i}
          >
            <span className="font-semibold text-gray-900 text-sm md:text-base pr-4 text-balance">{item.question}</span>
            <i
              className={`ri-arrow-down-s-line text-xl text-gray-400 shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-180 text-emerald-600' : ''}`}
              aria-hidden="true"
            ></i>
          </button>
          {openIndex === i && (
            <div className="px-4 md:px-5 pb-4 md:pb-5">
              <p className="text-sm text-gray-600 leading-relaxed text-pretty">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
