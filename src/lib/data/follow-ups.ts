import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { FollowUp } from "@/lib/types";

export interface FollowUpRow extends FollowUp {
  lead_nome?: string;
  lead_whatsapp?: string;
  lead_produto?: string | null;
  lead_etapa?: string | null;
  agente_nome?: string | null;
}

const SELECT = `
  *,
  lead:leads(id, nome, whatsapp, produto_interesse_id, produto:products(nome), funnel_stage_id, etapa:funnel_stages(nome)),
  agente:agents(id, nome)
`;

function mapRow(row: Record<string, unknown>): FollowUpRow {
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

export async function getFollowUpsForLead(workspaceId: string, leadId: string): Promise<FollowUp[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follow_ups")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("lead_id", leadId)
    .order("data_agendada", { ascending: false });
  return (data as FollowUp[]) ?? [];
}

export async function listFollowUps(
  workspaceId: string,
  opts: { status?: string; agentId?: string } = {}
): Promise<FollowUpRow[]> {
  const supabase = await createClient();
  let query = supabase.from("follow_ups").select(SELECT).eq("workspace_id", workspaceId);
  if (opts.status) query = query.eq("status", opts.status);
  if (opts.agentId) query = query.eq("agent_id", opts.agentId);
  const { data } = await query.order("data_agendada", { ascending: true }).limit(500);
  return ((data as Record<string, unknown>[]) ?? []).map(mapRow);
}
