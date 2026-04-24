import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

function getStrength(pwd: string) {
  if (pwd.length === 0) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const strengthLabels = ["", "Fraca", "Razoável", "Boa", "Forte"];
const strengthBarColors = ["", "bg-red-400", "bg-amber-400", "bg-sky-400", "bg-emerald-500"];
const strengthTextColors = ["", "text-red-500", "text-amber-500", "text-sky-500", "text-emerald-600"];

export default function RedefinirSenhaPage() {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Estado da sessão de recuperação
  const [sessionReady, setSessionReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const [success, setSuccess] = useState(false);

  const sessionReadyRef = useRef(false);

  useEffect(() => {
    // Supabase processa automaticamente o hash da URL e dispara PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        sessionReadyRef.current = true;
        setSessionReady(true);
      }
      if (event === "USER_UPDATED") {
        setSuccess(true);
        // Redireciona após breve delay para mostrar sucesso
        setTimeout(() => {
          navigate("/login?msg=senha-atualizada", { replace: true });
        }, 2000);
      }
    });

    // Verifica sessão já existente (caso evento já tenha disparado)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        sessionReadyRef.current = true;
        setSessionReady(true);
      }
    });

    // Se após 6s não houver sessão, link provavelmente expirou
    const timeout = setTimeout(() => {
      if (!sessionReadyRef.current) {
        setExpired(true);
      }
    }, 6000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("Use pelo menos uma letra maiúscula e um número.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);

    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateErr) {
      setError("Erro ao redefinir senha. O link pode ter expirado. Solicite um novo.");
      setSubmitting(false);
      return;
    }

    // USER_UPDATED event dispara e trata o redirect
  };

  const pwdStrength = getStrength(newPassword);

  // ── Sucesso ───────────────────────────────────────────────────

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-sm w-full">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-checkbox-circle-line text-emerald-600 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Senha redefinida!</h2>
          <p className="text-gray-500 text-sm mb-1">Redirecionando para o login...</p>
          <i className="ri-loader-4-line animate-spin text-gray-400 text-lg mt-3 block"></i>
        </div>
      </div>
    );
  }

  // ── Link expirado ─────────────────────────────────────────────

  if (expired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-sm w-full">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-time-line text-red-500 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Link inválido ou expirado</h2>
          <p className="text-gray-500 text-sm mb-6">
            O link de redefinição expirou (válido por 15 minutos) ou já foi utilizado.
            Solicite um novo.
          </p>
          <Link
            to="/esqueci-senha"
            className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            <i className="ri-mail-send-line text-sm"></i>
            Solicitar novo link
          </Link>
          <p className="mt-4">
            <Link to="/login" className="text-xs text-gray-400 hover:text-gray-600">
              ← Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Carregando sessão ─────────────────────────────────────────

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-gray-400 text-3xl block mb-3"></i>
          <p className="text-gray-500 text-sm">Verificando link de redefinição...</p>
        </div>
      </div>
    );
  }

  // ── Formulário de nova senha ──────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-600 to-sky-500 px-6 py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <i className="ri-lock-password-line text-white text-xl"></i>
              </div>
              <h2 className="text-white font-bold text-lg">Criar nova senha</h2>
              <p className="text-sky-100 text-xs mt-1">Defina uma senha forte e segura</p>
            </div>

            <div className="p-6">
              <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
                <i className="ri-shield-check-line text-sky-500 text-sm shrink-0 mt-0.5"></i>
                <p className="text-sky-700 text-xs leading-relaxed">
                  Ao redefinir sua senha, todas as sessões ativas serão encerradas.
                  Seu autenticador MFA <strong>permanecerá ativo</strong> normalmente.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nova senha</label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      autoFocus
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-sky-400 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                    >
                      <i className={`${showNew ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
                    </button>
                  </div>
                  {newPassword.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((s) => (
                          <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= pwdStrength ? strengthBarColors[pwdStrength] : "bg-gray-100"}`}></div>
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${strengthTextColors[pwdStrength]}`}>
                        Força: {strengthLabels[pwdStrength]}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirmar nova senha</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      required
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-sky-400 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                    >
                      <i className={`${showConfirm ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
                    </button>
                  </div>
                  {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">As senhas não coincidem</p>
                  )}
                  {confirmPassword.length >= 8 && newPassword === confirmPassword && (
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                      <i className="ri-check-line"></i> Senhas coincidem
                    </p>
                  )}
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
                      Salvando...
                    </span>
                  ) : "Salvar nova senha"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
