import type { Metadata } from "next";

import { requireContext } from "@/lib/workspace";
import { getChipDashboardStats } from "@/lib/data/chips";
import { getAgents } from "@/lib/data/lookups";

import { PageHeader } from "@/components/dashboard/page-header";
import { ChipDashboardCards } from "@/components/chips/chip-dashboard-cards";
import { ChipAttentionSection } from "@/components/chips/chip-attention-section";
import { ChipsExplorer } from "@/components/chips/chips-explorer";
import { ChipFormDialog, NewChipTrigger } from "@/components/chips/chip-form-dialog";

export const metadata: Metadata = { title: "Chips e Números" };

export default async function ChipsPage() {
  const ctx = await requireContext();
  const [stats, agents] = await Promise.all([
    getChipDashboardStats(ctx.workspace.id),
    getAgents(ctx.workspace.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chips e Números"
        description="Monitore chips, recargas e incidentes para manter sua operação sempre ativa"
        actions={<ChipFormDialog trigger={<NewChipTrigger />} agents={agents} />}
      />

      <ChipDashboardCards stats={stats} />

      <ChipAttentionSection chips={stats.precisamAtencao} />

      <ChipsExplorer chips={stats.chips} agents={agents} />
    </div>
  );
}
