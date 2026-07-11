import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Periodo } from "@/lib/date-range";

export interface OverviewMetrics {
  leadsRecebidos: number;
  conversasIniciadas: number;
  vendasRealizadas: number;
  taxaConversao: number;
  faturamento: number;
  valorRecebido: number;
  ticketMedio: number;
  investimentoAnuncios: number;
  custoPorLead: number;
  custoPorVenda: number;
  lucroEstimado: number;
  roas: number;
  pagamentosPendentes: number;
  valorPotencialAberto: number;
}

async function fetchRange(
  workspaceId: string,
  from: Date,
  to: Date
): Promise<OverviewMetrics> {
  const supabase = await createClient();
  const fromIso = from.toISOString();
  const toIso = to.toISOString();

  const [{ data: leads }, { data: sales }, { data: expenses }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, data_entrada, ultima_interacao")
      .eq("workspace_id", workspaceId)
      .gte("data_entrada", fromIso)
      .lte("data_entrada", toIso),
    supabase
      .from("sales")
      .select("id, valor_esperado, valor_recebido, data_pagamento")
      .eq("workspace_id", workspaceId)
      .gte("data_pagamento", fromIso)
      .lte("data_pagamento", toIso),
    supabase
      .from("expenses")
      .select("id, valor, categoria, data")
      .eq("workspace_id", workspaceId)
      .gte("data", from.toISOString().slice(0, 10))
      .lte("data", to.toISOString().slice(0, 10)),
  ]);

  const leadsRows = leads ?? [];
  const salesRows = sales ?? [];
  const expenseRows = expenses ?? [];

  const leadsRecebidos = leadsRows.length;
  const conversasIniciadas = leadsRows.filter((l) => !!l.ultima_interacao).length;
  const vendasRealizadas = salesRows.length;
  const faturamento = salesRows.reduce((sum, s) => sum + Number(s.valor_esperado ?? 0), 0);
  const valorRecebido = salesRows.reduce((sum, s) => sum + Number(s.valor_recebido ?? 0), 0);
  const ticketMedio = vendasRealizadas > 0 ? valorRecebido / vendasRealizadas : 0;
  const taxaConversao = leadsRecebidos > 0 ? (vendasRealizadas / leadsRecebidos) * 100 : 0;

  const investimentoAnuncios = expenseRows
    .filter((e) => e.categoria === "trafego_pago")
    .reduce((sum, e) => sum + Number(e.valor ?? 0), 0);
  const totalDespesas = expenseRows.reduce((sum, e) => sum + Number(e.valor ?? 0), 0);

  const custoPorLead = leadsRecebidos > 0 ? investimentoAnuncios / leadsRecebidos : 0;
  const custoPorVenda = vendasRealizadas > 0 ? investimentoAnuncios / vendasRealizadas : 0;
  const lucroEstimado = valorRecebido - totalDespesas;
  const roas = investimentoAnuncios > 0 ? valorRecebido / investimentoAnuncios : 0;

  // Oportunidades em aberto: consulta independente do período (situação atual)
  const { data: pendentes } = await supabase
    .from("leads")
    .select("id, valor_esperado, valor_recebido, status_pagamento")
    .eq("workspace_id", workspaceId)
    .in("status_pagamento", ["pix_enviado", "aguardando_pagamento", "pagamento_parcial"]);

  const pendentesRows = pendentes ?? [];
  const pagamentosPendentes = pendentesRows.length;
  const valorPotencialAberto = pendentesRows.reduce(
    (sum, l) => sum + Math.max(Number(l.valor_esperado ?? 0) - Number(l.valor_recebido ?? 0), 0),
    0
  );

  return {
    leadsRecebidos,
    conversasIniciadas,
    vendasRealizadas,
    taxaConversao,
    faturamento,
    valorRecebido,
    ticketMedio,
    investimentoAnuncios,
    custoPorLead,
    custoPorVenda,
    lucroEstimado,
    roas,
    pagamentosPendentes,
    valorPotencialAberto,
  };
}

export async function getOverviewComparison(workspaceId: string, periodo: Periodo) {
  const [atual, anterior] = await Promise.all([
    fetchRange(workspaceId, periodo.from, periodo.to),
    fetchRange(workspaceId, periodo.previousFrom, periodo.previousTo),
  ]);
  return { atual, anterior };
}

export interface SerieDia {
  data: string;
  faturamento: number;
  vendas: number;
  leads: number;
}

export async function getSeriePorDia(
  workspaceId: string,
  from: Date,
  to: Date
): Promise<SerieDia[]> {
  const supabase = await createClient();

  const [{ data: sales }, { data: leads }] = await Promise.all([
    supabase
      .from("sales")
      .select("valor_recebido, data_pagamento")
      .eq("workspace_id", workspaceId)
      .gte("data_pagamento", from.toISOString())
      .lte("data_pagamento", to.toISOString()),
    supabase
      .from("leads")
      .select("data_entrada")
      .eq("workspace_id", workspaceId)
      .gte("data_entrada", from.toISOString())
      .lte("data_entrada", to.toISOString()),
  ]);

  const map = new Map<string, SerieDia>();
  const cursor = new Date(from);
  while (cursor <= to) {
    const key = cursor.toISOString().slice(0, 10);
    map.set(key, { data: key, faturamento: 0, vendas: 0, leads: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const s of sales ?? []) {
    if (!s.data_pagamento) continue;
    const key = String(s.data_pagamento).slice(0, 10);
    const row = map.get(key);
    if (row) {
      row.faturamento += Number(s.valor_recebido ?? 0);
      row.vendas += 1;
    }
  }
  for (const l of leads ?? []) {
    const key = String(l.data_entrada).slice(0, 10);
    const row = map.get(key);
    if (row) row.leads += 1;
  }

  return Array.from(map.values());
}
