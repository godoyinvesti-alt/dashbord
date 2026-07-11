import "server-only";
import { startOfMonth, endOfMonth } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { calcularMetaMensal, type MetaMensalResultado } from "@/lib/goal-calc";
import type { Goal } from "@/lib/types";

export interface MetaMensalContexto {
  metaValor: number;
  faturamentoAtual: number;
  ticketMedio: number;
  resultado: MetaMensalResultado;
}

export async function getMetaMensalAtual(
  workspaceId: string,
  metaFaturamentoMensalWorkspace: number,
  now: Date = new Date()
): Promise<MetaMensalContexto> {
  const supabase = await createClient();
  const from = startOfMonth(now);
  const to = endOfMonth(now);

  const { data: goal } = await supabase
    .from("goals")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("tipo", "faturamento_mensal")
    .lte("periodo_inicio", to.toISOString().slice(0, 10))
    .gte("periodo_fim", from.toISOString().slice(0, 10))
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const metaValor = (goal as Goal | null)?.valor_meta || metaFaturamentoMensalWorkspace || 0;

  const { data: sales } = await supabase
    .from("sales")
    .select("valor_recebido, data_pagamento")
    .eq("workspace_id", workspaceId)
    .gte("data_pagamento", from.toISOString())
    .lte("data_pagamento", to.toISOString());

  const salesRows = sales ?? [];
  const faturamentoAtual = salesRows.reduce((sum, s) => sum + Number(s.valor_recebido ?? 0), 0);
  const ticketMedio = salesRows.length > 0 ? faturamentoAtual / salesRows.length : 0;

  const diaAtual = now.getDate();
  const faturamentoMedioDiario = diaAtual > 0 ? faturamentoAtual / diaAtual : 0;

  const resultado = calcularMetaMensal(
    {
      metaValor,
      faturamentoAtual,
      dataReferencia: now,
      faturamentoMedioDiario,
    },
    ticketMedio
  );

  return { metaValor, faturamentoAtual, ticketMedio, resultado };
}
