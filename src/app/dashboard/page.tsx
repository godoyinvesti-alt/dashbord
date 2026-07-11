import { Suspense } from "react";
import type { Metadata } from "next";

import { requireContext } from "@/lib/workspace";
import { resolvePeriodo } from "@/lib/date-range";
import { getOverviewComparison, getSeriePorDia } from "@/lib/data/overview";
import { getMetaMensalAtual } from "@/lib/data/goals";
import { getInsights } from "@/lib/data/insights";
import { generateSystemNotifications } from "@/lib/notifications/generate";

import { PageHeader } from "@/components/dashboard/page-header";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { StatGrid } from "@/components/overview/stat-grid";
import { GoalCard } from "@/components/overview/goal-card";
import { InsightsBox } from "@/components/overview/insights-box";
import { RevenueChart } from "@/components/overview/revenue-chart";
import { LeadsSalesChart } from "@/components/overview/leads-sales-chart";
import { CardsSkeleton } from "@/components/dashboard/loading";

export const metadata: Metadata = { title: "Visão Geral" };

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const ctx = await requireContext();
  const periodo = resolvePeriodo(params.periodo, params.de, params.ate);

  const [{ atual, anterior }, serie, metaCtx] = await Promise.all([
    getOverviewComparison(ctx.workspace.id, periodo),
    getSeriePorDia(ctx.workspace.id, periodo.from, periodo.to),
    getMetaMensalAtual(ctx.workspace.id, ctx.workspace.meta_faturamento_mensal),
    generateSystemNotifications(ctx.workspace.id),
  ]);

  const insights = await getInsights(
    ctx.workspace.id,
    metaCtx.resultado.valorRestante
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão Geral"
        description={`Resumo da sua operação — ${periodo.label.toLowerCase()}`}
        actions={<DateRangeFilter />}
      />

      <GoalCard ctx={metaCtx} />

      <Suspense fallback={<CardsSkeleton count={8} />}>
        <StatGrid atual={atual} anterior={anterior} />
      </Suspense>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart serie={serie} />
        </div>
        <InsightsBox insights={insights} />
      </div>

      <LeadsSalesChart serie={serie} />
    </div>
  );
}
