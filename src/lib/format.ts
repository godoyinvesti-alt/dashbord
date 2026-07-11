import {
  format,
  formatDistanceToNow,
  differenceInCalendarDays,
  parseISO,
  isValid,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export const TIME_ZONE = "America/Sao_Paulo";

export function formatBRL(value: number | null | undefined): string {
  const v = value ?? 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

export function formatNumber(value: number | null | undefined, decimals = 0): string {
  const v = value ?? 0;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v);
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  const v = value ?? 0;
  return `${new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v)}%`;
}

export function parseCurrencyInput(input: string): number {
  const cleaned = input
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3},)/g, "")
    .replace(",", ".");
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

function toDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;
  const d = typeof date === "string" ? parseISO(date) : date;
  return isValid(d) ? d : null;
}

export function formatDate(date: string | Date | null | undefined): string {
  const d = toDate(date);
  if (!d) return "—";
  return format(d, "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  const d = toDate(date);
  if (!d) return "—";
  return format(d, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function formatTime(date: string | Date | null | undefined): string {
  const d = toDate(date);
  if (!d) return "—";
  return format(d, "HH:mm", { locale: ptBR });
}

export function formatDateLong(date: string | Date | null | undefined): string {
  const d = toDate(date);
  if (!d) return "—";
  return format(d, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatRelative(date: string | Date | null | undefined): string {
  const d = toDate(date);
  if (!d) return "—";
  return formatDistanceToNow(d, { locale: ptBR, addSuffix: true });
}

export function daysSince(date: string | Date | null | undefined, reference: Date = new Date()): number | null {
  const d = toDate(date);
  if (!d) return null;
  return differenceInCalendarDays(reference, d);
}

/**
 * Normaliza um número de WhatsApp brasileiro para o formato E.164 (com DDI 55),
 * usado para montar o link https://wa.me/{numero}.
 */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");
  if (!digits.startsWith("55")) {
    digits = `55${digits}`;
  }
  return digits;
}

export function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  let local = digits;
  if (local.startsWith("55") && local.length > 11) {
    local = local.slice(2);
  }
  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }
  return raw;
}

export function whatsappLink(raw: string, message?: string): string {
  const number = normalizePhone(raw);
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
