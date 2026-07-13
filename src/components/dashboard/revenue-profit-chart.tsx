"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartCard } from "@/components/charts/chart-card";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { formatBRL, formatDate } from "@/lib/format";

export function RevenueProfitChart({
  data,
}: {
  data: { data: string; faturamento: number; lucro: number }[];
}) {
  return (
    <ChartCard title="Faturamento e lucro" description="Evolução diária no período selecionado">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="fillFaturamento" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillLucro" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            tickFormatter={(v) => formatBRL(v).replace("R$", "").trim()}
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
            className="fill-muted-foreground"
          />
          <Tooltip content={<ChartTooltip formatter={(value) => formatBRL(value)} />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="faturamento"
            name="Faturamento"
            stroke="var(--chart-1)"
            fill="url(#fillFaturamento)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="lucro"
            name="Lucro"
            stroke="var(--chart-2)"
            fill="url(#fillLucro)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
