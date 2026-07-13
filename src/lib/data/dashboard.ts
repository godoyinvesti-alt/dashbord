import "server-only";
import { eachDayOfInterval, format, startOfDay, startOfMonth, endOfDay } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { resolvePeriodo, type PeriodoPreset } from "@/lib/date-range";
import { computeChip } from "@/lib/chip-calc";
import type { Chip, Settings, StatusChip } from "@/lib/types";

interface SaleRow {
  data: string;
  valor_recebido: number;
  taxas: number;
  reembolso: number;
}
interface ExpenseRow {
  data: string;
  valor: number;
}

export interface DashboardMetrics {
  faturamentoHoje: number;
  faturamentoMes: number;
  lucroMes: number;
  totalVendas: number;
  ticketMedio: number;
  gastos: number;
  chipsAtivos: number;
  chipsEmAquecimento: number;
  chipsBanidos: number;
  chipsSemRecarga: number;
}

export interface DashboardCharts {
  faturamentoLucroPorDia: { data: string; faturamento: number; lucro: number }[];
  vendasPorDia: { data: string; vendas: number }[];
  statusChips: { status: StatusChip; total: number }[];
  vendasPorChip: { nome: string; vendas: number; receita: number }[];
}

export async function getDashboardData(
  periodo: PeriodoPreset | string | undefined,
  de?: string,
  ate?: string
): Promise<{ metrics: DashboardMetrics; charts: DashboardCharts }> {
  const supabase = await createClient();
  const range = resolvePeriodo(periodo, de, ate);

  const hoje = new Date();
  const inicioHoje = startOfDay(hoje).toISOString().slice(0, 10);
  const fimHoje = endOfDay(hoje).toISOString().slice(0, 10);
  const inicioMes = startOfMonth(hoje).toISOString().slice(0, 10);

  const fromStr = range.from.toISOString().slice(0, 10);
  const toStr = range.to.toISOString().slice(0, 10);

  const [
    { data: vendasHoje },
    { data: vendasMes },
    { data: despesasMes },
    { data: vendasPeriodo },
    { data: despesasPeriodo },
    { data: chipsData },
    settingsResult,
  ] = await Promise.all([
    supabase.from("sales").select("valor_recebido").gte("data", inicioHoje).lte("data", fimHoje),
    supabase.from("sales").select("valor_recebido, taxas, reembolso").gte("data", inicioMes),
    supabase.from("expenses").select("valor").gte("data", inicioMes),
    supabase
      .from("sales")
      .select("data, valor_recebido, taxas, reembolso, chip_id, chips(nome)")
      .gte("data", fromStr)
      .lte("data", toStr),
    supabase.from("expenses").select("data, valor").gte("data", fromStr).lte("data", toStr),
    supabase.from("chips").select("*"),
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return null;
      const { data } = await supabase.from("settings").select("*").eq("owner_id", user.id).single();
      return data as Settings | null;
    }),
  ]);

  const faturamentoHoje = ((vendasHoje as { valor_recebido: number }[]) ?? []).reduce(
    (s, v) => s + Number(v.valor_recebido),
    0
  );

  const vendasMesTyped = (vendasMes as SaleRow[]) ?? [];
  const faturamentoMes = vendasMesTyped.reduce((s, v) => s + Number(v.valor_recebido), 0);
  const faturamentoLiquidoMes = vendasMesTyped.reduce(
    (s, v) => s + (Number(v.valor_recebido) - Number(v.taxas) - Number(v.reembolso)),
    0
  );
  const gastosMes = ((despesasMes as ExpenseRow[]) ?? []).reduce((s, e) => s + Number(e.valor), 0);
  const lucroMes = faturamentoLiquidoMes - gastosMes;

  interface VendaPeriodoRow extends SaleRow {
    chip_id: string | null;
    chips: { nome: string } | { nome: string }[] | null;
  }
  const vendasPeriodoTyped = (vendasPeriodo as unknown as VendaPeriodoRow[]) ?? [];
  const totalVendas = vendasPeriodoTyped.length;
  const faturamentoPeriodo = vendasPeriodoTyped.reduce((s, v) => s + Number(v.valor_recebido), 0);
  const ticketMedio = totalVendas > 0 ? faturamentoPeriodo / totalVendas : 0;
  const gastosPeriodo = ((despesasPeriodo as ExpenseRow[]) ?? []).reduce((s, e) => s + Number(e.valor), 0);

  const settings = settingsResult ?? { dias_alerta_recarga: 30, dias_aquecimento_padrao: 21 };
  const chips = (chipsData as Chip[]) ?? [];
  let chipsAtivos = 0;
  let chipsEmAquecimento = 0;
  let chipsBanidos = 0;
  let chipsSemRecarga = 0;
  const statusCounts = new Map<StatusChip, number>();
  for (const chip of chips) {
    statusCounts.set(chip.status, (statusCounts.get(chip.status) ?? 0) + 1);
    if (chip.status === "ativo") chipsAtivos += 1;
    if (chip.status === "em_aquecimento") chipsEmAquecimento += 1;
    if (chip.status === "banido") chipsBanidos += 1;
    const computed = computeChip(chip, 0, settings);
    if (computed.nivel_alerta_recarga === "vermelho" || computed.nivel_alerta_recarga === "vermelho_escuro") {
      chipsSemRecarga += 1;
    }
  }

  // Séries diárias dentro do período selecionado
  const days = eachDayOfInterval({ start: range.from, end: range.to }).map((d) => format(d, "yyyy-MM-dd"));
  const faturamentoPorDiaMap = new Map<string, number>();
  const lucroPorDiaMap = new Map<string, number>();
  const vendasPorDiaMap = new Map<string, number>();
  for (const d of days) {
    faturamentoPorDiaMap.set(d, 0);
    lucroPorDiaMap.set(d, 0);
    vendasPorDiaMap.set(d, 0);
  }
  for (const v of vendasPeriodoTyped) {
    const key = v.data.slice(0, 10);
    if (!faturamentoPorDiaMap.has(key)) continue;
    const liquido = Number(v.valor_recebido) - Number(v.taxas) - Number(v.reembolso);
    faturamentoPorDiaMap.set(key, (faturamentoPorDiaMap.get(key) ?? 0) + Number(v.valor_recebido));
    lucroPorDiaMap.set(key, (lucroPorDiaMap.get(key) ?? 0) + liquido);
    vendasPorDiaMap.set(key, (vendasPorDiaMap.get(key) ?? 0) + 1);
  }
  for (const e of (despesasPeriodo as ExpenseRow[]) ?? []) {
    const key = e.data.slice(0, 10);
    if (!lucroPorDiaMap.has(key)) continue;
    lucroPorDiaMap.set(key, (lucroPorDiaMap.get(key) ?? 0) - Number(e.valor));
  }

  const faturamentoLucroPorDia = days.map((d) => ({
    data: d,
    faturamento: faturamentoPorDiaMap.get(d) ?? 0,
    lucro: lucroPorDiaMap.get(d) ?? 0,
  }));
  const vendasPorDia = days.map((d) => ({ data: d, vendas: vendasPorDiaMap.get(d) ?? 0 }));

  const statusChips: { status: StatusChip; total: number }[] = Array.from(statusCounts.entries()).map(
    ([status, total]) => ({ status, total })
  );

  const vendasPorChipMap = new Map<string, { nome: string; vendas: number; receita: number }>();
  for (const v of vendasPeriodoTyped) {
    if (!v.chip_id) continue;
    const chipInfo = Array.isArray(v.chips) ? v.chips[0] : v.chips;
    const nome = chipInfo?.nome ?? "Sem chip";
    const current = vendasPorChipMap.get(v.chip_id) ?? { nome, vendas: 0, receita: 0 };
    current.vendas += 1;
    current.receita += Number(v.valor_recebido);
    vendasPorChipMap.set(v.chip_id, current);
  }
  const vendasPorChip = Array.from(vendasPorChipMap.values())
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 8);

  return {
    metrics: {
      faturamentoHoje,
      faturamentoMes,
      lucroMes,
      totalVendas,
      ticketMedio,
      gastos: gastosPeriodo,
      chipsAtivos,
      chipsEmAquecimento,
      chipsBanidos,
      chipsSemRecarga,
    },
    charts: {
      faturamentoLucroPorDia,
      vendasPorDia,
      statusChips,
      vendasPorChip,
    },
  };
}
