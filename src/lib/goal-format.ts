import { formatBRL, formatNumber, formatPercent } from "@/lib/format";
import type { TipoMeta } from "@/lib/types";

const CURRENCY_TYPES: TipoMeta[] = [
  "faturamento_diario",
  "faturamento_semanal",
  "faturamento_mensal",
  "lucro",
  "ticket_medio",
  "custo_por_lead",
  "custo_por_venda",
  "receita_por_produto",
  "receita_por_agente",
];

const COUNT_TYPES: TipoMeta[] = ["numero_vendas", "upsells"];

export function formatGoalValue(tipo: TipoMeta, value: number): string {
  if (CURRENCY_TYPES.includes(tipo)) return formatBRL(value);
  if (COUNT_TYPES.includes(tipo)) return formatNumber(value);
  if (tipo === "conversao") return formatPercent(value);
  if (tipo === "roas") return `${formatNumber(value, 2)}x`;
  return formatNumber(value);
}
