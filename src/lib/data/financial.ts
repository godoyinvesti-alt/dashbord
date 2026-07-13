import "server-only";
import { format, startOfMonth, endOfDay } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { resolvePeriodo } from "@/lib/date-range";
import { CATEGORIA_DESPESA_OPCOES } from "@/lib/constants";
import type { Expense, CategoriaDespesa } from "@/lib/types";

const PAGE_SIZE = 20;

export interface ListExpensesOptions {
  q?: string;
  categoria?: string;
  page?: number;
}

export async function listExpenses(options: ListExpensesOptions = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { expenses: [] as Expense[], total: 0, page: 1, totalPages: 1 };

  const page = options.page && options.page > 0 ? options.page : 1;

  let query = supabase.from("expenses").select("*", { count: "exact" });
  if (options.q) {
    query = query.or(`descricao.ilike.%${options.q}%,operacao_vinculada.ilike.%${options.q}%`);
  }
  if (options.categoria) {
    query = query.eq("categoria", options.categoria);
  }
  query = query.order("data", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data, count } = await query;

  const total = count ?? 0;
  return {
    expenses: (data as Expense[]) ?? [],
    total,
    page,
    totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1),
  };
}

export interface FinancialSummary {
  faturamento: number;
  taxas: number;
  reembolsos: number;
  despesas: number;
  lucroLiquido: number;
  margemLucro: number;
  despesasPorCategoria: { categoria: CategoriaDespesa; total: number }[];
}

export async function getFinancialSummary(
  periodo?: string,
  de?: string,
  ate?: string
): Promise<FinancialSummary> {
  const supabase = await createClient();
  const range = resolvePeriodo(periodo, de, ate);
  const fromStr = format(range.from, "yyyy-MM-dd");
  const toStr = format(range.to, "yyyy-MM-dd");

  const [{ data: sales }, { data: expenses }] = await Promise.all([
    supabase
      .from("sales")
      .select("data, valor_recebido, taxas, reembolso")
      .gte("data", fromStr)
      .lte("data", toStr),
    supabase
      .from("expenses")
      .select("valor, categoria")
      .gte("data", fromStr)
      .lte("data", toStr),
  ]);

  const salesRows = (sales as { data: string; valor_recebido: number; taxas: number; reembolso: number }[]) ?? [];
  const expenseRows = (expenses as { valor: number; categoria: CategoriaDespesa }[]) ?? [];

  const faturamento = salesRows.reduce((sum, s) => sum + (s.valor_recebido ?? 0), 0);
  const taxas = salesRows.reduce((sum, s) => sum + (s.taxas ?? 0), 0);
  const reembolsos = salesRows.reduce((sum, s) => sum + (s.reembolso ?? 0), 0);
  const despesas = expenseRows.reduce((sum, e) => sum + (e.valor ?? 0), 0);

  const lucroLiquido = faturamento - taxas - reembolsos - despesas;
  const margemLucro = faturamento > 0 ? (lucroLiquido / faturamento) * 100 : 0;

  const totalPorCategoria = new Map<CategoriaDespesa, number>();
  for (const e of expenseRows) {
    totalPorCategoria.set(e.categoria, (totalPorCategoria.get(e.categoria) ?? 0) + (e.valor ?? 0));
  }
  const despesasPorCategoria = CATEGORIA_DESPESA_OPCOES.filter((c) => (totalPorCategoria.get(c) ?? 0) > 0).map(
    (categoria) => ({ categoria, total: totalPorCategoria.get(categoria) ?? 0 })
  );

  return { faturamento, taxas, reembolsos, despesas, lucroLiquido, margemLucro, despesasPorCategoria };
}

export interface CurrentMonthResults {
  faturamento: number;
  lucro: number;
  numeroVendas: number;
}

export async function getCurrentMonthResults(): Promise<CurrentMonthResults> {
  const supabase = await createClient();
  const now = new Date();
  const fromStr = format(startOfMonth(now), "yyyy-MM-dd");
  const toStr = format(endOfDay(now), "yyyy-MM-dd");

  const [{ data: sales }, { data: expenses }] = await Promise.all([
    supabase
      .from("sales")
      .select("valor_recebido, taxas, reembolso")
      .gte("data", fromStr)
      .lte("data", toStr),
    supabase.from("expenses").select("valor").gte("data", fromStr).lte("data", toStr),
  ]);

  const salesRows = (sales as { valor_recebido: number; taxas: number; reembolso: number }[]) ?? [];
  const expenseRows = (expenses as { valor: number }[]) ?? [];

  const faturamento = salesRows.reduce((sum, s) => sum + (s.valor_recebido ?? 0), 0);
  const taxas = salesRows.reduce((sum, s) => sum + (s.taxas ?? 0), 0);
  const reembolsos = salesRows.reduce((sum, s) => sum + (s.reembolso ?? 0), 0);
  const despesas = expenseRows.reduce((sum, e) => sum + (e.valor ?? 0), 0);

  return {
    faturamento,
    lucro: faturamento - taxas - reembolsos - despesas,
    numeroVendas: salesRows.length,
  };
}
