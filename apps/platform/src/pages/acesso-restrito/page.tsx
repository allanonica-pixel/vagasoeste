import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// ──────────────────────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────────────────────

type AuthStep =
  | "credentials"   // email + senha
  | "enroll"        // primeiro acesso — escanear QR code
  | "verify";       // fator já cadastrado — digitar código TOTP

// ──────────────────────────────────────────────────────────────
// Componente
// ──────────────────────────────────────────────────────────────

export default function AcessoRestritoPage() {
  const navigate = useNavigate();
  const { user, role, loading, signIn } = useAuth();

  // ── Etapa atual ────────────────────────────────────────────
  const [step, setStep] = useState<AuthStep>("credentials");

  // ── Estado: credenciais ────────────────────────────────────
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts]     = useState(0);
  const [blocked, setBlocked]       = useState(false);

  // ── Estado: MFA ────────────────────────────────────────────
  const [totpCode, setTotpCode]     = useState("");
  const [factorId, setFactorId]     = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [qrSvg, setQrSvg]           = useState("");    // enroll: SVG do QR code
  const [secret, setSecret]         = useState("");    // enroll: chave manual
  const [enrollFactorId, setEnrollFactorId] = useState("");

  // ── Estado: feedback ───────────────────────────────────────
  const [error, setError]           = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Já autenticado como admin com aal2 → vai direto ao painel
  useEffect(() => {
    if (!loading && user && role === "admin") {
      supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => {
        if (data?.currentLevel === "aal2") {
          navigate("/vo-painel", { replace: true });
        }
      });
    }
  }, [user, role, loading, navigate]);

  // ──────────────────────────────────────────────────────────
  // PASSO 1 — Login com email + senha
  // ──────────────────────────────────────────────────────────

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blocked) return;
    setError("");
    setSubmitting(true);

    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

    const { error: authError, role: signedRole } = await signIn(email, password);

    if (authError || signedRole !== "admin") {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 5) {
        setBlocked(true);
        setError("Muitas tentativas incorretas. Tente novamente mais tarde.");
      } else {
        setError(`Credenciais inválidas. (${next}/5 tentativas)`);
      }
      setSubmitting(false);
      return;
    }

    // Verifica fatores TOTP cadastrados
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const verifiedFactor = factors?.totp?.find((f) => f.status === "verified");

    if (verifiedFactor) {
      // Já tem fator → criar challenge e pedir código
      setFactorId(verifiedFactor.id);
      const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({
        factorId: verifiedFactor.id,
      });
      if (challengeErr || !challenge) {
        setError("Erro ao iniciar desafio MFA. Tente novamente.");
        setSubmitting(false);
        return;
      }
      setChallengeId(challenge.id);
      setStep("verify");
    } else {
      // Primeiro acesso — iniciar enrollment
      const { data: enroll, error: enrollErr } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "VagasOeste Admin",
      });
      if (enrollErr || !enroll) {
        setError("Erro ao gerar QR code MFA. Tente novamente.");
        setSubmitting(false);
        return;
      }
      setEnrollFactorId(enroll.id);
      setSecret(enroll.totp.secret);

      // Reconstrói o URI com issuer customizado e gera novo QR code
      const customUri =
        `otpauth://totp/VagasOeste%3AAdmin` +
        `?secret=${enroll.totp.secret}` +
        `&issuer=VagasOeste`;
      const qrDataUrl = await QRCode.toDataURL(customUri, { width: 192, margin: 1 });
      setQrSvg(qrDataUrl);

      setStep("enroll");
    }

    setSubmitting(false);
  };

  // ──────────────────────────────────────────────────────────
  // PASSO 2A — Confirmar enrollment (primeiro acesso)
  // ──────────────────────────────────────────────────────────

  const handleEnroll = async (e: React.FormEvent) => {
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
      setError("Código incorreto. Verifique o app autenticador e tente novamente.");
      setTotpCode("");
      setSubmitting(false);
      return;
    }

    navigate("/vo-painel", { replace: true });
  };

  // ──────────────────────────────────────────────────────────
  // PASSO 2B — Verificar código TOTP (acessos subsequentes)
  // ──────────────────────────────────────────────────────────

  const handleVerify = async (e: React.FormEvent) => {
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

    navigate("/vo-painel", { replace: true });
  };

  // ──────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-dvh bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo minimalista */}
        <div className="flex justify-center mb-8">
          <div className="size-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center">
            <i className={`${step === "credentials" ? "ri-shield-keyhole-line" : "ri-smartphone-line"} text-gray-400 text-xl`} aria-hidden="true"></i>
          </div>
        </div>

        {/* ── STEP: Credenciais ────────────────────────────── */}
        {step === "credentials" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h1 className="text-sm font-semibold text-gray-300 mb-1">Acesso restrito</h1>
            <p className="text-xs text-gray-500 mb-6">Somente pessoal autorizado.</p>

            <form onSubmit={handleCredentials} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                  disabled={blocked}
                  autoComplete="off"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-gray-500 transition-colors placeholder-gray-600 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={blocked}
                    autoComplete="current-password"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-gray-500 transition-colors pr-10 placeholder-gray-600 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-300"
                  >
                    <i className={`${showPassword ? "ri-eye-off-line" : "ri-eye-line"} text-sm`} aria-hidden="true"></i>
                  </button>
                </div>
              </div>

              {error && <ErrorBox message={error} />}

              <SubmitButton loading={submitting} blocked={blocked} label="Continuar" loadingLabel="Verificando..." />
            </form>
          </div>
        )}

        {/* ── STEP: Enrollment (primeiro acesso) ───────────── */}
        {step === "enroll" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h1 className="text-sm font-semibold text-gray-300 mb-1">Configurar autenticador</h1>
            <p className="text-xs text-gray-500 mb-5">
              Escaneie o QR code com Google Authenticator, Authy ou similar. Faça isso uma única vez.
            </p>

            {/* QR Code */}
            {qrSvg && (
              <div className="bg-white rounded-xl p-3 mb-4 flex items-center justify-center">
                <img
                  src={qrSvg}
                  alt="QR code para autenticador"
                  className="w-48 h-48"
                />
              </div>
            )}

            {/* Chave manual */}
            {secret && (
              <div className="bg-gray-800 rounded-lg px-3 py-2.5 mb-5">
                <p className="text-xs text-gray-500 mb-1">Ou insira a chave manualmente:</p>
                <p className="text-xs font-mono text-gray-300 break-all select-all">{secret}</p>
              </div>
            )}

            <form onSubmit={handleEnroll} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">
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
                  autoComplete="one-time-code"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-gray-500 transition-colors text-center tracking-widest font-mono placeholder-gray-600"
                />
              </div>

              {error && <ErrorBox message={error} />}

              <SubmitButton loading={submitting} blocked={false} label="Ativar autenticador" loadingLabel="Verificando..." />
            </form>
          </div>
        )}

        {/* ── STEP: Verify (acessos normais) ───────────────── */}
        {step === "verify" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h1 className="text-sm font-semibold text-gray-300 mb-1">Verificação em duas etapas</h1>
            <p className="text-xs text-gray-500 mb-6">
              Abra o app autenticador e insira o código de 6 dígitos.
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Código TOTP</label>
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
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-gray-500 transition-colors text-center tracking-widest font-mono placeholder-gray-600"
                />
                <p className="text-xs text-gray-600 mt-1.5 text-center">
                  O código muda a cada 30 segundos
                </p>
              </div>

              {error && <ErrorBox message={error} />}

              <SubmitButton loading={submitting} blocked={false} label="Verificar" loadingLabel="Verificando..." />
            </form>

            <button
              type="button"
              onClick={() => { setStep("credentials"); setTotpCode(""); setError(""); }}
              className="mt-4 w-full text-center text-xs text-gray-600 hover:text-gray-400 cursor-pointer transition-colors"
            >
              ← Usar outra conta
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-700 mt-6">
          Acesso monitorado e registrado.
        </p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Sub-componentes locais
// ──────────────────────────────────────────────────────────────

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-950 border border-red-900 rounded-lg px-4 py-3 flex items-center gap-2">
      <i className="ri-error-warning-line text-red-400 text-sm shrink-0" aria-hidden="true"></i>
      <p className="text-red-400 text-xs">{message}</p>
    </div>
  );
}

function SubmitButton({
  loading,
  blocked,
  label,
  loadingLabel,
}: {
  loading: boolean;
  blocked: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading || blocked}
      className="w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-200 font-semibold py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <i className="ri-loader-4-line motion-safe:animate-spin text-sm" aria-hidden="true"></i>
          {loadingLabel}
        </span>
      ) : blocked ? (
        "Acesso bloqueado"
      ) : (
        label
      )}
    </button>
  );
}
