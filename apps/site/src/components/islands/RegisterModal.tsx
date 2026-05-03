import { useState, useEffect } from 'react';

export default function RegisterModal() {
  const [open, setOpen] = useState(false);
  const [candidatoUrl, setCandidatoUrl] = useState('https://app.santarem.app/cadastro');

  useEffect(() => {
    const openHandler = (e: Event) => {
      const detail = (e as CustomEvent<{ candidatoUrl?: string }>).detail;
      setCandidatoUrl(detail?.candidatoUrl || 'https://app.santarem.app/cadastro');
      setOpen(true);
    };

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('openRegisterModal', openHandler);
    window.addEventListener('keydown', keyHandler);

    return () => {
      window.removeEventListener('openRegisterModal', openHandler);
      window.removeEventListener('keydown', keyHandler);
    };
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Painel */}
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fechar */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar"
        >
          <i className="ri-close-line text-xl" aria-hidden="true" />
        </button>

        <h2
          id="register-modal-title"
          className="text-lg font-bold text-gray-900 mb-1"
        >
          Criar conta
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Como você quer se cadastrar?
        </p>

        <div className="flex flex-col gap-3">
          {/* Candidato */}
          <a
            href={candidatoUrl}
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition-colors group"
          >
            <div className="size-10 rounded-full bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center shrink-0 transition-colors">
              <i className="ri-user-search-line text-emerald-600 text-xl" aria-hidden="true" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900 text-sm">
                Cadastro como Candidato a Vaga
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Crie seu perfil e candidate-se às vagas
              </p>
            </div>
            <i className="ri-arrow-right-line text-emerald-500 shrink-0" aria-hidden="true" />
          </a>

          {/* Empresa */}
          <a
            href="/interesse-empresa"
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors group"
          >
            <div className="size-10 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center shrink-0 transition-colors">
              <i className="ri-building-2-line text-gray-600 text-xl" aria-hidden="true" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900 text-sm">
                Cadastro de sua Empresa
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Publique vagas e contrate talentos
              </p>
            </div>
            <i className="ri-arrow-right-line text-gray-400 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
