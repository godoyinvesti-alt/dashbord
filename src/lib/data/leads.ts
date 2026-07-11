import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Lead,
  LeadTemperatura,
  StatusPagamento,
  LeadStatusHistory,
  LeadNote,
} from "@/lib/types";

export interface LeadFilters {
  q?: string;
  funnelStageId?: string;
  temperatura?: LeadTemperatura;
  statusPagamento?: StatusPagamento;
  agentId?: string;
  origem?: string;
  page?: number;
  pageSize?: number;
}

export interface LeadRow extends Lead {
  produto_nome?: string | null;
  agente_nome?: string | null;
  chip_nome?: string | null;
  etapa_nome?: string | null;
  etapa_cor?: string | null;
  campanha_nome?: string | null;
  criativo_nome?: string | null;
}

const LEAD_SELECT = `
  *,
  produto:products(id, nome),
  agente:agents(id, nome),
  chip:chips(id, name),
  etapa:funnel_stages(id, nome, cor),
  campanha:campaigns(id, nome),
  criativo:creatives(id, nome)
`;

function mapLeadRow(row: Record<string, unknown>): LeadRow {
  const produto = row.produto as { nome?: string } | null;
  const agente = row.agente as { nome?: string } | null;
  const chip = row.chip as { name?: string } | null;
  const etapa = row.etapa as { nome?: string; cor?: string } | null;
  const campanha = row.campanha as { nome?: string } | null;
  const criativo = row.criativo as { nome?: string } | null;

  return {
    ...(row as unknown as Lead),
    produto_nome: produto?.nome ?? null,
    agente_nome: agente?.nome ?? null,
    chip_nome: chip?.name ?? null,
    etapa_nome: etapa?.nome ?? null,
    etapa_cor: etapa?.cor ?? null,
    campanha_nome: campanha?.nome ?? null,
    criativo_nome: criativo?.nome ?? null,
  };
}

export async function listLeads(workspaceId: string, filters: LeadFilters) {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("leads")
    .select(LEAD_SELECT, { count: "exact" })
    .eq("workspace_id", workspaceId);

  if (filters.q) {
    query = query.or(`nome.ilike.%${filters.q}%,whatsapp.ilike.%${filters.q}%,email.ilike.%${filters.q}%`);
  }
  if (filters.funnelStageId) query = query.eq("funnel_stage_id", filters.funnelStageId);
  if (filters.temperatura) query = query.eq("temperatura", filters.temperatura);
  if (filters.statusPagamento) query = query.eq("status_pagamento", filters.statusPagamento);
  if (filters.agentId) query = query.eq("agent_id", filters.agentId);
  if (filters.origem) query = query.eq("origem", filters.origem);

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  return {
    leads: ((data as Record<string, unknown>[]) ?? []).map(mapLeadRow),
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(Math.ceil((count ?? 0) / pageSize), 1),
  };
}

export async function listAllLeadsForExport(workspaceId: string, filters: LeadFilters) {
  const supabase = await createClient();
  let query = supabase
    .from("leads")
    .select(LEAD_SELECT)
    .eq("workspace_id", workspaceId);

  if (filters.q) {
    query = query.or(`nome.ilike.%${filters.q}%,whatsapp.ilike.%${filters.q}%,email.ilike.%${filters.q}%`);
  }
  if (filters.funnelStageId) query = query.eq("funnel_stage_id", filters.funnelStageId);
  if (filters.temperatura) query = query.eq("temperatura", filters.temperatura);
  if (filters.statusPagamento) query = query.eq("status_pagamento", filters.statusPagamento);
  if (filters.agentId) query = query.eq("agent_id", filters.agentId);

  const { data } = await query.order("created_at", { ascending: false });
  return ((data as Record<string, unknown>[]) ?? []).map(mapLeadRow);
}

export async function getLeadById(workspaceId: string, leadId: string): Promise<LeadRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .eq("workspace_id", workspaceId)
    .eq("id", leadId)
    .maybeSingle();
  return data ? mapLeadRow(data as Record<string, unknown>) : null;
}

export async function getLeadHistory(workspaceId: string, leadId: string): Promise<LeadStatusHistory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lead_status_history")
    .select("*, etapa:funnel_stages!lead_status_history_funnel_stage_id_fkey(nome)")
    .eq("workspace_id", workspaceId)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  return (data as unknown as LeadStatusHistory[]) ?? [];
}

export async function getLeadNotes(workspaceId: string, leadId: string): Promise<LeadNote[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lead_notes")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  return (data as LeadNote[]) ?? [];
}

export async function getLeadsKanban(workspaceId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(500);
  return ((data as Record<string, unknown>[]) ?? []).map(mapLeadRow);
}
