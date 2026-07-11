"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { ChartCard } from "@/components/charts/chart-card";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { formatNumber } from "@/lib/format";
import type { SerieDia } from "@/lib/data/overview";

export function LeadsSalesChart({ serie }: { serie: SerieDia[] }) {
  const data = serie.map((d) => ({
    ...d,
    label: format(new Date(`${d.data}T12:00:00`), "dd/MM", { locale: ptBR }),
  }));

  return (
    <ChartCard title="Leads vs. Vendas" description="Comparativo diário de leads recebidos e vendas fechadas">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            minTickGap={24}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={32}
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <Tooltip content={<ChartTooltip formatter={(v) => formatNumber(v)} />} cursor={{ fill: "var(--muted)" }} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
          />
          <Bar dataKey="leads" name="Leads" fill="var(--chart-1)" radius={[3, 3, 0, 0]} maxBarSize={18} />
          <Bar dataKey="vendas" name="Vendas" fill="var(--chart-2)" radius={[3, 3, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
