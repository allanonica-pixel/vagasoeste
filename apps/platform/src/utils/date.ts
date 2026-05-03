/**
 * Utilitários de formatação de data — VagasOeste
 * Fuso horário: America/Fortaleza (UTC-3, sem horário de verão)
 */

const TZ = 'America/Fortaleza';

/** Formata uma data ISO para dd/mm/aaaa */
export function formatDateBR(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      timeZone: TZ,
      day:      '2-digit',
      month:    '2-digit',
      year:     'numeric',
    });
  } catch {
    return '—';
  }
}

/** Formata uma data ISO para dd/mm/aaaa HH:MM */
export function formatDateTimeBR(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('pt-BR', {
      timeZone: TZ,
      day:      '2-digit',
      month:    '2-digit',
      year:     'numeric',
      hour:     '2-digit',
      minute:   '2-digit',
    });
  } catch {
    return '—';
  }
}

/** Converte uma string ISO ou YYYY-MM-DD para dd/mm/aaaa */
export function isoToBR(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  // Se já está em formato YYYY-MM-DD (sem hora)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }
  return formatDateBR(dateStr);
}
