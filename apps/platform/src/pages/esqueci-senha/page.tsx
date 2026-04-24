import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const redirectTo = `${window.location.origin}/redefinir-senha`;

    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    // Por segurança, não revelamos se o email existe ou não
    if (resetErr && resetErr.message !== "Email rate limit exceeded") {
      // Se for rate limit, ainda mostramos sucesso
      if (resetErr.status !== 429) {
        setError("Erro ao processar solicitação. Tente novamente em alguns minutos.");
        setSubmitting(false);
        return;
      }
    }

    setSent(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <i className="ri-briefcase-line text-white text-xs"></i>
            </div>
            <span className="font-bold text-base text-gray-900">
              Vagas<span className="text-emerald-600">Oeste</span>
            </span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {sent ? (
            /* ── Sucesso ─────────────────────────────────────── */
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-4">
                <i className="ri-mail-check-line text-sky-600 text-2xl"></i>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Email enviado!</h2>
              <p className="text-gray-600 text-sm mb-1">
                Se o endereço abaixo estiver cadastrado, você receberá o link:
              </p>
              <p className="font-semibold text-gray-900 text-sm mb-5">{email}</p>

              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6 text-left">
                <div className="flex items-start gap-2">
                  <i className="ri-shield-check-line text-amber-500 text-sm shrink-0 mt-0.5"></i>
                  <div className="text-xs text-amber-700 space-y-1">
                    <p>• O link expira em <strong>15 minutos</strong></p>
                    <p>• A senha atual será invalidada ao redefinir</p>
                    <p>• Seu autenticador MFA <strong>permanece ativo</strong></p>
                    <p>• Verifique também a pasta de spam</p>
                  </div>
                </div>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                <i className="ri-arrow-left-line text-xs"></i>
                Voltar ao login
              </Link>
            </div>
          ) : (
            /* ── Formulário ──────────────────────────────────── */
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-sky-600 to-sky-500 px-6 py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <i className="ri-mail-send-line text-white text-xl"></i>
                </div>
                <h2 className="text-white font-bold text-lg">Esqueceu a senha?</h2>
                <p className="text-sky-100 text-xs mt-1">Enviaremos um link seguro de redefinição</p>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Email corporativo cadastrado
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@empresa.com"
                      required
                      autoFocus
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-sky-400 transition-colors"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex items-center gap-2">
                      <i className="ri-error-warning-line text-red-500 text-sm shrink-0"></i>
                      <p className="text-red-600 text-xs">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-all cursor-pointer"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <i className="ri-loader-4-line animate-spin text-sm"></i>
                        Enviando...
                      </span>
                    ) : "Enviar link de redefinição"}
                  </button>
                </form>

                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 text-center leading-relaxed">
                    O link expira em 15 minutos. Ao redefinir a senha, todas as sessões ativas
                    serão encerradas e seu MFA <strong>permanecerá ativo</strong>.
                  </p>
                </div>

                <p className="text-center mt-4">
                  <Link to="/login" className="text-xs text-sky-600 hover:underline flex items-center justify-center gap-1">
                    <i className="ri-arrow-left-line text-xs"></i>
                    Voltar ao login
                  </Link>
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
