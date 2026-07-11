import type { Metadata } from "next";

import { requireContext } from "@/lib/workspace";
import { getFollowUpCenterData, getOpportunityTotals } from "@/lib/data/follow-up-center";

import { PageHeader } from "@/components/dashboard/page-header";
import { FollowUpCenter } from "@/components/follow-ups/follow-up-center";

export const metadata: Metadata = { title: "Follow-ups" };

export default async function FollowUpsPage() {
  const ctx = await requireContext();
  const [data, opportunity] = await Promise.all([
    getFollowUpCenterData(ctx.workspace.id),
    getOpportunityTotals(ctx.workspace.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-ups"
        description="Central de acompanhamento de leads e oportunidades em aberto"
      />
      <FollowUpCenter {...data} valorPotencial={opportunity.total} />
    </div>
  );
}
