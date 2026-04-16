import { useState, useCallback } from "react";

/**
 * Formata número de celular brasileiro no padrão (XX) XXXXX-XXXX
 * Aceita também telefone fixo (XX) XXXX-XXXX
 */
export function formatBrazilPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    // Telefone fixo: (XX) XXXX-XXXX
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  // Celular: (XX) XXXXX-XXXX
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Valida se o número é um celular brasileiro válido
 * Aceita: (XX) 9XXXX-XXXX — celular com 9 dígitos
 * Aceita também fixo: (XX) XXXX-XXXX — 8 dígitos
 */
export function isValidBrazilPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return true; // fixo
  if (digits.length === 11 && digits[2] === "9") return true; // celular
  return false;
}

/**
 * Valida especificamente celular brasileiro (11 dígitos, 3º dígito = 9)
 */
export function isValidBrazilMobile(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 && digits[2] === "9";
}

/**
 * Hook para campo de telefone/celular brasileiro com máscara automática
 */
export function useBrazilPhone(initialValue = "") {
  const [value, setValue] = useState(formatBrazilPhone(initialValue));

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(formatBrazilPhone(e.target.value));
  }, []);

  const isValid = isValidBrazilPhone(value);
  const isMobile = isValidBrazilMobile(value);
  const digits = value.replace(/\D/g, "");

  return { value, setValue: (v: string) => setValue(formatBrazilPhone(v)), onChange, isValid, isMobile, digits };
}
