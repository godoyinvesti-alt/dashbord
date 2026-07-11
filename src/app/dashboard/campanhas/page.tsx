import type { Metadata } from "next";
import { Megaphone, Users, ShoppingCart, TrendingUp } from "lucide-react";

import { requireContext } from "@/lib/workspace";
import { listCampaignsWithMetrics } from "@/lib/data/campaigns";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { CampaignFormDialog, NewCampaignTrigger } from "@/components/campaigns/campaign-form-dialog";
import { CampaignsTable } from "@/components/campaigns/campaigns-table";
import { formatBRL, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Campanhas" };

export default async function CampaignsPage() {
  const ctx = await requireContext();
  const campaigns = await listCampaignsWithMetrics(ctx.workspace.id);

  const totalInvestido = campaigns.reduce((sum, c) => sum + Number(c.valor_investido), 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + c.leads, 0);
  const totalVendas = campaigns.reduce((sum, c) => sum + c.vendas, 0);
  const totalFaturamento = campaigns.reduce((sum, c) => sum + c.faturamento, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campanhas"
        description="Acompanhe o investimento e o retorno de cada campanha de tráfego"
        actions={<CampaignFormDialog trigger={<NewCampaignTrigger />} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Investimento total" value={formatBRL(totalInvestido)} icon={Megaphone} invertTrendColor />
        <StatCard label="Leads gerados" value={formatNumber(totalLeads)} icon={Users} />
        <StatCard label="Vendas geradas" value={formatNumber(totalVendas)} icon={ShoppingCart} />
        <StatCard label="Faturamento gerado" value={formatBRL(totalFaturamento)} icon={TrendingUp} tone="success" />
      </div>

      <CampaignsTable campaigns={campaigns} />
    </div>
  );
}
