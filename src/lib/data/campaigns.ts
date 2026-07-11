import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Campaign } from "@/lib/types";

export interface CampaignRow extends Campaign {
  leads: number;
  vendas: number;
  faturamento: number;
  cpl: number;
  cpa: number;
  conversao: number;
  roas: number;
  lucro: number;
  ticketMedio: number;
}

export async function listCampaignsWithMetrics(workspaceId: string): Promise<CampaignRow[]> {
  const supabase = await createClient();

  const [{ data: campaigns }, { data: leads }, { data: sales }] = await Promise.all([
    supabase.from("campaigns").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    supabase.from("leads").select("campaign_id").eq("workspace_id", workspaceId).not("campaign_id", "is", null),
    supabase
      .from("sales")
      .select("campaign_id, valor_recebido")
      .eq("workspace_id", workspaceId)
      .not("campaign_id", "is", null),
  ]);

  const campaignsList = (campaigns as Campaign[]) ?? [];
  const leadsList = leads ?? [];
  const salesList = sales ?? [];

  return campaignsList.map((c) => {
    const leadsCount = leadsList.filter((l) => l.campaign_id === c.id).length;
    const campaignSales = salesList.filter((s) => s.campaign_id === c.id);
    const vendas = campaignSales.length;
    const faturamento = campaignSales.reduce((sum, s) => sum + Number(s.valor_recebido ?? 0), 0);
    const investido = Number(c.valor_investido ?? 0);

    return {
      ...c,
      leads: leadsCount,
      vendas,
      faturamento,
      cpl: leadsCount > 0 ? investido / leadsCount : 0,
      cpa: vendas > 0 ? investido / vendas : 0,
      conversao: leadsCount > 0 ? (vendas / leadsCount) * 100 : 0,
      roas: investido > 0 ? faturamento / investido : 0,
      lucro: faturamento - investido,
      ticketMedio: vendas > 0 ? faturamento / vendas : 0,
    };
  });
}
