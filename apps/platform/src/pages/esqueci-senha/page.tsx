import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Configuração
// ─────────────────────────────────────────────────────────────────────────────

const API_URL  = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000";
const BRAND_BG = "#065f46";

// Bloqueio client-side (localStorage) — email não cadastrado
const CLIENT_MAX_FAILS   = 10;        // 10 tentativas malsucedidas
const CLIENT_BLOCK_SECS  = 5 * 60;   // bloqueio de 5 minutos

// Aviso de tentativas restantes a partir deste ponto
const WARN_FROM = 5;

// localStorage keys
const LS_FAILS   = "vo_fp_fails";
const LS_BLOCKED = "vo_fp_blocked_until"; // timestamp ms

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de localStorage
// ─────────────────────────────────────────────────────────────────────────────

function lsGetFails(): number {
  try { return Math.max(0, parseInt(localStorage.getItem(LS_FAILS) ?? "0", 10) || 0); }
  catch { return 0; }
}

function lsSetFails(n: number) {
  try { localStorage.setItem(LS_FAILS, String(n)); } catch { /* noop */ }
}

function lsGetBlockedUntil(): number {
  try { return parseInt(localStorage.getItem(LS_BLOCKED) ?? "0", 10) || 0; }
  catch { return 0; }
}

function lsSetBlockedUntil(ts: number) {
  try { localStorage.setItem(LS_BLOCKED, String(ts)); } catch { /* noop */ }
}

