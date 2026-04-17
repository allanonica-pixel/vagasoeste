import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_CREDS = {
  email: "vagas@email.com",
  password: "vagasoeste",
  redirect: "/admin",
};

export default function AcessoRestritoPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (blocked) return;

    setError("");
    setLoading(true);

    setTimeout(() => {
      if (email === ADMIN_CREDS.email && password === ADMIN_CREDS.password) {
        sessionStorage.setItem("vagasoeste_admin_auth", "true");
        navigate(ADMIN_CREDS.redirect);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= 5) {
          setBlocked(true);
          setError("Muitas tentativas incorretas. Tente novamente mais tarde.");
        } else {
          setError(`Credenciais inválidas. (${newAttempts}/5 tentativas)`);
        }
      }
      setLoading(false);
    }, 1000 + Math.random() * 500); // delay variável para dificultar brute force
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo minimalista — sem nome da empresa */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center">
            <i className="ri-shield-keyhole-line text-gray-400 text-xl"></i>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h1 className="text-sm font-semibold text-gray-300 mb-1">Acesso restrito</h1>
          <p className="text-xs text-gray-500 mb-6">Somente pessoal autorizado.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-300"
                >
                  <i className={`${showPassword ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-950 border border-red-900 rounded-lg px-4 py-3 flex items-center gap-2">
                <i className="ri-error-warning-line text-red-400 text-sm shrink-0"></i>
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || blocked}
              className="w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-200 font-semibold py-2.5 rounded-xl text-sm transition-all cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin text-sm"></i>
                  Verificando...
                </span>
              ) : blocked ? (
                "Acesso bloqueado"
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>

        {/* Sem link de volta, sem referência à empresa */}
        <p className="text-center text-xs text-gray-700 mt-6">
          Acesso monitorado e registrado.
        </p>
      </div>
    </div>
  );
}
