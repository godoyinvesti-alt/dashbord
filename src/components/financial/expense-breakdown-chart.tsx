"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { ChartCard } from "@/components/charts/chart-card";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { formatBRL } from "@/lib/format";
import type { FinancialSummary } from "@/lib/data/financial";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)"];

export function ExpenseBreakdownChart({ summary }: { summary: FinancialSummary }) {
  const data = [
    { name: "Tráfego pago", value: summary.advertisingExpenses },
    { name: "Ferramentas", value: summary.toolExpenses },
    { name: "Comissões", value: summary.teamCommissions },
    { name: "Taxas de pagamento", value: summary.paymentFees },
    { name: "Reembolsos", value: summary.refunds },
    { name: "Outros", value: summary.otherExpenses },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <ChartCard title="Despesas por categoria" description="Distribuição das despesas no período">
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Nenhuma despesa registrada neste período.
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Despesas por categoria" description="Distribuição das despesas no período">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip formatter={(v) => formatBRL(v)} />} />
          <Legend
            iconType="circle"
            iconSize={8}
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
