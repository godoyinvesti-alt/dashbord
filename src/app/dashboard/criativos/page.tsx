import type { Metadata } from "next";

import { requireContext } from "@/lib/workspace";
import { listCreativesWithMetrics } from "@/lib/data/creatives";
import { getCampaigns } from "@/lib/data/lookups";

import { PageHeader } from "@/components/dashboard/page-header";
import { CreativeFormDialog, NewCreativeTrigger } from "@/components/campaigns/creative-form-dialog";
import { CreativesRanking } from "@/components/campaigns/creatives-ranking";

export const metadata: Metadata = { title: "Criativos" };

export default async function CreativesPage() {
  const ctx = await requireContext();
  const [creatives, campaigns] = await Promise.all([
    listCreativesWithMetrics(ctx.workspace.id),
    getCampaigns(ctx.workspace.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Criativos"
        description="Compare o desempenho dos criativos usados em suas campanhas"
        actions={<CreativeFormDialog trigger={<NewCreativeTrigger />} campaigns={campaigns} />}
      />
      <CreativesRanking creatives={creatives} campaigns={campaigns} />
    </div>
  );
}
