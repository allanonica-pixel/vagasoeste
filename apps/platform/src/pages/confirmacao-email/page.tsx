import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extrai o role do usuário autenticado (app_metadata tem prioridade). */
async function getUserRole(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  const u = data.session?.user;
  if (!u) return null;
  return (u.app_metadata?.role as string) || (u.user_metadata?.role as string) || null;
}

/** Rota do dashboard de acordo com o role. */
function dashboardRoute(role: string | null): string {
  if (role === "empresa") return "/empresa/dashboard";
  if (role === "admin")   return "/vo-painel";
  return "/plataforma"; // candidato (padrão)
}

// ─── Componente ───────────────────────────────────────────────────────────────

type Status = "loading" | "success" | "expired";

export default function ConfirmacaoEmailPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const doneRef = useRef(false);

  useEffect(() => {
    /**
     * O Supabase JS client processa automaticamente o hash da URL ao carregar
     * (fluxo implícito) ou troca o code por sessão (fluxo PKCE).
     * Escutamos onAuthStateChange + verificamos getSession() como fallback
     * para cobrir ambos os casos.
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session && !doneRef.current) {
        doneRef.current = true;
        setStatus("success");
      }
    });

    // Verifica sessão já existente (evento pode ter disparado antes da montagem)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && !doneRef.current) {
        doneRef.current = true;
        setStatus("success");
      }
    });

    // Fluxo PKCE: troca o `code` da query string por uma sessão
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code && !doneRef.current) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data.session && !doneRef.current) {
          doneRef.current = true;
          setStatus("success");
        }
      });
    }

    // Timeout — link expirado ou inválido
    const timer = setTimeout(() => {
      if (!doneRef.current) setStatus("expired");
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  /** Ao clicar em OK: detecta o role e navega para o dashboard correto. */
  const handleOk = async () => {
    const role = await getUserRole();
    navigate(dashboardRoute(role), { replace: true });
  };

  // ── Estado: carregando ────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center px-4">
        {/* role="status" anuncia o estado para leitores de tela */}
        <div
          role="status"
          aria-label="Validando seu cadastro"
          className="bg-white rounded-2xl p-8 max-w-xs w-full text-center shadow-xl"
        >
          {/* motion-safe: spinner só gira quando prefers-reduced-motion não está ativo */}
          <i
            className="ri-loader-4-line motion-safe:animate-spin text-emerald-500 text-4xl block mb-4"
            aria-hidden="true"
          ></i>
          <p className="text-gray-600 text-sm font-medium text-pretty">
            Validando seu cadastro...
          </p>
        </div>
      </div>
    );
  }

  // ── Estado: link expirado / inválido ──────────────────────────────────────
  if (status === "expired") {
    return (
      <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center px-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="expired-title"
          className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl"
        >
          <div className="size-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <i className="ri-time-line text-red-500 text-3xl" aria-hidden="true"></i>
          </div>
          <h2
            id="expired-title"
            className="text-xl font-bold text-gray-900 mb-2 text-balance"
          >
            Link inválido ou expirado
          </h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed text-pretty">
            O link de confirmação pode ter expirado ou já foi utilizado.
            Faça login ou solicite um novo cadastro.
          </p>
          <Link
            to="/login"
            className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition-colors text-center"
          >
            Ir para o Login
          </Link>
          <p className="mt-4">
            <Link
              to="/cadastro"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Criar nova conta
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Estado: sucesso — modal de confirmação ────────────────────────────────
  return (
    <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-title"
        className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl"
      >
        <div className="size-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <i
            className="ri-checkbox-circle-fill text-emerald-500 text-4xl"
            aria-hidden="true"
          ></i>
        </div>

        <h2
          id="success-title"
          className="text-xl font-bold text-gray-900 mb-2 text-balance"
        >
          Cadastro validado com Sucesso!
        </h2>

        <p className="text-gray-500 text-sm mb-7 leading-relaxed text-pretty">
          Sua conta está ativa. Bem-vindo(a) à VagasOeste!
        </p>

        <button
          onClick={handleOk}
          className="w-full bg-emerald-600 hover:bg-emerald-700 motion-safe:active:scale-95 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer"
        >
          OK
        </button>
      </div>
    </div>
  );
}
