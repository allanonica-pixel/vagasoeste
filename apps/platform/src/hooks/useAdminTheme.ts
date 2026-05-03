import { useState, useEffect } from "react";

export type AdminTheme = "light" | "dark";

const STORAGE_KEY = "vo-admin-theme";

function getInitialTheme(): AdminTheme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // SSR ou localStorage indisponível
  }
  return "light";
}

/**
 * Hook de tema escuro/claro restrito ao painel admin (/vo-painel).
 * Persiste a preferência em localStorage.
 * Retorna [theme, toggleTheme].
 */
export function useAdminTheme(): [AdminTheme, () => void] {
  const [theme, setTheme] = useState<AdminTheme>(getInitialTheme);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // silencia se localStorage não estiver disponível
    }
  }, [theme]);

  return [theme, toggleTheme];
}
