"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartCard } from "@/components/charts/chart-card";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { formatDate, formatNumber } from "@/lib/format";

export function SalesPerDayChart({ data }: { data: { data: string; vendas: number }[] }) {
  return (
    <ChartCard title="Vendas por dia" description="Quantidade de vendas no período selecionado">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="data"
            tickFormatter={(v) => formatDate(v).slice(0, 5)}
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            className="fill-muted-foreground"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={32}
            className="fill-muted-foreground"
          />
          <Tooltip content={<ChartTooltip formatter={(value) => formatNumber(value)} />} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="vendas" name="Vendas" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
