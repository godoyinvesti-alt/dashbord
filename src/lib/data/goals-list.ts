import "server-only";
import { createClient } from "@/lib/supabase/server";
import { calcularStatusMetaGenerica } from "@/lib/goal-calc";
import type { Goal, TipoMeta, StatusMeta } from "@/lib/types";

export interface GoalRow extends Goal {
  produto_nome?: string | null;
  agente_nome?: string | null;
  valorAtual: number;
  percentual: number;
  restante: number;
  status: StatusMeta;
}

async function computeCurrentValue(
  workspaceId: string,
  tipo: TipoMeta,
  from: string,
  to: string,
  produtoId?: string | null,
  agentId?: string | null
): Promise<number> {
  const supabase = await createClient();
  const fromIso = new Date(from).toISOString();
  const toIso = new Date(`${to}T23:59:59`).toISOString();

  switch (tipo) {
    case "faturamento_diario":
    case "faturamento_semanal":
    case "faturamento_mensal": {
      const { data } = await supabase
        .from("sales")
        .select("valor_recebido")
        .eq("workspace_id", workspaceId)
        .gte("data_pagamento", fromIso)
        .lte("data_pagamento", toIso);
      return (data ?? []).reduce((sum, s) => sum + Number(s.valor_recebido ?? 0), 0);
    }
    case "lucro": {
      const [{ data: sales }, { data: expenses }] = await Promise.all([
        supabase
          .from("sales")
          .select("valor_recebido")
          .eq("workspace_id", workspaceId)
          .gte("data_pagamento", fromIso)
          .lte("data_pagamento", toIso),
        supabase
          .from("expenses")
          .select("valor")
          .eq("workspace_id", workspaceId)
          .gte("data", from)
          .lte("data", to),
      ]);
      const receita = (sales ?? []).reduce((sum, s) => sum + Number(s.valor_recebido ?? 0), 0);
      const despesas = (expenses ?? []).reduce((sum, e) => sum + Number(e.valor ?? 0), 0);
      return receita - despesas;
    }
    case "numero_vendas": {
      const { count } = await supabase
        .from("sales")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
        .gte("data_pagamento", fromIso)
        .lte("data_pagamento", toIso);
      return count ?? 0;
    }
    case "ticket_medio": {
      const { data } = await supabase
        .from("sales")
        .select("valor_recebido")
        .eq("workspace_id", workspaceId)
        .gte("data_pagamento", fromIso)
        .lte("data_pagamento", toIso);
      const rows = data ?? [];
      const total = rows.reduce((sum, s) => sum + Number(s.valor_recebido ?? 0), 0);
      return rows.length > 0 ? total / rows.length : 0;
    }
    case "conversao": {
      const [{ count: leadsCount }, { count: vendasCount }] = await Promise.all([
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .gte("data_entrada", fromIso)
          .lte("data_entrada", toIso),
        supabase
          .from("sales")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .gte("data_pagamento", fromIso)
          .lte("data_pagamento", toIso),
      ]);
      return (leadsCount ?? 0) > 0 ? ((vendasCount ?? 0) / (leadsCount ?? 1)) * 100 : 0;
    }
    case "roas":
    case "custo_por_lead":
    case "custo_por_venda": {
      const [{ data: expenses }, { count: leadsCount }, { data: sales }] = await Promise.all([
        supabase
          .from("expenses")
          .select("valor")
          .eq("workspace_id", workspaceId)
          .eq("categoria", "trafego_pago")
          .gte("data", from)
          .lte("data", to),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .gte("data_entrada", fromIso)
          .lte("data_entrada", toIso),
        supabase
          .from("sales")
          .select("valor_recebido")
          .eq("workspace_id", workspaceId)
          .gte("data_pagamento", fromIso)
          .lte("data_pagamento", toIso),
      ]);
      const investido = (expenses ?? []).reduce((sum, e) => sum + Number(e.valor ?? 0), 0);
      const vendasRows = sales ?? [];
      if (tipo === "custo_por_lead") return (leadsCount ?? 0) > 0 ? investido / (leadsCount ?? 1) : 0;
      if (tipo === "custo_por_venda") return vendasRows.length > 0 ? investido / vendasRows.length : 0;
      const faturamento = vendasRows.reduce((sum, s) => sum + Number(s.valor_recebido ?? 0), 0);
      return investido > 0 ? faturamento / investido : 0;
    }
    case "upsells": {
      const { count } = await supabase
        .from("sales")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
        .eq("upsell", true)
        .gte("data_pagamento", fromIso)
        .lte("data_pagamento", toIso);
      return count ?? 0;
    }
    case "receita_por_produto": {
      if (!produtoId) return 0;
      const { data } = await supabase
        .from("sales")
        .select("valor_recebido")
        .eq("workspace_id", workspaceId)
        .eq("product_id", produtoId)
        .gte("data_pagamento", fromIso)
        .lte("data_pagamento", toIso);
      return (data ?? []).reduce((sum, s) => sum + Number(s.valor_recebido ?? 0), 0);
    }
    case "receita_por_agente": {
      if (!agentId) return 0;
      const { data } = await supabase
        .from("sales")
        .select("valor_recebido")
        .eq("workspace_id", workspaceId)
        .eq("agent_id", agentId)
        .gte("data_pagamento", fromIso)
        .lte("data_pagamento", toIso);
      return (data ?? []).reduce((sum, s) => sum + Number(s.valor_recebido ?? 0), 0);
    }
    default:
      return 0;
  }
}

export async function listGoalsWithProgress(workspaceId: string): Promise<GoalRow[]> {
  const supabase = await createClient();
  const { data: goals } = await supabase
    .from("goals")
    .select("*, produto:products(nome), agente:agents(nome)")
    .eq("workspace_id", workspaceId)
    .order("periodo_inicio", { ascending: false });

  const goalsList = (goals as (Goal & { produto: { nome?: string } | null; agente: { nome?: string } | null })[]) ?? [];

  const results = await Promise.all(
    goalsList.map(async (g) => {
      const valorAtual = await computeCurrentValue(
        workspaceId,
        g.tipo,
        g.periodo_inicio,
        g.periodo_fim,
        g.produto_id,
        g.agent_id
      );
      const { percentual, status, restante } = calcularStatusMetaGenerica(
        valorAtual,
        g.valor_meta,
        new Date(g.periodo_inicio),
        new Date(g.periodo_fim)
      );
      return {
        ...g,
        produto_nome: g.produto?.nome ?? null,
        agente_nome: g.agente?.nome ?? null,
        valorAtual,
        percentual,
        restante,
        status,
      };
    })
  );

  return results;
}