function lsClearBlock() {
  try {
    localStorage.removeItem(LS_FAILS);
    localStorage.removeItem(LS_BLOCKED);
  } catch { /* noop */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatação de tempo
// ─────────────────────────────────────────────────────────────────────────────

/** MM:SS — usado no countdown principal */
function fmtMMSS(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Texto legível para outros avisos */
function fmtReadable(secs: number): string {
  if (secs >= 60) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}min${s > 0 ? ` ${s}s` : ""}`;
  }
  return `${secs}s`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export default function EsqueciSenhaPage() {
  const [email, setEmail]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent]             = useState(false);

  // Erros da API
  const [errorCode, setErrorCode] = useState<"" | "NOT_FOUND" | "SERVER_LIMIT" | "GENERIC">("");
  const [errorMsg, setErrorMsg]   = useState("");

  // Server-side rate limit countdown (429)
  const [serverCooldown, setServerCooldown] = useState(0);
  const serverTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Client-side bloqueio
  const [clientFails, setClientFails]     = useState(lsGetFails);
  const [clientCooldown, setClientCooldown] = useState(0); // segundos restantes
  const clientTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Inicialização: checa se já está bloqueado no localStorage ──────────────
  useEffect(() => {
    const blockedUntil = lsGetBlockedUntil();
    if (blockedUntil > Date.now()) {
      const remaining = Math.ceil((blockedUntil - Date.now()) / 1000);
      setClientCooldown(remaining);
    } else if (blockedUntil > 0) {
      // Bloqueio expirou enquanto estava fora — limpa
      lsClearBlock();
      setClientFails(0);
    }
  }, []);

  // ── Ticker: server cooldown ────────────────────────────────────────────────
  useEffect(() => {
    if (serverCooldown <= 0) return;
    serverTimerRef.current = setInterval(() => {
      setServerCooldown((s) => {
        if (s <= 1) {
          clearInterval(serverTimerRef.current!);
          if (errorCode === "SERVER_LIMIT") { setErrorCode(""); setErrorMsg(""); }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(serverTimerRef.current!);
  }, [serverCooldown]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Ticker: client cooldown ────────────────────────────────────────────────
  useEffect(() => {
    if (clientCooldown <= 0) return;
    clientTimerRef.current = setInterval(() => {
      setClientCooldown((s) => {
        if (s <= 1) {
          clearInterval(clientTimerRef.current!);
          lsClearBlock();
          setClientFails(0);
          setErrorCode("");
          setErrorMsg("");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(clientTimerRef.current!);
  }, [clientCooldown]);

  // ── Registra uma falha de "email não encontrado" ───────────────────────────
  const registerNotFoundFail = useCallback(() => {
    const newFails = lsGetFails() + 1;
    lsSetFails(newFails);
    setClientFails(newFails);

    if (newFails >= CLIENT_MAX_FAILS) {
      // Inicia bloqueio de 5 minutos
      const blockedUntil = Date.now() + CLIENT_BLOCK_SECS * 1000;
      lsSetBlockedUntil(blockedUntil);
      setClientCooldown(CLIENT_BLOCK_SECS);
      setErrorCode("");
      setErrorMsg("");
    }
  }, []);

  // ── Derivadas ────────────────────────────────────────────────────────────
  const isClientBlocked = clientCooldown > 0;
  const isServerBlocked = serverCooldown > 0;
  const isBlocked       = isClientBlocked || isServerBlocked;
  const remaining       = CLIENT_MAX_FAILS - clientFails; // tentativas restantes
  const showAttemptsWarn = !isClientBlocked && clientFails >= WARN_FROM && clientFails < CLIENT_MAX_FAILS;

  // progresso do bloqueio: 0 → 1 (de 5 min para 0)
  const blockProgress = isClientBlocked
    ? (CLIENT_BLOCK_SECS - clientCooldown) / CLIENT_BLOCK_SECS
    : 0;

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || isBlocked) return;

    setErrorCode("");
    setErrorMsg("");
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/v1/auth/forgot-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (res.ok) {
        // Sucesso — limpa contadores do localStorage
        lsClearBlock();
        setSent(true);
        return;
      }

      const body = await res.json().catch(() => ({})) as {
        error?: string;
        message?: string;
        retryAfter?: number;
      };

      if (res.status === 404) {
        setErrorCode("NOT_FOUND");
        setErrorMsg("Email não cadastrado. Verifique o endereço digitado.");
        registerNotFoundFail();
        return;
      }

      if (res.status === 429) {
        const secs = body.retryAfter ?? 900;
        setErrorCode("SERVER_LIMIT");
        setErrorMsg(`Muitas tentativas. Aguarde ${fmtReadable(secs)} antes de tentar novamente.`);
        setServerCooldown(secs);
        return;
      }

      setErrorCode("GENERIC");
      setErrorMsg(body.message ?? "Erro ao processar solicitação. Tente novamente em instantes.");
    } catch {
      setErrorCode("GENERIC");
      setErrorMsg("Sem conexão com o servidor. Verifique sua internet e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: BRAND_BG }}>
              <i className="ri-briefcase-line text-white text-xs" aria-hidden="true"></i>
            </div>
            <span className="font-bold text-base text-gray-900">
              Vagas<span style={{ color: BRAND_BG }}>Oeste</span>
            </span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {sent ? (
            /* ════════════════════════════════════════════════════════════════
               Tela de sucesso
            ════════════════════════════════════════════════════════════════ */
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="size-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#d1fae5" }}>
                <i className="ri-mail-check-line text-2xl" aria-hidden="true" style={{ color: BRAND_BG }}></i>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 text-balance">Email enviado!</h2>
              <p className="text-gray-600 text-sm mb-1">
                Se o endereço abaixo estiver cadastrado, você receberá o link:
              </p>
              <p className="font-semibold text-gray-900 text-sm mb-5">{email}</p>

              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6 text-left">
                <div className="flex items-start gap-2">
                  <i className="ri-shield-check-line text-amber-500 text-sm shrink-0 mt-0.5" aria-hidden="true"></i>
                  <div className="text-xs text-amber-700 space-y-1">
                    <p>• O link enviado é temporário</p>
                    <p>• A senha atual será invalidada ao redefinir</p>
                    <p>• Verifique também a pasta de spam</p>
                  </div>
                </div>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold hover:opacity-80 transition-opacity"
                style={{ color: BRAND_BG }}
              >
                <i className="ri-arrow-left-line text-xs" aria-hidden="true"></i>
                Voltar ao login
              </Link>
            </div>

          ) : isClientBlocked ? (
            /* ════════════════════════════════════════════════════════════════
               Tela de bloqueio client-side — 10 tentativas esgotadas
            ════════════════════════════════════════════════════════════════ */
            <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">

              {/* Header vermelho */}
              <div className="px-6 py-6 text-center bg-red-600">
                <div className="size-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <i className="ri-lock-2-line text-white text-2xl" aria-hidden="true"></i>
                </div>
                <h2 className="text-white font-bold text-lg text-balance">Acesso temporariamente bloqueado</h2>
                <p className="text-red-100 text-xs mt-1">Limite de tentativas atingido</p>
              </div>

              <div className="p-6 text-center">
                <p className="text-gray-600 text-sm mb-6">
                  Você realizou <strong>{CLIENT_MAX_FAILS} tentativas</strong> com emails não cadastrados.
                  Por segurança, o acesso foi bloqueado temporariamente.
                </p>

                {/* Contador regressivo grande */}
                <div className="mb-6">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Liberação em</p>
                  <div
                    className="text-5xl font-black tabular-nums tracking-tight mb-3"
                    style={{ color: BRAND_BG }}
                  >
                    {fmtMMSS(clientCooldown)}
                  </div>

                  {/* Barra de progresso */}
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-1000 ease-linear"
                      style={{
                        width: `${blockProgress * 100}%`,
                        backgroundColor: BRAND_BG,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {Math.round(blockProgress * 100)}% concluído
                  </p>
                </div>

                {/* Dica */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-5 text-left">
                  <div className="flex items-start gap-2">
                    <i className="ri-information-line text-amber-500 text-sm shrink-0 mt-0.5" aria-hidden="true"></i>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Verifique se o email digitado está correto. Após o desbloqueio, você terá mais tentativas disponíveis.
                    </p>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold hover:opacity-80 transition-opacity"
                  style={{ color: BRAND_BG }}
                >
                  <i className="ri-arrow-left-line text-xs" aria-hidden="true"></i>
                  Voltar ao login
                </Link>
              </div>
            </div>

          ) : (
            /* ════════════════════════════════════════════════════════════════
               Formulário normal
            ════════════════════════════════════════════════════════════════ */
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

              {/* Cabeçalho */}
              <div className="px-6 py-6 text-center" style={{ backgroundColor: BRAND_BG }}>
                <div className="size-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <i className="ri-mail-send-line text-white text-xl" aria-hidden="true"></i>
                </div>
                <h2 className="text-white font-bold text-lg text-balance">Esqueceu a senha?</h2>
                <p className="text-white/70 text-xs mt-1">Enviaremos um link seguro de redefinição</p>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                  {/* Campo de email */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Email Cadastrado
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorCode !== "SERVER_LIMIT") {
                          setErrorCode("");
                          setErrorMsg("");
                        }
                      }}
                      placeholder="seu@email.com"
                      aria-label="Email cadastrado"
                      required
                      autoFocus
                      disabled={isBlocked}
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        errorCode === "NOT_FOUND"
                          ? "border-red-400 bg-red-50 focus:border-red-500"
                          : "border-gray-200 focus:border-[#065f46]"
                      }`}
                    />
                  </div>

                  {/* Aviso de tentativas restantes */}
                  {showAttemptsWarn && !errorMsg && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                      <i className="ri-alarm-warning-line text-amber-500 text-sm shrink-0" aria-hidden="true"></i>
                      <p className="text-xs text-amber-700 font-medium">
                        {remaining === 1
                          ? "Última tentativa disponível antes do bloqueio."
                          : `Restam ${remaining} tentativas antes do bloqueio temporário.`}
                      </p>
                    </div>
                  )}

                  {/* Feedback de erro da API */}
                  {errorMsg && (
                    <div
                      className={`flex items-start gap-2 rounded-lg px-4 py-3 ${
                        errorCode === "SERVER_LIMIT"
                          ? "bg-orange-50 border border-orange-200"
                          : "bg-red-50 border border-red-100"
                      }`}
                    >
                      <i
                        className={`text-sm shrink-0 mt-0.5 ${
                          errorCode === "SERVER_LIMIT"
                            ? "ri-time-line text-orange-500"
                            : "ri-error-warning-line text-red-500"
                        }`}
                        aria-hidden="true"
                      ></i>
                      <div className="flex-1">
                        <p
                          className={`text-xs font-medium ${
                            errorCode === "SERVER_LIMIT" ? "text-orange-700" : "text-red-600"
                          }`}
                        >
                          {errorMsg}
                        </p>
                        {serverCooldown > 0 && (
                          <p className="text-xs text-orange-600 mt-1 font-bold tabular-nums">
                            {fmtMMSS(serverCooldown)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Botão */}
                  <button
                    type="submit"
                    disabled={submitting || isBlocked}
                    className="w-full disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer"
                    style={{ backgroundColor: BRAND_BG }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled)
                        e.currentTarget.style.backgroundColor = "#054836";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = BRAND_BG;
                    }}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <i className="ri-loader-4-line motion-safe:animate-spin text-sm" role="status" aria-label="Verificando"></i>
                        Verificando…
                      </span>
                    ) : serverCooldown > 0 ? (
                      <span className="flex items-center justify-center gap-2">
                        <i className="ri-time-line text-sm" aria-hidden="true"></i>
                        Aguarde {fmtMMSS(serverCooldown)}
                      </span>
                    ) : (
                      "Enviar Link"
                    )}
                  </button>
                </form>

                {/* Rodapé */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 text-center leading-relaxed">
                    Acesse seu email e clique no link para redefinir sua senha
                  </p>
                </div>

                <p className="text-center mt-4">
                  <Link
                    to="/login"
                    className="text-xs font-semibold hover:opacity-80 transition-opacity flex items-center justify-center gap-1"
                    style={{ color: BRAND_BG }}
                  >
                    <i className="ri-arrow-left-line text-xs" aria-hidden="true"></i>
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
