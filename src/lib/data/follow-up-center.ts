import "server-only";
import { addDays, startOfDay, endOfDay, subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import type { FollowUpRow } from "@/lib/data/follow-ups";
import type { FollowUp } from "@/lib/types";

const FOLLOWUP_SELECT = `
  *,
  lead:leads(id, nome, whatsapp, produto_interesse_id, produto:products(nome), funnel_stage_id, etapa:funnel_stages(nome)),
  agente:agents(id, nome)
`;

function mapFollowUp(row: Record<string, unknown>): FollowUpRow {
  const lead = row.lead as Record<string, unknown> | null;
  const agente = row.agente as { nome?: string } | null;
  const produto = lead?.produto as { nome?: string } | null;
  const etapa = lead?.etapa as { nome?: string } | null;

  return {
    ...(row as unknown as FollowUp),
    lead_nome: (lead?.nome as string) ?? "Lead removido",
    lead_whatsapp: (lead?.whatsapp as string) ?? "",
    lead_produto: produto?.nome ?? null,
    lead_etapa: etapa?.nome ?? null,
    agente_nome: agente?.nome ?? null,
  };
}

export interface LeadOpportunityRow {
  id: string;
  nome: string;
  whatsapp: string;
  valor_esperado: number;
  valor_recebido: number;
  status_pagamento: string;
  ultima_interacao: string | null;
  produto_nome?: string | null;
}

function mapLeadOpportunity(row: Record<string, unknown>): LeadOpportunityRow {
  const produto = row.produto as { nome?: string } | null;
  return {
    id: row.id as string,
    nome: row.nome as string,
    whatsapp: row.whatsapp as string,
    valor_esperado: Number(row.valor_esperado ?? 0),
    valor_recebido: Number(row.valor_recebido ?? 0),
    status_pagamento: row.status_pagamento as string,
    ultima_interacao: (row.ultima_interacao as string) ?? null,
    produto_nome: produto?.nome ?? null,
  };
}

export async function getFollowUpCenterData(workspaceId: string) {
  const supabase = await createClient();
  const now = new Date();

  const [
    { data: hoje },
    { data: atrasados },
    { data: proximos },
    { data: semResposta },
    { data: pixSemPagamento },
    { data: semUpsell },
    { data: recompra },
  ] = await Promise.all([
    supabase
      .from("follow_ups")
      .select(FOLLOWUP_SELECT)
      .eq("workspace_id", workspaceId)
      .eq("status", "pendente")
      .gte("data_agendada", startOfDay(now).toISOString())
      .lte("data_agendada", endOfDay(now).toISOString())
      .order("data_agendada", { ascending: true }),
    supabase
      .from("follow_ups")
      .select(FOLLOWUP_SELECT)
      .eq("workspace_id", workspaceId)
      .eq("status", "pendente")
      .lt("data_agendada", startOfDay(now).toISOString())
      .order("data_agendada", { ascending: true }),
    supabase
      .from("follow_ups")
      .select(FOLLOWUP_SELECT)
      .eq("workspace_id", workspaceId)
      .eq("status", "pendente")
      .gt("data_agendada", endOfDay(now).toISOString())
      .lte("data_agendada", addDays(now, 14).toISOString())
      .order("data_agendada", { ascending: true }),
    supabase
      .from("leads")
      .select("id, nome, whatsapp, valor_esperado, valor_recebido, status_pagamento, ultima_interacao, produto:products(nome)")
      .eq("workspace_id", workspaceId)
      .is("ultima_interacao", null)
      .lt("data_entrada", subDays(now, 0).toISOString())
      .order("data_entrada", { ascending: true })
      .limit(50),
    supabase
      .from("leads")
      .select("id, nome, whatsapp, valor_esperado, valor_recebido, status_pagamento, ultima_interacao, produto:products(nome)")
      .eq("workspace_id", workspaceId)
      .eq("status_pagamento", "pix_enviado")
      .order("data_entrada", { ascending: true })
      .limit(50),
    supabase
      .from("leads")
      .select("id, nome, whatsapp, valor_esperado, valor_recebido, status_pagamento, ultima_interacao, produto:products(nome)")
      .eq("workspace_id", workspaceId)
      .eq("produto_entregue", true)
      .eq("upsell_oferecido", false)
      .order("data_entrada", { ascending: false })
      .limit(50),
    supabase
      .from("leads")
      .select("id, nome, whatsapp, valor_esperado, valor_recebido, status_pagamento, ultima_interacao, produto:products(nome)")
      .eq("workspace_id", workspaceId)
      .eq("status_pagamento", "pagamento_confirmado")
      .eq("produto_entregue", true)
      .order("data_entrada", { ascending: true })
      .limit(50),
  ]);

  return {
    hoje: ((hoje as Record<string, unknown>[]) ?? []).map(mapFollowUp),
    atrasados: ((atrasados as Record<string, unknown>[]) ?? []).map(mapFollowUp),
    proximos: ((proximos as Record<string, unknown>[]) ?? []).map(mapFollowUp),
    semResposta: ((semResposta as Record<string, unknown>[]) ?? []).map(mapLeadOpportunity),
    pixSemPagamento: ((pixSemPagamento as Record<string, unknown>[]) ?? []).map(mapLeadOpportunity),
    semUpsell: ((semUpsell as Record<string, unknown>[]) ?? []).map(mapLeadOpportunity),
    recompra: ((recompra as Record<string, unknown>[]) ?? []).map(mapLeadOpportunity),
  };
}

export async function getOpportunityTotals(workspaceId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("valor_esperado, valor_recebido, status_pagamento")
    .eq("workspace_id", workspaceId)
    .in("status_pagamento", ["pix_enviado", "aguardando_pagamento", "pagamento_parcial"]);

  const rows = data ?? [];
  const total = rows.reduce(
    (sum, l) => sum + Math.max(Number(l.valor_esperado ?? 0) - Number(l.valor_recebido ?? 0), 0),
    0
  );
  return { total, count: rows.length };
}
