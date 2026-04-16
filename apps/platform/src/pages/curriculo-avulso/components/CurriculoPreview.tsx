import { useRef } from "react";
import { CurriculoData } from "./CurriculoEditor";

interface Props {
  data: CurriculoData;
  onEdit: () => void;
}

function formatMonth(ym: string) {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${months[parseInt(m, 10) - 1]}/${y}`;
}

export default function CurriculoPreview({ data, onEdit }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML ?? "";
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Currículo — ${data.nome}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a1a; background: #fff; }
          .cv { max-width: 800px; margin: 0 auto; padding: 40px 48px; }
          .cv-header { border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 24px; }
          .cv-name { font-size: 26px; font-weight: 700; color: #064e3b; }
          .cv-contact { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; font-size: 12px; color: #555; }
          .cv-contact span { display: flex; align-items: center; gap: 4px; }
          .cv-section { margin-bottom: 20px; }
          .cv-section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #059669; border-bottom: 1px solid #d1fae5; padding-bottom: 4px; margin-bottom: 12px; }
          .cv-objetivo { font-size: 13px; color: #374151; line-height: 1.6; }
          .cv-item { margin-bottom: 14px; }
          .cv-item-title { font-weight: 600; font-size: 14px; color: #111; }
          .cv-item-sub { font-size: 12px; color: #555; margin-top: 2px; }
          .cv-item-date { font-size: 11px; color: #888; margin-top: 2px; }
          .cv-item-desc { font-size: 12px; color: #444; margin-top: 6px; line-height: 1.5; }
          .cv-tags { display: flex; flex-wrap: wrap; gap: 6px; }
          .cv-tag { background: #d1fae5; color: #065f46; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 999px; }
          .cv-idioma-row { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; border-bottom: 1px solid #f3f4f6; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="cv">
          <div class="cv-header">
            <div class="cv-name">${data.nome}</div>
            <div class="cv-contact">
              ${data.email ? `<span>${data.email}</span>` : ""}
              ${data.telefone ? `<span>${data.telefone}</span>` : ""}
              ${data.cidade ? `<span>${data.cidade}${data.estado ? `/${data.estado}` : ""}</span>` : ""}
              ${data.linkedin ? `<span>${data.linkedin}</span>` : ""}
            </div>
          </div>
          ${data.objetivo ? `<div class="cv-section"><div class="cv-section-title">Objetivo Profissional</div><div class="cv-objetivo">${data.objetivo}</div></div>` : ""}
          ${data.experiencias.length > 0 ? `
            <div class="cv-section">
              <div class="cv-section-title">Experiências Profissionais</div>
              ${data.experiencias.map((e) => `
                <div class="cv-item">
                  <div class="cv-item-title">${e.cargo}</div>
                  <div class="cv-item-sub">${e.empresa}</div>
                  <div class="cv-item-date">${formatMonth(e.inicio)} — ${e.atual ? "Atual" : formatMonth(e.fim)}</div>
                  ${e.descricao ? `<div class="cv-item-desc">${e.descricao}</div>` : ""}
                </div>
              `).join("")}
            </div>
          ` : ""}
          ${data.formacoes.length > 0 ? `
            <div class="cv-section">
              <div class="cv-section-title">Formação Acadêmica</div>
              ${data.formacoes.map((f) => `
                <div class="cv-item">
                  <div class="cv-item-title">${f.curso}</div>
                  <div class="cv-item-sub">${f.instituicao} · ${f.nivel}</div>
                  ${f.inicio ? `<div class="cv-item-date">${formatMonth(f.inicio)}${f.fim || f.atual ? ` — ${f.atual ? "Cursando" : formatMonth(f.fim)}` : ""}</div>` : ""}
                </div>
              `).join("")}
            </div>
          ` : ""}
          ${data.habilidades.length > 0 ? `
            <div class="cv-section">
              <div class="cv-section-title">Habilidades</div>
              <div class="cv-tags">${data.habilidades.map((h) => `<span class="cv-tag">${h}</span>`).join("")}</div>
            </div>
          ` : ""}
          ${data.idiomas.length > 0 ? `
            <div class="cv-section">
              <div class="cv-section-title">Idiomas</div>
              ${data.idiomas.map((i) => `<div class="cv-idioma-row"><span>${i.idioma}</span><span>${i.nivel}</span></div>`).join("")}
            </div>
          ` : ""}
          ${data.cursos.length > 0 ? `
            <div class="cv-section">
              <div class="cv-section-title">Cursos Complementares</div>
              ${data.cursos.map((c) => `
                <div class="cv-item">
                  <div class="cv-item-title">${c.titulo}</div>
                  <div class="cv-item-sub">${c.instituicao}${c.cargaHoraria ? ` · ${c.cargaHoraria}h` : ""}${c.ano ? ` · ${c.ano}` : ""}</div>
                </div>
              `).join("")}
            </div>
          ` : ""}
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  return (
    <div>
      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Prévia do Currículo</h2>
          <p className="text-gray-500 text-sm mt-0.5">Confira como ficou e baixe o PDF gratuitamente.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-edit-line text-sm"></i>
            </div>
            Editar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-download-line text-sm"></i>
            </div>
            Baixar PDF Grátis
          </button>
        </div>
      </div>

      {/* Preview Card */}
      <div ref={printRef} className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10">
        {/* Header */}
        <div className="border-b-2 border-emerald-500 pb-5 mb-6">
          <h1 className="text-2xl font-bold text-emerald-900">{data.nome || "Seu Nome"}</h1>
          <div className="flex flex-wrap gap-4 mt-2">
            {data.email && (
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-mail-line text-xs"></i></div>
                {data.email}
              </span>
            )}
            {data.telefone && (
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-phone-line text-xs"></i></div>
                {data.telefone}
              </span>
            )}
            {data.cidade && (
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-map-pin-line text-xs"></i></div>
                {data.cidade}{data.estado ? `/${data.estado}` : ""}
              </span>
            )}
            {data.linkedin && (
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-linkedin-line text-xs"></i></div>
                {data.linkedin}
              </span>
            )}
          </div>
        </div>

        {/* Objetivo */}
        {data.objetivo && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 border-b border-emerald-100 pb-1 mb-3">Objetivo Profissional</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{data.objetivo}</p>
          </div>
        )}

        {/* Experiências */}
        {data.experiencias.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 border-b border-emerald-100 pb-1 mb-3">Experiências Profissionais</h3>
            <div className="space-y-4">
              {data.experiencias.map((e) => (
                <div key={e.id}>
                  <p className="font-semibold text-gray-900 text-sm">{e.cargo}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{e.empresa}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{formatMonth(e.inicio)} — {e.atual ? "Atual" : formatMonth(e.fim)}</p>
                  {e.descricao && <p className="text-gray-600 text-xs mt-1.5 leading-relaxed">{e.descricao}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formação */}
        {data.formacoes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 border-b border-emerald-100 pb-1 mb-3">Formação Acadêmica</h3>
            <div className="space-y-3">
              {data.formacoes.map((f) => (
                <div key={f.id}>
                  <p className="font-semibold text-gray-900 text-sm">{f.curso}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{f.instituicao} · <span className="text-emerald-600">{f.nivel}</span></p>
                  {f.inicio && <p className="text-gray-400 text-xs mt-0.5">{formatMonth(f.inicio)}{f.fim || f.atual ? ` — ${f.atual ? "Cursando" : formatMonth(f.fim)}` : ""}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Habilidades */}
        {data.habilidades.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 border-b border-emerald-100 pb-1 mb-3">Habilidades</h3>
            <div className="flex flex-wrap gap-2">
              {data.habilidades.map((h) => (
                <span key={h} className="bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-100">{h}</span>
              ))}
            </div>
          </div>
        )}

        {/* Idiomas */}
        {data.idiomas.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 border-b border-emerald-100 pb-1 mb-3">Idiomas</h3>
            <div className="space-y-1.5">
              {data.idiomas.map((i) => (
                <div key={i.id} className="flex justify-between text-sm border-b border-gray-50 pb-1.5">
                  <span className="font-medium text-gray-800">{i.idioma}</span>
                  <span className="text-gray-500 text-xs">{i.nivel}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cursos */}
        {data.cursos.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 border-b border-emerald-100 pb-1 mb-3">Cursos Complementares</h3>
            <div className="space-y-2">
              {data.cursos.map((c) => (
                <div key={c.id}>
                  <p className="font-semibold text-gray-900 text-sm">{c.titulo}</p>
                  <p className="text-gray-500 text-xs">{c.instituicao}{c.cargaHoraria ? ` · ${c.cargaHoraria}h` : ""}{c.ano ? ` · ${c.ano}` : ""}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!data.nome && !data.objetivo && data.experiencias.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <i className="ri-file-user-line text-4xl"></i>
            </div>
            <p className="text-sm">Preencha as etapas anteriores para ver a prévia do seu currículo.</p>
          </div>
        )}
      </div>

      {/* CTA Cadastro */}
      <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-emerald-800">Quer salvar e se candidatar a vagas?</p>
          <p className="text-xs text-emerald-600 mt-0.5">Crie sua conta grátis e acesse 1.240+ vagas em Santarém.</p>
        </div>
        <a
          href="/cadastro"
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          Criar conta grátis
        </a>
      </div>
    </div>
  );
}
