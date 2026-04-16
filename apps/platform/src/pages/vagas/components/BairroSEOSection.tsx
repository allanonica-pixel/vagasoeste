import { useEffect } from "react";
import { Link } from "react-router-dom";
import { mockNeighborhoods } from "@/mocks/jobs";

interface BairroSEOSectionProps {
  bairro: string;
  jobCount: number;
}

const BAIRRO_DESCRIPTIONS: Record<string, string> = {
  Centro: "O Centro de Santarém concentra o maior número de vagas de emprego da cidade, com oportunidades em comércio, serviços, administração e tecnologia. É o coração econômico da região oeste do Pará.",
  Maracanã: "O bairro Maracanã é um dos mais movimentados de Santarém, com forte presença do setor de alimentação, varejo e serviços. Ótimas oportunidades para quem mora na região.",
  "Jardim Santarém": "Jardim Santarém é um bairro residencial em crescimento, com vagas em logística, construção civil e serviços gerais. Ideal para quem busca emprego próximo de casa.",
  Aldeia: "O bairro Aldeia tem crescido rapidamente em Santarém, com novas empresas e oportunidades nas áreas de saúde, comércio e construção civil.",
  "Santa Clara": "Santa Clara é um bairro tradicional de Santarém com boas oportunidades em comércio local, serviços e administração.",
  Aparecida: "O bairro Aparecida oferece vagas em diversas áreas, com destaque para vendas, atendimento ao cliente e serviços gerais.",
};

const BAIRRO_SECTORS: Record<string, string[]> = {
  Centro: ["Comércio", "Tecnologia", "Administrativo", "Saúde", "Serviços"],
  Maracanã: ["Alimentação", "Varejo", "Serviços", "Logística"],
  "Jardim Santarém": ["Logística", "Construção Civil", "Serviços", "Recursos Humanos"],
  Aldeia: ["Saúde", "Comércio", "Construção Civil", "Serviços"],
  "Santa Clara": ["Comércio", "Serviços", "Administrativo", "Design"],
  Aparecida: ["Vendas", "Atendimento", "Serviços", "Comércio"],
};

export default function BairroSEOSection({ bairro, jobCount }: BairroSEOSectionProps) {
  const description = BAIRRO_DESCRIPTIONS[bairro];
  const sectors = BAIRRO_SECTORS[bairro] || [];
  const neighborhoodData = mockNeighborhoods.find((n) => n.name === bairro);

  // Inject Schema.org for local job listing page
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Vagas de Emprego no ${bairro}, Santarém/PA | VagasOeste`;

    const metaDesc = document.querySelector("meta[name='description']");
    const prevDesc = metaDesc?.getAttribute("content") || "";
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        `${jobCount} vagas de emprego no bairro ${bairro} em Santarém, Pará. Oportunidades em ${sectors.slice(0, 3).join(", ")} e mais. Candidate-se pela VagasOeste.`
      );
    }

    // Schema.org ItemList for job listings by neighborhood
    const schemaId = "bairro-schema";
    let existing = document.getElementById(schemaId);
    if (!existing) {
      existing = document.createElement("script");
      existing.id = schemaId;
      existing.setAttribute("type", "application/ld+json");
      document.head.appendChild(existing);
    }
    existing.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `Vagas de Emprego no ${bairro}, Santarém/PA`,
      "description": description || `Vagas de emprego no bairro ${bairro} em Santarém, Pará.`,
      "url": `https://vagasoeste.com.br/vagas?bairro=${encodeURIComponent(bairro)}`,
      "numberOfItems": jobCount,
      "itemListElement": sectors.map((sector, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": `Vagas de ${sector} no ${bairro}`,
        "url": `https://vagasoeste.com.br/vagas?bairro=${encodeURIComponent(bairro)}&setor=${encodeURIComponent(sector)}`,
      })),
    });

    return () => {
      document.title = prevTitle;
      if (metaDesc) metaDesc.setAttribute("content", prevDesc);
      const el = document.getElementById(schemaId);
      if (el) el.remove();
    };
  }, [bairro, jobCount, description, sectors]);

  if (!description) return null;

  return (
    <div className="mt-10 bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header with image */}
      {neighborhoodData?.image && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={neighborhoodData.image}
            alt={`Bairro ${bairro} em Santarém`}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>
          <div className="absolute bottom-4 left-5">
            <h2 className="text-white font-bold text-xl">
              Vagas no {bairro}
            </h2>
            <p className="text-emerald-300 text-sm font-medium">
              {jobCount} vaga{jobCount !== 1 ? "s" : ""} disponível{jobCount !== 1 ? "is" : ""}
            </p>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-5">{description}</p>

        {/* Sectors */}
        {sectors.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Setores com vagas no {bairro}
            </p>
            <div className="flex flex-wrap gap-2">
              {sectors.map((sector) => (
                <Link
                  key={sector}
                  to={`/vagas?bairro=${encodeURIComponent(bairro)}&setor=${encodeURIComponent(sector)}`}
                  className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <i className="ri-briefcase-line text-xs"></i>
                  {sector}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Other neighborhoods */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Outros bairros em Santarém
          </p>
          <div className="flex flex-wrap gap-2">
            {mockNeighborhoods
              .filter((n) => n.name !== bairro)
              .map((n) => (
                <Link
                  key={n.name}
                  to={`/vagas?bairro=${encodeURIComponent(n.name)}`}
                  className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full hover:border-emerald-200 hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  <i className="ri-map-pin-line text-xs"></i>
                  {n.name}
                  <span className="text-gray-400">({n.jobCount})</span>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
