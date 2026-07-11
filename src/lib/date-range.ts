import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  differenceInCalendarDays,
} from "date-fns";

export type PeriodoPreset =
  | "hoje"
  | "ontem"
  | "7dias"
  | "30dias"
  | "mes_atual"
  | "mes_anterior"
  | "personalizado";

export const PERIODO_LABEL: Record<PeriodoPreset, string> = {
  hoje: "Hoje",
  ontem: "Ontem",
  "7dias": "Últimos 7 dias",
  "30dias": "Últimos 30 dias",
  mes_atual: "Este mês",
  mes_anterior: "Mês anterior",
  personalizado: "Período personalizado",
};

export const PERIODO_OPCOES: PeriodoPreset[] = [
  "hoje",
  "ontem",
  "7dias",
  "30dias",
  "mes_atual",
  "mes_anterior",
  "personalizado",
];

export interface Periodo {
  from: Date;
  to: Date;
  previousFrom: Date;
  previousTo: Date;
  label: string;
}

export function resolvePeriodo(
  preset: string | undefined,
  customFrom?: string,
  customTo?: string,
  now: Date = new Date()
): Periodo {
  let from: Date;
  let to: Date;

  switch (preset) {
    case "ontem": {
      const yesterday = subDays(now, 1);
      from = startOfDay(yesterday);
      to = endOfDay(yesterday);
      break;
    }
    case "7dias":
      from = startOfDay(subDays(now, 6));
      to = endOfDay(now);
      break;
    case "30dias":
      from = startOfDay(subDays(now, 29));
      to = endOfDay(now);
      break;
    case "mes_atual":
      from = startOfMonth(now);
      to = endOfDay(now);
      break;
    case "mes_anterior": {
      const prevMonth = subMonths(now, 1);
      from = startOfMonth(prevMonth);
      to = endOfMonth(prevMonth);
      break;
    }
    case "personalizado":
      from = customFrom ? startOfDay(new Date(customFrom)) : startOfDay(now);
      to = customTo ? endOfDay(new Date(customTo)) : endOfDay(now);
      break;
    case "hoje":
    default:
      from = startOfDay(now);
      to = endOfDay(now);
      break;
  }

  const spanDays = differenceInCalendarDays(to, from) + 1;
  const previousTo = subDays(from, 1);
  const previousFrom = subDays(previousTo, spanDays - 1);

  return {
    from,
    to,
    previousFrom: startOfDay(previousFrom),
    previousTo: endOfDay(previousTo),
    label: PERIODO_LABEL[(preset as PeriodoPreset) ?? "hoje"] ?? PERIODO_LABEL.hoje,
  };
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    if (current === 0) return 0;
    return null;
  }
  return ((current - previous) / previous) * 100;
}
