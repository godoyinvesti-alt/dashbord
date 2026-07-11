import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Periodo } from "@/lib/date-range";

export interface FinancialSummary {
  grossRevenue: number;
  amountReceived: number;
  pendingPayments: number;
  advertisingExpenses: number;
  toolExpenses: number;
  teamCommissions: number;
  paymentFees: number;
  refunds: number;
  otherExpenses: number;
  totalExpenses: number;
  estimatedProfit: number;
  netProfit: number;
  margin: number;
  roas: number;
}

export async function getFinancialSummary(workspaceId: string, periodo: Periodo): Promise<FinancialSummary> {
  const supabase = await createClient();
  const fromIso = periodo.from.toISOString();
  const toIso = periodo.to.toISOString();
  const fromDate = periodo.from.toISOString().slice(0, 10);
  const toDate = periodo.to.toISOString().slice(0, 10);

  const [{ data: sales }, { data: expenses }, { data: pendentes }] = await Promise.all([
    supabase
      .from("sales")
      .select("valor_esperado, valor_recebido")
      .eq("workspace_id", workspaceId)
      .gte("data_pagamento", fromIso)
      .lte("data_pagamento", toIso),
    supabase
      .from("expenses")
      .select("valor, categoria")
      .eq("workspace_id", workspaceId)
      .gte("data", fromDate)
      .lte("data", toDate),
    supabase
      .from("leads")
      .select("valor_esperado, valor_recebido")
      .eq("workspace_id", workspaceId)
      .in("status_pagamento", ["pix_enviado", "aguardando_pagamento", "pagamento_parcial"]),
  ]);

  const salesRows = sales ?? [];
  const expenseRows = expenses ?? [];
  const pendentesRows = pendentes ?? [];

  const grossRevenue = salesRows.reduce((sum, s) => sum + Number(s.valor_esperado ?? 0), 0);
  const amountReceived = salesRows.reduce((sum, s) => sum + Number(s.valor_recebido ?? 0), 0);
  const pendingPayments = pendentesRows.reduce(
    (sum, l) => sum + Math.max(Number(l.valor_esperado ?? 0) - Number(l.valor_recebido ?? 0), 0),
    0
  );

  const byCategory = (cat: string) =>
    expenseRows.filter((e) => e.categoria === cat).reduce((sum, e) => sum + Number(e.valor ?? 0), 0);

  const advertisingExpenses = byCategory("trafego_pago");
  const toolExpenses = byCategory("ferramentas");
  const teamCommissions = byCategory("funcionarios") + byCategory("comissoes");
  const paymentFees = byCategory("plataforma");
  const refunds = byCategory("reembolsos");
  const otherExpenses = byCategory("outros");

  const totalExpenses = expenseRows.reduce((sum, e) => sum + Number(e.valor ?? 0), 0);

  const estimatedProfit = grossRevenue - totalExpenses;
  const netProfit = amountReceived - totalExpenses;
  const margin = amountReceived > 0 ? (netProfit / amountReceived) * 100 : 0;
  const roas = advertisingExpenses > 0 ? amountReceived / advertisingExpenses : 0;

  return {
    grossRevenue,
    amountReceived,
    pendingPayments,
    advertisingExpenses,
    toolExpenses,
    teamCommissions,
    paymentFees,
    refunds,
    otherExpenses,
    totalExpenses,
    estimatedProfit,
    netProfit,
    margin,
    roas,
  };
}

export interface ExpenseFilters {
  categoria?: string;
  page?: number;
  pageSize?: number;
}

export async function listExpenses(workspaceId: string, filters: ExpenseFilters) {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("expenses").select("*", { count: "exact" }).eq("workspace_id", workspaceId);
  if (filters.categoria) query = query.eq("categoria", filters.categoria);

  const { data, count } = await query.order("data", { ascending: false }).range(from, to);

  return {
    expenses: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(Math.ceil((count ?? 0) / pageSize), 1),
  };
}
