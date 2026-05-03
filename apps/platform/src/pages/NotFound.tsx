import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="size-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
        <i className="ri-error-warning-line text-gray-400 text-3xl" aria-hidden="true"></i>
      </div>
      <h1 className="text-6xl font-black text-gray-200 mb-4">404</h1>
      <h2 className="text-xl font-semibold text-gray-800 mb-2 text-balance">Página não encontrada</h2>
      <p className="text-gray-500 text-sm mb-8 max-w-sm text-pretty">
        A página que você está procurando não existe ou foi removida.
      </p>
      <div className="flex gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          <i className="ri-home-line text-sm" aria-hidden="true"></i>
          Página inicial
        </Link>
        <Link
          to="/vagas"
          className="inline-flex items-center gap-2 border border-gray-200 hover:border-emerald-300 text-gray-700 font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          Ver vagas
        </Link>
      </div>
    </div>
  );
}
