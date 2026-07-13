import { getDashboardData } from "@/lib/data/dashboard";
import { listAlerts } from "@/lib/data/alerts";
import { PageHeader } from "@/components/dashboard/page-header";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { DashboardStatGrid } from "@/components/dashboard/dashboard-stat-grid";
import { AttentionSection } from "@/components/dashboard/attention-section";
import { RevenueProfitChart } from "@/components/dashboard/revenue-profit-chart";
import { SalesPerDayChart } from "@/components/dashboard/sales-per-day-chart";
import { SalesPerChipChart } from "@/components/dashboard/sales-per-chip-chart";
import { ChipStatusBreakdown } from "@/components/dashboard/chip-status-breakdown";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; de?: string; ate?: string }>;
}) {
  const params = await searchParams;
  const [{ metrics, charts }, { alerts }] = await Promise.all([
    getDashboardData(params.periodo, params.de, params.ate),
    listAlerts(),
  ]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral da operação em tempo real."
        actions={<DateRangeFilter />}
      />

      <div className="space-y-4">
        <DashboardStatGrid metrics={metrics} />

        <AttentionSection alerts={alerts} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueProfitChart data={charts.faturamentoLucroPorDia} />
          </div>
          <ChipStatusBreakdown data={charts.statusChips} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SalesPerDayChart data={charts.vendasPorDia} />
          <SalesPerChipChart data={charts.vendasPorChip} />
        </div>
      </div>
    </div>
  );
}
