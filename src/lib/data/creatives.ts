import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Creative } from "@/lib/types";

export interface CreativeRow extends Creative {
  campanha_nome?: string;
  leads: number;
  vendas: number;
  faturamento: number;
  custoPorVenda: number;
  conversao: number;
  lucro: number;
  ticketMedio: number;
  qualidadeLead: number;
}

export async function listCreativesWithMetrics(workspaceId: string): Promise<CreativeRow[]> {
  const supabase = await createClient();

  const [{ data: creatives }, { data: leads }, { data: sales }] = await Promise.all([
    supabase
      .from("creatives")
      .select("*, campanha:campaigns(nome)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
    supabase
      .from("leads")
      .select("creative_id, temperatura")
      .eq("workspace_id", workspaceId)
      .not("creative_id", "is", null),
    supabase
      .from("sales")
      .select("creative_id, valor_recebido")
      .eq("workspace_id", workspaceId)
      .not("creative_id", "is", null),
  ]);

  const creativesList = (creatives as (Creative & { campanha: { nome?: string } | null })[]) ?? [];
  const leadsList = leads ?? [];
  const salesList = sales ?? [];

  return creativesList.map((c) => {
    const creativeLeads = leadsList.filter((l) => l.creative_id === c.id);
    const leadsCount = creativeLeads.length;
    const creativeSales = salesList.filter((s) => s.creative_id === c.id);
    const vendas = creativeSales.length;
    const faturamento = creativeSales.reduce((sum, s) => sum + Number(s.valor_recebido ?? 0), 0);
    const investido = Number(c.valor_investido ?? 0);
    const quentes = creativeLeads.filter((l) => l.temperatura === "quente" || l.temperatura === "muito_quente").length;

    return {
      ...c,
      campanha_nome: c.campanha?.nome,
      leads: leadsCount,
      vendas,
      faturamento,
      custoPorVenda: vendas > 0 ? investido / vendas : 0,
      conversao: leadsCount > 0 ? (vendas / leadsCount) * 100 : 0,
      lucro: faturamento - investido,
      ticketMedio: vendas > 0 ? faturamento / vendas : 0,
      qualidadeLead: leadsCount > 0 ? (quentes / leadsCount) * 100 : 0,
    };
  });
}
