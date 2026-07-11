import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Sale, StatusEntrega, StatusReembolso } from "@/lib/types";

export interface SaleFilters {
  q?: string;
  statusEntrega?: StatusEntrega;
  statusReembolso?: StatusReembolso;
  agentId?: string;
  productId?: string;
  page?: number;
  pageSize?: number;
}

export interface SaleRow extends Sale {
  produto_nome?: string;
  agente_nome?: string | null;
  chip_nome?: string | null;
  campanha_nome?: string | null;
  criativo_nome?: string | null;
  contribuicao_adicional?: number;
}

const SALE_SELECT = `
  *,
  produto:products(id, nome),
  agente:agents(id, nome),
  chip:chips(id, name),
  campanha:campaigns(id, nome),
  criativo:creatives(id, nome)
`;

function mapSale(row: Record<string, unknown>): SaleRow {
  const produto = row.produto as { nome?: string } | null;
  const agente = row.agente as { nome?: string } | null;
  const chip = row.chip as { name?: string } | null;
  const campanha = row.campanha as { nome?: string } | null;
  const criativo = row.criativo as { nome?: string } | null;

  return {
    ...(row as unknown as Sale),
    produto_nome: produto?.nome ?? "—",
    agente_nome: agente?.nome ?? null,
    chip_nome: chip?.name ?? null,
    campanha_nome: campanha?.nome ?? null,
    criativo_nome: criativo?.nome ?? null,
    contribuicao_adicional: Number(row.contribuicao_adicional ?? 0),
  };
}

export async function listSales(workspaceId: string, filters: SaleFilters) {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("sales").select(SALE_SELECT, { count: "exact" }).eq("workspace_id", workspaceId);

  if (filters.q) query = query.ilike("cliente_nome", `%${filters.q}%`);
  if (filters.statusEntrega) query = query.eq("status_entrega", filters.statusEntrega);
  if (filters.statusReembolso) query = query.eq("status_reembolso", filters.statusReembolso);
  if (filters.agentId) query = query.eq("agent_id", filters.agentId);
  if (filters.productId) query = query.eq("product_id", filters.productId);

  const { data, count } = await query.order("created_at", { ascending: false }).range(from, to);

  return {
    sales: ((data as Record<string, unknown>[]) ?? []).map(mapSale),
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(Math.ceil((count ?? 0) / pageSize), 1),
  };
}

export async function getSalesSummary(workspaceId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sales")
    .select("valor_recebido, valor_esperado, status_reembolso")
    .eq("workspace_id", workspaceId);

  const rows = data ?? [];
  const totalVendas = rows.length;
  const faturamento = rows.reduce((sum, r) => sum + Number(r.valor_recebido ?? 0), 0);
  const ticketMedio = totalVendas > 0 ? faturamento / totalVendas : 0;
  const reembolsos = rows.filter((r) => r.status_reembolso === "reembolsado").length;
  const taxaReembolso = totalVendas > 0 ? (reembolsos / totalVendas) * 100 : 0;

  return { totalVendas, faturamento, ticketMedio, taxaReembolso };
}
