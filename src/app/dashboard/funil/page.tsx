import type { Metadata } from "next";

import { requireContext } from "@/lib/workspace";
import { getFunnelMetrics } from "@/lib/data/funnel";
import { getFunnelStages } from "@/lib/data/lookups";
import { getLeadsKanban } from "@/lib/data/leads";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FunnelChart } from "@/components/funnel/funnel-chart";
import { KanbanBoard } from "@/components/funnel/kanban-board";
import { StageManagerDialog } from "@/components/funnel/stage-manager";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatBRL, formatNumber, formatPercent } from "@/lib/format";
import { Filter, Users, DollarSign, TrendingDown } from "lucide-react";

export const metadata: Metadata = { title: "Funil de Vendas" };

export default async function FunnelPage() {
  const ctx = await requireContext();
  const [metrics, stages, kanbanLeads] = await Promise.all([
    getFunnelMetrics(ctx.workspace.id),
    getFunnelStages(ctx.workspace.id),
    getLeadsKanban(ctx.workspace.id),
  ]);

  const totalLeads = metrics[0]?.leadsAcumulados ?? 0;
  const totalVendas = metrics.find((m) => m.stage.nome.toLowerCase().includes("pagamento confirmado"))?.leadsAcumulados
    ?? metrics[metrics.length - 1]?.leadsAcumulados
    ?? 0;
  const conversaoGeral = totalLeads > 0 ? (totalVendas / totalLeads) * 100 : 0;
  const valorTotalFunil = metrics.reduce((sum, m) => sum + m.valorNaEtapa, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Funil de Vendas"
        description="Acompanhe a jornada dos leads em cada etapa do processo de vendas"
        actions={<StageManagerDialog stages={stages} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Leads no funil" value={formatNumber(totalLeads)} icon={Users} />
        <StatCard label="Conversão geral" value={formatPercent(conversaoGeral)} icon={TrendingDown} />
        <StatCard label="Valor total em aberto" value={formatBRL(valorTotalFunil)} icon={DollarSign} tone="success" />
      </div>

      {stages.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="Nenhuma etapa configurada"
          description="Configure as etapas do seu funil para começar a acompanhar os leads."
        />
      ) : (
        <Tabs defaultValue="funil">
          <TabsList>
            <TabsTrigger value="funil">Visão do funil</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
          </TabsList>
          <TabsContent value="funil" className="pt-4">
            <FunnelChart metrics={metrics} />
          </TabsContent>
          <TabsContent value="kanban" className="pt-4">
            <KanbanBoard stages={stages} initialLeads={kanbanLeads} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
