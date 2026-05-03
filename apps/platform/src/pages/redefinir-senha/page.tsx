import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

/** Rota do dashboard de acordo com o role do usuário autenticado. */
async function dashboardRoute(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const u = data.session?.user;
  const role = (u?.app_metadata?.role as string) || (u?.user_metadata?.role as string) || "";
  if (role === "empresa") return "/empresa/dashboard";
  if (role === "admin")   return "/vo-painel";
  return "/plataforma"; // candidato (padrão)
}

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
        // Exibe o modal de sucesso — o redirect acontece apenas ao clicar em OK
        setSuccess(true);
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

  /** Ao clicar OK no modal: navega para o dashboard correto já logado. */
  const handleSuccessOk = async () => {
    const route = await dashboardRoute();
    navigate(route, { replace: true });
  };

  // ── Link expirado ─────────────────────────────────────────────

  if (expired) {
    return (
      <div className="min-h-dvh bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-sm w-full">
          <div className="size-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-time-line text-red-500 text-2xl" aria-hidden="true"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-balance">Link inválido ou expirado</h2>
          <p className="text-gray-500 text-sm mb-6">
            O link de redefinição expirou (válido por 15 minutos) ou já foi utilizado.
            Solicite um novo.
          </p>
          <Link
            to="/esqueci-senha"
            className="inline-flex items-center gap-1.5 bg-[#065f46] hover:bg-[#054836] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            <i className="ri-mail-send-line text-sm" aria-hidden="true"></i>
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
      <div className="min-h-dvh bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line motion-safe:animate-spin text-gray-400 text-3xl block mb-3" role="status" aria-label="Verificando link de redefinição"></i>
          <p className="text-gray-500 text-sm">Verificando link de redefinição...</p>
        </div>
      </div>
    );
  }

  // ── Formulário de nova senha (+ modal de sucesso como overlay) ───────────

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <i className="ri-briefcase-line text-white text-xs" aria-hidden="true"></i>
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
            <div className="bg-gradient-to-r from-[#065f46] to-[#047857] px-6 py-6 text-center">
              <div className="size-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <i className="ri-lock-password-line text-white text-xl" aria-hidden="true"></i>
              </div>
              <h2 className="text-white font-bold text-lg text-balance">Criar nova senha</h2>
              <p className="text-white/70 text-xs mt-1">Defina uma senha forte e segura</p>
            </div>

            <div className="p-6">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
                <i className="ri-shield-check-line text-emerald-600 text-sm shrink-0 mt-0.5" aria-hidden="true"></i>
                <p className="text-emerald-800 text-xs leading-relaxed">
                  Ao redefinir sua senha, todas as sessões ativas serão encerradas.
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
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#065f46] transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                    >
                      <i className={`${showNew ? "ri-eye-off-line" : "ri-eye-line"} text-sm`} aria-hidden="true"></i>
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
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#065f46] transition-colors pr-10"
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
                      <i className="ri-check-line" aria-hidden="true"></i> Senhas coincidem
                    </p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex items-center gap-2">
                    <i className="ri-error-warning-line text-red-500 text-sm shrink-0" aria-hidden="true"></i>
                    <p className="text-red-600 text-xs">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#065f46] hover:bg-[#054836] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line motion-safe:animate-spin text-sm" role="status" aria-label="Salvando nova senha"></i>
                      Salvando...
                    </span>
                  ) : "Salvar nova senha"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal de sucesso (overlay) ── */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/60">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
            {/* Ícone de sucesso */}
            <div className="size-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <i className="ri-checkbox-circle-fill text-emerald-500 text-4xl" aria-hidden="true"></i>
            </div>

            {/* Título */}
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-balance">
              Sua senha foi atualizada com sucesso!
            </h2>

            {/* Subtítulo */}
            <p className="text-gray-500 text-sm mb-7 leading-relaxed">
              Use a nova senha para acessar a plataforma.
            </p>

            {/* Botão OK */}
            <button
              onClick={handleSuccessOk}
              className="w-full bg-emerald-600 hover:bg-emerald-700 motion-safe:active:scale-95 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
