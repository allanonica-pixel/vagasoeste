import { useState } from "react";

interface Props {
  onSuccess: () => void;
}

export default function ChangePasswordModal({ onSuccess }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getStrength = (pwd: string) => {
    if (pwd.length === 0) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(newPassword);
  const strengthLabels = ["", "Fraca", "Razoável", "Boa", "Forte"];
  const strengthColors = ["", "bg-red-400", "bg-amber-400", "bg-sky-400", "bg-emerald-500"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (newPassword === "vagasoeste") {
      setError("A nova senha não pode ser igual à senha provisória.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-6 text-center">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <i className="ri-lock-password-line text-white text-2xl"></i>
          </div>
          <h2 className="text-white font-bold text-xl">Troque sua senha provisória</h2>
          <p className="text-emerald-100 text-sm mt-1">
            Por segurança, crie uma senha pessoal para acessar o painel da empresa.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
            <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
              <i className="ri-information-line text-amber-500 text-sm"></i>
            </div>
            <p className="text-amber-700 text-xs leading-relaxed">
              Você está usando a senha provisória <strong>vagasoeste</strong>. Por segurança, é obrigatório criar uma senha pessoal antes de continuar.
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
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <i className={`${showNew ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
                </button>
              </div>
              {/* Strength bar */}
              {newPassword.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((s) => (
                      <div
                        key={s}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          s <= strength ? strengthColors[strength] : "bg-gray-100"
                        }`}
                      ></div>
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength <= 1 ? "text-red-500" : strength === 2 ? "text-amber-500" : strength === 3 ? "text-sky-500" : "text-emerald-600"
                  }`}>
                    Força da senha: {strengthLabels[strength]}
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
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-400 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <i className={`${showConfirm ? "ri-eye-off-line" : "ri-eye-line"} text-sm`}></i>
                </button>
              </div>
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">As senhas não coincidem</p>
              )}
              {confirmPassword.length > 0 && newPassword === confirmPassword && newPassword.length >= 8 && (
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <i className="ri-check-line text-xs"></i>
                  Senhas coincidem
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-error-warning-line text-red-500 text-sm"></i>
                </div>
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition-all cursor-pointer whitespace-nowrap ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-loader-4-line animate-spin text-sm"></i>
                    Salvando...
                  </span>
                ) : "Salvar nova senha e continuar"}
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            Sua senha é criptografada e nunca é compartilhada.
          </p>
        </div>
      </div>
    </div>
  );
}
