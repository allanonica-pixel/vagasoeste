import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import QRCode from "qrcode";
import AnimatedSection from "@/components/base/AnimatedSection";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// ──────────────────────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────────────────────

type UserType = "candidato" | "empresa";
type LoginStep = "credentials" | "change-password" | "enroll-mfa" | "verify-mfa";

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, user, role, loading } = useAuth();

  const [userType, setUserType] = useState<UserType>("candidato");
  const [step, setStep] = useState<LoginStep>("credentials");
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Fechar modal de cadastro com Escape
  useEffect(() => {
    if (!showRegisterModal) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setShowRegisterModal(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showRegisterModal]);

  // ── Credenciais ──────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);

  // ── Troca de senha ───────────────────────────────────────────
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // ── MFA ──────────────────────────────────────────────────────
  const [totpCode, setTotpCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [enrollFactorId, setEnrollFactorId] = useState("");

  // ── Destino pós-MFA (candidato ou empresa) ───────────────────
  const [mfaDestination, setMfaDestination] = useState("/empresa/dashboard");

  // ── UI ───────────────────────────────────────────────────────
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const initialized = useRef(false);

  // ── Helpers MFA ──────────────────────────────────────────────

  const startEnrollment = useCallback(async () => {
    const { data: enroll, error: enrollErr } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "VagasOeste Empresas",
    });
    if (enrollErr || !enroll) {
      setError("Erro ao configurar autenticador. Tente novamente.");
      return;
    }
    setEnrollFactorId(enroll.id);
    setSecret(enroll.totp.secret);
    const customUri = `otpauth://totp/VagasOeste%3AEmpresas?secret=${enroll.totp.secret}&issuer=VagasOeste`;
    const qr = await QRCode.toDataURL(customUri, { width: 192, margin: 1 });
    setQrDataUrl(qr);
    setStep("enroll-mfa");
  }, []);

  const goToMfaStep = useCallback(async () => {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const verifiedFactor = factors?.totp?.find((f) => f.status === "verified");

    if (verifiedFactor) {
      setFactorId(verifiedFactor.id);
      const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({
        factorId: verifiedFactor.id,
      });
      if (challengeErr || !challenge) {
        setError("Erro ao iniciar verificação MFA. Tente novamente.");
        return;
      }
      setChallengeId(challenge.id);
      setStep("verify-mfa");
    } else {
      await startEnrollment();
    }
  }, [startEnrollment]);

  // ── Verifica sessão já ativa no carregamento ──────────────────

  useEffect(() => {
    if (loading || initialized.current) return;
    initialized.current = true;
    if (!user || !role) return;

    if (role === "candidato") {
      const redirect = searchParams.get("redirect");
      navigate(redirect ? decodeURIComponent(redirect) : "/plataforma", { replace: true });
      return;
    }

    if (role === "empresa") {
      setUserType("empresa");
      supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(async ({ data }) => {
        if (data?.currentLevel === "aal2") {
          const redirect = searchParams.get("redirect");
          navigate(redirect ? decodeURIComponent(redirect) : "/empresa/dashboard", { replace: true });
        } else {
          // AAL1 → ir direto para o passo MFA (sem re-solicitar senha)
          await goToMfaStep();
        }
      });
    }
  }, [loading, user, role, navigate, searchParams, goToMfaStep]);

  // ──────────────────────────────────────────────────────────────
  // PASSO 1 — Credenciais
  // ──────────────────────────────────────────────────────────────

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blocked) return;
    setError("");
    setSubmitting(true);

    // Jitter anti-timing
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));

    const { error: authError, role: signedRole } = await signIn(email, password);

    if (authError || !signedRole) {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 5) {
        setBlocked(true);
        setError("Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.");
      } else {
        setError(`Email ou senha incorretos. (${next}/5 tentativas)`);
      }
      setSubmitting(false);
      return;
    }

    // Role incompatível com o tipo selecionado
    if (signedRole !== userType) {
      setError(
        userType === "candidato"
          ? "Esta conta é de empresa. Selecione 'Empresa' para entrar."
          : "Esta conta é de candidato. Selecione 'Candidato' para entrar."
      );
      await supabase.auth.signOut();
      setSubmitting(false);
      return;
    }

    // Candidato → verificar MFA opcional, depois redirecionar
    if (signedRole === "candidato") {
      const redirect = searchParams.get("redirect");
      const destination = redirect ? decodeURIComponent(redirect) : "/plataforma";

      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verifiedFactor = factors?.totp?.find((f) => f.status === "verified");

      if (verifiedFactor) {
        // Tem 2FA ativo → exige verificação
        setFactorId(verifiedFactor.id);
        const { data: challenge } = await supabase.auth.mfa.challenge({
          factorId: verifiedFactor.id,
        });
        if (challenge) {
          setChallengeId(challenge.id);
          setMfaDestination(destination);
          setSubmitting(false);
          setStep("verify-mfa");
          return;
        }
      }

      navigate(destination, { replace: true });
      return;
    }

    // Empresa → definir destino pós-MFA e verificar primeiro acesso
    const redirect = searchParams.get("redirect");
    setMfaDestination(redirect ? decodeURIComponent(redirect) : "/empresa/dashboard");

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const isFirstAccess = currentUser?.user_metadata?.first_access === true;

    if (isFirstAccess) {
      setSubmitting(false);
      setStep("change-password");
      return;
    }

    await goToMfaStep();
    setSubmitting(false);
  };

  // ──────────────────────────────────────────────────────────────
  // PASSO 2 — Troca de senha provisória
  // ──────────────────────────────────────────────────────────────

  const handleChangePassword = async (e: React.FormEvent) => {
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
      data: { first_access: false },
    });

    if (updateErr) {
      setError("Erro ao salvar nova senha. Tente novamente.");
      setSubmitting(false);
      return;
    }

    await goToMfaStep();
    setSubmitting(false);
  };

  // ──────────────────────────────────────────────────────────────
  // PASSO 3A — Confirmar enrollment MFA (primeiro acesso)
  // ──────────────────────────────────────────────────────────────

  const handleEnrollMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({
      factorId: enrollFactorId,
    });
    if (challengeErr || !challenge) {
      setError("Erro ao criar desafio. Tente novamente.");
      setSubmitting(false);
      return;
    }

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId: enrollFactorId,
      challengeId: challenge.id,
      code: totpCode.replace(/\s/g, ""),
    });

    if (verifyErr) {
      setError("Código incorreto. Verifique o app e tente novamente.");
      setTotpCode("");
      setSubmitting(false);
      return;
    }

    navigate("/empresa/dashboard", { replace: true });
  };

  // ──────────────────────────────────────────────────────────────
  // PASSO 3B — Verificar código TOTP (acessos subsequentes)
  // ──────────────────────────────────────────────────────────────

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: totpCode.replace(/\s/g, ""),
    });

    if (verifyErr) {
      setError("Código incorreto ou expirado. Aguarde o próximo código e tente novamente.");
      setTotpCode("");
      setSubmitting(false);
      return;
    }

    navigate(mfaDestination, { replace: true });
  };

  const pwdStrength = getStrength(newPassword);

  // ── Loading inicial ──────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-gray-400 text-3xl"></i>
      </div>
    );
  }

  const isEmpresaFlow = userType === "empresa" && step !== "credentials";

  // ──────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Modal de seleção de tipo de cadastro */}
      {showRegisterModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowRegisterModal(false)}
          />

          {/* Painel */}
          <div
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fechar */}
            <button
              type="button"
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <i className="ri-close-line text-xl" />
            </button>

            <h2 id="register-modal-title" className="text-lg font-bold text-gray-900 mb-1">
              Criar conta
            </h2>
            <p className="text-sm text-gray-500 mb-6">Como você quer se cadastrar?</p>

            <div className="flex flex-col gap-3">
              {/* Candidato → rota interna */}
              <button
                type="button"
                onClick={() => { setShowRegisterModal(false); navigate("/cadastro"); }}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition-colors group text-left w-full cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center shrink-0 transition-colors">
                  <i className="ri-user-search-line text-emerald-600 text-xl" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Cadastro como Candidato a Vaga</p>
                  <p className="text-xs text-gray-500 mt-0.5">Crie seu perfil e candidate-se às vagas</p>
                </div>
                <i className="ri-arrow-right-line text-emerald-500 shrink-0" />
              </button>

              {/* Empresa → site externo */}
              <a
                href="https://santarem.app/interesse-empresa"
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center shrink-0 transition-colors">
                  <i className="ri-building-2-line text-gray-600 text-xl" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 text-sm">Cadastro de sua Empresa</p>
                  <p className="text-xs text-gray-500 mt-0.5">Publique vagas e contrate talentos</p>
                </div>
                <i className="ri-arrow-right-line text-gray-400 shrink-0" />
              </a>
            </div>
          </div>
        </div>
      )}

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
          {!isEmpresaFlow && (
            <div className="ml-auto flex items-center gap-4">
              <Link to="/vagas" className="text-xs text-gray-500 hover:text-gray-700">
                Ver vagas
              </Link>
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                Criar conta
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <AnimatedSection variant="fade-up">

            {/* ── STEP: Credenciais ────────────────────────────── */}
            {step === "credentials" && (
              <>
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 rounded-2xl ${userType === "candidato" ? "bg-emerald-600" : "bg-sky-600"} flex items-center justify-center mx-auto mb-4 transition-colors duration-300`}>
                    <i className={`${userType === "candidato" ? "ri-user-line" : "ri-building-line"} text-white text-2xl`}></i>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h1>
                  <p className="text-gray-600 text-sm mt-1">Acesse sua conta VagasOeste</p>
                </div>

                {/* Seletor de tipo */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
                  {(["candidato", "empresa"] as UserType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setUserType(type);
                        setEmail(""); setPassword(""); setError("");
                        setAttempts(0); setBlocked(false);
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        userType === type ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <i className={`${type === "candidato" ? "ri-user-line" : "ri-building-line"} text-xs`}></i>
                      {type === "candidato" ? "Candidato" : "Empresa"}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 mb-4">
                  <i className="ri-arrow-right-circle-line text-gray-400 text-sm shrink-0"></i>
                  <p className="text-xs text-gray-500">
                    {userType === "candidato"
                      ? "Você será redirecionado para a plataforma do candidato"
                      : "Você será redirecionado para o painel da empresa"}
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <form onSubmit={handleCredentials} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                        disabled={blocked}
                        autoComplete="email"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-sky-400 focus:border-emerald-400 transition-colors disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-gray-700">Senha</label>
                        <Link
                          to="/esqueci-senha"
                          className={`text-xs hover:underline ${userType === "empresa" ? "text-sky-600 hover:text-sky-700" : "text-emerald-600 hover:text-emerald-700"}`}
                        >
                          Esqueci minha senha
                        </Link>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          disabled={blocked}
                          autoComplete="current-password"
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 transition-colors pr-10 disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                        >
                          <i className={`${showPassword ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
                        </button>
                      </div>
                    </div>

                    {error && <ErrorBox message={error} />}

                    <button
                      type="submit"
                      disabled={submitting || blocked}
                      className={`w-full ${userType === "candidato" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-sky-600 hover:bg-sky-700"} disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-all cursor-pointer`}
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <i className="ri-loader-4-line animate-spin text-sm"></i>
                          Verificando...
                        </span>
                      ) : blocked ? "Acesso temporariamente bloqueado" : (
                        <span className="flex items-center justify-center gap-2">
                          <i className={`${userType === "candidato" ? "ri-user-line" : "ri-building-line"} text-sm`}></i>
                          Entrar como {userType === "candidato" ? "Candidato" : "Empresa"}
                        </span>
                      )}
                    </button>
                  </form>
                </div>

                {userType === "candidato" && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Não tem conta?{" "}
                    <button
                      type="button"
                      onClick={() => setShowRegisterModal(true)}
                      className="text-emerald-600 font-semibold hover:underline cursor-pointer"
                    >
                      Cadastre-se grátis
                    </button>
                  </p>
                )}

                {userType === "empresa" && (
                  <p className="text-center text-xs text-gray-400 mt-4">
                    Problemas no acesso? Entre em contato com o suporte VagasOeste.
                  </p>
                )}
              </>
            )}

            {/* ── STEP: Trocar senha provisória ─────────────────── */}
            {step === "change-password" && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-sky-600 to-sky-500 px-6 py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                    <i className="ri-lock-password-line text-white text-xl"></i>
                  </div>
                  <h2 className="text-white font-bold text-lg">Crie sua senha permanente</h2>
                  <p className="text-sky-100 text-xs mt-1">Passo 1 de 2 — Segurança da conta</p>
                </div>

                <div className="p-6">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
                    <i className="ri-information-line text-amber-500 text-sm shrink-0 mt-0.5"></i>
                    <p className="text-amber-700 text-xs leading-relaxed">
                      Este é seu primeiro acesso. Defina uma senha pessoal e segura para continuar. A senha provisória será invalidada.
                    </p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nova senha</label>
                      <div className="relative">
                        <input
                          type={showNewPwd ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Mínimo 8 caracteres"
                          required
                          autoFocus
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-sky-400 transition-colors pr-10"
                        />
                        <button type="button" onClick={() => setShowNewPwd(!showNewPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600">
                          <i className={`${showNewPwd ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
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
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirmar senha</label>
                      <div className="relative">
                        <input
                          type={showConfirmPwd ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repita a nova senha"
                          required
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-sky-400 transition-colors pr-10"
                        />
                        <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600">
                          <i className={`${showConfirmPwd ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
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

                    {error && <ErrorBox message={error} />}

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
                      ) : "Salvar senha e continuar →"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ── STEP: Configurar MFA (primeiro acesso) ───────── */}
            {step === "enroll-mfa" && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-sky-600 to-sky-500 px-6 py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                    <i className="ri-smartphone-line text-white text-xl"></i>
                  </div>
                  <h2 className="text-white font-bold text-lg">Configure o autenticador</h2>
                  <p className="text-sky-100 text-xs mt-1">Passo 2 de 2 — Verificação em 2 etapas</p>
                </div>

                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Escaneie o QR code com <strong>Google Authenticator</strong> ou <strong>Authy</strong>. Faça isso uma única vez.
                  </p>

                  {qrDataUrl && (
                    <div className="bg-white border border-gray-100 rounded-xl p-3 mb-4 flex items-center justify-center">
                      <img src={qrDataUrl} alt="QR code para autenticador" className="w-48 h-48" />
                    </div>
                  )}

                  {secret && (
                    <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 mb-5">
                      <p className="text-xs text-gray-400 mb-1">Ou insira a chave manualmente:</p>
                      <p className="text-xs font-mono text-gray-700 break-all select-all">{secret}</p>
                    </div>
                  )}

                  <form onSubmit={handleEnrollMfa} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Código de 6 dígitos do app
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9 ]{6,7}"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value)}
                        placeholder="000 000"
                        maxLength={7}
                        required
                        autoFocus
                        autoComplete="one-time-code"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-sky-400 transition-colors text-center tracking-widest font-mono"
                      />
                      <p className="text-xs text-gray-400 mt-1 text-center">O código muda a cada 30 segundos</p>
                    </div>

                    {error && <ErrorBox message={error} />}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-all cursor-pointer"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <i className="ri-loader-4-line animate-spin text-sm"></i>
                          Verificando...
                        </span>
                      ) : "Ativar e acessar o painel →"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ── STEP: Verificar TOTP (acessos normais) ───────── */}
            {step === "verify-mfa" && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-sky-600 to-sky-500 px-6 py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                    <i className="ri-shield-check-line text-white text-xl"></i>
                  </div>
                  <h2 className="text-white font-bold text-lg">Verificação em 2 etapas</h2>
                  <p className="text-sky-100 text-xs mt-1">Autenticação adicional requerida</p>
                </div>

                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-5">
                    Abra o <strong>Google Authenticator</strong> e insira o código de{" "}
                    <strong>{userType === "empresa" ? "VagasOeste: Empresas" : "VagasOeste: Candidato"}</strong>.
                  </p>

                  <form onSubmit={handleVerifyMfa} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Código TOTP</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9 ]{6,7}"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value)}
                        placeholder="000 000"
                        maxLength={7}
                        required
                        autoFocus
                        autoComplete="one-time-code"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-sky-400 transition-colors text-center tracking-widest font-mono"
                      />
                      <p className="text-xs text-gray-400 mt-1.5 text-center">
                        O código muda a cada 30 segundos
                      </p>
                    </div>

                    {error && <ErrorBox message={error} />}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-all cursor-pointer"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <i className="ri-loader-4-line animate-spin text-sm"></i>
                          Verificando...
                        </span>
                      ) : "Verificar e acessar →"}
                    </button>
                  </form>

                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setStep("credentials");
                      setTotpCode("");
                      setError("");
                    }}
                    className="mt-4 w-full text-center text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                  >
                    ← Usar outra conta
                  </button>
                </div>
              </div>
            )}

          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Sub-componentes
// ──────────────────────────────────────────────────────────────

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex items-center gap-2">
      <i className="ri-error-warning-line text-red-500 text-sm shrink-0"></i>
      <p className="text-red-600 text-xs">{message}</p>
    </div>
  );
}
