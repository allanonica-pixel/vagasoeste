import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AnimatedSection from "@/components/base/AnimatedSection";

type UserType = "candidato" | "empresa" | "admin";

const DEMO_CREDENTIALS: Record<UserType, { email: string; password: string; redirect: string }> = {
  candidato: { email: "candidato@email.com", password: "vagasoeste", redirect: "/plataforma" },
  empresa: { email: "empresa@email.com", password: "vagasoeste", redirect: "/empresa/dashboard" },
  admin: { email: "vagas@email.com", password: "vagasoeste", redirect: "/admin" },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType>("candidato");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const creds = DEMO_CREDENTIALS[userType];
      if (email === creds.email && password === creds.password) {
        navigate(creds.redirect);
      } else {
        setError("Email ou senha incorretos. Verifique suas credenciais.");
      }
      setLoading(false);
    }, 800);
  };

  const fillDemo = () => {
    const creds = DEMO_CREDENTIALS[userType];
    setEmail(creds.email);
    setPassword(creds.password);
    setError("");
  };

  const typeConfig: Record<UserType, { label: string; icon: string; color: string; bg: string; activeBg: string }> = {
    candidato: { label: "Candidato", icon: "ri-user-line", color: "text-emerald-700", bg: "bg-emerald-600", activeBg: "bg-emerald-600" },
    empresa: { label: "Empresa", icon: "ri-building-line", color: "text-sky-700", bg: "bg-sky-600", activeBg: "bg-sky-600" },
    admin: { label: "Administrador", icon: "ri-admin-line", color: "text-gray-700", bg: "bg-gray-700", activeBg: "bg-gray-700" },
  };

  const redirectLabels: Record<UserType, string> = {
    candidato: "Você será redirecionado para a plataforma do candidato",
    empresa: "Você será redirecionado para o painel da empresa",
    admin: "Você será redirecionado para o painel administrativo",
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
          <div className="ml-auto flex items-center gap-4">
            <Link to="/vagas" className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">
              Ver vagas
            </Link>
            <Link to="/cadastro" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer">
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <AnimatedSection variant="fade-up">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className={`w-16 h-16 rounded-2xl ${typeConfig[userType].bg} flex items-center justify-center mx-auto mb-4 transition-colors duration-300`}>
                <i className={`${typeConfig[userType].icon} text-white text-2xl`}></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h1>
              <p className="text-gray-600 text-sm mt-1">Acesse sua conta VagasOeste</p>
            </div>

            {/* Type Selector */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
              {(["candidato", "empresa", "admin"] as UserType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => { setUserType(type); setEmail(""); setPassword(""); setError(""); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    userType === type ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${typeConfig[type].icon} text-xs`}></i>
                  </div>
                  {typeConfig[type].label}
                </button>
              ))}
            </div>

            {/* Redirect hint */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 mb-4">
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <i className="ri-arrow-right-circle-line text-gray-400 text-sm"></i>
              </div>
              <p className="text-xs text-gray-500">{redirectLabels[userType]}</p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600"
                    >
                      <i className={`${showPassword ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-error-warning-line text-red-500 text-sm"></i>
                    </div>
                    <p className="text-red-600 text-xs">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full ${typeConfig[userType].bg} hover:opacity-90 text-white font-bold py-3 rounded-xl text-sm transition-all cursor-pointer whitespace-nowrap ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line animate-spin text-sm"></i>
                      Entrando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <i className={`${typeConfig[userType].icon} text-sm`}></i>
                      Entrar como {typeConfig[userType].label}
                    </span>
                  )}
                </button>
              </form>

              {/* Demo hint */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={fillDemo}
                  className="w-full text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors py-1"
                >
                  <i className="ri-magic-line mr-1"></i>
                  Preencher com credenciais de demonstração
                </button>
              </div>
            </div>

            {/* Register link */}
            {userType === "candidato" && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Não tem conta?{" "}
                <Link to="/cadastro" className="text-emerald-600 font-semibold hover:underline">
                  Cadastre-se grátis
                </Link>
              </p>
            )}

            {/* Demo credentials info */}
            <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-800 mb-2">
                <i className="ri-information-line mr-1"></i>
                Credenciais de demonstração
              </p>
              <div className="space-y-1.5">
                {(["candidato", "empresa", "admin"] as UserType[]).map((type) => (
                  <div key={type} className="flex items-center gap-2 text-xs text-amber-700">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className={`${typeConfig[type].icon} text-xs`}></i>
                    </div>
                    <span className="font-medium capitalize">{type}:</span>
                    <span>{DEMO_CREDENTIALS[type].email}</span>
                    <span className="text-amber-500">/ vagasoeste</span>
                    <span className="ml-auto text-amber-400 text-xs">→ {DEMO_CREDENTIALS[type].redirect}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
