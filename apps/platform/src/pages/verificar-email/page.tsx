import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";

export default function VerificarEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-32 text-center">
        <div className="bg-white rounded-2xl border border-gray-100 p-10">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <i className="ri-mail-check-line text-emerald-600 text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Verifique seu email!</h1>
          <p className="text-gray-500 text-base leading-relaxed mb-6">
            Enviamos um link de confirmação para o seu email. Clique no link para ativar sua conta e acessar a plataforma.
          </p>
          <div className="bg-emerald-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <i className="ri-whatsapp-line text-emerald-600 text-xl"></i>
              </div>
              <p className="text-emerald-700 text-sm text-left">
                Também enviamos uma mensagem no seu WhatsApp com o link de verificação.
              </p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            Não recebeu? Verifique sua caixa de spam ou{" "}
            <button className="text-emerald-600 font-semibold hover:underline cursor-pointer">
              reenviar email
            </button>
          </p>
          <Link
            to="/vagas"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-left-line text-sm"></i>
            </div>
            Voltar para as vagas
          </Link>
        </div>
      </div>
    </div>
  );
}
